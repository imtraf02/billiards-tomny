"use client";

import React, { useState } from "react";
import { useDialogState } from "@/hooks/use-dialog-state";
import type { OrderDetails } from "../types";

type OrdersDialogType = "create" | "update" | "delete";

type OrdersContextType = {
	open: OrdersDialogType | null;
	setOpen: (str: OrdersDialogType | null) => void;
	currentRow: OrderDetails | null;
	setCurrentRow: React.Dispatch<React.SetStateAction<OrderDetails | null>>;
};

const OrdersContext = React.createContext<OrdersContextType | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useDialogState<OrdersDialogType>(null);
	const [currentRow, setCurrentRow] = useState<OrderDetails | null>(null);

	return (
		<OrdersContext.Provider
			value={{ open, setOpen, currentRow, setCurrentRow }}
		>
			{children}
		</OrdersContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
	const ordersContext = React.useContext(OrdersContext);

	if (!ordersContext) {
		throw new Error("useOrders has to be used within <OrdersContext>");
	}

	return ordersContext;
};
