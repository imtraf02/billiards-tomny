import { ArrowDownLeft, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import type { FinanceAnalyticsResponse } from "@/shared/schemas/finance";

interface FinanceSummaryCardsProps {
	data: FinanceAnalyticsResponse;
}

export function FinanceSummaryCards({ data }: FinanceSummaryCardsProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{/* Total Revenue */}
			<div className="rounded-lg border bg-card p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Tổng doanh thu</p>
						<p className="text-2xl font-bold text-blue-600">
							{formatCurrency(data.summary.totalRevenue)}
						</p>
					</div>
					<div className="bg-blue-100 p-2 rounded-lg">
						<ArrowUpRight className="h-5 w-5 text-blue-600" />
					</div>
				</div>
			</div>

			{/* Total Expense */}
			<div className="rounded-lg border bg-card p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Tổng chi phí</p>
						<p className="text-2xl font-bold text-red-600">
							{formatCurrency(data.summary.totalExpense)}
						</p>
					</div>
					<div className="bg-red-100 p-2 rounded-lg">
						<ArrowDownLeft className="h-5 w-5 text-red-600" />
					</div>
				</div>
			</div>

			{/* Net Profit */}
			<div className="rounded-lg border bg-card p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Lợi nhuận ròng</p>
						<p
							className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
						>
							{formatCurrency(data.summary.netProfit)}
						</p>
					</div>
					<div className="bg-green-100 p-2 rounded-lg">
						<TrendingUp className="h-5 w-5 text-green-600" />
					</div>
				</div>
			</div>

			{/* Profit Margin */}
			<div className="rounded-lg border bg-card p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm text-muted-foreground">Tỷ lệ lợi nhuận</p>
						<p className="text-2xl font-bold text-purple-600">
							{data.summary.totalRevenue > 0
								? `${((data.summary.netProfit / data.summary.totalRevenue) * 100).toFixed(1)}%`
								: "0%"}
						</p>
					</div>
					<div className="bg-purple-100 p-2 rounded-lg">
						<Wallet className="h-5 w-5 text-purple-600" />
					</div>
				</div>
			</div>
		</div>
	);
}
