"use client";

import {
	AlertTriangle,
	CalendarClock,
	DollarSign,
	ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
	data: {
		totalRevenue: number;
		todayRevenue: number;
		totalBookings: number;
		totalOrders: number;
		activeBookings: number;
		lowStockCount: number;
	};
}

export function StatsCards({ data }: StatsCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{new Intl.NumberFormat("vi-VN").format(data.totalRevenue)} đ
					</div>
					<p className="text-xs text-muted-foreground">
						Hôm nay:{" "}
						<span className="text-green-600 font-medium">
							+{new Intl.NumberFormat("vi-VN").format(data.todayRevenue)} đ
						</span>
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Bàn Đang Hoạt Động</CardTitle>
					<CalendarClock className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.activeBookings}</div>
					<p className="text-xs text-muted-foreground">
						Tổng đơn đặt bàn: {data.totalBookings}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Đơn Hàng (Order)</CardTitle>
					<ShoppingBag className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.totalOrders}</div>
					<p className="text-xs text-muted-foreground">Tổng đơn phục vụ</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Cảnh Báo Kho</CardTitle>
					<AlertTriangle
						className={`h-4 w-4 ${data.lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"}`}
					/>
				</CardHeader>
				<CardContent>
					<div
						className={`text-2xl font-bold ${data.lowStockCount > 0 ? "text-red-600" : ""}`}
					>
						{data.lowStockCount}
					</div>
					<p className="text-xs text-muted-foreground">Sản phẩm sắp hết hàng</p>
				</CardContent>
			</Card>
		</div>
	);
}
