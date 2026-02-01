"use client";

import { useState } from "react";
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
  Menu
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

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";
  const isExpanded = !isCollapsed || isHovered;

  return (
    <div 
      className={`fixed left-0 top-0 z-50 h-screen bg-white shadow-lg transition-all duration-300 ${sidebarWidth}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full flex-col">
        {/* Logo và nút toggle */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {isExpanded ? (
            <h1 className="text-xl font-bold text-blue-700 whitespace-nowrap">Billiard Pro</h1>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">BP</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Menu items */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start ${isExpanded ? '' : 'px-2'} ${
                    isActive ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : ""
                  }`}
                  title={!isExpanded ? item.label : ""}
                >
                  <item.icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
                  {isExpanded && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="border-t p-4">
          <Button 
            variant="ghost" 
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${
              isExpanded ? '' : 'px-2'
            }`}
            title={!isExpanded ? "Đăng xuất" : ""}
          >
            <LogOut className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
            {isExpanded && <span className="whitespace-nowrap">Đăng xuất</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
