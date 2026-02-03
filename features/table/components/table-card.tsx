"use client";

import {
	Clock,
	Eye,
	MoreHorizontal,
	Pencil,
	PlayCircle,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { useCreateBooking } from "@/features/booking/hooks";
import type { Table } from "@/generated/prisma/client";

interface TableCardProps {
	table: Table;
	activeBooking?: any;
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

export function TableCard({
	table,
	activeBooking,
	onEdit,
	onDelete,
	onViewSession,
}: TableCardProps) {
	const { mutate: createBooking, isPending: isStarting } = useCreateBooking();
	const [duration, setDuration] = useState<string>("");

	useEffect(() => {
		if (!activeBooking || table.status !== "OCCUPIED") {
			setDuration("");
			return;
		}

		const interval = setInterval(() => {
			const start = new Date(activeBooking.startTime);
			const now = new Date();
			const diff = now.getTime() - start.getTime();

			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);

			setDuration(
				`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
			);
		}, 1000);

		return () => clearInterval(interval);
	}, [activeBooking, table.status]);

	const handleAction = () => {
		if (table.status === "AVAILABLE") {
			createBooking({
				tableIds: [table.id],
				startTime: new Date(),
			});
		} else if (table.status === "OCCUPIED" && onViewSession) {
			onViewSession(table);
		}
	};

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
						<DropdownMenuItem onClick={() => onEdit(table)}>
							<Pencil className="mr-2 h-4 w-4" />
							Sửa
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-red-600"
							onClick={() => onDelete(table.id)}
						>
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
					{duration && (
						<div className="flex items-center text-xs font-mono font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
							<Clock className="mr-1 h-3 w-3" />
							{duration}
						</div>
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
							Bắt đầu chơi
						</>
					) : (
						<>
							<Eye className="mr-2 h-4 w-4" />
							Chi tiết
						</>
					)}
				</Button>
			</CardFooter>
		</Card>
	);
}
