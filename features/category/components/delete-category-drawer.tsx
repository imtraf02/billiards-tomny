"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { api } from "@/lib/eden";

interface DeleteCategoryDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categoryId: string | null;
	categoryName: string | null;
}

export function DeleteCategoryDrawer({
	open,
	onOpenChange,
	categoryId,
	categoryName,
}: DeleteCategoryDrawerProps) {
	const queryClient = useQueryClient();

	const { mutate: deleteCategory, isPending } = useMutation({
		mutationFn: async (id: string) => {
			const res = await api.products.categories({ id }).delete();
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			toast.success("Đã xóa danh mục");
			onOpenChange(false);
		},
		onError: (error: any) => {
			toast.error(
				"Xóa danh mục thất bại: " +
					(error.value?.message || "Lỗi không xác định"),
			);
		},
	});

	const handleDelete = () => {
		if (categoryId) {
			deleteCategory(categoryId);
		}
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[auto] max-h-[95vh] sm:max-w-md mx-auto rounded-t-xl">
				<DrawerHeader>
					<DrawerTitle>Bạn có chắc chắn muốn xóa?</DrawerTitle>
					<DrawerDescription>
						Hành động này không thể hoàn tác. Danh mục{" "}
						<strong>{categoryName}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
						<br />
						<span className="text-destructive font-medium text-xs mt-2 block">
							Lưu ý: Không thể xóa danh mục nếu vẫn còn sản phẩm thuộc danh mục
							này.
						</span>
					</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter className="gap-2 sm:gap-0">
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
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
