import { z } from "zod";

export const loginSchema = z.object({
	email: z.email({ error: "Email không hợp lệ" }),
	password: z
		.string({ error: "Mật khẩu là bắt buộc" })
		.min(1, { error: "Mật khẩu không được để trống" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
