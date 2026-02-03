"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
	CheckCircle2,
	FileText,
	Loader2,
	MoreHorizontal,
	Package,
	Receipt,
	Truck,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUpdateOrder } from "@/features/order/hooks/use-order";
import { api } from "@/lib/eden";

interface OrderDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orderId: string | null;
}

export function OrderDetailDialog({
	open,
	onOpenChange,
	orderId,
}: OrderDetailDialogProps) {
	const { data: order, isLoading } = useQuery({
		queryKey: ["orders", orderId],
		queryFn: async () => {
			if (!orderId) return null;
			const res = await api.orders({ id: orderId }).get();
			if (res.error) throw res.error;
			return res.data;
		},
		enabled: !!orderId && open,
	});

	const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrder(() => {
		toast.success("Cập nhật trạng thái thành công");
	});

	const handleUpdateStatus = (
		status: "PENDING" | "PREPARING" | "DELIVERED" | "COMPLETED" | "CANCELLED",
	) => {
		if (!orderId) return;
		updateStatus({ id: orderId, data: { status } });
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "PENDING":
				return <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />;
			case "PREPARING":
				return <Package className="h-4 w-4 text-blue-600" />;
			case "DELIVERED":
				return <Truck className="h-4 w-4 text-purple-600" />;
			case "COMPLETED":
				return <CheckCircle2 className="h-4 w-4 text-green-600" />;
			case "CANCELLED":
				return <XCircle className="h-4 w-4 text-red-600" />;
			default:
				return null;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "PENDING":
				return "Chờ xử lý";
			case "PREPARING":
				return "Đang chuẩn bị";
			case "DELIVERED":
				return "Đã giao";
			case "COMPLETED":
				return "Hoàn thành";
			case "CANCELLED":
				return "Đã hủy";
			default:
				return status;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<div className="flex items-center justify-between mb-2 min-h-[24px]">
						{order && (
							<Badge variant="outline" className="font-mono uppercase">
								#{order.id.slice(-8)}
							</Badge>
						)}
						{order && (
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs font-medium">
									{getStatusIcon(order.status)}
									{getStatusText(order.status)}
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											size="icon"
											variant="ghost"
											className="h-8 w-8"
											disabled={isUpdating}
										>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => handleUpdateStatus("PENDING")}
										>
											Chờ xử lý
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleUpdateStatus("PREPARING")}
										>
											Đang chuẩn bị
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleUpdateStatus("DELIVERED")}
										>
											Đã giao
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleUpdateStatus("COMPLETED")}
										>
											Hoàn thành
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive focus:text-destructive"
											onClick={() => handleUpdateStatus("CANCELLED")}
										>
											Hủy đơn hàng
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
					</div>
					<DialogTitle className="flex items-center gap-2">
						<Receipt className="h-5 w-5 text-primary" />
						Chi tiết đơn hàng
					</DialogTitle>
					<DialogDescription>
						Thông tin chi tiết về các món đã chọn và trạng thái phục vụ.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex h-[300px] items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : order ? (
					<div className="mt-4 space-y-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground">Bàn / Phiên chơi</p>
								<p className="font-medium">
									{(order as any).booking?.bookingTables
										?.map((bt: any) => bt.table?.name)
										.join(", ") || "Khách lẻ"}
								</p>
							</div>
							<div className="text-right">
								<p className="text-muted-foreground">Thời gian</p>
								<p className="font-medium">
									{format(new Date(order.createdAt), "HH:mm - dd/MM/yyyy", {
										locale: vi,
									})}
								</p>
							</div>
						</div>

						<Separator />

						<div className="space-y-3">
							<p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
								<FileText className="h-3 w-3" />
								Danh sách món
							</p>
							<ScrollArea className="h-[250px] pr-4">
								<div className="space-y-4">
									{(order as any).orderItems?.map((item: any) => (
										<div
											key={item.id}
											className="flex justify-between items-start gap-4"
										>
											<div className="flex-1">
												<p className="font-medium line-clamp-1">
													{item.product.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{new Intl.NumberFormat("vi-VN").format(
														item.priceSnapshot,
													)}{" "}
													đ x {item.quantity}
												</p>
											</div>
											<p className="font-semibold whitespace-nowrap">
												{new Intl.NumberFormat("vi-VN").format(
													item.priceSnapshot * item.quantity,
												)}{" "}
												đ
											</p>
										</div>
									))}
								</div>
							</ScrollArea>
						</div>

						<Separator />

						<div className="space-y-2">
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">Tổng cộng:</span>
								<span className="text-xl font-black text-primary">
									{new Intl.NumberFormat("vi-VN").format(order.totalAmount)} đ
								</span>
							</div>
						</div>
					</div>
				) : (
					<div className="p-8 text-center text-muted-foreground">
						Không tìm thấy dữ liệu đơn hàng.
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
