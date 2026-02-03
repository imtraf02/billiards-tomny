"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface OrdersListProps {
	orders: any[];
	onViewDetail: (id: string) => void;
}

export function OrdersList({ orders, onViewDetail }: OrdersListProps) {
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Chờ xử lý</Badge>;
			case "PREPARING":
				return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Đang chuẩn bị</Badge>;
			case "DELIVERED":
				return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">Đã giao</Badge>;
			case "COMPLETED":
				return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Hoàn thành</Badge>;
			case "CANCELLED":
				return <Badge variant="destructive">Đã hủy</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (orders.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/10">
				<ReceiptText className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
				<p className="text-muted-foreground font-medium">Không tìm thấy đơn hàng nào</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border bg-white overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[120px]">Mã đơn</TableHead>
						<TableHead>Khách hàng / Bàn</TableHead>
						<TableHead className="text-right">Tổng tiền</TableHead>
						<TableHead className="text-center">Trạng thái</TableHead>
						<TableHead>Thời gian</TableHead>
						<TableHead className="w-[100px] text-right">Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{orders.map((order) => (
						<TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewDetail(order.id)}>
							<TableCell className="font-medium font-mono text-xs uppercase">
								#{order.id.slice(-6)}
							</TableCell>
							<TableCell>
								<div className="flex flex-col">
									<span className="font-medium">
										{order.booking?.bookingTables?.map((bt: any) => bt.table?.name).join(", ") || "Khách lẻ"}
									</span>
									<span className="text-xs text-muted-foreground">
										{order.user?.name || "Nhân viên"}
									</span>
								</div>
							</TableCell>
							<TableCell className="text-right font-bold text-primary">
								{new Intl.NumberFormat("vi-VN").format(order.totalAmount)} đ
							</TableCell>
							<TableCell className="text-center">
								{getStatusBadge(order.status)}
							</TableCell>
							<TableCell className="text-muted-foreground text-sm">
								{format(new Date(order.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
							</TableCell>
							<TableCell className="text-right">
								<Button size="icon" variant="ghost" onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetail(order.id);
                                }}>
									<Eye className="h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
