import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import {
	createCategorySchema,
	createProductSchema,
	getProductsQuerySchema,
	updateCategorySchema,
	updateProductSchema,
} from "@/shared/schemas/product";
import { ProductService } from "./service";

export const product = new Elysia({ prefix: "/products" })
	.use(authorization)
	// Categories
	.group("/categories", (app) =>
		app
			.post(
				"/",
				async ({ body }) => {
					return await ProductService.createCategory(body);
				},
				{
					body: createCategorySchema,
					authorized: [Role.ADMIN, Role.STAFF],
					detail: {
						tags: ["Products", "Categories"],
					},
				},
			)
			.get(
				"/",
				async () => {
					return await ProductService.getAllCategories();
				},
				{
					detail: {
						tags: ["Products", "Categories"],
					},
				},
			)
			.put(
				"/:id",
				async ({ params: { id }, body }) => {
					return await ProductService.updateCategory(id, body);
				},
				{
					body: updateCategorySchema,
					authorized: [Role.ADMIN, Role.STAFF],
					detail: {
						tags: ["Products", "Categories"],
					},
				},
			)
			.delete(
				"/:id",
				async ({ params: { id } }) => {
					return await ProductService.deleteCategory(id);
				},
				{
					authorized: [Role.ADMIN, Role.STAFF],
					detail: {
						tags: ["Products", "Categories"],
					},
				},
			),
	)
	// Products
	.post(
		"/",
		async ({ body }) => {
			return await ProductService.createProduct(body);
		},
		{
			body: createProductSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Products"],
			},
		},
	)
	.get(
		"/",
		async ({ query }) => {
			return await ProductService.getAllProducts(query);
		},
		{
			query: getProductsQuerySchema,
			detail: {
				tags: ["Products"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params: { id } }) => {
			return await ProductService.getProductById(id);
		},
		{
			detail: {
				tags: ["Products"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params: { id }, body }) => {
			return await ProductService.updateProduct(id, body);
		},
		{
			body: updateProductSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Products"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params: { id } }) => {
			return await ProductService.deleteProduct(id);
		},
		{
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Products"],
			},
		},
	);
