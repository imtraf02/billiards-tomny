"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/eden";
import {
	type UpdateCategoryInput,
	updateCategorySchema,
} from "@/shared/schemas/product";
import { useCategories } from "./categories-provider";

interface CategoriesUpdateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CategoriesUpdateDialog({
	open,
	onOpenChange,
}: CategoriesUpdateDialogProps) {
	const queryClient = useQueryClient();
	const { currentRow } = useCategories();

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: UpdateCategoryInput) => {
			if (!currentRow) return;
			await api.products.categories({ id: currentRow.id }).put(data);
		},
		onSuccess: () => {
			toast.success("Danh mục đã được cập nhật thành công");
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			onOpenChange(false);
		},
		onError: () => {
			toast.error("Có lỗi xảy ra khi cập nhật danh mục");
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
		},
		validators: {
			onChange: updateCategorySchema,
		},
		onSubmit: async ({ value }) => {
			mutate(value);
		},
	});

	useEffect(() => {
		if (currentRow) {
			form.setFieldValue("name", currentRow.name);
			form.setFieldValue("description", currentRow.description ?? "");
		}
	}, [currentRow, form]);

	return (
		<Dialog
			open={open}
			onOpenChange={(state) => {
				form.reset();
				onOpenChange(state);
			}}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="text-start">
					<DialogTitle>Cập nhật danh mục</DialogTitle>
					<DialogDescription>Nhấp xác nhận khi hoàn thành.</DialogDescription>
				</DialogHeader>
				<form
					id="update-category-form"
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
										placeholder="Nhập tên danh mục"
									/>
								</FieldContent>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<form.Field
						name="description"
						children={(field) => (
							<Field data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel>Mô tả</FieldLabel>
								<FieldContent>
									<Textarea
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Mô tả danh mục"
									/>
								</FieldContent>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>
				</form>
				<DialogFooter>
					<Button
						type="submit"
						form="update-category-form"
						disabled={isPending}
					>
						{isPending ? "Đang cập nhật..." : "Xác nhận"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
