"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
	Clock,
	Copy,
	CreditCard,
	Eye,
	Package,
	ReceiptText,
	TableIcon,
	UserIcon,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import type {
	Booking,
	BookingTable,
	Order,
	OrderItem,
	OrderStatus,
	Product,
	Table,
} from "@/generated/prisma/browser";

type OrderWithRelations = Order & {
	user: {
		id: string;
		name: string;
	} | null;
	booking:
		| (Booking & {
				bookingTables: (BookingTable & {
					table: Table;
				})[];
		  })
		| null;
	orderItems: (OrderItem & {
		product: Product;
	})[];
};

interface OrdersListProps {
	orders: OrderWithRelations[];
	onViewDetail: (id: string) => void;
}

const STATUS_CONFIG: Record<
	OrderStatus,
	{
		label: string;
		className: string;
	}
> = {
	PENDING: {
		label: "Chờ xử lý",
		className:
			"bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
	},
	PREPARING: {
		label: "Đang chuẩn bị",
		className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
	},
	DELIVERED: {
		label: "Đã giao",
		className:
			"bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200",
	},
	COMPLETED: {
		label: "Hoàn thành",
		className:
			"bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
	},
	CANCELLED: {
		label: "Đã hủy",
		className: "",
	},
};

export function OrdersList({ orders, onViewDetail }: OrdersListProps) {
	const getStatusBadge = (status: OrderStatus) => {
		const config = STATUS_CONFIG[status];

		if (!config) {
			return <Badge variant="outline">{status}</Badge>;
		}

		if (status === "CANCELLED") {
			return <Badge variant="destructive">{config.label}</Badge>;
		}

		return (
			<Badge variant="secondary" className={config.className}>
				{config.label}
			</Badge>
		);
	};

	const formatCurrency = useMemo(() => new Intl.NumberFormat("vi-VN"), []);

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
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			{orders.map((order) => {
				const tableNames =
					order.booking?.bookingTables.map((bt) => bt.table.name).join(", ") ||
					"Khách lẻ";

				return (
					<Card
						key={order.id}
						className="relative overflow-hidden transition-all hover:shadow-md h-full flex flex-col group"
					>
						<div className="absolute top-2 right-2">
							{getStatusBadge(order.status)}
						</div>
						<CardContent>
							<Button
								variant="ghost"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									navigator.clipboard.writeText(order.id);

									toast.success("Đã sao chép ID đơn hàng");
								}}
							>
								#{order.id}
							</Button>
							<div className="space-y-3 mb-4">
								<div className="flex items-center gap-3">
									<div className="bg-muted p-2 rounded-lg">
										<UserIcon className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Người tạo</p>
										<p className="font-medium">
											{order.user?.name || "Nhân viên"}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<div className="bg-muted p-2 rounded-lg">
										<TableIcon className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Bàn</p>
										<p className="font-medium">{tableNames}</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<div className="bg-muted p-2 rounded-lg">
										<Package className="h-4 w-4" />
									</div>
									<div className="flex-1">
										<p className="text-sm text-muted-foreground">Sản phẩm</p>
										<p className="font-medium">
											{order.orderItems?.length || 0} món
										</p>
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
										{formatCurrency.format(order.totalAmount)} đ
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
				);
			})}
		</div>
	);
}
