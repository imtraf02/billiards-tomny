import z from "zod";
import { OrderType } from "@/generated/prisma/enums";
import { enumToZodEnum } from "@/lib/utils";
import { uuidField } from "@/lib/validators";

export const mutateOrderSchema = z.object({
	orderId: uuidField("Đơn hàng").or(z.undefined()), // Có orderId = update, không có = create
	sessionId: uuidField("Phiên chơi").or(z.undefined()),
	type: z.enum(OrderType),
	products: z.array(
		z.object({
			productId: uuidField("Sản phẩm"),
			quantity: z.number().min(1),
		}),
	),
});

export type MutateOrderInput = z.infer<typeof mutateOrderSchema>;
