import { z } from "zod";

export const orderItemSchema = z.object({
	productId: z.string().min(1, { error: "ID sản phẩm là bắt buộc" }),
	quantity: z.coerce
		.number()
		.int()
		.positive({ error: "Số lượng phải lớn hơn 0" }),
});

export const createOrderSchema = z.object({
	bookingId: z.string().optional(),
	userId: z.string().optional(),
	items: z
		.array(orderItemSchema)
		.min(1, { error: "Phải có ít nhất 1 sản phẩm" }),
});

export const updateOrderSchema = z.object({
	status: z.enum([
		"PENDING",
		"PREPARING",
		"DELIVERED",
		"COMPLETED",
		"CANCELLED",
	]),
});

export const updateOrderItemSchema = z.object({
	quantity: z.coerce
		.number()
		.int()
		.positive({ error: "Số lượng phải lớn hơn 0" }),
});

export const getOrdersQuerySchema = z.object({
	bookingId: z.string().optional(),
	userId: z.string().optional(),
	status: z
		.enum(["PENDING", "PREPARING", "DELIVERED", "COMPLETED", "CANCELLED"])
		.optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
});

export const completeOrderSchema = z.object({
	paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "MOMO", "ZALOPAY"]),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type CompleteOrderInput = z.infer<typeof completeOrderSchema>;
