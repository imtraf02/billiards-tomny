"use client";

import {
	ArrowDownLeft,
	ArrowUpRight,
	Calendar,
	Download,
	Filter,
	History,
	Package,
	Search as SearchIcon,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { InventoryList } from "@/features/inventory/components/inventory-list";
import { useGetInventoryLogs } from "@/features/product/hooks/use-product";
import type { GetInventoryLogsQuery } from "@/shared/schemas/product";

export default function InventoryPage() {
	const [type, setType] = useState<string>("ALL");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [dateFilter, setDateFilter] = useState<string>("ALL");

	const query: Partial<GetInventoryLogsQuery> = {
		page,
		limit: 20,
	};

	if (type === "IN" || type === "OUT") {
		query.type = type;
	}

	const { data, isLoading } = useGetInventoryLogs(query);

	// Statistics
	const logs = data?.data || [];
	const totalImports = logs.filter((log: any) => log.type === "IN").length;
	const totalExports = logs.filter((log: any) => log.type === "OUT").length;
	const totalQuantityChange = logs.reduce((sum: number, log: any) => {
		return sum + (log.type === "IN" ? log.quantity : -log.quantity);
	}, 0);

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
						<h1 className="text-2xl font-bold tracking-tight">
							Lịch sử kho
						</h1>
						<p className="text-muted-foreground">
							Theo dõi mọi biến động nhập, xuất và điều chỉnh tồn kho.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							<Download className="mr-2 h-4 w-4" /> Xuất báo cáo
						</Button>
					</div>
				</div>

				<div className="space-y-4">
					{/* Filters and Search */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
							<div className="flex items-center gap-2 flex-wrap">
								<Filter className="h-4 w-4 text-muted-foreground" />
								<Select value={type} onValueChange={setType}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Loại giao dịch" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">Tất cả loại</SelectItem>
										<SelectItem value="IN">Nhập kho</SelectItem>
										<SelectItem value="OUT">Xuất kho</SelectItem>
									</SelectContent>
								</Select>

								<Select
									value={dateFilter}
									onValueChange={setDateFilter}
								>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Thời gian" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">Tất cả thời gian</SelectItem>
										<SelectItem value="TODAY">Hôm nay</SelectItem>
										<SelectItem value="WEEK">Tuần này</SelectItem>
										<SelectItem value="MONTH">Tháng này</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
							Hiển thị{" "}
							<span className="font-bold text-primary">
								{logs.length}
							</span>{" "}
							giao dịch
						</div>
					</div>

					{/* Statistics Grid */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Tổng giao dịch
									</p>
									<p className="text-2xl font-bold">
										{logs.length}
									</p>
								</div>
								<div className="bg-primary/10 p-2 rounded-lg">
									<History className="h-5 w-5 text-primary" />
								</div>
							</div>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Nhập kho
									</p>
									<p className="text-2xl font-bold">
										{totalImports}
									</p>
								</div>
								<div className="bg-green-100 p-2 rounded-lg">
									<ArrowDownLeft className="h-5 w-5 text-green-600" />
								</div>
							</div>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Xuất kho
									</p>
									<p className="text-2xl font-bold">
										{totalExports}
									</p>
								</div>
								<div className="bg-red-100 p-2 rounded-lg">
									<ArrowUpRight className="h-5 w-5 text-red-600" />
								</div>
							</div>
						</div>

						<div className="rounded-lg border bg-card p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">
										Tổng lượng
									</p>
									<p className={`text-2xl font-bold ${totalQuantityChange >= 0 ? "text-green-600" : "text-red-600"}`}>
										{totalQuantityChange >= 0 ? "+" : ""}
										{totalQuantityChange}
									</p>
								</div>
								<div className="bg-purple-100 p-2 rounded-lg">
									<Package className="h-5 w-5 text-purple-600" />
								</div>
							</div>
						</div>
					</div>

					{/* Logs List */}
					{isLoading ? (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{[...Array(6)].map((_, i) => (
								<div
									key={`log-skeleton-${i}`}
									className="h-64 w-full animate-pulse rounded-md bg-muted"
								/>
							))}
						</div>
					) : (
						<>
							<InventoryList logs={logs} />

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
