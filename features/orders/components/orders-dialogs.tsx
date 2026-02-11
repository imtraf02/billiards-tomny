"use client";

import OrdersMutateDialog from "./orders-mutate-drawer";
import { useOrders } from "./orders-provider";

export function OrdersDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useOrders();
	return (
		<>
			<OrdersMutateDialog
				key="orders-create"
				open={open === "create"}
				onOpenChange={() => setOpen("create")}
			/>
			{currentRow && (
				<>
					<OrdersMutateDialog
						key={`orders-update-${currentRow.id}`}
						open={open === "update"}
						onOpenChange={() => {
							setOpen("update");
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
