"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/features/auth/hooks/use-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>;
    </ThemeProvider>
  );
}
