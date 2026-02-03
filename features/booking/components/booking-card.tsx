"use client";

import {
	Calendar,
	CheckCircle,
	Clock,
	CreditCard,
	Eye,
	MoreHorizontal,
	PlayCircle,
	Table as TableIcon,
	User,
	XCircle,
} from "lucide-react";
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
import type { Booking } from "@/generated/prisma/client";

interface BookingCardProps {
	booking: Booking;
	onViewDetail: (id: string) => void;
}

const statusColors: Record<string, string> = {
	PENDING: "bg-yellow-500",
	COMPLETED: "bg-green-500",
	CANCELLED: "bg-red-500",
};

const statusLabels: Record<string, string> = {
	PENDING: "Đang chơi",
	COMPLETED: "Đã hoàn thành",
	CANCELLED: "Đã hủy",
};

const statusIcons: Record<string, any> = {
	PENDING: PlayCircle,
	COMPLETED: CheckCircle,
	CANCELLED: XCircle,
};

function BookingCard({ booking, onViewDetail }: BookingCardProps) {
	const formatDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const formatTime = (date: Date | string) => {
		return new Date(date).toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getDuration = () => {
		if (!booking.startTime || !booking.endTime) return "Đang tính...";

		const start = new Date(booking.startTime);
		const end = booking.endTime ? new Date(booking.endTime) : new Date();
		const diffMs = Math.abs(end.getTime() - start.getTime());

		const hours = Math.floor(diffMs / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

		return `${hours}h${minutes > 0 ? ` ${minutes}p` : ""}`;
	};

	const StatusIcon = statusIcons[booking.status] || Eye;

	return (
		<Card className="overflow-hidden transition-all hover:shadow-md">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-lg font-bold line-clamp-1">
					#{booking.id.slice(-8).toUpperCase()}
				</CardTitle>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onViewDetail(booking.id)}>
							<Eye className="mr-2 h-4 w-4" />
							Xem chi tiết
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>
			<CardContent className="space-y-3 pb-2">
				<div className="flex items-center justify-between">
					<Badge
						variant="secondary"
						className="flex items-center gap-1.5 text-xs"
					>
						<StatusIcon className="h-3 w-3" />
						{statusLabels[booking.status]}
					</Badge>
					<div className="flex items-center gap-1.5">
						<div
							className={`h-2 w-2 rounded-full ${statusColors[booking.status]}`}
						/>
						<span className="text-xs font-medium">
							{booking.status === "PENDING"
								? "Đang chơi"
								: booking.status === "COMPLETED"
									? "Đã thanh toán"
									: "Đã hủy"}
						</span>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<User className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Khách hàng:</span>
						</div>
						<span className="text-sm font-medium">
							{booking.customerName || "Khách vãng lai"}
						</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<TableIcon className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Bàn:</span>
						</div>
						<span className="text-sm font-medium">
							{booking.bookingTables?.length || 0} bàn
						</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Ngày:</span>
						</div>
						<span className="text-sm font-medium">
							{formatDate(booking.startTime)}
						</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Thời gian:</span>
						</div>
						<span className="text-sm font-medium">
							{formatTime(booking.startTime)}
							{booking.endTime && ` - ${formatTime(booking.endTime)}`}
						</span>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground">Thời lượng:</span>
						</div>
						<span className="text-sm font-medium">{getDuration()}</span>
					</div>

					<div className="flex items-center justify-between pt-2 border-t">
						<span className="text-sm font-semibold text-muted-foreground">
							Tổng tiền:
						</span>
						<span className="text-lg font-bold text-primary">
							{new Intl.NumberFormat("vi-VN", {
								style: "currency",
								currency: "VND",
							}).format(booking.totalAmount || 0)}
						</span>
					</div>
				</div>
			</CardContent>
			<CardFooter className="pt-2">
				<Button
					className="w-full"
					variant="default"
					onClick={() => onViewDetail(booking.id)}
				>
					<Eye className="mr-2 h-4 w-4" />
					Chi tiết phiên chơi
				</Button>
			</CardFooter>
		</Card>
	);
}

export { BookingCard };
