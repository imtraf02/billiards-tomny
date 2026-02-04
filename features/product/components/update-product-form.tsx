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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import type { Product } from "@/generated/prisma/client";
import {
	type UpdateProductInput,
	updateProductSchema,
} from "@/shared/schemas/product";

interface UpdateProductFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData: Product;
}

export function UpdateProductForm({
	open,
	onOpenChange,
	initialData,
}: UpdateProductFormProps) {
	const queryClient = useQueryClient();

	const { data: categories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.products.categories.get();
			if (res.status === 200) {
				return res.data;
			}
			return [];
		},
	});

	const { mutate: updateProduct, isPending: isLoading } = useMutation({
		mutationFn: async ({
			id,
			data,
		}: {
			id: string;
			data: UpdateProductInput;
		}) => {
			const res = await api.products({ id }).patch(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			onOpenChange(false);
		},
	});

	const form = useForm({
		defaultValues: {
			name: initialData.name,
			categoryId: initialData.categoryId,
			price: initialData.price,
			cost: initialData.cost ?? 0,
			currentStock: initialData.currentStock,
			minStock: initialData.minStock,
			unit: initialData.unit,
			description: initialData.description ?? "",
			imageUrl: initialData.imageUrl ?? "",
			isAvailable: initialData.isAvailable,
		},
		validators: {
			onChange: updateProductSchema,
		},
		onSubmit: async ({ value }) => {
			updateProduct({ id: initialData.id, data: value });
		},
	});

	useEffect(() => {
		if (open && initialData) {
			form.reset({
				name: initialData.name,
				categoryId: initialData.categoryId,
				price: initialData.price,
				cost: initialData.cost ?? 0,
				currentStock: initialData.currentStock,
				minStock: initialData.minStock,
				unit: initialData.unit,
				description: initialData.description ?? "",
				imageUrl: initialData.imageUrl ?? "",
				isAvailable: initialData.isAvailable,
			});
		}
	}, [initialData, open, form]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-160 max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Cập nhật sản phẩm</DialogTitle>
					<DialogDescription>Chỉnh sửa thông tin sản phẩm.</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="grid gap-4 py-4"
				>
					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="name"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Tên sản phẩm</FieldLabel>
									<FieldContent>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Nhập tên sản phẩm"
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

						<form.Field
							name="categoryId"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Danh mục</FieldLabel>
									<FieldContent>
										<Select
											value={field.state.value}
											onValueChange={(val) => field.handleChange(val)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Chọn danh mục" />
											</SelectTrigger>
											<SelectContent>
												{categories?.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="price"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Giá bán</FieldLabel>
									<FieldContent>
										<Input
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

						<form.Field
							name="cost"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Giá vốn</FieldLabel>
									<FieldContent>
										<Input
											type="number"
											value={field.state.value ?? 0}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<form.Field
							name="currentStock"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Tồn kho</FieldLabel>
									<FieldContent>
										<Input
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

						<form.Field
							name="minStock"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Tối thiểu</FieldLabel>
									<FieldContent>
										<Input
											type="number"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

						<form.Field
							name="unit"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Đơn vị</FieldLabel>
									<FieldContent>
										<Input
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>
					</div>

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
										placeholder="Mô tả sản phẩm"
									/>
								</FieldContent>
								<FieldError errors={field.state.meta.errors} />
							</Field>
						)}
					/>

					<form.Field
						name="imageUrl"
						children={(field) => (
							<Field data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel>Hình ảnh (URL)</FieldLabel>
								<FieldContent>
									<Input
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="https://..."
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
						>
							Hủy
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
