"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Category } from "@/generated/prisma/browser";
import { api } from "@/lib/eden";
import {
	type CreateCategoryInput,
	createCategorySchema,
	type UpdateCategoryInput,
} from "@/shared/schemas/product";

interface CategoryDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category: Category | null; // null for creating, object for editing
}

export function CategoryDrawer({
	open,
	onOpenChange,
	category,
}: CategoryDrawerProps) {
	const isEditing = !!category;

	const queryClient = useQueryClient();

	const { mutate: createCategory, isPending: isCreating } = useMutation({
		mutationFn: async (data: CreateCategoryInput) => {
			const res = await api.products.categories.post(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			toast.success("Tạo danh mục thành công!");
			onOpenChange(false);
			form.reset();
		},
	});

	const { mutate: updateCategory, isPending: isUpdating } = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateCategoryInput;
		}) => {
			const res = await api.products.categories({ id }).put(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			toast.success("Cập nhật danh mục thành công!");
			onOpenChange(false);
		},
	});

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
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="mx-auto rounded-t-xl">
				<DrawerHeader>
					<DrawerTitle>
						{isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
					</DrawerTitle>
					<DrawerDescription>
						{isEditing
							? "Thay đổi tên danh mục sản phẩm của bạn."
							: "Nhập tên danh mục mới để phân loại sản phẩm."}
					</DrawerDescription>
				</DrawerHeader>
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

					<DrawerFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? "Đang xử lý..."
								: isEditing
									? "Lưu thay đổi"
									: "Thêm mới"}
						</Button>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
