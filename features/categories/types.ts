import type { Prisma } from "@/generated/prisma/browser";

export type CategoryWithCount = Prisma.CategoryGetPayload<{
	include: {
		_count: {
			select: { products: true };
		};
	};
}>;
