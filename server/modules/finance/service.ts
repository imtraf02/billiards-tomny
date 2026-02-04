import { endOfDay, format, startOfDay } from "date-fns";
import prisma from "@/lib/db";
import type {
	ExpenseBreakdown,
	FinanceAnalyticsResponse,
	FinanceTrend,
	GetFinanceAnalyticsQuery,
	RevenueBreakdown,
	TransactionDetail,
} from "@/shared/schemas/finance";

export class FinanceService {
	static async getAnalytics(
		query: GetFinanceAnalyticsQuery,
	): Promise<FinanceAnalyticsResponse> {
		const startDate = startOfDay(new Date(query.startDate));
		const endDate = endOfDay(new Date(query.endDate));

		// Fetch all relevant data in parallel
		const [completedBookings, transactions, inventoryLogs, products] =
			await Promise.all([
				// Get completed bookings for table revenue
				prisma.booking.findMany({
					where: {
						status: "COMPLETED",
						endTime: {
							gte: startDate,
							lte: endDate,
						},
					},
					include: {
						bookingTables: true,
						orders: {
							include: {
								orderItems: {
									include: {
										product: true,
									},
								},
							},
						},
					},
				}),
				// Get all transactions
				prisma.transaction.findMany({
					where: {
						createdAt: {
							gte: startDate,
							lte: endDate,
						},
					},
					include: {
						user: {
							select: {
								id: true,
								name: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				}),
				// Get inventory logs for import/export analysis
				prisma.inventoryLog.findMany({
					where: {
						createdAt: {
							gte: startDate,
							lte: endDate,
						},
					},
					include: {
						product: true,
					},
				}),
				// Get all products with current stock
				prisma.product.findMany({
					select: {
						id: true,
						name: true,
						unit: true,
						currentStock: true,
					},
				}),
			]);

		// Calculate revenue breakdown
		const revenue = FinanceService.calculateRevenueBreakdown(
			completedBookings,
			transactions,
		);

		// Calculate expense breakdown
		const expense = FinanceService.calculateExpenseBreakdown(transactions);

		// Calculate summary
		const summary = {
			totalRevenue: revenue.total,
			totalExpense: expense.total,
			netProfit: revenue.total - expense.total,
		};

		// Generate trends (daily aggregation)
		const trends = FinanceService.generateTrends(
			completedBookings,
			transactions,
			startDate,
			endDate,
		);

		// Format transaction details
		const transactionDetails =
			FinanceService.formatTransactionDetails(transactions);

		// Calculate product analysis
		const productAnalysis = FinanceService.calculateProductAnalysis(
			completedBookings,
			inventoryLogs,
			products,
		);

		return {
			summary,
			revenue,
			expense,
			trends,
			transactions: transactionDetails,
			products: productAnalysis,
		};
	}

	private static calculateRevenueBreakdown(
		completedBookings: Array<{
			bookingTables: Array<{
				startTime: Date;
				endTime: Date | null;
				priceSnapshot: number;
			}>;
			orders: Array<{
				status: string;
				orderItems: Array<{
					priceSnapshot: number;
					quantity: number;
				}>;
			}>;
		}>,
		transactions: Array<{ type: string; amount: number }>,
	): RevenueBreakdown {
		// Table revenue from completed bookings
		let tableRevenue = 0;
		let productRevenue = 0;

		for (const booking of completedBookings) {
			// Calculate table revenue
			for (const bt of booking.bookingTables) {
				if (bt.endTime) {
					const startMs = bt.startTime.getTime();
					const endMs = bt.endTime.getTime();
					const durationHours = (endMs - startMs) / (1000 * 60 * 60);
					tableRevenue +=
						Math.ceil((durationHours * bt.priceSnapshot) / 1000) * 1000;
				}
			}

			// Calculate product revenue from orders
			for (const order of booking.orders) {
				if (order.status !== "CANCELLED") {
					for (const item of order.orderItems) {
						productRevenue += item.priceSnapshot * item.quantity;
					}
				}
			}
		}

		// Other revenue from manual REVENUE transactions
		const otherRevenue = transactions
			.filter((t) => t.type === "REVENUE")
			.reduce((sum, t) => sum + t.amount, 0);

		return {
			tableRevenue,
			productRevenue,
			otherRevenue,
			total: tableRevenue + productRevenue + otherRevenue,
		};
	}

	private static calculateExpenseBreakdown(
		transactions: Array<{
			type: string;
			amount: number;
			description: string | null;
		}>,
	): ExpenseBreakdown {
		let purchaseExpense = 0;
		let utilities = 0;
		let salaries = 0;
		let otherExpense = 0;

		for (const transaction of transactions) {
			if (transaction.type === "PURCHASE") {
				purchaseExpense += transaction.amount;
			} else if (transaction.type === "EXPENSE") {
				const desc = (transaction.description || "").toLowerCase();

				// Categorize based on description keywords
				if (
					desc.includes("điện") ||
					desc.includes("nước") ||
					desc.includes("electric") ||
					desc.includes("water") ||
					desc.includes("utility")
				) {
					utilities += transaction.amount;
				} else if (
					desc.includes("lương") ||
					desc.includes("salary") ||
					desc.includes("wage") ||
					desc.includes("nhân viên")
				) {
					salaries += transaction.amount;
				} else {
					otherExpense += transaction.amount;
				}
			}
		}

		return {
			purchaseExpense,
			utilities,
			salaries,
			otherExpense,
			total: purchaseExpense + utilities + salaries + otherExpense,
		};
	}

	private static generateTrends(
		completedBookings: Array<{
			endTime: Date | null;
			totalAmount: number;
		}>,
		transactions: Array<{
			type: string;
			amount: number;
			createdAt: Date;
		}>,
		startDate: Date,
		endDate: Date,
	): FinanceTrend[] {
		const trendsMap = new Map<string, { revenue: number; expense: number }>();

		// Initialize all dates
		const currentDate = new Date(startDate);
		while (currentDate <= endDate) {
			const dateKey = format(currentDate, "yyyy-MM-dd");
			trendsMap.set(dateKey, { revenue: 0, expense: 0 });
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Aggregate booking revenue by completion date
		for (const booking of completedBookings) {
			if (booking.endTime) {
				const dateKey = format(booking.endTime, "yyyy-MM-dd");
				const trend = trendsMap.get(dateKey);
				if (trend) {
					trend.revenue += booking.totalAmount;
				}
			}
		}

		// Aggregate transaction revenue/expense by created date
		for (const transaction of transactions) {
			const dateKey = format(transaction.createdAt, "yyyy-MM-dd");
			const trend = trendsMap.get(dateKey);
			if (trend) {
				if (transaction.type === "REVENUE") {
					trend.revenue += transaction.amount;
				} else if (
					transaction.type === "EXPENSE" ||
					transaction.type === "PURCHASE"
				) {
					trend.expense += transaction.amount;
				}
			}
		}

		// Convert map to array and calculate profit
		return Array.from(trendsMap.entries())
			.map(([date, data]) => ({
				date,
				revenue: data.revenue,
				expense: data.expense,
				profit: data.revenue - data.expense,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	private static formatTransactionDetails(
		transactions: Array<{
			id: string;
			type: string;
			amount: number;
			description: string | null;
			paymentMethod: string;
			createdAt: Date;
			user: { id: string; name: string };
		}>,
	): TransactionDetail[] {
		return transactions.map((t) => {
			let category = "Khác";

			if (t.type === "PURCHASE") {
				category = "Nhập hàng";
			} else if (t.type === "REVENUE") {
				category = "Thu nhập khác";
			} else if (t.type === "EXPENSE") {
				const desc = (t.description || "").toLowerCase();
				if (
					desc.includes("điện") ||
					desc.includes("nước") ||
					desc.includes("electric") ||
					desc.includes("water")
				) {
					category = "Điện nước";
				} else if (
					desc.includes("lương") ||
					desc.includes("salary") ||
					desc.includes("nhân viên")
				) {
					category = "Lương nhân viên";
				} else {
					category = "Chi phí khác";
				}
			}

			return {
				id: t.id,
				type: t.type,
				amount: t.amount,
				description: t.description,
				paymentMethod: t.paymentMethod,
				createdAt: t.createdAt,
				category,
				user: t.user,
			};
		});
	}

	private static calculateProductAnalysis(
		completedBookings: Array<{
			orders: Array<{
				status: string;
				orderItems: Array<{
					product: {
						id: string;
						name: string;
						unit: string;
						currentStock: number;
					};
					quantity: number;
					priceSnapshot: number;
					costSnapshot: number | null;
				}>;
			}>;
		}>,
		inventoryLogs: Array<{
			productId: string;
			type: string;
			quantity: number;
			product: {
				id: string;
				name: string;
				unit: string;
			};
		}>,
		products: Array<{
			id: string;
			name: string;
			unit: string;
			currentStock: number;
		}>,
	) {
		const productMap = new Map<
			string,
			{
				productId: string;
				productName: string;
				unit: string;
				soldQuantity: number;
				importedQuantity: number;
				revenue: number;
				cost: number;
				profit: number;
				currentStock: number;
			}
		>();

		// Initialize all products
		for (const product of products) {
			productMap.set(product.id, {
				productId: product.id,
				productName: product.name,
				unit: product.unit,
				soldQuantity: 0,
				importedQuantity: 0,
				revenue: 0,
				cost: 0,
				profit: 0,
				currentStock: product.currentStock,
			});
		}

		// Process sales from bookings
		for (const booking of completedBookings) {
			for (const order of booking.orders) {
				if (order.status !== "CANCELLED") {
					for (const item of order.orderItems) {
						const productData = productMap.get(item.product.id);
						if (productData) {
							productData.soldQuantity += item.quantity;
							productData.revenue += item.priceSnapshot * item.quantity;
							productData.cost += (item.costSnapshot || 0) * item.quantity;
							productData.profit = productData.revenue - productData.cost;
						} else {
							// Product not in map, add it
							productMap.set(item.product.id, {
								productId: item.product.id,
								productName: item.product.name,
								unit: item.product.unit,
								soldQuantity: item.quantity,
								importedQuantity: 0,
								revenue: item.priceSnapshot * item.quantity,
								cost: (item.costSnapshot || 0) * item.quantity,
								profit:
									item.priceSnapshot * item.quantity -
									(item.costSnapshot || 0) * item.quantity,
								currentStock: item.product.currentStock,
							});
						}
					}
				}
			}
		}

		// Process inventory imports
		for (const log of inventoryLogs) {
			if (log.type === "IN") {
				const productData = productMap.get(log.productId);
				if (productData) {
					productData.importedQuantity += Math.abs(log.quantity);
				} else {
					// Product not in map, add it
					productMap.set(log.productId, {
						productId: log.product.id,
						productName: log.product.name,
						unit: log.product.unit,
						soldQuantity: 0,
						importedQuantity: Math.abs(log.quantity),
						revenue: 0,
						cost: 0,
						profit: 0,
						currentStock: 0,
					});
				}
			}
		}

		// Convert to array and sort by revenue (descending)
		return Array.from(productMap.values())
			.filter((p) => p.soldQuantity > 0 || p.importedQuantity > 0)
			.sort((a, b) => b.revenue - a.revenue);
	}
}
