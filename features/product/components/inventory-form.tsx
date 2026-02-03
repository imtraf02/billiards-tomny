"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useState } from "react";
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
import type { Product } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { createInventoryLogSchema } from "@/shared/schemas/product";
import { useCreateInventoryLog } from "@/features/product/hooks/use-product";

interface InventoryFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product: Product;
}

export function InventoryForm({
	open,
	onOpenChange,
	product,
}: InventoryFormProps) {
	const [type, setType] = useState<"IN" | "OUT">("IN");

	const { mutate: createLog, isPending } = useCreateInventoryLog(() => {
		onOpenChange(false);
		form.reset();
	});

	const form = useForm({
		defaultValues: {
			productId: product.id,
			type: "IN",
			quantity: 1,
      costSnapshot: product.cost ?? 0,
			priceSnapshot: product.price,
			reason: "",
			note: "",
		},
		validators: {
			onChange: createInventoryLogSchema,
		},
		onSubmit: async ({ value }) => {
			createLog({
				...value,
				type,
			});
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Nhập / Xuất Kho</DialogTitle>
					<DialogDescription>
						{product.name} - Tồn kho: {product.currentStock} {product.unit}
					</DialogDescription>
				</DialogHeader>

				{/* Toggle IN/OUT */}
				<div className="flex gap-2">
					<Button
						type="button"
						variant={type === "IN" ? "default" : "outline"}
						className={cn(
							"flex-1",
							type === "IN" && "bg-green-600 hover:bg-green-700",
						)}
						onClick={() => setType("IN")}
					>
						<ArrowDownToLine className="mr-2 h-4 w-4" />
						Nhập kho
					</Button>
					<Button
						type="button"
						variant={type === "OUT" ? "default" : "outline"}
						className={cn(
							"flex-1",
							type === "OUT" && "bg-orange-600 hover:bg-orange-700",
						)}
						onClick={() => setType("OUT")}
					>
						<ArrowUpFromLine className="mr-2 h-4 w-4" />
						Xuất kho
					</Button>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="grid gap-4 py-2"
				>
					<div className="grid grid-cols-2 gap-4">
						<form.Field
							name="quantity"
							children={(field) => (
								<Field data-invalid={field.state.meta.errors.length > 0}>
									<FieldLabel>Số lượng</FieldLabel>
									<FieldContent>
										<Input
											type="number"
											min={1}
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

						{type === "IN" && (
							<form.Field
								name="costSnapshot"
								children={(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel>Giá nhập (Đơn giá)</FieldLabel>
										<FieldContent>
											<Input
												type="number"
												min={0}
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
						)}
						{type === "OUT" && (
							<form.Field
								name="priceSnapshot"
								children={(field) => (
									<Field data-invalid={field.state.meta.errors.length > 0}>
										<FieldLabel>Giá bán (Đơn giá)</FieldLabel>
										<FieldContent>
											<Input
												type="number"
												min={0}
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
						)}
					</div>

					<form.Field
						name="reason"
						children={(field) => (
							<Field>
								<FieldLabel>Lý do</FieldLabel>
								<FieldContent>
									<Select
										value={field.state.value}
										onValueChange={(val) => field.handleChange(val)}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Chọn lý do" />
										</SelectTrigger>
										<SelectContent>
											{type === "IN" ? (
												<>
													<SelectItem value="purchase">Nhập hàng</SelectItem>
													<SelectItem value="return">Hàng trả lại</SelectItem>
													<SelectItem value="adjustment">Điều chỉnh</SelectItem>
												</>
											) : (
												<>
													<SelectItem value="sale">Bán hàng</SelectItem>
													<SelectItem value="damaged">Hư hỏng</SelectItem>
													<SelectItem value="expired">Hết hạn</SelectItem>
													<SelectItem value="adjustment">Điều chỉnh</SelectItem>
												</>
											)}
										</SelectContent>
									</Select>
								</FieldContent>
							</Field>
						)}
					/>

					<form.Field
						name="note"
						children={(field) => (
							<Field>
								<FieldLabel>Ghi chú</FieldLabel>
								<FieldContent>
									<Textarea
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Ghi chú thêm..."
										rows={2}
									/>
								</FieldContent>
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
						<Button
							type="submit"
							disabled={isPending}
							className={cn(
								type === "IN"
									? "bg-green-600 hover:bg-green-700"
									: "bg-orange-600 hover:bg-orange-700",
							)}
						>
							{isPending
								? "Đang xử lý..."
								: type === "IN"
									? "Xác nhận nhập"
									: "Xác nhận xuất"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
