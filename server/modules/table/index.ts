import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import { createTableSchema, updateTableSchema } from "@/shared/schemas/table";
import { TableService } from "./service";

export const table = new Elysia({ prefix: "/tables" })
	.use(authorization)
	.post(
		"/",
		async ({ body }) => {
			return await TableService.create(body);
		},
		{
			body: createTableSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Tables"],
			},
		},
	)
	.get(
		"/",
		async () => {
			return await TableService.getAll();
		},
		{
			detail: { tags: ["Tables"] },
		},
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			return await TableService.getById(id);
		},
		{
			detail: {
				tags: ["Tables"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body }) => {
			return await TableService.update(id, body);
		},
		{
			body: updateTableSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Tables"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			return await TableService.delete(id);
		},
		{
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Tables"],
			},
		},
	);
