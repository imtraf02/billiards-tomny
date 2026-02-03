"use client";

import { Edit, Layers, MoreHorizontal, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryListProps {
	categories: any[];
	onEdit: (category: any) => void;
	onDelete: (id: string) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
	if (categories.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 border rounded-xl bg-muted/5 border-dashed">
				<Layers className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
				<p className="text-muted-foreground font-medium">Không tìm thấy danh mục nào</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{categories.map((category) => (
				<Card key={category.id} className="group relative overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white ring-1 ring-slate-200">
                    {/* Decorative accent */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    
					<CardContent className="p-5">
						<div className="flex items-start justify-between mb-4">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                                <Layers className="h-5 w-5" />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 -mr-2">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEdit(category)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive" 
                                        onClick={() => onDelete(category.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Xóa danh mục
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-primary transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                <Package className="h-4 w-4 text-slate-400" />
                                <strong>{category._count?.products || 0}</strong> sản phẩm
                            </p>
                        </div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

