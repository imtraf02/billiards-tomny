import { format } from "date-fns";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { FinanceTrend } from "@/shared/schemas/finance";

interface FinanceChartProps {
	data: FinanceTrend[];
	title: string;
}

export function FinanceChart({ data, title }: FinanceChartProps) {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	return (
		<div className="rounded-xl border bg-card p-6">
			<h3 className="text-lg font-semibold mb-4">{title}</h3>
			<div className="h-80">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="date"
							tickFormatter={(str) => format(new Date(str), "dd/MM")}
							fontSize={12}
						/>
						<YAxis
							fontSize={12}
							tickFormatter={(val) => `${val / 1000}k`}
						/>
						<Tooltip
							labelFormatter={(label) =>
								format(new Date(label as string), "dd/MM/yyyy")
							}
							formatter={(value) => [formatCurrency(value as number), ""]}
						/>
						<Legend />
						<Line
							type="monotone"
							dataKey="revenue"
							name="Doanh thu"
							stroke="#2563eb"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="expense"
							name="Chi phí"
							stroke="#dc2626"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							type="monotone"
							dataKey="profit"
							name="Lợi nhuận"
							stroke="#16a34a"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
