import {
	BarChart,
	CalendarClock,
	ClipboardList,
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
	navGroups: [
		{
			title: "Tổng quan",
			items: [
				{
					title: "Bảng điều khiển",
					url: "/app/dashboard",
					icon: LayoutDashboard,
				},
			],
		},
		{
			title: "Quản lý",
			items: [
				{
					title: "Danh sách bàn",
					url: "/app/tables",
					icon: Grid3x3,
				},
				{
					title: "Lịch đặt bàn",
					url: "/app/bookings",
					icon: CalendarClock,
				},
				{
					title: "Đơn hàng",
					url: "/app/orders",
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
					url: "/app/categories",
					icon: Layers,
				},
				{
					title: "Lịch sử kho",
					url: "/app/inventory",
					icon: ClipboardList,
				},
			],
		},
		{
			title: "Tài chính",
			items: [

				{
					title: "Báo cáo",
					url: "/app/finance",
					icon: BarChart,
				},
			],
		},
		{
			title: "Hệ thống",
			items: [
				{
					title: "Người dùng",
					url: "/app/users",
					icon: Users,
				},
				{
					title: "Cài đặt",
					url: "/app/settings",
					icon: Settings,
				},
			],
		},
	],
};
