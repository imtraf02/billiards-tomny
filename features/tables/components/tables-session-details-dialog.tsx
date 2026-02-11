"use client";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { OrdersList } from "@/features/orders/components/orders-list";
import OrdersMutateDialog from "@/features/orders/components/orders-mutate-drawer";
import {
	OrdersProvider,
	useOrders,
} from "@/features/orders/components/orders-provider";
import { useSessionOrders } from "@/features/orders/hooks/use-session-orders";
import { calculateOrdersTotal } from "@/features/orders/utils/calculate-orders-total";
import { useElapsedTime } from "@/hooks/use-elapsed-time";
import { formatVND, roundUpToThousand } from "@/lib/format";
import { TABLE_TYPES } from "../data";
import type { TableWithSessions } from "../types";

interface TablesSessionDetailsDialogProps {
	currentRow: TableWithSessions;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TablesSessionDetailsDialog({
	currentRow,
	open,
	onOpenChange,
}: TablesSessionDetailsDialogProps) {
	const { data: orders = [], isLoading } = useSessionOrders(
		currentRow.sessions[0].id,
		open,
	);

	const { formatted, seconds } = useElapsedTime(
		currentRow.sessions[0].startTime,
	);

	const totalProducts = useMemo(
		() => (orders ? calculateOrdersTotal(orders) : 0),
		[orders],
	);

	const tableRevenue = useMemo(() => {
		const hours = seconds / 3600;
		const rawAmount = hours * currentRow.hourlyRate;
		return roundUpToThousand(rawAmount);
	}, [seconds, currentRow.hourlyRate]);

	const totalRevenue = totalProducts + tableRevenue;

	return (
		<OrdersProvider>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader className="text-start">
						<DialogTitle>{currentRow.name}</DialogTitle>
						<DialogDescription>
							{TABLE_TYPES[currentRow.type]} -{" "}
							{formatVND(currentRow.hourlyRate)}/giờ
						</DialogDescription>
					</DialogHeader>

					<Separator />

					{/* Thông tin phiên chơi */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-sm">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground">Bắt đầu:</span>
							<span className="font-medium">
								{format(currentRow.sessions[0].startTime, "HH:mm - dd/MM/yyyy")}
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<span className="text-muted-foreground">Thời gian chơi:</span>
							<span className="font-medium tabular-nums">{formatted}</span>
						</div>
					</div>

					<Separator />

					{/* Danh sách đơn hàng */}
					<OrdersList
						orders={orders}
						isLoading={isLoading}
						onAddOrder={() => {
							// Handle add order
						}}
					/>

					<Separator />

					{/* Tổng kết */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Tiền bàn</span>
							<span className="tabular-nums">{formatVND(tableRevenue)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Tiền đồ ăn/uống</span>
							<span className="tabular-nums">{formatVND(totalProducts)}</span>
						</div>
						<Separator />
						<div className="flex justify-between font-semibold text-base">
							<span>Tổng tạm tính</span>
							<span className="text-primary tabular-nums">
								{formatVND(totalRevenue)}
							</span>
						</div>
					</div>

					<DialogFooter>
						<Button>Tính tiền</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<OrdersDialog sessionId={currentRow.sessions[0].id} />
		</OrdersProvider>
	);
}

function OrdersDialog({ sessionId }: { sessionId: string }) {
	const { open, setOpen } = useOrders();
	return (
		<OrdersMutateDialog
			key="orders-create"
			open={open === "create"}
			onOpenChange={() => setOpen("create")}
			sessionId={sessionId}
		/>
	);
}
