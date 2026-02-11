import { InventoryTransactionType } from "@/generated/prisma/browser";

export const INVENTORY_TRANSACTION_TYPES = {
	[InventoryTransactionType.IMPORT]: "Nhập kho",
	[InventoryTransactionType.SALE]: "Bán",
	[InventoryTransactionType.INTERNAL]: "Dùng nội bộ",
	[InventoryTransactionType.SPOILAGE]: "Hư hỏng",
	[InventoryTransactionType.ADJUSTMENT]: "Điều chỉnh tồn kho",
} satisfies Record<InventoryTransactionType, string>;
