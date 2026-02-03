"use client";

import {
    MoreHorizontal,
    Package,
    Pencil,
    Trash2,
    Eye,
    AlertCircle,
    Coffee,
    Utensils,
    ShoppingBag,
    Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InventoryLogsDialog } from "./inventory-logs-dialog";
import type { Product } from "@/generated/prisma/client";

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onInventory: (product: Product) => void;
}

const stockColors: Record<string, string> = {
    HIGH: "bg-green-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-red-500",
    OUT: "bg-gray-500",
};

const stockLabels: Record<string, string> = {
    HIGH: "Còn nhiều",
    MEDIUM: "Sắp hết",
    LOW: "Còn ít",
    OUT: "Hết hàng",
};

// Hàm lấy icon theo danh mục
const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return <Package className="h-5 w-5 text-muted-foreground" />;
    
    const name = categoryName.toLowerCase();
    
    if (name.includes('thức uống') || name.includes('đồ uống') || name.includes('nước')) {
        return <Coffee className="h-5 w-5 text-muted-foreground" />;
    } else if (name.includes('đồ ăn') || name.includes('món ăn') || name.includes('thức ăn')) {
        return <Utensils className="h-5 w-5 text-muted-foreground" />;
    } else if (name.includes('phụ kiện') || name.includes('dụng cụ')) {
        return <Wrench className="h-5 w-5 text-muted-foreground" />;
    } else if (name.includes('khác') || name.includes('khac')) {
        return <ShoppingBag className="h-5 w-5 text-muted-foreground" />;
    }
    
    return <Package className="h-5 w-5 text-muted-foreground" />;
};

export function ProductCard({ product, onEdit, onDelete, onInventory }: ProductCardProps) {
    const getStockStatus = () => {
        if (product.currentStock === 0) return { status: "OUT", label: "Hết hàng" };
        if (product.currentStock <= product.minStock) return { status: "LOW", label: "Còn ít" };
        if (product.currentStock <= product.minStock * 2) return { status: "MEDIUM", label: "Sắp hết" };
        return { status: "HIGH", label: "Còn nhiều" };
    };

    const stockStatus = getStockStatus();

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    {getCategoryIcon(product.category?.name)}
                    <CardTitle className="text-lg font-bold line-clamp-1">{product.name}</CardTitle>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onInventory(product)}>
                            <Package className="mr-2 h-4 w-4" />
                            Nhập/Xuất kho
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(product.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3 pb-2 flex-grow">
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                        {product.category?.name || "Không có danh mục"}
                    </Badge>
                    <Badge
                        variant={product.isAvailable ? "default" : "secondary"}
                        className="text-xs"
                    >
                        {product.isAvailable ? "Đang bán" : "Ngừng bán"}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Giá bán:</span>
                        <span className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(product.price)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tồn kho:</span>
                        <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-medium ${product.currentStock <= product.minStock ? "text-red-600" : ""}`}>
                                {product.currentStock} {product.unit}
                            </span>
                            {product.currentStock <= product.minStock && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Trạng thái tồn kho:</span>
                        <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full ${stockColors[stockStatus.status]}`} />
                            <span className="text-xs font-medium">
                                {stockStatus.label}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tồn tối thiểu:</span>
                        <span className="text-sm font-medium">
                            {product.minStock} {product.unit}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <div className="flex w-full gap-2">
                    <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => onInventory(product)}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        Kho hàng
                    </Button>
                    <InventoryLogsDialog product={product}>
                        <Button variant="secondary" size="icon">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </InventoryLogsDialog>
                </div>
            </CardFooter>
        </Card>
    );
}
