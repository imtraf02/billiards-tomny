import { Elysia } from "elysia";
import type { Role } from "@/generated/prisma/client";
import { AuthService } from "../modules/auth/service";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";
import { accessToken } from "./jwt";

export const authorization = new Elysia({ name: "authorization" })
	.use(accessToken)
	.macro({
		authorized(roles: Role[] = []) {
			return {
				async resolve({ accessToken, headers }) {
					const token = headers.authorization?.split(" ")[1];
					if (!token) {
						throw new UnauthorizedError();
					}

					const decoded = await accessToken.verify(token);
					if (!decoded) {
						throw new UnauthorizedError();
					}

					const user = await AuthService.getUserById(decoded.uid);
					if (!user) {
						throw new UnauthorizedError();
					}

					if (roles.length > 0 && !roles.includes(user.role)) {
						throw new ForbiddenError();
					}

					return { user };
				},
			};
		},
	});
