"use client";

import { endOfDay, startOfDay, startOfWeek, subDays } from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	Download,
	Filter,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { OrderDetailDialog } from "@/features/order/components/order-detail-dialog";
import { OrdersList } from "@/features/order/components/orders-list";
import { useGetOrders } from "@/features/order/hooks/use-order";

export default function OrdersPage() {
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<string>("ALL");
	const [dateRange, setDateRange] = useState<string>("TODAY");
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
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
			limit: 10,
		};
	};

	const { data: ordersData, isLoading } = useGetOrders(getQueryFilters());

	const handleViewDetail = (id: string) => {
		setSelectedOrderId(id);
		setIsDetailOpen(true);
	};

	const totalPages = ordersData?.meta?.totalPages || 1;

	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Quản lý Đơn hàng
						</h1>
						<p className="text-muted-foreground">
							Theo dõi, cập nhật trạng thái và chi tiết các đơn hàng dịch vụ &
							sản phẩm.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							<Download className="mr-2 h-4 w-4" /> Xuất báo cáo
						</Button>
					</div>
				</div>

				<div className="space-y-4">
					{/* Filters Toolbar */}
					<div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border sm:flex-row sm:items-center">
						<div className="flex items-center gap-2 flex-1">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<Select
								value={dateRange}
								onValueChange={(v) => {
									setDateRange(v);
									setPage(1);
								}}
							>
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

							<Select
								value={status}
								onValueChange={(v) => {
									setStatus(v);
									setPage(1);
								}}
							>
								<SelectTrigger className="w-[180px] bg-white">
									<SelectValue placeholder="Trạng thái" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
									<SelectItem value="PENDING">Chờ xử lý</SelectItem>
									<SelectItem value="PREPARING">Đang chuẩn bị</SelectItem>
									<SelectItem value="DELIVERED">Đã giao</SelectItem>
									<SelectItem value="COMPLETED">Hoàn thành</SelectItem>
									<SelectItem value="CANCELLED">Đã hủy</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
							Hiển thị {ordersData?.data?.length || 0} /{" "}
							{ordersData?.meta?.total || 0} đơn hàng
						</div>
					</div>

					{/* Orders List */}
					{isLoading ? (
						<div className="space-y-3">
							{[...Array(5)].map((_, i) => (
								<div
									key={`skeleton-${i}`}
									className="h-16 w-full animate-pulse rounded-md bg-muted"
								/>
							))}
						</div>
					) : (
						<>
							<OrdersList
								orders={ordersData?.data || []}
								onViewDetail={handleViewDetail}
							/>

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
									<div className="text-sm font-medium bg-muted px-3 py-1 rounded-md">
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
					)}
				</div>

				<OrderDetailDialog
					open={isDetailOpen}
					onOpenChange={setIsDetailOpen}
					orderId={selectedOrderId}
				/>
			</Main>
		</>
	);
}
