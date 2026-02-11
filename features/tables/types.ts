import type { Prisma } from "@/generated/prisma/browser";

export type TableWithSessions = Prisma.TableGetPayload<{
	include: {
		sessions: true;
	};
}>;
