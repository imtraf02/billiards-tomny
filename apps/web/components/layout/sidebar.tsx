import Link from 'next/link';
import { Home, Table, Package, Calendar, ShoppingCart, Folder } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/tables', icon: Table, label: 'Bàn' },
  { href: '/products', icon: Package, label: 'Sản phẩm' },
  { href: '/bookings', icon: Calendar, label: 'Đặt bàn' },
  { href: '/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { href: '/categories', icon: Folder, label: 'Danh mục' },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
