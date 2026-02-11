import type { OrderDetails } from "@/features/orders/types";

export function calculateOrdersTotal(orders: OrderDetails[]): number {
	if (!orders) return 0;
	return orders.reduce((sum, order) => {
		if (!order) return sum;
		return (
			sum + order.products.reduce((pSum, p) => pSum + p.price * p.quantity, 0)
		);
	}, 0);
}
