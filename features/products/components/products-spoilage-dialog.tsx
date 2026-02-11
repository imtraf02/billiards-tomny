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
	type SpoilageInput,
	spoilageSchema,
} from "@/shared/schemas/product";
import type { ProductDetails } from "../types";

interface ProductsSpoilageDialogProps {
	currentRow: ProductDetails;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProductsSpoilageDialog({
	currentRow,
	open,
	onOpenChange,
}: ProductsSpoilageDialogProps) {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: SpoilageInput) => {
			return await api.products.spoilage.post(data);
		},
		onSuccess: ({ data }) => {
			if (data) {
				queryClient.invalidateQueries({ queryKey: ["products"] });
				onOpenChange(false);
			}
		},
	});

	const form = useForm({
		defaultValues: {
			productId: currentRow.id,
			quantity: 0,
			reason: "",
		},
		validators: {
			onChange: spoilageSchema,
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
					<DialogTitle>Chỉnh sửa hàng hóa</DialogTitle>
					<DialogDescription>
						Chỉnh sửa hàng hóa hư hại, hết hạn. <br /> Nhấp lưu thay đổi khi
						hoàn thành.
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
						className="grid gap-4 py-4"
					>
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
							name="reason"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Lý do</FieldLabel>
									<FieldContent>
										<Textarea
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Nhập lý do"
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
