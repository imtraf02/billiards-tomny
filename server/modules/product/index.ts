import { Elysia } from "elysia";
import { Role } from "@/generated/prisma/client";
import { authorization } from "@/server/plugins/authorization";
import {
	createCategorySchema,
	createProductSchema,
	importProductSchema,
	internalUseSchema,
	spoilageSchema,
	updateCategorySchema,
	updateProductSchema,
} from "@/shared/schemas/product";
import { ProductService } from "./service";

export const product = new Elysia({ prefix: "/products" })
	.use(authorization)

	// ==================== Categories ====================
	.group("/categories", (app) =>
		app
			.post(
				"/",
				async ({ body }) => {
					return await ProductService.createCategory(body);
				},
				{
					body: createCategorySchema,
					authorized: [Role.ADMIN],
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
					authorized: [Role.ADMIN],
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
					authorized: [Role.ADMIN],
					detail: {
						tags: ["Products", "Categories"],
					},
				},
			),
	)

	// ==================== Products ====================
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
	.post(
		"/",
		async ({ body, user }) => {
			return await ProductService.createProduct(body);
		},
		{
			body: createProductSchema,
			authorized: [Role.ADMIN],
			detail: {
				tags: ["Products"],
			},
		},
	)
	.put(
		"/:id",
		async ({ params: { id }, body }) => {
			return await ProductService.updateProduct(id, body);
		},
		{
			body: updateProductSchema,
			authorized: [Role.ADMIN],
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
			authorized: [Role.ADMIN],
			detail: {
				tags: ["Products"],
			},
		},
	)

	// ==================== Inventory Management (FIFO) ====================

	/**
	 * POST /products/import
	 * Nhập hàng (tạo lô mới)
	 */
	.post(
		"/import",
		async ({ body, user }) => {
			return await ProductService.importProduct(body, user.id);
		},
		{
			body: importProductSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Products", "Inventory"],
				summary: "Nhập hàng (tạo lô mới)",
				description: "Nhập hàng vào kho và tạo lô hàng mới cho FIFO",
			},
		},
	)

	/**
	 * POST /products/internal-use
	 * Sử dụng nội bộ (nhân viên uống, test, đãi khách)
	 */
	.post(
		"/internal-use",
		async ({ body, user }) => {
			return await ProductService.useProductInternal(body, user.id);
		},
		{
			body: internalUseSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Products", "Inventory"],
				summary: "Sử dụng nội bộ",
				description:
					"Xuất kho cho mục đích nội bộ (nhân viên uống, test, đãi khách)",
			},
		},
	)

	/**
	 * POST /products/spoilage
	 * Đánh dấu hư hỏng
	 */
	.post(
		"/spoilage",
		async ({ body, user }) => {
			return await ProductService.markProductSpoiled(body, user.id);
		},
		{
			body: spoilageSchema,
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Products", "Inventory"],
				summary: "Đánh dấu hư hỏng",
				description: "Xuất kho do sản phẩm hư hỏng (hết hạn, bể, mốc)",
			},
		},
	)

	/**
	 * GET /products/:id/batches
	 * Xem danh sách lô hàng còn tồn
	 */
	.get(
		"/:id/batches",
		async ({ params: { id } }) => {
			return await ProductService.getProductBatches(id);
		},
		{
			authorized: [Role.ADMIN, Role.STAFF],
			detail: {
				tags: ["Products", "Inventory"],
				summary: "Xem danh sách lô hàng",
				description: "Lấy danh sách các lô hàng còn tồn kho của sản phẩm",
			},
		},
	)

	/**
	 * GET /products/:id/average-cost
	 * Lấy giá vốn trung bình hiện tại (WAC)
	 */
	.get(
		"/:id/average-cost",
		async ({ params: { id } }) => {
			const avgCost = await ProductService.getWeightedAverageCost(id);
			return {
				productId: id,
				averageCost: avgCost,
			};
		},
		{
			authorized: [Role.ADMIN],
			detail: {
				tags: ["Products", "Inventory"],
				summary: "Giá vốn trung bình",
				description:
					"Tính giá vốn trung bình (Weighted Average Cost) của sản phẩm",
			},
		},
	);
