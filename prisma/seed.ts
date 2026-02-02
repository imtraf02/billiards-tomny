import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
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

	// Cleanup existing data (theo thứ tự dependencies)
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

	// 1. Create Users
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

	const staff2 = await prisma.user.create({
		data: {
			name: "Trần Thị B",
			phone: "0903234567",
			email: "staff2@billiard.com",
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

	// 2. Create Tables
	const tables = await Promise.all([
		// Pool Tables
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
				status: TableStatus.OCCUPIED,
			},
		}),
		prisma.table.create({
			data: {
				name: "Pool 3",
				type: TableType.POOL,
				hourlyRate: 50000,
				status: TableStatus.AVAILABLE,
			},
		}),
		// Carom Tables
		prisma.table.create({
			data: {
				name: "Carom 1",
				type: TableType.CAROM,
				hourlyRate: 60000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Carom 2",
				type: TableType.CAROM,
				hourlyRate: 60000,
				status: TableStatus.OCCUPIED,
			},
		}),
		// Snooker Tables (VIP)
		prisma.table.create({
			data: {
				name: "Snooker VIP 1",
				type: TableType.SNOOKER,
				hourlyRate: 80000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Snooker VIP 2",
				type: TableType.SNOOKER,
				hourlyRate: 80000,
				status: TableStatus.MAINTENANCE,
			},
		}),
	]);

	console.log("📦 Creating categories and products...");

	// 3. Create Categories
	const beverageCategory = await prisma.category.create({
		data: { name: "Đồ uống" },
	});

	const snackCategory = await prisma.category.create({
		data: { name: "Đồ ăn vặt" },
	});

	const equipmentCategory = await prisma.category.create({
		data: { name: "Phụ kiện bi-a" },
	});

	// 4. Create Products
	const products = await Promise.all([
		// Đồ uống
		prisma.product.create({
			data: {
				categoryId: beverageCategory.id,
				name: "Coca Cola",
				price: 15000,
				cost: 8000,
				currentStock: 50,
				minStock: 10,
				unit: "lon",
				description: "Lon 330ml",
			},
		}),
		prisma.product.create({
			data: {
				categoryId: beverageCategory.id,
				name: "Pepsi",
				price: 15000,
				cost: 8000,
				currentStock: 45,
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
				currentStock: 60,
				minStock: 15,
				unit: "lon",
			},
		}),
		prisma.product.create({
			data: {
				categoryId: beverageCategory.id,
				name: "Nước suối",
				price: 8000,
				cost: 4000,
				currentStock: 100,
				minStock: 20,
				unit: "chai",
			},
		}),
		prisma.product.create({
			data: {
				categoryId: beverageCategory.id,
				name: "Café đá",
				price: 20000,
				cost: 8000,
				currentStock: 30,
				minStock: 5,
				unit: "ly",
			},
		}),
		// Đồ ăn vặt
		prisma.product.create({
			data: {
				categoryId: snackCategory.id,
				name: "Snack khoai tây",
				price: 15000,
				cost: 9000,
				currentStock: 40,
				minStock: 10,
				unit: "gói",
			},
		}),
		prisma.product.create({
			data: {
				categoryId: snackCategory.id,
				name: "Bánh quy",
				price: 12000,
				cost: 7000,
				currentStock: 35,
				minStock: 8,
				unit: "gói",
			},
		}),
		prisma.product.create({
			data: {
				categoryId: snackCategory.id,
				name: "Mì tôm",
				price: 18000,
				cost: 8000,
				currentStock: 25,
				minStock: 10,
				unit: "tô",
			},
		}),
		// Phụ kiện
		prisma.product.create({
			data: {
				categoryId: equipmentCategory.id,
				name: "Phấn bi-a",
				price: 10000,
				cost: 5000,
				currentStock: 20,
				minStock: 5,
				unit: "viên",
			},
		}),
		prisma.product.create({
			data: {
				categoryId: equipmentCategory.id,
				name: "Găng tay bi-a",
				price: 50000,
				cost: 25000,
				currentStock: 10,
				minStock: 3,
				unit: "đôi",
			},
		}),
	]);

	console.log("📝 Creating inventory logs (nhập kho)...");

	// 5. Create Inventory Logs (Nhập kho ban đầu)
	for (const product of products) {
		await prisma.inventoryLog.create({
			data: {
				productId: product.id,
				userId: admin.id,
				type: "IN",
				quantity: product.currentStock,
				unitCost: product.cost!,
				reason: "purchase",
				note: "Nhập hàng đầu kỳ",
				stockBefore: 0,
				stockAfter: product.currentStock,
			},
		});
	}

	console.log("🎮 Creating bookings...");

	// 6. Create Bookings
	const now = new Date();
	const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
	const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

	// Booking 1: Đang chơi - 2 bàn Pool (gộp bill)
	const booking1 = await prisma.booking.create({
		data: {
			userId: customer1.id,
			startTime: twoHoursAgo,
			status: BookingStatus.CONFIRMED,
			note: "Gộp 2 bàn",
			bookingTables: {
				create: [
					{
						tableId: tables[1].id, // Pool 2
						startTime: twoHoursAgo,
						priceSnapshot: 50000,
					},
					{
						tableId: tables[4].id, // Carom 2
						startTime: oneHourAgo, // Thêm bàn sau 1 tiếng
						priceSnapshot: 60000,
					},
				],
			},
		},
	});

	// Booking 2: Đã hoàn thành
	const yesterdayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const yesterdayEnd = new Date(yesterdayStart.getTime() + 3 * 60 * 60 * 1000);

	const booking2 = await prisma.booking.create({
		data: {
			userId: customer2.id,
			startTime: yesterdayStart,
			endTime: yesterdayEnd,
			status: BookingStatus.COMPLETED,
			totalAmount: 150000,
			bookingTables: {
				create: [
					{
						tableId: tables[0].id, // Pool 1
						startTime: yesterdayStart,
						endTime: yesterdayEnd,
						priceSnapshot: 50000,
					},
				],
			},
		},
	});

	// Booking 3: Đã hủy
	const booking3 = await prisma.booking.create({
		data: {
			userId: customer1.id,
			startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
			status: BookingStatus.CANCELLED,
			note: "Khách hủy phút chót",
			bookingTables: {
				create: [
					{
						tableId: tables[5].id, // Snooker VIP 1
						startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000),
						priceSnapshot: 80000,
					},
				],
			},
		},
	});

	console.log("🛒 Creating orders...");

	// 7. Create Orders
	// Order cho booking 1 (đang chơi)
	const order1 = await prisma.order.create({
		data: {
			bookingId: booking1.id,
			userId: customer1.id,
			status: OrderStatus.DELIVERED,
			totalAmount: 62000,
			orderItems: {
				create: [
					{
						productId: products[0].id, // Coca Cola
						quantity: 2,
						priceSnapshot: 15000,
						costSnapshot: 8000,
					},
					{
						productId: products[4].id, // Café đá
						quantity: 1,
						priceSnapshot: 20000,
						costSnapshot: 8000,
					},
					{
						productId: products[5].id, // Snack
						quantity: 2,
						priceSnapshot: 15000,
						costSnapshot: 9000,
					},
				],
			},
		},
	});

	// Order cho booking 2 (đã hoàn thành)
	const order2 = await prisma.order.create({
		data: {
			bookingId: booking2.id,
			userId: customer2.id,
			status: OrderStatus.DELIVERED,
			totalAmount: 50000,
			orderItems: {
				create: [
					{
						productId: products[1].id, // Pepsi
						quantity: 2,
						priceSnapshot: 15000,
						costSnapshot: 8000,
					},
					{
						productId: products[3].id, // Nước suối
						quantity: 2,
						priceSnapshot: 8000,
						costSnapshot: 4000,
					},
					{
						productId: products[8].id, // Phấn
						quantity: 1,
						priceSnapshot: 10000,
						costSnapshot: 5000,
					},
				],
			},
		},
	});

	// Order takeaway (không có booking)
	const order3 = await prisma.order.create({
		data: {
			userId: customer1.id,
			status: OrderStatus.DELIVERED,
			totalAmount: 35000,
			orderItems: {
				create: [
					{
						productId: products[2].id, // Sting
						quantity: 2,
						priceSnapshot: 12000,
						costSnapshot: 7000,
					},
					{
						productId: products[6].id, // Bánh quy
						quantity: 1,
						priceSnapshot: 12000,
						costSnapshot: 7000,
					},
				],
			},
		},
	});

	console.log("📊 Creating inventory logs (xuất kho khi bán)...");

	// 8. Update Inventory và tạo logs cho các đơn hàng
	// Order 1
	await updateInventoryForOrder(order1.id, staff1.id);
	// Order 2
	await updateInventoryForOrder(order2.id, staff1.id);
	// Order 3
	await updateInventoryForOrder(order3.id, staff2.id);

	console.log("💰 Creating transactions...");

	// 9. Create Transactions
	// Transaction cho booking 2 (đã thanh toán)
	await prisma.transaction.create({
		data: {
			type: TransactionType.SALE,
			amount: 200000, // 150000 (bàn) + 50000 (order)
			paymentMethod: PaymentMethod.CASH,
			description: "Thanh toán booking #" + booking2.id,
			bookingId: booking2.id,
			userId: staff1.id,
		},
	});

	// Transaction cho order takeaway
	await prisma.transaction.create({
		data: {
			type: TransactionType.SALE,
			amount: 35000,
			paymentMethod: PaymentMethod.MOMO,
			description: "Bán hàng mang đi",
			orderId: order3.id,
			userId: staff2.id,
		},
	});

	// Transaction nhập hàng
	await prisma.transaction.create({
		data: {
			type: TransactionType.PURCHASE,
			amount: 5000000,
			paymentMethod: PaymentMethod.TRANSFER,
			description: "Nhập hàng đầu kỳ",
			userId: admin.id,
		},
	});

	// Transaction chi phí khác
	await prisma.transaction.create({
		data: {
			type: TransactionType.EXPENSE,
			amount: 3000000,
			paymentMethod: PaymentMethod.CASH,
			description: "Tiền điện tháng 1",
			userId: admin.id,
		},
	});

	await prisma.transaction.create({
		data: {
			type: TransactionType.EXPENSE,
			amount: 500000,
			paymentMethod: PaymentMethod.CASH,
			description: "Tiền nước tháng 1",
			userId: admin.id,
		},
	});

	console.log("📈 Creating monthly report...");

	// 10. Create Monthly Report (tháng 1/2025)
	await prisma.monthlyReport.create({
		data: {
			year: 2025,
			month: 1,
			totalRevenue: 235000, // 200000 + 35000
			tableRevenue: 150000,
			productRevenue: 85000,
			totalExpense: 8500000, // 5000000 + 3000000 + 500000
			purchaseExpense: 5000000,
			otherExpense: 3500000,
			netProfit: -8265000, // Lỗ tháng đầu
			productsSold: 15,
		},
	});

	console.log("✅ Seeding completed successfully!");
	console.log("\n📊 Summary:");
	console.log(`- Users: ${await prisma.user.count()}`);
	console.log(`- Tables: ${await prisma.table.count()}`);
	console.log(`- Products: ${await prisma.product.count()}`);
	console.log(`- Bookings: ${await prisma.booking.count()}`);
	console.log(`- Orders: ${await prisma.order.count()}`);
	console.log(`- Transactions: ${await prisma.transaction.count()}`);
	console.log(`- Inventory Logs: ${await prisma.inventoryLog.count()}`);
	console.log("\n🔑 Login credentials:");
	console.log("Admin: 0901234567 / admin123");
	console.log("Staff: 0902234567 / staff123");
	console.log("Customer: 0904234567 / customer123");
}

// Helper function để update inventory khi bán hàng
async function updateInventoryForOrder(orderId: string, staffId: string) {
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		include: { orderItems: true },
	});

	if (!order) return;

	for (const item of order.orderItems) {
		const product = await prisma.product.findUnique({
			where: { id: item.productId },
		});

		if (!product) continue;

		const newStock = product.currentStock - item.quantity;

		// Update product stock
		await prisma.product.update({
			where: { id: product.id },
			data: { currentStock: newStock },
		});

		// Create inventory log
		await prisma.inventoryLog.create({
			data: {
				productId: product.id,
				userId: staffId,
				type: "OUT",
				quantity: -item.quantity,
				reason: "sale",
				note: `Bán hàng - Order #${orderId}`,
				stockBefore: product.currentStock,
				stockAfter: newStock,
			},
		});
	}
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
