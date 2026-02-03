"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "@/features/product/components/category-dialog";
import { CategoryList } from "@/features/product/components/category-list";
import { DeleteCategoryDialog } from "@/features/product/components/delete-category-dialog";
import { useGetCategories } from "@/features/product/hooks/use-product";

export default function CategoriesPage() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

	const { data: categories, isLoading } = useGetCategories();

	const handleAddCategory = () => {
		setSelectedCategory(null);
		setIsDialogOpen(true);
	};

	const handleEditCategory = (category: any) => {
		setSelectedCategory(category);
		setIsDialogOpen(true);
	};

	const handleDeleteCategory = (id: string) => {
		const category = categories?.find((c: any) => c.id === id);
		if (category) {
			setSelectedCategory(category);
			setIsDeleteDialogOpen(true);
		}
	};

	return (
		<>
			<Header>
				<Search />
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
					{isLoading ? (
						<div className="space-y-3">
							{[...Array(5)].map((_, i) => (
								<div
									key={`category-skeleton-${i}`}
									className="h-16 w-full animate-pulse rounded-md bg-muted"
								/>
							))}
						</div>
					) : (
						<CategoryList
							categories={categories || []}
							onEdit={handleEditCategory}
							onDelete={handleDeleteCategory}
						/>
					)}
				</div>

				<CategoryDialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					category={selectedCategory}
				/>

				<DeleteCategoryDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					categoryId={selectedCategory?.id || null}
					categoryName={selectedCategory?.name || null}
				/>
			</Main>
		</>
	);
}
