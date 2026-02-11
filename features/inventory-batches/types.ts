import type { Prisma } from "@/generated/prisma/browser";

export type InventoryBatchDetail = Prisma.InventoryBatchGetPayload<{
	include: {
		product: {
			include: { category: true };
		};
		createdBy: true;
		batchSales: true;
	};
}>;
