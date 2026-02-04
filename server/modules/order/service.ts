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
	private static async adjustStock(
		tx: Prisma.TransactionClient,
		productId: string,
		quantity: number,
		type: "IN" | "OUT",
		reason: string,
		note: string,
		userId: string,
		priceSnapshot?: number,
	) {
		const product = await tx.product.findUniqueOrThrow({
			where: { id: productId },
		});

		const stockBefore = product.currentStock;
		const stockAfter =
			type === "IN" ? stockBefore + quantity : stockBefore - quantity;

		if (type === "OUT" && stockAfter < 0) {
			throw new BadRequestError(
				`Sản phẩm "${product.name}" không đủ tồn kho (còn ${stockBefore})`,
			);
		}

		await tx.product.update({
			where: { id: product.id },
			data: { currentStock: stockAfter },
		});

		await tx.inventoryLog.create({
			data: {
				productId: product.id,
				quantity,
				type,
				reason,
				stockBefore,
				stockAfter,
				note,
				userId,
				costSnapshot: product.cost,
				priceSnapshot,
			},
		});
	}

	static async create(
		data: CreateOrderInput,
		executorId: string,
		tx?: Prisma.TransactionClient,
	) {
		const db = tx || prisma;

		// 1. Fetch products and calculate prices
		const itemsWithPrice = await Promise.all(
			data.items.map(async (item) => {
				const product = await db.product.findUniqueOrThrow({
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
			const existingOrder = await db.order.findFirst({
				where: {
					bookingId: data.bookingId,
					status: "PENDING",
				},
				include: {
					orderItems: true,
				},
			});

			if (existingOrder) {
				const executeUpdate = async (t: Prisma.TransactionClient) => {
					// Update order items and deduct inventory
					for (const newItem of itemsWithPrice) {
						await OrderService.adjustStock(
							t,
							newItem.productId,
							newItem.quantity,
							"OUT",
							"sale",
							`Bán thêm món cho booking ${data.bookingId}`,
							executorId,
							newItem.priceSnapshot,
						);

						const existingItem = existingOrder.orderItems.find(
							(item) => item.productId === newItem.productId,
						);

						if (existingItem) {
							await t.orderItem.update({
								where: { id: existingItem.id },
								data: {
									quantity: { increment: newItem.quantity },
								},
							});
						} else {
							await t.orderItem.create({
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
					return await t.order.update({
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
				};

				return tx
					? await executeUpdate(tx)
					: await prisma.$transaction(executeUpdate);
			}
		}

		// 4. Create new order if no existing pending order
		const executeCreate = async (t: Prisma.TransactionClient) => {
			// Deduct inventory for all items
			for (const item of itemsWithPrice) {
				await OrderService.adjustStock(
					t,
					item.productId,
					item.quantity,
					"OUT",
					"sale",
					`Bán hàng cho booking ${data.bookingId || "Khách lẻ"}`,
					executorId,
					item.priceSnapshot,
				);
			}

			return await t.order.create({
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
		};

		return tx
			? await executeCreate(tx)
			: await prisma.$transaction(executeCreate);
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
		});
	}

	static async update(
		id: string,
		data: UpdateOrderInput,
		executorId: string,
		tx?: Prisma.TransactionClient,
	) {
		const db = tx || prisma;
		const order = await db.order.findUniqueOrThrow({
			where: { id },
			include: { orderItems: true },
		});

		// 1. Handle inventory restoration if status changes TO CANCELLED
		if (data.status === "CANCELLED" && order.status !== "CANCELLED") {
			const executeCancel = async (t: Prisma.TransactionClient) => {
				for (const item of order.orderItems) {
					await OrderService.adjustStock(
						t,
						item.productId,
						item.quantity,
						"IN",
						"restock",
						`Hoàn kho do hủy đơn hàng ${id}`,
						executorId,
						item.priceSnapshot,
					);
				}

				return await t.order.update({
					where: { id },
					data,
				});
			};

			return tx
				? await executeCancel(tx)
				: await prisma.$transaction(executeCancel);
		}

		// 2. Handle inventory deduction if status changes FROM CANCELLED
		if (data.status !== "CANCELLED" && order.status === "CANCELLED") {
			const executeRestore = async (t: Prisma.TransactionClient) => {
				for (const item of order.orderItems) {
					await OrderService.adjustStock(
						t,
						item.productId,
						item.quantity,
						"OUT",
						"sale",
						`Trừ kho do phục hồi đơn hàng ${id}`,
						executorId,
						item.priceSnapshot,
					);
				}

				return await t.order.update({
					where: { id },
					data,
				});
			};

			return tx
				? await executeRestore(tx)
				: await prisma.$transaction(executeRestore);
		}

		// 3. Normal status update
		return await db.order.update({
			where: { id },
			data,
		});
	}

	static async updateItem(
		itemId: string,
		data: UpdateOrderItemInput,
		executorId: string,
		tx?: Prisma.TransactionClient,
	) {
		const executeUpdateItem = async (t: Prisma.TransactionClient) => {
			const item = await t.orderItem.findUniqueOrThrow({
				where: { id: itemId },
				include: { order: true },
			});

			const diff = data.quantity - item.quantity;

			if (diff > 0) {
				// Deduct more stock
				await OrderService.adjustStock(
					t,
					item.productId,
					diff,
					"OUT",
					"sale",
					`Cập nhật số lượng (+${diff}) đơn hàng ${item.orderId}`,
					executorId,
					item.priceSnapshot,
				);
			} else if (diff < 0) {
				// Restore stock
				await OrderService.adjustStock(
					t,
					item.productId,
					Math.abs(diff),
					"IN",
					"restock",
					`Cập nhật số lượng (${diff}) đơn hàng ${item.orderId}`,
					executorId,
					item.priceSnapshot,
				);
			}

			// Update item quantity
			const updatedItem = await t.orderItem.update({
				where: { id: itemId },
				data: { quantity: data.quantity },
			});

			// Recalculate order total
			const allItems = await t.orderItem.findMany({
				where: { orderId: item.orderId },
			});

			const newTotal = allItems.reduce(
				(sum, i) => sum + i.priceSnapshot * i.quantity,
				0,
			);

			await t.order.update({
				where: { id: item.orderId },
				data: { totalAmount: newTotal },
			});

			return updatedItem;
		};

		return tx
			? await executeUpdateItem(tx)
			: await prisma.$transaction(executeUpdateItem);
	}

	static async delete(
		id: string,
		executorId: string,
		tx?: Prisma.TransactionClient,
	) {
		const db = tx || prisma;
		const order = await db.order.findUniqueOrThrow({
			where: { id },
			include: { orderItems: true },
		});

		const executeDelete = async (t: Prisma.TransactionClient) => {
			// Restore stock only if order wasn't already cancelled
			if (order.status !== "CANCELLED") {
				for (const item of order.orderItems) {
					await OrderService.adjustStock(
						t,
						item.productId,
						item.quantity,
						"IN",
						"restock",
						`Hoàn kho do xóa đơn hàng ${id}`,
						executorId,
						item.priceSnapshot,
					);
				}
			}

			return await t.order.delete({
				where: { id },
			});
		};

		return tx
			? await executeDelete(tx)
			: await prisma.$transaction(executeDelete);
	}
}
