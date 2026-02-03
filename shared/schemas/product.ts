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
		.max(100, { error: "Tên sản phẩm quá dài" }),
	price: z.int().min(0),
	cost: z.int().min(0),
	description: z.string(),
	imageUrl: z.url({ message: "URL ảnh không hợp lệ" }),
	isAvailable: z.boolean(),
	currentStock: z.int().min(0),
	minStock: z.int().min(0),
	unit: z.string(),
});

export const updateProductSchema = z.object({
	categoryId: z.string(),
	name: z.string().max(100),
	price: z.int().min(0),
	cost: z.int().min(0),
	description: z.string(),
	imageUrl: z.url({ message: "URL ảnh không hợp lệ" }),
	isAvailable: z.boolean(),
	currentStock: z.int().min(0),
	minStock: z.int().min(0),
	unit: z.string(),
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

// Inventory Schemas
export const createInventoryLogSchema = z.object({
	productId: z.string().min(1, { message: "Sản phẩm là bắt buộc" }),
	type: z.enum(["IN", "OUT"]),
	quantity: z.int().min(1, { message: "Số lượng phải lớn hơn 0" }),
	unitCost: z.int().min(0),
	reason: z.string(),
	note: z.string(),
});

export const getInventoryLogsQuerySchema = z.object({
	productId: z.string().optional(),
	type: z.enum(["IN", "OUT"]).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateInventoryLogInput = z.infer<typeof createInventoryLogSchema>;
export type GetInventoryLogsQuery = z.infer<typeof getInventoryLogsQuerySchema>;
