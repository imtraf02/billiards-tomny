import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";
import type { ExpenseBreakdown } from "@/shared/schemas/finance";

interface ExpenseBreakdownProps {
	data: ExpenseBreakdown;
}

export function ExpenseBreakdownComponent({ data }: ExpenseBreakdownProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const chartData = [
		{ name: "Nhập hàng", value: data.purchaseExpense, color: "#f59e0b" },
		{ name: "Điện nước", value: data.utilities, color: "#06b6d4" },
		{ name: "Lương NV", value: data.salaries, color: "#ec4899" },
		{ name: "Chi phí khác", value: data.otherExpense, color: "#6b7280" },
	].filter((item) => item.value > 0);

	return (
		<div className="rounded-xl border bg-card p-6">
			<h3 className="text-lg font-semibold mb-4">Phân tích chi phí</h3>
			
			{data.total === 0 ? (
				<div className="flex items-center justify-center h-64 text-muted-foreground">
					Chưa có chi phí trong khoảng thời gian này
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
									label={(entry) => `${((entry.value / data.total) * 100).toFixed(1)}%`}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
								>
									{chartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									formatter={(value: number) => formatCurrency(value)}
								/>
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>

					<div className="grid grid-cols-1 gap-2">
						<div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-orange-600" />
								<span className="font-medium">Nhập hàng kho</span>
							</div>
							<span className="font-bold text-orange-600">
								{formatCurrency(data.purchaseExpense)}
							</span>
						</div>
						<div className="flex items-center justify-between p-3 rounded-lg bg-cyan-50">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-cyan-600" />
								<span className="font-medium">Điện, nước</span>
							</div>
							<span className="font-bold text-cyan-600">
								{formatCurrency(data.utilities)}
							</span>
						</div>
						<div className="flex items-center justify-between p-3 rounded-lg bg-pink-50">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-pink-600" />
								<span className="font-medium">Lương nhân viên</span>
							</div>
							<span className="font-bold text-pink-600">
								{formatCurrency(data.salaries)}
							</span>
						</div>
						<div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 rounded-full bg-gray-600" />
								<span className="font-medium">Chi phí khác</span>
							</div>
							<span className="font-bold text-gray-600">
								{formatCurrency(data.otherExpense)}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
