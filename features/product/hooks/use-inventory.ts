"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import type { CreateInventoryLogInput } from "@/shared/schemas/product";

export function useCreateInventoryLog(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateInventoryLogInput) => {
            const res = await api.products.inventory.post(data);
            if (res.error) throw res.error;
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
            onSuccess?.();
        },
    });
}

export function useGetInventoryLogs(productId?: string) {
    return useQuery({
        queryKey: ["inventory", productId],
        queryFn: async () => {
            const res = await api.products.inventory.get({
                query: {
                    productId: productId || undefined,
                    page: 1,
                    limit: 50,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
            return { data: [], meta: { total: 0, page: 1, limit: 50, totalPages: 1 } };
        },
        enabled: true,
    });
}

export function useGetProductInventoryLogs(productId: string) {
    return useQuery({
        queryKey: ["inventory", "product", productId],
        queryFn: async () => {
            const res = await api.products({ id: productId }).inventory.get();
            if (res.status === 200) {
                return res.data;
            }
            return [];
        },
        enabled: !!productId,
    });
}
