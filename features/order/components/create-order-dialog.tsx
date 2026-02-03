"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ProductSelector } from "@/features/order/components/product-selector";
import { useCreateOrder } from "@/features/order/hooks/use-order";
import type { Product } from "@/generated/prisma/client";

interface CreateOrderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface CartItem {
	product: Product;
	quantity: number;
}

export function CreateOrderDialog({
	open,
	onOpenChange,
}: CreateOrderDialogProps) {
	const { me: user } = useAuth();
	const [cart, setCart] = useState<CartItem[]>([]);
	const { mutate: createOrder, isPending } = useCreateOrder(() => {
		toast.success("Tạo đơn hàng thành công");
		onOpenChange(false);
		setCart([]);
	});

	const addToCart = (product: Product) => {
		setCart((prev) => {
			const existing = prev.find((item) => item.product.id === product.id);
			if (existing) {
				return prev.map((item) =>
					item.product.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}
			return [...prev, { product, quantity: 1 }];
		});
	};

	const removeFromCart = (productId: string) => {
		setCart((prev) => prev.filter((item) => item.product.id !== productId));
	};

	const updateQuantity = (productId: string, delta: number) => {
		setCart((prev) =>
			prev.map((item) => {
				if (item.product.id === productId) {
					const newQuantity = Math.max(1, item.quantity + delta);
					// Check stock limit
					if (newQuantity > item.product.currentStock) {
						toast.error(`Chỉ còn ${item.product.currentStock} sản phẩm`);
						return item;
					}
					return { ...item, quantity: newQuantity };
				}
				return item;
			}),
		);
	};

	const totalAmount = cart.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0,
	);

	const handleSubmit = () => {
		if (cart.length === 0) {
			toast.error("Giỏ hàng đang trống");
			return;
		}

		if (!user?.id) {
			toast.error("Vui lòng đăng nhập để tạo đơn hàng");
			return;
		}

		createOrder({
			items: cart.map((item) => ({
				productId: item.product.id,
				quantity: item.quantity,
			})),
			userId: user.id,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle>Tạo Đơn Hàng Mới</DialogTitle>
				</DialogHeader>

				<div className="flex flex-1 overflow-hidden">
					{/* Left: Product Selection */}
					<div className="w-[60%] p-4 border-r">
						<ProductSelector
							onSelect={addToCart}
							selectedProductIds={cart.map((i) => i.product.id)}
						/>
					</div>

					{/* Right: Cart */}
					<div className="flex-1 flex flex-col bg-muted/10">
						<div className="p-4 border-b bg-white">
							<div className="flex items-center gap-2 font-medium">
								<ShoppingCart className="h-4 w-4" />
								Giỏ hàng ({cart.length})
							</div>
						</div>

						<ScrollArea className="flex-1 p-4">
							{cart.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
									<ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
									Chưa có sản phẩm nào
								</div>
							) : (
								<div className="space-y-4">
									{cart.map((item) => (
										<div
											key={item.product.id}
											className="flex flex-col gap-2 bg-white p-3 rounded-lg border shadow-sm"
										>
											<div className="flex justify-between items-start">
												<span className="font-medium text-sm line-clamp-2">
													{item.product.name}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6 text-muted-foreground hover:text-destructive"
													onClick={() => removeFromCart(item.product.id)}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>

											<div className="flex items-center justify-between mt-1">
												<div className="text-xs text-muted-foreground">
													{new Intl.NumberFormat("vi-VN").format(
														item.product.price,
													)}{" "}
													đ
												</div>
												<div className="font-medium text-sm">
													{new Intl.NumberFormat("vi-VN").format(
														item.product.price * item.quantity,
													)}{" "}
													đ
												</div>
											</div>

											<div className="flex items-center gap-2 mt-1">
												<div className="flex items-center border rounded-md bg-background">
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 rounded-none"
														onClick={() =>
															updateQuantity(item.product.id, -1)
														}
														disabled={item.quantity <= 1}
													>
														<Minus className="h-3 w-3" />
													</Button>
													<span className="w-8 text-center text-sm font-medium">
														{item.quantity}
													</span>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 rounded-none"
														onClick={() =>
															updateQuantity(item.product.id, 1)
														}
														disabled={
															item.quantity >= item.product.currentStock
														}
													>
														<Plus className="h-3 w-3" />
													</Button>
												</div>
												<div className="text-xs text-muted-foreground ml-auto">
													Kho: {item.product.currentStock}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</ScrollArea>

						<div className="p-4 bg-white border-t space-y-4">
							<div className="space-y-1.5">
								<div className="flex justify-between text-base font-medium">
									<span>Tổng cộng</span>
									<span className="text-primary text-lg">
										{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
									</span>
								</div>
							</div>
							<Button
								className="w-full"
								size="lg"
								disabled={cart.length === 0 || isPending}
								onClick={handleSubmit}
							>
								{isPending ? "Đang xử lý..." : "Tạo Đơn Hàng"}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
