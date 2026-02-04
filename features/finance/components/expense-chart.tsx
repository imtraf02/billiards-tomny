"use client";

import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

interface ExpenseChartProps {
	data: Array<{
		name: string;
		value: number;
		color: string;
	}>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function ExpenseChart({ data }: ExpenseChartProps) {
	return (
		<div className="h-76">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={({ name, percent }) =>
							`${name}: ${(percent * 100).toFixed(0)}%`
						}
						outerRadius={80}
						fill="#8884d8"
						dataKey="value"
					>
						{data.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={entry.color || COLORS[index % COLORS.length]}
							/>
						))}
					</Pie>
					<Tooltip
						formatter={(value) => [
							new Intl.NumberFormat("vi-VN").format(Number(value)),
							"Chi phí",
						]}
					/>
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
