import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";

export function useDashboardMetrics(): UseQueryResult<any> {
	return useQuery({
		queryKey: ["dashboard", "metrics"],
		queryFn: async () => {
			const { data, error } = await api.dashboard.metrics.get();
			if (error) throw error;
			return data;
		},
	});
}

export function useRecentActivity(): UseQueryResult<any> {
	return useQuery({
		queryKey: ["dashboard", "recent"],
		queryFn: async () => {
			const { data, error } = await api.dashboard.recent.get();
			if (error) throw error;
			return data;
		},
	});
}
