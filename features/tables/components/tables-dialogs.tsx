"use client";

import { TablesCreateDialog } from "./tables-create-dialog";
import { TablesDeleteDialog } from "./tables-delete-dialog";
import { useTables } from "./tables-provider";
import { TablesSessionDetailsDialog } from "./tables-session-details-dialog";
import { TablesStartSessionDialog } from "./tables-start-session-dialog";
import { TablesUpdateDialog } from "./tables-update-dialog";

export function TablesDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useTables();
	return (
		<>
			<TablesCreateDialog
				key="table-create"
				open={open === "create"}
				onOpenChange={() => setOpen("create")}
			/>

			{currentRow && (
				<>
					{currentRow.sessions.length > 0 && (
						<TablesSessionDetailsDialog
							key={`table-session-details-${currentRow.id}`}
							open={open === "session-details"}
							onOpenChange={() => {
								setOpen("session-details");
								setTimeout(() => {
									setCurrentRow(null);
								}, 500);
							}}
							currentRow={currentRow}
						/>
					)}

					<TablesStartSessionDialog
						key={`table-start-session-${currentRow.id}`}
						open={open === "start-session"}
						onOpenChange={() => {
							setOpen("start-session");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<TablesUpdateDialog
						key={`table-update-${currentRow.id}`}
						open={open === "update"}
						onOpenChange={() => {
							setOpen("update");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<TablesDeleteDialog
						key={`table-delete-${currentRow.id}`}
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
