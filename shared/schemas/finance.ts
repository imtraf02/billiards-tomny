import { z } from "zod";

export const getFinanceAnalyticsQuerySchema = z.object({
	startDate: z.string(),
	endDate: z.string(),
});

export type GetFinanceAnalyticsQuery = z.infer<
	typeof getFinanceAnalyticsQuerySchema
>;

// Response types (not validated, just for TypeScript)
export interface RevenueBreakdown {
	tableRevenue: number; // From completed bookings
	productRevenue: number; // From product sales in orders
	otherRevenue: number; // From manual REVENUE transactions
	total: number;
}

export interface ExpenseBreakdown {
	purchaseExpense: number; // From inventory purchases (PURCHASE type)
	utilities: number; // From EXPENSE transactions with utility keywords
	salaries: number; // From EXPENSE transactions with salary keywords
	otherExpense: number; // Other EXPENSE transactions
	total: number;
}

export interface FinanceTrend {
	date: string; // ISO date string
	revenue: number;
	expense: number;
	profit: number;
}

export interface TransactionDetail {
	id: string;
	type: string;
	amount: number;
	description: string | null;
	paymentMethod: string;
	createdAt: Date;
	category: string; // Computed category for display
	user: {
		id: string;
		name: string;
	};
}

export interface ProductAnalysis {
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

export interface FinanceAnalyticsResponse {
	summary: {
		totalRevenue: number;
		totalExpense: number;
		netProfit: number;
	};
	revenue: RevenueBreakdown;
	expense: ExpenseBreakdown;
	trends: FinanceTrend[];
	transactions: TransactionDetail[];
	products: ProductAnalysis[]; // Product sales analysis
}
