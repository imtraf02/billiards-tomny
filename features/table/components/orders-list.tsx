"use client";

import { memo } from "react";
import type {
	Order,
	OrderItem as OrderItemType,
	Product,
} from "@/generated/prisma/browser";
import { OrderItem } from "./order-item";

interface OrdersListProps {
	orders: (Order & {
		orderItems: (OrderItemType & { product: Product })[];
	})[];
	onCancelOrder: (id: string) => void;
	isUpdatingOrder: boolean;
}

export const OrdersList = memo(
	({ orders, onCancelOrder, isUpdatingOrder }: OrdersListProps) => {
		if (!orders || orders.length === 0) {
			return (
				<p className="text-sm text-center py-4 text-muted-foreground italic">
					Chưa có sản phẩm nào được gọi.
				</p>
			);
		}

		return (
			<div className="max-h-[40vh] sm:max-h-64 overflow-y-auto space-y-3 pr-1 -mr-1">
				{orders.map((order) => (
					<OrderItem
						key={order.id}
						order={order}
						onCancelOrder={onCancelOrder}
						isUpdatingOrder={isUpdatingOrder}
					/>
				))}
			</div>
		);
	},
);
