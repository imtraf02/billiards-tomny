import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import { BadRequestError } from "@/server/utils/errors";
import type {
	AddTableToBookingInput,
	CompleteBookingInput,
	CreateBookingInput,
	EndTableInBookingInput,
	GetBookingsQuery,
	MergeBookingInput,
	UpdateBookingInput,
} from "@/shared/schemas/booking";
import { OrderService } from "../order/service";

export abstract class BookingService {
	static async create(data: CreateBookingInput) {
		const totalAmount = 0; // Calculated later

		return await prisma.booking.create({
			data: {
				userId: data.userId,
				startTime: data.startTime,
				note: data.note,
				totalAmount,
				bookingTables: {
					create: await Promise.all(
						data.tableIds.map(async (tableId) => {
							const table = await prisma.table.findUniqueOrThrow({
								where: { id: tableId },
							});

							// Update table status
							await prisma.table.update({
								where: { id: tableId },
								data: { status: "OCCUPIED" },
							});

							return {
								tableId,
								startTime: data.startTime,
								priceSnapshot: table.hourlyRate,
							};
						}),
					),
				},
			},
			include: {
				bookingTables: {
					include: {
						table: true,
					},
				},
			},
		});
	}

	static async getAll(query: GetBookingsQuery) {
		const where: Prisma.BookingWhereInput = {};

		if (query.userId) {
			where.userId = query.userId;
		}

		if (query.status) {
			where.status = query.status;
		}

		if (query.tableId) {
			where.bookingTables = {
				some: {
					tableId: query.tableId,
				},
			};
		}

		if (query.startDate || query.endDate) {
			where.startTime = {
				gte: query.startDate,
				lte: query.endDate,
			};
		}

		const skip = (query.page - 1) * query.limit;

		const [bookings, total] = await Promise.all([
			prisma.booking.findMany({
				where,
				orderBy: {
					startTime: "desc",
				},
				include: {
					bookingTables: {
						include: {
							table: true,
						},
					},
					user: {
						select: {
							id: true,
							name: true,
						},
					},
					orders: {
						include: {
							orderItems: {
								include: {
									product: true,
								},
							},
						},
					},
				},
				skip,
				take: query.limit,
			}),
			prisma.booking.count({ where }),
		]);

		return {
			data: bookings,
			meta: {
				total,
				page: query.page,
				limit: query.limit,
				totalPages: Math.ceil(total / query.limit),
			},
		};
	}

	static async getActiveBookings() {
		return await prisma.booking.findMany({
			where: {
				status: "PENDING",
			},
			orderBy: {
				startTime: "desc",
			},
			include: {
				bookingTables: {
					include: {
						table: true,
					},
				},
				orders: {
					include: {
						orderItems: {
							include: {
								product: true,
							},
						},
					},
				},
			},
		});
	}

	static async getById(id: string) {
		return await prisma.booking.findUnique({
			where: { id },
			include: {
				bookingTables: {
					include: {
						table: true,
					},
				},
				orders: {
					include: {
						orderItems: {
							include: {
								product: true,
							},
						},
					},
				},
				user: {
					select: {
						id: true,
						name: true,
					},
				},
				transaction: true,
			},
		});
	}

	static async update(
		id: string,
		data: UpdateBookingInput,
		executorId?: string,
	) {
		if (data.status === "CANCELLED") {
			return await prisma.$transaction(async (tx) => {
				const booking = await tx.booking.findUniqueOrThrow({
					where: { id },
					include: { orders: true },
				});

				if (booking.status !== "CANCELLED") {
					// Cancel all orders associated with this booking
					for (const order of booking.orders) {
						if (order.status !== "CANCELLED") {
							await OrderService.update(
								order.id,
								{ status: "CANCELLED" },
								executorId || "system",
								tx,
							);
						}
					}
				}

				return await tx.booking.update({
					where: { id },
					data,
				});
			});
		}

		return await prisma.booking.update({
			where: { id },
			data,
		});
	}

