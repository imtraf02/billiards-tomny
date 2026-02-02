import { z } from "zod";

export const loginSchema = z.object({
	email: z.email({ error: "Email không hợp lệ" }),
	password: z.string().min(6, { error: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export const registerSchema = z
	.object({
		name: z
			.string()
			.min(2, { error: "Tên phải có ít nhất 2 ký tự" })
			.max(100, { error: "Tên quá dài" }),
		email: z.email({ error: "Email không hợp lệ" }),
		password: z.string().min(6, { error: "Mật khẩu phải có ít nhất 6 ký tự" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});

export const changePasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(1, { error: "Mật khẩu hiện tại là bắt buộc" }),
		newPassword: z
			.string()
			.min(6, { error: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});

export const forgotPasswordSchema = z.object({
	email: z.email({ error: "Email không hợp lệ" }),
});

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, { error: "Token không hợp lệ" }),
		password: z.string().min(6, { error: "Mật khẩu phải có ít nhất 6 ký tự" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
