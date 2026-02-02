import {
	BarChart,
	CalendarClock,
	ClipboardList,
	Command,
	Grid3x3,
	Layers,
	LayoutDashboard,
	Package,
	Receipt,
	Settings,
	ShoppingCart,
	Users,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
	user: {
		name: "Admin",
		email: "admin@tomny.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Tomny Billiards",
			logo: Command,
			plan: "Pro",
		},
	],
	navGroups: [
		{
			title: "Tổng quan",
			items: [
				{
					title: "Bảng điều khiển",
					url: "/",
					icon: LayoutDashboard,
				},
			],
		},
		{
			title: "Quản lý",
			items: [
				{
					title: "Danh sách bàn",
					url: "/tables",
					icon: Grid3x3,
				},
				{
					title: "Lịch đặt bàn",
					url: "/bookings",
					icon: CalendarClock,
				},
				{
					title: "Đơn hàng",
					url: "/orders",
					icon: ShoppingCart,
				},
			],
		},
		{
			title: "Kho hàng",
			items: [
				{
					title: "Sản phẩm",
					url: "/app/products",
					icon: Package,
				},
				{
					title: "Danh mục",
					url: "/categories",
					icon: Layers,
				},
				{
					title: "Lịch sử kho",
					url: "/inventory-logs",
					icon: ClipboardList,
				},
			],
		},
		{
			title: "Tài chính",
			items: [
				{
					title: "Giao dịch",
					url: "/transactions",
					icon: Receipt,
				},
				{
					title: "Báo cáo",
					url: "/reports",
					icon: BarChart,
				},
			],
		},
		{
			title: "Hệ thống",
			items: [
				{
					title: "Người dùng",
					url: "/users",
					icon: Users,
				},
				{
					title: "Cài đặt",
					url: "/settings",
					icon: Settings,
				},
			],
		},
	],
};
