import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL,
});

declare global {
	var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (env.IS_PROD) {
	globalThis.__prisma = prisma;
}
