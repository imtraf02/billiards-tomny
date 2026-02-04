"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Loader2, Plus, Receipt, XCircle } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import type { Table } from "@/generated/prisma/client";
import { api } from "@/lib/eden";
import type { CompleteBookingInput } from "@/shared/schemas/booking";
import type { UpdateOrderInput } from "@/shared/schemas/order";

interface TableSessionDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	table: Table | null;
	onOpenOrder: (bookingId: string) => void;
}

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

	return (
		<div className="text-2xl font-mono font-bold text-primary">{duration}</div>
	);
});

Timer.displayName = "Timer";

const OrderItem = memo(
	({
		order,
		onCancelOrder,
		isUpdatingOrder,
	}: {
		order: any;
		onCancelOrder: (id: string) => void;
		isUpdatingOrder: boolean;
	}) => {
		return (
			<div
				key={order.id}
				className="text-sm bg-muted/30 p-2 rounded-lg relative group"
			>
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
					{order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
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
					<div key={item.id} className="flex justify-between py-1 text-xs">
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
	},
);

OrderItem.displayName = "OrderItem";

const OrdersList = memo(
	({
		orders,
		onCancelOrder,
		isUpdatingOrder,
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
			<div className="max-h-[40vh] sm:max-h-64 overflow-y-auto space-y-3 pr-1 -mr-1">
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
	},
);

OrdersList.displayName = "OrdersList";

export function TableSessionDrawer({
	open,
	onOpenChange,
	table,
	onOpenOrder,
}: TableSessionDrawerProps) {
	const queryClient = useQueryClient();
	const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);
	const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		if (!open) return;
		const interval = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(interval);
	}, [open]);

	const shouldFetch = open && !!table;

	const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
		queryKey: [
			"bookings",
			{
				tableId: table?.id,
				status: "PENDING",
				limit: 1,
				page: 1,
			},
		],
		queryFn: async () => {
			const res = await api.bookings.get({
				query: {
					tableId: table?.id,
					status: "PENDING",
					limit: 1,
					page: 1,
				},
			});
			if (res.status === 200) {
				return res.data;
			}
			return { data: [], meta: { total: 0, page: 1, limit: 1, totalPages: 0 } };
		},
		enabled: shouldFetch,
		staleTime: 5 * 60 * 1000,
	});

	const activeBookingBasic = bookingsData?.data?.[0];
	const { data: activeBooking, isLoading: isLoadingActiveBooking } = useQuery({
		queryKey: ["bookings", activeBookingBasic?.id],
		queryFn: async () => {
			if (!activeBookingBasic?.id) return null;
			const res = await api.bookings({ id: activeBookingBasic.id }).get();
			if (res.status === 200) {
				return res.data;
			}
			return null;
		},
		enabled: shouldFetch && !!activeBookingBasic?.id,
		staleTime: 5 * 60 * 1000,
	});

	const { mutate: completeBooking, isPending: isCompleting } = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: CompleteBookingInput;
		}) => {
			const res = await api.bookings({ id }).complete.post(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });

			onOpenChange(false);

			setTimeout(() => {
				toast.success("Thanh toán thành công!");
			}, 100);
		},
		onError: (error) => {
			toast.error("Thanh toán thất bại: " + error.message);
		},
	});

	const { mutate: updateOrder, isPending: isUpdatingOrder } = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateOrderInput;
		}) => {
			const res = await api.orders({ id }).patch(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			toast.success("Đã cập nhật đơn hàng!");
		},
	});

	const serviceTotal = useMemo(() => {
		if (!activeBooking?.orders) return 0;
		return activeBooking.orders.reduce(
			(acc: number, order: any) => acc + Number(order.totalAmount || 0),
			0,
		);
	}, [activeBooking?.orders]);

	const hourlyCost = useMemo(() => {
		if (!activeBooking?.startTime || !table?.hourlyRate) return 0;
		const start = new Date(activeBooking.startTime);
		const diff = currentTime.getTime() - start.getTime();
		const rawCost = (diff / 3600000) * table.hourlyRate;
		// Làm tròn lên hàng nghìn: 31.203 => 32.000
		return Math.ceil(rawCost / 1000) * 1000;
	}, [activeBooking?.startTime, table?.hourlyRate, currentTime]);

	const totalAmount = useMemo(() => {
		return hourlyCost + serviceTotal;
	}, [hourlyCost, serviceTotal]);

	const handleCancelOrder = useCallback((orderId: string) => {
		setOrderToCancel(orderId);
	}, []);

	const confirmCancelOrder = useCallback(() => {
		if (orderToCancel) {
			updateOrder({
				id: orderToCancel,
				data: { status: "CANCELLED" as any },
			});
			setOrderToCancel(null);
		}
	}, [orderToCancel, updateOrder]);

	const handleCheckout = useCallback(() => {
		if (!activeBooking) return;
		setShowConfirmCheckout(true);
	}, [activeBooking]);

	const confirmCheckout = useCallback(() => {
		if (!activeBooking) return;

		setShowConfirmCheckout(false);
		onOpenChange(false);

		completeBooking({
			id: activeBooking.id,
			data: {
				paymentMethod: "CASH",
				endTime: new Date(),
			},
		});
	}, [activeBooking, completeBooking, onOpenChange]);

	const handleOpenOrder = useCallback(() => {
		if (activeBooking?.id) {
			onOpenOrder(activeBooking.id);
		}
	}, [activeBooking?.id, onOpenOrder]);

	if (!table) return null;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="mx-auto flex h-auto max-h-[95vh] max-w-2xl flex-col overflow-hidden rounded-t-xl">
				<DrawerHeader>
					<DrawerTitle className="flex items-center justify-between">
						<span>Chi tiết phiên chơi: {table.name}</span>
						<Badge
							variant="outline"
							className="bg-red-50 text-red-600 border-red-200"
						>
							Đang chơi
						</Badge>
					</DrawerTitle>
					<DrawerDescription>
						Quản lý đồ uống và thanh toán cho bàn này.
					</DrawerDescription>
				</DrawerHeader>

				{isLoadingBookings || (activeBookingBasic && isLoadingActiveBooking) ? (
					<div className="flex flex-col items-center justify-center space-y-2 py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
						<p className="text-sm text-muted-foreground">
							Đang tải thông tin...
						</p>
					</div>
				) : !activeBooking ? (
					<div className="py-12 text-center">
						<p className="text-destructive font-medium">
							Không tìm thấy thông tin phiên chơi.
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Vui lòng kiểm tra lại trạng thái bàn.
						</p>
					</div>
				) : (
					<div className="space-y-6 overflow-y-auto px-4 py-4 sm:px-6">
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

				<DrawerFooter className="flex gap-2 sm:justify-between">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						className="flex-1 sm:flex-none"
					>
						Đóng
					</Button>
					<Button
						disabled={!activeBooking || isCompleting}
						onClick={handleCheckout}
						className="flex-2 bg-green-600 text-white hover:bg-green-700 sm:flex-none"
					>
						<Receipt className="mr-2 h-4 w-4" />
						Thanh toán
					</Button>
				</DrawerFooter>
			</DrawerContent>

			<ConfirmDialog
				open={showConfirmCheckout}
				onOpenChange={setShowConfirmCheckout}
				title="Xác nhận thanh toán"
				desc={
					<div className="space-y-2 py-2">
						<p>
							Bạn có chắc chắn muốn thanh toán cho bàn{" "}
							<strong>{table.name}</strong>?
						</p>
						<div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
							<div className="flex justify-between">
								<span>Tiền giờ:</span>
								<span>
									{new Intl.NumberFormat("vi-VN").format(hourlyCost)} đ
								</span>
							</div>
							<div className="flex justify-between">
								<span>Tiền dịch vụ:</span>
								<span>
									{new Intl.NumberFormat("vi-VN").format(serviceTotal)} đ
								</span>
							</div>
							<Separator className="my-1" />
							<div className="flex justify-between font-bold text-primary">
								<span>Tổng cộng:</span>
								<span>
									{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
								</span>
							</div>
						</div>
					</div>
				}
				confirmText="Thanh toán"
				handleConfirm={confirmCheckout}
				isLoading={isCompleting}
			/>

			<ConfirmDialog
				open={!!orderToCancel}
				onOpenChange={(open) => !open && setOrderToCancel(null)}
				title="Hủy đơn hàng"
				desc="Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác này không thể hoàn tác."
				confirmText="Hủy đơn"
				destructive
				handleConfirm={confirmCancelOrder}
				isLoading={isUpdatingOrder}
			/>
		</Drawer>
	);
}
