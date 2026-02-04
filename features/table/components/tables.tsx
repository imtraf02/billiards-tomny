"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search as SearchIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { OrderDrawer } from "@/features/order/components/order-drawer";
import type { Table, TableStatus, TableType } from "@/generated/prisma/client";
import { api } from "@/lib/eden";
import { TableCard } from "./table-card";
import { TableFormDrawer } from "./table-form-drawer";
import { TableSessionDrawer } from "./table-session-drawer";

export function Tables() {
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("ALL");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSessionOpen, setIsSessionOpen] = useState(false);
	const [isOrderOpen, setIsOrderOpen] = useState(false);
	const [selectedTable, setSelectedTable] = useState<Table | null>(null);
	const [activeBookingId, setActiveBookingId] = useState<string>("");

	const queryClient = useQueryClient();

	const { data: tables, isLoading } = useQuery({
		queryKey: [
			"tables",
			{
				search: searchTerm || undefined,
				type: typeFilter !== "ALL" ? (typeFilter as TableType) : undefined,
				status:
					statusFilter !== "ALL" ? (statusFilter as TableStatus) : undefined,
			},
		],
		queryFn: async () => {
			const res = await api.tables.get({
				query: {
					search: searchTerm || undefined,
					type: typeFilter !== "ALL" ? (typeFilter as TableType) : undefined,
					status:
						statusFilter !== "ALL" ? (statusFilter as TableStatus) : undefined,
				},
			});
			if (res.status === 200) {
				return res.data;
			}
			return [];
		},
	});

	const { mutate: deleteTable } = useMutation({
		mutationFn: async (id: string) => {
			const res = await api.tables({ id }).delete();
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Xóa bàn thành công");
		},
	});

	// Sử dụng useCallback cho các event handler
	const handleEdit = useCallback((table: Table) => {
		setSelectedTable(table);
		setIsFormOpen(true);
	}, []);

	const handleDelete = useCallback(
		(id: string) => {
			if (confirm("Bạn có chắc chắn muốn xóa bàn này?")) {
				deleteTable(id);
			}
		},
		[deleteTable],
	);

	const handleCreate = useCallback(() => {
		setSelectedTable(null);
		setIsFormOpen(true);
	}, []);

	const handleViewSession = useCallback((table: Table) => {
		setSelectedTable(table);
		setIsSessionOpen(true);
	}, []);

	const handleOpenOrder = useCallback((bookingId: string) => {
		setActiveBookingId(bookingId);
		setIsOrderOpen(true);
	}, []);

	// Memoize filtered tables
	const filteredTables = useMemo(() => {
		if (!tables) return [];
		return tables;
	}, [tables]);

	return (
		<div className="space-y-4">
			{/* Filters ... (Keep as is) */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<div className="relative w-full sm:w-64">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Tìm tên bàn..."
							className="pl-9"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-full sm:w-40">
							<SelectValue placeholder="Loại bàn" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả loại</SelectItem>
							<SelectItem value="POOL">Bida lỗ (POOL)</SelectItem>
							<SelectItem value="CAROM">Bida phăng (CAROM)</SelectItem>
							<SelectItem value="SNOOKER">Bida Snooker (SNOOKER)</SelectItem>
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full sm:w-48">
							<SelectValue placeholder="Trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
							<SelectItem value="AVAILABLE">Trống</SelectItem>
							<SelectItem value="OCCUPIED">Đang sử dụng</SelectItem>
							<SelectItem value="RESERVED">Đã đặt trước</SelectItem>
							<SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Thêm bàn
				</Button>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[...Array(8)].map((_, i) => (
						<div key={i} className="h-52 animate-pulse rounded-lg bg-muted" />
					))}
				</div>
			) : filteredTables && filteredTables.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredTables.map((table) => {
						const activeBooking =
							table.bookingTables && table.bookingTables.length > 0
								? table.bookingTables[0]
								: null;
						return (
							<TableCard
								key={table.id}
								table={table}
								activeBooking={activeBooking}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onViewSession={handleViewSession}
							/>
						);
					})}
				</div>
			) : (
				<div className="flex h-52 flex-col items-center justify-center rounded-lg border border-dashed text-center">
					<p className="text-muted-foreground">Không tìm thấy bàn nào.</p>
					<Button
						variant="link"
						onClick={() => {
							setSearchTerm("");
							setTypeFilter("ALL");
							setStatusFilter("ALL");
						}}
					>
						Xóa bộ lọc
					</Button>
				</div>
			)}

			<TableFormDrawer
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				initialData={selectedTable}
			/>

			<TableSessionDrawer
				open={isSessionOpen}
				onOpenChange={setIsSessionOpen}
				table={selectedTable}
				activeBooking={
					selectedTable && (selectedTable as any).bookingTables?.length > 0
						? (selectedTable as any).bookingTables[0].booking
						: null
				}
				onOpenOrder={handleOpenOrder}
			/>

			<OrderDrawer
				open={isOrderOpen}
				onOpenChange={setIsOrderOpen}
				bookingId={activeBookingId}
			/>
		</div>
	);
}
