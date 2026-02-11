"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { OrderDetails } from "@/features/orders/types";
import { OrderCard } from "./orders-card";
import { useOrders } from "./orders-provider";

interface OrdersListProps {
	orders: OrderDetails[];
	isLoading: boolean;
	onAddOrder?: () => void;
}

export function OrdersList({ orders, isLoading, onAddOrder }: OrdersListProps) {
	const { setOpen, setCurrentRow } = useOrders();

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="font-semibold text-sm flex items-center gap-2">
					<Package className="h-4 w-4" />
					Đơn hàng
				</h4>
				<Button
					variant="link"
					onClick={() => {
						setOpen("create");
					}}
				>
					Thêm đơn
				</Button>
			</div>

			{isLoading ? (
				<div className="text-center py-8 text-muted-foreground">
					Đang tải...
				</div>
			) : orders.length === 0 ? (
				<div className="text-center py-8 text-muted-foreground">
					Chưa có đơn hàng nào
				</div>
			) : (
				<ScrollArea className="h-75 pr-4">
					<div className="space-y-4">
						{orders.map((order) => {
							if (!order) return null;
							return <OrderCard key={order.id} order={order} />;
						})}
					</div>
				</ScrollArea>
			)}
		</div>
	);
}
