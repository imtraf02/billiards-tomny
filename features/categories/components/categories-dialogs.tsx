"use client";

import { CategoriesCreateDialog } from "./categories-create-dialog";
import { CategoriesDeleteDialog } from "./categories-delete-dialog";
import { useCategories } from "./categories-provider";
import { CategoriesUpdateDialog } from "./categories-update-dialog";

export function CategoriesDialogs() {
	const { open, setOpen } = useCategories();
	return (
		<>
			<CategoriesCreateDialog
				open={open === "create"}
				onOpenChange={() => setOpen(null)}
			/>
			<CategoriesUpdateDialog
				open={open === "update"}
				onOpenChange={() => setOpen(null)}
			/>
			<CategoriesDeleteDialog
				open={open === "delete"}
				onOpenChange={() => setOpen(null)}
			/>
		</>
	);
}
