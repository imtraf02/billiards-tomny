"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
	ArrowDownLeft,
	ArrowRight,
	ArrowUpRight,
	Calendar,
	History,
	Package,
	Tag,
	User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface InventoryLogsListProps {
	logs: any[];
}

export function InventoryLogsList({ logs }: InventoryLogsListProps) {
	if (logs.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 border rounded-xl bg-muted/5 border-dashed">
				<History className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
				<p className="text-muted-foreground font-medium">
					Không tìm thấy lịch sử kho
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{logs.map((log) => (
				<Card
					key={log.id}
					className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white ring-1 ring-slate-200"
				>
					<CardContent className="p-0">
						{/* Header Section */}
						<div
							className={`p-4 flex items-center justify-between ${log.type === "IN" ? "bg-green-50/50" : "bg-red-50/50"}`}
						>
							<div className="flex items-center gap-3">
								<div
									className={`p-2 rounded-lg ${log.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
								>
									{log.type === "IN" ? (
										<ArrowDownLeft className="h-5 w-5" />
									) : (
										<ArrowUpRight className="h-5 w-5" />
									)}
								</div>
								<div>
									<h3 className="font-bold text-slate-800 line-clamp-1">
										{log.product?.name}
									</h3>
									<p className="text-xs text-slate-500 flex items-center gap-1">
										<Package className="h-3 w-3" />
										{log.product?.unit || "đơn vị"}
									</p>
								</div>
							</div>
							<Badge
								variant={log.type === "IN" ? "success" : "destructive"}
								className="font-mono text-sm px-3 py-1"
							>
								{log.type === "IN" ? "+" : "-"}
								{log.quantity}
							</Badge>
						</div>

						{/* Details Section */}
						<div className="p-4 space-y-4">
							{/* Stock Transition */}
							<div className="flex items-center justify-between text-sm p-3 rounded-lg bg-slate-50 ring-1 ring-slate-100">
								<div className="text-center flex-1">
									<p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
										Trước
									</p>
									<p className="text-slate-600 font-semibold">
										{log.stockBefore}
									</p>
								</div>
								<ArrowRight className="h-4 w-4 text-slate-300" />
								<div className="text-center flex-1">
									<p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
										Sau
									</p>
									<p
										className={`font-bold ${log.type === "IN" ? "text-green-600" : "text-red-600"}`}
									>
										{log.stockAfter}
									</p>
								</div>
							</div>

							{/* Info Grid */}
							<div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
								<div>
									<p className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-0.5">
										<Tag className="h-3 w-3" />
										Lý do
									</p>
									<p className="font-semibold text-slate-700 truncate">
										{log.reason === "initial"
											? "Khởi tạo"
											: log.reason === "adjustment"
												? "Điều chỉnh"
												: log.reason === "order"
													? "Đơn hàng"
													: log.reason}
									</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 justify-end mb-0.5">
										Giá bán
									</p>
									<p className="font-bold text-slate-700">
										{log.product?.price
											? `${new Intl.NumberFormat("vi-VN").format(log.product.price)} đ`
											: "-"}
									</p>
								</div>
								<div>
									<p className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1 mb-0.5">
										Giá nhập
									</p>
									<p className="font-semibold text-slate-700">
										{log.unitCost
											? `${new Intl.NumberFormat("vi-VN").format(log.unitCost)} đ`
											: "-"}
									</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] uppercase text-primary/60 font-bold flex items-center gap-1 justify-end mb-0.5">
										Tổng giá
									</p>
									<p className="font-extrabold text-primary text-base">
										{log.unitCost
											? `${new Intl.NumberFormat("vi-VN").format(log.unitCost * log.quantity)} đ`
											: "-"}
									</p>
								</div>
							</div>

							{log.note && (
								<div className="p-2.5 rounded-md bg-amber-50 text-xs text-amber-700 italic border border-amber-100">
									"{log.note}"
								</div>
							)}

							<div className="pt-3 border-t flex items-center justify-between text-[11px] text-slate-400 font-medium">
								<span className="flex items-center gap-1">
									<User className="h-3 w-3" />
									{log.user?.name || "Hệ thống"}
								</span>
								<span className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{format(new Date(log.createdAt), "HH:mm - dd/MM/yyyy", {
										locale: vi,
									})}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
