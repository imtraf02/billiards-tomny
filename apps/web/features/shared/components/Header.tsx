"use client";

import { Bell, Settings, User, Search } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ThemeToggle } from "@/features/shared/components/theme-toggle";
import { useState } from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-gradient-sidebar px-6 transition-theme">
      {/* Left side - Search bar */}
      <div className="flex items-center gap-4 flex-1">

      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg cursor-pointer"
          title="Cài đặt"
        >
          <Settings className="h-4 w-4" />
        </Button>


      </div>
    </header>
  );
}
