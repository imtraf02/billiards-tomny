"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product } from "@/generated/prisma/client";
import { api } from "@/lib/eden";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
	onSelect: (product: Product) => void;
	selectedProductIds?: string[];
}

export function ProductSelector({
	onSelect,
	selectedProductIds = [],
}: ProductSelectorProps) {
	const [searchTerm, setSearchTerm] = useState("");
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

	// Filter on the client side
	const products = (productsData || []).filter((product: Product) => {
		const matchesSearch = product.name
			.toLowerCase()
			.includes(searchTerm.toLowerCase());
		const matchesAvailable = product.isAvailable;
		return matchesSearch && matchesAvailable;
	});

	return (
		<div className="flex flex-col h-full border rounded-md">
			<div className="p-3 border-b">
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Tìm món..."
						className="pl-9"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>
			<ScrollArea className="flex-1 h-76">
				{isLoading ? (
					<div className="p-4 space-y-2">
						{[...Array(5)].map((_, i) => (
							<div
								key={`product-skeleton-${i}`}
								className="h-14 bg-muted rounded-md animate-pulse"
							/>
						))}
					</div>
				) : products.length === 0 ? (
					<div className="p-8 text-center text-muted-foreground text-sm">
						Không tìm thấy sản phẩm nào
					</div>
				) : (
					<div className="divide-y">
						{products.map((product) => {
							const isSelected = selectedProductIds.includes(product.id);
							const isOutOfStock = product.currentStock <= 0;

							return (
								<div
									key={product.id}
									className={cn(
										"flex items-center justify-between p-3 hover:bg-muted/50 transition-colors",
										isOutOfStock && "opacity-60 grayscale",
									)}
								>
									<div className="flex-1 min-w-0 mr-4">
										<div className="flex items-center gap-2">
											<p className="font-medium text-sm truncate">
												{product.name}
											</p>
											{product.currentStock <= 5 && !isOutOfStock && (
												<Badge
													variant="outline"
													className="text-[10px] h-5 px-1 border-red-200 text-red-600 bg-red-50"
												>
													Sắp hết: {product.currentStock}
												</Badge>
											)}
										</div>
										<p className="text-xs text-muted-foreground">
											{new Intl.NumberFormat("vi-VN").format(product.price)} đ
											{product.unit ? ` / ${product.unit}` : ""}
										</p>
									</div>

									{isOutOfStock ? (
										<Badge variant="secondary" className="text-xs">
											Hết hàng
										</Badge>
									) : (
										<Button
											size="sm"
											variant={isSelected ? "secondary" : "default"}
											className="h-8 w-8 p-0"
											onClick={() => onSelect(product)}
											title="Thêm vào đơn"
										>
											<Plus className="h-4 w-4" />
										</Button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</ScrollArea>
		</div>
	);
}
