"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
	Eye,
	ReceiptText,
	User,
	Calendar,
	CreditCard,
	Table,
	Package,
	Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface OrdersListProps {
	orders: any[];
	onViewDetail: (id: string) => void;
}

export function OrdersList({ orders, onViewDetail }: OrdersListProps) {
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return (
					<Badge
						variant="secondary"
						className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
					>
						Chờ xử lý
					</Badge>
				);
			case "PREPARING":
				return (
					<Badge
						variant="secondary"
						className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
					>
						Đang chuẩn bị
					</Badge>
				);
			case "DELIVERED":
				return (
					<Badge
						variant="secondary"
						className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200"
					>
						Đã giao
					</Badge>
				);
			case "COMPLETED":
				return (
					<Badge
						variant="secondary"
						className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
					>
						Hoàn thành
					</Badge>
				);
			case "CANCELLED":
				return <Badge variant="destructive">Đã hủy</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	const getOrderType = (order: any) => {
		if (order.items?.some((item: any) => item.type === "PRODUCT")) {
			return "Sản phẩm";
		}
		if (order.items?.some((item: any) => item.type === "SERVICE")) {
			return "Dịch vụ";
		}
		return "Hỗn hợp";
	};

	if (orders.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/10">
				<ReceiptText className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
				<p className="text-muted-foreground font-medium">
					Không tìm thấy đơn hàng nào
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{orders.map((order) => (
				<Card
					key={order.id}
					className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col"
				>
					<CardContent className="pt-6 pb-2 flex-grow">
						{/* Header */}
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<CreditCard className="h-5 w-5 text-primary" />
								<div>
									<h3 className="text-lg font-bold">#{order.id.slice(-6)}</h3>
									<p className="text-xs text-muted-foreground">
										{getOrderType(order)}
									</p>
								</div>
							</div>
							{getStatusBadge(order.status)}
						</div>

						{/* Order Info */}
						<div className="space-y-3 mb-4">
							<div className="flex items-center gap-3">
								<div className="bg-muted p-2 rounded-lg">
									<User className="h-4 w-4" />
								</div>
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Khách hàng</p>
									<p className="font-medium">{order.user?.name || "Nhân viên"}</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="bg-muted p-2 rounded-lg">
									<Table className="h-4 w-4" />
								</div>
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Bàn</p>
									<p className="font-medium">
										{order.booking?.bookingTables
											?.map((bt: any) => bt.table?.name)
											.join(", ") || "Khách lẻ"}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="bg-muted p-2 rounded-lg">
									<Package className="h-4 w-4" />
								</div>
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Sản phẩm</p>
									<p className="font-medium">{order.items?.length || 0} món</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="bg-muted p-2 rounded-lg">
									<Clock className="h-4 w-4" />
								</div>
								<div className="flex-1">
									<p className="text-sm text-muted-foreground">Thời gian</p>
									<p className="font-medium">
										{format(new Date(order.createdAt), "HH:mm - dd/MM", {
											locale: vi,
										})}
									</p>
								</div>
							</div>
						</div>

						{/* Total Amount */}
						<div className="bg-muted/30 rounded-lg p-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Tổng tiền</span>
								<span className="text-xl font-bold text-primary">
									{new Intl.NumberFormat("vi-VN").format(order.totalAmount)} đ
								</span>
							</div>
						</div>
					</CardContent>

					<CardFooter className="pt-2">
						<Button
							variant="default"
							className="w-full"
							onClick={() => onViewDetail(order.id)}
						>
							<Eye className="mr-2 h-4 w-4" />
							Xem chi tiết
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
