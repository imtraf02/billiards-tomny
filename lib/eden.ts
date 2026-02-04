import { treaty } from "@elysiajs/eden";
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
	onResponse(response) {
		if (response.status === 401) {
			queryClient.setQueriesData({ queryKey: ["me"] }, null);
		}
	},
}).api;
