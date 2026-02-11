"use client";

import {
	ArrowDownLeft,
	ArrowUpRight,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatVND } from "@/lib/format";

interface StatisticsSummaryCardsProps {
	totalImportValue: number;
	totalExportValue: number;
	totalSaleValue: number;
	totalProfit: number;
}

export function StatisticsSummaryCards({
	totalImportValue,
	totalExportValue,
	totalSaleValue,
	totalProfit,
}: StatisticsSummaryCardsProps) {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Tổng nhập</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums text-red-600 @[250px]/card:text-3xl">
						{formatVND(totalImportValue)}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="text-red-600">
							<ArrowDownLeft className="h-4 w-4" />
							Chi phí
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="text-muted-foreground">
						Tổng giá trị hàng nhập kho
					</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Tổng xuất</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums text-green-600 @[250px]/card:text-3xl">
						{formatVND(totalExportValue)}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="text-green-600">
							<ArrowUpRight className="h-4 w-4" />
							Xuất hàng
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="text-muted-foreground">
						Tổng giá trị hàng xuất kho
					</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Doanh thu</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums text-blue-600 @[250px]/card:text-3xl">
						{formatVND(totalSaleValue)}
					</CardTitle>
					<CardAction>
						<Badge variant="outline" className="text-blue-600">
							<TrendingUp className="h-4 w-4" />
							Bán hàng
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="text-muted-foreground">
						Tổng doanh thu từ bán hàng
					</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Lợi nhuận</CardDescription>
					<CardTitle
						className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${
							totalProfit >= 0 ? "text-green-600" : "text-red-600"
						}`}
					>
						{formatVND(totalProfit)}
					</CardTitle>
					<CardAction>
						<Badge
							variant="outline"
							className={totalProfit >= 0 ? "text-green-600" : "text-red-600"}
						>
							{totalProfit >= 0 ? (
								<TrendingUp className="h-4 w-4" />
							) : (
								<TrendingDown className="h-4 w-4" />
							)}
							{totalProfit >= 0 ? "Lãi" : "Lỗ"}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{totalProfit >= 0 ? "Kinh doanh hiệu quả" : "Cần cải thiện"}{" "}
						{totalProfit >= 0 ? (
							<TrendingUp className="size-4" />
						) : (
							<TrendingDown className="size-4" />
						)}
					</div>
					<div className="text-muted-foreground">
						{totalProfit >= 0
							? "Lợi nhuận tăng trưởng tốt"
							: "Cần xem xét chi phí"}
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
