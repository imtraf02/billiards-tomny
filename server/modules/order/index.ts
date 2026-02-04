import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import {
	createOrderSchema,
	getOrdersQuerySchema,
	updateOrderItemSchema,
	updateOrderSchema,
} from "@/shared/schemas/order";
import { OrderService } from "./service";

export const order = new Elysia({ prefix: "/orders" })
	.use(authorization)
	.post(
		"/",
		async ({ body, user }) => {
			return await OrderService.create(body, user.id);
		},
		{
			body: createOrderSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Orders"],
			},
		},
	)
	.get(
		"/",
		async ({ query }) => {
			return await OrderService.getAll(query);
		},
		{
			query: getOrdersQuerySchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Orders"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			return await OrderService.getById(id);
		},
		{
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Orders"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body, user }) => {
			return await OrderService.update(id, body, user.id);
		},
		{
			body: updateOrderSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Orders"],
			},
		},
	)
	.patch(
		"/items/:id",
		async ({ params: { id }, body, user }) => {
			return await OrderService.updateItem(id, body, user.id);
		},
		{
			body: updateOrderItemSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Orders"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id }, user }) => {
			return await OrderService.delete(id, user.id);
		},
		{
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Orders"],
			},
		},
	);
