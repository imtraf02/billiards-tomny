"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import {
	ChevronLeft,
	ChevronRight,
	Pencil,
	Plus,
	Search as SearchIcon,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { CreateProductForm } from "@/features/product/components/create-product-form";
import { UpdateProductForm } from "@/features/product/components/update-product-form";
import type { Product } from "@/generated/prisma/client";
import { api } from "@/lib/eden";

export default function ProductsPage() {
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);

	const { data: productsData, isLoading } = useQuery({
		queryKey: ["products", page, limit, searchTerm],
		queryFn: async () => {
			const res = await api.products.get({
				query: {
					limit: limit,
					page: page,
					search: searchTerm || undefined,
				},
			});
			if (res.status === 200) {
				return res.data;
			}
			return {
				data: [],
				meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
			};
		},
	});

	const { mutate: deleteProduct } = useMutation({
		mutationFn: async (id: string) => {
			const res = await api.products({ id }).delete();
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});

	const handleEdit = (product: Product) => {
		setEditingProduct(product);
		setIsUpdateOpen(true);
	};

	const handleCreate = () => {
		setIsCreateOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
			deleteProduct(id);
		}
	};

	const totalPages = productsData?.meta?.totalPages || 1;

	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main fixed>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Sản phẩm</h1>
					<p className="text-muted-foreground">
						Quản lý danh sách sản phẩm, giá cả và tồn kho.
					</p>
				</div>

				<div className="my-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
					<div className="relative w-full sm:w-72">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Tìm kiếm sản phẩm..."
							className="pl-9"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Button onClick={handleCreate}>
						<Plus className="mr-2 h-4 w-4" />
						Thêm sản phẩm
					</Button>
				</div>

				<div className="rounded-md border">
					<div className="w-full overflow-auto">
						<table className="w-full caption-bottom text-sm">
							<thead className="[&_tr]:border-b">
								<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
									<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
										Tên sản phẩm
									</th>
									<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
										Danh mục
									</th>
									<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
										Giá bán
									</th>
									<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
										Tồn kho
									</th>
									<th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
										Trạng thái
									</th>
									<th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">
										Thao tác
									</th>
								</tr>
							</thead>
							<tbody className="[&_tr:last-child]:border-0">
								{productsData?.data?.map((product: any) => (
									<tr
										key={product.id}
										className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
									>
										<td className="p-4 align-middle font-medium">
											{product.name}
										</td>
										<td className="p-4 align-middle">
											{product.category?.name}
										</td>
										<td className="p-4 align-middle">
											{new Intl.NumberFormat("vi-VN", {
												style: "currency",
												currency: "VND",
											}).format(product.price)}
										</td>
										<td className="p-4 align-middle">
											<span
												className={cn(
													product.currentStock <= product.minStock
														? "text-red-500 font-bold"
														: "",
												)}
											>
												{product.currentStock} {product.unit}
											</span>
										</td>
										<td className="p-4 align-middle">
											<Badge
												variant={product.isAvailable ? "default" : "secondary"}
											>
												{product.isAvailable ? "Đang bán" : "Ngừng bán"}
											</Badge>
										</td>
										<td className="p-4 align-middle text-right">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEdit(product)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="text-red-500 hover:text-red-600 hover:bg-red-100"
													onClick={() => handleDelete(product.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
								{!isLoading && productsData?.data?.length === 0 && (
									<tr>
										<td colSpan={6} className="h-24 text-center">
											Không có sản phẩm nào.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				<div className="flex items-center justify-end space-x-2 py-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((old) => Math.max(old - 1, 1))}
						disabled={page === 1}
					>
						<ChevronLeft className="h-4 w-4" />
						Trước
					</Button>
					<div className="text-sm font-medium">
						Trang {page} / {totalPages}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
						disabled={page === totalPages}
					>
						Tiếp
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>

				<CreateProductForm
					open={isCreateOpen}
					onOpenChange={setIsCreateOpen}
				/>

				{editingProduct && (
					<UpdateProductForm
						open={isUpdateOpen}
						onOpenChange={setIsUpdateOpen}
						initialData={editingProduct}
					/>
				)}
			</Main>
		</>
	);
}
