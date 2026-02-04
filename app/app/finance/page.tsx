"use client";

import {
	endOfDay,
	endOfMonth,
	format,
	startOfDay,
	startOfMonth,
} from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
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

// Constants
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS_TO_SHOW = 3;
const MONTHS_IN_YEAR = 12;

// Helper functions moved outside component
const calculateDateRange = (
	dateFilter: string,
	year: string,
	dateRange?: DateRange,
) => {
	if (dateFilter === "CUSTOM" && dateRange?.from) {
		return {
			startDate: startOfDay(dateRange.from).toISOString(),
			endDate: dateRange.to
				? endOfDay(dateRange.to).toISOString()
				: endOfDay(dateRange.from).toISOString(),
		};
	}

	if (dateFilter.startsWith("MONTH_")) {
		const month = Number.parseInt(dateFilter.split("_")[1], 10);
		const start = new Date(Number.parseInt(year, 10), month - 1, 1);
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

	// Default to current month
	return {
		startDate: startOfMonth(now).toISOString(),
		endDate: endOfMonth(now).toISOString(),
	};
};

const formatDateRangeDisplay = (
	dateFilter: string,
	year: string,
	dateRange?: DateRange,
) => {
	if (dateFilter === "CUSTOM" && dateRange?.from) {
		const from = format(dateRange.from, "dd/MM/yyyy");
		const to = dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : from;
		return `${from} - ${to}`;
	}
	if (dateFilter.startsWith("MONTH_")) {
		const month = dateFilter.split("_")[1];
		return `Tháng ${month}/${year}`;
	}
	return null;
};

// Memoized sub-components
const LoadingSkeleton = memo(() => (
	<div className="space-y-6">
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<Skeleton key={i} className="h-24 w-full" />
			))}
		</div>
		<Skeleton className="h-96 w-full" />
	</div>
));
LoadingSkeleton.displayName = "LoadingSkeleton";

const DateFilterControls = memo<{
	dateFilter: string;
	year: string;
	dateRange?: DateRange;
	showCalendar: boolean;
	years: number[];
	months: number[];
	onDateFilterChange: (value: string) => void;
	onYearChange: (value: string) => void;
	onToggleCalendar: () => void;
	onExport: () => void;
}>(
	({
		dateFilter,
		year,
		dateRange,
		showCalendar,
		years,
		months,
		onDateFilterChange,
		onYearChange,
		onToggleCalendar,
		onExport,
	}) => {
		const dateRangeDisplay = formatDateRangeDisplay(
			dateFilter,
			year,
			dateRange,
		);

		return (
			<div className="flex items-center gap-2">
				<Select value={dateFilter} onValueChange={onDateFilterChange}>
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
					<Select value={year} onValueChange={onYearChange}>
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
						onClick={onToggleCalendar}
						className="gap-2"
					>
						<CalendarIcon className="h-4 w-4" />
						{dateRangeDisplay || "Chọn ngày"}
					</Button>
				)}

				<Button variant="outline" onClick={onExport}>
					<Download className="mr-2 h-4 w-4" /> Xuất dữ liệu
				</Button>
			</div>
		);
	},
);

const FinanceAnalytics = memo<{ analytics: any }>(({ analytics }) => (
	<div className="space-y-6">
		<FinanceSummaryCards data={analytics} />

		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<RevenueBreakdownComponent data={analytics.revenue} />
			<ExpenseBreakdownComponent data={analytics.expense} />
		</div>

		<FinanceChart data={analytics.trends} title="Biểu đồ xu hướng tài chính" />

		<ProductAnalysisTable products={analytics.products} />

		<TransactionList transactions={analytics.transactions} />
	</div>
));
FinanceAnalytics.displayName = "FinanceAnalytics";

export default function FinancePage() {
	// State
	const [dateFilter, setDateFilter] = useState<string>(
		`MONTH_${CURRENT_MONTH}`,
	);
	const [year, setYear] = useState<string>(CURRENT_YEAR.toString());
	const [showCalendar, setShowCalendar] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange | undefined>({
		from: startOfMonth(new Date()),
		to: endOfMonth(new Date()),
	});

	const years = useMemo(
		() => Array.from({ length: YEARS_TO_SHOW }, (_, i) => CURRENT_YEAR - i),
		[],
	);

	const months = useMemo(
		() => Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1),
		[],
	);

	// Calculate query parameters
	const query = useMemo(
		() => calculateDateRange(dateFilter, year, dateRange),
		[dateFilter, year, dateRange],
	);

	// API call
	const { data: analytics, isLoading } = useFinanceAnalytics(query);

	// Callbacks
	const handleToggleCalendar = useCallback(() => {
		setShowCalendar((prev) => !prev);
	}, []);

	const handleExport = useCallback(() => {
		// TODO: Implement export functionality
		console.log("Export data", query);
	}, [query]);

	return (
		<>
			<Header>
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

					<DateFilterControls
						dateFilter={dateFilter}
						year={year}
						dateRange={dateRange}
						showCalendar={showCalendar}
						years={years}
						months={months}
						onDateFilterChange={setDateFilter}
						onYearChange={setYear}
						onToggleCalendar={handleToggleCalendar}
						onExport={handleExport}
					/>
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
					<LoadingSkeleton />
				) : analytics ? (
					<FinanceAnalytics analytics={analytics} />
				) : null}
			</Main>
		</>
	);
}
