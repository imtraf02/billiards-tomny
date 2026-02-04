import { useQuery } from "@tanstack/react-query";
import type {
	FinanceAnalyticsResponse,
	GetFinanceAnalyticsQuery,
} from "@/shared/schemas/finance";
import { api } from "@/lib/eden";

export function useFinanceAnalytics(query: GetFinanceAnalyticsQuery) {
	return useQuery({
		queryKey: ["finance-analytics", query],
		queryFn: async () => {
			const res = await api.finance.analytics.get({
				query: {
					startDate: query.startDate,
					endDate: query.endDate,
				},
			});
			if (res.status === 200) {
				return res.data as FinanceAnalyticsResponse;
			}
			throw new Error("Failed to fetch finance analytics");
		},
	});
}
