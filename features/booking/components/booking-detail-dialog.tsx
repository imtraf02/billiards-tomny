"use client";

import { Clock, Receipt, User, Calendar, History, Package } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetBooking } from "@/features/booking/hooks/use-booking";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingId: string | null;
}

export function BookingDetailDialog({
    open,
    onOpenChange,
    bookingId,
}: BookingDetailDialogProps) {
    const { data: booking, isLoading } = useGetBooking(bookingId || "");

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            <span>Chi tiết phiên chơi</span>
                        </div>
                        {booking && (
                            <Badge variant="outline" className={statusColors[booking.status]}>
                                {statusLabels[booking.status]}
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Mã phiên: {bookingId.split('-')[0].toUpperCase()}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center py-12 text-muted-foreground italic">
                        Đang tải thông tin...
                    </div>
                ) : booking ? (
                    <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-6 py-4">
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
                                        <User className="h-3.5 w-3.5" /> Nhân viên:
                                    </span>
                                    <p className="font-medium">{booking.user?.name || "Khách vãng lai"}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Time details */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-1">
                                    <Clock className="h-4 w-4" /> Chi tiết thời gian & Bàn
                                </h3>
                                <div className="space-y-2">
                                    {booking.bookingTables.map((bt: any) => (
                                        <div key={bt.id} className="flex flex-col p-3 bg-muted/50 rounded-lg border">
                                            <div className="flex justify-between font-medium mb-1">
                                                <span>Bàn: {bt.table.name}</span>
                                                <span className="text-primary">
                                                    {new Intl.NumberFormat("vi-VN").format(bt.priceSnapshot)} đ/giờ
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex justify-between">
                                                <span>Bắt đầu: {format(new Date(bt.startTime), "HH:mm")}</span>
                                                <span>Kết thúc: {bt.endTime ? format(new Date(bt.endTime), "HH:mm") : "---"}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order details */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-1">
                                    <Package className="h-4 w-4" /> Đồ uống & Dịch vụ
                                </h3>
                                {booking.orders && booking.orders.length > 0 ? (
                                    <div className="space-y-2 border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm border-collapse">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="text-left py-2 px-3 font-medium">Tên món</th>
                                                    <th className="text-center py-2 px-3 font-medium">SL</th>
                                                    <th className="text-right py-2 px-3 font-medium">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {booking.orders.flatMap((o: any) => o.orderItems).map((item: any) => (
                                                    <tr key={item.id} className="border-t">
                                                        <td className="py-2 px-3">{item.product.name}</td>
                                                        <td className="py-2 px-3 text-center">x{item.quantity}</td>
                                                        <td className="py-2 px-3 text-right">
                                                            {new Intl.NumberFormat("vi-VN").format(item.priceSnapshot * item.quantity)}
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
                                    <span className="text-muted-foreground">Tổng cộng:</span>
                                    <span className="font-bold text-lg text-primary">
                                        {new Intl.NumberFormat("vi-VN").format(booking.totalAmount)} đ
                                    </span>
                                </div>
                                {booking.transaction && (
                                    <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
                                        <span className="flex items-center gap-1">
                                            <Receipt className="h-3 w-3" />
                                            Thanh toán: {paymentMethodLabels[booking.transaction.paymentMethod] || booking.transaction.paymentMethod}
                                        </span>
                                        <span>
                                            {format(new Date(booking.transaction.createdAt), "HH:mm, dd/MM/yyyy")}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {booking.note && (
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground">Ghi chú:</span>
                                    <p className="text-sm p-3 bg-muted rounded-md italic">"{booking.note}"</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="py-12 text-center text-red-500">
                        Không tìm thấy thông tin phiên chơi này.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
