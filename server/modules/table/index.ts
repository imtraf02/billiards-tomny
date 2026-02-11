import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import { createTableSchema, updateTableSchema } from "@/shared/schemas/table";
import { TableService } from "./service";

export const table = new Elysia({ prefix: "/tables" })
	.use(authorization)
	.get(
		"/",
		async () => {
			return await TableService.getAllTables();
		},
		{
			detail: {
				tags: ["Tables"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			return await TableService.getTableById(id);
		},
		{
			detail: {
				tags: ["Tables"],
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return await TableService.createTable(body);
		},
		{
			body: createTableSchema,
			authorized: [Role.ADMIN],
			detail: {
				tags: ["Tables"],
			},
		},
	)
	.put(
		"/:id",
		async ({ params: { id }, body }) => {
			return await TableService.updateTable(id, body);
		},
		{
			body: updateTableSchema,
			authorized: [Role.ADMIN],
			detail: {
				tags: ["Tables"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			return await TableService.deleteTable(id);
		},
		{
			authorized: [Role.ADMIN],
			detail: {
				tags: ["Tables"],
			},
		},
	)
	.post(
		"/:id/start-session",
		async ({ params: { id } }) => {
			return await TableService.startSession(id);
		},
		{
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Tables"],
			},
		},
	);
