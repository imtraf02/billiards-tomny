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
import type { Table } from "@/generated/prisma/client";
import { useCreateTable, useUpdateTable } from "../hooks/use-table";

interface TableFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: Table | null;
}

export function TableFormDialog({
	open,
	onOpenChange,
	initialData,
}: TableFormDialogProps) {
	const isEdit = !!initialData;

	const { mutate: createTable, isPending: isCreating } = useCreateTable(() => {
		onOpenChange(false);
		form.reset();
	});

	const { mutate: updateTable, isPending: isUpdating } = useUpdateTable(() => {
		onOpenChange(false);
	});

	const form = useForm({
		defaultValues: {
			name: initialData?.name ?? "",
			type: (initialData?.type ?? "POOL") as "POOL" | "CAROM" | "SNOOKER",
			hourlyRate: initialData?.hourlyRate ?? 50000,
			status: (initialData?.status ?? "AVAILABLE") as
				| "AVAILABLE"
				| "OCCUPIED"
				| "MAINTENANCE"
				| "RESERVED",
		},
		onSubmit: async ({ value }) => {
			if (isEdit && initialData) {
				updateTable({ id: initialData.id, data: value });
			} else {
				createTable(value);
			}
		},
	});

	// Rest form when initialData changes or dialog closes
	useEffect(() => {
		if (open) {
			form.reset();
		}
	}, [open, initialData, form]);

	const isLoading = isCreating || isUpdating;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Sửa bàn" : "Thêm bàn mới"}</DialogTitle>
					<DialogDescription>
						Nhập thông tin bàn billiards của bạn.
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
								<FieldLabel>Tên bàn</FieldLabel>
								<FieldContent>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ví dụ: Bàn 01"
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
										onValueChange={(val) => field.handleChange(val as any)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn loại bàn" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="POOL">Pool (Lỗ)</SelectItem>
											<SelectItem value="CAROM">Carom (3 Băng)</SelectItem>
											<SelectItem value="SNOOKER">Snooker</SelectItem>
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
							<Field data-invalid={field.state.meta.errors.length > 0}>
								<FieldLabel>Giá theo giờ (VND)</FieldLabel>
								<FieldContent>
									<Input
										type="number"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(Number(e.target.value))}
									/>
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
										onValueChange={(val) => field.handleChange(val as any)}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn trạng thái" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
											<SelectItem value="OCCUPIED">Đang chơi</SelectItem>
											<SelectItem value="RESERVED">Đã đặt</SelectItem>
											<SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
										</SelectContent>
									</Select>
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
							{isLoading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
