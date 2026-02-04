"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TransactionsList } from "@/features/transaction/components/transactions-list";
import { useGetTransactions } from "@/features/transaction/hooks/use-transaction";
import type { GetTransactionsQuery } from "@/shared/schemas/transaction";

export default function TransactionsPage() {
	const [type, setType] = useState<GetTransactionsQuery["type"] | "all">("all");
	const [paymentMethod, setPaymentMethod] = useState<
		GetTransactionsQuery["paymentMethod"] | "all"
	>("all");
	const [page, setPage] = useState(1);

	const query: Partial<GetTransactionsQuery> = {
		page,
		limit: 20,
	};

	if (type !== "all") {
		query.type = type;
	}

	if (paymentMethod !== "all") {
		query.paymentMethod = paymentMethod;
	}

	const { data, isLoading } = useGetTransactions(query);

	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Thu chi</h1>
						<p className="text-muted-foreground">
							Quản lý dòng tiền, lịch sử thu chi và thanh toán.
						</p>
					</div>
				</div>

				{/* Filters */}
				<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
					<Select
						value={type}
						onValueChange={(value) =>
							setType(value as GetTransactionsQuery["type"] | "all")
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Loại giao dịch" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả loại</SelectItem>
							<SelectItem value="SALE">Bán hàng (Thu)</SelectItem>
							<SelectItem value="PURCHASE">Nhập hàng (Chi)</SelectItem>
							<SelectItem value="EXPENSE">Chi phí khác</SelectItem>
							<SelectItem value="REVENUE">Thu nhập khác</SelectItem>
							<SelectItem value="REFUND">Hoàn tiền</SelectItem>
							<SelectItem value="ADJUSTMENT">Điều chỉnh</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={paymentMethod}
						onValueChange={(value) =>
							setPaymentMethod(
								value as GetTransactionsQuery["paymentMethod"] | "all",
							)
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Phương thức thanh toán" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả phương thức</SelectItem>
							<SelectItem value="CASH">Tiền mặt</SelectItem>
							<SelectItem value="CARD">Thẻ / Card</SelectItem>
							<SelectItem value="TRANSFER">Chuyển khoản</SelectItem>
							<SelectItem value="MOMO">Momo</SelectItem>
							<SelectItem value="ZALOPAY">ZaloPay</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* List */}
				<div className="space-y-4">
					{isLoading ? (
						<div className="space-y-3">
							{[...Array(5)].map((_, i) => (
								<div
									key={`transaction-skeleton-${i}`}
									className="h-24 w-full animate-pulse rounded-md bg-muted"
								/>
							))}
						</div>
					) : (
						<>
							<TransactionsList transactions={data?.data || []} />

							{data && data.meta.totalPages > 1 && (
								<div className="flex items-center justify-end space-x-2 py-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
									>
										Trước
									</Button>
									<div className="text-sm font-medium">
										Trang {data.meta.page} / {data.meta.totalPages}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											setPage((p) => Math.min(data.meta.totalPages, p + 1))
										}
										disabled={page === data.meta.totalPages}
									>
										Sau
									</Button>
								</div>
							)}
						</>
					)}
				</div>
			</Main>
		</>
	);
}
