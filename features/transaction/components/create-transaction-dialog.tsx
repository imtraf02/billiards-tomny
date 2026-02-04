"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/eden";
import type { CreateTransactionInput } from "@/shared/schemas/transaction";

export function CreateTransactionDialog() {
	const [open, setOpen] = useState(false);
	const [formData, setFormData] = useState<CreateTransactionInput>({
		type: "EXPENSE",
		amount: 0,
		paymentMethod: "CASH",
		description: "",
	});

	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: async (data: CreateTransactionInput) => {
			const res = await api.transactions.post(data);
			if (res.status === 200) {
				return res.data;
			}
			throw new Error("Không thể tạo giao dịch");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			queryClient.invalidateQueries({ queryKey: ["finance-analytics"] });
			toast.success("Đã tạo giao dịch thành công");
			setFormData({
				type: "EXPENSE",
				amount: 0,
				paymentMethod: "CASH",
				description: "",
			});
			setOpen(false);
		},
		onError: (error) => {
			toast.error(error.message || "Có lỗi xảy ra");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.amount <= 0) {
			toast.error("Số tiền phải lớn hơn 0");
			return;
		}
		createMutation.mutate(formData);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Thêm giao dịch
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Thêm giao dịch mới</DialogTitle>
					<DialogDescription>
						Nhập thông tin chi phí (lương, điện, nước) hoặc mua hàng nhập kho
						(sữa, cà phê).
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="type">Loại giao dịch</Label>
						<Select
							value={formData.type}
							onValueChange={(value) =>
								setFormData({ ...formData, type: value })
							}
						>
							<SelectTrigger id="type" className="w-full">
								<SelectValue placeholder="Chọn loại giao dịch" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="EXPENSE">
									💸 Chi phí (Lương, điện, nước...)
								</SelectItem>
								<SelectItem value="PURCHASE">
									📦 Nhập hàng kho (Sữa, cà phê...)
								</SelectItem>
								<SelectItem value="REVENUE">💰 Thu nhập khác</SelectItem>
							</SelectContent>
						</Select>
						<p className="text-sm text-muted-foreground">
							{formData.type === "EXPENSE" &&
								"Dùng cho lương nhân viên, tiền điện, nước, v.v."}
							{formData.type === "PURCHASE" &&
								"Dùng cho nhập hàng như sữa, cà phê, đồ uống"}
							{formData.type === "REVENUE" && "Thu nhập không liên quan bàn"}
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="amount">Số tiền (VND)</Label>
						<Input
							id="amount"
							type="number"
							placeholder="100000"
							value={formData.amount || ""}
							onChange={(e) =>
								setFormData({
									...formData,
									amount: Number.parseInt(e.target.value, 10) || 0,
								})
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
						<Select
							value={formData.paymentMethod}
							onValueChange={(value) =>
								setFormData({ ...formData, paymentMethod: value })
							}
						>
							<SelectTrigger id="paymentMethod" className="w-full">
								<SelectValue placeholder="Chọn phương thức" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="CASH">Tiền mặt</SelectItem>
								<SelectItem value="CARD">Thẻ / Card</SelectItem>
								<SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
								<SelectItem value="MOMO">Momo</SelectItem>
								<SelectItem value="ZALOPAY">ZaloPay</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Mô tả</Label>
						<Textarea
							id="description"
							placeholder="VD: Lương tháng 2, Tiền điện tháng 1, Nhập sữa..."
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={3}
						/>
						<p className="text-sm text-muted-foreground">
							💡 Mô tả chi tiết giúp phân loại tự động (nhận diện từ khóa:{" "}
							<strong>lương</strong>, <strong>điện</strong>,{" "}
							<strong>nước</strong>)
						</p>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Hủy
						</Button>
						<Button type="submit" disabled={createMutation.isPending}>
							{createMutation.isPending ? "Đang tạo..." : "Tạo giao dịch"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
