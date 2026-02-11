"use client";

import { format } from "date-fns";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ORDER_STATUS_MAP } from "@/features/orders/data";
import type { OrderDetails } from "@/features/orders/types";
import { formatVND } from "@/lib/format";

interface OrderCardProps {
	order: OrderDetails;
}

export function OrderCard({ order }: OrderCardProps) {
	const orderTotal = order.products.reduce(
		(sum, p) => sum + p.price * p.quantity,
		0,
	);

	return (
		<div className="space-y-2 border rounded-lg p-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<User className="h-3.5 w-3.5 text-muted-foreground" />
					<span className="text-sm font-medium">{order.user.name}</span>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant={ORDER_STATUS_MAP[order.status].variant}>
						{ORDER_STATUS_MAP[order.status].label}
					</Badge>
					<span className="text-xs text-muted-foreground">
						{format(new Date(order.createdAt), "HH:mm")}
					</span>
				</div>
			</div>

			<div className="space-y-1.5">
				{order.products.map((item) => (
					<div key={item.id} className="flex justify-between text-sm">
						<div className="flex gap-2">
							<span className="text-muted-foreground">{item.quantity}x</span>
							<span>{item.product.name}</span>
						</div>
						<span className="font-medium">
							{formatVND(item.price * item.quantity)}
						</span>
					</div>
				))}
			</div>

			<Separator className="my-2" />

			<div className="flex justify-between text-sm font-medium">
				<span>Tổng đơn</span>
				<span>{formatVND(orderTotal)}</span>
			</div>
		</div>
	);
}
