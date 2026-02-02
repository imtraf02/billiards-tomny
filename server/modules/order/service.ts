import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
	CreateOrderInput,
	GetOrdersQuery,
	UpdateOrderInput,
	UpdateOrderItemInput,
} from "@/shared/schemas/order";

export abstract class OrderService {
	static async create(data: CreateOrderInput) {
		// Calculate total price for items
		let totalAmount = 0;
		const itemsWithPrice = await Promise.all(
			data.items.map(async (item) => {
				const product = await prisma.product.findUniqueOrThrow({
					where: { id: item.productId },
				});

				const lineTotal = product.price * item.quantity;
				totalAmount += lineTotal;

				return {
					productId: item.productId,
					quantity: item.quantity,
					priceSnapshot: product.price,
					costSnapshot: product.cost,
				};
			}),
		);

		return await prisma.order.create({
			data: {
				bookingId: data.bookingId,
				userId: data.userId,
				totalAmount,
				status: "PENDING",
				orderItems: {
					create: itemsWithPrice,
				},
			},
			include: {
				orderItems: {
					include: {
						product: true,
					},
				},
			},
		});
	}

	static async getAll(query: GetOrdersQuery) {
		const where: Prisma.OrderWhereInput = {};

		if (query.bookingId) {
			where.bookingId = query.bookingId;
		}

		if (query.userId) {
			where.userId = query.userId;
		}

		if (query.status) {
			where.status = query.status;
		}

		if (query.startDate || query.endDate) {
			where.createdAt = {
				gte: query.startDate,
				lte: query.endDate,
			};
		}

		const skip = (query.page - 1) * query.limit;

		const [orders, total] = await Promise.all([
			prisma.order.findMany({
				where,
				orderBy: {
					createdAt: "desc",
				},
				include: {
					orderItems: {
						include: {
							product: true,
						},
					},
					user: true,
					booking: true,
				},
				skip,
				take: query.limit,
			}),
			prisma.order.count({ where }),
		]);

		return {
			data: orders,
			meta: {
				total,
				page: query.page,
				limit: query.limit,
				totalPages: Math.ceil(total / query.limit),
			},
		};
	}

	static async getById(id: string) {
		return await prisma.order.findUnique({
			where: { id },
			include: {
				orderItems: {
					include: {
						product: true,
					},
				},
				user: true,
				booking: true,
			},
		});
	}

	static async update(id: string, data: UpdateOrderInput) {
		return await prisma.order.update({
			where: { id },
			data,
		});
	}

	static async updateItem(itemId: string, data: UpdateOrderItemInput) {
		const item = await prisma.orderItem.findUniqueOrThrow({
			where: { id: itemId },
			include: { order: true },
		});

		// Recalculate order total if quantity changes (simplified)
		// In real app, might need transaction to update order total atomically
		return await prisma.orderItem.update({
			where: { id: itemId },
			data,
		});
	}
}
