"use client";

import * as React from "react";
import type { CategoryWithCount } from "../types";

type DialogType = "create" | "update" | "delete";

interface CategoriesContextType {
	open: DialogType | null;
	setOpen: (str: DialogType | null) => void;
	currentRow: CategoryWithCount | null;
	setCurrentRow: React.Dispatch<React.SetStateAction<CategoryWithCount | null>>;
}

const CategoriesContext = React.createContext<CategoriesContextType | null>(
	null,
);

interface CategoriesProviderProps {
	children: React.ReactNode;
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
	const [open, setOpen] = React.useState<DialogType | null>(null);
	const [currentRow, setCurrentRow] = React.useState<CategoryWithCount | null>(
		null,
	);

	return (
		<CategoriesContext.Provider
			value={{
				open,
				setOpen,
				currentRow,
				setCurrentRow,
			}}
		>
			{children}
		</CategoriesContext.Provider>
	);
}

export const useCategories = () => {
	const categoriesContext = React.useContext(CategoriesContext);

	if (!categoriesContext) {
		throw new Error(
			"useCategories has to be used within <CategoriesContext.Provider>",
		);
	}

	return categoriesContext;
};
