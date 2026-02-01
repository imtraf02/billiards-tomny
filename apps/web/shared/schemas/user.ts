import { z } from "zod";

export const createUserSchema = z.object({
	name: z
		.string()
		.min(2, { error: "Tên phải có ít nhất 2 ký tự" })
		.max(100, { error: "Tên quá dài" }),
	phone: z
		.string()
		.regex(/^[0-9]{10,11}$/, { error: "Số điện thoại không hợp lệ" }),
	email: z.email({ error: "Email không hợp lệ" }).optional().or(z.literal("")),
	password: z.string().min(6, { error: "Mật khẩu phải có ít nhất 6 ký tự" }),
	role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]).default("CUSTOMER"),
});

export const updateUserSchema = z.object({
	name: z
		.string()
		.min(2, { error: "Tên phải có ít nhất 2 ký tự" })
		.max(100, { error: "Tên quá dài" })
		.optional(),
	phone: z
		.string()
		.regex(/^[0-9]{10,11}$/, { error: "Số điện thoại không hợp lệ" })
		.optional(),
	email: z.email({ error: "Email không hợp lệ" }).optional().or(z.literal("")),
	role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]).optional(),
});

export const updateProfileSchema = z.object({
	name: z
		.string()
		.min(2, { error: "Tên phải có ít nhất 2 ký tự" })
		.max(100, { error: "Tên quá dài" })
		.optional(),
	email: z.email({ error: "Email không hợp lệ" }).optional().or(z.literal("")),
});

export const getUsersQuerySchema = z.object({
	role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]).optional(),
	search: z.string().optional(),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
