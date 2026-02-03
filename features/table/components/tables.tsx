"use client";

import { Plus, Search as SearchIcon } from "lucide-react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGetBookings } from "@/features/booking/hooks";
import { OrderDialog } from "@/features/order/components/order-dialog";
import type { Table } from "@/generated/prisma/client";
import { useDeleteTable, useGetTables } from "../hooks/use-table";
import { TableCard } from "./table-card";
import { TableFormDialog } from "./table-form-dialog";
import { TableSessionDialog } from "./table-session-dialog";

export function Tables() {
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("ALL");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSessionOpen, setIsSessionOpen] = useState(false);
	const [isOrderOpen, setIsOrderOpen] = useState(false);
	const [selectedTable, setSelectedTable] = useState<Table | null>(null);
	const [activeBookingId, setActiveBookingId] = useState<string>("");
	
	// State để theo dõi xem đây có phải là lần đầu tải không
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [showSkeleton, setShowSkeleton] = useState(true);

	// Tối ưu query tables với cache
	const { 
		data: tables, 
		isLoading, 
		isFetching,
		isFetched, // Đã fetch ít nhất một lần
		isStale // Dữ liệu đã cũ
	} = useGetTables({
		search: searchTerm || undefined,
		type: typeFilter !== "ALL" ? (typeFilter as any) : undefined,
		status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
	}, {
		// Tắt refetch tự động
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false, // KHÔNG refetch khi mount
		// Giữ dữ liệu cache lâu hơn
		staleTime: 5 * 60 * 1000, // 5 phút
		cacheTime: 10 * 60 * 1000, // 10 phút
	});

	// Tối ưu query bookings - chỉ fetch khi cần
	const { data: bookingsData } = useGetBookings({
		status: "PENDING",
		limit: 100,
		page: 1,
	}, {
		staleTime: 30 * 1000,
		cacheTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false, // KHÔNG refetch khi mount
	});

	// Reset initial load flag sau khi data đã được tải
	useEffect(() => {
		if (tables !== undefined && isInitialLoad) {
			setIsInitialLoad(false);
		}
	}, [tables, isInitialLoad]);

	// Kiểm tra khi nào nên hiển thị skeleton
	useEffect(() => {
		// Chỉ hiển thị skeleton khi:
		// 1. Lần đầu tải VÀ đang loading VÀ chưa có data
		const shouldShow = isInitialLoad && isLoading && !tables;
		
		if (shouldShow !== showSkeleton) {
			setShowSkeleton(shouldShow);
		}
		
		// Nếu đã có data, ẩn skeleton
		if (tables && showSkeleton) {
			setShowSkeleton(false);
		}
	}, [isInitialLoad, isLoading, tables, showSkeleton]);

	// Memoize activeBookingMap sâu hơn
	const activeBookingMap = useMemo(() => {
		if (!bookingsData?.data) return {};
		
		const map: Record<string, any> = {};
		const bookings = bookingsData.data;
		
		for (let i = 0; i < bookings.length; i++) {
			const booking = bookings[i];
			const bookingTables = booking.bookingTables || [];
			
			for (let j = 0; j < bookingTables.length; j++) {
				const bt = bookingTables[j];
				if (bt.tableId) {
					map[bt.tableId] = booking;
				}
			}
		}
		
		return map;
	}, [bookingsData?.data]);

	const { mutate: deleteTable } = useDeleteTable();

	const handleEdit = useCallback((table: Table) => {
		setSelectedTable(table);
		setIsFormOpen(true);
	}, []);

	const handleDelete = useCallback((id: string) => {
		if (confirm("Bạn có chắc chắn muốn xóa bàn này?")) {
			deleteTable(id);
		}
	}, [deleteTable]);

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

	// Tối ưu filteredTables
	const filteredTables = useMemo(() => {
		return tables || [];
	}, [tables]);

	// Kiểm tra khi nào nên hiển thị content
	const shouldShowContent = tables !== undefined || (isFetched && !isLoading);

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
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-full sm:w-[150px]">
							<SelectValue placeholder="Loại bàn" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả loại</SelectItem>
							<SelectItem value="POOL">Pool</SelectItem>
							<SelectItem value="CAROM">Carom</SelectItem>
							<SelectItem value="SNOOKER">Snooker</SelectItem>
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full sm:w-[150px]">
							<SelectValue placeholder="Trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
							<SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
							<SelectItem value="OCCUPIED">Đang chơi</SelectItem>
							<SelectItem value="RESERVED">Đã đặt</SelectItem>
							<SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Thêm bàn
				</Button>
			</div>

			{/* Hiển thị skeleton chỉ khi thực sự cần */}
			{showSkeleton ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[...Array(8)].map((_, i) => (
						<div
							key={i}
							className="h-[200px] animate-pulse rounded-lg bg-muted"
						/>
					))}
				</div>
			) : shouldShowContent && filteredTables.length > 0 ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredTables.map((table: Table) => {
						const activeBooking = activeBookingMap[table.id];
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
			) : shouldShowContent ? (
				<div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
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
			) : null}

			{/* Hiển thị loading indicator nhỏ khi đang refetch background */}
			{isFetching && !isInitialLoad && (
				<div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2">
					<div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
					<span>Đang cập nhật...</span>
				</div>
			)}

			<TableFormDialog
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				initialData={selectedTable}
			/>

			<TableSessionDialog
				open={isSessionOpen}
				onOpenChange={setIsSessionOpen}
				table={selectedTable}
				onOpenOrder={handleOpenOrder}
			/>

			<OrderDialog
				open={isOrderOpen}
				onOpenChange={setIsOrderOpen}
				bookingId={activeBookingId}
			/>
		</div>
	);
}
