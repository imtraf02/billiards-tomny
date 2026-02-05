import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/eden";
import type { CompleteBookingInput } from "@/shared/schemas/booking";
import type { UpdateOrderInput } from "@/shared/schemas/order";
import type { BookingDetails, CostCalculation, DialogStates } from "../types";

export function useDialogStates() {
	const [states, setStates] = useState<DialogStates>({
		confirmCheckout: false,
		confirmStop: false,
		merging: false,
		printInvoice: false,
	});

	const updateState = useCallback((key: keyof DialogStates, value: boolean) => {
		setStates((prev) => ({ ...prev, [key]: value }));
	}, []);

	return { states, updateState };
}

export function useBookingDetails(
	bookingId: string | undefined,
	open: boolean,
) {
	return useQuery({
		queryKey: ["booking", bookingId],
		queryFn: async () => {
			if (!bookingId) return null;
			const res = await api.bookings({ id: bookingId }).get();
			if (res.error) {
				toast.error("Lỗi tải hóa đơn");
				return null;
			}
			return res.data;
		},
		enabled: !!bookingId && open,
		staleTime: 10000,
	});
}

export function useActiveBookings(open: boolean, isMerging: boolean) {
	return useQuery({
		queryKey: ["bookings", "active"],
		queryFn: async () => {
			const res = await api.bookings.active.get();
			if (res.error) throw res.error;
			return res.data;
		},
		enabled: open && isMerging,
		staleTime: 5000,
	});
}

export function useCompleteBooking(
	bookingId: string | undefined,
	onSuccess: () => void,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: CompleteBookingInput;
		}) => {
			const res = await api.bookings({ id }).complete.post(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: (updatedBooking) => {
			if (updatedBooking) {
				queryClient.setQueryData(["booking", bookingId], updatedBooking);
			}
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			onSuccess();
		},
		onError: (error) => {
			console.error(error);
			toast.error("Thanh toán thất bại");
		},
	});
}

export function useStopTable(
	bookingId: string | undefined,
	onSuccess: () => void,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (bookingTableId: string) => {
			const res = await api.bookings.tables.end.post({ bookingTableId });
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Đã ngừng tính giờ bàn này");
			onSuccess();
		},
		onError: (error) => {
			console.error(error);
			toast.error("Lỗi");
		},
	});
}

export function useUpdateOrder(bookingId: string | undefined) {
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
			toast.success("Đã cập nhật đơn hàng!");
		},
	});
}

export function useMergeBookings(onSuccess: () => void) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			targetId,
			sourceId,
		}: {
			targetId: string;
			sourceId: string;
		}) => {
			const res = await api.bookings({ id: targetId }).merge.post({
				sourceBookingId: sourceId,
			});
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Gộp bill thành công");
			onSuccess();
		},
		onError: (error) => {
			toast.error(error.message || "Gộp bill thất bại");
		},
	});
}

export function useCostCalculation(
	booking: BookingDetails | null | undefined,
	currentTime: Date,
): CostCalculation {
	const serviceTotal = useMemo(() => {
		if (!booking?.orders) return 0;
		return booking.orders
			.filter((order) => order.status !== "CANCELLED")
			.reduce((acc, order) => acc + Number(order.totalAmount || 0), 0);
	}, [booking?.orders]);

	return useMemo(() => {
		let allTablesCost = 0;

		if (booking?.bookingTables) {
			booking.bookingTables.forEach((bt) => {
				const end = bt.endTime
					? new Date(bt.endTime)
					: booking.status === "COMPLETED" && booking.endTime
						? new Date(booking.endTime)
						: currentTime;
				const start = new Date(bt.startTime);
				const diff = Math.max(0, end.getTime() - start.getTime());
				const cost =
					Math.ceil(((diff / 3600000) * bt.priceSnapshot) / 1000) * 1000;
				allTablesCost += cost;
			});
		}

		return {
			totalAmount:
				booking?.status === "COMPLETED"
					? booking.totalAmount
					: allTablesCost + serviceTotal,
			totalHourlyCost: allTablesCost,
			serviceTotal,
		};
	}, [booking, currentTime, serviceTotal]);
}
