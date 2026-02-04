"use client";

import {
	endOfDay,
	endOfMonth,
	endOfWeek,
	format,
	startOfDay,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import {
	Calendar as CalendarIcon,
	Download,
	Filter,
	Search as SearchIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { InventoryList } from "@/features/inventory/components/inventory-list";
import { useGetInventoryLogs } from "@/features/product/hooks/use-product";
import type { GetInventoryLogsQuery } from "@/shared/schemas/product";

type TypeFilter = "ALL" | "IN" | "OUT";

export default function InventoryPage() {
	const [type, setType] = useState<TypeFilter>("ALL");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [dateFilter, setDateFilter] = useState<string>("ALL");
	const [year, setYear] = useState<string>(new Date().getFullYear().toString());
	const [showCalendar, setShowCalendar] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange | undefined>();

	const years = Array.from(
		{ length: 3 },
		(_, i) => new Date().getFullYear() - i,
	);
	const months = Array.from({ length: 12 }, (_, i) => i + 1);

	const skeletonIds = useMemo(() => Array.from({ length: 6 }, () => crypto.randomUUID()), []);

	// Calculate date range based on filter or custom range
	const getDateRangeQuery = () => {
		const now = new Date();

		// If custom date range is selected, use it
		if (dateFilter === "CUSTOM" && dateRange?.from) {
			return {
				startDate: startOfDay(dateRange.from).toISOString(),
				endDate: dateRange.to
					? endOfDay(dateRange.to).toISOString()
					: endOfDay(dateRange.from).toISOString(),
			};
		}

		if (dateFilter.startsWith("MONTH_")) {
			const m = Number(dateFilter.split("_")[1]);
			const start = new Date(Number(year), m - 1, 1);
			return {
				startDate: startOfDay(start).toISOString(),
				endDate: endOfDay(endOfMonth(start)).toISOString(),
			};
		}

		// Otherwise use preset filters
		switch (dateFilter) {
			case "TODAY":
				return {
					startDate: startOfDay(now).toISOString(),
					endDate: endOfDay(now).toISOString(),
				};
			case "WEEK":
				return {
					startDate: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
					endDate: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
				};
			case "MONTH":
				return {
					startDate: startOfMonth(now).toISOString(),
					endDate: endOfMonth(now).toISOString(),
				};
			default:
				return {};
		}
	};

	const dateRangeQuery = getDateRangeQuery();

	const query: GetInventoryLogsQuery = {
		page,
		limit: 20,
		...dateRangeQuery,
		...(type !== "ALL" && { type: type as "IN" | "OUT" }),
	};

	const { data, isLoading } = useGetInventoryLogs(query);

	// Format date range display
	const getDateRangeDisplay = () => {
		if (dateFilter === "CUSTOM" && dateRange?.from) {
			const from = format(dateRange.from, "dd/MM/yyyy");
			const to = dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : from;
			return `${from} - ${to}`;
		}
		if (dateFilter.startsWith("MONTH_")) {
			const m = dateFilter.split("_")[1];
			return `Tháng ${m}/${year}`;
		}
		return null;
	};

	return (
		<>
			<Header>
				<div className="relative w-full max-w-sm">
					<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Tìm theo sản phẩm, ghi chú..."
						className="pl-9"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Lịch sử kho</h1>
						<p className="text-muted-foreground">
							Theo dõi mọi biến động nhập, xuất và điều chỉnh tồn kho.
						</p>
					</div>
					<Button variant="outline" size="sm">
						<Download className="mr-2 h-4 w-4" /> Xuất báo cáo
					</Button>
				</div>

				{/* Calendar Picker */}
				{showCalendar && dateFilter === "CUSTOM" && (
					<div className="rounded-lg border bg-card p-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-medium">Chọn khoảng thời gian</h3>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowCalendar(false)}
							>
								Đóng
							</Button>
						</div>
						<Calendar
							mode="range"
							selected={dateRange}
							onSelect={setDateRange}
							numberOfMonths={2}
							captionLayout="dropdown"
							formatters={{
								formatMonthDropdown: (date) =>
									date.toLocaleString("vi-VN", { month: "long" }),
							}}
						/>
					</div>
				)}

				<div className="space-y-4">
					{/* Filters */}
					<div className="flex items-center gap-2 flex-wrap">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<Select value={type} onValueChange={(value) => setType(value as TypeFilter)}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Loại giao dịch" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">Tất cả loại</SelectItem>
								<SelectItem value="IN">Nhập kho</SelectItem>
								<SelectItem value="OUT">Xuất kho</SelectItem>
							</SelectContent>
						</Select>

						<Select value={dateFilter} onValueChange={setDateFilter}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Thời gian" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">Tất cả thời gian</SelectItem>
								<SelectItem value="TODAY">Hôm nay</SelectItem>
								<SelectItem value="WEEK">Tuần này</SelectItem>
								<SelectItem value="CUSTOM">Tùy chỉnh...</SelectItem>
								{months.map((m) => (
									<SelectItem key={m} value={`MONTH_${m}`}>
										Tháng {m}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{dateFilter.startsWith("MONTH_") && (
							<Select value={year} onValueChange={setYear}>
								<SelectTrigger className="w-32">
									<SelectValue placeholder="Năm" />
								</SelectTrigger>
								<SelectContent>
									{years.map((y) => (
										<SelectItem key={y} value={y.toString()}>
											Năm {y}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						{dateFilter === "CUSTOM" && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowCalendar(!showCalendar)}
								className="gap-2"
							>
								<CalendarIcon className="h-4 w-4" />
								{getDateRangeDisplay() || "Chọn khoảng thời gian"}
							</Button>
						)}
					</div>

					{/* Logs List */}
					{isLoading ? (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{skeletonIds.map((id) => (
								<Skeleton key={id} className="h-64 w-full" />
							))}
						</div>
					) : (
						<>
							<InventoryList logs={data?.data || []} />

							{/* Pagination */}
							{data && data.meta.totalPages > 1 && (
								<div className="flex items-center justify-end space-x-2 py-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										Trước
									</Button>
									<div className="text-sm font-medium">
										Trang {data.meta.page} / {data.meta.totalPages}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setPage((p) => Math.min(data.meta.totalPages, p + 1))
										}
										disabled={page === data.meta.totalPages}
									>
										Sau
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</Main>
		</>
	);
}
