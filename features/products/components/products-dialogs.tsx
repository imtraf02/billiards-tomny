"use client";

import { ProductsCreateDialog } from "./products-create-dialog";
import { ProductsDeleteDialog } from "./products-delete-dialog";
import { ProductsDetailDrawer } from "./products-detail-drawer";
import { ProductsImportDialog } from "./products-import-dialog";
import { ProductsInternalUseDialog } from "./products-internal-use-dialog";
import { useProducts } from "./products-provider";
import { ProductsSpoilageDialog } from "./products-spoilage-dialog";
import { ProductsUpdateDialog } from "./products-update-dialog";

export function ProductsDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useProducts();
	return (
		<>
			<ProductsCreateDialog
				key="product-create"
				open={open === "create"}
				onOpenChange={() => setOpen("create")}
			/>

			{currentRow && (
				<>
					<ProductsDetailDrawer
						key={`product-${currentRow.id}`}
						open={open === "detail"}
						onOpenChange={() => {
							setOpen("detail");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<ProductsUpdateDialog
						key={`product-update-${currentRow.id}`}
						open={open === "update"}
						onOpenChange={() => {
							setOpen("update");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<ProductsImportDialog
						key={`product-import-${currentRow.id}`}
						open={open === "import"}
						onOpenChange={() => {
							setOpen("import");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<ProductsInternalUseDialog
						key={`product-internal-use-${currentRow.id}`}
						open={open === "internal-use"}
						onOpenChange={() => {
							setOpen("internal-use");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<ProductsSpoilageDialog
						key={`product-spoilage-${currentRow.id}`}
						open={open === "spoilage"}
						onOpenChange={() => {
							setOpen("spoilage");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<ProductsDeleteDialog
						key={`product-delete-${currentRow.id}`}
						open={open === "delete"}
						onOpenChange={() => {
							setOpen("delete");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>
				</>
			)}
		</>
	);
}
