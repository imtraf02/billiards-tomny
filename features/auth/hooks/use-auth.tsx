"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/eden";
import type { LoginInput } from "@/shared/schemas/auth";
import { useAuthStore } from "../auth-store";

export const useAuth = () => {
	const queryClient = useQueryClient();
	const { setToken } = useAuthStore();
	const { data: me, isLoading: isMeLoading } = useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			const res = await api.auth.me.get();
			return res.data;
		},
	});

	const { mutate: logout, isPending: isLoggingOut } = useMutation({
		mutationFn: async () => {
			return await api.auth.logout.post();
		},
		onSuccess: (data) => {
			if (data.data) {
				setToken(null);
				queryClient.clear();
			}
		},
	});

	const { mutate: login, isPending: isLoggingIn } = useMutation({
		mutationFn: async (data: LoginInput) => {
			return await api.auth.login.post({
				email: data.email,
				password: data.password,
			});
		},
		onSuccess: ({ data, error }) => {
			if (data?.token) {
				setToken(data.token);
				queryClient.invalidateQueries({
					queryKey: ["me"],
				});
				toast.success(data.message);
			} else if (error?.value) {
				toast.error(error.value.message);
			}
		},
		onError: (error) => {
			toast(error.message);
		},
	});

	return {
		me,
		logout,
		login,
		isLoggingIn,
		isLoggingOut,
		isMeLoading,
	};
};
