import { Elysia } from "elysia";
import { authorization } from "@/server/plugins/authorization";
import { accessToken } from "@/server/plugins/jwt";
import { loginSchema } from "@/shared/schemas/auth";
import { AuthService } from "./service";

export const auth = new Elysia({ prefix: "/auth" })
	.use(accessToken)
	.post(
		"/login",
		async ({ body, set, accessToken }) => {
			const user = await AuthService.login({
				email: body.email,
				password: body.password,
			});
			if (!user) {
				set.status = 401;
				return { message: "Email hoặc mật khẩu không đúng" };
			}
			const token = await accessToken.sign({
				uid: user.id,
			});
			return {
				message: "Đăng nhập thành công",
				user,
				token,
			};
		},
		{
			body: loginSchema,
			tags: ["Auth"],
		},
	)
	.use(authorization)
	.get(
		"/me",
		({ user }) => {
			return user;
		},
		{
			authorized: [],
			tags: ["Auth"],
		},
	)
	.post(
		"/logout",
		async () => {
			return true;
		},
		{
			authorized: [],
			tags: ["Auth"],
		},
	);
