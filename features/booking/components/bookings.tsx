"use client";

import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay, startOfWeek, subDays } from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Download,
	Filter,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/eden";
import type { GetBookingsQuery } from "@/shared/schemas/booking";
import { BookingCard } from "./booking-card";
import { BookingCardSkeleton } from "./booking-card-skeleton";
import { BookingDetailDrawer } from "./booking-detail-drawer";

export function Bookings() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("ALL");
	const [dateRange, setDateRange] = useState<string>("TODAY");
	const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
		null,
	);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	const getQueryFilters = (): GetBookingsQuery => {
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
			startDate: startDate?.toISOString(),
			endDate: endDate?.toISOString(),
			page,
			limit: 20,
		};
	};

	const { data: bookingsData, isLoading } = useQuery({
		queryKey: ["bookings", getQueryFilters()],
		queryFn: async () => {
			const res = await api.bookings.get({
				query: getQueryFilters(),
			});
			if (res.status === 200) {
				return res.data;
			}
			return {
				data: [],
				meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
			};
		},
	});

	const handleViewDetail = (id: string) => {
		setSelectedBookingId(id);
		setIsDetailOpen(true);
	};

	const totalPages = bookingsData?.meta?.totalPages || 1;

	return (
		<div className="flex flex-col">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<div className="flex items-center gap-2">
						<Select
							value={dateRange}
							onValueChange={(v) => {
								setDateRange(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-48">
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

						<Select
							value={status}
							onValueChange={(v) => {
								setStatus(v);
								setPage(1);
							}}
						>
							<SelectTrigger className="w-44">
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

			{/* Hiển thị thông tin lọc */}
			{bookingsData && (
				<div className="mt-2 text-sm text-muted-foreground">
					Hiển thị {bookingsData.data?.length || 0} trong tổng số{" "}
					{bookingsData.meta?.total || 0} phiên chơi
				</div>
			)}

			{/* Bookings Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{[...Array(8)].map((_, i) => (
						<BookingCardSkeleton key={i} />
					))}
				</div>
			) : bookingsData?.data && bookingsData.data.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{bookingsData.data.map((booking) => (
						<BookingCard
							key={booking.id}
							booking={booking}
							onViewDetail={handleViewDetail}
						/>
					))}
				</div>
			) : (
				<div className="flex h-76 flex-col items-center justify-center rounded-lg border border-dashed text-center">
					<div className="text-muted-foreground mb-2">
						Không tìm thấy booking nào
					</div>
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

			{/* Pagination - Fixed at bottom */}
			{bookingsData?.data && bookingsData.data.length > 0 && totalPages > 1 && (
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						Trang {page} trên {totalPages}
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							<ChevronLeft className="h-4 w-4 mr-1" /> Trước
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
						>
							Tiếp <ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>
			)}

			<BookingDetailDrawer
				open={isDetailOpen}
				onOpenChange={setIsDetailOpen}
				bookingId={selectedBookingId}
			/>
		</div>
	);
}
