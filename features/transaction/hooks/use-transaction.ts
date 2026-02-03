import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import type { GetTransactionsQuery } from "@/shared/schemas/transaction";

export function useGetTransactions(
	query?: Partial<GetTransactionsQuery>,
): UseQueryResult<any> {
	return useQuery({
		queryKey: ["transactions", query],
		queryFn: async () => {
			const { data, error } = await api.transactions.index.get({
				query: query as any,
			});

			if (error) throw error;
			return data;
		},
	});
}
