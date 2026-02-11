"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	AlertTriangleIcon,
	Minus,
	Plus,
	SearchIcon,
	ShoppingCart,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductDetails } from "@/features/products/types";
import { OrderType } from "@/generated/prisma/enums";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/eden";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MutateOrderInput } from "@/shared/schemas/order";
import type { OrderDetails } from "../types";

interface OrdersMutateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow?: OrderDetails;
	sessionId?: string;
}

export default function OrdersMutateDialog({
	open,
	onOpenChange,
	currentRow,
	sessionId,
}: OrdersMutateDialogProps) {
	const [searchProduct, setSearchProduct] = useState("");
	const [selectedProducts, setSelectedProducts] = useState(
		currentRow?.products.map((p) => ({
			productId: p.id,
			quantity: p.quantity,
		})) || [],
	);
	const [category, setCategory] = useState("Tất cả");
	const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");
	const isMobile = useIsMobile();

	const isEdit = !!currentRow;

	const { data: productsResponse, isLoading } = useQuery({
		queryKey: ["products"],
		queryFn: async () => await api.products.get(),
		enabled: open,
	});

	const { data: categoriesResponse } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => await api.products.categories.get(),
		enabled: open,
	});

	const products = productsResponse?.data || [];

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: MutateOrderInput) => await api.order.post(data),
		onSuccess: () => {
			onOpenChange(false);
			setSelectedProducts([]);
			setSearchProduct("");
			setMobileTab("products");
		},
		onError: (error) => {},
	});

	const filteredProducts = useMemo(() => {
		if (!products) return [];
		if (!searchProduct && category === "Tất cả") return products;
		return products.filter(
			(p) =>
				p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
				(category === "Tất cả" || p.category.name === category),
		);
	}, [products, searchProduct, category]);

	const addProduct = (productId: string) => {
		const existingProduct = selectedProducts.find(
			(p) => p.productId === productId,
		);

		if (existingProduct) {
			setSelectedProducts(
				selectedProducts.map((p) =>
					p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p,
				),
			);
		} else {
			setSelectedProducts([...selectedProducts, { productId, quantity: 1 }]);
		}

		// Only switch to cart tab on mobile
		if (isMobile) {
			setMobileTab("cart");
		}
	};

	const updateQuantity = (productId: string, change: number) => {
		const newProducts = selectedProducts
			.map((p) =>
				p.productId === productId
					? { ...p, quantity: Math.max(0, p.quantity + change) }
					: p,
			)
			.filter((p) => p.quantity > 0);

		setSelectedProducts(newProducts);
	};

	const setQuantity = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			setSelectedProducts(
				selectedProducts.filter((p) => p.productId !== productId),
			);
		} else {
			const existingProduct = selectedProducts.find(
				(p) => p.productId === productId,
			);
			if (existingProduct) {
				setSelectedProducts(
					selectedProducts.map((p) =>
						p.productId === productId ? { ...p, quantity } : p,
					),
				);
			} else {
				setSelectedProducts([...selectedProducts, { productId, quantity }]);
			}
		}
	};

	const removeProduct = (productId: string) => {
		setSelectedProducts(
			selectedProducts.filter((p) => p.productId !== productId),
		);
	};

	const handleSubmit = () => {
		mutate({
			orderId: currentRow?.id,
			sessionId: sessionId,
			type: currentRow?.type
				? currentRow.type
				: sessionId
					? OrderType.SESSION
					: OrderType.WALK_IN,
			products: selectedProducts,
		});
	};

	// Tính toán chi tiết
	const cartItems = selectedProducts.map((sp) => {
		const product = products.find((p) => p.id === sp.productId);
		return {
			...sp,
			product,
			subtotal: (product?.price || 0) * sp.quantity,
		};
	});

	const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

	return (
		<Drawer
			open={open}
			onOpenChange={(v) => {
				onOpenChange(v);
				if (!v) {
					setSelectedProducts([]);
					setSearchProduct("");
					setMobileTab("products");
				}
			}}
		>
			<DrawerContent className="min-h-[80vh]">
				<DrawerHeader>
					<DrawerTitle>Giỏ hàng</DrawerTitle>
				</DrawerHeader>

				{isMobile ? (
					// Mobile Version
					<div className="flex-1 flex flex-col">
						<Tabs
							value={mobileTab}
							onValueChange={(v) => setMobileTab(v as "products" | "cart")}
							className="flex-1 flex flex-col"
						>
							<TabsList className="grid w-full grid-cols-2 mx-4">
								<TabsTrigger value="products" className="relative">
									Sản phẩm
								</TabsTrigger>
								<TabsTrigger value="cart" className="relative">
									Giỏ hàng
									{selectedProducts.length > 0 && (
										<Badge className="ml-2 h-5 min-w-5 px-1.5">
											{selectedProducts.length}
										</Badge>
									)}
								</TabsTrigger>
							</TabsList>

							<TabsContent
								value="products"
								className="flex-1 flex flex-col mt-0"
							>
								<div className="flex items-center gap-2 p-3 border-b">
									<InputGroup className="flex-1">
										<InputGroupInput
											placeholder="Tìm kiếm..."
											value={searchProduct}
											onChange={(e) => setSearchProduct(e.target.value)}
										/>
										<InputGroupAddon align="inline-start">
											<SearchIcon className="text-muted-foreground h-4 w-4" />
										</InputGroupAddon>
									</InputGroup>
									<Select value={category} onValueChange={setCategory}>
										<SelectTrigger className="w-28">
											<SelectValue placeholder="Danh mục">
												{category}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Tất cả">Tất cả</SelectItem>
											{categoriesResponse?.data?.map((cat) => (
												<SelectItem key={cat.id} value={cat.name}>
													{cat.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<ScrollArea className="flex-1 scroll-y-auto">
									<div className="p-3">
										{isLoading ? (
											<div className="text-center py-12 text-muted-foreground">
												<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
												Đang tải sản phẩm...
											</div>
										) : filteredProducts.length === 0 ? (
											<div className="text-center py-12 text-muted-foreground">
												<SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
												<p className="font-medium">Không tìm thấy sản phẩm</p>
												<p className="text-sm mt-1">
													Thử tìm kiếm với từ khóa khác
												</p>
											</div>
										) : (
											<ul className="grid grid-cols-1 gap-3">
												{filteredProducts.map((product) => {
													const selectedProduct = selectedProducts.find(
														(p) => p.productId === product.id,
													);
													const quantity = selectedProduct?.quantity || 0;
													const totalStock = product.batches.reduce(
														(sum, batch) => sum + batch.quantity,
														0,
													);

													return (
														<ProductCard
															key={product.id}
															product={product}
															quantity={quantity}
															totalStock={totalStock}
															onAdd={() => addProduct(product.id)}
														/>
													);
												})}
											</ul>
										)}
									</div>
								</ScrollArea>
							</TabsContent>

							<TabsContent
								value="cart"
								className="flex-1 flex flex-col mt-0 overflow-hidden"
							>
								<ScrollArea className="flex-1 scroll-y-auto">
									<div className="p-4 space-y-3">
										{selectedProducts.length === 0 ? (
											<div className="text-center py-12 text-muted-foreground">
												<ShoppingCart className="size-16 mx-auto mb-4 opacity-20" />
												<p className="font-medium">Giỏ hàng trống</p>
												<p className="text-sm mt-1">
													Chọn sản phẩm để thêm vào giỏ
												</p>
												<Button
													variant="outline"
													className="mt-4"
													onClick={() => setMobileTab("products")}
												>
													Chọn sản phẩm
												</Button>
											</div>
										) : (
											cartItems.map((item) => {
												if (!item.product) return null;

												const totalStock = item.product.batches.reduce(
													(sum, batch) => sum + batch.quantity,
													0,
												);
												const exceedsStock = item.quantity > totalStock;

												return (
													<CartItem
														key={item.productId}
														item={item}
														totalStock={totalStock}
														exceedsStock={exceedsStock}
														onUpdateQuantity={(change) =>
															updateQuantity(item.productId, change)
														}
														onSetQuantity={(qty) =>
															setQuantity(item.productId, qty)
														}
														onRemove={() => removeProduct(item.productId)}
													/>
												);
											})
										)}
									</div>
								</ScrollArea>

								{/* Mobile Summary */}
								{selectedProducts.length > 0 && (
									<div className="p-4 border-t bg-background space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-base font-semibold">
												Tổng tiền:
											</span>
											<span className="text-2xl font-bold text-primary">
												{totalAmount.toLocaleString("vi-VN")}đ
											</span>
										</div>

										<div className="flex gap-2 pt-2">
											<DrawerClose asChild>
												<Button
													variant="outline"
													className="flex-1"
													disabled={isPending}
												>
													Hủy
												</Button>
											</DrawerClose>
											<Button
												onClick={handleSubmit}
												disabled={selectedProducts.length === 0 || isPending}
												className="flex-1"
											>
												{isPending
													? "Đang xử lý..."
													: isEdit
														? "Cập nhật"
														: "Tạo đơn"}
											</Button>
										</div>
									</div>
								)}
							</TabsContent>
						</Tabs>
					</div>
				) : (
					// Desktop Version
					<div className="flex-1 flex overflow-hidden">
						<div className="flex-1 flex flex-col border-r">
							<div className="flex items-center gap-2 p-3">
								<InputGroup>
									<InputGroupInput
										placeholder="Tìm kiếm..."
										value={searchProduct}
										onChange={(e) => setSearchProduct(e.target.value)}
									/>
									<InputGroupAddon align="inline-start">
										<SearchIcon className="text-muted-foreground h-4 w-4" />
									</InputGroupAddon>
								</InputGroup>
								<Select value={category} onValueChange={setCategory}>
									<SelectTrigger className="w-36">
										<SelectValue placeholder="Chọn danh mục">
											{category}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Tất cả">Tất cả</SelectItem>
										{categoriesResponse?.data?.map((cat) => (
											<SelectItem key={cat.id} value={cat.name}>
												{cat.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<ScrollArea className="flex-1 overflow-y-auto">
								<div className="p-3">
									{isLoading ? (
										<div className="text-center py-12 text-muted-foreground">
											<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
											Đang tải sản phẩm...
										</div>
									) : filteredProducts.length === 0 ? (
										<div className="text-center py-12 text-muted-foreground">
											<SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
											<p className="font-medium">Không tìm thấy sản phẩm</p>
											<p className="text-sm mt-1">
												Thử tìm kiếm với từ khóa khác
											</p>
										</div>
									) : (
										<ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
											{filteredProducts.map((product) => {
												const selectedProduct = selectedProducts.find(
													(p) => p.productId === product.id,
												);
												const quantity = selectedProduct?.quantity || 0;
												const totalStock = product.batches.reduce(
													(sum, batch) => sum + batch.quantity,
													0,
												);

												return (
													<ProductCard
														key={product.id}
														product={product}
														quantity={quantity}
														totalStock={totalStock}
														onAdd={() => addProduct(product.id)}
													/>
												);
											})}
										</ul>
									)}
								</div>
							</ScrollArea>
						</div>

						<div className="w-100 flex flex-col bg-muted/20">
							<div className="p-4 border-b bg-background">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<ShoppingCart className="h-5 w-5 text-primary" />
										<h3 className="font-semibold text-lg">Giỏ hàng</h3>
									</div>
									<Badge variant="secondary" className="font-semibold">
										{selectedProducts.length} SP
									</Badge>
								</div>
							</div>

							<ScrollArea className="flex-1 overflow-y-auto">
								<div className="p-4 space-y-3">
									{selectedProducts.length === 0 ? (
										<div className="text-center py-12 text-muted-foreground">
											<ShoppingCart className="size-16 mx-auto mb-4 opacity-20" />
											<p className="font-medium">Giỏ hàng trống</p>
											<p className="text-sm mt-1">
												Chọn sản phẩm bên trái để thêm vào giỏ
											</p>
										</div>
									) : (
										cartItems.map((item) => {
											if (!item.product) return null;

											const totalStock = item.product.batches.reduce(
												(sum, batch) => sum + batch.quantity,
												0,
											);
											const exceedsStock = item.quantity > totalStock;

											return (
												<CartItem
													key={item.productId}
													item={item}
													totalStock={totalStock}
													exceedsStock={exceedsStock}
													onUpdateQuantity={(change) =>
														updateQuantity(item.productId, change)
													}
													onSetQuantity={(qty) =>
														setQuantity(item.productId, qty)
													}
													onRemove={() => removeProduct(item.productId)}
												/>
											);
										})
									)}
								</div>
							</ScrollArea>

							{/* Summary */}
							<div className="p-4 border-t bg-background space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-base font-semibold">Tổng tiền:</span>
									<span className="text-2xl font-bold text-primary">
										{totalAmount.toLocaleString("vi-VN")}đ
									</span>
								</div>

								<div className="flex gap-2 pt-2">
									<DrawerClose asChild>
										<Button
											variant="outline"
											className="flex-1"
											disabled={isPending}
										>
											Hủy
										</Button>
									</DrawerClose>
									<Button
										onClick={handleSubmit}
										disabled={selectedProducts.length === 0 || isPending}
										className="flex-1"
									>
										{isPending
											? "Đang xử lý..."
											: isEdit
												? "Cập nhật"
												: "Tạo đơn"}
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
}

function CartItem({
	item,
	totalStock,
	exceedsStock,
	onUpdateQuantity,
	onSetQuantity,
	onRemove,
}: {
	item: {
		productId: string;
		quantity: number;
		product?: ProductDetails;
		subtotal: number;
	};
	totalStock: number;
	exceedsStock: boolean;
	onUpdateQuantity: (change: number) => void;
	onSetQuantity: (quantity: number) => void;
	onRemove: () => void;
}) {
	if (!item.product) return null;

	return (
		<div
			className={`
			p-3 border-2 rounded-lg bg-background
			${exceedsStock ? "border-destructive" : "border-border"}
		`}
		>
			<div className="space-y-3">
				{/* Product Header */}
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<h4 className="font-medium text-sm line-clamp-2">
							{item.product.name}
						</h4>
						<p className="text-xs text-muted-foreground mt-0.5">
							{item.product.price.toLocaleString("vi-VN")}đ/{item.product.unit}
						</p>
					</div>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
						onClick={onRemove}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* Quantity Control */}
				<div className="flex items-center gap-2">
					<Button
						type="button"
						size="icon"
						variant="outline"
						className="h-8 w-8 shrink-0"
						onClick={() => onUpdateQuantity(-1)}
					>
						<Minus className="h-3.5 w-3.5" />
					</Button>

					<Input
						type="number"
						min="1"
						max={totalStock}
						value={item.quantity}
						onChange={(e) => {
							const val = parseInt(e.target.value, 10) || 0;
							onSetQuantity(val);
						}}
						className={`
							h-8 text-center font-semibold text-sm
							[appearance:textfield]
							[&::-webkit-outer-spin-button]:appearance-none
							[&::-webkit-inner-spin-button]:appearance-none
							${exceedsStock ? "border-destructive" : ""}
						`}
					/>

					<Button
						type="button"
						size="icon"
						variant="outline"
						className="h-8 w-8 shrink-0"
						onClick={() => onUpdateQuantity(1)}
						disabled={item.quantity >= totalStock}
					>
						<Plus className="h-3.5 w-3.5" />
					</Button>
				</div>

				{/* Subtotal & Stock Info */}
				<div className="flex items-center justify-between pt-2 border-t">
					<div>
						<p className="text-xs text-muted-foreground">Thành tiền</p>
						<p className="text-sm font-bold text-primary">
							{item.subtotal.toLocaleString("vi-VN")}đ
						</p>
					</div>
					<div className="text-right">
						<p className="text-xs text-muted-foreground">Tồn kho</p>
						<p
							className={`text-sm font-medium ${
								exceedsStock ? "text-destructive" : "text-muted-foreground"
							}`}
						>
							{totalStock} {item.product.unit}
						</p>
					</div>
				</div>

				{/* Warning */}
				{exceedsStock && (
					<div className="flex items-center gap-1.5 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
						<AlertTriangleIcon className="text-destructive" />
						<p className="text-xs font-medium text-destructive">
							Vượt quá tồn kho!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function ProductCard({
	product,
	quantity,
	totalStock,
	onAdd,
}: {
	product: ProductDetails;
	quantity: number;
	totalStock: number;
	onAdd: () => void;
}) {
	return (
		<li
			className={cn(
				"relative rounded-lg border p-2 hover:shadow-md cursor-pointer",
				{
					"outline-2 outline-primary bg-primary/5 shadow-md": quantity > 0,
					"opacity-50": !totalStock,
				},
			)}
			onClick={onAdd}
		>
			{quantity > 0 && (
				<Badge className="absolute top-0.5 right-0.5 rounded-md">
					{quantity}
				</Badge>
			)}
			<h4 className="font-semibold text-sm line-clamp-2 mb-1.5">
				{product.name}
			</h4>
			<div className="space-y-1 text-sm text-muted-foreground mt-1">
				<div className="flex justify-between">
					<span>Đơn giá</span>
					<span>
						{formatVND(product.price)} / {product.unit}
					</span>
				</div>
				<div className="flex justify-between">
					<span>Tồn kho</span>
					<span
						className={cn({
							"text-destructive":
								totalStock > 0 && totalStock <= product.minStock,
						})}
					>
						{totalStock}
					</span>
				</div>
			</div>
		</li>
	);
}
