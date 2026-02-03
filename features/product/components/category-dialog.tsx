"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createCategorySchema } from "@/shared/schemas/product";
import { useCreateCategory, useUpdateCategory } from "../hooks/use-product";
import { toast } from "sonner";

interface CategoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category: any | null; // null for creating, object for editing
}

export function CategoryDialog({
	open,
	onOpenChange,
	category,
}: CategoryDialogProps) {
	const isEditing = !!category;

	const { mutate: createCategory, isPending: isCreating } = useCreateCategory(
		() => {
			toast.success("Tạo danh mục thành công!");
			onOpenChange(false);
			form.reset();
		},
	);

	const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory(
		() => {
			toast.success("Cập nhật danh mục thành công!");
			onOpenChange(false);
		},
	);

	const form = useForm({
		defaultValues: {
			name: "",
		},
		validators: {
			onChange: createCategorySchema,
		},
		onSubmit: async ({ value }) => {
			if (isEditing && category) {
				updateCategory({ id: category.id, data: value });
			} else {
				createCategory(value);
			}
		},
	});

	// Reset form when editing a different category or switching modes
	useEffect(() => {
		if (open) {
			if (category) {
				form.reset({ name: category.name });
			} else {
				form.reset({ name: "" });
			}
		}
	}, [category, open, form]);

	const isLoading = isCreating || isUpdating;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
					</DialogTitle>
					<DialogDescription>
						{isEditing 
                            ? "Thay đổi tên danh mục sản phẩm của bạn." 
                            : "Nhập tên danh mục mới để phân loại sản phẩm."}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="grid gap-4 py-4"
				>
					<form.Field
						name="name"
						children={(field) => (
							<Field data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel>Tên danh mục</FieldLabel>
								<FieldContent>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ví dụ: Đồ uống, Thức ăn..."
										disabled={isLoading}
									/>
								</FieldContent>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Đang xử lý..." : isEditing ? "Lưu thay đổi" : "Thêm mới"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
