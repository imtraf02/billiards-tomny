"use client";

import { useState } from "react";
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    CreditCard,
    Calendar,
    Download,
    Filter,
    BarChart3,
    PieChart,
    FileText,
    Users,
    Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetFinancialSummary } from "../hooks/use-finance";
import { RevenueChart } from "./revenue-chart";
import { ExpenseChart } from "./expense-chart";
import { ProfitProductChart } from "./profit-product-chart";
import { DailyTransactions } from "./daily-transactions";
import { DebtManagement } from "./debt-management";
import { BudgetManagement } from "./budget-management";

export function FinanceDashboard() {
    const [timeRange, setTimeRange] = useState<string>("TODAY");
    const [activeTab, setActiveTab] = useState<string>("overview");

    const { data: financialData, isLoading } = useGetFinancialSummary({
        timeRange: timeRange !== "CUSTOM" ? timeRange : undefined,
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header với filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="mr-2 h-4 w-4 opacity-50" />
                            <SelectValue placeholder="Thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TODAY">Hôm nay</SelectItem>
                            <SelectItem value="YESTERDAY">Hôm qua</SelectItem>
                            <SelectItem value="WEEK">Tuần này</SelectItem>
                            <SelectItem value="MONTH">Tháng này</SelectItem>
                            <SelectItem value="QUARTER">Quý này</SelectItem>
                            <SelectItem value="YEAR">Năm nay</SelectItem>
                            <SelectItem value="CUSTOM">Tùy chỉnh</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Tabs chính */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger value="transactions">
                        <FileText className="mr-2 h-4 w-4" />
                        Thu chi
                    </TabsTrigger>
                    <TabsTrigger value="debts">
                        <Users className="mr-2 h-4 w-4" />
                        Công nợ
                    </TabsTrigger>
                    <TabsTrigger value="budget">
                        <Wallet className="mr-2 h-4 w-4" />
                        Ngân sách
                    </TabsTrigger>
                    <TabsTrigger value="profit">
                        <PieChart className="mr-2 h-4 w-4" />
                        Lợi nhuận
                    </TabsTrigger>
                </TabsList>

                {/* Tab Tổng quan */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Thống kê nhanh */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tổng doanh thu
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : formatCurrency(financialData?.totalRevenue || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +12.5% so với kỳ trước
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tổng chi phí
                                </CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : formatCurrency(financialData?.totalExpense || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    +8.2% so với kỳ trước
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Lợi nhuận
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${(financialData?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {isLoading ? "..." : formatCurrency(financialData?.profit || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Tỷ suất lợi nhuận: {(financialData?.profitMargin || 0).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Tổng công nợ
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {isLoading ? "..." : formatCurrency(financialData?.totalDebt || 0)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {financialData?.debtCount || 0} khoản nợ
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Biểu đồ */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Doanh thu theo thời gian</CardTitle>
                                <CardDescription>
                                    Biểu đồ doanh thu 7 ngày gần nhất
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <RevenueChart data={financialData?.revenueChart || []} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Phân bổ chi phí</CardTitle>
                                <CardDescription>
                                    Chi phí theo danh mục
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ExpenseChart data={financialData?.expenseChart || []} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top sản phẩm lợi nhuận */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top 5 sản phẩm lợi nhuận cao nhất</CardTitle>
                            <CardDescription>
                                Sản phẩm có tỷ suất lợi nhuận tốt nhất
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfitProductChart data={financialData?.topProducts || []} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Thu chi hàng ngày */}
                <TabsContent value="transactions">
                    <DailyTransactions />
                </TabsContent>

                {/* Tab Công nợ */}
                <TabsContent value="debts">
                    <DebtManagement />
                </TabsContent>

                {/* Tab Ngân sách */}
                <TabsContent value="budget">
                    <BudgetManagement />
                </TabsContent>

                {/* Tab Lợi nhuận chi tiết */}
                <TabsContent value="profit" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lợi nhuận theo sản phẩm</CardTitle>
                            <CardDescription>
                                Chi tiết lãi/lỗ từng sản phẩm
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfitProductChart 
                                data={financialData?.profitByProduct || []} 
                                showDetails={true}
                            />
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lợi nhuận theo danh mục</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {financialData?.profitByCategory?.map((item: any) => (
                                        <div key={item.category} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span>{item.category}</span>
                                            </div>
                                            <span className={`font-medium ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(item.profit)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Chi phí cố định</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {financialData?.fixedExpenses?.map((expense: any) => (
                                        <div key={expense.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{expense.name}</p>
                                                <p className="text-sm text-muted-foreground">{expense.description}</p>
                                            </div>
                                            <span className="text-red-600 font-medium">
                                                {formatCurrency(expense.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
