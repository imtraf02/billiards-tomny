"use client";

import { Plus, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Table } from "@/generated/prisma/client";
import { useDeleteTable, useGetTables } from "../hooks/use-table";
import { TableCard } from "./table-card";
import { TableFormDialog } from "./table-form-dialog";
import { TableSessionDialog } from "./table-session-dialog";
import { OrderDialog } from "@/features/order/components/order-dialog";
import { useGetBookings } from "@/features/booking/hooks";

export function Tables() {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSessionOpen, setIsSessionOpen] = useState(false);
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [activeBookingId, setActiveBookingId] = useState<string>("");

    const { data: tables, isLoading } = useGetTables({
        search: searchTerm || undefined,
        type: typeFilter !== "ALL" ? (typeFilter as any) : undefined,
        status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
    });

    const { data: bookingsData } = useGetBookings({
        status: "PENDING",
        limit: 100,
        page: 1
    });
    const activeBookings = bookingsData?.data || [];

    const { mutate: deleteTable } = useDeleteTable();

    const handleEdit = (table: Table) => {
        setSelectedTable(table);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa bàn này?")) {
            deleteTable(id);
        }
    };

    const handleCreate = () => {
        setSelectedTable(null);
        setIsFormOpen(true);
    };

    const handleViewSession = (table: Table) => {
        setSelectedTable(table);
        setIsSessionOpen(true);
    };

    const handleOpenOrder = (bookingId: string) => {
        setActiveBookingId(bookingId);
        setIsOrderOpen(true);
    };

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

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="h-[200px] animate-pulse rounded-lg bg-muted"
                        />
                    ))}
                </div>
            ) : tables && tables.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tables.map((table: Table) => {
                        const activeBooking = activeBookings.find(b =>
                            b.bookingTables.some((bt: any) => bt.tableId === table.id)
                        );
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
