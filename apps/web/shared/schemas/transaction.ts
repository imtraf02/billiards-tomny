import { z } from "zod";

export const createTransactionSchema = z.object({
	type: z.enum(
		["PURCHASE", "SALE", "REFUND", "ADJUSTMENT", "EXPENSE", "REVENUE"],
		{ error: "Loại giao dịch không hợp lệ" },
	),
	amount: z.coerce.number().int().positive({ error: "Số tiền phải lớn hơn 0" }),
	paymentMethod: z
		.enum(["CASH", "CARD", "TRANSFER", "MOMO", "ZALOPAY"])
		.default("CASH"),
	description: z.string().max(500, { error: "Mô tả quá dài" }).optional(),
	bookingId: z.string().optional(),
	orderId: z.string().optional(),
});

export const getTransactionsQuerySchema = z.object({
	type: z
		.enum(["PURCHASE", "SALE", "REFUND", "ADJUSTMENT", "EXPENSE", "REVENUE"])
		.optional(),
	paymentMethod: z
		.enum(["CASH", "CARD", "TRANSFER", "MOMO", "ZALOPAY"])
		.optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	minAmount: z.coerce.number().optional(),
	maxAmount: z.coerce.number().optional(),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
});

export const getRevenueStatsSchema = z.object({
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export const getExpenseStatsSchema = z.object({
	startDate: z.coerce.date(),
	endDate: z.coerce.date(),
	groupBy: z.enum(["type", "month"]).default("type"),
});

export const getMonthlyReportSchema = z.object({
	year: z.coerce.number().int().min(2000).max(2100),
	month: z.coerce.number().int().min(1).max(12),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type GetTransactionsQuery = z.infer<typeof getTransactionsQuerySchema>;
export type GetRevenueStatsInput = z.infer<typeof getRevenueStatsSchema>;
export type GetExpenseStatsInput = z.infer<typeof getExpenseStatsSchema>;
export type GetMonthlyReportInput = z.infer<typeof getMonthlyReportSchema>;
