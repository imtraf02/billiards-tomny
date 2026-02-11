import {
	BarChart3,
	ClipboardList,
	Clock,
	DollarSign,
	FileText,
	History,
	LayoutDashboard,
	Package,
	PackageCheck,
	PackageSearch,
	Receipt,
	Settings,
	Shapes,
	ShoppingCart,
	Table2,
	UserCog,
	Users,
	Warehouse,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
	navGroups: [
		{
			title: "Tổng quan",
			items: [
				{
					title: "Dashboard",
					url: "/dashboard",
					icon: LayoutDashboard,
				},
				{
					title: "Báo cáo",
					icon: BarChart3,
					items: [
						{ title: "Doanh thu", url: "/reports/revenue" },
						{ title: "Lãi/Lỗ", url: "/reports/profit" },
						{ title: "Tồn kho", url: "/reports/inventory" },
						{ title: "Bàn chơi", url: "/reports/tables" },
					],
				},
			],
		},
		{
			title: "Quản lý bàn",
			items: [
				{
					title: "Danh sách bàn",
					url: "/app/tables",
					icon: Table2,
				},
				{
					title: "Phiên chơi",
					url: "/app/sessions",
					icon: Clock,
				},
				{
					title: "Đặt bàn",
					url: "/app/reservations",
					icon: ClipboardList,
				},
			],
		},
		{
			title: "Bán hàng",
			items: [
				{
					title: "Order",
					icon: ShoppingCart,
					items: [
						{ title: "Tạo order mới", url: "/orders/new" },
						{ title: "Danh sách order", url: "/orders" },
						{ title: "Order đang xử lý", url: "/orders/pending" },
					],
				},
				{
					title: "Hóa đơn",
					url: "/bills",
					icon: Receipt,
				},
				{
					title: "Lịch sử giao dịch",
					url: "/transactions",
					icon: History,
				},
			],
		},
		{
			title: "Kho hàng",
			items: [
				{
					title: "Sản phẩm",
					icon: Package,
					url: "/app/products",
				},
				{
					title: "Danh mục sản phẩm",
					icon: Shapes,
					url: "/app/categories",
				},
				{
					title: "Lô hàng",
					icon: PackageCheck,
					url: "/app/inventory-batches",
				},
				{
					title: "Giao dịch kho",
					icon: PackageSearch,
					url: "/app/inventory-transactions",
				},
			],
		},
		{
			title: "Tài chính",
			items: [
				{
					title: "Thu chi",
					icon: DollarSign,
					items: [
						{ title: "Doanh thu", url: "/finance/revenue" },
						{ title: "Chi phí", url: "/finance/expenses" },
						{ title: "Lãi/Lỗ", url: "/finance/profit" },
					],
				},
				{
					title: "Chi phí vận hành",
					url: "/expenses",
					icon: FileText,
				},
			],
		},
		{
			title: "Quản lý",
			items: [
				{
					title: "Nhân viên",
					url: "/users",
					icon: Users,
				},
				{
					title: "Vai trò & Quyền",
					url: "/roles",
					icon: UserCog,
				},
			],
		},
		{
			title: "Hệ thống",
			items: [
				{
					title: "Cài đặt",
					icon: Settings,
					items: [
						{ title: "Cấu hình chung", url: "/settings/general" },
						{ title: "Giá bàn", url: "/settings/table-rates" },
						{ title: "Khuyến mãi", url: "/settings/promotions" },
					],
				},
			],
		},
	],
};

// Sidebar cho từng role
export const getSidebarByRole = (
	role: "ADMIN" | "STAFF" | "CUSTOMER",
): SidebarData => {
	if (role === "ADMIN") {
		return sidebarData; // Full access
	}

	if (role === "STAFF") {
		return {
			navGroups: [
				{
					title: "Tổng quan",
					items: [
						{
							title: "Dashboard",
							url: "/dashboard",
							icon: LayoutDashboard,
						},
					],
				},
				{
					title: "Quản lý bàn",
					items: [
						{
							title: "Danh sách bàn",
							url: "/tables",
							icon: Table2,
						},
						{
							title: "Phiên chơi",
							url: "/sessions",
							icon: Clock,
						},
					],
				},
				{
					title: "Bán hàng",
					items: [
						{
							title: "Order",
							icon: ShoppingCart,
							items: [
								{ title: "Tạo order mới", url: "/orders/new" },
								{ title: "Danh sách order", url: "/orders" },
							],
						},
						{
							title: "Hóa đơn",
							url: "/bills",
							icon: Receipt,
						},
					],
				},
				{
					title: "Kho hàng",
					items: [
						{
							title: "Sản phẩm",
							url: "/products",
							icon: Package,
						},
						{
							title: "Tồn kho",
							url: "/inventory",
							icon: Warehouse,
						},
					],
				},
			],
		};
	}

	// CUSTOMER - minimal access
	return {
		navGroups: [
			{
				title: "Cá nhân",
				items: [
					{
						title: "Lịch sử chơi",
						url: "/history",
						icon: History,
					},
					{
						title: "Đặt bàn",
						url: "/reservations",
						icon: ClipboardList,
					},
				],
			},
		],
	};
};
