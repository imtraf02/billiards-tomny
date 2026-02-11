import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import {
	PrismaClient,
	Role,
	TableStatus,
	TableType,
} from "@/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🗑️  Cleaning up existing data...");

	await prisma.batchSale.deleteMany();
	await prisma.orderProduct.deleteMany();
	await prisma.order.deleteMany();
	await prisma.billDiscount.deleteMany();
	await prisma.bill.deleteMany();
	await prisma.tableSession.deleteMany();
	await prisma.inventoryTransaction.deleteMany();
	await prisma.inventoryBatch.deleteMany();
	await prisma.product.deleteMany();
	await prisma.category.deleteMany();
	await prisma.expense.deleteMany();
	await prisma.table.deleteMany();
	await prisma.user.deleteMany();

	console.log("Creating users...");

	const adminPassword = await argon2.hash("admin123");
	const staffPassword = await argon2.hash("staff123");

	const admin = await prisma.user.create({
		data: {
			name: "Quản trị viên",
			phone: "0901234567",
			email: "admin@billiard.com",
			password: adminPassword,
			role: Role.ADMIN,
		},
	});

	const staff = await prisma.user.create({
		data: {
			name: "Nguyễn Văn An",
			phone: "0902234567",
			email: "staff1@billiard.com",
			password: staffPassword,
			role: Role.STAFF,
		},
	});

	console.log("Creating tables...");

	const tables = await Promise.all([
		// Pool tables
		prisma.table.create({
			data: {
				name: "Bàn 1",
				type: TableType.POOL,
				hourlyRate: 50000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn 2",
				type: TableType.POOL,
				hourlyRate: 50000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn 3",
				type: TableType.POOL,
				hourlyRate: 50000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn 4",
				type: TableType.POOL,
				hourlyRate: 50000,
				status: TableStatus.AVAILABLE,
			},
		}),
		// Carom tables
		prisma.table.create({
			data: {
				name: "Bàn 5",
				type: TableType.CAROM,
				hourlyRate: 60000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn 6",
				type: TableType.CAROM,
				hourlyRate: 60000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn 7",
				type: TableType.CAROM,
				hourlyRate: 60000,
				status: TableStatus.AVAILABLE,
			},
		}),
		// Snooker tables (VIP)
		prisma.table.create({
			data: {
				name: "Bàn 8",
				type: TableType.SNOOKER,
				hourlyRate: 80000,
				status: TableStatus.AVAILABLE,
			},
		}),
		prisma.table.create({
			data: {
				name: "Bàn 9",
				type: TableType.SNOOKER,
				hourlyRate: 80000,
				status: TableStatus.AVAILABLE,
			},
		}),
	]);

	console.log("📦 Creating categories...");

	// Tạo danh mục
	const beverageCategory = await prisma.category.create({
		data: { name: "Nước giải khát", description: "Các loại nước uống" },
	});

	const snackCategory = await prisma.category.create({
		data: { name: "Đồ ăn vặt", description: "Snack và bánh kẹo" },
	});

	const alcoholCategory = await prisma.category.create({
		data: { name: "Bia & Rượu", description: "Đồ uống có cồn" },
	});

	const instantFoodCategory = await prisma.category.create({
		data: { name: "Đồ ăn nhanh", description: "Món ăn sẵn" },
	});

	const accessoryCategory = await prisma.category.create({
		data: { name: "Phụ kiện Billiard", description: "Phụ kiện chơi bi-a" },
	});

	console.log("🛍️  Creating products with inventory...");

	// Helper function để tạo sản phẩm + lô hàng
	async function createProductWithStock(data: {
		categoryId: string;
		name: string;
		price: number;
		cost: number;
		stock: number;
		minStock: number;
		unit: string;
		description: string;
	}) {
		const product = await prisma.product.create({
			data: {
				categoryId: data.categoryId,
				name: data.name,
				price: data.price,
				minStock: data.minStock,
				unit: data.unit,
				description: data.description,
			},
		});

		// Nếu có stock ban đầu → Tạo lô hàng + transaction
		if (data.stock > 0) {
			await prisma.inventoryBatch.create({
				data: {
					productId: product.id,
					quantity: data.stock,
					costPerUnit: data.cost,
					userId: admin.id,
				},
			});

			await prisma.inventoryTransaction.create({
				data: {
					productId: product.id,
					type: "IMPORT",
					quantity: data.stock,
					cost: data.cost,
					note: "Nhập kho ban đầu",
					userId: admin.id,
				},
			});
		}

		return product;
	}

	// Tạo sản phẩm với stock
	const products = await Promise.all([
		// Nước giải khát
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "Coca Cola",
			price: 15000,
			cost: 8000,
			stock: 100,
			minStock: 20,
			unit: "lon",
			description: "Lon 330ml",
		}),
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "Pepsi",
			price: 15000,
			cost: 8000,
			stock: 80,
			minStock: 20,
			unit: "lon",
			description: "Lon 330ml",
		}),
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "Sting Dâu",
			price: 12000,
			cost: 7000,
			stock: 90,
			minStock: 25,
			unit: "lon",
			description: "Lon 330ml",
		}),
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "Red Bull",
			price: 18000,
			cost: 10000,
			stock: 60,
			minStock: 15,
			unit: "lon",
			description: "Lon 250ml",
		}),
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "Nước suối Aquafina",
			price: 8000,
			cost: 4000,
			stock: 120,
			minStock: 30,
			unit: "chai",
			description: "Chai 500ml",
		}),
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "7Up",
			price: 15000,
			cost: 8000,
			stock: 70,
			minStock: 20,
			unit: "lon",
			description: "Lon 330ml",
		}),
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "Trà xanh 0 độ",
			price: 10000,
			cost: 6000,
			stock: 85,
			minStock: 25,
			unit: "chai",
			description: "Chai 350ml",
		}),
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "Café đen đá",
			price: 20000,
			cost: 8000,
			stock: 50,
			minStock: 10,
			unit: "ly",
			description: "Pha tại chỗ",
		}),
		createProductWithStock({
			categoryId: beverageCategory.id,
			name: "Café sữa đá",
			price: 22000,
			cost: 9000,
			stock: 50,
			minStock: 10,
			unit: "ly",
			description: "Pha tại chỗ",
		}),

		// Đồ ăn vặt
		createProductWithStock({
			categoryId: snackCategory.id,
			name: "Snack khoai tây Ostar",
			price: 15000,
			cost: 9000,
			stock: 60,
			minStock: 20,
			unit: "gói",
			description: "Gói 48g",
		}),
		createProductWithStock({
			categoryId: snackCategory.id,
			name: "Snack Poca",
			price: 12000,
			cost: 7000,
			stock: 70,
			minStock: 20,
			unit: "gói",
			description: "Gói 40g",
		}),
		createProductWithStock({
			categoryId: snackCategory.id,
			name: "Bánh quy Cosy",
			price: 18000,
			cost: 11000,
			stock: 50,
			minStock: 15,
			unit: "gói",
			description: "Gói 120g",
		}),
		createProductWithStock({
			categoryId: snackCategory.id,
			name: "Hạt điều rang muối",
			price: 35000,
			cost: 22000,
			stock: 40,
			minStock: 10,
			unit: "gói",
			description: "Gói 100g",
		}),
		createProductWithStock({
			categoryId: snackCategory.id,
			name: "Kẹo cao su Dynamite",
			price: 8000,
			cost: 4500,
			stock: 80,
			minStock: 25,
			unit: "vỉ",
			description: "Vỉ 5 viên",
		}),
		createProductWithStock({
			categoryId: snackCategory.id,
			name: "Socola KitKat",
			price: 12000,
			cost: 7500,
			stock: 55,
			minStock: 15,
			unit: "thanh",
			description: "Thanh 41.5g",
		}),

		// Bia & Rượu
		createProductWithStock({
			categoryId: alcoholCategory.id,
			name: "Bia Heineken",
			price: 25000,
			cost: 15000,
			stock: 120,
			minStock: 30,
			unit: "lon",
			description: "Lon 330ml",
		}),
		createProductWithStock({
			categoryId: alcoholCategory.id,
			name: "Bia Tiger",
			price: 22000,
			cost: 13000,
			stock: 110,
			minStock: 30,
			unit: "lon",
			description: "Lon 330ml",
		}),
		createProductWithStock({
			categoryId: alcoholCategory.id,
			name: "Bia Sapporo",
			price: 28000,
			cost: 17000,
			stock: 80,
			minStock: 20,
			unit: "lon",
			description: "Lon 330ml",
		}),
		createProductWithStock({
			categoryId: alcoholCategory.id,
			name: "Bia Budweiser",
			price: 30000,
			cost: 18000,
			stock: 75,
			minStock: 20,
			unit: "lon",
			description: "Lon 330ml",
		}),
		createProductWithStock({
			categoryId: alcoholCategory.id,
			name: "Rượu Vodka Smirnoff",
			price: 450000,
			cost: 320000,
			stock: 15,
			minStock: 5,
			unit: "chai",
			description: "Chai 700ml",
		}),

		// Đồ ăn nhanh
		createProductWithStock({
			categoryId: instantFoodCategory.id,
			name: "Mì tôm hảo hảo",
			price: 25000,
			cost: 12000,
			stock: 45,
			minStock: 15,
			unit: "tô",
			description: "Pha sẵn",
		}),
		createProductWithStock({
			categoryId: instantFoodCategory.id,
			name: "Xúc xích nướng",
			price: 30000,
			cost: 15000,
			stock: 35,
			minStock: 10,
			unit: "phần",
			description: "2 cây",
		}),
		createProductWithStock({
			categoryId: instantFoodCategory.id,
			name: "Khoai tây chiên",
			price: 35000,
			cost: 18000,
			stock: 30,
			minStock: 10,
			unit: "phần",
			description: "Size M",
		}),
		createProductWithStock({
			categoryId: instantFoodCategory.id,
			name: "Gà rán",
			price: 45000,
			cost: 25000,
			stock: 25,
			minStock: 8,
			unit: "phần",
			description: "3 miếng",
		}),
		createProductWithStock({
			categoryId: instantFoodCategory.id,
			name: "Bánh mì pate",
			price: 20000,
			cost: 10000,
			stock: 40,
			minStock: 10,
			unit: "ổ",
			description: "Bánh mì Sài Gòn",
		}),

		// Phụ kiện Billiard
		createProductWithStock({
			categoryId: accessoryCategory.id,
			name: "Phấn bi xanh",
			price: 15000,
			cost: 8000,
			stock: 100,
			minStock: 30,
			unit: "viên",
			description: "Phấn chống trơn",
		}),
		createProductWithStock({
			categoryId: accessoryCategory.id,
			name: "Găng tay bi-a",
			price: 45000,
			cost: 25000,
			stock: 50,
			minStock: 15,
			unit: "chiếc",
			description: "Size M/L",
		}),
		createProductWithStock({
			categoryId: accessoryCategory.id,
			name: "Cơ bi-a cơ bản",
			price: 280000,
			cost: 180000,
			stock: 20,
			minStock: 5,
			unit: "cây",
			description: "Cơ gỗ 140cm",
		}),
	]);

	console.log("✅ Seed completed successfully!");
	console.log(`📊 Summary:`);
	console.log(`   - Users: 2 (1 Admin, 1 Staff)`);
	console.log(`   - Tables: ${tables.length}`);
	console.log(`   - Categories: 5`);
	console.log(`   - Products: ${products.length}`);
	console.log(`   - Inventory Batches: ${products.length}`);
	console.log(`   - Inventory Transactions: ${products.length}`);
}

main()
	.catch((e) => {
		console.error("❌ Error seeding database:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
