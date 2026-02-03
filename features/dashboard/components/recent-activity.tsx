"use client";

import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecentActivityProps {
	bookings: any[];
	orders: any[];
}

export function RecentActivity({ bookings, orders }: RecentActivityProps) {
	// Combine and sort by date descending
	const activities = [
		...bookings.map((b) => ({
			...b,
			type: "booking",
			date: new Date(b.startTime),
		})),
		...orders.map((o) => ({
			...o,
			type: "order",
			date: new Date(o.createdAt),
		})),
	]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 5);

	return (
		<Card className="col-span-4 lg:col-span-3">
			<CardHeader>
				<CardTitle>Hoạt Động Gần Đây</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-8">
					{activities.length === 0 ? (
						<p className="text-center text-muted-foreground py-4">
							Chưa có hoạt động nào.
						</p>
					) : (
						activities.map((item, index) => (
							<div key={`${item.type}-${item.id}`} className="flex items-center">
								<Avatar className="h-9 w-9">
									<AvatarFallback
										className={
											item.type === "booking"
												? "bg-blue-100 text-blue-700"
												: "bg-orange-100 text-orange-700"
										}
									>
										{item.type === "booking" ? (
											<Clock className="h-4 w-4" />
										) : (
											<ShoppingBag className="h-4 w-4" />
										)}
									</AvatarFallback>
								</Avatar>
								<div className="ml-4 space-y-1">
									<p className="text-sm font-medium leading-none">
										{item.type === "booking" ? (
											<>
												Đặt bàn{" "}
												<span className="font-bold">
													{item.bookingTables?.[0]?.table?.name || "???"}
												</span>
											</>
										) : (
											<>Đơn hàng mới</>
										)}
									</p>
									<p className="text-sm text-muted-foreground">
										{item.user?.name || "Khách vãng lai"}
										{item.type === "booking" && item.endTime && (
											<>
												{" "}
												- Kết thúc:{" "}
												{format(new Date(item.endTime), "HH:mm", {
													locale: vi,
												})}
											</>
										)}
									</p>
								</div>
								<div className="ml-auto font-medium text-xs text-muted-foreground">
									{formatDistanceToNow(item.date, {
										addSuffix: true,
										locale: vi,
									})}
								</div>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
