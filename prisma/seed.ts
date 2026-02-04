import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import { format } from "date-fns";
import {
	BookingStatus,
	OrderStatus,
	PaymentMethod,
	PrismaClient,
	Role,
	TableStatus,
	TableType,
	TransactionType,
} from "@/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🗑️  Cleaning up existing data...");

	await prisma.monthlyReport.deleteMany();
	await prisma.transaction.deleteMany();
	await prisma.inventoryLog.deleteMany();
	await prisma.orderItem.deleteMany();
	await prisma.order.deleteMany();
	await prisma.bookingTable.deleteMany();
	await prisma.booking.deleteMany();
	await prisma.product.deleteMany();
	await prisma.category.deleteMany();
	await prisma.table.deleteMany();
	await prisma.user.deleteMany();

	console.log("👥 Creating users...");

	const adminPassword = await argon2.hash("admin123");
	const staffPassword = await argon2.hash("staff123");
	const customerPassword = await argon2.hash("customer123");

	const admin = await prisma.user.create({
		data: {
			name: "Admin",
			phone: "0901234567",
			email: "admin@billiard.com",
			password: adminPassword,
			role: Role.ADMIN,
		},
	});

	const staff1 = await prisma.user.create({
		data: {
			name: "Nguyễn Văn A",
			phone: "0902234567",
			email: "staff1@billiard.com",
			password: staffPassword,
			role: Role.STAFF,
		},
	});

	const customer1 = await prisma.user.create({
		data: {
			name: "Khách Hàng 1",
			phone: "0904234567",
			email: "customer1@gmail.com",
			password: customerPassword,
			role: Role.CUSTOMER,
		},
	});

	const customer2 = await prisma.user.create({
		data: {
			name: "Khách Hàng 2",
			phone: "0905234567",
			password: customerPassword,
			role: Role.CUSTOMER,
		},
	});

	console.log("🎱 Creating tables...");

	const tables = await Promise.all([
		prisma.table.create({
			data: {
				name: "Pool 1",
				type: TableType.POOL,
				hourlyRate: 50000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Pool 2",
				type: TableType.POOL,
				hourlyRate: 50000,
				status: TableStatus.AVAILABLE,
			},
		}),
	]);

	console.log("📦 Creating categories and products...");

	const beverageCategory = await prisma.category.create({
		data: { name: "Đồ uống" },
	});

	const snackCategory = await prisma.category.create({
		data: { name: "Đồ ăn vặt" },
	});

	const products = await Promise.all([
		prisma.product.create({
			data: {
				categoryId: beverageCategory.id,
				name: "Coca Cola",
				price: 15000,
				cost: 8000,
				currentStock: 0,
				minStock: 10,
				unit: "lon",
				description: "Lon 330ml",
			},
		}),
		prisma.product.create({
			data: {
				categoryId: beverageCategory.id,
				name: "Sting",
				price: 12000,
				cost: 7000,
				currentStock: 0,
				minStock: 15,
				unit: "lon",
			},
		}),
		prisma.product.create({
			data: {
				categoryId: snackCategory.id,
				name: "Snack khoai tây",
				price: 15000,
				cost: 9000,
				currentStock: 0,
				minStock: 10,
				unit: "gói",
			},
		}),
	]);

	console.log("📝 Generating logs for the last 30 days...");

	const now = new Date();

	for (let i = 30; i >= 0; i--) {
		const targetDate = new Date();
		targetDate.setDate(now.getDate() - i);
		targetDate.setHours(12, 0, 0, 0);

		console.log(`📅 Processing: ${format(targetDate, "yyyy-MM-dd")}`);

		// 1. Weekly restock (every 7 days)
		if (i % 7 === 0) {
			for (const product of products) {
				const importQuantity = 30 + Math.floor(Math.random() * 20);
				const cost = product.cost || 8000;
				
				const currentProduct = await prisma.product.findUnique({ where: { id: product.id } });
				const stockBefore = currentProduct?.currentStock || 0;
				const stockAfter = stockBefore + importQuantity;

				await prisma.inventoryLog.create({
					data: {
						productId: product.id,
						userId: admin.id,
						type: "IN",
						quantity: importQuantity,
						costSnapshot: cost,
						priceSnapshot: 0,
						reason: "purchase",
						note: "Nhập hàng định kỳ",
						stockBefore,
						stockAfter,
						createdAt: targetDate,
					},
				});

				await prisma.product.update({
					where: { id: product.id },
					data: { currentStock: stockAfter },
				});
				
				await prisma.transaction.create({
					data: {
						type: TransactionType.PURCHASE,
						amount: importQuantity * cost,
						paymentMethod: PaymentMethod.TRANSFER,
						description: `Nhập hàng ${product.name}`,
						userId: admin.id,
						createdAt: targetDate,
					},
				});
			}
		}

		// 2. Daily sales
		const numOrders = 3 + Math.floor(Math.random() * 8);
		for (let j = 0; j < numOrders; j++) {
			const orderTime = new Date(targetDate);
			orderTime.setHours(14 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

			const numItems = 1 + Math.floor(Math.random() * 2);
			let totalAmount = 0;
			const orderItemsData = [];

			for (let k = 0; k < numItems; k++) {
				const product = products[Math.floor(Math.random() * products.length)];
				const quantity = 1 + Math.floor(Math.random() * 3);
				const price = product.price;
				const cost = product.cost || 0;

				const currentProduct = await prisma.product.findUnique({ where: { id: product.id } });
				const stockBefore = currentProduct?.currentStock || 0;
				
				if (stockBefore >= quantity) {
					const stockAfter = stockBefore - quantity;
					
					await prisma.product.update({
						where: { id: product.id },
						data: { currentStock: stockAfter },
					});

					await prisma.inventoryLog.create({
						data: {
							productId: product.id,
							userId: staff1.id,
							type: "OUT",
							quantity,
							costSnapshot: cost,
							priceSnapshot: price,
							reason: "sale",
							note: "Bán hàng",
							stockBefore,
							stockAfter,
							createdAt: orderTime,
						},
					});

					orderItemsData.push({
						productId: product.id,
						quantity,
						priceSnapshot: price,
						costSnapshot: cost,
					});
					totalAmount += price * quantity;
				}
			}

			if (orderItemsData.length > 0) {
				const order = await prisma.order.create({
					data: {
						userId: Math.random() > 0.5 ? customer1.id : customer2.id,
						status: OrderStatus.COMPLETED,
						totalAmount,
						createdAt: orderTime,
						orderItems: {
							create: orderItemsData,
						},
					},
				});

				await prisma.transaction.create({
					data: {
						type: TransactionType.SALE,
						amount: totalAmount,
						paymentMethod: PaymentMethod.CASH,
						description: `Thanh toán hóa đơn #${order.id}`,
						orderId: order.id,
						userId: staff1.id,
						createdAt: orderTime,
					},
				});
			}
		}
	}

	console.log("✅ Seeding completed successfully!");
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
