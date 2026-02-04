"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
	Calendar,
	Clock,
	Copy,
	History,
	Package,
	Printer,
	Receipt,
	User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InvoicePrint } from "@/components/invoice-print";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/eden";

interface BookingDetailDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bookingId: string | null;
}

export function BookingDetailDrawer({
	open,
	onOpenChange,
	bookingId,
}: BookingDetailDrawerProps) {
	const queryClient = useQueryClient();
	const [currentTime, setCurrentTime] = useState(new Date());
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [showPrintInvoice, setShowPrintInvoice] = useState(false);

	useEffect(() => {
		if (!open) return;
		const interval = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(interval);
	}, [open]);

	const { data: booking, isLoading } = useQuery({
		queryKey: ["bookings", bookingId],
		queryFn: async () => {
			if (!bookingId) return null;
			const res = await api.bookings({ id: bookingId }).get();
			if (res.status === 200) {
				return res.data;
			}
			return null;
		},
		enabled: !!bookingId && open,
	});

	const { mutate: completeBooking, isPending: isCompleting } = useMutation({
		mutationFn: async () => {
			if (!bookingId) return;
			const res = await api.bookings({ id: bookingId }).complete.post({
				paymentMethod: "CASH",
				endTime: new Date(),
			});
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: (updatedBooking) => {
			if (updatedBooking) {
				queryClient.setQueryData(["bookings", bookingId], updatedBooking);
				queryClient.setQueryData(["bookings"], (old: any) => {
					if (!old?.data) return old;
					return {
						...old,
						data: old.data.map((b: any) =>
							b.id === bookingId ? updatedBooking : b,
						),
					};
				});
			}
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Thanh toán thành công!", {
				duration: 2000,
				action: {
					label: "In hóa đơn",
					onClick: () => setShowPrintInvoice(true),
				},
			});
			setIsConfirmOpen(false);
		},
		onError: (error) => {
			toast.error(error.message || "Thanh toán thất bại");
		},
	});

	// Calculate live total
	const { liveTotal, serviceTotal, timeTotal } = useMemo(() => {
		if (!booking) return { liveTotal: 0, serviceTotal: 0, timeTotal: 0 };

		// Calculate for both PENDING and COMPLETED
		let timeCost = 0;
		if (booking.bookingTables) {
			booking.bookingTables.forEach((bt: any) => {
				const end = bt.endTime
					? new Date(bt.endTime)
					: booking.status === "COMPLETED" && booking.endTime
						? new Date(booking.endTime)
						: currentTime;
				const start = new Date(bt.startTime);
				const diff = Math.max(0, end.getTime() - start.getTime());
				const cost =
					Math.ceil(((diff / 3600000) * bt.priceSnapshot) / 1000) * 1000;
				timeCost += cost;
			});
		}

		const services =
			booking.orders
				?.filter((o) => o.status !== "CANCELLED")
				.reduce((acc: number, o) => acc + Number(o.totalAmount || 0), 0) || 0;

		return {
			liveTotal:
				booking.status === "COMPLETED" ? booking.totalAmount : timeCost + services,
			serviceTotal: services,
			timeTotal: timeCost,
		};
	}, [booking, currentTime]);

	if (!bookingId) return null;

	const statusLabels: Record<string, string> = {
		PENDING: "Đang chờ",
		CONFIRMED: "Đã xác nhận",
		CANCELLED: "Đã hủy",
		COMPLETED: "Đã hoàn thành",
	};

	const statusColors: Record<string, string> = {
		PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
		CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
		CANCELLED: "bg-red-100 text-red-700 border-red-200",
		COMPLETED: "bg-green-100 text-green-700 border-green-200",
	};

	const paymentMethodLabels: Record<string, string> = {
		CASH: "Tiền mặt",
		CARD: "Thẻ",
		TRANSFER: "Chuyển khoản",
		MOMO: "MoMo",
		ZALOPAY: "ZaloPay",
	};

	const displayTotal =
		booking?.status === "PENDING" ? liveTotal : booking?.totalAmount || 0;

	// Helper to calculate cost for a specific table
	const calculateTableCost = (bt: any) => {
		const end = bt.endTime ? new Date(bt.endTime) : currentTime;
		const start = new Date(bt.startTime);
		const diff = end.getTime() - start.getTime();
		const hours = diff / (1000 * 60 * 60);
		// Round up to nearest 1000
		return Math.ceil((hours * bt.priceSnapshot) / 1000) * 1000;
	};

	// Helper to calculate duration for display
	const calculateDuration = (bt: any) => {
		const end = bt.endTime ? new Date(bt.endTime) : currentTime;
		const start = new Date(bt.startTime);
		const diff = end.getTime() - start.getTime();

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}p`;
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="mx-auto rounded-t-xl overflow-hidden flex flex-col">
				<DrawerHeader>
					<DrawerTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<History className="h-5 w-5 text-primary" />
							<span>Chi tiết phiên chơi</span>
						</div>
						{booking && (
							<Badge variant="outline" className={statusColors[booking.status]}>
								{statusLabels[booking.status]}
							</Badge>
						)}
					</DrawerTitle>
					<DrawerDescription className="flex items-center gap-2">
						Mã phiên: {bookingId}
						{booking && (
							<Badge
								variant="ghost"
								className="h-5 px-1 bg-muted hover:bg-muted/80 cursor-pointer"
								onClick={() => {
									navigator.clipboard.writeText(booking.id);
									toast.success("Đã sao chép ID phiên chơi");
								}}
							>
								<Copy className="h-3 w-3" />
							</Badge>
						)}
					</DrawerDescription>
				</DrawerHeader>

				{isLoading ? (
					<div className="flex-1 flex items-center justify-center py-12 text-muted-foreground italic">
						Đang tải thông tin...
					</div>
				) : booking ? (
					<>
						<div className="flex-1 overflow-y-auto p-4 space-y-6">
							{/* General Info */}
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div className="space-y-1">
									<span className="text-muted-foreground flex items-center gap-1">
										<Calendar className="h-3.5 w-3.5" /> Ngày:
									</span>
									<p className="font-medium">
										{format(new Date(booking.startTime), "dd/MM/yyyy")}
									</p>
								</div>
								<div className="space-y-1 text-right">
									<span className="text-muted-foreground flex items-center gap-1 justify-end">
										<User className="size-4" /> Khách hàng
									</span>
									<p className="font-medium">
										{booking.user?.name || "Khách vãng lai"}
									</p>
								</div>
							</div>

							<Separator />

							{/* Time details */}
							<div className="space-y-3">
								<h3 className="text-sm font-semibold flex items-center gap-1">
									<Clock className="h-4 w-4" /> Chi tiết thời gian & Bàn
								</h3>
								<div className="space-y-2">
									{booking.bookingTables.map((bt) => {
										const tableCost = calculateTableCost(bt);
										const duration = calculateDuration(bt);

										return (
											<div
												key={bt.id}
												className="flex flex-col p-3 bg-muted/50 rounded-lg border"
											>
												<div className="flex justify-between font-medium mb-1">
													<span>Bàn: {bt.table.name}</span>
													<div className="text-right">
														<span className="block text-primary font-bold">
															{new Intl.NumberFormat("vi-VN").format(tableCost)}{" "}
															đ
														</span>
														<span className="text-xs text-muted-foreground font-normal">
															{new Intl.NumberFormat("vi-VN").format(
																bt.priceSnapshot,
															)}{" "}
															đ/giờ
														</span>
													</div>
												</div>
												<div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
													<div className="flex gap-3">
														<span>
															Bắt đầu: {format(new Date(bt.startTime), "HH:mm")}
														</span>
														<span>
															Kết thúc:{" "}
															{bt.endTime
																? format(new Date(bt.endTime), "HH:mm")
																: "---"}
														</span>
													</div>
													<Badge
														variant="secondary"
														className="h-5 px-1.5 text-[10px]"
													>
														{duration}
													</Badge>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Order details */}
							<div className="space-y-3">
								<h3 className="text-sm font-semibold flex items-center gap-1">
									<Package className="h-4 w-4" /> Đồ uống & Dịch vụ
								</h3>
								{booking.orders &&
								booking.orders.filter((o) => o.status !== "CANCELLED").length >
									0 ? (
									<div className="space-y-2 border rounded-lg overflow-hidden">
										<table className="w-full text-sm border-collapse">
											<thead className="bg-muted">
												<tr>
													<th className="text-left py-2 px-3 font-medium">
														Tên món
													</th>
													<th className="text-center py-2 px-3 font-medium">
														SL
													</th>
													<th className="text-right py-2 px-3 font-medium">
														Thành tiền
													</th>
												</tr>
											</thead>
											<tbody>
												{booking.orders
													.filter((o) => o.status !== "CANCELLED")
													.flatMap((o) => o.orderItems)
													.map((item) => (
														<tr key={item.id} className="border-t">
															<td className="py-2 px-3">{item.product.name}</td>
															<td className="py-2 px-3 text-center">
																x{item.quantity}
															</td>
															<td className="py-2 px-3 text-right">
																{new Intl.NumberFormat("vi-VN").format(
																	item.priceSnapshot * item.quantity,
																)}
															</td>
														</tr>
													))}
											</tbody>
										</table>
									</div>
								) : (
									<p className="text-xs text-center py-4 text-muted-foreground italic border border-dashed rounded-lg">
										Không có đơn hàng nào kèm theo.
									</p>
								)}
							</div>

							<Separator />

							{/* Summary */}
							<div className="space-y-2 bg-primary/5 p-4 rounded-lg">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tiền giờ:</span>
									<span className="font-medium">
										{new Intl.NumberFormat("vi-VN").format(timeTotal)} đ
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Tiền dịch vụ:</span>
									<span className="font-medium">
										{new Intl.NumberFormat("vi-VN").format(serviceTotal)} đ
									</span>
								</div>
								<Separator className="my-1 opacity-50" />
								<div className="flex justify-between text-base font-bold">
									<span className="text-primary">Tổng cộng:</span>
									<span className="text-primary">
										{new Intl.NumberFormat("vi-VN").format(displayTotal)} đ
									</span>
								</div>
								{booking.status === "COMPLETED" && booking.endTime && (
									<div className="flex justify-between text-sm py-1 border-t mt-1">
										<span className="text-muted-foreground italic">
											Thời gian kết thúc:
										</span>
										<span className="font-medium text-muted-foreground">
											{format(new Date(booking.endTime), "HH:mm, dd/MM/yyyy")}
										</span>
									</div>
								)}
								{booking.transaction && (
									<div className="flex justify-between text-xs text-muted-foreground border-t pt-2 mt-2">
										<span className="flex items-center gap-1">
											<Receipt className="h-3 w-3" />
											Thanh toán:{" "}
											{paymentMethodLabels[booking.transaction.paymentMethod] ||
												booking.transaction.paymentMethod}
										</span>
										<span>
											{format(
												new Date(booking.transaction.createdAt),
												"HH:mm, dd/MM/yyyy",
												{ locale: vi },
											)}
										</span>
									</div>
								)}
							</div>

							{booking.note && (
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground">
										Ghi chú:
									</span>
									<p className="text-sm p-3 bg-muted rounded-md italic">
										"{booking.note}"
									</p>
								</div>
							)}
						</div>

						{!["COMPLETED", "CANCELLED"].includes(booking.status) && (
							<div className="p-4 border-t flex justify-end gap-2 bg-background shadow-lg z-10 sticky bottom-0">
								<Button variant="outline" onClick={() => onOpenChange(false)}>
									Đóng
								</Button>
								<Button
									onClick={() => setIsConfirmOpen(true)}
									className="bg-green-600 hover:bg-green-700 text-white"
								>
									<Receipt className="mr-2 h-4 w-4" />
									Thanh toán
								</Button>
							</div>
						)}

						{booking.status === "COMPLETED" && (
							<div className="p-4 border-t flex justify-end gap-2 bg-background shadow-lg z-10 sticky bottom-0">
								<Button variant="outline" onClick={() => onOpenChange(false)}>
									Đóng
								</Button>
								<Button
									onClick={() => setShowPrintInvoice(true)}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									<Printer className="mr-2 h-4 w-4" />
									In hóa đơn
								</Button>
							</div>
						)}

						{showPrintInvoice && booking && (
							<InvoicePrint
								data={{
									booking,
									totalAmount: displayTotal,
									timeTotal,
									serviceTotal,
								}}
								onPrintComplete={() => setShowPrintInvoice(false)}
							/>
						)}
					</>
				) : (
					<div className="py-12 text-center text-red-500">
						Không tìm thấy thông tin phiên chơi này.
					</div>
				)}
			</DrawerContent>

			<ConfirmDialog
				open={isConfirmOpen}
				onOpenChange={setIsConfirmOpen}
				title="Xác nhận thanh toán"
				desc={
					<div className="space-y-2 py-2">
						<p>
							Bạn có chắc chắn muốn thanh toán Booking{" "}
							<strong>#{bookingId}</strong>?
						</p>
						<div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tiền giờ:</span>
								<span>
									{new Intl.NumberFormat("vi-VN").format(timeTotal)} đ
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Dịch vụ:</span>
								<span>
									{new Intl.NumberFormat("vi-VN").format(serviceTotal)} đ
								</span>
							</div>
							<Separator className="my-1" />
							<div className="flex justify-between font-bold text-primary">
								<span>Tổng cộng:</span>
								<span>
									{new Intl.NumberFormat("vi-VN").format(displayTotal)} đ
								</span>
							</div>
						</div>
					</div>
				}
				confirmText="Thanh toán ngay"
				handleConfirm={() => completeBooking()}
				isLoading={isCompleting}
			/>
		</Drawer>
	);
}
