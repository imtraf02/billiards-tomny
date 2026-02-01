// apps/web/components/layout/sidebar.tsx
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tables", icon: TableIcon, label: "Quản lý bàn" },
  { href: "/products", icon: Package, label: "Sản phẩm" },
  { href: "/bookings", icon: Calendar, label: "Đặt bàn" },
  { href: "/orders", icon: ShoppingCart, label: "Đơn hàng" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg">
      <div className="flex h-16 items-center justify-center border-b">
        <h1 className="text-xl font-bold">Billiard Management</h1>
      </div>
      
      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 p-4">
        <Button variant="ghost" className="w-full justify-start text-red-600">
          <LogOut className="mr-3 h-5 w-5" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
