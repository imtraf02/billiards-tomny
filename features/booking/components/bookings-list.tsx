"use client";

import { Eye, Clock, Calendar, Hash, CreditCard } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInMinutes } from "date-fns";
import { vi } from "date-fns/locale";

interface BookingsListProps {
    bookings: any[];
    onViewDetail: (id: string) => void;
}

export function BookingsList({ bookings, onViewDetail }: BookingsListProps) {
    const statusLabels: Record<string, string> = {
        PENDING: "Đang chờ",
        CONFIRMED: "Đã xác nhận",
        CANCELLED: "Đã hủy",
        COMPLETED: "Hoàn thành",
    };

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
        CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
        CANCELLED: "bg-red-100 text-red-700 border-red-200",
        COMPLETED: "bg-green-100 text-green-700 border-green-200",
    };

    const formatDuration = (start: Date, end: Date | null) => {
        if (!end) return "---";
        const mins = differenceInMinutes(new Date(end), new Date(start));
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours}h ${remainingMins}m`;
    };

    return (
        <div className="rounded-md border bg-white overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>Bàn</TableHead>
                        <TableHead>Ngày/Giờ</TableHead>
                        <TableHead>Thời lượng</TableHead>
                        <TableHead className="text-right">Tổng tiền</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    #{booking.id.split("-")[0].toUpperCase()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {booking.bookingTables.map((bt: any) => (
                                            <Badge key={bt.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                {bt.table.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {format(new Date(booking.startTime), "dd/MM/yyyy")}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(booking.startTime), "HH:mm")} - {booking.endTime ? format(new Date(booking.endTime), "HH:mm") : "---"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-sm">
                                        <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                        {formatDuration(booking.startTime, booking.endTime)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold text-primary">
                                    {new Intl.NumberFormat("vi-VN").format(booking.totalAmount)} đ
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={`text-[11px] ${statusColors[booking.status]}`}>
                                        {statusLabels[booking.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewDetail(booking.id)}
                                        className="h-8 px-2"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Chi tiết
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-48 text-center text-muted-foreground italic">
                                Không tìm thấy dữ liệu phiên chơi nào.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
