import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthStore = {
	token: string | null;
	setToken: (token: string | null) => void;
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			token: null,
			setToken: (token: string | null) => set({ token }),
		}),
		{
			name: "auth",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
