"use client";

import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	CalendarIcon,
	Package,
	SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_ICON_MAP } from "@/features/products/data";
import { calculateDateRange, formatDateRangeDisplay } from "@/lib/date-utils";
import { api } from "@/lib/eden";
import { formatVND } from "@/lib/format";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS_TO_SHOW = 3;
const MONTHS_IN_YEAR = 12;

const YEARS = Array.from({ length: YEARS_TO_SHOW }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);

export function InventoryBatches({ productId }: { productId: string | null }) {
	const [dateFilter, setDateFilter] = useState<string>(
		`MONTH_${CURRENT_MONTH}`,
	);
	const [year, setYear] = useState<string>(CURRENT_YEAR.toString());
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
		from: startOfMonth(new Date()),
		to: endOfMonth(new Date()),
	}));
	const [sort, setSort] = useState<string>("created_at_desc");

	const query = useMemo(
		() => calculateDateRange(dateFilter, year, dateRange),
		[dateFilter, year, dateRange],
	);

	const dateRangeDisplay = useMemo(
		() => formatDateRangeDisplay(dateFilter, year, dateRange),
		[dateFilter, year, dateRange],
	);

	const showYearSelect = dateFilter.startsWith("MONTH_");
	const showCustomDatePicker = dateFilter === "CUSTOM";

	const { data, isLoading } = useQuery({
		queryKey: ["inventory-batches", productId, query],
		queryFn: async () =>
			await api["inventory-batch"].get({
				query: {
					startDate: query.startDate,
					endDate: query.endDate,
					productId: productId || undefined,
				},
			}),
	});

	const sortedData = useMemo(() => {
		if (!data?.data) return [];

		const sorted = [...data.data];

		if (sort === "created_at_desc") {
			return sorted.sort(
				(a, b) =>
					new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime(),
			);
		} else {
			return sorted.sort(
				(a, b) =>
					new Date(a.importedAt).getTime() - new Date(b.importedAt).getTime(),
			);
		}
	}, [data?.data, sort]);

	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Lô hàng</h1>
					<p className="text-muted-foreground"></p>
				</div>
			</div>
			<div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
				<div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
					<Select value={dateFilter} onValueChange={setDateFilter}>
						<SelectTrigger className="w-44">
							<SelectValue placeholder="Thời gian" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="TODAY">Hôm nay</SelectItem>
							<SelectItem value="CUSTOM">Tùy chỉnh...</SelectItem>
							{MONTHS.map((m) => (
								<SelectItem key={m} value={`MONTH_${m}`}>
									Tháng {m}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{showYearSelect && (
						<Select value={year} onValueChange={setYear}>
							<SelectTrigger className="w-32">
								<SelectValue placeholder="Năm" />
							</SelectTrigger>
							<SelectContent>
								{YEARS.map((y) => (
									<SelectItem key={y} value={y.toString()}>
										Năm {y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}

					{showCustomDatePicker && (
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									id="date-picker-range"
									className="justify-start px-2.5 font-normal"
								>
									<CalendarIcon />
									{dateRangeDisplay || "Chọn khoảng thời gian"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="range"
									selected={dateRange}
									onSelect={setDateRange}
									numberOfMonths={2}
								/>
							</PopoverContent>
						</Popover>
					)}
				</div>
				<Select value={sort} onValueChange={setSort}>
					<SelectTrigger className="w-16">
						<SelectValue>
							<SlidersHorizontal />
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="end" position="popper">
						<SelectItem value="created_at_desc">
							<div className="flex items-center gap-4">
								<ArrowUpAZ />
								<span>Mới nhất</span>
							</div>
						</SelectItem>
						<SelectItem value="created_at_asc">
							<div className="flex items-center gap-4">
								<ArrowDownAZ />
								<span>Cũ nhất</span>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Separator className="shadow-sm" />

			<ul className="faded-bottom no-scrollbar overflow-auto pt-4 pb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{isLoading ? (
					Array.from({ length: 12 }, (_, i) => (
						<Skeleton key={i} className="h-65.75" />
					))
				) : sortedData.length === 0 ? (
					<li className="text-muted-foreground col-span-full">
						Không tìm thấy giao dịch
					</li>
				) : (
					sortedData.map((batch) => {
						const Icon =
							batch.product.category.name in CATEGORY_ICON_MAP
								? CATEGORY_ICON_MAP[
										batch.product.category
											.name as keyof typeof CATEGORY_ICON_MAP
									]
								: Package;
						return (
							<li
								key={batch.id}
								className="rounded-lg border p-4 hover:shadow-md"
							>
								<div className="mb-4 flex items-start justify-between">
									<div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2">
										<Icon className="size-5 text-muted-foreground" />
									</div>
								</div>
								<div>
									<h2 className="mb-1 font-semibold">{batch.product.name}</h2>
									<p className="text-xs text-muted-foreground mb-3">
										{format(new Date(batch.importedAt), "dd/MM/yyyy HH:mm")}
									</p>
									<div className="space-y-1 text-sm text-muted-foreground">
										<div className="flex justify-between">
											<span>Số lượng</span>
											<span className="font-medium text-foreground">
												{batch.quantity.toLocaleString("vi-VN")}{" "}
												{batch.product.unit}
											</span>
										</div>
										<div className="flex justify-between">
											<span>Đơn giá</span>
											<span>{formatVND(batch.costPerUnit)}</span>
										</div>
										<div className="pt-2 border-t mt-2 flex justify-between">
											<span>Tổng tiền</span>
											<span className="font-medium text-foreground">
												{formatVND(batch.quantity * batch.costPerUnit)}
											</span>
										</div>
									</div>
								</div>
							</li>
						);
					})
				)}
			</ul>
		</>
	);
}
