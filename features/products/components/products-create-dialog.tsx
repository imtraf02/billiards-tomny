"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/eden";
import {
	type CreateProductInput,
	createProductSchema,
} from "@/shared/schemas/product";

interface ProductsCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProductsCreateDialog({
	open,
	onOpenChange,
}: ProductsCreateDialogProps) {
	const queryClient = useQueryClient();
	const { data: categoriesData } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => await api.products.categories.get(),
		enabled: open,
	});

	const { mutate } = useMutation({
		mutationFn: async (data: CreateProductInput) =>
			await api.products.post({
				...data,
			}),
		onSuccess: ({ data }) => {
			if (data?.id) {
				toast.success("Sản phẩm đã được tạo thành công");
				queryClient.invalidateQueries({ queryKey: ["products"] });
			}
			form.reset();
			onOpenChange(false);
		},
	});

	const form = useForm({
		defaultValues: {
			categoryId: "",
			name: "",
			description: "",
			price: 0,
			minStock: 0,
			unit: "",
		},
		validators: {
			onChange: createProductSchema,
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
					<DialogTitle>Thêm sản phẩm mới</DialogTitle>
					<DialogDescription>Nhấp xác nhận khi hoàn thành.</DialogDescription>
				</DialogHeader>
				<div className="h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 ps-1 pe-3">
					<form
						id="create-product-form"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="grid grid-cols-2 gap-4 py-4"
					>
						<form.Field
							name="name"
							children={(field) => (
								<Field
									data-invalid={field.state.meta.errors.length > 0}
									className="col-span-2"
								>
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
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Chọn danh mục" />
											</SelectTrigger>
											<SelectContent>
												{categoriesData?.data?.map((category) => (
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

						<form.Field
							name="unit"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Đơn vị</FieldLabel>
									<FieldContent>
										<Input
											value={field.state.value}
											onBlur={field.handleBlur}
											placeholder="cái"
											onChange={(e) => field.handleChange(e.target.value)}
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

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
							name="minStock"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Tồn kho tối thiểu</FieldLabel>
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
							name="description"
							children={(field) => (
								<Field
									data-invalid={field.state.meta.errors.length > 0}
									className="col-span-2"
								>
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
					</form>
				</div>
				<DialogFooter>
					<Button type="submit" form="create-product-form">
						Xác nhận
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
