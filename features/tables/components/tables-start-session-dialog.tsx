"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Table } from "@/generated/prisma/browser";
import { api } from "@/lib/eden";

interface TablesStartSessionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: Table;
}

export function TablesStartSessionDialog({
	open,
	onOpenChange,
	currentRow,
}: TablesStartSessionDialogProps) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async () =>
			await api.tables({ id: currentRow.id })["start-session"].post(),
		onSuccess: ({ data }) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["tables"] });
				onOpenChange(false);
			}
		},
	});

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={async () => {
				mutate();
			}}
			disabled={isPending}
			title={<span className="font-semibold">Xác nhận phiên chơi</span>}
			desc={
				<div className="space-y-4">
					<p className="mb-2">
						Bạn có chắc chắn muốn bắt đầu phiên chơi cho{" "}
						<span className="font-bold">{currentRow.name}</span>?
					</p>
				</div>
			}
			confirmText="Xác nhận"
			// destructive={false}
		/>
	);
}
