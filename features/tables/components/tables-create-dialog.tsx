"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { TableStatus, TableType } from "@/generated/prisma/enums";
import { api } from "@/lib/eden";
import {
	type CreateTableInput,
	createTableSchema,
} from "@/shared/schemas/table";
import { TABLE_STATUS, TABLE_TYPES } from "../data";

interface TablesCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TablesCreateDialog({
	open,
	onOpenChange,
}: TablesCreateDialogProps) {
	const queryClient = useQueryClient();

	const { mutate } = useMutation({
		mutationFn: async (data: CreateTableInput) =>
			await api.tables.post({
				...data,
			}),
		onSuccess: ({ data }) => {
			if (data?.id) {
				toast.success("Bàn đã được tạo thành công");
				queryClient.invalidateQueries({ queryKey: ["tables"] });
			}
			form.reset();
			onOpenChange(false);
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			type: TableType.POOL as TableType,
			hourlyRate: 0,
			status: TableStatus.AVAILABLE as TableStatus,
		},
		validators: {
			onChange: createTableSchema,
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
					<DialogTitle>Thêm bàn mới</DialogTitle>
					<DialogDescription>Nhấp xác nhận khi hoàn thành.</DialogDescription>
				</DialogHeader>
				<div className="py-1">
					<form
						id="create-table-form"
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
									<FieldLabel>Tên bàn</FieldLabel>
									<FieldContent>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Nhập tên bàn"
										/>
									</FieldContent>
									<FieldError errors={field.state.meta.errors} />
								</Field>
							)}
						/>

						<form.Field
							name="type"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Loại bàn</FieldLabel>
									<FieldContent>
										<Select
											value={field.state.value}
											onValueChange={(val) =>
												field.handleChange(val as TableType)
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Chọn loại bàn" />
											</SelectTrigger>
											<SelectContent>
												{Object.entries(TABLE_TYPES).map(([key, label]) => (
													<SelectItem key={key} value={key}>
														{label}
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
							name="status"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Trạng thái</FieldLabel>
									<FieldContent>
										<Select
											value={field.state.value}
											onValueChange={(val) =>
												field.handleChange(val as TableStatus)
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Chọn trạng thái" />
											</SelectTrigger>
											<SelectContent>
												{Object.entries(TABLE_STATUS).map(([key, label]) => (
													<SelectItem key={key} value={key}>
														{label}
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
							name="hourlyRate"
							children={(field) => (
								<Field
									data-invalid={field.state.meta.errors.length > 0}
									className="col-span-2"
								>
									<FieldLabel>Giá theo giờ (VNĐ)</FieldLabel>
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
					</form>
				</div>
				<DialogFooter>
					<Button type="submit" form="create-table-form">
						Xác nhận
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
