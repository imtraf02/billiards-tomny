import { z } from "zod";
import { InventoryTransactionType } from "@/generated/prisma/enums";
import { nameField, uuidField } from "@/lib/validators";

// Category Schemas
const categoryBaseSchema = z.object({
	name: nameField("danh mục", 50),
	description: z.string(),
});

export const createCategorySchema = categoryBaseSchema;
export const updateCategorySchema = categoryBaseSchema;

// Product Schemas
const productBaseSchema = z.object({
	categoryId: uuidField("Danh mục"),
	name: nameField("sản phẩm", 100),
	price: z.int().min(0, { error: "Giá phải là số nguyên dương" }),
	description: z.string(),
	minStock: z
		.int()
		.min(0, { error: "Số lượng tối thiểu phải là số nguyên dương" }),
	unit: z
		.string()
		.min(1, { message: "Đơn vị là bắt buộc, vd: chai, lon, kg, lít, ..." }),
});

export const createProductSchema = productBaseSchema;
export const updateProductSchema = productBaseSchema;

// Inventory Transaction Schemas
export const importProductSchema = z.object({
	productId: uuidField("Sản phẩm"),
	quantity: z.int().min(1, { error: "Số lượng nhập phải là số nguyên dương" }),
	costPerUnit: z.int().min(0, { error: "Giá nhập phải là số nguyên dương" }),
	note: z.string(),
});

export const internalUseSchema = z.object({
	productId: uuidField("Sản phẩm"),
	quantity: z
		.int()
		.min(1, { error: "Số lượng sử dụng phải là số nguyên dương" }),
	reason: z.string(),
});

export const spoilageSchema = z.object({
	productId: uuidField("Sản phẩm"),
	quantity: z
		.int()
		.min(1, { error: "Số lượng hư hỏng phải là số nguyên dương" }),
	reason: z.string(),
});

export const createInventoryTransactionSchema = z.object({
	productId: uuidField("Sản phẩm"),
	type: z.enum(InventoryTransactionType),
	quantity: z.int().min(1, { error: "Số lượng nhập phải là số nguyên dương" }),
	cost: z.int().min(0, { error: "Giá nhập phải là số nguyên dương" }),
	note: z.string(),
});

// Types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ImportProductInput = z.infer<typeof importProductSchema>;
export type InternalUseInput = z.infer<typeof internalUseSchema>;
export type SpoilageInput = z.infer<typeof spoilageSchema>;
export type CreateInventoryTransactionInput = z.infer<
	typeof createInventoryTransactionSchema
>;
