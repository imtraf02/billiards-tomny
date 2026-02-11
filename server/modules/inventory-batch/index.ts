import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import { getInventoryBatchesSchema } from "@/shared/schemas/inventory-batch";
import { InventoryBatchService } from "./service";

export const inventoryBatch = new Elysia({ prefix: "/inventory-batch" })
	.use(authorization)
	.get(
		"/",
		async ({ query }) => {
			return await InventoryBatchService.getInventoryBatches(query);
		},
		{
			query: getInventoryBatchesSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Inventory Batch"],
			},
		},
	);
