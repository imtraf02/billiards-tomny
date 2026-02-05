import { z } from "zod";

export const createTableSchema = z.object({
	name: z
		.string()
		.min(1, { error: "Tên bàn là bắt buộc" })
		.max(50, { error: "Tên bàn quá dài" }),
	type: z.enum(["POOL", "CAROM", "SNOOKER"], {
		error: "Loại bàn không hợp lệ",
	}),
	hourlyRate: z.coerce
		.number()
		.int()
		.positive({ error: "Giá theo giờ phải lớn hơn 0" }),
	status: z
		.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"])
		.default("AVAILABLE"),
});

export const updateTableSchema = z.object({
	name: z
		.string()
		.min(1, { error: "Tên bàn là bắt buộc" })
		.max(50, { error: "Tên bàn quá dài" })
		.optional(),
	type: z.enum(["POOL", "CAROM", "SNOOKER"]).optional(),
	hourlyRate: z.coerce
		.number()
		.positive({ error: "Giá theo giờ phải lớn hơn 0" })
		.optional(),
	status: z
		.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"])
		.optional(),
});

export const updateTableStatusSchema = z.object({
	status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"]),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type UpdateTableStatusInput = z.infer<typeof updateTableStatusSchema>;
