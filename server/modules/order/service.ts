import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { BadRequestError } from "@/server/utils/errors";
import type {
	BatchUpdateOrderItemsInput,
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

		// 0. If order is already CANCELLED or COMPLETED, block all updates
		if (order.status === "CANCELLED" || order.status === "COMPLETED") {
			throw new BadRequestError(
				`Không thể cập nhật đơn hàng đã ${order.status === "CANCELLED" ? "hủy" : "hoàn thành"}`,
			);
		}

		// 1. Handle inventory restoration if status changes TO CANCELLED
		if (data.status === "CANCELLED") {
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
		// REMOVED: User requested that cancelled orders cannot be updated/restored.

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

			if (
				item.order.status === "CANCELLED" ||
				item.order.status === "COMPLETED"
			) {
				throw new BadRequestError(
					`Không thể cập nhật món của đơn hàng đã ${item.order.status === "CANCELLED" ? "hủy" : "hoàn thành"}`,
				);
			}

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

	static async batchUpdateItems(
		orderId: string,
		data: BatchUpdateOrderItemsInput,
		executorId: string,
		tx?: Prisma.TransactionClient,
	) {
		const executeBatchUpdate = async (t: Prisma.TransactionClient) => {
			const order = await t.order.findUniqueOrThrow({
				where: { id: orderId },
				include: { orderItems: true },
			});

			if (order.status === "CANCELLED" || order.status === "COMPLETED") {
				throw new BadRequestError(
					`Không thể cập nhật đơn hàng đã ${order.status === "CANCELLED" ? "hủy" : "hoàn thành"}`,
				);
			}

			for (const itemInput of data.items) {
				if (itemInput.id) {
					// Update or delete existing item
					const existingItem = order.orderItems.find(
						(i) => i.id === itemInput.id,
					);
					if (!existingItem) {
						throw new BadRequestError(
							`Không tìm thấy món với ID ${itemInput.id}`,
						);
					}

					if (itemInput.quantity === 0) {
						// Restore stock and delete item
						await OrderService.adjustStock(
							t,
							existingItem.productId,
							existingItem.quantity,
							"IN",
							"restock",
							`Xóa món khỏi đơn hàng ${orderId}`,
							executorId,
							existingItem.priceSnapshot,
						);
						await t.orderItem.delete({ where: { id: itemInput.id } });
					} else {
						// Update quantity and adjust stock
						const diff = itemInput.quantity - existingItem.quantity;
						if (diff !== 0) {
							await OrderService.adjustStock(
								t,
								existingItem.productId,
								Math.abs(diff),
								diff > 0 ? "OUT" : "IN",
								diff > 0 ? "sale" : "restock",
								`Cập nhật số lượng (${diff > 0 ? "+" : ""}${diff}) đơn hàng ${orderId}`,
								executorId,
								existingItem.priceSnapshot,
							);
							await t.orderItem.update({
								where: { id: itemInput.id },
								data: { quantity: itemInput.quantity },
							});
						}
					}
				} else if (itemInput.productId && itemInput.quantity > 0) {
					// Add new item
					const product = await t.product.findUniqueOrThrow({
						where: { id: itemInput.productId },
					});

					await OrderService.adjustStock(
						t,
						itemInput.productId,
						itemInput.quantity,
						"OUT",
						"sale",
						`Bán thêm món cho đơn hàng ${orderId}`,
						executorId,
						product.price,
					);

					await t.orderItem.create({
						data: {
							orderId,
							productId: itemInput.productId,
							quantity: itemInput.quantity,
							priceSnapshot: product.price,
							costSnapshot: product.cost,
						},
					});
				}
			}

			// Recalculate order total
			const allItems = await t.orderItem.findMany({
				where: { orderId },
			});

			const newTotal = allItems.reduce(
				(sum, i) => sum + i.priceSnapshot * i.quantity,
				0,
			);

			return await t.order.update({
				where: { id: orderId },
				data: { totalAmount: newTotal },
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
			? await executeBatchUpdate(tx)
			: await prisma.$transaction(executeBatchUpdate);
	}
}
