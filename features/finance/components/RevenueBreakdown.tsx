import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import type { RevenueBreakdown } from "@/shared/schemas/finance";

interface RevenueBreakdownProps {
	data: RevenueBreakdown;
}

export function RevenueBreakdownComponent({ data }: RevenueBreakdownProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const chartData = [
		{ name: "Tiền bàn", value: data.tableRevenue, color: "#3b82f6" },
		{ name: "Sản phẩm", value: data.productRevenue, color: "#8b5cf6" },
		{ name: "Thu khác", value: data.otherRevenue, color: "#10b981" },
	].filter((item) => item.value > 0);

	return (
		<div className="rounded-xl border bg-card p-6">
			<h3 className="text-lg font-semibold mb-4">Phân tích doanh thu</h3>

			{data.total === 0 ? (
				<div className="flex items-center justify-center h-64 text-muted-foreground">
					Chưa có doanh thu trong khoảng thời gian này
				</div>
			) : (
				<div className="space-y-4">
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={chartData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={(entry) =>
										`${((entry.value / data.total) * 100).toFixed(1)}%`
									}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{chartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip formatter={(value: number) => formatCurrency(value)} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>

					<div className="grid grid-cols-1 gap-2">
						<div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-blue-600" />
								<span className="font-medium">Tiền bàn chơi</span>
							</div>
							<span className="font-bold text-blue-600">
								{formatCurrency(data.tableRevenue)}
							</span>
						</div>
						<div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-purple-600" />
								<span className="font-medium">Bán sản phẩm</span>
							</div>
							<span className="font-bold text-purple-600">
								{formatCurrency(data.productRevenue)}
							</span>
						</div>
						<div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-green-600" />
								<span className="font-medium">Thu nhập khác</span>
							</div>
							<span className="font-bold text-green-600">
								{formatCurrency(data.otherRevenue)}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
