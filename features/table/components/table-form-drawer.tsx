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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Table, TableStatus, TableType } from "@/generated/prisma/browser";
import { api } from "@/lib/eden";

interface TableFormDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: Table | null;
}

export function TableFormDrawer({
	open,
	onOpenChange,
	initialData,
}: TableFormDrawerProps) {
	const isEdit = !!initialData;

	const queryClient = useQueryClient();

	const { mutate: createTable, isPending: isCreating } = useMutation({
		mutationFn: async (data: any) => {
			const res = await api.tables.post(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Thêm bàn thành công");
			onOpenChange(false);
			form.reset();
		},
	});

	const { mutate: updateTable, isPending: isUpdating } = useMutation({
		mutationFn: async ({ id, data }: { id: string; data: any }) => {
			const res = await api.tables({ id }).patch(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Cập nhật bàn thành công");
			onOpenChange(false);
		},
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
	}, [open, form]);

	const isLoading = isCreating || isUpdating;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="mx-auto flex h-auto max-h-[95vh] max-w-2xl flex-col overflow-hidden rounded-t-xl">
				<DrawerHeader>
					<DrawerTitle>{isEdit ? "Sửa bàn" : "Thêm bàn mới"}</DrawerTitle>
					<DrawerDescription>
						Nhập thông tin bàn billiards của bạn.
					</DrawerDescription>
				</DrawerHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex flex-col overflow-hidden"
				>
					<div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
						<div className="grid gap-6">
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
												onValueChange={(val) =>
													field.handleChange(val as TableType)
												}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Chọn loại bàn" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="POOL">Bida lỗ (POOL)</SelectItem>
													<SelectItem value="CAROM">
														Bida phăng (CAROM)
													</SelectItem>
													<SelectItem value="SNOOKER">
														Bida Snooker (SNOOKER)
													</SelectItem>
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
													<SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
													<SelectItem value="OCCUPIED">Đang chơi</SelectItem>
													<SelectItem value="RESERVED">Đã đặt</SelectItem>
													<SelectItem value="MAINTENANCE">
														Đang bảo trì
													</SelectItem>
												</SelectContent>
											</Select>
										</FieldContent>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								)}
							/>
						</div>
					</div>

					<DrawerFooter className="flex gap-2 sm:justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1 sm:flex-none"
						>
							Hủy
						</Button>
						<Button
							type="submit"
							disabled={isLoading}
							className="flex-[2] sm:flex-none"
						>
							{isLoading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
						</Button>
					</DrawerFooter>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
