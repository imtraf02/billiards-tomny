"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import type { Product } from "@/generated/prisma/client";
import { api } from "@/lib/eden";
import { cn } from "@/lib/utils";

interface InventoryLogsDrawerProps {
	product: Product;
	children?: React.ReactNode;
}

const reasonLabels: Record<string, string> = {
	purchase: "Nhập hàng",
	return: "Trả lại",
	adjustment: "Điều chỉnh",
	sale: "Bán hàng",
	damaged: "Hư hỏng",
	expired: "Hết hạn",
};

export function InventoryLogsDrawer({
	product,
	children,
}: InventoryLogsDrawerProps) {
	const { data: logs, isLoading } = useQuery({
		queryKey: ["inventory", "product", product.id],
		queryFn: async () => {
			const res = await api.products({ id: product.id }).inventory.get();
			if (res.status === 200) {
				return res.data;
			}
			return [];
		},
		enabled: !!product.id,
	});

	return (
		<Drawer>
			<DrawerTrigger asChild>
				{children || (
					<Button variant="ghost" size="icon" title="Xem lịch sử kho">
						<History className="h-4 w-4" />
					</Button>
				)}
			</DrawerTrigger>
			<DrawerContent className="h-[auto] max-h-[95vh] sm:max-w-lg mx-auto rounded-t-xl overflow-hidden flex flex-col">
				<DrawerHeader>
					<DrawerTitle>Lịch sử kho</DrawerTitle>
					<DrawerDescription>
						{product.name} - Tồn kho hiện tại: {product.currentStock}{" "}
						{product.unit}
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex items-center justify-center py-8 text-muted-foreground">
							Đang tải...
						</div>
					) : logs && logs.length > 0 ? (
						<div className="space-y-3">
							{logs.map((log: any) => (
								<div
									key={log.id}
									className="flex items-start gap-3 rounded-lg border p-3"
								>
									<div
										className={cn(
											"mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
											log.type === "IN"
												? "bg-green-100 text-green-600"
												: "bg-orange-100 text-orange-600",
										)}
									>
										{log.type === "IN" ? (
											<ArrowDownToLine className="h-4 w-4" />
										) : (
											<ArrowUpFromLine className="h-4 w-4" />
										)}
									</div>
									<div className="flex-1 space-y-1">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span className="font-medium">
													{log.type === "IN" ? "+" : "-"}
													{log.quantity} {product.unit}
												</span>
												{log.reason && (
													<Badge variant="secondary" className="text-xs">
														{reasonLabels[log.reason] || log.reason}
													</Badge>
												)}
											</div>
											<span className="text-xs text-muted-foreground">
												{new Date(log.createdAt).toLocaleDateString("vi-VN", {
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
										<div className="text-sm text-muted-foreground">
											{log.stockBefore} → {log.stockAfter} {product.unit}
											{log.costSnapshot && log.type === "IN" && (
												<span className="ml-2">
													(
													{new Intl.NumberFormat("vi-VN", {
														style: "currency",
														currency: "VND",
													}).format(log.costSnapshot)}
													/{product.unit})
												</span>
											)}
										</div>
										{log.note && (
											<p className="text-sm text-muted-foreground">
												{log.note}
											</p>
										)}
										{log.user && (
											<p className="text-xs text-muted-foreground">
												Bởi: {log.user.name}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex items-center justify-center py-8 text-muted-foreground">
							Chưa có lịch sử nhập/xuất kho
						</div>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
