"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetBookings } from "@/features/booking/hooks/use-booking";
import { BookingCard } from "./booking-card";
import { BookingDetailDialog } from "./booking-detail-dialog";
import { format, startOfDay, endOfDay, subDays, startOfWeek } from "date-fns";
import { BookingCardSkeleton } from "./booking-card-skeleton";

export function Bookings() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<string>("ALL");
    const [dateRange, setDateRange] = useState<string>("TODAY");
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const getQueryFilters = () => {
        const now = new Date();
        let startDate: Date | undefined;
        let endDate: Date | undefined = endOfDay(now);

        switch (dateRange) {
            case "TODAY":
                startDate = startOfDay(now);
                break;
            case "YESTERDAY":
                startDate = startOfDay(subDays(now, 1));
                endDate = endOfDay(subDays(now, 1));
                break;
            case "WEEK":
                startDate = startOfWeek(now, { weekStartsOn: 1 });
                break;
            case "ALL":
                startDate = undefined;
                endDate = undefined;
                break;
        }

        return {
            status: status !== "ALL" ? (status as any) : undefined,
            startDate,
            endDate,
            page,
            limit: 12, // Tăng limit để phù hợp với grid
        };
    };

    const { data: bookingsData, isLoading } = useGetBookings(getQueryFilters());

    const handleViewDetail = (id: string) => {
        setSelectedBookingId(id);
        setIsDetailOpen(true);
    };

    const totalPages = bookingsData?.meta?.totalPages || 1;

    return (
        <div className="space-y-4">
            {/* Filters Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setPage(1); }}>
                            <SelectTrigger className="w-[160px] bg-white">
                                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                <SelectValue placeholder="Thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODAY">Hôm nay</SelectItem>
                                <SelectItem value="YESTERDAY">Hôm qua</SelectItem>
                                <SelectItem value="WEEK">Tuần này</SelectItem>
                                <SelectItem value="ALL">Tất cả thời gian</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                            <SelectTrigger className="w-[160px] bg-white">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
                                <SelectItem value="PENDING">Đang chơi</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Bookings Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <BookingCardSkeleton key={i} />
                    ))}
                </div>
            ) : bookingsData?.data && bookingsData.data.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {bookingsData.data.map((booking: any) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onViewDetail={handleViewDetail}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Trước
                            </Button>
                            <div className="text-sm font-medium">
                                Trang {page} / {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Tiếp <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
                    <p className="text-muted-foreground">Không tìm thấy booking nào.</p>
                    <Button
                        variant="link"
                        onClick={() => {
                            setStatus("ALL");
                            setDateRange("ALL");
                            setPage(1);
                        }}
                    >
                        Xóa bộ lọc
                    </Button>
                </div>
            )}

            <BookingDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                bookingId={selectedBookingId}
            />
        </div>
    );
}
