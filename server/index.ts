import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { auth } from "./modules/auth";
import { inventoryBatch } from "./modules/inventory-batch";
import { inventoryTransaction } from "./modules/inventory-transaction";
import { order } from "./modules/order";
import { product } from "./modules/product";
import { table } from "./modules/table";
import { errorHandler } from "./plugins/error-handler";

export const app = new Elysia({ prefix: "/api" })
	.use(cors())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Billiard Management API",
					version: "1.0.0",
					description:
						"API quản lý quán billiards - Quản lý bàn, đặt chỗ, đồ ăn/uống và thanh toán",
				},
				tags: [
					{
						name: "Auth",
						description: "Xác thực và quản lý phiên đăng nhập",
					},
					{
						name: "Tables",
						description: "Quản lý bàn billiards (Pool, Carom, Snooker)",
					},
					{
						name: "Products",
						description: "Quản lý sản phẩm đồ ăn/uống",
					},
					{
						name: "Orders",
						description: "Quản lý đơn đặt hàng",
					},
					{
						name: "Inventory Transactions",
						description: "Quản lý giao dịch kho hàng",
					},
				],
			},
		}),
	)
	.use(errorHandler)
	.use(auth)
	.use(table)
	.use(product)
	.use(order)
	.use(inventoryBatch)
	.use(inventoryTransaction);
