"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Clock,
	Eye,
	MoreHorizontal,
	Pencil,
	PlayCircle,
	Trash2,
} from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Table } from "@/generated/prisma/client";
import { api } from "@/lib/eden";
import type { CreateBookingInput } from "@/shared/schemas/booking";

interface TableCardProps {
	table: Table;
	activeBooking?: {
		id: string;
		startTime: Date;
	} | null;
	onEdit: (table: Table) => void;
	onDelete: (id: string) => void;
	onViewSession?: (table: Table) => void;
}

const statusColors: Record<string, string> = {
	AVAILABLE: "bg-green-500",
	OCCUPIED: "bg-red-500",
	MAINTENANCE: "bg-yellow-500",
	RESERVED: "bg-blue-500",
};

const statusLabels: Record<string, string> = {
	AVAILABLE: "Sẵn sàng",
	OCCUPIED: "Đang chơi",
	MAINTENANCE: "Bảo trì",
	RESERVED: "Đã đặt",
};

// Tách Timer riêng cho TableCard
const TableTimer = memo(({ startTime }: { startTime: Date }) => {
	const [duration, setDuration] = useState<string>("");

	useEffect(() => {
		const updateDuration = () => {
			const start = new Date(startTime);
			const now = new Date();
			const diff = now.getTime() - start.getTime();

			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);

			setDuration(
				`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
			);
		};

		updateDuration();
		const interval = setInterval(updateDuration, 1000);
		return () => clearInterval(interval);
	}, [startTime]);

	if (!duration) return null;

	return (
		<div className="flex items-center text-xs font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
			<Clock className="mr-1 h-3 w-3" />
			{duration}
		</div>
	);
});

TableTimer.displayName = "TableTimer";

export const TableCard = memo(
	function TableCard({
		table,
		activeBooking,
		onEdit,
		onDelete,
		onViewSession,
	}: TableCardProps) {
		const queryClient = useQueryClient();
		const [showConfirmStart, setShowConfirmStart] = useState(false);

		const { mutate: createBooking, isPending: isStarting } = useMutation({
			mutationFn: async (data: CreateBookingInput) => {
				const res = await api.bookings.post(data);
				if (res.error) throw res.error;
				return res.data;
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["tables"] });
				queryClient.invalidateQueries({ queryKey: ["bookings"] });
				toast.success("Bắt đầu phiên chơi");
			},
			onError: (error: any) => {
				toast.error(
					"Không thể bắt đầu phiên chơi: " +
						(error.value?.message || "Lỗi không xác định"),
				);
			},
		});

		const handleAction = useCallback(() => {
			if (table.status === "AVAILABLE") {
				setShowConfirmStart(true);
			} else if (table.status === "OCCUPIED" && onViewSession) {
				onViewSession(table);
			}
		}, [table, onViewSession]);

		const confirmStartSession = useCallback(() => {
			createBooking({
				tableIds: [table.id],
				startTime: new Date(),
			});
			setShowConfirmStart(false);
		}, [table.id, createBooking]);

		const handleEdit = useCallback(() => {
			onEdit(table);
		}, [onEdit, table]);

		const handleDelete = useCallback(() => {
			onDelete(table.id);
		}, [onDelete, table.id]);

		return (
			<Card className="overflow-hidden transition-all hover:shadow-md">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-lg font-bold">{table.name}</CardTitle>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleEdit}>
								<Pencil className="mr-2 h-4 w-4" />
								Sửa
							</DropdownMenuItem>
							<DropdownMenuItem className="text-red-600" onClick={handleDelete}>
								<Trash2 className="mr-2 h-4 w-4" />
								Xóa
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardHeader>
				<CardContent className="space-y-2 pb-2">
					<div className="flex items-center justify-between">
						<Badge variant="outline" className="text-xs">
							{table.type}
						</Badge>
						<div className="flex items-center gap-1.5">
							<div
								className={`h-2 w-2 rounded-full ${statusColors[table.status]}`}
							/>
							<span className="text-xs font-medium">
								{statusLabels[table.status]}
							</span>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<div className="text-sm font-semibold">
							{new Intl.NumberFormat("vi-VN", {
								style: "currency",
								currency: "VND",
							}).format(table.hourlyRate)}
							<span className="text-xs font-normal text-muted-foreground ml-1">
								/ giờ
							</span>
						</div>
						{activeBooking && table.status === "OCCUPIED" && (
							<TableTimer startTime={new Date(activeBooking.startTime)} />
						)}
					</div>
				</CardContent>
				<CardFooter className="pt-2">
					<Button
						className="w-full"
						variant={table.status === "AVAILABLE" ? "default" : "secondary"}
						onClick={handleAction}
						disabled={isStarting}
					>
						{table.status === "AVAILABLE" ? (
							<>
								<PlayCircle className="mr-2 h-4 w-4" />
								{isStarting ? "Đang xử lý..." : "Bắt đầu chơi"}
							</>
						) : (
							<>
								<Eye className="mr-2 h-4 w-4" />
								Chi tiết
							</>
						)}
					</Button>
				</CardFooter>

				<ConfirmDialog
					open={showConfirmStart}
					onOpenChange={setShowConfirmStart}
					title="Bắt đầu phiên chơi"
					desc={`Bạn có chắc chắn muốn bắt đầu phiên chơi cho bàn ${table.name}?`}
					confirmText="Bắt đầu"
					handleConfirm={confirmStartSession}
					isLoading={isStarting}
				/>
			</Card>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison function để tránh re-render không cần thiết
		return (
			prevProps.table.id === nextProps.table.id &&
			prevProps.table.status === nextProps.table.status &&
			prevProps.table.name === nextProps.table.name &&
			prevProps.table.type === nextProps.table.type &&
			prevProps.table.hourlyRate === nextProps.table.hourlyRate &&
			prevProps.activeBooking?.id === nextProps.activeBooking?.id &&
			prevProps.activeBooking?.startTime === nextProps.activeBooking?.startTime
		);
	},
);
