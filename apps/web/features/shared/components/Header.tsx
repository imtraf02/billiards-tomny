"use client";

import { Bell, Settings, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/features/shared/components/theme-toggle";
import { useState } from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 px-6 transition-theme">
      {/* Left side - Empty or could add page title */}
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-lg font-semibold text-card-foreground hidden md:block">
          Quản lý quán bida
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-lg hover:bg-secondary transition-theme"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="rounded-lg hover:bg-secondary transition-theme">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User profile */}
        <div className="relative group">
          <Button variant="ghost" className="gap-2 rounded-lg hover:bg-secondary transition-theme">
            <div className="h-8 w-8 rounded-full bg-gradient-accent flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-card-foreground">Admin</div>
              <div className="text-xs text-muted-foreground">Quản trị viên</div>
            </div>
          </Button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 transition-theme">
                👤 Hồ sơ
              </button>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/50 transition-theme">
                ⚙️ Cài đặt
              </button>
              <hr className="my-1 border-border" />
              <button className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 transition-theme">
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
