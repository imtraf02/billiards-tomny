"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import type {
	CreateOrderInput,
	GetOrdersQuery,
	UpdateOrderInput,
} from "@/shared/schemas/order";

export function useGetOrders(query: GetOrdersQuery = { page: 1, limit: 10 }) {
	return useQuery({
		queryKey: ["orders", query],
		queryFn: async () => {
			const formattedQuery = {
				...query,
				startDate: query.startDate?.toISOString(),
				endDate: query.endDate?.toISOString(),
			};
			const res = await api.orders.get({ query: formattedQuery as any });
			if (res.error) throw res.error;
			return res.data;
		},
	});
}

export function useCreateOrder(onSuccess?: () => void) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (data: CreateOrderInput) => {
			const res = await api.orders.post(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.resetQueries({ queryKey: ["orders"] }),
				queryClient.resetQueries({ queryKey: ["bookings"] }),
				queryClient.resetQueries({ queryKey: ["tables"] }),
				queryClient.invalidateQueries({ queryKey: ["products"] }),
				queryClient.invalidateQueries({ queryKey: ["inventory"] }),
			]);
			onSuccess?.();
		},
	});
}

export function useUpdateOrder(onSuccess?: () => void) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateOrderInput;
		}) => {
			const res = await api.orders({ id }).patch(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.resetQueries({ queryKey: ["orders"] }),
				queryClient.resetQueries({ queryKey: ["bookings"] }),
				queryClient.resetQueries({ queryKey: ["tables"] }),
				queryClient.invalidateQueries({ queryKey: ["products"] }),
				queryClient.invalidateQueries({ queryKey: ["inventory"] }),
			]);
			onSuccess?.();
		},
	});
}
