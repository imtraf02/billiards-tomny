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
import type { ProductAnalysis } from "@/shared/schemas/finance";

interface ProductAnalysisTableProps {
	products: ProductAnalysis[];
}

type SortBy = "revenue" | "profit" | "soldQuantity" | "importedQuantity";

export function ProductAnalysisTable({ products }: ProductAnalysisTableProps) {
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<SortBy>("revenue");

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const filteredProducts = useMemo(() => {
		return products
			.filter((p) => p.productName.toLowerCase().includes(search.toLowerCase()))
			.sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number));
	}, [products, search, sortBy]);

	return (
		<div className="rounded-xl border bg-card">
			<div className="p-6 border-b flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h3 className="text-lg font-semibold">Phân tích sản phẩm</h3>
				<div className="flex items-center gap-4">
					<div className="relative w-full max-w-sm">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Tìm sản phẩm..."
							className="pl-9 h-9"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<Select
						value={sortBy}
						onValueChange={(val) => setSortBy(val as SortBy)}
					>
						<SelectTrigger className=" w-48">
							<SelectValue placeholder="Sắp xếp theo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="revenue">Doanh thu</SelectItem>
							<SelectItem value="profit">Lợi nhuận</SelectItem>
							<SelectItem value="soldQuantity">Số lượng bán</SelectItem>
							<SelectItem value="importedQuantity">Số lượng nhập</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-52">Sản phẩm</TableHead>
							<TableHead className="text-right">Đã nhập</TableHead>
							<TableHead className="text-right">Số lượng bán</TableHead>
							<TableHead className="text-right">Doanh thu</TableHead>
							<TableHead className="text-right">Giá vốn</TableHead>
							<TableHead className="text-right">Lợi nhuận</TableHead>
							<TableHead className="text-right">Tồn kho</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredProducts.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-24 text-center text-muted-foreground"
								>
									{search
										? "Không tìm thấy sản phẩm nào"
										: "Chưa có dữ liệu giao dịch trong khoảng thời gian này"}
								</TableCell>
							</TableRow>
						) : (
							filteredProducts.map((p) => (
								<TableRow key={p.productId}>
									<TableCell>
										<div className="font-medium">{p.productName}</div>
										<div className="text-xs text-muted-foreground">
											Đơn vị: {p.unit}
										</div>
									</TableCell>
									<TableCell className="text-right font-medium text-orange-600">
										{Math.abs(p.importedQuantity)}
									</TableCell>
									<TableCell className="text-right font-medium text-purple-600">
										{Math.abs(p.soldQuantity)}
									</TableCell>
									<TableCell className="text-right text-blue-600 font-medium">
										{formatCurrency(p.revenue)}
									</TableCell>
									<TableCell className="text-right text-muted-foreground">
										{formatCurrency(p.cost)}
									</TableCell>
									<TableCell
										className={`text-right font-bold ${p.profit >= 0 ? "text-green-600" : "text-red-600"}`}
									>
										{p.profit > 0 ? "+" : ""}
										{formatCurrency(p.profit)}
									</TableCell>
									<TableCell className="text-right">
										<span
											className={`px-2 py-1 rounded-full text-xs font-semibold ${
												p.currentStock <= 5
													? "bg-red-100 text-red-700"
													: p.currentStock <= 20
														? "bg-orange-100 text-orange-700"
														: "bg-green-100 text-green-700"
											}`}
										>
											{p.currentStock} {p.unit}
										</span>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
