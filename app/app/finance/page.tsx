"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ModeSwitcher } from "@/components/mode-switcher";
import { FinanceDashboard } from "@/features/finance/components/finance-dashboard";

export default function FinancePage() {
    return (
        <>
            <Header>
                <Search />
                <div className="ms-auto flex items-center space-x-4">
                    <ModeSwitcher />
                </div>
            </Header>
            <Main>
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight">Quản lý Tài chính</h1>
                        <p className="text-muted-foreground">
                            Theo dõi doanh thu, chi phí, lợi nhuận và quản lý công nợ.
                        </p>
                    </div>
                    <FinanceDashboard />
                </div>
            </Main>
        </>
    );
}
