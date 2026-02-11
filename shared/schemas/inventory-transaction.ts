import { z } from "zod";
import { InventoryTransactionType } from "@/generated/prisma/enums";

export const createInventoryTransactionSchema = z.object({
	productId: z.uuidv7({
		error: "ID sản phẩm không hợp lệ",
	}),
	type: z.enum(InventoryTransactionType),
	quantity: z.int(),
	cost: z.int().min(0),
	note: z.string(),
});

export const getInventoryTransactionsSchema = z.object({
	productId: z
		.uuidv7({
			error: "ID sản phẩm không hợp lệ",
		})
		.optional(),
	startDate: z.iso.datetime(),
	endDate: z.iso.datetime(),
});

export type CreateInventoryTransactionInput = z.infer<
	typeof createInventoryTransactionSchema
>;

export type GetInventoryTransactionsInput = z.infer<
	typeof getInventoryTransactionsSchema
>;
