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
import { Skeleton } from "@/components/ui/skeleton";
import { OrderDrawer } from "@/features/order/components/order-drawer";
import type { TableStatus, TableType } from "@/generated/prisma/browser";
import { api } from "@/lib/eden";
import type { TableWithBookings } from "../types";
import { TableCard } from "./table-card";
import { TableFormDrawer } from "./table-form-drawer";
import { TableSessionDrawer } from "./table-session-drawer";

export function Tables() {
	// State management
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("ALL");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSessionOpen, setIsSessionOpen] = useState(false);
	const [isOrderOpen, setIsOrderOpen] = useState(false);
	const [selectedTable, setSelectedTable] = useState<TableWithBookings | null>(
		null,
	);
	const [activeBookingId, setActiveBookingId] = useState<string>("");

	const queryClient = useQueryClient();

	const { data: tables, isLoading } = useQuery({
		queryKey: ["tables"],
		queryFn: async () => {
			const res = await api.tables.get();
			return res.status === 200 ? res.data : [];
		},
		staleTime: 30000, // Cache for 30 seconds
	});

	const filteredTables = useMemo(() => {
		return (
			tables?.filter((table) => {
				const matchesSearch =
					!searchTerm ||
					table.name.toLowerCase().includes(searchTerm.toLowerCase());

				const matchesType = typeFilter === "ALL" || table.type === typeFilter;

				const matchesStatus =
					statusFilter === "ALL" || table.status === statusFilter;

				return matchesSearch && matchesType && matchesStatus;
			}) || []
		);
	}, [tables, searchTerm, typeFilter, statusFilter]);

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
		onError: () => {
			toast.error("Có lỗi xảy ra khi xóa bàn");
		},
	});

	const handleEdit = useCallback((table: TableWithBookings) => {
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

	const handleViewSession = useCallback((table: TableWithBookings) => {
		setSelectedTable(table);
		setIsSessionOpen(true);
	}, []);

	const handleOpenOrder = useCallback((bookingId: string) => {
		setActiveBookingId(bookingId);
		setIsOrderOpen(true);
	}, []);

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchTerm(e.target.value);
		},
		[],
	);

	const handleClearFilters = useCallback(() => {
		setSearchTerm("");
		setTypeFilter("ALL");
		setStatusFilter("ALL");
	}, []);

	const activeBooking = useMemo(() => {
		if (!selectedTable?.bookingTables?.length) return null;
		return selectedTable.bookingTables[selectedTable.bookingTables.length - 1]
			.booking;
	}, [selectedTable]);

	const renderSkeleton = () => (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{Array.from({ length: 8 }).map((_, i) => (
				<Skeleton key={i} className="h-52" />
			))}
		</div>
	);

	const renderEmptyState = () => (
		<div className="flex h-52 flex-col items-center justify-center rounded-lg border border-dashed text-center">
			<p className="text-muted-foreground">Không tìm thấy bàn nào.</p>
			<Button variant="link" onClick={handleClearFilters}>
				Xóa bộ lọc
			</Button>
		</div>
	);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<div className="relative w-full sm:w-64">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Tìm tên bàn..."
							className="pl-9"
							value={searchTerm}
							onChange={handleSearchChange}
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

			{/* Tables Grid */}
			{isLoading ? (
				renderSkeleton()
			) : filteredTables.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredTables.map((table) => {
						const activeBooking = table.bookingTables?.[0]?.booking ?? null;
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
				renderEmptyState()
			)}

			{/* Drawers */}
			<TableFormDrawer
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				initialData={selectedTable}
			/>

			<TableSessionDrawer
				open={isSessionOpen}
				onOpenChange={setIsSessionOpen}
				table={selectedTable}
				activeBooking={activeBooking}
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
