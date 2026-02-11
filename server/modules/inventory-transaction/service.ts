import prisma from "@/lib/db";
import { AppError } from "@/server/utils/errors";
import type { GetInventoryTransactionsInput } from "@/shared/schemas/inventory-transaction";
import type { CreateInventoryTransactionInput } from "@/shared/schemas/product";

export abstract class InventoryTransactionService {
	static async createInventoryTransaction(
		data: CreateInventoryTransactionInput,
		userId: string,
	) {
		return await prisma.$transaction(async (tx) => {
			const product = await tx.product.findUnique({
				where: { id: data.productId },
			});

			if (!product) {
				throw new AppError("Sản phẩm không tồn tại", 404);
			}

			await tx.product.update({
				where: { id: data.productId },
				data: { stock: product.stock + data.quantity },
			});

			return await tx.inventoryTransaction.create({
				data: {
					...data,
					userId,
				},
			});
		});
	}

	static async getInventoryTransactions({
		startDate,
		endDate,
		productId,
	}: GetInventoryTransactionsInput) {
		return await prisma.inventoryTransaction.findMany({
			where: {
				createdAt: { gte: startDate, lte: endDate },
				productId,
			},
			include: {
				product: {
					include: {
						category: true,
					},
				},
			},
		});
	}
}
