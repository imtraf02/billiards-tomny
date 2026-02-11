import { z } from "zod";
import { uuidField } from "@/lib/validators";

export const getInventoryBatchesSchema = z.object({
	productId: uuidField("Sản phẩm").optional(),
	startDate: z.iso.datetime(),
	endDate: z.iso.datetime(),
});

export type GetInventoryBatchesInput = z.infer<
	typeof getInventoryBatchesSchema
>;
