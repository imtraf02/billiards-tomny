import { startOfDay, subDays } from "date-fns";
import prisma from "@/lib/db";

export abstract class DashboardService {
	static async getMetrics() {
		const today = startOfDay(new Date());

		// 1. Revenue (From SALE and REVENUE transactions)
		const transactions = await prisma.transaction.findMany({
			where: {
				type: {
					in: ["REVENUE", "SALE"],
				},
			},
			select: { amount: true, createdAt: true },
		});

		const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
		const todayRevenue = transactions
			.filter((t) => t.createdAt >= today)
			.reduce((sum, t) => sum + t.amount, 0);

		// 2. Bookings, Orders & Inventory
		const [totalBookings, totalOrders, activeBookings, lowStockProductsRaw] =
			await Promise.all([
				prisma.booking.count(),
				prisma.order.count(),
				prisma.booking.count({
					where: {
						status: {
							in: ["PENDING", "CONFIRMED"],
						},
					},
				}),
				prisma.product.findMany({
					where: { isAvailable: true },
					select: { currentStock: true, minStock: true },
				}),
			]);

		const lowStockProducts = lowStockProductsRaw.filter(
			(p) => p.currentStock <= p.minStock,
		).length;

		// 3. Last 7 days revenue for chart
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = subDays(today, i);
			return {
				date,
				amount: 0,
			};
		}).reverse();

		for (const day of last7Days) {
			const dayStart = startOfDay(day.date);
			const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
			day.amount = transactions
				.filter((t) => t.createdAt >= dayStart && t.createdAt < dayEnd)
				.reduce((sum, t) => sum + t.amount, 0);
		}

		return {
			totalRevenue,
			todayRevenue,
			totalBookings,
			totalOrders,
			activeBookings,
			lowStockCount: lowStockProducts,
			revenueByDay: last7Days.map((d) => ({
				date: d.date.toISOString(),
				amount: d.amount,
			})),
		};
	}

	static async getRecentActivity() {
		const [bookings, orders] = await Promise.all([
			prisma.booking.findMany({
				take: 5,
				orderBy: { startTime: "desc" },
				include: {
					bookingTables: {
						include: { table: true },
					},
					user: { select: { name: true } },
				},
			}),
			prisma.order.findMany({
				take: 5,
				orderBy: { createdAt: "desc" },
				include: {
					booking: {
						include: {
							bookingTables: { include: { table: true } },
						},
					},
					user: { select: { name: true } },
				},
			}),
		]);

		return {
			recentBookings: bookings,
			recentOrders: orders,
		};
	}
}
