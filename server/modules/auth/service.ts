import * as argon2 from "argon2";
import prisma from "@/lib/db";
import type { LoginInput } from "@/shared/schemas/auth";

export abstract class AuthService {
	static async login({ email, password }: LoginInput) {
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return null;
		}

		const isValidPassword = await argon2.verify(user.password, password);

		if (!isValidPassword) {
			return null;
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
		};
	}

	static async hashPassword(password: string): Promise<string> {
		return await argon2.hash(password);
	}

	static async getUserById(id: string) {
		return await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				role: true,
			},
		});
	}
}
