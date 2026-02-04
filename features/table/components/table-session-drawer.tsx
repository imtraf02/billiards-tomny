"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, GitMerge, Loader2, Plus, Receipt, XCircle } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type {
	Order,
	OrderItem as OrderItemType,
	Product,
	Table,
} from "@/generated/prisma/client";
import { api } from "@/lib/eden";
import { cn } from "@/lib/utils";
import type { CompleteBookingInput } from "@/shared/schemas/booking";
import type { UpdateOrderInput } from "@/shared/schemas/order";

interface TableSessionDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	table: Table | null;
	activeBooking: {
		id: string;
		startTime: Date;
	} | null;
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
		order: Order & { orderItems: (OrderItemType & { product: Product })[] };
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
				{order.orderItems.map((item) => (
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
		orders: (Order & {
			orderItems: (OrderItemType & { product: Product })[];
		})[];
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
	activeBooking: initialBookingData,
	onOpenOrder,
}: TableSessionDrawerProps) {
	const queryClient = useQueryClient();
	const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);
	const [showConfirmStop, setShowConfirmStop] = useState(false);
	const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [isMerging, setIsMerging] = useState(false);
	const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		const interval = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(interval);
	}, [open]);

	const { data: bookingDetails, isLoading: isLoadingBooking } = useQuery({
		queryKey: ["booking", initialBookingData?.id],
		queryFn: async () => {
			if (!initialBookingData?.id) return null;
			const res = await api.bookings({ id: initialBookingData.id }).get();
			if (res.error) throw res.error;
			return res.data;
		},
		enabled: !!initialBookingData?.id && open,
	});

	const activeBooking = bookingDetails;
	const isMultiTable = (activeBooking?.bookingTables?.length || 0) > 1;

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
			queryClient.invalidateQueries({
				queryKey: ["booking", initialBookingData?.id],
			});

			onOpenChange(false);

			setTimeout(() => {
				toast.success("Thanh toán thành công!");
			}, 100);
		},
		onError: (error) => {
			toast.error("Thanh toán thất bại: " + error.message);
		},
	});

	const { mutate: stopTable, isPending: isStopping } = useMutation({
		mutationFn: async (bookingTableId: string) => {
			const res = await api.bookings.tables.end.post({
				bookingTableId,
			});
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["booking", initialBookingData?.id],
			});
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Đã ngừng tính giờ bàn này");
			setShowConfirmStop(false);
		},
		onError: (error) => {
			toast.error("Lỗi: " + error.message);
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
			queryClient.invalidateQueries({
				queryKey: ["booking", initialBookingData?.id],
			});
			toast.success("Đã cập nhật đơn hàng!");
		},
	});

	const { mutate: mergeBookings, isPending: isMergingBookings } = useMutation({
		mutationFn: async ({
			targetId,
			sourceId,
		}: {
			targetId: string;
			sourceId: string;
		}) => {
			const res = await api.bookings({ id: targetId }).merge.post({
				sourceBookingId: sourceId,
			});
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Gộp bill thành công");
			onOpenChange(false);
			setIsMerging(false);
			setSelectedTargetId(null);
		},
		onError: (error) => {
			toast.error(error.message || "Gộp bill thất bại");
		},
	});

	const { data: allActiveBookings } = useQuery({
		queryKey: ["bookings", { status: "PENDING", type: "active" }],
		queryFn: async () => {
			const res = await api.bookings.active.get();
			if (res.error) throw res.error;
			return res.data;
		},
		enabled: open && isMerging,
	});

	const otherActiveBookings = useMemo(() => {
		if (!allActiveBookings || !activeBooking?.id) return [];
		return allActiveBookings.filter((b) => b.id !== activeBooking.id);
	}, [allActiveBookings, activeBooking]);

	const serviceTotal = useMemo(() => {
		if (!activeBooking?.orders) return 0;
		return activeBooking.orders.reduce(
			(acc: number, order) => acc + Number(order.totalAmount || 0),
			0,
		);
	}, [activeBooking]);

	const currentBookingTable = useMemo(() => {
		if (!activeBooking?.bookingTables || !table) return null;
		return activeBooking.bookingTables.find((bt) => bt.tableId === table.id);
	}, [activeBooking, table]);

	// Calculate total for ALL tables if checking out
	const { totalAmount, totalHourlyCost } = useMemo(() => {
		let allTablesCost = 0;
		if (activeBooking?.bookingTables) {
			activeBooking.bookingTables.forEach((bt) => {
				const end = bt.endTime ? new Date(bt.endTime) : currentTime;
				const start = new Date(bt.startTime);
				const diff = end.getTime() - start.getTime();
				const cost =
					Math.ceil(((diff / 3600000) * bt.priceSnapshot) / 1000) * 1000;
				allTablesCost += cost;
			});
		}

		return {
			totalAmount: allTablesCost + serviceTotal,
			totalHourlyCost: allTablesCost,
		};
	}, [activeBooking, currentTime, serviceTotal]);

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

	const handleStopTable = useCallback(() => {
		if (!currentBookingTable) return;
		setShowConfirmStop(true);
	}, [currentBookingTable]);

	const confirmStopTable = useCallback(() => {
		if (!currentBookingTable) return;
		stopTable(currentBookingTable.id);
	}, [currentBookingTable, stopTable]);

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
	}, [activeBooking, onOpenOrder]);

	const handleMerge = () => {
		if (!activeBooking?.id || !selectedTargetId) return;
		mergeBookings({ targetId: selectedTargetId, sourceId: activeBooking.id });
	};

	const sessionStartTime = currentBookingTable?.startTime
		? new Date(currentBookingTable.startTime)
		: null;

	if (!table) return null;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="mx-auto flex h-auto max-h-[95vh] max-w-2xl flex-col overflow-hidden rounded-t-xl">
				<DrawerHeader>
					<DrawerTitle className="flex items-center justify-between">
						<span>Chi tiết phiên chơi: {table.name}</span>
						<Badge
							variant="outline"
							className={cn(
								currentBookingTable?.endTime
									? "bg-gray-100 text-gray-600 border-gray-200"
									: "bg-red-50 text-red-600 border-red-200",
							)}
						>
							{currentBookingTable?.endTime ? "Đã ngừng" : "Đang chơi"}
						</Badge>
					</DrawerTitle>
					<DrawerDescription>
						Quản lý đồ uống và thanh toán cho bàn này.
					</DrawerDescription>
				</DrawerHeader>

				{isLoadingBooking ? (
					<div className="flex h-64 items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
									{sessionStartTime
										? format(sessionStartTime, "HH:mm, dd/MM", {
												locale: vi,
											})
										: "---"}
								</div>
							</div>
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground uppercase font-semibold">
									Thời gian đã chơi
								</span>
								<div className="flex items-center justify-between">
									{sessionStartTime && !currentBookingTable?.endTime ? (
										<Timer startTime={sessionStartTime} />
									) : currentBookingTable?.endTime ? (
										<span className="text-xl font-mono font-bold text-gray-600">
											{(() => {
												if (!sessionStartTime) return "";
												const diff =
													new Date(currentBookingTable.endTime).getTime() -
													sessionStartTime.getTime();
												const hours = Math.floor(diff / 3600000);
												const minutes = Math.floor((diff % 3600000) / 60000);
												return `${hours}h ${minutes}p`;
											})()}
										</span>
									) : (
										"---"
									)}

									{!currentBookingTable?.endTime && (
										<Button
											variant="link"
											size="sm"
											className="h-auto p-0 text-primary flex items-center gap-1"
											onClick={() => setIsMerging(true)}
										>
											<GitMerge className="h-3 w-3" />
											Gộp bill...
										</Button>
									)}
								</div>
							</div>

							{isMultiTable && (
								<div className="sm:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
									<p className="text-sm text-blue-800 flex items-center gap-2">
										<GitMerge className="h-4 w-4" />
										Bàn này đang được gộp chung với:
									</p>
									<div className="mt-2 flex flex-wrap gap-2">
										{activeBooking.bookingTables
											.filter((bt) => bt.tableId !== table.id)
											.map((bt) => (
												<Badge
													key={bt.id}
													variant="secondary"
													className="bg-white"
												>
													{bt.table.name}
													{!bt.endTime && (
														<span className="ml-1 text-green-600 text-[10px]">
															•
														</span>
													)}
												</Badge>
											))}
									</div>
								</div>
							)}
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
									<Plus className="mr-2 size-4" />
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
									Tiền giờ:
									{isMultiTable && (
										<span className="text-xs ml-1">(Tổng các bàn)</span>
									)}
								</span>
								<span className="font-medium">
									{new Intl.NumberFormat("vi-VN").format(totalHourlyCost)} đ
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
								<span>Tổng cộng (Booking):</span>
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

					{isMultiTable && !currentBookingTable?.endTime && (
						<Button
							variant="secondary"
							disabled={isStopping}
							onClick={handleStopTable}
							className="flex-1 sm:flex-none text-orange-700 bg-orange-100 hover:bg-orange-200"
						>
							<Clock className="mr-2 h-4 w-4" />
							Ngừng bàn này
						</Button>
					)}

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
							Bạn có chắc chắn muốn thanh toán toàn bộ Booking cho bàn{" "}
							<strong>{table.name}</strong>?
						</p>
						{isMultiTable && (
							<div className="text-yellow-600 bg-yellow-50 p-2 rounded text-sm mb-2">
								Lưu ý: Booking này bao gồm nhiều bàn. Hành động này sẽ kết thúc
								tất cả các bàn và thanh toán tổng.
							</div>
						)}
						<div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
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
				open={showConfirmStop}
				onOpenChange={setShowConfirmStop}
				title="Ngừng tính giờ bàn này"
				desc={
					<div className="space-y-2">
						<p>
							Bạn có chắc chắn muốn ngừng tính giờ cho bàn{" "}
							<strong>{table.name}</strong>?
						</p>
						<p className="text-sm text-muted-foreground">
							Bàn sẽ chuyển sang trạng thái Trống, nhưng tiền giờ sẽ được lưu
							vào Booking chung và thanh toán sau.
						</p>
					</div>
				}
				confirmText="Ngừng bàn"
				handleConfirm={confirmStopTable}
				isLoading={isStopping}
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

			{/* Merging Drawer ... (Keep as is just update activeBooking usage) */}
			<Drawer open={isMerging} onOpenChange={setIsMerging}>
				<DrawerContent className="mx-auto h-[70vh] flex flex-col">
					<DrawerHeader>
						<DrawerTitle>Chọn bàn muốn gộp vào</DrawerTitle>
						<DrawerDescription>
							Tất cả các món và giờ chơi của bàn hiện tại sẽ được chuyển sang
							bàn được chọn.
						</DrawerDescription>
					</DrawerHeader>

					<div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
						{otherActiveBookings.length === 0 ? (
							<p className="text-center py-8 text-sm text-muted-foreground">
								Không có bàn nào khác đang hoạt động.
							</p>
						) : (
							<div className="space-y-2">
								{otherActiveBookings.map((b) => {
									const bookingTotal = (b.orders || []).reduce(
										(acc, o) => acc + Number(o.totalAmount || 0),
										0,
									);
									const allItems = (b.orders || []).flatMap(
										(o) => o.orderItems || [],
									);

									return (
										<button
											key={b.id}
											type="button"
											className={cn(
												"w-full text-left p-3 rounded-lg border transition-all hover:bg-muted font-normal",
												selectedTargetId === b.id &&
													"border-primary bg-primary/5 ring-1 ring-primary",
											)}
											onClick={() => setSelectedTargetId(b.id)}
										>
											<div className="flex justify-between items-start">
												<div className="space-y-1">
													<p className="font-bold text-sm">
														{b.bookingTables
															.map((bt) => bt.table.name)
															.join(", ")}
													</p>
													<p className="text-[10px] text-muted-foreground flex items-center gap-1">
														<Clock className="h-3 w-3" />
														{format(new Date(b.startTime), "HH:mm, dd/MM")}
													</p>
												</div>
												<div className="text-right space-y-1">
													<p className="font-bold text-sm text-primary">
														{new Intl.NumberFormat("vi-VN").format(
															bookingTotal,
														)}{" "}
														đ
													</p>
													<Badge
														variant="secondary"
														className="text-[10px] h-4"
													>
														{b.orders?.length || 0} đơn
													</Badge>
												</div>
											</div>

											{allItems.length > 0 && (
												<div className="mt-2 flex flex-wrap gap-1">
													{allItems.slice(0, 3).map((item) => (
														<Badge
															key={item.id}
															variant="outline"
															className="text-[10px] py-0 h-4 font-normal bg-muted/20"
														>
															{item.product?.name} x{item.quantity}
														</Badge>
													))}
													{allItems.length > 3 && (
														<span className="text-[10px] text-muted-foreground">
															...
														</span>
													)}
												</div>
											)}
										</button>
									);
								})}
							</div>
						)}

						<div className="mt-4 flex flex-col gap-2">
							<Button
								className="w-full"
								disabled={!selectedTargetId || isMergingBookings}
								onClick={handleMerge}
							>
								{isMergingBookings && (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								)}
								Xác nhận gộp bill
							</Button>
							<Button
								variant="ghost"
								className="w-full"
								onClick={() => setIsMerging(false)}
							>
								Hủy
							</Button>
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		</Drawer>
	);
}
