import { treaty } from "@elysiajs/eden";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/auth-store";
import type { app } from "@/server";
import { queryClient } from "./query-client";

export const api = treaty<typeof app>("http://localhost:3000", {
	headers(_path, options) {
		const token = useAuthStore.getState().token;

		return {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		};
	},
	async onResponse(response) {
		if (response.status === 401) {
			queryClient.setQueriesData({ queryKey: ["me"] }, null);
		}

		if (!response.ok) {
			try {
				const data = await response.clone().json();
				toast.error(data.error || "Có lỗi xảy ra");
			} catch {
				toast.error("Có lỗi xảy ra");
			}
		}
	},
}).api;
