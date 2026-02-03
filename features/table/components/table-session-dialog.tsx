"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Plus, Receipt, XCircle } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
	useCompleteBooking,
	useGetBooking,
	useGetBookings,
} from "@/features/booking/hooks";
import { useUpdateOrder } from "@/features/order/hooks/use-order";
import type { Table } from "@/generated/prisma/client";
import { useQueryClient } from "@tanstack/react-query";

interface TableSessionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	table: Table | null;
	onOpenOrder: (bookingId: string) => void;
}

// Tách component Timer riêng để tránh re-render toàn bộ dialog
const Timer = memo(({ startTime }: { startTime: Date }) => {
	const [duration, setDuration] = useState<string>("00:00:00");

	useEffect(() => {
		const updateDuration = () => {
			const now = new Date();
			const diff = now.getTime() - startTime.getTime();
			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);
			setDuration(
				`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
			);
		};

		updateDuration();
		const interval = setInterval(updateDuration, 1000);
		return () => clearInterval(interval);
	}, [startTime]);

	return <div className="text-2xl font-mono font-bold text-primary">{duration}</div>;
});

Timer.displayName = 'Timer';

// Tách component OrderItem riêng
const OrderItem = memo(({ 
	order, 
	onCancelOrder, 
	isUpdatingOrder 
}: { 
	order: any; 
	onCancelOrder: (id: string) => void; 
	isUpdatingOrder: boolean; 
}) => {
	return (
		<div key={order.id} className="text-sm bg-muted/30 p-2 rounded-lg relative group">
			<div className="flex justify-between items-start mb-1">
				<Badge
					variant="secondary"
					className={
						order.status === "COMPLETED"
							? "bg-green-100 text-green-700"
							: order.status === "CANCELLED"
								? "bg-red-100 text-red-700"
								: "bg-blue-100 text-blue-700"
					}
				>
					{order.status}
				</Badge>
				{order.status !== "COMPLETED" &&
					order.status !== "CANCELLED" && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={() => onCancelOrder(order.id)}
							disabled={isUpdatingOrder}
						>
							<XCircle className="h-4 w-4" />
						</Button>
					)}
			</div>
			{order.orderItems.map((item: any) => (
				<div
					key={item.id}
					className="flex justify-between py-1 text-xs"
				>
					<span>
						{item.product.name} x{item.quantity}
					</span>
					<span className="text-muted-foreground">
						{new Intl.NumberFormat("vi-VN").format(
							item.priceSnapshot * item.quantity,
						)}
					</span>
				</div>
			))}
		</div>
	);
});

OrderItem.displayName = 'OrderItem';

// Tách component OrdersList riêng
const OrdersList = memo(({ 
	orders, 
	onCancelOrder, 
	isUpdatingOrder 
}: { 
	orders: any[];
	onCancelOrder: (id: string) => void;
	isUpdatingOrder: boolean;
}) => {
	if (!orders || orders.length === 0) {
		return (
			<p className="text-sm text-center py-4 text-muted-foreground italic">
				Chưa có sản phẩm nào được gọi.
			</p>
		);
	}

	return (
		<div className="max-h-[200px] overflow-y-auto space-y-3">
			{orders.map((order) => (
				<OrderItem 
					key={order.id} 
					order={order} 
					onCancelOrder={onCancelOrder}
					isUpdatingOrder={isUpdatingOrder}
				/>
			))}
		</div>
	);
});

OrdersList.displayName = 'OrdersList';

export function TableSessionDialog({
	open,
	onOpenChange,
	table,
	onOpenOrder,
}: TableSessionDialogProps) {
	const queryClient = useQueryClient();
	
	// Sử dụng enable: false ban đầu, chỉ fetch khi cần
	const shouldFetch = open && !!table;
	
	const { data: bookingsData } = useGetBookings({
		tableId: table?.id,
		status: "PENDING",
		limit: 1,
		page: 1,
	}, {
		enabled: shouldFetch,
		staleTime: 5 * 60 * 1000, // 5 phút
	});

	const activeBookingBasic = bookingsData?.data?.[0];
	const { data: activeBooking } = useGetBooking(
		activeBookingBasic?.id || "",
		{
			enabled: shouldFetch && !!activeBookingBasic?.id,
			staleTime: 5 * 60 * 1000,
		}
	);

	const { mutate: completeBooking, isPending: isCompleting } =
		useCompleteBooking({
			onSuccess: () => {
				// Invalidate queries để cập nhật dữ liệu
				queryClient.invalidateQueries({ queryKey: ["tables"] });
				queryClient.invalidateQueries({ queryKey: ["bookings"] });
				
				// Đóng dialog ngay lập tức
				onOpenChange(false);
				
				// Hiển thị toast sau khi đóng dialog
				setTimeout(() => {
					toast.success("Thanh toán thành công!");
				}, 100);
			},
			onError: (error) => {
				toast.error("Thanh toán thất bại: " + error.message);
			}
		});

	const { mutate: updateOrder, isPending: isUpdatingOrder } = useUpdateOrder(
		() => {
			toast.success("Đã cập nhật đơn hàng!");
		},
	);

	// Sử dụng useMemo để memoize các tính toán nặng
	const serviceTotal = useMemo(() => {
		if (!activeBooking?.orders) return 0;
		return activeBooking.orders.reduce(
			(acc: number, order: any) => acc + Number(order.totalAmount || 0),
			0,
		);
	}, [activeBooking?.orders]);

	const hourlyCost = useMemo(() => {
		if (!activeBooking?.startTime || !table?.hourlyRate) return 0;
		const now = new Date();
		const start = new Date(activeBooking.startTime);
		const diff = now.getTime() - start.getTime();
		return Math.ceil((diff / 3600000) * table.hourlyRate);
	}, [activeBooking?.startTime, table?.hourlyRate]);

	const totalAmount = useMemo(() => {
		return hourlyCost + serviceTotal;
	}, [hourlyCost, serviceTotal]);

	// Sử dụng useCallback để tránh tạo hàm mới mỗi lần render
	const handleCancelOrder = useCallback((orderId: string) => {
		if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
			updateOrder({
				id: orderId,
				data: { status: "CANCELLED" as any },
			});
		}
	}, [updateOrder]);

	const handleCheckout = useCallback(() => {
		if (!activeBooking) return;
		
		// Hiển thị xác nhận với thông tin chi tiết
		const confirmMessage = `Xác nhận thanh toán cho bàn ${table?.name}?\n\n` +
			`• Tiền giờ: ${new Intl.NumberFormat("vi-VN").format(hourlyCost)} đ\n` +
			`• Tiền dịch vụ: ${new Intl.NumberFormat("vi-VN").format(serviceTotal)} đ\n` +
			`• Tổng cộng: ${new Intl.NumberFormat("vi-VN").format(totalAmount)} đ\n\n` +
			`Bạn có chắc chắn muốn thanh toán và kết thúc phiên chơi?`;
		
		if (confirm(confirmMessage)) {
			// Đóng dialog ngay lập tức khi người dùng xác nhận
			onOpenChange(false);
			
			// Thực hiện thanh toán
			completeBooking({
				id: activeBooking.id,
				data: {
					paymentMethod: "CASH",
					endTime: new Date(),
				},
			});
		}
	}, [activeBooking, table?.name, hourlyCost, serviceTotal, totalAmount, completeBooking, onOpenChange]);

	const handleOpenOrder = useCallback(() => {
		if (activeBooking?.id) {
			onOpenOrder(activeBooking.id);
		}
	}, [activeBooking?.id, onOpenOrder]);

	if (!table) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						<span>Chi tiết phiên chơi: {table.name}</span>
						<Badge
							variant="outline"
							className="bg-red-50 text-red-600 border-red-200"
						>
							Đang chơi
						</Badge>
					</DialogTitle>
					<DialogDescription>
						Quản lý đồ uống và thanh toán cho bàn này.
					</DialogDescription>
				</DialogHeader>

				{!activeBooking ? (
					<div className="py-8 text-center text-red-500">
						Không tìm thấy thông tin phiên chơi.
					</div>
				) : (
					<div className="space-y-6 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground uppercase font-semibold">
									Bắt đầu
								</span>
								<div className="flex items-center font-medium">
									<Clock className="mr-2 h-4 w-4 text-muted-foreground" />
									{format(new Date(activeBooking.startTime), "HH:mm, dd/MM", {
										locale: vi,
									})}
								</div>
							</div>
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground uppercase font-semibold">
									Thời gian đã chơi
								</span>
								<Timer startTime={new Date(activeBooking.startTime)} />
							</div>
						</div>

						<Separator />

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold px-1">Dịch vụ & Sản phẩm</h3>
								<Button
									variant="outline"
									size="sm"
									onClick={handleOpenOrder}
									disabled={!activeBooking?.id}
								>
									<Plus className="mr-2 h-3.5 w-3.5" />
									Gọi món
								</Button>
							</div>

							<OrdersList 
								orders={activeBooking.orders || []} 
								onCancelOrder={handleCancelOrder}
								isUpdatingOrder={isUpdatingOrder}
							/>
						</div>

						<Separator />

						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">
									Tiền giờ tạm tính:
								</span>
								<span className="font-medium">
									{new Intl.NumberFormat("vi-VN").format(hourlyCost)} đ
								</span>
							</div>
							{serviceTotal > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tiền dịch vụ:</span>
									<span className="font-medium">
										{new Intl.NumberFormat("vi-VN").format(serviceTotal)} đ
									</span>
								</div>
							)}
							<Separator className="my-2" />
							<div className="flex justify-between text-base font-bold text-primary">
								<span>Tổng cộng:</span>
								<span>
									{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
								</span>
							</div>
						</div>
					</div>
				)}

				<DialogFooter className="flex sm:justify-between gap-2">
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						Đóng
					</Button>
					<Button
						disabled={!activeBooking || isCompleting}
						onClick={handleCheckout}
						className="bg-green-600 hover:bg-green-700 text-white"
					>
						<Receipt className="mr-2 h-4 w-4" />
						Thanh toán
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
