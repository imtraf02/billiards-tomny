"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Edit,
	Ellipsis,
	Package,
	SlidersHorizontal,
	Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CATEGORY_ICON_MAP } from "@/features/products/data";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/eden";
import { cn } from "@/lib/utils";
import type { CategoryWithCount } from "../types";
import { CategoriesPrimaryButtons } from "./categories-primary-buttons";
import { useCategories } from "./categories-provider";

const SORT_OPTIONS = ["asc", "desc"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

// Extracted components for better performance
function CategoryCardSkeleton() {
	return <Skeleton className="h-40" />;
}

interface CategoryCardProps {
	category: CategoryWithCount;
	onEdit: (category: CategoryWithCount) => void;
	onDelete: (category: CategoryWithCount) => void;
}

const CategoryCard = ({ category, onEdit, onDelete }: CategoryCardProps) => {
	const Icon =
		category.name in CATEGORY_ICON_MAP
			? CATEGORY_ICON_MAP[category.name as keyof typeof CATEGORY_ICON_MAP]
			: Package;

	return (
		<li className="rounded-lg border p-4 hover:shadow-md">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex size-10 items-center justify-center rounded-lg bg-muted p-2">
					<Icon className="size-5 text-muted-foreground" />
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<Ellipsis />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onEdit(category)}>
							Chỉnh sửa
							<DropdownMenuShortcut>
								<Edit />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive!"
							onClick={() => onDelete(category)}
						>
							Xóa
							<DropdownMenuShortcut>
								<Trash2 className="text-destructive" />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div>
				<h2 className="mb-1 font-semibold">{category.name}</h2>
				<p className="line-clamp-2 text-muted-foreground text-sm min-h-10">
					{category.description || "Chưa có mô tả"}
				</p>
				<div className="space-y-1 text-sm text-muted-foreground mt-2">
					<CategoryDetail label="Số lượng sản phẩm">
						{category._count.products}
					</CategoryDetail>
				</div>
			</div>
		</li>
	);
};

interface CategoryDetailProps {
	label: string;
	children: React.ReactNode;
	isBold?: boolean;
}

function CategoryDetail({ label, children, isBold }: CategoryDetailProps) {
	return (
		<div className="flex justify-between">
			<span>{label}</span>
			<span
				className={cn({
					"font-medium text-foreground": isBold,
				})}
			>
				{children}
			</span>
		</div>
	);
}

export function Categories() {
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<SortOption>("asc");
	const { setOpen, setCurrentRow } = useCategories();

	const debouncedSearch = useDebounce(search, 100);

	const { data: categories, isLoading } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => await api.products.categories.get(),
	});

	const filteredCategories = useMemo(() => {
		if (!categories?.data) return [];

		const lowerSearch = debouncedSearch.toLowerCase();

		return categories.data
			.filter((category) => {
				return category.name.toLowerCase().includes(lowerSearch);
			})
			.sort((a, b) =>
				sort === "asc"
					? a.name.localeCompare(b.name)
					: b.name.localeCompare(a.name),
			);
	}, [categories?.data, debouncedSearch, sort]);

	// Memoized handlers to prevent unnecessary re-renders
	const handleEdit = useCallback(
		(category: CategoryWithCount) => {
			setCurrentRow(category);
			setOpen("update");
		},
		[setCurrentRow, setOpen],
	);

	const handleDelete = useCallback(
		(category: CategoryWithCount) => {
			setCurrentRow(category);
			setOpen("delete");
		},
		[setCurrentRow, setOpen],
	);

	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Danh sách danh mục
					</h1>
					<p className="text-muted-foreground">
						Danh sách danh mục được hiển thị ở đây!
					</p>
				</div>
				<CategoriesPrimaryButtons />
			</div>

			<div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
				<div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
					<Input
						placeholder="Tìm kiếm danh mục..."
						className="h-9 w-40 lg:w-64"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<Select
					value={sort}
					onValueChange={(value) => {
						setSort(value as SortOption);
					}}
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
								<span>Tên A-Z</span>
							</div>
						</SelectItem>
						<SelectItem value="desc">
							<div className="flex items-center gap-4">
								<ArrowDownAZ />
								<span>Tên Z-A</span>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Separator className="shadow-sm" />

			<ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-4">
				{isLoading ? (
					Array.from({ length: 8 }, (_, i) => <CategoryCardSkeleton key={i} />)
				) : filteredCategories.length === 0 ? (
					<li className="text-muted-foreground col-span-full text-center py-10">
						Không tìm thấy danh mục
					</li>
				) : (
					filteredCategories.map((category) => (
						<CategoryCard
							key={category.id}
							category={category}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					))
				)}
			</ul>
		</>
	);
}
