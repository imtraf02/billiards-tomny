"use client";

import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { Product } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { useGetProductInventoryLogs } from "../hooks/use-product";

interface InventoryLogsDialogProps {
    product: Product;
}

const reasonLabels: Record<string, string> = {
    purchase: "Nhập hàng",
    return: "Trả lại",
    adjustment: "Điều chỉnh",
    sale: "Bán hàng",
    damaged: "Hư hỏng",
    expired: "Hết hạn",
};

export function InventoryLogsDialog({ product }: InventoryLogsDialogProps) {
    const { data: logs, isLoading } = useGetProductInventoryLogs(product.id);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Xem lịch sử kho">
                    <History className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Lịch sử kho</DialogTitle>
                    <DialogDescription>
                        {product.name} - Tồn kho hiện tại: {product.currentStock}{" "}
                        {product.unit}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            Đang tải...
                        </div>
                    ) : logs && logs.length > 0 ? (
                        <div className="space-y-3">
                            {logs.map((log: any) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 rounded-lg border p-3"
                                >
                                    <div
                                        className={cn(
                                            "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                                            log.type === "IN"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-orange-100 text-orange-600",
                                        )}
                                    >
                                        {log.type === "IN" ? (
                                            <ArrowDownToLine className="h-4 w-4" />
                                        ) : (
                                            <ArrowUpFromLine className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {log.type === "IN" ? "+" : "-"}
                                                    {log.quantity} {product.unit}
                                                </span>
                                                {log.reason && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {reasonLabels[log.reason] || log.reason}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleDateString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {log.stockBefore} → {log.stockAfter} {product.unit}
                                            {log.unitCost && log.type === "IN" && (
                                                <span className="ml-2">
                                                    (
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(log.unitCost)}
                                                    /{product.unit})
                                                </span>
                                            )}
                                        </div>
                                        {log.note && (
                                            <p className="text-sm text-muted-foreground">
                                                {log.note}
                                            </p>
                                        )}
                                        {log.user && (
                                            <p className="text-xs text-muted-foreground">
                                                Bởi: {log.user.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            Chưa có lịch sử nhập/xuất kho
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
