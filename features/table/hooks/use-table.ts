"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import type {
	CreateTableInput,
	GetTablesQuery,
	UpdateTableInput,
} from "@/shared/schemas/table";

export function useGetTables(query: GetTablesQuery = {}, options?: any) {
	return useQuery({
		queryKey: ["tables", query],
		queryFn: async () => {
			const res = await api.tables.get({
				query,
			});
			if (res.status === 200) {
				return res.data;
			}
			return [];
		},
		// Tối ưu cache
		staleTime: 5 * 60 * 1000, // 5 phút
		cacheTime: 30 * 60 * 1000, // 30 phút
		// Tắt refetch tự động
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		...options,
	});
}

export function useCreateTable(onSuccess?: () => void) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateTableInput) => {
			const res = await api.tables.post(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onMutate: async (newTable) => {
			// Cancel outgoing queries
			await queryClient.cancelQueries({ queryKey: ["tables"] });
			
			// Snapshot previous value
			const previousTables = queryClient.getQueryData<any[]>(["tables"]);
			
			// Optimistically add new table
			if (previousTables) {
				queryClient.setQueryData(["tables"], [...previousTables, { ...newTable, id: Date.now().toString() }]);
			}
			
			return { previousTables };
		},
		onError: (err, newTable, context) => {
			// Rollback on error
			if (context?.previousTables) {
				queryClient.setQueryData(["tables"], context.previousTables);
			}
		},
		onSuccess: (data) => {
			// Cập nhật cache với data từ server
			queryClient.setQueriesData(
				{ queryKey: ["tables"] },
				(old: any) => {
					if (!old) return [data];
					// Thay thế temp id bằng real id
					return old.map((table: any) => 
						table.id === data.id || table.id.toString() === data.id.toString() ? data : table
					);
				}
			);
			onSuccess?.();
		},
	});
}

export function useUpdateTable(onSuccess?: () => void) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateTableInput;
		}) => {
			const res = await api.tables({ id }).patch(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onMutate: async (variables) => {
			await queryClient.cancelQueries({ queryKey: ["tables"] });
			
			const previousTables = queryClient.getQueryData<any[]>(["tables"]);
			
			if (previousTables) {
				const updatedTables = previousTables.map(table =>
					table.id === variables.id ? { ...table, ...variables.data } : table
				);
				queryClient.setQueryData(["tables"], updatedTables);
			}
			
			return { previousTables };
		},
		onError: (err, variables, context) => {
			if (context?.previousTables) {
				queryClient.setQueryData(["tables"], context.previousTables);
			}
		},
		onSuccess: (data, variables) => {
			queryClient.setQueriesData(
				{ queryKey: ["tables"] },
				(old: any) => {
					if (!old) return old;
					return old.map((table: any) =>
						table.id === variables.id ? { ...table, ...data } : table
					);
				}
			);
			onSuccess?.();
		},
	});
}

export function useDeleteTable(onSuccess?: () => void) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await api.tables({ id }).delete();
			if (res.error) throw res.error;
			return res.data;
		},
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: ["tables"] });
			
			const previousTables = queryClient.getQueryData<any[]>(["tables"]);
			
			if (previousTables) {
				const updatedTables = previousTables.filter(table => table.id !== id);
				queryClient.setQueryData(["tables"], updatedTables);
			}
			
			return { previousTables };
		},
		onError: (err, id, context) => {
			if (context?.previousTables) {
				queryClient.setQueryData(["tables"], context.previousTables);
			}
		},
		onSuccess: () => {
			onSuccess?.();
		},
	});
}
