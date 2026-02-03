import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { auth } from "./modules/auth";
import { booking } from "./modules/booking";
import { dashboard } from "./modules/dashboard";
import { order } from "./modules/order";
import { product } from "./modules/product";
import { table } from "./modules/table";
import { transaction } from "./modules/transaction";

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
						name: "Bookings",
						description: "Quản lý đặt bàn và tính giờ chơi",
					},
					{
						name: "Orders",
						description: "Quản lý đơn hàng đồ ăn/uống",
					},
					{
						name: "Dashboard",
						description: "Thống kê và báo cáo tổng quan",
					},
				],
			},
		}),
	)
	.use(auth)
	.use(table)
	.use(product)
	.use(booking)
	.use(order)
	.use(transaction)
	.use(dashboard);

// export type App = typeof app;
