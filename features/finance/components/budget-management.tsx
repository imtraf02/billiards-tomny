"use client";

import { useState } from "react";
import { Plus, Target, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useGetBudgets } from "../hooks/use-finance";

export function BudgetManagement() {
    const { data: budgets, isLoading } = useGetBudgets();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const calculateProgress = (spent: number, budget: number) => {
        return Math.min(100, (spent / budget) * 100);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage <= 70) return "bg-green-500";
        if (percentage <= 90) return "bg-amber-500";
        return "bg-red-500";
    };

    const getStatus = (percentage: number) => {
        if (percentage <= 70) return { label: "Trong ngân sách", color: "text-green-600", bg: "bg-green-100" };
        if (percentage <= 90) return { label: "Sắp vượt", color: "text-amber-600", bg: "bg-amber-100" };
        return { label: "Vượt ngân sách", color: "text-red-600", bg: "bg-red-100" };
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Quản lý Ngân sách</CardTitle>
                            <CardDescription>
                                Theo dõi và quản lý ngân sách chi tiêu
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm ngân sách
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Summary */}
                    <div className="grid gap-4 mb-8 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tổng ngân sách</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(budgets?.summary?.totalBudget || 0)}
                                        </p>
                                    </div>
                                    <Target className="h-8 w-8 text-blue-100 bg-blue-500/20 p-1.5 rounded-full" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Đã chi tiêu</p>
                                        <p className="text-2xl font-bold text-amber-600">
                                            {formatCurrency(budgets?.summary?.totalSpent || 0)}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-amber-100 bg-amber-500/20 p-1.5 rounded-full" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Còn lại</p>
                                        <p className={`text-2xl font-bold ${(budgets?.summary?.remaining || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(budgets?.summary?.remaining || 0)}
                                        </p>
                                    </div>
                                    {budgets?.summary?.remaining >= 0 ? (
                                        <TrendingUp className="h-8 w-8 text-green-100 bg-green-500/20 p-1.5 rounded-full" />
                                    ) : (
                                        <TrendingDown className="h-8 w-8 text-red-100 bg-red-500/20 p-1.5 rounded-full" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Budgets List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Danh mục ngân sách</h3>
                        
                        {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="pt-6">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : budgets?.categories?.length ? (
                            budgets.categories.map((budget: any) => {
                                const percentage = calculateProgress(budget.spent, budget.amount);
                                const status = getStatus(percentage);
                                
                                return (
                                    <Card key={budget.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                                            <h4 className="font-semibold">{budget.category}</h4>
                                                        </div>
                                                        <Badge className={status.bg + " " + status.color}>
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {budget.description}
                                                    </p>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Đã chi: {formatCurrency(budget.spent)}</span>
                                                            <span>Ngân sách: {formatCurrency(budget.amount)}</span>
                                                        </div>
                                                        <Progress 
                                                            value={percentage} 
                                                            className="h-2" 
                                                            indicatorClassName={getProgressColor(percentage)}
                                                        />
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>0%</span>
                                                            <span>{percentage.toFixed(1)}%</span>
                                                            <span>100%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end gap-1 mt-4 sm:mt-0 sm:ml-4">
                                                    <div className="text-2xl font-bold">
                                                        {formatCurrency(budget.amount - budget.spent)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Còn lại
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="text-xs">
                                                            <Calendar className="inline h-3 w-3 mr-1" />
                                                            {budget.period}
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            Chi tiết
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Chưa có ngân sách nào được thiết lập
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Budget Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Giao dịch ngân sách gần đây</CardTitle>
                    <CardDescription>
                        Các khoản chi tiêu ảnh hưởng đến ngân sách
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {budgets?.recentTransactions?.length ? (
                        <div className="space-y-3">
                            {budgets.recentTransactions.map((transaction: any) => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${transaction.categoryColor} bg-opacity-20`}>
                                            <DollarSign className={`h-4 w-4 ${transaction.categoryColor}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {transaction.category} • {new Date(transaction.date).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-red-600">
                                            -{formatCurrency(transaction.amount)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {transaction.budgetCategory}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            Chưa có giao dịch nào
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
