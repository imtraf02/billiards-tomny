import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";

export function useSessionOrders(sessionId: string, enabled: boolean = true) {
	return useQuery({
		queryKey: ["orders", sessionId],
		queryFn: async () => {
			const response = await api.order["get-by-session"].get({
				query: { sessionId },
			});
			if (!response.data) return [];
			return response.data;
		},
		enabled,
	});
}
