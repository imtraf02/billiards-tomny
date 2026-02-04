// inventory-card.tsx
"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
	ArrowDownLeft,
	ArrowRight,
	ArrowUpRight,
	Calendar,
	CreditCard,
	DollarSign,
	Package,
	TrendingUp,
	User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
	log: any;
}

export function InventoryCard({ log }: InventoryCardProps) {
	const isImport = log.type === "IN";
	const profit = isImport
		? 0
		: (log.priceSnapshot || 0) * log.quantity -
			(log.costSnapshot || 0) * log.quantity;
	const revenue = isImport
		? (log.costSnapshot || 0) * log.quantity
		: (log.priceSnapshot || 0) * log.quantity;

	return (
		<Card
			className={cn(
				"group relative overflow-hidden transition-all duration-200",
				"hover:shadow-md",
				"border-border bg-card",
			)}
		>
			<CardContent className="pt-6 pb-4">
				{/* Header */}
				<div className="mb-4 flex items-start justify-between">
					<div className="flex items-start gap-3">
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-lg",
								"transition-colors duration-200",
								isImport
									? "bg-green-50 text-green-600 border border-green-100"
									: "bg-red-50 text-red-600 border border-red-100",
							)}
						>
							{isImport ? (
								<ArrowDownLeft className="h-5 w-5" />
							) : (
								<ArrowUpRight className="h-5 w-5" />
							)}
						</div>
						<div className="flex-1">
							<h3 className="font-bold text-card-foreground line-clamp-1">
								{log.product?.name}
							</h3>
							<p className="text-xs text-muted-foreground flex items-center gap-1.5">
								<Package className="h-3 w-3" />
								{log.product?.unit || "đơn vị"} • {log.quantity} chiếc
							</p>
						</div>
					</div>
					<Badge
						variant={isImport ? "outline" : "outline"}
						className={cn(
							"font-mono text-xs px-2 py-1",
							isImport
								? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
								: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
						)}
					>
						{isImport ? "+" : "-"}
						{log.quantity}
					</Badge>
				</div>

				{/* Stock Progress */}
				<div className="mb-4">
					<div className="flex items-center justify-between px-2 py-2 rounded-md bg-muted/30">
						<div className="text-center flex-1">
							<p className="text-xs font-medium text-muted-foreground mb-1">
								Trước
							</p>
							<p className="text-base font-semibold text-card-foreground">
								{log.stockBefore}
							</p>
						</div>
						<ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
						<div className="text-center flex-1">
							<p className="text-xs font-medium text-muted-foreground mb-1">
								Sau
							</p>
							<p
								className={cn(
									"text-base font-semibold",
									isImport ? "text-green-600" : "text-red-600",
								)}
							>
								{log.stockAfter}
							</p>
						</div>
					</div>
				</div>

				{/* Financial Stats */}
				<div className="mb-4 grid grid-cols-2 gap-3">
					{isImport ? (
						<>
							<div className="rounded-md border border-border bg-card p-2">
								<div className="flex items-center gap-1 mb-1">
									<CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs font-medium text-muted-foreground">
										Giá vốn
									</p>
								</div>
								<p className="text-sm font-semibold text-card-foreground">
									{log.costSnapshot
										? `${new Intl.NumberFormat("vi-VN").format(log.costSnapshot)} đ`
										: "-"}
								</p>
							</div>
							<div className="rounded-md border border-border bg-card p-2">
								<div className="flex items-center gap-1 mb-1">
									<DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs font-medium text-muted-foreground">
										Tổng giá trị
									</p>
								</div>
								<p className="text-sm font-semibold text-primary">
									{log.costSnapshot
										? `${new Intl.NumberFormat("vi-VN").format(revenue)} đ`
										: "-"}
								</p>
							</div>
						</>
					) : (
						<>
							<div className="rounded-md border border-border bg-card p-2">
								<div className="flex items-center gap-1 mb-1">
									<DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs font-medium text-muted-foreground">
										Doanh thu
									</p>
								</div>
								<p className="text-sm font-semibold text-primary">
									{new Intl.NumberFormat("vi-VN").format(revenue)} đ
								</p>
							</div>
							<div className="rounded-md border border-border bg-card p-2">
								<div className="flex items-center gap-1 mb-1">
									<TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs font-medium text-muted-foreground">
										Lãi gộp
									</p>
								</div>
								<p
									className={cn(
										"text-sm font-semibold",
										profit > 0 ? "text-green-600" : "text-red-600",
									)}
								>
									{new Intl.NumberFormat("vi-VN").format(profit)} đ
								</p>
							</div>
						</>
					)}
				</div>

				{/* Reason & Note */}
				<div className="space-y-2">
					<div className="rounded-md bg-muted/30 p-2">
						<p className="text-xs font-medium text-muted-foreground mb-1">
							Lý do
						</p>
						<Badge
							variant="secondary"
							className="bg-background text-card-foreground"
						>
							{log.reason === "initial"
								? "Khởi tạo"
								: log.reason === "adjustment"
									? "Điều chỉnh"
									: log.reason === "order"
										? "Đơn hàng"
										: log.reason}
						</Badge>
					</div>

					{log.note && (
						<div className="rounded-md bg-muted/30 p-2">
							<p className="text-xs font-medium text-muted-foreground mb-1">
								Ghi chú
							</p>
							<p className="text-xs text-card-foreground/80">"{log.note}"</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="mt-4 pt-3 border-t border-border/50">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
								<User className="h-3 w-3 text-muted-foreground" />
							</div>
							<div>
								<p className="text-xs font-medium text-muted-foreground">
									Người thực hiện
								</p>
								<p className="text-xs font-medium text-card-foreground">
									{log.user?.name || "Hệ thống"}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-xs font-medium text-muted-foreground">
								Thời gian
							</p>
							<p className="text-xs font-medium text-card-foreground flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{format(new Date(log.createdAt), "HH:mm • dd/MM/yy", {
									locale: vi,
								})}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
