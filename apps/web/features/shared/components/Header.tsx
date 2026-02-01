"use client";

import { useState } from "react";
import { Bell, Settings, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Thêm logic chuyển theme ở đây nếu cần
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="relative w-64">
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full"
          title={darkMode ? "Chuyển sang sáng" : "Chuyển sang tối"}
        >
          {darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>



        {/* Settings */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User profile */}
        <Button variant="ghost" className="gap-2 rounded-full">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium">Admin</div>
            <div className="text-xs text-gray-500">Quản trị viên</div>
          </div>
        </Button>
      </div>
    </header>
  );
}
