"use client";

import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
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

const CURRENT_YEAR = new Date().getFullYear();
const YEARS_TO_SHOW = 3;
const MONTHS_IN_YEAR = 12;

const YEARS = Array.from({ length: YEARS_TO_SHOW }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);

interface StatisticsFiltersProps {
	dateFilter: string;
	setDateFilter: (value: string) => void;
	year: string;
	setYear: (value: string) => void;
	dateRange: DateRange | undefined;
	setDateRange: (value: DateRange | undefined) => void;
	dateRangeDisplay: string | null;
}

export function StatisticsFilters({
	dateFilter,
	setDateFilter,
	year,
	setYear,
	dateRange,
	setDateRange,
	dateRangeDisplay,
}: StatisticsFiltersProps) {
	const showYearSelect = dateFilter.startsWith("MONTH_");
	const showCustomDatePicker = dateFilter === "CUSTOM";

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
			<Select value={dateFilter} onValueChange={setDateFilter}>
				<SelectTrigger className="w-full sm:w-44">
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
					<SelectTrigger className="w-full sm:w-32">
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
							className="flex w-full sm:w-auto justify-start gap-2 px-2.5 font-normal"
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
	);
}
