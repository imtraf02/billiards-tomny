import prisma from "@/lib/db";
import type { GetInventoryBatchesInput } from "@/shared/schemas/inventory-batch";

export abstract class InventoryBatchService {
	static async getInventoryBatches({
		productId,
		startDate,
		endDate,
	}: GetInventoryBatchesInput) {
		return await prisma.inventoryBatch.findMany({
			where: {
				importedAt: { gte: startDate, lte: endDate },
				productId,
			},
			include: {
				product: {
					include: { category: true },
				},
				createdBy: true,
				batchSales: true,
			},
		});
	}
}
