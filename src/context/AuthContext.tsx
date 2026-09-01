"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser } from "@/types";
import { api, ApiError } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoading: boolean; // alias for loading — used by new dashboard
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // New dashboard fields
  customRole: string | null;
  setCustomRole: (role: string | null) => void;
  toast: { type: string; message: string } | null;
  clearToast: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [customRole, setCustomRole] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; user: AuthUser }>("/api/users/me");
      if (response && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await api.post("/api/users/login", {
        email: identifier,
        studentId: identifier,
        identifier,
        password
      });
      if (res && res.user) {
        setUser(res.user);
        // also refresh full profile in background
        refreshUser();
        return { success: true, message: res.message || "Login successful" };
      }
      return { success: false, message: res.message || "Failed to login" };
    } catch (err: any) {
      const message =
        err instanceof ApiError ? err.message : err?.message || "Invalid credentials or network error";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/users/logout");
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoading: loading, // alias
        login,
        logout,
        refreshUser,
        isAuthenticated,
        isAdmin,
        customRole,
        setCustomRole,
        toast,
        clearToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
