"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/eden";
import { useCategories } from "./categories-provider";

interface CategoriesDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CategoriesDeleteDialog({
	open,
	onOpenChange,
}: CategoriesDeleteDialogProps) {
	const queryClient = useQueryClient();
	const { currentRow } = useCategories();

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			if (!currentRow) return;
			await api.products.categories({ id: currentRow.id }).delete();
		},
		onSuccess: () => {
			toast.success("Danh mục đã được xóa thành công");
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			onOpenChange(false);
		},
		onError: () => {
			toast.error("Có lỗi xảy ra khi xóa danh mục");
		},
	});

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
					<AlertDialogDescription>
						Hành động này không thể hoàn tác. Danh mục này sẽ bị xóa vĩnh viễn
						khỏi hệ thống.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
					<AlertDialogAction
						disabled={isPending}
						onClick={(e) => {
							e.preventDefault();
							mutate();
						}}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending ? "Đang xóa..." : "Xóa"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
