"use client";

import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useGetDailyTransactions } from "../hooks/use-finance";

export function DailyTransactions() {
	const [page, setPage] = useState(1);
	const [typeFilter, setTypeFilter] = useState<string>("ALL");
	const [searchTerm, setSearchTerm] = useState("");

	const { data: transactionsData, isLoading } = useGetDailyTransactions({
		page,
		type: typeFilter !== "ALL" ? typeFilter : undefined,
		search: searchTerm || undefined,
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<CardTitle>Giao dịch thu chi hàng ngày</CardTitle>
					<div className="flex items-center gap-2">
						<Button size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Thêm giao dịch
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{/* Filters */}
				<div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Tìm kiếm giao dịch..."
							className="pl-9"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Loại giao dịch" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả loại</SelectItem>
							<SelectItem value="REVENUE">Thu nhập</SelectItem>
							<SelectItem value="EXPENSE">Chi phí</SelectItem>
							<SelectItem value="REFUND">Hoàn tiền</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Transactions Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Ngày giờ</TableHead>
								<TableHead>Mô tả</TableHead>
								<TableHead>Loại</TableHead>
								<TableHead>Phương thức</TableHead>
								<TableHead className="text-right">Số tiền</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								[...Array(5)].map((_, i) => (
									<TableRow key={i}>
										<TableCell>
											<div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
										</TableCell>
										<TableCell>
											<div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
										</TableCell>
										<TableCell>
											<div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
										</TableCell>
										<TableCell>
											<div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
										</TableCell>
										<TableCell>
											<div className="h-4 bg-gray-200 rounded animate-pulse w-24 ml-auto"></div>
										</TableCell>
									</TableRow>
								))
							) : transactionsData?.data?.length ? (
								transactionsData.data.map((transaction: any) => (
									<TableRow key={transaction.id}>
										<TableCell className="font-medium">
											{formatDate(transaction.createdAt)}
										</TableCell>
										<TableCell>{transaction.description}</TableCell>
										<TableCell>
											<Badge
												variant={
													transaction.type === "REVENUE"
														? "default"
														: transaction.type === "EXPENSE"
															? "destructive"
															: "secondary"
												}
											>
												{transaction.type === "REVENUE"
													? "Thu"
													: transaction.type === "EXPENSE"
														? "Chi"
														: "Khác"}
											</Badge>
										</TableCell>
										<TableCell>
											<span className="capitalize">
												{transaction.paymentMethod?.toLowerCase() || "Tiền mặt"}
											</span>
										</TableCell>
										<TableCell
											className={`text-right font-medium ${transaction.type === "REVENUE" ? "text-green-600" : "text-red-600"}`}
										>
											{transaction.type === "REVENUE" ? "+" : "-"}
											{formatCurrency(transaction.amount)}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center py-8 text-muted-foreground"
									>
										Không có giao dịch nào
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{transactionsData?.meta && transactionsData.meta.totalPages > 1 && (
					<div className="flex items-center justify-end space-x-2 pt-4">
						<div className="text-sm text-muted-foreground">
							Trang {page} / {transactionsData.meta.totalPages}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							Trước
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								setPage((p) =>
									Math.min(transactionsData.meta.totalPages, p + 1),
								)
							}
							disabled={page === transactionsData.meta.totalPages}
						>
							Tiếp
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
