"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, Receipt, XCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Table } from "@/generated/prisma/client";
import { useGetBookings, useCompleteBooking, useGetBooking } from "@/features/booking/hooks";
import { useUpdateOrder } from "@/features/order/hooks/use-order";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

interface TableSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    table: Table | null;
    onOpenOrder: (bookingId: string) => void;
}

export function TableSessionDialog({
    open,
    onOpenChange,
    table,
    onOpenOrder,
}: TableSessionDialogProps) {
    const [duration, setDuration] = useState<string>("00:00:00");

    // Find active booking for this table
    const { data: bookingsData, isLoading: isLoadingList } = useGetBookings({
        tableId: table?.id,
        status: "PENDING",
        limit: 1,
        page: 1,
    });

    const activeBookingBasic = bookingsData?.data?.[0];
    const { data: activeBooking, isLoading: isLoadingDetail } = useGetBooking(activeBookingBasic?.id || "");

    const isLoading = isLoadingList || isLoadingDetail;
    const { mutate: completeBooking, isPending: isCompleting } = useCompleteBooking(() => {
        toast.success("Thanh toán thành công!");
        onOpenChange(false);
    });

    const { mutate: updateOrder, isPending: isUpdatingOrder } = useUpdateOrder(() => {
        toast.success("Đã cập nhật đơn hàng!");
    });

    useEffect(() => {
        if (!activeBooking) return;

        const interval = setInterval(() => {
            const start = new Date(activeBooking.startTime);
            const now = new Date();
            const diff = now.getTime() - start.getTime();

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setDuration(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [activeBooking]);

    const handleCancelOrder = (orderId: string) => {
        if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
            updateOrder({
                id: orderId,
                data: { status: "CANCELLED" as any },
            });
        }
    };

    const handleCheckout = () => {
        if (!activeBooking) return;
        if (confirm("Xác nhận thanh toán và kết thúc phiên chơi?")) {
            completeBooking({
                id: activeBooking.id,
                data: {
                    paymentMethod: "CASH",
                    endTime: new Date(),
                },
            });
        }
    };

    if (!table) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Chi tiết phiên chơi: {table.name}</span>
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                            Đang chơi
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Quản lý đồ uống và thanh toán cho bàn này.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
                ) : activeBooking ? (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Bắt đầu</span>
                                <div className="flex items-center font-medium">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {format(new Date(activeBooking.startTime), "HH:mm, dd/MM", { locale: vi })}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Thời gian đã chơi</span>
                                <div className="text-2xl font-mono font-bold text-primary">
                                    {duration}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold px-1">Dịch vụ & Sản phẩm</h3>
                                <Button variant="outline" size="sm" onClick={() => onOpenOrder(activeBooking.id)}>
                                    <Plus className="mr-2 h-3.5 w-3.5" />
                                    Gọi món
                                </Button>
                            </div>

                            {activeBooking && (activeBooking as any).orders && (activeBooking as any).orders.length > 0 ? (
                                <div className="max-h-[200px] overflow-y-auto space-y-3">
                                    {(activeBooking as any).orders.map((order: any) => (
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
                                                {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        disabled={isUpdatingOrder}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {order.orderItems.map((item: any) => (
                                                <div key={item.id} className="flex justify-between py-1 text-xs">
                                                    <span>{item.product.name} x{item.quantity}</span>
                                                    <span className="text-muted-foreground">
                                                        {new Intl.NumberFormat("vi-VN").format(item.priceSnapshot * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-center py-4 text-muted-foreground italic">
                                    Chưa có sản phẩm nào được gọi.
                                </p>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tiền giờ tạm tính:</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat("vi-VN").format(
                                        Math.ceil(((new Date().getTime() - new Date(activeBooking.startTime).getTime()) / 3600000) * table.hourlyRate)
                                    )} đ
                                </span>
                            </div>
                            {activeBooking && (activeBooking as any).orders && (activeBooking as any).orders.length > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tiền dịch vụ:</span>
                                    <span className="font-medium">
                                        {new Intl.NumberFormat("vi-VN").format(
                                            (activeBooking as any).orders.reduce((acc: number, order: any) => acc + Number(order.totalAmount), 0)
                                        )} đ
                                    </span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between text-base font-bold text-primary">
                                <span>Tổng cộng:</span>
                                <span>
                                    {new Intl.NumberFormat("vi-VN").format(
                                        Math.ceil(((new Date().getTime() - new Date(activeBooking.startTime).getTime()) / 3600000) * table.hourlyRate) +
                                        (activeBooking as any).orders.reduce((acc: number, order: any) => acc + Number(order.totalAmount), 0)
                                    )} đ
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-red-500">
                        Không tìm thấy thông tin phiên chơi.
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
