import type { Prisma } from "@/generated/prisma/browser";

export interface ProductStats {
	productId: string;
	productName: string;
	categoryName: string;
	unit: string;
	currentInventory: number;
	importQty: number;
	importValue: number;
	exportQty: number;
	exportValue: number;
	saleQty: number;
	saleValue: number;
	profit: number;
	profitMargin: number;
}

export type InventoryWithProduct = Prisma.InventoryTransactionGetPayload<{
	include: {
		product: {
			include: {
				category: true;
			};
		};
	};
}>;
