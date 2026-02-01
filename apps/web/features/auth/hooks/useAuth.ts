"use client";

import { useState } from "react";
import { authService } from "../services";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    try {
      const user = await authService.login(credentials);
      setUser(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
