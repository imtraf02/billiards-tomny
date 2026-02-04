"use client";

import {
	endOfDay,
	endOfMonth,
	format,
	startOfDay,
	startOfMonth,
} from "date-fns";
import {
	ArrowDownLeft,
	ArrowUpRight,
	Calendar as CalendarIcon,
	ChevronLeft,
	Download,
	Search as SearchIcon,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import {
	type GetInventoryAnalysisQuery,
	type InventoryProductAnalysis,
} from "@/shared/schemas/product";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type SortBy = "income" | "profit" | "soldQuantity" | "importedQuantity";

export default function AnalysisPage() {
	const [dateFilter, setDateFilter] = useState<string>(
		`MONTH_${new Date().getMonth() + 1}`,
	);
	const [year, setYear] = useState<string>(new Date().getFullYear().toString());
	const [showCalendar, setShowCalendar] = useState(false);
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<SortBy>("income");

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
	const getQuery = (): GetInventoryAnalysisQuery => {
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

	const { data: analysis, isLoading } = useQuery({
		queryKey: ["inventory-analysis", getQuery()],
		queryFn: async () => {
			const res = await api.products.inventory.analysis.get({
				query: getQuery(),
			});
			if (res.status === 200) {
				return res.data;
			}
			return null;
		},
	});

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

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

	const filteredProducts = useMemo(
		() =>
			analysis?.products
				.filter((p: InventoryProductAnalysis) =>
					p.productName.toLowerCase().includes(search.toLowerCase()),
				)
				.sort(
					(a: InventoryProductAnalysis, b: InventoryProductAnalysis) =>
						(b[sortBy] as number) - (a[sortBy] as number),
				) || [],
		[analysis?.products, search, sortBy],
	);

	return (
		<>
			<Header>
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/app/inventory">
							<ChevronLeft className="h-4 w-4" />
						</Link>
					</Button>
					<h1 className="text-xl font-bold">Phân tích thu chi kho</h1>
				</div>
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
						<p className="text-muted-foreground">
							Tóm tắt doanh thu, chi phí và lợi nhuận từ hoạt động kho.
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
						<Skeleton className="h-100 w-full" />
					</div>
				) : (
					analysis && (
						<div className="space-y-6">
							{/* Extended Summary Cards */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
								<div className="rounded-lg border bg-card p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Doanh thu</p>
											<p className="text-2xl font-bold text-blue-600">
												{formatCurrency(analysis.summary.totalIncome)}
											</p>
										</div>
										<div className="bg-blue-100 p-2 rounded-lg">
											<ArrowUpRight className="h-5 w-5 text-blue-600" />
										</div>
									</div>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Nhập kho</p>
											<p className="text-2xl font-bold text-orange-600">
												{analysis.summary.totalInQuantity}
											</p>
											<p className="text-xs text-muted-foreground">sản phẩm</p>
										</div>
										<div className="bg-orange-100 p-2 rounded-lg">
											<ArrowDownLeft className="h-5 w-5 text-orange-600" />
										</div>
									</div>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Đã bán</p>
											<p className="text-2xl font-bold text-purple-600">
												{analysis.summary.totalOutQuantity}
											</p>
											<p className="text-xs text-muted-foreground">sản phẩm</p>
										</div>
										<div className="bg-purple-100 p-2 rounded-lg">
											<ArrowUpRight className="h-5 w-5 text-purple-600" />
										</div>
									</div>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Giá vốn</p>
											<p className="text-2xl font-bold text-red-600">
												{formatCurrency(analysis.summary.totalCOGS)}
											</p>
										</div>
										<div className="bg-red-100 p-2 rounded-lg">
											<TrendingDown className="h-5 w-5 text-red-600" />
										</div>
									</div>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Lợi nhuận</p>
											<p
												className={`text-2xl font-bold ${analysis.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
											>
												{formatCurrency(analysis.summary.netProfit)}
											</p>
										</div>
										<div className="bg-green-100 p-2 rounded-lg">
											<TrendingUp className="h-5 w-5 text-green-600" />
										</div>
									</div>
								</div>
							</div>

							{/* Charts */}
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
								<div className="rounded-xl border bg-card p-6">
									<h3 className="text-lg font-semibold mb-4">
										Biểu đồ thu chi
									</h3>
									<div className="h-76">
										<ResponsiveContainer width="100%" height="100%">
											<LineChart data={analysis.trends}>
												<CartesianGrid strokeDasharray="3 3" vertical={false} />
												<XAxis
													dataKey="date"
													tickFormatter={(str) =>
														format(new Date(str), "dd/MM")
													}
													fontSize={12}
												/>
												<YAxis
													fontSize={12}
													tickFormatter={(val) => `${val / 1000}k`}
												/>
												<Tooltip
													labelFormatter={(label) =>
														format(new Date(label as string), "dd/MM/yyyy")
													}
													formatter={(value) => [
														formatCurrency(value as number),
														"",
													]}
												/>
												<Line
													type="monotone"
													dataKey="income"
													name="Doanh thu"
													stroke="#2563eb"
													strokeWidth={2}
													dot={false}
												/>
												<Line
													type="monotone"
													dataKey="expenditure"
													name="Chi phí nhập"
													stroke="#ea580c"
													strokeWidth={2}
													dot={false}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								</div>

								<div className="rounded-xl border bg-card p-6">
									<h3 className="text-lg font-semibold mb-4">
										Biểu đồ lợi nhuận
									</h3>
									<div className="h-76">
										<ResponsiveContainer width="100%" height="100%">
											<LineChart data={analysis.trends}>
												<CartesianGrid strokeDasharray="3 3" vertical={false} />
												<XAxis
													dataKey="date"
													tickFormatter={(str) =>
														format(new Date(str), "dd/MM")
													}
													fontSize={12}
												/>
												<YAxis
													fontSize={12}
													tickFormatter={(val) => `${val / 1000}k`}
												/>
												<Tooltip
													labelFormatter={(label) =>
														format(new Date(label as string), "dd/MM/yyyy")
													}
													formatter={(value) => [
														formatCurrency(value as number),
														"Lợi nhuận",
													]}
												/>
												<Line
													type="monotone"
													dataKey="profit"
													stroke="#16a34a"
													strokeWidth={2}
													dot={false}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								</div>
							</div>

							{/* Product Details Table */}
							<div className="rounded-xl border bg-card">
								<div className="p-6 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<h3 className="text-lg font-semibold">Chi tiết sản phẩm</h3>
									<div className="flex items-center gap-4">
										<div className="relative w-full max-w-sm">
											<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Tìm sản phẩm..."
												className="pl-9 h-9"
												value={search}
												onChange={(e) => setSearch(e.target.value)}
											/>
										</div>
										<Select
											value={sortBy}
											onValueChange={(val) => setSortBy(val as SortBy)}
										>
											<SelectTrigger className="w-48">
												<SelectValue placeholder="Sắp xếp theo" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="income">Doanh thu</SelectItem>
												<SelectItem value="profit">Lợi nhuận</SelectItem>
												<SelectItem value="soldQuantity">
													Số lượng bán
												</SelectItem>
												<SelectItem value="importedQuantity">
													Số lượng nhập
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-52">Sản phẩm</TableHead>
												<TableHead className="text-right">Đã nhập</TableHead>
												<TableHead className="text-right">
													Số lượng bán
												</TableHead>
												<TableHead className="text-right">Doanh thu</TableHead>
												<TableHead className="text-right">Giá vốn</TableHead>
												<TableHead className="text-right">Lợi nhuận</TableHead>
												<TableHead className="text-right">Tồn kho</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredProducts.length === 0 ? (
												<TableRow>
													<TableCell
														colSpan={7}
														className="h-24 text-center text-muted-foreground"
													>
														{search
															? "Không tìm thấy sản phẩm nào"
															: "Chưa có dữ liệu giao dịch trong khoảng thời gian này"}
													</TableCell>
												</TableRow>
											) : (
												filteredProducts.map((p) => (
													<TableRow key={p.productId}>
														<TableCell>
															<div className="font-medium">{p.productName}</div>
															<div className="text-xs text-muted-foreground">
																Đơn vị: {p.unit}
															</div>
														</TableCell>
														<TableCell className="text-right font-medium text-orange-600">
															{Math.abs(p.importedQuantity)}
														</TableCell>
														<TableCell className="text-right font-medium text-purple-600">
															{Math.abs(p.soldQuantity)}
														</TableCell>
														<TableCell className="text-right text-blue-600 font-medium">
															{formatCurrency(p.income)}
														</TableCell>
														<TableCell className="text-right text-muted-foreground">
															{formatCurrency(p.cogs)}
														</TableCell>
														<TableCell
															className={`text-right font-bold ${p.profit >= 0 ? "text-green-600" : "text-red-600"}`}
														>
															{p.profit > 0 ? "+" : ""}
															{formatCurrency(p.profit)}
														</TableCell>
														<TableCell className="text-right">
															<span
																className={`px-2 py-1 rounded-full text-xs font-semibold ${
																	p.currentStock <= 5
																		? "bg-red-100 text-red-700"
																		: p.currentStock <= 20
																			? "bg-orange-100 text-orange-700"
																			: "bg-green-100 text-green-700"
																}`}
															>
																{p.currentStock} {p.unit}
															</span>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>
							</div>
						</div>
					)
				)}
			</Main>
		</>
	);
}
