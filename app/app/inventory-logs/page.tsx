"use client";

import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { InventoryLogsList } from "@/features/product/components/inventory-logs-list";
import { useGetInventoryLogs } from "@/features/product/hooks/use-product";
import type { GetInventoryLogsQuery } from "@/shared/schemas/product";

export default function InventoryLogsPage() {
	const [type, setType] = useState<string>("all");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const query: Partial<GetInventoryLogsQuery> = {
		page,
		limit: 20,
	};

	if (type === "IN" || type === "OUT") {
		query.type = type;
	}

	// Note: Backend might not support 'search' for logs yet, but we'll prepare the UI
	// Based on shared/schemas/product.ts, getInventoryLogsQuerySchema doesn't have search.
	// We'll just filter by type for now as backend supports it.

	const { data, isLoading } = useGetInventoryLogs(query);

	return (
		<>
			<Header>
				<Search />
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
				</div>

				<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
					<div className="relative sm:col-span-2">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Tìm theo sản phẩm..."
							className="pl-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							disabled // Backend hasn't implemented search for logs yet
						/>
					</div>
					<Select value={type} onValueChange={setType}>
						<SelectTrigger>
							<SelectValue placeholder="Loại biến động" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả loại</SelectItem>
							<SelectItem value="IN">Nhập kho</SelectItem>
							<SelectItem value="OUT">Xuất kho</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-4">
					{isLoading ? (
						<div className="space-y-3">
							{[...Array(8)].map((_, i) => (
								<div
									key={`log-skeleton-${i}`}
									className="h-16 w-full animate-pulse rounded-md bg-muted"
								/>
							))}
						</div>
					) : (
						<>
							<InventoryLogsList logs={data?.data || []} />

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