	static async addTable(id: string, data: AddTableToBookingInput) {
		const table = await prisma.table.findUniqueOrThrow({
			where: { id: data.tableId },
		});

		// Update table status
		await prisma.table.update({
			where: { id: data.tableId },
			data: { status: "OCCUPIED" },
		});

		return await prisma.bookingTable.create({
			data: {
				bookingId: id,
				tableId: data.tableId,
				startTime: data.startTime || new Date(),
				priceSnapshot: table.hourlyRate,
			},
		});
	}

	static async endTable(data: EndTableInBookingInput) {
		const bookingTable = await prisma.bookingTable.findUniqueOrThrow({
			where: { id: data.bookingTableId },
		});

		// Update table status back to AVAILABLE
		await prisma.table.update({
			where: { id: bookingTable.tableId },
			data: { status: "AVAILABLE" },
		});

		return await prisma.bookingTable.update({
			where: { id: data.bookingTableId },
			data: {
				endTime: data.endTime || new Date(),
			},
		});
	}

	static async complete(
		id: string,
		data: CompleteBookingInput,
		executorId: string,
	) {
		return await prisma.$transaction(async (tx) => {
			const booking = await tx.booking.findUniqueOrThrow({
				where: { id },
				include: {
					bookingTables: true,
					orders: {
						include: {
							orderItems: true,
						},
					},
					transaction: true,
				},
			});

			// 0. Safety check: If already completed, just return
			if (booking.status === "COMPLETED") {
				return booking;
			}

			// 1. Process Table Session and calculate Table Total
			let tableTotal = 0;
			const endTime = data.endTime || new Date();

			for (const bt of booking.bookingTables) {
				const effectiveEndTime = bt.endTime || endTime;
				if (!bt.endTime) {
					// Update booking table end time
					await tx.bookingTable.update({
						where: { id: bt.id },
						data: { endTime: effectiveEndTime },
					});
					// Reset table status
					await tx.table.update({
						where: { id: bt.tableId },
						data: { status: "AVAILABLE" },
					});
				}

				const start = bt.startTime.getTime();
				const end = effectiveEndTime.getTime();
				const durationHours = (end - start) / (1000 * 60 * 60);
				// Làm tròn lên hàng nghìn: 31.203 => 32.000
				tableTotal +=
					Math.ceil((durationHours * bt.priceSnapshot) / 1000) * 1000;
			}

			// 2. Process Orders, calculate Order Total, update Order Status, and update Inventory
			let orderTotal = 0;

			for (const order of booking.orders) {
				console.log(
					`[BookingService.complete] Processing order ${order.id} (status: ${order.status})`,
				);
				// Only add to total if NOT cancelled or already completed (paid)
				if (order.status === "CANCELLED" || order.status === "COMPLETED") {
					continue;
				}

				orderTotal += Number(order.totalAmount);

				// Process status for PENDING/PREPARING/DELIVERED orders
				if (order.status !== "COMPLETED" && order.status !== "CANCELLED") {
					// Update order status using OrderService for consistency
					console.log(
						`[BookingService.complete] Updating order ${order.id} status to COMPLETED`,
					);
					await OrderService.update(
						order.id,
						{ status: "COMPLETED" },
						executorId,
						tx,
					);
				}
			}

			const totalAmount = tableTotal + orderTotal;

			// 3. Create or update financial transaction record
			if (booking.transaction) {
				await tx.transaction.update({
					where: { id: booking.transaction.id },
					data: {
						amount: totalAmount,
						paymentMethod: data.paymentMethod,
						userId: executorId,
						updatedAt: new Date(),
					},
				});
			} else {
				await tx.transaction.create({
					data: {
						type: "REVENUE",
						amount: totalAmount,
						paymentMethod: data.paymentMethod,
						bookingId: id,
						userId: executorId,
						description: `Thanh toán booking ${id}`,
					},
				});
			}

			// 4. Update booking final status and totals
			return await tx.booking.update({
				where: { id },
				data: {
					status: "COMPLETED",
					endTime,
					totalAmount,
				},
			});
		});
	}

