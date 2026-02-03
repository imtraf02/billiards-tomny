"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteCategory } from "../hooks/use-product";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteCategoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categoryId: string | null;
	categoryName: string | null;
}

export function DeleteCategoryDialog({
	open,
	onOpenChange,
	categoryId,
	categoryName,
}: DeleteCategoryDialogProps) {
	const { mutate: deleteCategory, isPending } = useDeleteCategory(() => {
		toast.success("Đã xóa danh mục");
		onOpenChange(false);
	});

	const handleDelete = () => {
		if (categoryId) {
			deleteCategory(categoryId);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Bạn có chắc chắn muốn xóa?</DialogTitle>
					<DialogDescription>
						Hành động này không thể hoàn tác. Danh mục <strong>{categoryName}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
						<br />
						<span className="text-destructive font-medium text-xs mt-2 block">
							Lưu ý: Không thể xóa danh mục nếu vẫn còn sản phẩm thuộc danh mục này.
						</span>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Hủy
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Đang xóa...
							</>
						) : (
							"Xác nhận xóa"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
