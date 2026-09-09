"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { AuthUser } from "@/types";
import { api, ApiError } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoading: boolean; // alias for loading — used by new dashboard
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
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
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(response.user));
          if (response.user.role) {
            Cookies.set("role", response.user.role, {
              expires: 7,
              path: "/",
              sameSite: "lax",
              secure: window.location.protocol === "https:",
            });
          }
        }
      } else {
        setUser(null);
      }
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        Cookies.remove("auth_token", { path: "/" });
        Cookies.remove("role", { path: "/" });
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
      } catch {
        // ignore
      }
    }
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
        if (typeof window !== "undefined") {
          if (res.token) {
            localStorage.setItem("auth_token", res.token);
            const isHttps = window.location.protocol === "https:";
            Cookies.set("auth_token", res.token, {
              expires: 7,
              path: "/",
              sameSite: "lax",
              secure: isHttps,
            });
          }
          if (res.user.role) {
            const isHttps = window.location.protocol === "https:";
            Cookies.set("role", res.user.role, {
              expires: 7,
              path: "/",
              sameSite: "lax",
              secure: isHttps,
            });
          }
          localStorage.setItem("user", JSON.stringify(res.user));
        }
        setUser(res.user);
        refreshUser();
        return { success: true, message: res.message || "Login successful", user: res.user };
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        Cookies.remove("auth_token", { path: "/" });
        Cookies.remove("role", { path: "/" });
      }
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
