import type { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
	AddTableToBookingInput,
	CompleteBookingInput,
	CreateBookingInput,
	EndTableInBookingInput,
	GetBookingsQuery,
	UpdateBookingInput,
} from "@/shared/schemas/booking";
import { BadRequestError } from "../../utils/errors";

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
					user: true,
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
				user: true,
				transaction: true,
			},
		});
	}

	static async update(id: string, data: UpdateBookingInput) {
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
				tableTotal += Math.ceil(durationHours * bt.priceSnapshot);
			}

			// 2. Process Orders, calculate Order Total, update Order Status, and update Inventory
			let orderTotal = 0;

			for (const order of booking.orders) {
				console.log(
					`[BookingService.complete] Processing order ${order.id} (status: ${order.status})`,
				);
				// Only add to total if NOT cancelled or already completed (paid)
				if (
					(order.status as string) === "CANCELLED" ||
					(order.status as string) === "COMPLETED"
				) {
					continue;
				}

				orderTotal += Number(order.totalAmount);

				// Process status for PENDING/PREPARING/DELIVERED orders
				if (
					(order.status as string) !== "COMPLETED" &&
					(order.status as string) !== "CANCELLED"
				) {
					// Update order status
					console.log(
						`[BookingService.complete] Updating order ${order.id} status to COMPLETED`,
					);
					await tx.order.update({
						where: { id: order.id },
						data: { status: "COMPLETED" as any },
					});
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
}
