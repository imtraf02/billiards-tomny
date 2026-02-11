"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
	type ImportProductInput,
	importProductSchema,
} from "@/shared/schemas/product";
import type { ProductDetails } from "../types";

interface ProductsImportDialogProps {
	currentRow: ProductDetails;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProductsImportDialog({
	currentRow,
	open,
	onOpenChange,
}: ProductsImportDialogProps) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: ImportProductInput) => {
			return await api.products.import.post(data);
		},
		onSuccess: ({ data }) => {
			if (data?.id) {
				queryClient.invalidateQueries({ queryKey: ["products"] });
				onOpenChange(false);
			}
		},
	});

	const form = useForm({
		defaultValues: {
			productId: currentRow.id,
			quantity: 0,
			costPerUnit: 0,
			note: "",
		},
		validators: {
			onChange: importProductSchema,
		},
		onSubmit: async ({ value }) => {
			mutate(value);
		},
	});

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
					<DialogTitle>Nhập hàng</DialogTitle>
					<DialogDescription>
						Nhập hàng vào kho, nhấp lưu thay đổi khi hoàn thành.
					</DialogDescription>
				</DialogHeader>
				<div className="w-[calc(100%+0.75rem)] overflow-y-auto py-1 ps-1 pe-3">
					<form
						id="product-import-form"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="grid grid-cols-2 gap-4 py-4"
					>
						<form.Field
							name="costPerUnit"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Giá nhập</FieldLabel>
									<FieldContent>
										<Input
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
											min="0"
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>
						<form.Field
							name="quantity"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Số lượng</FieldLabel>
									<FieldContent>
										<Input
											type="number"
											value={Math.abs(field.state.value)}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
											min="0"
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>
						<form.Field
							name="note"
							children={(field) => (
								<Field
									data-invalid={field.state.meta.errors.length > 0}
									className="col-span-2"
								>
									<FieldLabel>Ghi chú</FieldLabel>
									<FieldContent>
										<Textarea
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Mô tả chi tiết giao dịch"
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>
					</form>
				</div>
				<DialogFooter>
					<Button type="submit" form="product-import-form" disabled={isPending}>
						{isPending ? "Đang lưu..." : "Lưu thay đổi"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
