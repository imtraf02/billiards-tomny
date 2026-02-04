import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import {
	createCategorySchema,
	createInventoryLogSchema,
	createProductSchema,
	getInventoryAnalysisQuerySchema,
	getInventoryLogsQuerySchema,
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
		async ({ body, user }) => {
			return await ProductService.createProduct(body, user.id);
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
		async () => {
			return await ProductService.getAllProducts();
		},
		{
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
		async ({ params: { id }, body, user }) => {
			return await ProductService.updateProduct(id, body, user.id);
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
	)
	// Inventory
	.group("/inventory", (app) =>
		app
			.post(
				"/",
				async ({ body, user }) => {
					return await ProductService.createInventoryLog(body, user.id);
				},
				{
					body: createInventoryLogSchema,
					authorized: [Role.ADMIN, Role.STAFF],
					detail: {
						tags: ["Products", "Inventory"],
						summary: "Nhập/Xuất kho",
					},
				},
			)
			.get(
				"/",
				async ({ query }) => {
					return await ProductService.getInventoryLogs(query);
				},
				{
					query: getInventoryLogsQuerySchema,
					authorized: [Role.ADMIN, Role.STAFF],
					detail: {
						tags: ["Products", "Inventory"],
						summary: "Lấy danh sách lịch sử kho",
					},
				},
			)
			.get(
				"/analysis",
				async ({ query }) => {
					return await ProductService.getInventoryAnalysis(query);
				},
				{
					query: getInventoryAnalysisQuerySchema,
					authorized: [Role.ADMIN, Role.STAFF],
					detail: {
						tags: ["Products", "Inventory"],
						summary: "Phân tích thu chi kho",
					},
				},
			),
	)
	.get(
		"/:id/inventory",
		async ({ params: { id } }) => {
			return await ProductService.getProductInventoryLogs(id);
		},
		{
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Products", "Inventory"],
				summary: "Lấy lịch sử kho của 1 sản phẩm",
			},
		},
	);
