"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
	CheckCircle2,
	Loader2,
	Minus,
	MoreHorizontal,
	Package,
	Plus,
	Receipt,
	Search,
	Trash2,
	Truck,
	XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
	OrderItem,
	OrderStatus,
	Product,
} from "@/generated/prisma/browser";
import { api } from "@/lib/eden";
import { cn } from "@/lib/utils";
import type { BatchUpdateOrderItemsInput } from "@/shared/schemas/order";

interface OrderDetailDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orderId: string | null;
}

type LocalOrderItem = OrderItem & { product: Product };

const STATUS_CONFIG = {
	PENDING: {
		icon: Loader2,
		className: "text-yellow-600 animate-spin",
		label: "Chờ xử lý",
	},
	PREPARING: {
		icon: Package,
		className: "text-blue-600",
		label: "Đang chuẩn bị",
	},
	DELIVERED: {
		icon: Truck,
		className: "text-purple-600",
		label: "Đã giao",
	},
	COMPLETED: {
		icon: CheckCircle2,
		className: "text-green-600",
		label: "Hoàn thành",
	},
	CANCELLED: {
		icon: XCircle,
		className: "text-red-600",
		label: "Đã hủy",
	},
} as const;

export function OrderDetailDrawer({
	open,
	onOpenChange,
	orderId,
}: OrderDetailDrawerProps) {
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState<"details" | "menu">("details");
	const [localItems, setLocalItems] = useState<LocalOrderItem[]>([]);

	// Queries
	const { data: order, isLoading } = useQuery({
		queryKey: ["orders", orderId],
		queryFn: async () => {
			if (!orderId) return null;
			const res = await api.orders({ id: orderId }).get();
			if (res.error) throw res.error;
			return res.data;
		},
		enabled: !!orderId && open,
	});

	const { data: categories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.products.categories.get();
			return res.status === 200 ? res.data : [];
		},
		enabled: open,
	});

	const { data: productsData, isLoading: isLoadingProducts } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const res = await api.products.get();
			return res.status === 200 ? res.data : [];
		},
		enabled: open,
	});

	// Mutations
	const { mutate: updateStatus, isPending: isUpdating } = useMutation({
		mutationFn: async ({ status }: { status: OrderStatus }) => {
			if (!orderId) throw new Error("No order ID");
			const res = await api.orders({ id: orderId }).patch({ status });
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Cập nhật trạng thái thành công");
		},
	});

	const { mutate: batchUpdateItems, isPending: isUpdatingItems } = useMutation({
		mutationFn: async (data: BatchUpdateOrderItemsInput) => {
			if (!orderId) throw new Error("No order ID");
			const res = await api.orders({ id: orderId }).items.patch(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["bookings"] });
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
			toast.success("Cập nhật đơn hàng thành công");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Cập nhật thất bại");
		},
	});

	// Computed values
	const filteredProducts = useMemo(() => {
		if (!productsData) return [];
		return productsData.filter((product) =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [productsData, searchTerm]);

	const hasChanges = useMemo(() => {
		if (!order) return false;
		if (localItems.length !== order.orderItems.length) return true;
		return localItems.some((item) => {
			const original = order.orderItems.find((i) => i.id === item.id);
			return !original || item.quantity !== original.quantity;
		});
	}, [order, localItems]);

	const totalAmount = useMemo(() => {
		return localItems.reduce(
			(sum, item) => sum + item.priceSnapshot * item.quantity,
			0,
		);
	}, [localItems]);

	const isOrderEditable = useMemo(() => {
		return order?.status !== "CANCELLED" && order?.status !== "COMPLETED";
	}, [order?.status]);

	// Effects
	useEffect(() => {
		if (order?.orderItems) {
			setLocalItems(order.orderItems);
		} else if (!open) {
			setLocalItems([]);
			setActiveTab("details");
			setSearchTerm("");
		}
	}, [order, open]);

	// Handlers
	const handleSaveChanges = () => {
		if (!orderId) return;

		const itemsToUpdate = localItems.map((item) => ({
			id: item.id?.toString().startsWith("new-") ? undefined : item.id,
			productId: item.id?.toString().startsWith("new-")
				? item.productId
				: undefined,
			quantity: item.quantity,
		}));

		// Handle removed items
		const currentIds = new Set(
			localItems
				.filter((i) => i.id && !i.id.toString().startsWith("new-"))
				.map((i) => i.id),
		);
		order?.orderItems.forEach((original) => {
			if (!currentIds.has(original.id)) {
				itemsToUpdate.push({
					id: original.id,
					productId: original.productId,
					quantity: 0,
				});
			}
		});

		batchUpdateItems({ items: itemsToUpdate });
	};

	const handleSelectProduct = (product: Product) => {
		setLocalItems((prev) => {
			const existing = prev.find((item) => item.productId === product.id);
			if (existing) {
				return prev.map((item) =>
					item.productId === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}
			return [
				...prev,
				{
					id: `new-${Date.now()}`,
					orderId,
					productId: product.id,
					product: product,
					quantity: 1,
					costSnapshot: null,
					priceSnapshot: product.price,
				} as LocalOrderItem,
			];
		});
		toast.success(`Đã thêm ${product.name}`);
	};

	const updateLocalQuantity = (itemId: string, delta: number) => {
		setLocalItems((prev) =>
			prev.map((item) =>
				item.id === itemId
					? { ...item, quantity: Math.max(1, item.quantity + delta) }
					: item,
			),
		);
	};

	const removeLocalItem = (itemId: string) => {
		setLocalItems((prev) => prev.filter((item) => item.id !== itemId));
	};

	const getRemainingStock = (product: Product) => {
		const inLocal = localItems.find((i) => i.productId === product.id);
		const originalQty =
			order?.orderItems?.find((i) => i.productId === product.id)?.quantity || 0;
		return product.currentStock + originalQty - (inLocal?.quantity || 0);
	};

	const StatusIcon = ({ status }: { status: OrderStatus }) => {
		const config = STATUS_CONFIG[status];
		const Icon = config.icon;
		return <Icon className={cn("h-4 w-4", config.className)} />;
	};

	const ProductCard = ({ product }: { product: Product }) => {
		const inLocal = localItems.find((i) => i.productId === product.id);
		const originalQty =
			order?.orderItems?.find((i) => i.productId === product.id)?.quantity || 0;
		const remainingStock = getRemainingStock(product);
		const isOutOfStock = product.currentStock === 0 && originalQty === 0;

		return (
			<button
				type="button"
				className="flex flex-col p-3 border rounded-xl hover:border-primary hover:shadow-sm transition-all bg-card text-left disabled:opacity-50"
				onClick={() => handleSelectProduct(product)}
				disabled={isOutOfStock || remainingStock <= 0}
			>
				<div className="flex justify-between items-start gap-2 mb-2">
					<h4 className="font-medium text-sm leading-tight line-clamp-2 pr-4">
						{product.name}
					</h4>
					{inLocal && (
						<Badge className="shrink-0 h-5 px-1.5 text-[10px]">
							{inLocal.quantity}
						</Badge>
					)}
				</div>

				<div className="mt-auto flex items-end justify-between gap-2">
					<div className="space-y-0.5">
						<p className="text-sm font-bold text-primary">
							{new Intl.NumberFormat("vi-VN").format(product.price)} đ
						</p>
						<p className="text-[10px] text-muted-foreground">
							{isOutOfStock || remainingStock <= 0
								? "Hết hàng"
								: `Còn ${remainingStock} ${product.unit}`}
						</p>
					</div>
					<div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shadow-sm shrink-0">
						<Plus className="h-4 w-4" />
					</div>
				</div>
			</button>
		);
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="mx-auto flex h-[95vh] max-w-2xl flex-col overflow-hidden rounded-t-xl shadow-2xl p-0">
				<DrawerHeader className="px-4 pt-4 sm:px-6 shrink-0">
					<div className="flex items-center justify-between mt-2">
						{order && (
							<Badge
								variant="outline"
								className="font-mono uppercase cursor-pointer"
								onClick={() => {
									navigator.clipboard.writeText(order.id);
									toast.success("Đã sao chép ID đơn hàng");
								}}
							>
								#{order.id}
							</Badge>
						)}
						{order && (
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md text-xs font-medium">
									<StatusIcon status={order.status} />
									{STATUS_CONFIG[order.status].label}
								</div>
								{isOrderEditable && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												size="icon"
												variant="ghost"
												className="size-7"
												disabled={isUpdating}
											>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() => updateStatus({ status: "PENDING" })}
											>
												Chờ xử lý
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => updateStatus({ status: "PREPARING" })}
											>
												Đang chuẩn bị
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => updateStatus({ status: "DELIVERED" })}
											>
												Đã giao
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => updateStatus({ status: "COMPLETED" })}
											>
												Hoàn thành
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive focus:text-destructive"
												onClick={() => updateStatus({ status: "CANCELLED" })}
											>
												Hủy đơn hàng
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						)}
					</div>
					<DrawerTitle className="flex items-center gap-2 text-lg sm:text-xl">
						<Receipt className="h-5 w-5 text-primary" />
						Chi tiết đơn hàng
					</DrawerTitle>
					<DrawerDescription className="text-xs sm:text-sm">
						Cập nhật số lượng hoặc thêm món mới vào đơn hàng.
					</DrawerDescription>
				</DrawerHeader>

				<Tabs
					value={activeTab}
					onValueChange={(v) => setActiveTab(v as "details" | "menu")}
					className="flex-1 flex flex-col overflow-hidden"
				>
					<div className="px-4 sm:px-6 mb-2 shrink-0">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="details">Chi tiết</TabsTrigger>
							<TabsTrigger value="menu">Thực đơn</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent
						value="details"
						className="flex-1 overflow-hidden data-[state=active]:flex flex-col mt-0"
					>
						{isLoading ? (
							<div className="flex flex-1 items-center justify-center">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : order ? (
							<>
								<div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-muted-foreground">Bàn / Phiên chơi</p>
											<p className="font-medium">
												{order.booking?.bookingTables
													?.map((bt) => bt.table?.name)
													.join(", ") || "Khách lẻ"}
											</p>
										</div>
										<div className="text-right">
											<p className="text-muted-foreground">Thời gian</p>
											<p className="font-medium">
												{format(
													new Date(order.createdAt),
													"HH:mm - dd/MM/yyyy",
													{ locale: vi },
												)}
											</p>
										</div>
									</div>

									<Separator />

									<div className="space-y-3">
										{localItems.length === 0 ? (
											<div className="py-12 text-center text-muted-foreground italic bg-muted/20 rounded-lg">
												Chưa có món nào được chọn. Hãy qua tab Thực đơn để thêm
												món.
											</div>
										) : (
											localItems.map((item) => (
												<div
													key={item.id}
													className="flex justify-between items-start gap-4 p-2 rounded-lg hover:bg-muted/30 transition-colors"
												>
													<div className="flex-1">
														<p className="font-medium line-clamp-1">
															{item.product.name}
														</p>
														<p className="text-xs text-muted-foreground">
															{new Intl.NumberFormat("vi-VN").format(
																item.priceSnapshot,
															)}{" "}
															đ x {item.quantity}
														</p>
													</div>
													<div className="flex flex-col items-end gap-2">
														<div className="flex items-center gap-2">
															<p className="font-semibold whitespace-nowrap">
																{new Intl.NumberFormat("vi-VN").format(
																	item.priceSnapshot * item.quantity,
																)}{" "}
																đ
															</p>
															{isOrderEditable && (
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
																	onClick={() => removeLocalItem(item.id)}
																>
																	<Trash2 className="h-3.5 w-3.5" />
																</Button>
															)}
														</div>
														{isOrderEditable && (
															<div className="flex items-center gap-1">
																<Button
																	variant="outline"
																	size="icon"
																	className="h-7 w-7 rounded-full"
																	disabled={
																		isUpdatingItems || item.quantity <= 1
																	}
																	onClick={() =>
																		updateLocalQuantity(item.id, -1)
																	}
																>
																	<Minus className="h-3 w-3" />
																</Button>
																<span className="w-8 text-center text-sm font-medium">
																	{item.quantity}
																</span>
																<Button
																	variant="outline"
																	size="icon"
																	className="h-7 w-7 rounded-full"
																	disabled={
																		isUpdatingItems ||
																		item.quantity >=
																			item.product.currentStock +
																				(order.orderItems.find(
																					(i) => i.productId === item.productId,
																				)?.quantity || 0)
																	}
																	onClick={() =>
																		updateLocalQuantity(item.id, 1)
																	}
																>
																	<Plus className="h-3 w-3" />
																</Button>
															</div>
														)}
													</div>
												</div>
											))
										)}
									</div>
								</div>

								<div className="px-4 py-4 sm:px-6 border-t bg-background space-y-3 shrink-0">
									<div className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground font-medium">
											Tổng cộng:
										</span>
										<span className="text-xl font-black text-primary">
											{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
										</span>
									</div>
									{hasChanges && (
										<Button
											className="w-full h-11 text-base font-semibold"
											onClick={handleSaveChanges}
											disabled={isUpdatingItems}
										>
											{isUpdatingItems ? (
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
											) : (
												<CheckCircle2 className="h-4 w-4 mr-2" />
											)}
											Lưu thay đổi ({localItems.length} món)
										</Button>
									)}
								</div>
							</>
						) : (
							<div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
								Không tìm thấy dữ liệu đơn hàng.
							</div>
						)}
					</TabsContent>

					<TabsContent
						value="menu"
						className="flex-1 overflow-hidden data-[state=active]:flex flex-col mt-0"
					>
						<div className="flex-1 flex flex-col gap-3 p-4 sm:p-6 overflow-hidden">
							<div className="relative shrink-0">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Tìm sản phẩm..."
									className="pl-9 h-10"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<Tabs
								defaultValue="all"
								className="flex-1 flex flex-col overflow-hidden"
							>
								<div className="overflow-x-auto pb-2 scrollbar-none shrink-0">
									<TabsList className="inline-flex w-max min-w-full justify-start h-auto p-1 bg-muted/50 gap-1 rounded-full">
										<TabsTrigger
											value="all"
											className="rounded-full px-4 py-1.5 text-xs whitespace-nowrap"
										>
											Tất cả
										</TabsTrigger>
										{categories?.map((cat) => (
											<TabsTrigger
												key={cat.id}
												value={cat.id}
												className="rounded-full px-4 py-1.5 text-xs whitespace-nowrap"
											>
												{cat.name}
											</TabsTrigger>
										))}
									</TabsList>
								</div>

								<div className="flex-1 overflow-hidden mt-2">
									<TabsContent
										value="all"
										className="h-full overflow-hidden mt-0"
									>
										<ScrollArea className="h-full">
											<div className="grid grid-cols-2 gap-2 pr-4 pb-4">
												{isLoadingProducts ? (
													<div className="col-span-full py-12 flex justify-center text-primary">
														<Loader2 className="h-8 w-8 animate-spin" />
													</div>
												) : filteredProducts.length === 0 ? (
													<p className="col-span-full text-center py-12 text-sm text-muted-foreground">
														Không tìm thấy sản phẩm
													</p>
												) : (
													filteredProducts.map((product) => (
														<ProductCard key={product.id} product={product} />
													))
												)}
											</div>
										</ScrollArea>
									</TabsContent>

									{categories?.map((cat) => (
										<TabsContent
											key={cat.id}
											value={cat.id}
											className="h-full overflow-hidden mt-0"
										>
											<ScrollArea className="h-full">
												<div className="grid grid-cols-2 gap-2 pr-4 pb-4">
													{filteredProducts
														.filter((p) => p.categoryId === cat.id)
														.map((product) => (
															<ProductCard key={product.id} product={product} />
														))}
												</div>
											</ScrollArea>
										</TabsContent>
									))}
								</div>
							</Tabs>
						</div>
						{hasChanges && (
							<div className="p-4 sm:p-6 border-t bg-background shrink-0">
								<Button
									className="w-full h-11 text-base font-semibold"
									onClick={() => setActiveTab("details")}
								>
									Xem thay đổi ({localItems.length} món)
								</Button>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</DrawerContent>
		</Drawer>
	);
}
