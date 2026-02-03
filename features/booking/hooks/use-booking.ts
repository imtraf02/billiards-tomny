"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import type {
    CreateBookingInput,
    GetBookingsQuery,
    UpdateBookingInput,
    CompleteBookingInput,
    AddTableToBookingInput,
    EndTableInBookingInput
} from "@/shared/schemas/booking";

export function useGetBookings(query: GetBookingsQuery = { page: 1, limit: 10 }) {
    return useQuery({
        queryKey: ["bookings", query],
        queryFn: async () => {
            const formattedQuery = {
                ...query,
                startDate: query.startDate?.toISOString(),
                endDate: query.endDate?.toISOString(),
            };
            const res = await api.bookings.get({ query: formattedQuery as any });
            if (res.error) throw res.error;
            return res.data;
        },
    });
}

export function useGetBooking(id: string) {
    return useQuery({
        queryKey: ["bookings", id],
        queryFn: async () => {
            const res = await api.bookings({ id }).get();
            if (res.error) throw res.error;
            return res.data;
        },
        enabled: !!id,
    });
}

export function useCreateBooking(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateBookingInput) => {
            const res = await api.bookings.post(data);
            if (res.error) throw res.error;
            return res.data;
        },
        onSuccess: async () => {
            // Force reset and refetch to ensure UI is in sync
            await Promise.all([
                queryClient.resetQueries({ queryKey: ["bookings"] }),
                queryClient.resetQueries({ queryKey: ["tables"] }),
            ]);
            onSuccess?.();
        },
    });
}

export function useCompleteBooking(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: CompleteBookingInput }) => {
            const res = await api.bookings({ id }).complete.post(data);
            if (res.error) throw res.error;
            return res.data;
        },
        onSuccess: async (_, { id }) => {
            // Use resetQueries to clear cache and force an immediate fresh fetch
            // This is more aggressive than invalidateQueries and helps with UI sync issues
            await Promise.all([
                queryClient.resetQueries({ queryKey: ["bookings"] }),
                queryClient.resetQueries({ queryKey: ["tables"] }),
                queryClient.invalidateQueries({ queryKey: ["products"] }),
                queryClient.invalidateQueries({ queryKey: ["inventory"] }),
                queryClient.invalidateQueries({ queryKey: ["orders"] }),
                queryClient.invalidateQueries({ queryKey: ["transactions"] }),
            ]);
            onSuccess?.();
        },
    });
}

export function useAddTableToBooking(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: AddTableToBookingInput }) => {
            const res = await api.bookings({ id }).tables.post(data);
            if (res.error) throw res.error;
            return res.data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["bookings", id] });
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            onSuccess?.();
        },
    });
}
