import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import { PrismaClient, Role } from "@/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Seeding database...");

	// Cleanup existing data
	await prisma.orderItem.deleteMany();
	await prisma.order.deleteMany();
	await prisma.bookingTable.deleteMany();
	await prisma.booking.deleteMany();
	await prisma.product.deleteMany();
	await prisma.category.deleteMany();
	await prisma.table.deleteMany();
	await prisma.user.deleteMany();

	// 1. Create Users with hashed passwords
	const adminPassword = await argon2.hash("password123");
	const staffPassword = await argon2.hash("password123");

	await prisma.user.create({
		data: {
			name: "Admin User",
			email: "admin@lingbilliard.com",
			phone: "0900000001",
			password: adminPassword,
			role: Role.ADMIN,
		},
	});

	await prisma.user.create({
		data: {
			name: "Staff Member",
			email: "staff@lingbilliard.com",
			phone: "0900000002",
			password: staffPassword,
			role: Role.STAFF,
		},
	});

	// Seed Tables
	await Promise.all([
		prisma.table.create({
			data: {
				name: "Bàn Pool 1",
				type: "POOL",
				hourlyRate: 50000,
				status: "AVAILABLE",
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn Pool 2",
				type: "POOL",
				hourlyRate: 50000,
				status: "AVAILABLE",
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn Snooker 1",
				type: "SNOOKER",
				hourlyRate: 80000,
				status: "AVAILABLE",
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn Carom 1",
				type: "CAROM",
				hourlyRate: 60000,
				status: "AVAILABLE",
			},
		}),
	]);

	console.log("✅ Tables seeded");

	// Seed Categories
	const categories = await Promise.all([
		prisma.category.create({
			data: { name: "Đồ uống" },
		}),
		prisma.category.create({
			data: { name: "Đồ ăn nhẹ" },
		}),
		prisma.category.create({
			data: { name: "Phụ kiện" },
		}),
	]);

	console.log("✅ Categories seeded");

	// Seed Products
	await Promise.all([
		prisma.product.create({
			data: {
				name: "Nước ngọt",
				categoryId: categories[0].id,
				price: 15000,
				description: "Coca, Pepsi, 7Up",
				isAvailable: true,
			},
		}),
		prisma.product.create({
			data: {
				name: "Nước suối",
				categoryId: categories[0].id,
				price: 10000,
				isAvailable: true,
			},
		}),
		prisma.product.create({
			data: {
				name: "Snack khoai tây",
				categoryId: categories[1].id,
				price: 20000,
				isAvailable: true,
			},
		}),
		prisma.product.create({
			data: {
				name: "Phấn bi-a",
				categoryId: categories[2].id,
				price: 5000,
				isAvailable: true,
			},
		}),
	]);

	console.log("✅ Products seeded");
	console.log("🎉 Seeding completed!");
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
