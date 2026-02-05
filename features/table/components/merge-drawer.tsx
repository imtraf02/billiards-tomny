"use client";

import { format } from "date-fns";
import { Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { BookingDetails } from "../types";

interface MergeDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	otherBookings: BookingDetails[];
	selectedTargetId: string | null;
	onSelectTarget: (id: string) => void;
	onConfirm: () => void;
	isLoading: boolean;
}

export function MergeDrawer({
	open,
	onOpenChange,
	otherBookings,
	selectedTargetId,
	onSelectTarget,
	onConfirm,
	isLoading,
}: MergeDrawerProps) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="mx-auto h-[70vh] flex flex-col">
				<DrawerHeader>
					<DrawerTitle>Chọn bàn muốn gộp vào</DrawerTitle>
					<DrawerDescription>
						Tất cả các món và giờ chơi của bàn hiện tại sẽ được chuyển sang bàn
						được chọn.
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
					{otherBookings.length === 0 ? (
						<p className="text-center py-8 text-sm text-muted-foreground">
							Không có bàn nào khác đang hoạt động.
						</p>
					) : (
						<div className="space-y-2 overflow-y-auto">
							{otherBookings.map((b) => {
								const bookingTotal = (b.orders || []).reduce(
									(acc, o) => acc + Number(o.totalAmount || 0),
									0,
								);
								const allItems = (b.orders || []).flatMap(
									(o) => o.orderItems || [],
								);

								return (
									<button
										key={b.id}
										type="button"
										className={cn(
											"w-full text-left p-3 rounded-lg border transition-all hover:bg-muted font-normal",
											selectedTargetId === b.id &&
												"border-primary bg-primary/5 ring-1 ring-primary",
										)}
										onClick={() => onSelectTarget(b.id)}
									>
										<div className="flex justify-between items-start">
											<div className="space-y-1">
												<p className="font-bold text-sm">
													{b?.bookingTables
														?.map((bt) => bt.table.name)
														.join(", ")}
												</p>
												<p className="text-[10px] text-muted-foreground flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{format(new Date(b.startTime), "HH:mm, dd/MM")}
												</p>
											</div>
											<div className="text-right space-y-1">
												<p className="font-bold text-sm text-primary">
													{new Intl.NumberFormat("vi-VN").format(bookingTotal)}{" "}
													đ
												</p>
												<Badge variant="secondary" className="text-[10px] h-4">
													{b.orders?.length || 0} đơn
												</Badge>
											</div>
										</div>

										{allItems.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-1">
												{allItems.slice(0, 3).map((item) => (
													<Badge
														key={item.id}
														variant="outline"
														className="text-[10px] py-0 h-4 font-normal bg-muted/20"
													>
														{item.product?.name} x{item.quantity}
													</Badge>
												))}
												{allItems.length > 3 && (
													<span className="text-[10px] text-muted-foreground">
														...
													</span>
												)}
											</div>
										)}
									</button>
								);
							})}
						</div>
					)}

					<div className="mt-4 flex flex-col gap-2">
						<Button
							className="w-full"
							disabled={!selectedTargetId || isLoading}
							onClick={onConfirm}
						>
							{isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
							Xác nhận gộp bill
						</Button>
						<Button
							variant="ghost"
							className="w-full"
							onClick={() => onOpenChange(false)}
						>
							Hủy
						</Button>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
