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
import { INVENTORY_TRANSACTION_TYPES } from "../data";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS_TO_SHOW = 3;
const MONTHS_IN_YEAR = 12;

const YEARS = Array.from({ length: YEARS_TO_SHOW }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);

export function InventoryTransactions({ productId }: { productId?: string }) {
	const [dateFilter, setDateFilter] = useState<string>(
		`MONTH_${CURRENT_MONTH}`,
	);
	const [year, setYear] = useState<string>(CURRENT_YEAR.toString());
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
		from: startOfMonth(new Date()),
		to: endOfMonth(new Date()),
	}));
	const [sort, setSort] = useState<string>("created_at_desc");
	const [typeFilter, setTypeFilter] = useState<string>("ALL");
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
		queryKey: ["inventory-transactions", productId, query],
		queryFn: async () =>
			await api.inventory.get({
				query: {
					startDate: query.startDate,
					endDate: query.endDate,
					productId: productId,
				},
			}),
	});

	const sortData = useMemo(() => {
		if (!data?.data) return [];

		// Filter by type first
		let filteredData = [...data.data];

		if (typeFilter !== "ALL") {
			filteredData = filteredData.filter(
				(transaction) => transaction.type === typeFilter,
			);
		}

		// Then sort
		switch (sort) {
			case "created_at_asc":
				return filteredData.sort(
					(a, b) =>
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
				);
			case "created_at_desc":
				return filteredData.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);
			case "quantity_asc":
				return filteredData.sort((a, b) => a.quantity - b.quantity);
			case "quantity_desc":
				return filteredData.sort((a, b) => b.quantity - a.quantity);
			case "total_asc":
				return filteredData.sort(
					(a, b) => a.quantity * a.cost - b.quantity * b.cost,
				);
			case "total_desc":
				return filteredData.sort(
					(a, b) => b.quantity * b.cost - a.quantity * a.cost,
				);
			default:
				return filteredData;
		}
	}, [data, sort, typeFilter]);

	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Nhật ký kho</h1>
					<p className="text-muted-foreground">
						Quản lý các giao dịch trong kho.
					</p>
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

					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-44">
							<SelectValue placeholder="Loại giao dịch" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả</SelectItem>
							{Object.entries(INVENTORY_TRANSACTION_TYPES).map(
								([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
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
						<SelectItem value="quantity_desc">
							<div className="flex items-center gap-4">
								<ArrowDownAZ />
								<span>Số lượng (Cao → Thấp)</span>
							</div>
						</SelectItem>
						<SelectItem value="quantity_asc">
							<div className="flex items-center gap-4">
								<ArrowUpAZ />
								<span>Số lượng (Thấp → Cao)</span>
							</div>
						</SelectItem>
						<SelectItem value="total_desc">
							<div className="flex items-center gap-4">
								<ArrowDownAZ />
								<span>Tổng tiền (Cao → Thấp)</span>
							</div>
						</SelectItem>
						<SelectItem value="total_asc">
							<div className="flex items-center gap-4">
								<ArrowUpAZ />
								<span>Tổng tiền (Thấp → Cao)</span>
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
				) : sortData.length === 0 ? (
					<li className="text-muted-foreground col-span-full">
						Không tìm thấy giao dịch
					</li>
				) : (
					sortData.map((transaction) => {
						const totalAmount = transaction.cost * transaction.quantity;
						const Icon =
							transaction.product.category.name in CATEGORY_ICON_MAP
								? CATEGORY_ICON_MAP[
										transaction.product.category
											.name as keyof typeof CATEGORY_ICON_MAP
									]
								: Package;
						return (
							<li
								key={transaction.id}
								className="rounded-lg border p-4 hover:shadow-md"
							>
								<div className="mb-4 flex items-start justify-between">
									<div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2">
										<Icon className="size-5 text-muted-foreground" />
									</div>
									<Badge
										variant={
											transaction.type === "SALE" ||
											transaction.type === "INTERNAL"
												? "success"
												: transaction.type === "IMPORT" ||
														transaction.type === "SPOILAGE"
													? "destructive"
													: "outline"
										}
									>
										{INVENTORY_TRANSACTION_TYPES[transaction.type]}
									</Badge>
								</div>
								<div>
									<h2 className="mb-1 font-semibold">
										{transaction.product.name}
									</h2>
									<p className="text-xs text-muted-foreground mb-3">
										{format(
											new Date(transaction.createdAt),
											"dd/MM/yyyy HH:mm",
										)}
									</p>
									<div className="space-y-1 text-sm text-muted-foreground">
										<div className="flex justify-between">
											<span>Số lượng</span>
											<span className="font-medium text-foreground">
												{transaction.quantity.toLocaleString("vi-VN")}{" "}
												{transaction.product.unit}
											</span>
										</div>
										<div className="flex justify-between">
											<span>Giá nhập</span>
											<span>{formatVND(transaction.cost)}</span>
										</div>
										<div className="flex justify-between">
											<span>Tổng tiền</span>
											<span className="font-medium text-foreground">
												{formatVND(totalAmount)}
											</span>
										</div>
										<div className="pt-2 border-t mt-2">
											<p className="text-xs line-clamp-2">
												<span className="font-medium">Ghi chú: </span>
												{transaction.note}
											</p>
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
