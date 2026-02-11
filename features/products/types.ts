import type { Prisma } from "@/generated/prisma/browser";

export type ProductDetails = Prisma.ProductGetPayload<{
	include: {
		category: true;
		batches: true;
	};
}>;
