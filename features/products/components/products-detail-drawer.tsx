"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductDetails } from "../types";

interface ProductsDetailDrawerProps {
	currentRow: ProductDetails;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProductsDetailDrawer({
	currentRow,
	open,
	onOpenChange,
}: ProductsDetailDrawerProps) {
	const stock = useMemo(() => {
		return currentRow.batches.reduce((acc, batch) => acc + batch.quantity, 0);
	}, [currentRow.batches]);

	return (
		<Drawer
			open={open}
			onOpenChange={(state) => {
				onOpenChange(state);
			}}
			direction="right"
		>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>{currentRow.name}</DrawerTitle>
					<DrawerDescription>{currentRow.description}</DrawerDescription>
				</DrawerHeader>
				<div className="no-scrollbar overflow-y-auto px-4">
					<div className="space-y-1 text-sm text-muted-foreground mt-1 mb-2">
						<ProductDetailRow label="Đơn giá" isBold>
							{formatVND(currentRow.price)} / {currentRow.unit}
						</ProductDetailRow>
						<ProductDetailRow label="Tồn kho">
							{stock} {currentRow.unit}
						</ProductDetailRow>
						<ProductDetailRow
							label="Tồn kho tối thiểu"
							isWarning={stock < currentRow.minStock}
						>
							{currentRow.minStock} {currentRow.unit}
						</ProductDetailRow>
					</div>
					<Separator className="shadow-sm" />
					<div className="flex items-center justify-between mt-3">
						<h3 className="font-semibold">Tồn kho</h3>
						<Link
							href={`/app/inventory-batches?product_id=${currentRow.id}`}
							className={buttonVariants({
								variant: "link",
							})}
						>
							Chi tiết
						</Link>
					</div>
					<ul className="space-y-3 mt-3">
						{currentRow.batches.map((batch) => (
							<li
								key={batch.id}
								className="rounded-lg border border-border bg-card p-3 space-y-2 hover:shadow-md transition-shadow duration-200"
							>
								<Badge variant="outline">#{batch.id}</Badge>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">
										Số lượng:
									</span>
									<p className="text-sm font-semibold text-foreground">
										{batch.quantity} {currentRow.unit}
									</p>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">
										Giá nhập / đơn vị:
									</span>
									<p className="text-sm font-semibold text-foreground">
										{formatVND(batch.costPerUnit)} / {currentRow.unit}
									</p>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">
										Tổng giá trị:
									</span>
									<p className="text-sm font-bold text-primary">
										{formatVND(batch.costPerUnit * batch.quantity)}
									</p>
								</div>
								<span className="text-xs text-muted-foreground">
									Nhập hàng lúc:{" "}
									{format(batch.importedAt, "dd/MM/yyyy HH:mm:ss")}
								</span>
							</li>
						))}
					</ul>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

interface ProductDetailProps {
	label: string;
	children: React.ReactNode;
	isBold?: boolean;
	isWarning?: boolean;
}

function ProductDetailRow({
	label,
	children,
	isBold,
	isWarning,
}: ProductDetailProps) {
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
