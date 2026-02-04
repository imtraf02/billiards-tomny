import { format } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
	CreateCategoryInput,
	CreateInventoryLogInput,
	CreateProductInput,
	GetInventoryAnalysisQuery,
	GetInventoryLogsQuery,
	InventoryAnalysisResponse,
	InventoryAnalysisTrend,
	InventoryProductAnalysis,
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
						costSnapshot: data.cost,
						priceSnapshot: 0,
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

	static async getAllProducts() {
		return await prisma.product.findMany({
			orderBy: { name: "asc" },
			include: { category: true },
		});
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
				select: { currentStock: true, cost: true },
			});

			if (!currentProduct) {
				throw new Error("Sản phẩm không tồn tại");
			}

			const product = await tx.product.update({
				where: { id },
				data,
			});

			// Only log if currentStock has changed or was explicitly provided in data
			if (
				data.currentStock !== undefined &&
				data.currentStock !== currentProduct.currentStock
			) {
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
						costSnapshot: data.cost ?? currentProduct.cost, // use updated cost if available, else current cost
						priceSnapshot: 0,
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
			const currentCost = product.cost || 0;
			const quantityChange =
				data.type === "IN" ? data.quantity : -data.quantity;
			const stockAfter = stockBefore + quantityChange;

			if (stockAfter < 0) {
				throw new Error("Số lượng xuất vượt quá tồn kho hiện tại");
			}

			// Calculate new cost using Weighted Average for IN transactions
			let newCost = currentCost;
			if (
				data.type === "IN" &&
				data.costSnapshot !== undefined &&
				data.costSnapshot >= 0
			) {
				if (stockBefore > 0) {
					const totalValue =
						stockBefore * currentCost + data.quantity * data.costSnapshot;
					newCost = Math.round(totalValue / stockAfter);
				} else {
					// If stock was 0 or negative, reset cost to new import price
					newCost = data.costSnapshot;
				}
			}

			// Update product stock and cost
			await tx.product.update({
				where: { id: data.productId },
				data: {
					currentStock: stockAfter,
					// Update cost if importing with unit cost
					...(data.type === "IN" && data.costSnapshot !== undefined
						? { cost: data.costSnapshot }
						: { cost: newCost }),
				},
			});

			// Create inventory log
			return await tx.inventoryLog.create({
				data: {
					productId: data.productId,
					userId,
					type: data.type,
					quantity: data.quantity,
					// For IN: use input costSnapshot (Transaction Price)
					// For OUT: use currentCost (Cost Basis / COGS)
					costSnapshot:
						data.type === "IN" ? (data.costSnapshot ?? 0) : currentCost,
					priceSnapshot: data.priceSnapshot ?? 0,
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

		if (query.startDate || query.endDate) {
			where.createdAt = {
				gte: query.startDate,
				lte: query.endDate,
			};
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

	static async getInventoryAnalysis(
		query: GetInventoryAnalysisQuery,
	): Promise<InventoryAnalysisResponse> {
		const where: Prisma.InventoryLogWhereInput = {};

		if (query.productId) {
			where.productId = query.productId;
		}

		if (query.startDate || query.endDate) {
			where.createdAt = {
				gte: query.startDate ? new Date(query.startDate) : undefined,
				lte: query.endDate ? new Date(query.endDate) : undefined,
			};
		}

		const logs = await prisma.inventoryLog.findMany({
			where,
			orderBy: {
				createdAt: "asc",
			},
		});

		const summary = {
			totalIncome: 0,
			totalExpenditure: 0,
			totalCOGS: 0,
			netProfit: 0,
			totalInQuantity: 0,
			totalOutQuantity: 0,
		};

		const trendsMap = new Map<string, InventoryAnalysisTrend>();
		const productsMap = new Map<string, InventoryProductAnalysis>();

		// Pre-fetch all products to get their names and units efficiently
		const allProducts = await prisma.product.findMany({
			select: { id: true, name: true, unit: true, currentStock: true },
		});
		const productInfoMap = new Map(allProducts.map((p) => [p.id, p]));

		for (const log of logs) {
			const logDate = format(log.createdAt, "yyyy-MM-dd");
			let trend = trendsMap.get(logDate);
			if (!trend) {
				trend = {
					date: logDate,
					income: 0,
					expenditure: 0,
					cogs: 0,
					profit: 0,
				};
				trendsMap.set(logDate, trend);
			}

			let productStats = productsMap.get(log.productId);
			if (!productStats) {
				const info = productInfoMap.get(log.productId);
				productStats = {
					productId: log.productId,
					productName: info?.name || "Sản phẩm đã xóa",
					currentStock: info?.currentStock || 0,
					unit: info?.unit || "",
					income: 0,
					expenditure: 0,
					cogs: 0,
					profit: 0,
					soldQuantity: 0,
					importedQuantity: 0,
				};
				productsMap.set(log.productId, productStats);
			}

			const quantity = log.quantity;
			const cost = log.costSnapshot || 0;
			const price = log.priceSnapshot || 0;

			if (log.type === "IN") {
				const exp = quantity * cost;
				summary.totalExpenditure += exp;
				summary.totalInQuantity += quantity;
				trend.expenditure += exp;
				productStats.expenditure += exp;
				productStats.importedQuantity += quantity;
			} else if (log.type === "OUT") {
				const income = quantity * price;
				const cogs = quantity * cost;
				summary.totalIncome += income;
				summary.totalCOGS += cogs;
				summary.totalOutQuantity += quantity;
				trend.income += income;
				trend.cogs += cogs;
				productStats.income += income;
				productStats.cogs += cogs;
				productStats.soldQuantity += quantity;
			}
		}

		summary.netProfit = summary.totalIncome - summary.totalCOGS;

		const trends = Array.from(trendsMap.values()).map((t) => ({
			...t,
			profit: t.income - t.cogs,
		}));

		const productAnalysis = Array.from(productsMap.values()).map((p) => ({
			...p,
			profit: p.income - p.cogs,
		}));

		// Sort products by income (revenue) descending by default
		productAnalysis.sort((a, b) => b.income - a.income);

		return {
			summary,
			trends,
			products: productAnalysis,
		};
	}
}
