"use client";

import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconDotsVertical,
	IconLayoutColumns,
	IconSearch,
	IconSelector,
	IconSortAscending,
	IconSortDescending,
	IconX,
} from "@tabler/icons-react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { Package } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CATEGORY_ICON_MAP } from "@/features/products/data";
import { formatVND } from "@/lib/format";
import type { ProductStats } from "../types";

interface StatisticsTableProps {
	stats: ProductStats[];
	isLoading: boolean;
}

const columns: ColumnDef<ProductStats>[] = [
	{
		accessorKey: "productName",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-ml-4 h-8"
				>
					Sản phẩm
					{column.getIsSorted() === "asc" ? (
						<IconSortAscending className="ml-2 h-4 w-4" />
					) : column.getIsSorted() === "desc" ? (
						<IconSortDescending className="ml-2 h-4 w-4" />
					) : (
						<IconSelector className="ml-2 h-4 w-4" />
					)}
				</Button>
			);
		},
		cell: ({ row }) => {
			const Icon =
				row.original.categoryName in CATEGORY_ICON_MAP
					? CATEGORY_ICON_MAP[
							row.original.categoryName as keyof typeof CATEGORY_ICON_MAP
						]
					: Package;

			return (
				<div className="flex items-center gap-3">
					<div className="flex size-8 items-center justify-center rounded-md bg-muted p-1.5">
						<Icon className="size-4 text-muted-foreground" />
					</div>
					<div>
						<p className="font-medium">{row.original.productName}</p>
						<p className="text-xs text-muted-foreground">
							{row.original.categoryName}
						</p>
					</div>
				</div>
			);
		},
		enableHiding: false,
		filterFn: (row, _id, value) => {
			const searchValue = value.toLowerCase();
			const productName = row.original.productName.toLowerCase();
			const categoryName = row.original.categoryName.toLowerCase();
			return (
				productName.includes(searchValue) || categoryName.includes(searchValue)
			);
		},
	},
	{
		accessorKey: "currentInventory",
		header: ({ column }) => {
			return (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8"
					>
						Tồn kho
						{column.getIsSorted() === "asc" ? (
							<IconSortAscending className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<IconSortDescending className="ml-2 h-4 w-4" />
						) : (
							<IconSelector className="ml-2 h-4 w-4" />
						)}
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-right">
				<p className="font-medium">
					{row.original.currentInventory.toLocaleString("vi-VN")}
				</p>
				<p className="text-xs text-muted-foreground">{row.original.unit}</p>
			</div>
		),
	},
	{
		accessorKey: "importValue",
		header: ({ column }) => {
			return (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8"
					>
						Nhập
						{column.getIsSorted() === "asc" ? (
							<IconSortAscending className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<IconSortDescending className="ml-2 h-4 w-4" />
						) : (
							<IconSelector className="ml-2 h-4 w-4" />
						)}
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-right">
				<p className="font-medium text-red-600">
					{row.original.importQty.toLocaleString("vi-VN")}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatVND(row.original.importValue)}
				</p>
			</div>
		),
	},
	{
		accessorKey: "exportValue",
		header: ({ column }) => {
			return (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8"
					>
						Xuất
						{column.getIsSorted() === "asc" ? (
							<IconSortAscending className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<IconSortDescending className="ml-2 h-4 w-4" />
						) : (
							<IconSelector className="ml-2 h-4 w-4" />
						)}
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-right">
				<p className="font-medium text-green-600">
					{row.original.exportQty.toLocaleString("vi-VN")}
				</p>
				<p className="text-xs text-muted-foreground">
					{formatVND(row.original.exportValue)}
				</p>
			</div>
		),
	},
	{
		accessorKey: "saleValue",
		header: ({ column }) => {
			return (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8"
					>
						Doanh thu
						{column.getIsSorted() === "asc" ? (
							<IconSortAscending className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<IconSortDescending className="ml-2 h-4 w-4" />
						) : (
							<IconSelector className="ml-2 h-4 w-4" />
						)}
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-right">
				<p className="font-medium">{formatVND(row.original.saleValue)}</p>
				<p className="text-xs text-muted-foreground">
					{row.original.saleQty.toLocaleString("vi-VN")} {row.original.unit}
				</p>
			</div>
		),
	},
	{
		accessorKey: "profit",
		header: ({ column }) => {
			return (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8"
					>
						Lợi nhuận
						{column.getIsSorted() === "asc" ? (
							<IconSortAscending className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<IconSortDescending className="ml-2 h-4 w-4" />
						) : (
							<IconSelector className="ml-2 h-4 w-4" />
						)}
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-right">
				<p
					className={`font-medium ${
						row.original.profit >= 0 ? "text-green-600" : "text-red-600"
					}`}
				>
					{formatVND(row.original.profit)}
				</p>
			</div>
		),
	},
	{
		accessorKey: "profitMargin",
		header: ({ column }) => {
			return (
				<div className="flex justify-end">
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="h-8"
					>
						Biên LN
						{column.getIsSorted() === "asc" ? (
							<IconSortAscending className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === "desc" ? (
							<IconSortDescending className="ml-2 h-4 w-4" />
						) : (
							<IconSelector className="ml-2 h-4 w-4" />
						)}
					</Button>
				</div>
			);
		},
		cell: ({ row }) => (
			<div className="text-right">
				<Badge
					variant={
						row.original.profitMargin >= 20
							? "success"
							: row.original.profitMargin >= 10
								? "default"
								: "destructive"
					}
				>
					{row.original.profitMargin.toFixed(1)}%
				</Badge>
			</div>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
						size="icon"
					>
						<IconDotsVertical />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem asChild>
						<Link href={`/inventory/products/${row.original.productId}`}>
							Xem chi tiết
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href={`/products/${row.original.productId}/edit`}>
							Chỉnh sửa
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Xuất báo cáo</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];

export function StatisticsTable({ stats, isLoading }: StatisticsTableProps) {
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([
		{ id: "profit", desc: true },
	]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 20,
	});

	const table = useReactTable({
		data: stats,
		columns,
		state: {
			sorting,
			columnVisibility,
			columnFilters,
			pagination,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	const isFiltered = table.getState().columnFilters.length > 0;

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between gap-2">
					<Skeleton className="h-10 flex-1 max-w-sm" />
					<Skeleton className="h-10 w-40" />
				</div>
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Sản phẩm</TableHead>
								<TableHead className="text-right">Tồn kho</TableHead>
								<TableHead className="text-right">Nhập</TableHead>
								<TableHead className="text-right">Xuất</TableHead>
								<TableHead className="text-right">Doanh thu</TableHead>
								<TableHead className="text-right">Lợi nhuận</TableHead>
								<TableHead className="text-right">Biên LN</TableHead>
								<TableHead></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }, (_, i) => (
								<TableRow key={i}>
									<TableCell colSpan={8}>
										<Skeleton className="h-12 w-full" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative flex-1 max-w-sm">
					<IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Tìm kiếm sản phẩm hoặc danh mục..."
						value={
							(table.getColumn("productName")?.getFilterValue() as string) ?? ""
						}
						onChange={(event) =>
							table.getColumn("productName")?.setFilterValue(event.target.value)
						}
						className="pl-9 pr-9"
					/>
					{isFiltered && (
						<Button
							variant="ghost"
							onClick={() => table.resetColumnFilters()}
							className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
						>
							<IconX className="h-4 w-4" />
							<span className="sr-only">Xóa bộ lọc</span>
						</Button>
					)}
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm">
							<IconLayoutColumns />
							<span className="hidden lg:inline">Tùy chỉnh cột</span>
							<span className="lg:hidden">Cột</span>
							<IconChevronDown />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						{table
							.getAllColumns()
							.filter(
								(column) =>
									typeof column.accessorFn !== "undefined" &&
									column.getCanHide(),
							)
							.map((column) => {
								const columnNames: Record<string, string> = {
									productName: "Sản phẩm",
									currentInventory: "Tồn kho",
									importValue: "Nhập kho",
									exportValue: "Xuất kho",
									saleValue: "Doanh thu",
									profit: "Lợi nhuận",
									profitMargin: "Biên lợi nhuận",
								};

								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{columnNames[column.id] || column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader className="bg-muted">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="hover:bg-muted/50"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{isFiltered ? (
										<div className="flex flex-col items-center gap-2">
											<p className="text-muted-foreground">
												Không tìm thấy kết quả
											</p>
											<Button
												variant="link"
												onClick={() => table.resetColumnFilters()}
												className="h-auto p-0"
											>
												Xóa bộ lọc
											</Button>
										</div>
									) : (
										<p className="text-muted-foreground">Không có dữ liệu</p>
									)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between px-2">
				<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
					{isFiltered ? (
						<>
							Tìm thấy {table.getFilteredRowModel().rows.length} trong tổng số{" "}
							{stats.length} sản phẩm
						</>
					) : (
						<>
							Hiển thị {table.getRowModel().rows.length} của {stats.length} sản
							phẩm
						</>
					)}
				</div>
				<div className="flex w-full items-center gap-8 lg:w-fit">
					<div className="hidden items-center gap-2 lg:flex">
						<Label htmlFor="rows-per-page" className="text-sm font-medium">
							Số hàng mỗi trang
						</Label>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger size="sm" className="w-20" id="rows-per-page">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top">
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-fit items-center justify-center text-sm font-medium">
						Trang {table.getState().pagination.pageIndex + 1} /{" "}
						{table.getPageCount()}
					</div>
					<div className="ml-auto flex items-center gap-2 lg:ml-0">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Trang đầu</span>
							<IconChevronsLeft />
						</Button>
						<Button
							variant="outline"
							className="size-8"
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Trang trước</span>
							<IconChevronLeft />
						</Button>
						<Button
							variant="outline"
							className="size-8"
							size="icon"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Trang sau</span>
							<IconChevronRight />
						</Button>
						<Button
							variant="outline"
							className="hidden size-8 lg:flex"
							size="icon"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Trang cuối</span>
							<IconChevronsRight />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
