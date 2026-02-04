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
					title: "Dashboard",
					url: "/app/dashboard",
					icon: LayoutDashboard,
				},
			],
		},
		{
			title: "Vận hành",
			items: [
				{
					title: "Quản lý bàn",
					url: "/app/tables",
					icon: Grid3x3,
				},
				{
					title: "Đặt bàn",
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
					title: "Quản lý kho",
					icon: ClipboardList,
					items: [
						{
							title: "Lịch sử nhập xuất",
							url: "/app/inventory",
						},
						{
							title: "Phân tích tồn kho",
							url: "/app/inventory/analysis",
						},
					],
				},
			],
		},
		{
			title: "Tài chính",
			items: [
				{
					title: "Giao dịch",
					url: "/app/transactions",
					icon: Receipt,
				},
				{
					title: "Báo cáo tài chính",
					url: "/app/finance",
					icon: BarChart,
				},
			],
		},
		{
			title: "Hệ thống",
			items: [
				{
					title: "Quản lý người dùng",
					url: "/app/users",
					icon: Users,
				},
				{
					title: "Cài đặt hệ thống",
					url: "/app/settings",
					icon: Settings,
				},
			],
		},
	],
};
