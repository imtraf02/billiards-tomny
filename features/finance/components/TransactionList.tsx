import { format } from "date-fns";
import { Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
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
import type { TransactionDetail } from "@/shared/schemas/finance";

interface TransactionListProps {
	transactions: TransactionDetail[];
}

export function TransactionList({ transactions }: TransactionListProps) {
	const [search, setSearch] = useState("");
	const [filterType, setFilterType] = useState<string>("ALL");

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const filteredTransactions = useMemo(() => {
		return transactions
			.filter((t) => {
				const matchSearch =
					t.description?.toLowerCase().includes(search.toLowerCase()) ||
					t.category.toLowerCase().includes(search.toLowerCase()) ||
					t.user.name.toLowerCase().includes(search.toLowerCase());

				const matchFilter =
					filterType === "ALL" ||
					(filterType === "REVENUE" && t.type === "REVENUE") ||
					(filterType === "EXPENSE" &&
						(t.type === "EXPENSE" || t.type === "PURCHASE"));

				return matchSearch && matchFilter;
			})
			.slice(0, 50); // Limit to 50 transactions
	}, [transactions, search, filterType]);

	return (
		<div className="rounded-xl border bg-card">
			<div className="p-6 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h3 className="text-lg font-semibold">Danh sách giao dịch</h3>
				<div className="flex items-center gap-4">
					<div className="relative w-full max-w-sm">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Tìm giao dịch..."
							className="pl-9 h-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<Select value={filterType} onValueChange={setFilterType}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Lọc loại" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả</SelectItem>
							<SelectItem value="REVENUE">Thu</SelectItem>
							<SelectItem value="EXPENSE">Chi</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Ngày</TableHead>
							<TableHead>Loại</TableHead>
							<TableHead>Mô tả</TableHead>
							<TableHead>Người thực hiện</TableHead>
							<TableHead className="text-right">Số tiền</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTransactions.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="h-24 text-center text-muted-foreground"
								>
									{search || filterType !== "ALL"
										? "Không tìm thấy giao dịch nào"
										: "Chưa có giao dịch trong khoảng thời gian này"}
								</TableCell>
							</TableRow>
						) : (
							filteredTransactions.map((t) => (
								<TableRow key={t.id}>
									<TableCell className="font-medium">
										{format(new Date(t.createdAt), "dd/MM/yyyy HH:mm")}
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
												t.type === "REVENUE"
													? "bg-green-100 text-green-700"
													: "bg-red-100 text-red-700"
											}`}
										>
											{t.category}
										</span>
									</TableCell>
									<TableCell className="max-w-xs truncate">
										{t.description || "-"}
									</TableCell>
									<TableCell>{t.user.name}</TableCell>
									<TableCell className="text-right font-semibold">
										<span
											className={
												t.type === "REVENUE" ? "text-green-600" : "text-red-600"
											}
										>
											{t.type === "REVENUE" ? "+" : "-"}
											{formatCurrency(t.amount)}
										</span>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			{filteredTransactions.length > 0 && (
				<div className="p-4 border-t text-sm text-muted-foreground text-center">
					Hiển thị {filteredTransactions.length} / {transactions.length} giao
					dịch
				</div>
			)}
		</div>
	);
}
