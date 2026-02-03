"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
	ArrowDownLeft,
	ArrowUpRight,
	Calendar,
	CreditCard,
	Receipt,
	User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TransactionsListProps {
	transactions: any[];
}

const transactionTypeLabels: Record<string, string> = {
	PURCHASE: "Nhập hàng",
	SALE: "Bán hàng",
	REFUND: "Hoàn trả",
	ADJUSTMENT: "Điều chỉnh",
	EXPENSE: "Chi phí",
	REVENUE: "Thu nhập khác",
};

const transactionTypeColors: Record<string, string> = {
	PURCHASE: "destructive",
	SALE: "success",
	REFUND: "warning",
	ADJUSTMENT: "secondary",
	EXPENSE: "destructive",
	REVENUE: "success",
};

const paymentMethodLabels: Record<string, string> = {
	CASH: "Tiền mặt",
	CARD: "Thẻ",
	TRANSFER: "Chuyển khoản",
	MOMO: "Momo",
	ZALOPAY: "ZaloPay",
};

export function TransactionsList({ transactions }: TransactionsListProps) {
	if (transactions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 border rounded-xl bg-muted/5 border-dashed">
				<Receipt className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
				<p className="text-muted-foreground font-medium">
					Không tìm thấy giao dịch nào
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{transactions.map((transaction) => (
				<Card
					key={transaction.id}
					className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white ring-1 ring-slate-200"
				>
					<CardContent className="p-0">
						<div className="flex flex-col sm:flex-row">
							{/* Left: Type & Amount */}
							<div
								className={`
                flex items-center justify-between sm:justify-center sm:flex-col sm:w-40 p-4 
                ${
									["SALE", "REVENUE"].includes(transaction.type)
										? "bg-green-50/50"
										: "bg-red-50/50"
								}
              `}
							>
								<div className="flex items-center gap-2 sm:flex-col sm:gap-1">
									<Badge
										variant={
											(transactionTypeColors[transaction.type] as any) ||
											"secondary"
										}
										className="font-normal"
									>
										{transactionTypeLabels[transaction.type] ||
											transaction.type}
									</Badge>
									{["SALE", "REVENUE"].includes(transaction.type) ? (
										<ArrowDownLeft className="h-4 w-4 text-green-600 sm:hidden" />
									) : (
										<ArrowUpRight className="h-4 w-4 text-red-600 sm:hidden" />
									)}
								</div>
								<p
									className={`text-lg font-bold ${
										["SALE", "REVENUE"].includes(transaction.type)
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									{["SALE", "REVENUE"].includes(transaction.type) ? "+" : "-"}
									{new Intl.NumberFormat("vi-VN").format(transaction.amount)} đ
								</p>
							</div>

							{/* Right: Details */}
							<div className="flex-1 p-4 flex flex-col justify-between gap-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<p className="font-medium text-slate-800 mb-1">
											{transaction.description || "Không có mô tả"}
										</p>
										<div className="flex items-center gap-3 text-xs text-muted-foreground">
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{format(
													new Date(transaction.createdAt),
													"HH:mm - dd/MM/yyyy",
													{ locale: vi },
												)}
											</span>
											<span className="flex items-center gap-1 border-l pl-3">
												<User className="h-3 w-3" />
												{transaction.user?.name || "Hệ thống"}
											</span>
										</div>
									</div>

									<div className="flex flex-col sm:items-end gap-1">
										<div className="flex items-center gap-2 text-sm text-slate-600">
											<CreditCard className="h-3.5 w-3.5" />
											{paymentMethodLabels[transaction.paymentMethod] ||
												transaction.paymentMethod}
										</div>
										{transaction.bookingId && (
											<Badge variant="outline" className="text-[10px] w-fit">
												Booking #{transaction.bookingId.slice(-4)}
											</Badge>
										)}
										{transaction.orderId && (
											<Badge variant="outline" className="text-[10px] w-fit">
												Order #{transaction.orderId.slice(-4)}
											</Badge>
										)}
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
