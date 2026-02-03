import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
	CreateCategoryInput,
	CreateInventoryLogInput,
	CreateProductInput,
	GetInventoryLogsQuery,
	GetProductsQuery,
	UpdateCategoryInput,
	UpdateProductInput,
} from "@/shared/schemas/product";

export abstract class ProductService {
	// Category Methods
	static async createCategory(data: CreateCategoryInput) {
		return await prisma.category.create({
			data,
		});
	}

	static async getAllCategories() {
		return await prisma.category.findMany({
			orderBy: {
				name: "asc",
			},
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

	// Product Methods
	static async createProduct(data: CreateProductInput, userId: string) {
		return await prisma.$transaction(async (tx) => {
			const product = await tx.product.create({
				data,
			});

			// If initial stock is specified, create an inventory log
			if (data.currentStock > 0) {
				await tx.inventoryLog.create({
					data: {
						productId: product.id,
						userId,
						type: "IN",
						quantity: data.currentStock,
						unitCost: data.cost,
						reason: "initial",
						note: "Khởi tạo tồn kho ban đầu",
						stockBefore: 0,
						stockAfter: data.currentStock,
					},
				});
			}

			return product;
		});
	}

	static async getAllProducts(query: GetProductsQuery) {
		const where: Prisma.ProductWhereInput = {};

		if (query.categoryId) {
			where.categoryId = query.categoryId;
		}

		if (query.search) {
			where.name = {
				contains: query.search,
				mode: "insensitive",
			};
		}

		if (query.isAvailable !== undefined) {
			where.isAvailable = query.isAvailable;
		}

		const skip = (query.page - 1) * query.limit;

		const [products, total] = await Promise.all([
			prisma.product.findMany({
				where,
				orderBy: {
					name: "asc",
				},
				include: {
					category: true,
				},
				skip,
				take: query.limit,
			}),
			prisma.product.count({ where }),
		]);

		return {
			data: products,
			meta: {
				total,
				page: query.page,
				limit: query.limit,
				totalPages: Math.ceil(total / query.limit),
			},
		};
	}

	static async getProductById(id: string) {
		return await prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
			},
		});
	}

	static async updateProduct(
		id: string,
		data: UpdateProductInput,
		userId: string,
	) {
		return await prisma.$transaction(async (tx) => {
			// Get current state to compare stock change
			const currentProduct = await tx.product.findUnique({
				where: { id },
				select: { currentStock: true },
			});

			if (!currentProduct) {
				throw new Error("Sản phẩm không tồn tại");
			}

			const product = await tx.product.update({
				where: { id },
				data,
			});

			// Only log if currentStock has changed or was explicitly provided in data
			if (data.currentStock !== undefined && data.currentStock !== currentProduct.currentStock) {
				const stockBefore = currentProduct.currentStock;
				const stockAfter = data.currentStock;
				const quantity = Math.abs(stockAfter - stockBefore);
				const type = stockAfter > stockBefore ? "IN" : "OUT";

				await tx.inventoryLog.create({
					data: {
						productId: id,
						userId,
						type,
						quantity,
						unitCost: data.cost, // use updated cost if available
						reason: "adjustment",
						note: "Điều chỉnh tồn kho khi cập nhật sản phẩm",
						stockBefore,
						stockAfter,
					},
				});
			}

			return product;
		});
	}

	static async deleteProduct(id: string) {
		return await prisma.product.delete({
			where: { id },
		});
	}

	// Inventory Methods
	static async createInventoryLog(
		data: CreateInventoryLogInput,
		userId: string,
	) {
		return await prisma.$transaction(async (tx) => {
			// Get current product
			const product = await tx.product.findUnique({
				where: { id: data.productId },
			});

			if (!product) {
				throw new Error("Sản phẩm không tồn tại");
			}

			const stockBefore = product.currentStock;
			const quantityChange = data.type === "IN" ? data.quantity : -data.quantity;
			const stockAfter = stockBefore + quantityChange;

			if (stockAfter < 0) {
				throw new Error("Số lượng xuất vượt quá tồn kho hiện tại");
			}

			// Update product stock
			await tx.product.update({
				where: { id: data.productId },
				data: {
					currentStock: stockAfter,
					// Update cost if importing with unit cost
					...(data.type === "IN" && data.unitCost !== undefined
						? { cost: data.unitCost }
						: {}),
				},
			});

			// Create inventory log
			return await tx.inventoryLog.create({
				data: {
					productId: data.productId,
					userId,
					type: data.type,
					quantity: data.quantity,
					unitCost: data.unitCost,
					reason: data.reason,
					note: data.note,
					stockBefore,
					stockAfter,
				},
				include: {
					product: true,
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		});
	}

	static async getInventoryLogs(query: GetInventoryLogsQuery) {
		const where: Prisma.InventoryLogWhereInput = {};

		if (query.productId) {
			where.productId = query.productId;
		}

		if (query.type) {
			where.type = query.type;
		}

		const skip = (query.page - 1) * query.limit;

		const [logs, total] = await Promise.all([
			prisma.inventoryLog.findMany({
				where,
				orderBy: {
					createdAt: "desc",
				},
				include: {
					product: {
						select: {
							id: true,
							name: true,
							unit: true,
							price: true,
							cost: true,
						},
					},
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				skip,
				take: query.limit,
			}),
			prisma.inventoryLog.count({ where }),
		]);

		return {
			data: logs,
			meta: {
				total,
				page: query.page,
				limit: query.limit,
				totalPages: Math.ceil(total / query.limit),
			},
		};
	}

	static async getProductInventoryLogs(productId: string) {
		return await prisma.inventoryLog.findMany({
			where: { productId },
			orderBy: {
				createdAt: "desc",
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			take: 50,
		});
	}
}
