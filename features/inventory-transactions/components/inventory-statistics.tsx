"use client";

import { useQuery } from "@tanstack/react-query";
import { endOfMonth, startOfMonth } from "date-fns";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Separator } from "@/components/ui/separator";
import { calculateDateRange, formatDateRangeDisplay } from "@/lib/date-utils";
import { api } from "@/lib/eden";
import {
	calculateProductStats,
	calculateTotalStats,
} from "../utils/calculate-stats";
import { StatisticsFilters } from "./statistics-filters";
import { StatisticsHeader } from "./statistics-header";
import { StatisticsSummaryCards } from "./statistics-summary-cards";
import { StatisticsTable } from "./statistics-table";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

export function InventoryStatistics() {
	const [dateFilter, setDateFilter] = useState<string>(
		`MONTH_${CURRENT_MONTH}`,
	);
	const [year, setYear] = useState<string>(CURRENT_YEAR.toString());
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
		from: startOfMonth(new Date()),
		to: endOfMonth(new Date()),
	}));

	const query = useMemo(
		() => calculateDateRange(dateFilter, year, dateRange),
		[dateFilter, year, dateRange],
	);

	const dateRangeDisplay = useMemo(
		() => formatDateRangeDisplay(dateFilter, year, dateRange),
		[dateFilter, year, dateRange],
	);

	const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
		queryKey: ["inventory-all", query],
		queryFn: async () =>
			await api.inventory.get({
				query: {
					startDate: query.startDate,
					endDate: query.endDate,
				},
			}),
	});

	const { data: productsData, isLoading: isLoadingProducts } = useQuery({
		queryKey: ["products-all"],
		queryFn: async () => await api.products.get(),
	});

	const productStats = useMemo(
		() => calculateProductStats(inventoryData?.data, productsData?.data),
		[inventoryData, productsData],
	);

	const totalStats = useMemo(
		() => calculateTotalStats(productStats),
		[productStats],
	);

	const isLoading = isLoadingInventory || isLoadingProducts;

	return (
		<div className="@container/main">
			<div className="flex flex-col gap-6 px-4 lg:px-6">
				<StatisticsHeader />

				<StatisticsFilters
					dateFilter={dateFilter}
					setDateFilter={setDateFilter}
					year={year}
					setYear={setYear}
					dateRange={dateRange}
					setDateRange={setDateRange}
					dateRangeDisplay={dateRangeDisplay}
				/>
				<StatisticsSummaryCards {...totalStats} />
				<Separator className="shadow-sm" />
				<StatisticsTable stats={productStats} isLoading={isLoading} />
			</div>
		</div>
	);
}
