"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/eden";
import type { LoginInput } from "@/shared/schemas/auth";
import { useAuthStore } from "../auth-store";

export const useAuth = () => {
	const queryClient = useQueryClient();
	const { setToken } = useAuthStore();
	const router = useRouter();
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
		onSuccess: ({ data }) => {
			if (data?.token) {
				setToken(data.token);
				queryClient.invalidateQueries({
					queryKey: ["me"],
				});
				console.log("Login successful");
				router.push("/app/dashboard");
			}
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
