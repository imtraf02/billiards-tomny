"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import type {
	CreateTableInput,
	GetTablesQuery,
	UpdateTableInput,
} from "@/shared/schemas/table";

export function useGetTables(query: GetTablesQuery = {}) {
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			onSuccess?.();
		},
	});
}
