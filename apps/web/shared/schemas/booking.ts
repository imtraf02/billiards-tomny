import { z } from "zod";

export const createBookingSchema = z.object({
	userId: z.string().optional(),
	tableIds: z.array(z.string()).min(1, { error: "Phải chọn ít nhất 1 bàn" }),
	startTime: z.coerce.date(),
	note: z.string().max(500, { error: "Ghi chú quá dài" }).optional(),
});

export const updateBookingSchema = z.object({
	status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
	endTime: z.coerce.date().optional(),
	note: z.string().max(500, { error: "Ghi chú quá dài" }).optional(),
});

export const addTableToBookingSchema = z.object({
	tableId: z.string().min(1, { error: "ID bàn là bắt buộc" }),
	startTime: z.coerce.date().optional(),
});

export const endTableInBookingSchema = z.object({
	bookingTableId: z.string().min(1, { error: "ID booking table là bắt buộc" }),
	endTime: z.coerce.date().optional(),
});

export const getBookingsQuerySchema = z.object({
	userId: z.string().optional(),
	status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
	tableId: z.string().optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
});

export const completeBookingSchema = z.object({
	paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "MOMO", "ZALOPAY"]),
	endTime: z.coerce.date().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type AddTableToBookingInput = z.infer<typeof addTableToBookingSchema>;
export type EndTableInBookingInput = z.infer<typeof endTableInBookingSchema>;
export type GetBookingsQuery = z.infer<typeof getBookingsQuerySchema>;
export type CompleteBookingInput = z.infer<typeof completeBookingSchema>;
