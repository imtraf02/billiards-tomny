import {
	endOfDay,
	endOfMonth,
	format,
	startOfDay,
	startOfMonth,
} from "date-fns";
import type { DateRange } from "react-day-picker";

export const calculateDateRange = (
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

	return {
		startDate: startOfDay(startOfMonth(now)).toISOString(),
		endDate: endOfDay(endOfMonth(now)).toISOString(),
	};
};

export const formatDateRangeDisplay = (
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
