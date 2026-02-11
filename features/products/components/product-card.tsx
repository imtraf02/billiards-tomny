"use client";
import {
	CircleOffIcon,
	Edit,
	Ellipsis,
	HandIcon,
	ImportIcon,
	InfoIcon,
	Package,
	Trash2,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON_MAP } from "../data";
import type { ProductDetails } from "../types";
import { useProducts } from "./products-provider";

interface ProductCardProps {
	product: ProductDetails;
}

export function ProductCard({ product }: ProductCardProps) {
	const { setOpen, setCurrentRow } = useProducts();

	const Icon =
		product.category.name in CATEGORY_ICON_MAP
			? CATEGORY_ICON_MAP[
					product.category.name as keyof typeof CATEGORY_ICON_MAP
				]
			: Package;

	const stock = useMemo(() => {
		return product.batches.reduce((acc, batch) => acc + batch.quantity, 0);
	}, [product.batches]);

	return (
		<li className="rounded-lg border p-4 hover:shadow-md">
			<div className="mb-8 flex items-center justify-between">
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
						<DropdownMenuItem
							onClick={() => {
								setCurrentRow(product);
								setOpen("detail");
							}}
						>
							Chi tiết
							<DropdownMenuShortcut>
								<InfoIcon />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setCurrentRow(product);
								setOpen("update");
							}}
						>
							Chỉnh sửa
							<DropdownMenuShortcut>
								<Edit />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setCurrentRow(product);
								setOpen("import");
							}}
						>
							Nhập hàng
							<DropdownMenuShortcut>
								<ImportIcon />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setCurrentRow(product);
								setOpen("internal-use");
							}}
						>
							Sử dụng nội bộ
							<DropdownMenuShortcut>
								<HandIcon />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								setCurrentRow(product);
								setOpen("spoilage");
							}}
						>
							Hư hại / Hết hạn
							<DropdownMenuShortcut>
								<CircleOffIcon />
							</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="text-destructive!"
							onClick={() => {
								setCurrentRow(product);
								setOpen("delete");
							}}
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
				<h2 className="mb-1 font-semibold">{product.name}</h2>
				<p className="line-clamp-2 text-muted-foreground text-sm min-h-10">
					{product.description}
				</p>
				<div className="space-y-1 text-sm text-muted-foreground mt-1">
					<DetailRow label="Đơn giá" isBold>
						{formatVND(product.price)} / {product.unit}
					</DetailRow>
					<DetailRow label="Tồn kho">
						{stock} {product.unit}
					</DetailRow>
					<DetailRow
						label="Tồn kho tối thiểu"
						isWarning={stock < product.minStock}
					>
						{product.minStock} {product.unit}
					</DetailRow>
				</div>
			</div>
		</li>
	);
}

// Helper component
function DetailRow({
	label,
	children,
	isBold,
	isWarning,
}: {
	label: string;
	children: React.ReactNode;
	isBold?: boolean;
	isWarning?: boolean;
}) {
	return (
		<div className="flex justify-between">
			<span>{label}</span>
			<span
				className={cn({
					"font-medium text-foreground": isBold,
					"font-medium text-destructive": isWarning,
				})}
			>
				{children}
			</span>
		</div>
	);
}
