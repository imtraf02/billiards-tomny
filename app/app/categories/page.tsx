"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Package, Plus, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CategoryDrawer } from "@/features/category/components/category-drawer";
import { DeleteCategoryDrawer } from "@/features/category/components/delete-category-drawer";
import type { Category } from "@/generated/prisma/browser";
import { api } from "@/lib/eden";

export default function CategoriesPage() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

	const { data: categories, isLoading } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.products.categories.get();
			if (res.status === 200) {
				return res.data;
			}
			return [];
		},
	});

	const handleAddCategory = () => {
		setSelectedCategory(null);
		setIsDialogOpen(true);
	};

	const handleEditCategory = (category: Category) => {
		setSelectedCategory(category);
		setIsDialogOpen(true);
	};

	const handleDeleteCategory = (category: Category) => {
		setSelectedCategory(category);
		setIsDeleteDialogOpen(true);
	};

	const filteredCategories =
		categories?.filter((category: any) =>
			category.name.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	return (
		<>
			<Header>
				<div className="relative w-full max-w-sm">
					<SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Tìm kiếm danh mục..."
						className="pl-9"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Quản lý Danh mục
						</h1>
						<p className="text-muted-foreground">
							Tạo và quản lý các danh mục để phân loại sản phẩm của bạn.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button onClick={handleAddCategory}>
							<Plus className="mr-2 h-4 w-4" /> Thêm danh mục
						</Button>
					</div>
				</div>

				<div className="space-y-4">
					{/* Filter and Search (nếu muốn thêm filter) */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
						Tổng số danh mục: {filteredCategories.length}
					</div>

					{/* Categories Grid */}
					{isLoading ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{[...Array(8)].map((_, i) => (
								<div
									key={`category-skeleton-${i}`}
									className="h-64 w-full animate-pulse rounded-md bg-muted"
								/>
							))}
						</div>
					) : filteredCategories.length > 0 ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{filteredCategories.map((category: any) => (
								<Card
									key={category.id}
									className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col"
								>
									<CardContent className="pt-6 pb-2 flex-grow space-y-4">
										{/* Category Header */}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<FolderOpen className="h-5 w-5 text-primary" />
												<h3 className="text-lg font-bold line-clamp-1">
													{category.name}
												</h3>
											</div>
											<Badge
												variant={
													category.isActive !== false ? "default" : "secondary"
												}
												className="text-xs"
											>
												{category.isActive !== false ? "Hoạt động" : "Ngừng"}
											</Badge>
										</div>

										{/* Description */}
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground line-clamp-3">
												{category.description || "Không có mô tả"}
											</p>

											{/* Stats */}
											<div className="flex items-center justify-between pt-2">
												<div className="flex items-center gap-2">
													<Package className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm text-muted-foreground">
														Sản phẩm:
													</span>
												</div>
												<span className="text-sm font-bold text-primary">
													{category._count?.products || 0}
												</span>
											</div>
										</div>
									</CardContent>

									{/* Actions */}
									<div className="p-4 pt-2 border-t">
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												className="flex-1"
												onClick={() => handleEditCategory(category)}
											>
												Chỉnh sửa
											</Button>
											<Button
												variant="destructive"
												size="sm"
												className="flex-1"
												onClick={() => handleDeleteCategory(category)}
											>
												Xóa
											</Button>
										</div>
									</div>
								</Card>
							))}
						</div>
					) : (
						<div className="flex h-52 flex-col items-center justify-center rounded-lg border border-dashed text-center">
							<FolderOpen className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
							<p className="text-muted-foreground">
								Không tìm thấy danh mục nào.
							</p>
							{searchTerm && (
								<Button variant="link" onClick={() => setSearchTerm("")}>
									Xóa tìm kiếm
								</Button>
							)}
						</div>
					)}
				</div>

				<CategoryDrawer
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					category={selectedCategory}
				/>

				<DeleteCategoryDrawer
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					categoryId={selectedCategory?.id || null}
					categoryName={selectedCategory?.name || null}
				/>
			</Main>
		</>
	);
}
