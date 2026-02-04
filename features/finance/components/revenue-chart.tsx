"use client";

import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface RevenueChartProps {
	data: Array<{
		date: string;
		revenue: number;
		orders: number;
	}>;
}

export function RevenueChart({ data }: RevenueChartProps) {
	return (
		<div className="h-76">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
					<XAxis
						dataKey="date"
						stroke="#888888"
						fontSize={12}
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						stroke="#888888"
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
					/>
					<Tooltip
						formatter={(value) => [
							new Intl.NumberFormat("vi-VN").format(Number(value)),
							"Doanh thu",
						]}
						labelFormatter={(label) => `Ngày: ${label}`}
					/>
					<Line
						type="monotone"
						dataKey="revenue"
						stroke="#3b82f6"
						strokeWidth={2}
						dot={{ r: 4 }}
						activeDot={{ r: 6 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
