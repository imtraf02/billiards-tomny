"use client";

import {
	endOfDay,
	endOfMonth,
	format,
	startOfDay,
	startOfMonth,
} from "date-fns";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	Download,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseBreakdownComponent } from "@/features/finance/components/ExpenseBreakdown";
import { FinanceChart } from "@/features/finance/components/FinanceChart";
import { FinanceSummaryCards } from "@/features/finance/components/FinanceSummaryCards";
import { ProductAnalysisTable } from "@/features/finance/components/ProductAnalysisTable";
import { RevenueBreakdownComponent } from "@/features/finance/components/RevenueBreakdown";
import { TransactionList } from "@/features/finance/components/TransactionList";
import { useFinanceAnalytics } from "@/features/finance/hooks/use-finance";

export default function FinancePage() {
	const [dateFilter, setDateFilter] = useState<string>(
		`MONTH_${new Date().getMonth() + 1}`,
	);
	const [year, setYear] = useState<string>(new Date().getFullYear().toString());
	const [showCalendar, setShowCalendar] = useState(false);

	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: startOfMonth(new Date()),
		to: endOfMonth(new Date()),
	});

	const years = useMemo(
		() => Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i),
		[],
	);
	const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

	// Calculate date range query
	const getQuery = () => {
		if (dateFilter === "CUSTOM" && dateRange?.from) {
			return {
				startDate: startOfDay(dateRange.from).toISOString(),
				endDate: dateRange.to
					? endOfDay(dateRange.to).toISOString()
					: endOfDay(dateRange.from).toISOString(),
			};
		}

		if (dateFilter.startsWith("MONTH_")) {
			const m = Number.parseInt(dateFilter.split("_")[1]);
			const start = new Date(Number.parseInt(year), m - 1, 1);
			return {
				startDate: startOfDay(start).toISOString(),
				endDate: endOfDay(endOfMonth(start)).toISOString(),
			};
		}

		const now = new Date();
		if (dateFilter === "TODAY") {
			return {
				startDate: startOfDay(now).toISOString(),
				endDate: endOfDay(now).toISOString(),
			};
		}

		return {
			startDate: startOfMonth(now).toISOString(),
			endDate: endOfMonth(now).toISOString(),
		};
	};

	const query = useMemo(
		() => ({
			startDate: getQuery().startDate,
			endDate: getQuery().endDate,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[dateFilter, year, dateRange],
	);

	const { data: analytics, isLoading } = useFinanceAnalytics(query);

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
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/app/inventory">
							<ChevronLeft className="h-4 w-4" />
						</Link>
					</Button>
					<h1 className="text-xl font-bold">Phân tích tài chính</h1>
				</div>
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Tổng quan tài chính
						</h2>
						<p className="text-muted-foreground">
							Phân tích chi tiết doanh thu, chi phí và lợi nhuận
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Select value={dateFilter} onValueChange={setDateFilter}>
							<SelectTrigger className="w-44">
								<SelectValue placeholder="Thời gian" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="TODAY">Hôm nay</SelectItem>
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
								{getDateRangeDisplay() || "Chọn ngày"}
							</Button>
						)}
						<Button variant="outline">
							<Download className="mr-2 h-4 w-4" /> Xuất dữ liệu
						</Button>
					</div>
				</div>

				{showCalendar && dateFilter === "CUSTOM" && (
					<div className="mb-6 rounded-lg border bg-card p-4">
						<Calendar
							mode="range"
							selected={dateRange}
							onSelect={setDateRange}
							numberOfMonths={2}
						/>
					</div>
				)}

				{isLoading ? (
					<div className="space-y-6">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{[...Array(4)].map((_, i) => (
								<Skeleton key={`skeleton-${i}`} className="h-24 w-full" />
							))}
						</div>
						<Skeleton className="h-96 w-full" />
					</div>
				) : (
					analytics && (
						<div className="space-y-6">
							{/* Summary Cards */}
							<FinanceSummaryCards data={analytics} />

							{/* Revenue and Expense Breakdown */}
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
								<RevenueBreakdownComponent data={analytics.revenue} />
								<ExpenseBreakdownComponent data={analytics.expense} />
							</div>

							{/* Trends Chart */}
							<FinanceChart
								data={analytics.trends}
								title="Biểu đồ xu hướng tài chính"
							/>

							{/* Product Analysis */}
							<ProductAnalysisTable products={analytics.products} />

							{/* Transaction List */}
							<TransactionList transactions={analytics.transactions} />
						</div>
					)
				)}
			</Main>
		</>
	);
}
