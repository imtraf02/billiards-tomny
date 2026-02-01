import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
	CreateCategoryInput,
	CreateProductInput,
	GetProductsQuery,
	UpdateCategoryInput,
	UpdateProductInput,
} from "@/shared/schemas/product";

export abstract class ProductService {
	// Category Methods
	static async createCategory(data: CreateCategoryInput) {
		return await prisma.category.create({
			data,
		});
	}

	static async getAllCategories() {
		return await prisma.category.findMany({
			orderBy: {
				name: "asc",
			},
			include: {
				_count: {
					select: { products: true },
				},
			},
		});
	}

	static async updateCategory(id: string, data: UpdateCategoryInput) {
		return await prisma.category.update({
			where: { id },
			data,
		});
	}

	static async deleteCategory(id: string) {
		return await prisma.category.delete({
			where: { id },
		});
	}

	// Product Methods
	static async createProduct(data: CreateProductInput) {
		return await prisma.product.create({
			data,
		});
	}

	static async getAllProducts(query: GetProductsQuery) {
		const where: Prisma.ProductWhereInput = {};

		if (query.categoryId) {
			where.categoryId = query.categoryId;
		}

		if (query.search) {
			where.name = {
				contains: query.search,
				mode: "insensitive",
			};
		}

		if (query.isAvailable !== undefined) {
			where.isAvailable = query.isAvailable;
		}

		const skip = (query.page - 1) * query.limit;

		const [products, total] = await Promise.all([
			prisma.product.findMany({
				where,
				orderBy: {
					name: "asc",
				},
				include: {
					category: true,
				},
				skip,
				take: query.limit,
			}),
			prisma.product.count({ where }),
		]);

		return {
			data: products,
			meta: {
				total,
				page: query.page,
				limit: query.limit,
				totalPages: Math.ceil(total / query.limit),
			},
		};
	}

	static async getProductById(id: string) {
		return await prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
			},
		});
	}

	static async updateProduct(id: string, data: UpdateProductInput) {
		return await prisma.product.update({
			where: { id },
			data,
		});
	}

	static async deleteProduct(id: string) {
		return await prisma.product.delete({
			where: { id },
		});
	}
}
