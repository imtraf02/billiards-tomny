"use client";

import { Bell, User, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
          <div className="ml-4 border-l pl-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h2 className="text-sm font-semibold">Xin chào, Admin</h2>
                <p className="text-xs text-gray-500">Chúc bạn một ngày làm việc hiệu quả</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
