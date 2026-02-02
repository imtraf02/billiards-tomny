"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Table as TableIcon,
  Package,
  Calendar,
  ShoppingCart,
  LogOut,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tables", icon: TableIcon, label: "Bàn" },
  { href: "/products", icon: Package, label: "Sản phẩm" },
  { href: "/bookings", icon: Calendar, label: "Đặt bàn" },
  { href: "/orders", icon: ShoppingCart, label: "Đơn hàng" },
  { href: "/categories", icon: Grid3X3, label: "Danh mục" },
];

type SidebarProps = {
  collapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
};

export function Sidebar({ collapsed, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();

  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-screen bg-gradient-sidebar border-r border-border shadow-lg transition-all duration-300 ${sidebarWidth}`}
    >
      <div className="flex h-full flex-col">
        {/* Logo + Toggle */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed ? (
            <h1 className="text-xl font-bold text-gradient-primary whitespace-nowrap">
              Billiard Pro
            </h1>
          ) : (
            <div className="w-8 h-8 rounded-lg  flex items-center justify-center">
              <span className=" font-bold text-lg">
                🎱
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-secondary/50 transition-theme"
            onClick={() => onCollapseChange(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname?.startsWith(`${item.href}/`);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start cursor-pointer transition-theme ${
                    collapsed ? "px-2" : ""
                  } ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-foreground/80 hover:text-foreground hover:bg-secondary/50"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      collapsed ? "" : "mr-3"
                    } ${isActive ? "text-primary" : ""}`}
                  />
                  {!collapsed && (
                    <span className="whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4 ">
          <Button
            variant="ghost"
            className={`w-full justify-start text-destructive cursor-pointer hover:text-destructive hover:bg-destructive/10 transition-theme ${
              collapsed ? "px-2" : ""
            }`}
            title={collapsed ? "Đăng xuất" : undefined}
          >
            <LogOut className={`h-5 w-5 ${collapsed ? "" : "mr-3"}`} />
            {!collapsed && (
              <span className="whitespace-nowrap">Đăng xuất</span>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}

