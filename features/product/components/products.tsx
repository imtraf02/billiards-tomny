"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/generated/prisma/client";
import { api } from "@/lib/eden";
import { CreateProductForm } from "./create-product-form";
import { InventoryForm } from "./inventory-form";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { UpdateProductForm } from "./update-product-form";

export function Products() {
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [isInventoryOpen, setIsInventoryOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [inventoryProduct, setInventoryProduct] = useState<Product | null>(
		null,
	);

	const queryClient = useQueryClient();

	const { data: categoriesData } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.products.categories.get();
			if (res.status === 200) {
				return res.data;
			}
			return [];
		},
	});

	const { data: productsData, isLoading } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const res = await api.products.get();

			if (res.status === 200) {
				return res.data;
			}

			return [];
		},
	});

	const filteredProducts = (productsData || []).filter((product: Product) => {
		const matchesSearch = product.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesCategory =
			categoryFilter === "ALL" || product.categoryId === categoryFilter;
		const matchesStatus =
			statusFilter === "ALL" ||
			(statusFilter === "AVAILABLE" && product.isAvailable) ||
			(statusFilter === "UNAVAILABLE" && !product.isAvailable);

		return matchesSearch && matchesCategory && matchesStatus;
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
		setSelectedProduct(product);
		setIsUpdateOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
			deleteProduct(id);
		}
	};

	const handleCreate = () => {
		setIsCreateOpen(true);
	};

	const handleInventory = (product: Product) => {
		setInventoryProduct(product);
		setIsInventoryOpen(true);
	};

	return (
		<div className="space-y-4">
			{/* Filters and Search */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
					<div className="relative w-full sm:w-64">
						<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Tìm kiếm sản phẩm..."
							className="pl-9"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger className="w-full sm:w-44">
							<SelectValue placeholder="Danh mục" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả danh mục</SelectItem>
							{categoriesData?.map((category) => (
								<SelectItem key={category.id} value={category.id}>
									{category.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full sm:w-44">
							<SelectValue placeholder="Trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
							<SelectItem value="AVAILABLE">Đang bán</SelectItem>
							<SelectItem value="UNAVAILABLE">Ngừng bán</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Thêm sản phẩm
				</Button>
			</div>

			{/* Product Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[...Array(8)].map((_, i) => (
						<ProductCardSkeleton key={i} />
					))}
				</div>
			) : filteredProducts.length > 0 ? (
				<>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredProducts.map((product: Product) => (
							<ProductCard
								key={product.id}
								product={product}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onInventory={handleInventory}
							/>
						))}
					</div>
				</>
			) : (
				<div className="flex h-52 flex-col items-center justify-center rounded-lg border border-dashed text-center">
					<p className="text-muted-foreground">Không tìm thấy sản phẩm nào.</p>
					<Button
						variant="link"
						onClick={() => {
							setSearchTerm("");
							setCategoryFilter("ALL");
							setStatusFilter("ALL");
						}}
					>
						Xóa bộ lọc
					</Button>
				</div>
			)}

			{/* Forms and Dialogs */}
			<CreateProductForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />

			{selectedProduct && (
				<UpdateProductForm
					open={isUpdateOpen}
					onOpenChange={setIsUpdateOpen}
					initialData={selectedProduct}
				/>
			)}

			{inventoryProduct && (
				<InventoryForm
					open={isInventoryOpen}
					onOpenChange={setIsInventoryOpen}
					product={inventoryProduct}
				/>
			)}
		</div>
	);
}
