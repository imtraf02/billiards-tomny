"use client";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownAZ, ArrowUpAZ, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/eden";
import { ProductCard } from "./product-card";
import { ProductsPrimaryButtons } from "./products-primary-buttons";

const ALL_CATEGORIES = "Tất cả";
type SortOption = "asc" | "desc";

export function Products() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState(ALL_CATEGORIES);
	const [sort, setSort] = useState<SortOption>("asc");

	const debouncedSearch = useDebounce(search, 100);

	const { data: categories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => await api.products.categories.get(),
	});

	const { data: products, isLoading } = useQuery({
		queryKey: ["products"],
		queryFn: async () => await api.products.get(),
	});

	const filteredProducts = useMemo(() => {
		if (!products?.data) return [];

		const lowerSearch = debouncedSearch.toLowerCase();
		const isAllCategories = category === ALL_CATEGORIES;

		return products.data
			.filter((product) => {
				const matchesSearch = product.name.toLowerCase().includes(lowerSearch);
				const matchesCategory =
					isAllCategories || product.category.name === category;
				return matchesSearch && matchesCategory;
			})
			.sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));
	}, [products?.data, debouncedSearch, category, sort]);

	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Danh sách sản phẩm
					</h1>
					<p className="text-muted-foreground">
						Danh sách sản phẩm được hiển thị ở đây!
					</p>
				</div>
				<ProductsPrimaryButtons />
			</div>

			{/* Filters */}
			<div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
				<div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
					<Input
						placeholder="Tìm kiếm sản phẩm..."
						className="h-9 w-40 lg:w-64"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<Select value={category} onValueChange={setCategory}>
						<SelectTrigger className="w-36">
							<SelectValue placeholder="Chọn danh mục">{category}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ALL_CATEGORIES}>{ALL_CATEGORIES}</SelectItem>
							{categories?.data?.map((cat) => (
								<SelectItem key={cat.id} value={cat.name}>
									{cat.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Select
					value={sort}
					onValueChange={(value) => setSort(value as SortOption)}
				>
					<SelectTrigger className="w-16">
						<SelectValue>
							<SlidersHorizontal />
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="end" position="popper">
						<SelectItem value="asc">
							<div className="flex items-center gap-4">
								<ArrowUpAZ />
								<span>Giá tăng dần</span>
							</div>
						</SelectItem>
						<SelectItem value="desc">
							<div className="flex items-center gap-4">
								<ArrowDownAZ />
								<span>Giá giảm dần</span>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Separator className="shadow-sm" />

			{/* Grid */}
			<ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
				{isLoading ? (
					Array.from({ length: 12 }, (_, i) => (
						<Skeleton key={i} className="h-67.5" />
					))
				) : filteredProducts.length === 0 ? (
					<li className="text-muted-foreground">Không tìm thấy sản phẩm</li>
				) : (
					filteredProducts.map((product) => (
						<ProductCard key={product.id} product={product} />
					))
				)}
			</ul>
		</>
	);
}
