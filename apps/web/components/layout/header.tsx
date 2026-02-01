// apps/web/components/layout/header.tsx
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">Xin chào, Admin</h2>
            <p className="text-sm text-gray-500">Chúc bạn một ngày làm việc hiệu quả</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
