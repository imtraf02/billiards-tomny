"use client";

import { XCircle } from "lucide-react";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
	Order,
	OrderItem as OrderItemType,
	Product,
} from "@/generated/prisma/browser";

interface OrderItemProps {
	order: Order & { orderItems: (OrderItemType & { product: Product })[] };
	onCancelOrder: (id: string) => void;
	isUpdatingOrder: boolean;
}

export const OrderItem = memo(
	({ order, onCancelOrder, isUpdatingOrder }: OrderItemProps) => {
		const badgeClassName = useMemo(() => {
			switch (order.status) {
				case "COMPLETED":
					return "bg-green-100 text-green-700";
				case "CANCELLED":
					return "bg-red-100 text-red-700";
				default:
					return "bg-blue-100 text-blue-700";
			}
		}, [order.status]);

		const showCancelButton =
			order.status !== "COMPLETED" && order.status !== "CANCELLED";

		return (
			<div className="text-sm bg-muted/30 p-2 rounded-lg relative group">
				<div className="flex justify-between items-start mb-1">
					<Badge variant="secondary" className={badgeClassName}>
						{order.status}
					</Badge>
					{showCancelButton && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
							onClick={() => onCancelOrder(order.id)}
							disabled={isUpdatingOrder}
						>
							<XCircle className="h-4 w-4" />
						</Button>
					)}
				</div>
				{order.orderItems.map((item) => (
					<div key={item.id} className="flex justify-between py-1 text-xs">
						<span>
							{item.product.name} x{item.quantity}
						</span>
						<span className="text-muted-foreground">
							{new Intl.NumberFormat("vi-VN").format(
								item.priceSnapshot * item.quantity,
							)}
						</span>
					</div>
				))}
			</div>
		);
	},
);
