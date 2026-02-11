import type { Prisma } from "@/generated/prisma/browser";

export type OrderDetails = Prisma.OrderGetPayload<{
	include: {
		products: {
			include: {
				product: true;
			};
		};
		user: {
			select: {
				id: true;
				name: true;
			};
		};
	};
}>;
