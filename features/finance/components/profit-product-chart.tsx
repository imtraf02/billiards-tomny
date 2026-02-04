"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface ProfitProductChartProps {
	data: Array<{
		product: string;
		revenue: number;
		cost: number;
		profit: number;
	}>;
	showDetails?: boolean;
}

export function ProfitProductChart({
	data,
	showDetails = false,
}: ProfitProductChartProps) {
	const chartData = showDetails
		? data.map((item) => ({
				...item,
				profitMargin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
			}))
		: data;

	return (
		<div className="h-76">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
					<XAxis
						dataKey="product"
						stroke="#888888"
						fontSize={12}
						tickLine={false}
						axisLine={false}
						angle={-45}
						textAnchor="end"
						height={60}
					/>
					<YAxis
						stroke="#888888"
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
					/>
					<Tooltip
						formatter={(value, name) => {
							const formatted = new Intl.NumberFormat("vi-VN").format(
								Number(value),
							);
							if (name === "profitMargin") {
								return [`${value.toFixed(1)}%`, "Tỷ suất lợi nhuận"];
							}
							return [
								formatted,
								name === "profit"
									? "Lợi nhuận"
									: name === "revenue"
										? "Doanh thu"
										: "Chi phí",
							];
						}}
					/>
					{showDetails ? (
						<>
							<Bar
								dataKey="revenue"
								fill="#3b82f6"
								name="Doanh thu"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="cost"
								fill="#ef4444"
								name="Chi phí"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="profit"
								fill="#10b981"
								name="Lợi nhuận"
								radius={[4, 4, 0, 0]}
							/>
						</>
					) : (
						<Bar
							dataKey="profit"
							fill={(data) => (data.profit >= 0 ? "#10b981" : "#ef4444")}
							name="Lợi nhuận"
							radius={[4, 4, 0, 0]}
						/>
					)}
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
