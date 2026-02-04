import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { BadRequestError } from "@/server/utils/errors";
import type {
	CreateOrderInput,
	GetOrdersQuery,
	UpdateOrderInput,
	UpdateOrderItemInput,
} from "@/shared/schemas/order";

export abstract class OrderService {
	static async create(data: CreateOrderInput, executorId: string) {
		// 1. Fetch products and calculate prices
		const itemsWithPrice = await Promise.all(
			data.items.map(async (item) => {
				const product = await prisma.product.findUniqueOrThrow({
					where: { id: item.productId },
				});

				return {
					productId: item.productId,
					quantity: item.quantity,
					priceSnapshot: product.price,
					costSnapshot: product.cost,
					lineTotal: product.price * item.quantity,
				};
			}),
		);

		// 2. Calculate grand total safely
		const totalAmount = itemsWithPrice.reduce(
			(sum, item) => sum + item.lineTotal,
			0,
		);

		// 3. Find existing PENDING order if bookingId is provided
		if (data.bookingId) {
			const existingOrder = await prisma.order.findFirst({
				where: {
					bookingId: data.bookingId,
					status: "PENDING",
				},
				include: {
					orderItems: true,
				},
			});

			if (existingOrder) {
				return await prisma.$transaction(async (tx) => {
					// Update order items and deduct inventory
					for (const newItem of itemsWithPrice) {
						// 1. Check stock
						const product = await tx.product.findUniqueOrThrow({
							where: { id: newItem.productId },
						});

						if (product.currentStock < newItem.quantity) {
							throw new BadRequestError(
								`Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.currentStock})`,
							);
						}

						// 2. Deduct stock
						const stockBefore = product.currentStock;
						const stockAfter = stockBefore - newItem.quantity;

						await tx.product.update({
							where: { id: product.id },
							data: { currentStock: stockAfter },
						});

						// 3. Log inventory
						await tx.inventoryLog.create({
							data: {
								productId: product.id,
								quantity: newItem.quantity,
								type: "OUT",
								reason: "sale",
								stockBefore,
								stockAfter,
								note: `Bán hàng cho booking ${data.bookingId} (cập nhật đơn hàng)`,
								userId: executorId,
								costSnapshot: newItem.costSnapshot ?? product.cost,
								priceSnapshot: newItem.priceSnapshot,
							},
						});

						const existingItem = existingOrder.orderItems.find(
							(item) => item.productId === newItem.productId,
						);

						if (existingItem) {
							await tx.orderItem.update({
								where: { id: existingItem.id },
								data: {
									quantity: { increment: newItem.quantity },
								},
							});
						} else {
							await tx.orderItem.create({
								data: {
									orderId: existingOrder.id,
									productId: newItem.productId,
									quantity: newItem.quantity,
									priceSnapshot: newItem.priceSnapshot,
									costSnapshot: newItem.costSnapshot,
								},
							});
						}
					}

					// Update total amount
					return await tx.order.update({
						where: { id: existingOrder.id },
						data: {
							totalAmount: { increment: totalAmount },
						},
						include: {
							orderItems: {
								include: {
									product: true,
								},
							},
						},
					});
				});
			}
		}

		// 4. Create new order if no existing pending order
		return await prisma.$transaction(async (tx) => {
			// Deduct inventory for all items
			for (const item of itemsWithPrice) {
				const product = await tx.product.findUniqueOrThrow({
					where: { id: item.productId },
				});

				if (product.currentStock < item.quantity) {
					throw new BadRequestError(
						`Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.currentStock})`,
					);
				}

				const stockBefore = product.currentStock;
				const stockAfter = stockBefore - item.quantity;

				await tx.product.update({
					where: { id: product.id },
					data: { currentStock: stockAfter },
				});

				await tx.inventoryLog.create({
					data: {
						productId: product.id,
						quantity: item.quantity,
						type: "OUT",
						reason: "sale",
						stockBefore,
						stockAfter,
						note: `Bán hàng cho booking ${data.bookingId}`,
						userId: executorId,
						costSnapshot: product.cost,
						priceSnapshot: item.priceSnapshot,
					},
				});
			}

			return await tx.order.create({
				data: {
					bookingId: data.bookingId,
					userId: data.userId,
					totalAmount,
					status: "PENDING",
					orderItems: {
						create: itemsWithPrice.map(({ lineTotal, ...item }) => item),
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
					user: {
						select: {
							id: true,
							name: true,
						},
					},
					booking: {
						include: {
							bookingTables: {
								include: {
									table: true,
								},
							},
						},
					},
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
				booking: {
					include: {
						bookingTables: {
							include: {
								table: true,
							},
						},
					},
				},
			},
		});
	}

	static async update(id: string, data: UpdateOrderInput, executorId: string) {
		const order = await prisma.order.findUniqueOrThrow({
			where: { id },
			include: { orderItems: true },
		});

		// Handle inventory restoration if cancelled
		if (data.status === "CANCELLED" && order.status !== "CANCELLED") {
			return await prisma.$transaction(async (tx) => {
				for (const item of order.orderItems) {
					const product = await tx.product.findUniqueOrThrow({
						where: { id: item.productId },
					});

					const stockBefore = product.currentStock;
					const stockAfter = stockBefore + item.quantity;

					await tx.product.update({
						where: { id: product.id },
						data: { currentStock: stockAfter },
					});

					await tx.inventoryLog.create({
						data: {
							productId: product.id,
							quantity: item.quantity,
							type: "IN",
							reason: "restock",
							stockBefore,
							stockAfter,
							note: `Hoàn kho do hủy đơn hàng ${id}`,
							userId: executorId,
							costSnapshot: product.cost,
							priceSnapshot: item.priceSnapshot,
						},
					});
				}

				return await tx.order.update({
					where: { id },
					data,
				});
			});
		}

		return await prisma.order.update({
			where: { id },
			data,
		});
	}

	static async updateItem(itemId: string, data: UpdateOrderItemInput) {
		// Recalculate order total if quantity changes (simplified)
		// In real app, might need transaction to update order total atomically
		return await prisma.orderItem.update({
			where: { id: itemId },
			data,
		});
	}
}
