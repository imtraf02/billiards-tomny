"use client";

import React, { useState } from "react";
import { useDialogState } from "@/hooks/use-dialog-state";
import type { TableWithSessions } from "../types";

type TablesDialogType =
	| "create"
	| "update"
	| "delete"
	| "start-session"
	| "session-details";

type TablesContextType = {
	open: TablesDialogType | null;
	setOpen: (str: TablesDialogType | null) => void;
	currentRow: TableWithSessions | null;
	setCurrentRow: React.Dispatch<React.SetStateAction<TableWithSessions | null>>;
};

const TablesContext = React.createContext<TablesContextType | null>(null);

export function TablesProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useDialogState<TablesDialogType>(null);
	const [currentRow, setCurrentRow] = useState<TableWithSessions | null>(null);

	return (
		<TablesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
			{children}
		</TablesContext>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTables = () => {
	const tablesContext = React.useContext(TablesContext);

	if (!tablesContext) {
		throw new Error("useTables has to be used within <TablesContext>");
	}

	return tablesContext;
};
