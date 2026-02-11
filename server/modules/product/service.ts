import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { AppError } from "@/server/utils/errors";
import type {
	CreateCategoryInput,
	CreateProductInput,
	ImportProductInput,
	InternalUseInput,
	SpoilageInput,
	UpdateCategoryInput,
	UpdateProductInput,
} from "@/shared/schemas/product";

export abstract class ProductService {
	// ==================== Category Methods ====================
	static async createCategory(data: CreateCategoryInput) {
		return await prisma.category.create({ data });
	}

	static async getAllCategories() {
		return await prisma.category.findMany({
			orderBy: { name: "asc" },
			include: {
				_count: {
					select: { products: true },
				},
			},
		});
	}

	static async updateCategory(id: string, data: UpdateCategoryInput) {
		return await prisma.category.update({
			where: { id },
			data,
		});
	}

	static async deleteCategory(id: string) {
		return await prisma.category.delete({
			where: { id },
		});
	}

	// ==================== Product Methods ====================
	static async createProduct(data: CreateProductInput) {
		return await prisma.product.create({
			data,
		});
	}

	static async getAllProducts() {
		return await prisma.product.findMany({
			orderBy: { name: "asc" },
			include: {
				category: true,
				batches: {
					where: { quantity: { gt: 0 } }, // Chỉ lấy lô còn hàng
					orderBy: { importedAt: "asc" },
				},
			},
		});
	}

	static async getProductById(id: string) {
		return await prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
				batches: {
					where: { quantity: { gt: 0 } }, // Chỉ lấy lô còn hàng
					orderBy: { importedAt: "asc" },
				},
			},
		});
	}

	static async updateProduct(id: string, data: UpdateProductInput) {
		const product = await prisma.product.findUnique({
			where: { id },
		});

		if (!product) {
			throw new AppError("Sản phẩm không tồn tại", 404);
		}

		if (data.name !== product.name) {
			const existingLog = await prisma.inventoryTransaction.findFirst({
				where: {
					productId: product.id,
				},
			});

			if (existingLog) {
				throw new AppError("Sản phẩm đã tồn tại trong lịch sử nhập hàng", 400);
			}

			const existingProduct = await prisma.product.findFirst({
				where: {
					name: data.name,
				},
			});

			if (existingProduct) {
				throw new AppError("Sản phẩm đã tồn tại", 409);
			}
		}

		return await prisma.product.update({
			where: { id },
			data,
			include: {
				category: true,
				batches: {
					where: { quantity: { gt: 0 } },
					orderBy: { importedAt: "asc" },
				},
			},
		});
	}

	static async deleteProduct(id: string) {
		return await prisma.product.delete({
			where: { id },
		});
	}

	// ==================== Inventory Methods ====================

	/**
	 * Nhập hàng (tạo lô mới)
	 */
	static async importProduct(
		{ productId, costPerUnit, quantity, note }: ImportProductInput,
		userId: string,
	) {
		return await prisma.$transaction(async (tx) => {
			// Tạo lô mới
			const batch = await tx.inventoryBatch.create({
				data: {
					productId,
					quantity,
					costPerUnit,
					userId,
				},
			});

			// Ghi log
			await tx.inventoryTransaction.create({
				data: {
					productId,
					type: "IMPORT",
					quantity,
					cost: costPerUnit,
					note: note || `Nhập ${quantity} với giá ${costPerUnit}đ/sp`,
					userId,
				},
			});

			return batch;
		});
	}

	/**
	 * Sử dụng nội bộ (nhân viên uống, test, ...)
	 */
	static async useProductInternal(
		{ productId, quantity, reason }: InternalUseInput,
		userId: string,
	) {
		return await prisma.$transaction(async (tx) => {
			const { totalCost, averageCost } = await ProductService._reduceStockFIFO(
				tx,
				productId,
				quantity,
			);

			// Ghi log
			await tx.inventoryTransaction.create({
				data: {
					productId,
					type: "INTERNAL",
					quantity: -quantity,
					cost: averageCost,
					note: reason,
					userId,
				},
			});

			return { quantity, totalCost, averageCost };
		});
	}

	/**
	 * Đánh dấu hư hỏng
	 */
	static async markProductSpoiled(
		{ productId, quantity, reason }: SpoilageInput,
		userId: string,
	) {
		return await prisma.$transaction(async (tx) => {
			// Xuất FIFO
			const { totalCost, averageCost } = await ProductService._reduceStockFIFO(
				tx,
				productId,
				quantity,
			);

			// Ghi log
			await tx.inventoryTransaction.create({
				data: {
					productId,
					type: "SPOILAGE",
					quantity: -quantity,
					cost: averageCost,
					note: reason,
					userId,
				},
			});

			return { quantity, totalCost, averageCost };
		});
	}

	/**
	 * Lấy giá vốn trung bình hiện tại (WAC)
	 */
	static async getWeightedAverageCost(productId: string) {
		const batches = await prisma.inventoryBatch.findMany({
			where: {
				productId,
				quantity: { gt: 0 },
			},
		});

		if (batches.length === 0) return 0;

		const totalValue = batches.reduce(
			(sum, b) => sum + b.quantity * b.costPerUnit,
			0,
		);
		const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);

		return Math.round(totalValue / totalQuantity);
	}

	/**
	 * Lấy danh sách lô hàng còn tồn
	 */
	static async getProductBatches(productId: string) {
		return await prisma.inventoryBatch.findMany({
			where: {
				productId,
				quantity: { gt: 0 },
			},
			orderBy: { importedAt: "asc" },
			include: {
				createdBy: {
					select: { id: true, name: true },
				},
			},
		});
	}

	// ==================== Private Helper Methods ====================

	/**
	 * Xuất kho theo FIFO (dùng nội bộ)
	 */
	private static async _reduceStockFIFO(
		tx: Prisma.TransactionClient,
		productId: string,
		quantityToReduce: number,
	) {
		// Lấy lô cũ nhất
		const batches = await tx.inventoryBatch.findMany({
			where: {
				productId,
				quantity: { gt: 0 },
			},
			orderBy: { importedAt: "asc" },
		});

		if (batches.length === 0) {
			throw new AppError("Không tìm thấy lô hàng", 404);
		}

		let remaining = quantityToReduce;
		let totalCost = 0;

		// Xuất từng lô
		for (const batch of batches) {
			if (remaining <= 0) break;

			const take = Math.min(remaining, batch.quantity);
			totalCost += take * batch.costPerUnit;

			// Trừ lô
			await tx.inventoryBatch.update({
				where: { id: batch.id },
				data: { quantity: { decrement: take } },
			});

			remaining -= take;
		}

		if (remaining > 0) {
			throw new AppError("Không đủ hàng trong các lô", 400);
		}

		const averageCost = Math.round(totalCost / quantityToReduce);

		return { totalCost, averageCost };
	}
}
