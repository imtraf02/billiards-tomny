"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import type { Table } from "@/generated/prisma/browser";
import { api } from "@/lib/eden";

interface TablesDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: Table;
}

export function TablesDeleteDialog({
	open,
	onOpenChange,
	currentRow,
}: TablesDeleteDialogProps) {
	const queryClient = useQueryClient();
	const [value, setValue] = useState("");

	const { mutate, isPending } = useMutation({
		mutationFn: async () => await api.tables({ id: currentRow.id }).delete(),
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
				if (value.trim() !== currentRow.name) return;
				mutate();
			}}
			disabled={value.trim() !== currentRow.name || isPending}
			title={
				<span className="text-destructive">
					<AlertTriangle className="me-1 inline-block stroke-destructive" /> Xóa
					bàn
				</span>
			}
			desc={
				<div className="space-y-4">
					<p className="mb-2">
						Bạn có chắc chắn muốn xóa{" "}
						<span className="font-bold">{currentRow.name}</span>?
						<br />
						Hành động này sẽ xóa bàn khỏi hệ thống, không thể hoàn tác.
					</p>
					<Input
						value={value}
						onChange={(e) => setValue(e.target.value)}
						placeholder="Nhập tên bàn để xác nhận xóa."
					/>
					<Alert variant="destructive">
						<AlertTitle>Cảnh báo!</AlertTitle>
						<AlertDescription>
							Hãy cẩn thận, thao tác này không thể được khôi phục.
						</AlertDescription>
					</Alert>
				</div>
			}
			confirmText="Xác nhận xóa"
			destructive
		/>
	);
}
