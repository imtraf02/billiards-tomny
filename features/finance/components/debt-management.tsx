"use client";

import { useState } from "react";
import { Plus, Filter, Search, User, Building, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetDebts } from "../hooks/use-finance";

export function DebtManagement() {
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    const { data: debtsData, isLoading } = useGetDebts({
        page,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: searchTerm || undefined,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getDaysRemaining = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Quản lý Công nợ</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Theo dõi công nợ với nhà cung cấp và khách hàng
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm công nợ
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm theo tên, mô tả..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Loại công nợ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả loại</SelectItem>
                            <SelectItem value="RECEIVABLE">Phải thu</SelectItem>
                            <SelectItem value="PAYABLE">Phải trả</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="PENDING">Đang chờ</SelectItem>
                            <SelectItem value="OVERDUE">Quá hạn</SelectItem>
                            <SelectItem value="PAID">Đã thanh toán</SelectItem>
                            <SelectItem value="PARTIAL">Thanh toán một phần</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 mb-6 sm:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tổng phải thu</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(debtsData?.summary?.receivable || 0)}
                                    </p>
                                </div>
                                <User className="h-8 w-8 text-green-100 bg-green-500/20 p-1.5 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tổng phải trả</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(debtsData?.summary?.payable || 0)}
                                    </p>
                                </div>
                                <Building className="h-8 w-8 text-red-100 bg-red-500/20 p-1.5 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Quá hạn</p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {formatCurrency(debtsData?.summary?.overdue || 0)}
                                    </p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-amber-100 bg-amber-500/20 p-1.5 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Debts Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Đối tượng</TableHead>
                                <TableHead>Loại</TableHead>
                                <TableHead>Số tiền</TableHead>
                                <TableHead>Ngày đến hạn</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></TableCell>
                                        <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse w-20 ml-auto"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : debtsData?.data?.length ? (
                                debtsData.data.map((debt: any) => {
                                    const daysRemaining = getDaysRemaining(debt.dueDate);
                                    const isOverdue = daysRemaining < 0;
                                    
                                    return (
                                        <TableRow key={debt.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {debt.type === 'RECEIVABLE' ? (
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{debt.contactName}</p>
                                                        <p className="text-sm text-muted-foreground">{debt.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={debt.type === 'RECEIVABLE' ? 'default' : 'secondary'}
                                                >
                                                    {debt.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(debt.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span>{formatDate(debt.dueDate)}</span>
                                                    {isOverdue ? (
                                                        <Badge variant="destructive" className="ml-2">
                                                            Quá hạn {-daysRemaining} ngày
                                                        </Badge>
                                                    ) : daysRemaining <= 3 ? (
                                                        <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700">
                                                            Còn {daysRemaining} ngày
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={
                                                        debt.status === 'PAID' ? 'default' :
                                                        debt.status === 'OVERDUE' ? 'destructive' :
                                                        debt.status === 'PARTIAL' ? 'secondary' : 'outline'
                                                    }
                                                >
                                                    {debt.status === 'PENDING' ? 'Đang chờ' :
                                                     debt.status === 'OVERDUE' ? 'Quá hạn' :
                                                     debt.status === 'PAID' ? 'Đã thanh toán' : 'Thanh toán một phần'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">
                                                    Ghi nhận thanh toán
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Không có công nợ nào
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {debtsData?.meta && debtsData.meta.totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 pt-4">
                        <div className="text-sm text-muted-foreground">
                            Trang {page} / {debtsData.meta.totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Trước
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(debtsData.meta.totalPages, p + 1))}
                            disabled={page === debtsData.meta.totalPages}
                        >
                            Tiếp
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
