import { Elysia } from "elysia";
import z from "zod";
import { Role } from "@/generated/prisma/client";
import { uuidField } from "@/lib/validators";
import { authorization } from "@/server/plugins/authorization";
import { mutateOrderSchema } from "@/shared/schemas/order";
import { OrderService } from "./service";

export const order = new Elysia({ prefix: "/order" })
	.use(authorization)
	.post(
		"/",
		async ({ body, user }) => {
			return await OrderService.mutateOrder(body, user.id);
		},
		{
			body: mutateOrderSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Orders"],
			},
		},
	)
	.get(
		"/get-by-session",
		async ({ query }) => {
			return await OrderService.getOrderBySession(query.sessionId);
		},
		{
			query: z.object({
				sessionId: uuidField("Phiên chơi"),
			}),
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Orders"],
			},
		},
	);
