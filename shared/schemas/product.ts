import { z } from "zod";

// Category Schemas
export const createCategorySchema = z.object({
	name: z
		.string()
		.min(1, { error: "Tên danh mục là bắt buộc" })
		.max(50, { error: "Tên danh mục quá dài" }),
});

export const updateCategorySchema = z.object({
	name: z
		.string()
		.min(1, { error: "Tên danh mục là bắt buộc" })
		.max(50, { error: "Tên danh mục quá dài" }),
});

// Product Schemas
export const createProductSchema = z.object({
	categoryId: z.string().min(1, { message: "Danh mục là bắt buộc" }),
	name: z
		.string()
		.min(1, { message: "Tên sản phẩm là bắt buộc" })
		.max(100, { message: "Tên sản phẩm quá dài" }),
	price: z.coerce
		.number()
		.int()
		.positive({ message: "Giá bán phải lớn hơn 0" }),
	cost: z.coerce
		.number()
		.int()
		.positive({ message: "Giá vốn phải lớn hơn 0" })
		.default(0),
	description: z.string().default(""),
	imageUrl: z.url({ message: "URL ảnh không hợp lệ" }).default(""),
	isAvailable: z.boolean().default(true),
	currentStock: z.coerce.number().int().min(0).default(0),
	minStock: z.coerce.number().int().min(0).default(0),
	unit: z.string().default("cái"),
});

export const updateProductSchema = z.object({
	categoryId: z.string().optional(),
	name: z.string().max(100).optional(),
	price: z.coerce.number().int().positive().optional(),
	cost: z.coerce.number().int().positive().optional(),
	description: z.string().optional(),
	imageUrl: z.url().optional(),
	isAvailable: z.boolean().optional(),
	currentStock: z.coerce.number().int().min(0).optional(),
	minStock: z.coerce.number().int().min(0).optional(),
	unit: z.string().optional(),
});

export const getProductsQuerySchema = z.object({
	categoryId: z.string().optional(),
	search: z.string().optional(),
	isAvailable: z
		.enum(["true", "false"])
		.transform((val) => val === "true")
		.optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type GetProductsQuery = z.infer<typeof getProductsQuerySchema>;
