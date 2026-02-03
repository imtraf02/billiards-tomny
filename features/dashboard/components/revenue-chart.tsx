"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
	data: { date: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
	const maxAmount = Math.max(...data.map((d) => d.amount), 1); // Avoid division by zero

	return (
		<Card className="col-span-4">
			<CardHeader>
				<CardTitle>Doanh Thu 7 Ngày Gần Nhất</CardTitle>
			</CardHeader>
			<CardContent className="pl-2">
				<div className="flex h-[200px] items-end justify-between gap-2 px-4">
					{data.map((item, index) => {
						const heightPercentage = (item.amount / maxAmount) * 100;
						const date = new Date(item.date).toLocaleDateString("vi-VN", {
							day: "2-digit",
							month: "2-digit",
						});

						return (
							<div
								key={item.date}
								className="flex flex-1 flex-col items-center gap-2 group cursor-pointer"
								title={`${date}: ${new Intl.NumberFormat("vi-VN").format(item.amount)} đ`}
							>
								<div className="relative w-full max-w-[40px] flex-1 flex items-end">
									<div
										className="w-full rounded-t-md bg-primary/80 transition-all group-hover:bg-primary"
										style={{ height: `${heightPercentage}%` }}
									/>
									{/* Tooltip-ish value on hover */}
									<div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
										{new Intl.NumberFormat("vi-VN", {
											notation: "compact",
											maximumFractionDigits: 1,
										}).format(item.amount)}
									</div>
								</div>
								<span className="text-[10px] text-muted-foreground font-medium">
									{date}
								</span>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
