import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import { getInventoryTransactionsSchema } from "@/shared/schemas/inventory-transaction";
import { createInventoryTransactionSchema } from "@/shared/schemas/product";
import { InventoryTransactionService } from "./service";

export const inventoryTransaction = new Elysia({ prefix: "/inventory" })
	.use(authorization)
	.post(
		"/",
		async ({ body, user }) => {
			return await InventoryTransactionService.createInventoryTransaction(
				body,
				user.id,
			);
		},
		{
			body: createInventoryTransactionSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Inventory Transactions"],
			},
		},
	)
	.get(
		"/",
		async ({ query }) => {
			return await InventoryTransactionService.getInventoryTransactions(query);
		},
		{
			query: getInventoryTransactionsSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Inventory Transactions"],
			},
		},
	);
