"use client";

import { Minus, Plus, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateOrder } from "@/features/order/hooks/use-order";
import {
	useGetAllProducts,
	useGetCategories,
} from "@/features/product/hooks/use-product";

interface OrderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bookingId: string;
}

export function OrderDialog({
	open,
	onOpenChange,
	bookingId,
}: OrderDialogProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [cart, setCart] = useState<
		Record<
			string,
			{ id: string; name: string; price: number; quantity: number }
		>
	>({});

	const { data: categories } = useGetCategories();
	const { data: productsData, isLoading } = useGetAllProducts({
		search: searchTerm || undefined,
		limit: 100,
	});

	const products = productsData?.data || [];
	const { mutate: createOrder, isPending } = useCreateOrder(() => {
		toast.success("Đặt món thành công!");
		onOpenChange(false);
		setCart({});
	});

	const addToCart = (product: any) => {
		setCart((prev) => ({
			...prev,
			[product.id]: {
				id: product.id,
				name: product.name,
				price: product.price,
				quantity: (prev[product.id]?.quantity || 0) + 1,
			},
		}));
	};

	const removeFromCart = (productId: string) => {
		setCart((prev) => {
			const newCart = { ...prev };
			if (newCart[productId].quantity > 1) {
				newCart[productId].quantity -= 1;
			} else {
				delete newCart[productId];
			}
			return newCart;
		});
	};

	const cartItems = Object.values(cart);
	const totalAmount = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	const handleOrder = () => {
		if (cartItems.length === 0) return;
		createOrder({
			bookingId,
			items: cartItems.map((item) => ({
				productId: item.id,
				quantity: item.quantity,
			})),
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<ShoppingCart className="h-5 w-5" />
						Gọi món & Dịch vụ
					</DialogTitle>
					<DialogDescription>
						Chọn các sản phẩm để thêm vào bàn này.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 flex gap-4 overflow-hidden py-4">
					{/* Product Selection Side */}
					<div className="flex-1 flex flex-col gap-4 border-r pr-4">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Tìm sản phẩm..."
								className="pl-9"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<Tabs
							defaultValue="all"
							className="flex-1 flex flex-col overflow-hidden"
						>
							<TabsList className="justify-start mb-2 overflow-x-auto h-auto p-1 bg-transparent">
								<TabsTrigger value="all" className="rounded-full">
									Tất cả
								</TabsTrigger>
								{categories?.map((cat: any) => (
									<TabsTrigger
										key={cat.id}
										value={cat.id}
										className="rounded-full"
									>
										{cat.name}
									</TabsTrigger>
								))}
							</TabsList>

							<TabsContent value="all" className="flex-1 overflow-hidden mt-0">
								<ScrollArea className="h-full pr-4">
									<div className="grid grid-cols-2 gap-3 pb-4">
										{isLoading ? (
											<p className="col-span-2 text-center py-8 text-muted-foreground">
												Đang tải...
											</p>
										) : (
											products.map((product: any) => (
												<div
													key={product.id}
													className="p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors group relative"
													onClick={() => addToCart(product)}
												>
													<h4 className="font-medium text-sm pr-6 leading-tight mb-1">
														{product.name}
													</h4>
													<p className="text-sm font-bold text-primary">
														{new Intl.NumberFormat("vi-VN").format(
															product.price,
														)}{" "}
														đ
													</p>
													<p className="text-[10px] text-muted-foreground mt-1">
														Còn {product.currentStock} {product.unit}
													</p>
													<Button
														size="icon"
														variant="secondary"
														className="absolute bottom-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
													>
														<Plus className="h-4 w-4" />
													</Button>
												</div>
											))
										)}
									</div>
								</ScrollArea>
							</TabsContent>

							{categories?.map((cat: any) => (
								<TabsContent
									key={cat.id}
									value={cat.id}
									className="flex-1 overflow-hidden mt-0"
								>
									<ScrollArea className="h-full pr-4">
										<div className="grid grid-cols-2 gap-3 pb-4">
											{products
												.filter((p: any) => p.categoryId === cat.id)
												.map((product: any) => (
													<div
														key={product.id}
														className="p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors group relative"
														onClick={() => addToCart(product)}
													>
														<h4 className="font-medium text-sm pr-6 leading-tight mb-1">
															{product.name}
														</h4>
														<p className="text-sm font-bold text-primary">
															{new Intl.NumberFormat("vi-VN").format(
																product.price,
															)}{" "}
															đ
														</p>
														<p className="text-[10px] text-muted-foreground mt-1">
															Còn {product.currentStock} {product.unit}
														</p>
														<Button
															size="icon"
															variant="secondary"
															className="absolute bottom-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
														>
															<Plus className="h-4 w-4" />
														</Button>
													</div>
												))}
										</div>
									</ScrollArea>
								</TabsContent>
							))}
						</Tabs>
					</div>

					{/* Cart Side */}
					<div className="w-[280px] flex flex-col gap-4">
						<h3 className="font-semibold flex items-center justify-between">
							Giỏ hàng
							<Badge variant="secondary">{cartItems.length}</Badge>
						</h3>

						<ScrollArea className="flex-1 -mx-2 px-2">
							{cartItems.length > 0 ? (
								<div className="space-y-3">
									{cartItems.map((item) => (
										<div
											key={item.id}
											className="flex flex-col gap-1 b-2 pb-2 border-b last:border-0"
										>
											<div className="flex justify-between text-sm font-medium">
												<span className="truncate flex-1 pr-2">
													{item.name}
												</span>
												<span>
													{new Intl.NumberFormat("vi-VN").format(
														item.price * item.quantity,
													)}{" "}
													đ
												</span>
											</div>
											<div className="flex items-center gap-2">
												<Button
													size="icon"
													variant="outline"
													className="h-6 w-6 rounded-full"
													onClick={() => removeFromCart(item.id)}
												>
													<Minus className="h-3 w-3" />
												</Button>
												<span className="text-xs w-6 text-center">
													{item.quantity}
												</span>
												<Button
													size="icon"
													variant="outline"
													className="h-6 w-6 rounded-full"
													onClick={() => addToCart(item)}
												>
													<Plus className="h-3 w-3" />
												</Button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
									<ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
									<p className="text-xs">Chưa có sản phẩm</p>
								</div>
							)}
						</ScrollArea>

						<div className="bg-muted p-4 rounded-lg mt-auto">
							<div className="flex justify-between items-center mb-4">
								<span className="text-sm font-medium">Tổng cộng:</span>
								<span className="text-lg font-bold text-primary">
									{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
								</span>
							</div>
							<Button
								className="w-full"
								disabled={cartItems.length === 0 || isPending}
								onClick={handleOrder}
							>
								{isPending ? "Đang xử lý..." : "Xác nhận gọi món"}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
