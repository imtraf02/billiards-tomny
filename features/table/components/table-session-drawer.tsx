"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, GitMerge, Loader2, Plus, Printer, Receipt } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InvoicePrint } from "@/components/invoice-print";
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
import { cn } from "@/lib/utils";
import {
	useActiveBookings,
	useBookingDetails,
	useCompleteBooking,
	useCostCalculation,
	useDialogStates,
	useMergeBookings,
	useStopTable,
	useUpdateOrder,
} from "../hooks/use-table-session";
import type { TableSessionDrawerProps } from "../types";
import { MergeDrawer } from "./merge-drawer";
import { MultiTableInfo } from "./multi-table-info";
import { OrdersList } from "./orders-list";
import { Timer } from "./timer";

export function TableSessionDrawer({
	open,
	onOpenChange,
	table,
	activeBooking: initialBookingData,
	onOpenOrder,
}: TableSessionDrawerProps) {
	const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

	const { states: dialogStates, updateState: updateDialogState } =
		useDialogStates();

	// Current time ticker
	useEffect(() => {
		if (!open) return;
		const interval = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(interval);
	}, [open]);

	// Fetch booking details
	const { data: bookingDetails, isLoading: isLoadingBooking } =
		useBookingDetails(initialBookingData?.id, open);

	// Computed values
	const isMultiTable = useMemo(
		() => (bookingDetails?.bookingTables?.length || 0) > 1,
		[bookingDetails?.bookingTables?.length],
	);

	const currentBookingTable = useMemo(() => {
		if (!bookingDetails?.bookingTables || !table?.id) return null;
		return bookingDetails.bookingTables.find((bt) => bt.tableId === table.id);
	}, [bookingDetails?.bookingTables, table?.id]);

	const sessionStartTime = useMemo(
		() =>
			currentBookingTable?.startTime
				? new Date(currentBookingTable.startTime)
				: null,
		[currentBookingTable?.startTime],
	);

	const activeOrders = useMemo(
		() => bookingDetails?.orders?.filter((o) => o.status !== "CANCELLED") || [],
		[bookingDetails?.orders],
	);

	const { totalAmount, totalHourlyCost, serviceTotal } = useCostCalculation(
		bookingDetails,
		currentTime,
	);

	// Mutations
	const { mutate: completeBooking, isPending: isCompleting } =
		useCompleteBooking(bookingDetails?.id, () => {
			updateDialogState("confirmCheckout", false);
			toast.success("Thanh toán thành công!", {
				duration: 5000,
				action: {
					label: "In hóa đơn",
					onClick: () => updateDialogState("printInvoice", true),
				},
			});
		});

	const { mutate: stopTable, isPending: isStopping } = useStopTable(
		initialBookingData?.id,
		() => updateDialogState("confirmStop", false),
	);

	const { mutate: updateOrder, isPending: isUpdatingOrder } = useUpdateOrder(
		initialBookingData?.id,
	);

	const { mutate: mergeBookings, isPending: isMergingBookings } =
		useMergeBookings(() => {
			onOpenChange(false);
			updateDialogState("merging", false);
			setSelectedTargetId(null);
		});

	// Fetch active bookings for merging
	const { data: allActiveBookings } = useActiveBookings(
		open,
		dialogStates.merging,
	);

	const otherActiveBookings = useMemo(() => {
		if (!allActiveBookings || !bookingDetails?.id) return [];
		return allActiveBookings.filter((b) => b.id !== bookingDetails.id);
	}, [allActiveBookings, bookingDetails?.id]);

	// Event handlers
	const handleCancelOrder = useCallback((orderId: string) => {
		setOrderToCancel(orderId);
	}, []);

	const confirmCancelOrder = useCallback(() => {
		if (orderToCancel) {
			updateOrder({
				id: orderToCancel,
				data: { status: "CANCELLED" },
			});
			setOrderToCancel(null);
		}
	}, [orderToCancel, updateOrder]);

	const handleCheckout = useCallback(() => {
		if (!bookingDetails) return;
		updateDialogState("confirmCheckout", true);
	}, [bookingDetails, updateDialogState]);

	const handleStopTable = useCallback(() => {
		if (!currentBookingTable) return;
		updateDialogState("confirmStop", true);
	}, [currentBookingTable, updateDialogState]);

	const confirmStopTable = useCallback(() => {
		if (!currentBookingTable) return;
		stopTable(currentBookingTable.id);
	}, [currentBookingTable, stopTable]);

	const confirmCheckout = useCallback(() => {
		if (!bookingDetails) return;

		updateDialogState("confirmCheckout", false);
		onOpenChange(false);

		completeBooking({
			id: bookingDetails.id,
			data: {
				paymentMethod: "CASH",
				endTime: new Date(),
			},
		});
	}, [bookingDetails, completeBooking, onOpenChange, updateDialogState]);

	const handleOpenOrder = useCallback(() => {
		if (bookingDetails?.id) {
			onOpenOrder(bookingDetails.id);
		}
	}, [bookingDetails?.id, onOpenOrder]);

	const handleMerge = useCallback(() => {
		if (!bookingDetails?.id || !selectedTargetId) return;
		mergeBookings({ targetId: selectedTargetId, sourceId: bookingDetails.id });
	}, [bookingDetails?.id, selectedTargetId, mergeBookings]);

	// Render helpers
	const statusBadgeClassName = useMemo(() => {
		if (bookingDetails?.status === "COMPLETED") {
			return "bg-green-100 text-green-700 border-green-200";
		}
		if (currentBookingTable?.endTime) {
			return "bg-gray-100 text-gray-600 border-gray-200";
		}
		return "bg-red-50 text-red-600 border-red-200";
	}, [bookingDetails?.status, currentBookingTable?.endTime]);

	const statusText = useMemo(() => {
		if (bookingDetails?.status === "COMPLETED") return "Đã thanh toán";
		if (currentBookingTable?.endTime) return "Đã ngừng";
		return "Đang chơi";
	}, [bookingDetails?.status, currentBookingTable?.endTime]);

	if (!table) return null;

	return (
		<>
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className="mx-auto flex h-auto max-w-2xl flex-col overflow-hidden rounded-t-xl">
					<DrawerHeader>
						<DrawerTitle className="flex items-center justify-between">
							<span>Chi tiết phiên chơi: {table.name}</span>
							<Badge variant="outline" className={cn(statusBadgeClassName)}>
								{statusText}
							</Badge>
						</DrawerTitle>
						<DrawerDescription className="flex flex-col">
							{bookingDetails?.status === "COMPLETED" ? (
								<>
									<span>
										Phiên chơi #{bookingDetails.id.slice(0, 8).toUpperCase()} đã
										hoàn thành
									</span>
									{bookingDetails.endTime && (
										<span className="text-xs opacity-80 mt-1">
											Kết thúc:{" "}
											{format(
												new Date(bookingDetails.endTime),
												"HH:mm, dd/MM/yyyy",
												{ locale: vi },
											)}
										</span>
									)}
								</>
							) : (
								"Quản lý đồ uống và thanh toán cho bàn này."
							)}
						</DrawerDescription>
					</DrawerHeader>

					{isLoadingBooking ? (
						<div className="flex h-64 items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : !bookingDetails ? (
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
													if (!sessionStartTime) return "---";
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
												onClick={() => updateDialogState("merging", true)}
											>
												<GitMerge className="h-3 w-3" />
												Gộp bill...
											</Button>
										)}
									</div>
								</div>

								{isMultiTable && bookingDetails.bookingTables && (
									<MultiTableInfo
										bookingTables={bookingDetails.bookingTables}
										currentTableId={table.id}
									/>
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
										disabled={!bookingDetails?.id}
									>
										<Plus className="mr-2 size-4" />
										Gọi món
									</Button>
								</div>

								<OrdersList
									orders={activeOrders}
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

						{bookingDetails?.status === "COMPLETED" ? (
							<Button
								onClick={() => updateDialogState("printInvoice", true)}
								className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
							>
								<Printer className="mr-2 h-4 w-4" />
								In hóa đơn
							</Button>
						) : (
							<>
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
									disabled={!bookingDetails || isCompleting}
									onClick={handleCheckout}
									className="flex-2 bg-green-600 text-white hover:bg-green-700 sm:flex-none"
								>
									<Receipt className="mr-2 h-4 w-4" />
									Thanh toán
								</Button>
							</>
						)}
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			{/* Confirm Dialogs */}
			<ConfirmDialog
				open={dialogStates.confirmCheckout}
				onOpenChange={(open) => updateDialogState("confirmCheckout", open)}
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
				open={dialogStates.confirmStop}
				onOpenChange={(open) => updateDialogState("confirmStop", open)}
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

			{/* Merging Drawer */}
			<MergeDrawer
				open={dialogStates.merging}
				onOpenChange={(open) => updateDialogState("merging", open)}
				otherBookings={otherActiveBookings}
				selectedTargetId={selectedTargetId}
				onSelectTarget={setSelectedTargetId}
				onConfirm={handleMerge}
				isLoading={isMergingBookings}
			/>

			{/* Print Invoice */}
			{dialogStates.printInvoice && bookingDetails && (
				<InvoicePrint
					data={{
						booking: bookingDetails,
						totalAmount,
						timeTotal: totalHourlyCost,
						serviceTotal,
					}}
					onPrintComplete={() => updateDialogState("printInvoice", false)}
				/>
			)}
		</>
	);
}
