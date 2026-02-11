import { z } from "zod";
import { TableStatus, TableType } from "@/generated/prisma/enums";

export const createTableSchema = z.object({
	name: z
		.string()
		.min(1, { error: "Tên bàn là bắt buộc" })
		.max(50, { error: "Tên bàn quá dài" }),
	type: z.enum(TableType),
	hourlyRate: z.int().min(0, { error: "Giá theo giờ phải >= 0" }),
	status: z.enum(TableStatus),
});

export const updateTableSchema = z.object({
	name: z
		.string()
		.min(1, { error: "Tên bàn là bắt buộc" })
		.max(50, { error: "Tên bàn quá dài" }),
	type: z.enum([TableType.POOL, TableType.CAROM, TableType.SNOOKER]),
	hourlyRate: z.number().int().min(0, { error: "Giá theo giờ phải >= 0" }),
	status: z.enum([
		TableStatus.AVAILABLE,
		TableStatus.OCCUPIED,
		TableStatus.MAINTENANCE,
		TableStatus.RESERVED,
	]),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
