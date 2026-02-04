"use client";

import { Minus, Plus, Search, ShoppingCart, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import { type CreateOrderInput } from "@/shared/schemas/order";

interface OrderDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bookingId: string;
}

interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	maxStock: number;
	unit: string;
}

export function OrderDrawer({
	open,
	onOpenChange,
	bookingId,
}: OrderDrawerProps) {
	const [activeMainTab, setActiveMainTab] = useState<"menu" | "cart">("menu");
	const [searchTerm, setSearchTerm] = useState("");
	const [cart, setCart] = useState<Record<string, CartItem>>({});

	const queryClient = useQueryClient();

	const { data: categories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const res = await api.products.categories.get();
			if (res.status === 200) {
				return res.data;
			}
			return [];
		},
	});

	const { data: productsData, isLoading } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const res = await api.products.get();

			if (res.status === 200) {
				return res.data;
			}

			return [];
		},
	});

	const products = useMemo(() => {
		if (!productsData) return [];

		return productsData.filter((product) =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [productsData, searchTerm]);

	const { mutate: createOrder, isPending } = useMutation({
		mutationFn: async (data: CreateOrderInput) => {
			const res = await api.orders.post(data);
			if (res.error) throw res.error;
			return res.data;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.resetQueries({ queryKey: ["orders"] }),
				queryClient.resetQueries({ queryKey: ["bookings"] }),
				queryClient.resetQueries({ queryKey: ["tables"] }),
				queryClient.invalidateQueries({ queryKey: ["products"] }),
				queryClient.invalidateQueries({ queryKey: ["inventory"] }),
			]);
			toast.success("Đặt món thành công!");
			onOpenChange(false);
			setCart({});
		},
	});

	// Fixed: Add to cart with proper logic
	const addToCart = (product: {
		id: string;
		name: string;
		price: number;
		currentStock: number;
		unit: string;
	}) => {
		setCart((prev) => {
			const currentQty = prev[product.id]?.quantity || 0;
			const newQty = currentQty + 1;

			if (newQty > product.currentStock) {
				toast.error(
					`Chỉ còn ${product.currentStock} ${product.unit} trong kho`,
				);
				return prev;
			}

			return {
				...prev,
				[product.id]: {
					id: product.id,
					name: product.name,
					price: product.price,
					quantity: newQty,
					maxStock: product.currentStock,
					unit: product.unit,
				},
			};
		});
	};

	// Fixed: Remove from cart
	const removeFromCart = (productId: string) => {
		setCart((prev) => {
			const newCart = { ...prev };
			if (newCart[productId].quantity > 1) {
				newCart[productId] = {
					...newCart[productId],
					quantity: newCart[productId].quantity - 1,
				};
			} else {
				delete newCart[productId];
			}
			return newCart;
		});
	};

	// New: Update quantity directly from input
	const updateQuantity = (productId: string, value: string) => {
		const numValue = parseInt(value, 10) || 0;

		setCart((prev) => {
			const item = prev[productId];
			if (!item) return prev;

			if (numValue <= 0) {
				const newCart = { ...prev };
				delete newCart[productId];
				return newCart;
			}

			if (numValue > item.maxStock) {
				toast.error(`Chỉ còn ${item.maxStock} ${item.unit} trong kho`);
				return prev;
			}

			return {
				...prev,
				[productId]: {
					...item,
					quantity: numValue,
				},
			};
		});
	};

	const cartItems = Object.values(cart);
	const totalAmount = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0,
	);

	const handleOrder = () => {
		if (cartItems.length === 0) {
			toast.error("Vui lòng chọn ít nhất một sản phẩm");
			return;
		}
		createOrder({
			bookingId,
			items: cartItems.map((item) => ({
				productId: item.id,
				quantity: item.quantity,
			})),
		});
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="h-[95vh] md:h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
				<DrawerHeader className="px-4 md:px-6 pt-4 md:pt-2 pb-4 border-b">
					<DrawerTitle className="flex items-center gap-2 text-lg md:text-xl">
						<ShoppingCart className="h-5 w-5" />
						Gọi món & Dịch vụ
					</DrawerTitle>
					<DrawerDescription className="text-sm">
						Chọn các sản phẩm để thêm vào bàn này.
					</DrawerDescription>
				</DrawerHeader>

				<Tabs
					value={activeMainTab}
					onValueChange={(v) => setActiveMainTab(v as "menu" | "cart")}
					className="flex-1 flex flex-col overflow-hidden lg:hidden"
				>
					<TabsList className="grid w-full grid-cols-2 h-12 bg-muted/30">
						<TabsTrigger value="menu" className="relative">
							Thực đơn
						</TabsTrigger>
						<TabsTrigger value="cart" className="relative">
							Giỏ hàng
							{cartItems.length > 0 && (
								<Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
									{cartItems.length}
								</Badge>
							)}
						</TabsTrigger>
					</TabsList>
					<TabsContent
						value="menu"
						className="flex-1 flex flex-col overflow-hidden mt-0"
					>
						{/* Product Selection Side for Mobile */}
						<div className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
							<div className="relative">
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
								<TabsList className="w-full justify-start mb-3 overflow-x-auto h-auto p-1 bg-muted/50 flex-wrap gap-1">
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

								<TabsContent
									value="all"
									className="flex-1 overflow-hidden mt-0"
								>
									<ScrollArea className="h-full">
										<div className="grid grid-cols-2 gap-2 pr-2 pb-4">
											{isLoading ? (
												<div className="col-span-full text-center py-12">
													<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
												</div>
											) : products.length === 0 ? (
												<p className="col-span-full text-center py-12 text-sm text-muted-foreground">
													Không tìm thấy sản phẩm
												</p>
											) : (
												products.map((product) => {
													const inCart = cart[product.id];
													const isOutOfStock = product.currentStock === 0;

													return (
														<button
															key={product.id}
															type="button"
															className="flex flex-col p-3 border rounded-xl hover:border-primary hover:shadow-sm transition-all bg-card text-left disabled:opacity-50"
															onClick={() => addToCart(product)}
															disabled={isOutOfStock}
														>
															<div className="flex justify-between items-start gap-2 mb-2">
																<h4 className="font-medium text-sm leading-tight line-clamp-2">
																	{product.name}
																</h4>
																{inCart && (
																	<Badge className="shrink-0 h-5 px-1.5 text-[10px]">
																		{inCart.quantity}
																	</Badge>
																)}
															</div>

															<div className="mt-auto flex items-end justify-between gap-2">
																<div className="space-y-0.5">
																	<p className="text-sm font-bold text-primary">
																		{new Intl.NumberFormat("vi-VN").format(
																			product.price,
																		)}{" "}
																		đ
																	</p>
																	<p className="text-[10px] text-muted-foreground">
																		{isOutOfStock
																			? "Hết hàng"
																			: `Còn ${product.currentStock - (inCart?.quantity || 0)} ${product.unit}`}
																	</p>
																</div>

																{!isOutOfStock && (
																	<div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shadow-sm shrink-0">
																		<Plus className="h-4 w-4" />
																	</div>
																)}
															</div>
														</button>
													);
												})
											)}
										</div>
									</ScrollArea>
								</TabsContent>

								{categories?.map((cat) => (
									<TabsContent
										key={cat.id}
										value={cat.id}
										className="flex-1 overflow-hidden mt-0"
									>
										<ScrollArea className="h-full">
											<div className="grid grid-cols-2 gap-2 pr-2 pb-4">
												{products
													.filter((p) => p.categoryId === cat.id)
													.map((product) => {
														const inCart = cart[product.id];
														const isOutOfStock = product.currentStock === 0;

														return (
															<button
																key={product.id}
																type="button"
																className="flex flex-col p-3 border rounded-xl hover:border-primary hover:shadow-sm transition-all bg-card text-left disabled:opacity-50"
																onClick={() => addToCart(product)}
																disabled={isOutOfStock}
															>
																<div className="flex justify-between items-start gap-2 mb-2">
																	<h4 className="font-medium text-sm leading-tight line-clamp-2">
																		{product.name}
																	</h4>
																	{inCart && (
																		<Badge className="shrink-0 h-5 px-1.5 text-[10px]">
																			{inCart.quantity}
																		</Badge>
																	)}
																</div>

																<div className="mt-auto flex items-end justify-between gap-2">
																	<div className="space-y-0.5">
																		<p className="text-sm font-bold text-primary">
																			{new Intl.NumberFormat("vi-VN").format(
																				product.price,
																			)}{" "}
																			đ
																		</p>
																		<p className="text-[10px] text-muted-foreground">
																			{isOutOfStock
																				? "Hết hàng"
																				: `Còn ${product.currentStock - (inCart?.quantity || 0)} ${product.unit}`}
																		</p>
																	</div>

																	{!isOutOfStock && (
																		<div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shadow-sm shrink-0">
																			<Plus className="h-4 w-4" />
																		</div>
																	)}
																</div>
															</button>
														);
													})}
											</div>
										</ScrollArea>
									</TabsContent>
								))}
							</Tabs>
						</div>
					</TabsContent>
					<TabsContent
						value="cart"
						className="flex-1 flex flex-col overflow-hidden mt-0"
					>
						{/* Cart Side for Mobile */}
						<div className="flex-1 flex flex-col bg-muted/10 overflow-hidden">
							<ScrollArea className="flex-1 px-4 py-4">
								{/* Mobile Cart Content (same as desktop cart but adjusted for mobile) */}
								{cartItems.length > 0 ? (
									<div className="space-y-3">
										{cartItems.map((item) => (
											<div
												key={item.id}
												className="flex flex-col gap-2 p-3 rounded-lg bg-background border"
											>
												<div className="flex justify-between items-start gap-2">
													<span className="text-sm font-medium flex-1 leading-tight">
														{item.name}
													</span>
													<Button
														size="icon"
														variant="ghost"
														className="h-6 w-6 -mt-1 -mr-1"
														onClick={() => {
															setCart((prev) => {
																const newCart = { ...prev };
																delete newCart[item.id];
																return newCart;
															});
														}}
													>
														<X className="h-3 w-3" />
													</Button>
												</div>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Button
															size="icon"
															variant="outline"
															className="h-7 w-7 rounded-full"
															onClick={() => removeFromCart(item.id)}
														>
															<Minus className="h-3 w-3" />
														</Button>
														<Input
															type="number"
															min="1"
															max={item.maxStock}
															value={item.quantity}
															onChange={(e) =>
																updateQuantity(item.id, e.target.value)
															}
															className="h-7 w-12 text-center text-xs p-0"
														/>
														<Button
															size="icon"
															variant="outline"
															className="h-7 w-7 rounded-full"
															onClick={() =>
																addToCart({
																	id: item.id,
																	name: item.name,
																	price: item.price,
																	currentStock: item.maxStock,
																	unit: item.unit,
																})
															}
															disabled={item.quantity >= item.maxStock}
														>
															<Plus className="h-3 w-3" />
														</Button>
													</div>
													<span className="text-sm font-bold text-primary">
														{new Intl.NumberFormat("vi-VN").format(
															item.price * item.quantity,
														)}{" "}
														đ
													</span>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
										<ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
										<p className="text-sm font-medium">Chưa có sản phẩm</p>
									</div>
								)}
							</ScrollArea>
							<div className="p-4 bg-background border-t space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium text-muted-foreground">
										Tổng cộng:
									</span>
									<span className="text-lg font-bold text-primary">
										{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
									</span>
								</div>
								<Button
									className="w-full h-11"
									disabled={cartItems.length === 0 || isPending}
									onClick={handleOrder}
								>
									{isPending
										? "Đang xử lý..."
										: `Đặt món (${cartItems.length})`}
								</Button>
							</div>
						</div>
					</TabsContent>
				</Tabs>

				{/* Desktop Layout - Kept side-by-side */}
				<div className="flex-1 hidden lg:flex flex-row gap-0 overflow-hidden">
					{/* Product Selection Side */}
					<div className="flex-1 flex flex-col gap-3 md:gap-4 p-4 md:p-6 lg:border-r overflow-hidden">
						<div className="relative">
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
							<TabsList className="w-full justify-start mb-3 overflow-x-auto h-auto p-1 bg-muted/50 flex-wrap md:flex-nowrap gap-1">
								<TabsTrigger
									value="all"
									className="rounded-full px-4 py-1.5 text-xs md:text-sm whitespace-nowrap"
								>
									Tất cả
								</TabsTrigger>
								{categories?.map((cat) => (
									<TabsTrigger
										key={cat.id}
										value={cat.id}
										className="rounded-full px-4 py-1.5 text-xs md:text-sm whitespace-nowrap"
									>
										{cat.name}
									</TabsTrigger>
								))}
							</TabsList>

							<TabsContent value="all" className="flex-1 overflow-hidden mt-0">
								<ScrollArea className="h-full">
									<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3 pr-2 pb-4">
										{isLoading ? (
											<div className="col-span-full text-center py-12">
												<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
												<p className="mt-3 text-sm text-muted-foreground">
													Đang tải...
												</p>
											</div>
										) : products.length === 0 ? (
											<p className="col-span-full text-center py-12 text-sm text-muted-foreground">
												Không tìm thấy sản phẩm
											</p>
										) : (
											products.map((product) => {
												const inCart = cart[product.id];
												const isOutOfStock = product.currentStock === 0;

												return (
													<button
														key={product.id}
														type="button"
														className="p-3 md:p-4 border rounded-xl hover:border-primary hover:shadow-sm transition-all group relative bg-card text-left disabled:opacity-50 disabled:cursor-not-allowed"
														onClick={() => addToCart(product)}
														disabled={isOutOfStock}
													>
														<h4 className="font-medium text-sm md:text-base pr-8 leading-tight mb-2 line-clamp-2">
															{product.name}
														</h4>

														<p className="text-sm md:text-base font-bold text-primary mb-1">
															{new Intl.NumberFormat("vi-VN").format(
																product.price,
															)}{" "}
															đ
														</p>

														<p
															className={`text-[10px] md:text-xs ${isOutOfStock ? "text-destructive font-medium" : "text-muted-foreground"}`}
														>
															{isOutOfStock
																? "Hết hàng"
																: `Còn ${product.currentStock - inCart?.quantity || 0} ${product.unit}`}
														</p>

														{!isOutOfStock && (
															<span className="absolute top-2 right-2 md:bottom-3 md:top-auto md:right-3 h-7 w-7 md:h-8 md:w-8 rounded-full bg-secondary flex items-center justify-center shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
																<Plus className="h-4 w-4" />
															</span>
														)}
													</button>
												);
											})
										)}
									</div>
								</ScrollArea>
							</TabsContent>

							{categories?.map((cat) => (
								<TabsContent
									key={cat.id}
									value={cat.id}
									className="flex-1 overflow-hidden mt-0"
								>
									<ScrollArea className="h-full">
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3 pr-2 pb-4">
											{products
												.filter((p) => p.categoryId === cat.id)
												.map((product) => {
													const inCart = cart[product.id];
													const isOutOfStock = product.currentStock === 0;

													return (
														<button
															key={product.id}
															type="button"
															className="p-3 md:p-4 border rounded-xl hover:border-primary hover:shadow-sm transition-all group relative bg-card text-left disabled:opacity-50 disabled:cursor-not-allowed"
															onClick={() => addToCart(product)}
															disabled={isOutOfStock}
														>
															<h4 className="font-medium text-sm md:text-base pr-8 leading-tight mb-2 line-clamp-2">
																{product.name}
															</h4>

															<p className="text-sm md:text-base font-bold text-primary mb-1">
																{new Intl.NumberFormat("vi-VN").format(
																	product.price,
																)}{" "}
																đ
															</p>

															<p
																className={`text-[10px] md:text-xs ${isOutOfStock ? "text-destructive font-medium" : "text-muted-foreground"}`}
															>
																{isOutOfStock
																	? "Hết hàng"
																	: `Còn ${product.currentStock} ${product.unit}`}
															</p>

															{inCart && (
																<Badge className="absolute top-2 left-2 h-5 px-2 text-xs">
																	{inCart.quantity}
																</Badge>
															)}

															{!isOutOfStock && (
																<span className="absolute top-2 right-2 md:bottom-3 md:top-auto md:right-3 h-7 w-7 md:h-8 md:w-8 rounded-full bg-secondary flex items-center justify-center shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
																	<Plus className="h-4 w-4" />
																</span>
															)}
														</button>
													);
												})}
										</div>
									</ScrollArea>
								</TabsContent>
							))}
						</Tabs>
					</div>

					{/* Cart Side */}
					<div className="w-full lg:w-80 xl:w-96 flex flex-col border-t lg:border-t-0 bg-muted/30">
						<div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b bg-background">
							<h3 className="font-semibold text-base md:text-lg flex items-center gap-2">
								Giỏ hàng
								<Badge variant="secondary" className="h-5 min-w-5 px-1.5">
									{cartItems.length}
								</Badge>
							</h3>
							{cartItems.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									className="text-xs h-7"
									onClick={() => setCart({})}
								>
									Xóa tất cả
								</Button>
							)}
						</div>

						<ScrollArea className="flex-1 px-4 md:px-6 py-4">
							{cartItems.length > 0 ? (
								<div className="space-y-3">
									{cartItems.map((item) => (
										<div
											key={item.id}
											className="flex flex-col gap-2 p-3 rounded-lg bg-background border"
										>
											<div className="flex justify-between items-start gap-2">
												<span className="text-sm font-medium flex-1 leading-tight">
													{item.name}
												</span>
												<Button
													size="icon"
													variant="ghost"
													className="h-6 w-6 -mt-1 -mr-1 hover:bg-destructive/10 hover:text-destructive"
													onClick={() => {
														setCart((prev) => {
															const newCart = { ...prev };
															delete newCart[item.id];
															return newCart;
														});
													}}
												>
													<X className="h-3 w-3" />
												</Button>
											</div>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Button
														size="icon"
														variant="outline"
														className="h-7 w-7 rounded-full"
														onClick={() => removeFromCart(item.id)}
													>
														<Minus className="h-3 w-3" />
													</Button>
													<Input
														type="number"
														min="1"
														max={item.maxStock}
														value={item.quantity}
														onChange={(e) =>
															updateQuantity(item.id, e.target.value)
														}
														className="h-7 w-14 text-center text-sm font-medium p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
													/>
													<Button
														size="icon"
														variant="outline"
														className="h-7 w-7 rounded-full"
														onClick={() =>
															addToCart({
																id: item.id,
																name: item.name,
																price: item.price,
																currentStock: item.maxStock,
																unit: item.unit,
															})
														}
														disabled={item.quantity >= item.maxStock}
													>
														<Plus className="h-3 w-3" />
													</Button>
												</div>
												<span className="text-sm font-bold text-primary">
													{new Intl.NumberFormat("vi-VN").format(
														item.price * item.quantity,
													)}{" "}
													đ
												</span>
											</div>
											<p className="text-[10px] text-muted-foreground">
												Tối đa: {item.maxStock} {item.unit}
											</p>
										</div>
									))}
								</div>
							) : (
								<div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
									<ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
									<p className="text-sm font-medium">Chưa có sản phẩm</p>
									<p className="text-xs mt-1">Chọn sản phẩm để thêm vào giỏ</p>
								</div>
							)}
						</ScrollArea>

						<div className="p-4 md:p-6 bg-background border-t space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm md:text-base font-medium text-muted-foreground">
									Tổng cộng:
								</span>
								<span className="text-xl md:text-2xl font-bold text-primary">
									{new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
								</span>
							</div>
							<Button
								className="w-full h-11 text-base font-medium"
								disabled={cartItems.length === 0 || isPending}
								onClick={handleOrder}
							>
								{isPending ? (
									<>
										<div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
										Đang xử lý...
									</>
								) : (
									<>
										<ShoppingCart className="h-4 w-4 mr-2" />
										Xác nhận gọi món ({cartItems.length})
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