	static async merge(targetId: string, data: MergeBookingInput) {
		const sourceId = data.sourceBookingId;

		if (targetId === sourceId) {
			throw new BadRequestError("Không thể gộp một booking vào chính nó");
		}

		return await prisma.$transaction(async (tx) => {
			const sourceBooking = await tx.booking.findUniqueOrThrow({
				where: { id: sourceId },
				include: {
					bookingTables: true,
					orders: {
						include: { orderItems: true },
					},
				},
			});

			const targetBooking = await tx.booking.findUniqueOrThrow({
				where: { id: targetId },
				include: {
					orders: {
						where: { status: "PENDING" },
						include: { orderItems: true },
					},
				},
			});

			if (sourceBooking.status !== "PENDING") {
				throw new BadRequestError("Booking nguồn đã hoàn thành hoặc bị hủy");
			}

			if (targetBooking.status !== "PENDING") {
				throw new BadRequestError("Booking đích đã hoàn thành hoặc bị hủy");
			}

			// 1. Calculate earliest start time
			const earliestStartTime = new Date(
				Math.min(
					sourceBooking.startTime.getTime(),
					targetBooking.startTime.getTime(),
				),
			);

			// 2. Move all table session data from source to target
			await tx.bookingTable.updateMany({
				where: { bookingId: sourceId },
				data: { bookingId: targetId },
			});

			// 3. Consolidate Pending Orders
			const sourcePendingOrder = sourceBooking.orders.find(
				(o) => o.status === "PENDING",
			);
			const targetPendingOrder = targetBooking.orders[0]; // Already filtered by status: "PENDING"

			if (sourcePendingOrder) {
				if (targetPendingOrder) {
					// Both have pending orders -> Move all items from source to target
					for (const item of sourcePendingOrder.orderItems) {
						// Check if target already has this product in its pending order
						const existingItem = targetPendingOrder.orderItems.find(
							(i) => i.productId === item.productId,
						);

						if (existingItem) {
							await tx.orderItem.update({
								where: { id: existingItem.id },
								data: {
									quantity: { increment: item.quantity },
								},
							});
						} else {
							await tx.orderItem.create({
								data: {
									orderId: targetPendingOrder.id,
									productId: item.productId,
									quantity: item.quantity,
									priceSnapshot: item.priceSnapshot,
									costSnapshot: item.costSnapshot,
								},
							});
						}
					}

					// Delete the source pending order once items are moved
					await tx.order.delete({
						where: { id: sourcePendingOrder.id },
					});

					// Recalculate target pending order total
					const finalItems = await tx.orderItem.findMany({
						where: { orderId: targetPendingOrder.id },
					});
					const newTotal = finalItems.reduce(
						(sum, i) => sum + i.priceSnapshot * i.quantity,
						0,
					);
					await tx.order.update({
						where: { id: targetPendingOrder.id },
						data: { totalAmount: newTotal },
					});
				} else {
					// Only source has a pending order -> Move it directly to target
					await tx.order.update({
						where: { id: sourcePendingOrder.id },
						data: { bookingId: targetId },
					});
				}
			}

			// 4. Move all OTHER orders (PREPARING, DELIVERED, COMPLETED, CANCELLED)
			// These are orders that aren't the sourcePendingOrder we just handled
			await tx.order.updateMany({
				where: {
					bookingId: sourceId,
					id: {
						notIn: sourcePendingOrder ? [sourcePendingOrder.id] : [],
					},
				},
				data: { bookingId: targetId },
			});

			// 5. Delete source booking
			await tx.booking.delete({
				where: { id: sourceId },
			});

			// 6. Update target booking with earliest startTime
			return await tx.booking.update({
				where: { id: targetId },
				data: { startTime: earliestStartTime },
				include: {
					bookingTables: {
						include: {
							table: true,
						},
					},
					orders: {
						include: {
							orderItems: {
								include: {
									product: true,
								},
							},
						},
					},
				},
			});
		});
	}
}
