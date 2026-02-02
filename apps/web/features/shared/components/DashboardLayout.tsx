"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useState } from "react";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onCollapseChange={setSidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className={`flex-1 p-6 transition-all duration-300 ${
          sidebarCollapsed ? 'pl-[4.5rem]' : 'pl-[17rem]'
        }`}>
          <div className="max-w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
