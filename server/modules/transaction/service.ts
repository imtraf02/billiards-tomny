import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
	CreateTransactionInput,
	GetRevenueStatsInput,
	GetTransactionsQuery,
} from "@/shared/schemas/transaction";

export class TransactionService {
	// 1. Create Transaction (Used manually or by other services)
	static async create(data: CreateTransactionInput, userId: string) {
		return await prisma.transaction.create({
			data: {
				...data,
				userId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
					},
				},
				booking: true,
				order: true,
			},
		});
	}

	// 2. Get Transactions (List with pagination & filters)
	static async getTransactions(query: GetTransactionsQuery) {
		const page = query.page || 1;
		const limit = query.limit || 10;
		const skip = (page - 1) * limit;

		const where: Prisma.TransactionWhereInput = {};

		if (query.type) where.type = query.type;
		if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
		if (query.startDate) where.createdAt = { gte: query.startDate };
		if (query.endDate)
			where.createdAt = { ...where.createdAt, lte: query.endDate };
		if (query.minAmount) where.amount = { gte: query.minAmount };
		if (query.maxAmount)
			where.amount = { ...where.amount, lte: query.maxAmount };

		const [data, total] = await Promise.all([
			prisma.transaction.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					user: {
						select: {
							id: true,
							name: true,
						},
					},
					booking: {
						select: {
							id: true,
							startTime: true,
							endTime: true,
						},
					},
					order: {
						select: {
							id: true,
							status: true,
						},
					},
				},
			}),
			prisma.transaction.count({ where }),
		]);

		return {
			data,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	// 3. Get Revenue Stats (For Dashboard/Reports)
	static async getRevenueStats(input: GetRevenueStatsInput) {
		// This is a simplified implementation. Valid stats require complex grouping logic usually done with raw SQL or multiple queries.
		// For now, let's return a simple aggregate.
		// TODO: Implement groupBy logic if needed for charts.

		const transactions = await prisma.transaction.findMany({
			where: {
				createdAt: {
					gte: input.startDate,
					lte: input.endDate,
				},
				type: "REVENUE", // Or other revenue types
			},
		});

		const totalRevenue = transactions.reduce(
			(sum: number, t: { amount: number }) => sum + t.amount,
			0,
		);

		return {
			totalRevenue,
			count: transactions.length,
		};
	}
}
