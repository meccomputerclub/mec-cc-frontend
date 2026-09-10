"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import { AuthUser } from "@/types";
import { api, ApiError } from "@/lib/api";

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  requiresSecurityCode?: boolean;
  isLocked?: boolean;
  lockRemainingMinutes?: number;
  isDeviceBlocked?: boolean;
  attemptsRemaining?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoading: boolean; // alias for loading — used by new dashboard
  login: (identifier: string, password: string, securityCode?: string) => Promise<LoginResponse>;
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

// Synchronize token and role into document.cookie with 7-day expiration
const syncAuthCookie = (rawToken: string | null, role?: string | null): boolean => {
  if (typeof window === "undefined" || !rawToken) return false;
  const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7).trim() : rawToken.trim();
  if (!token) return false;

  try {
    const decoded = decodeJwt(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      // Token expired
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      Cookies.remove("auth_token", { path: "/" });
      Cookies.remove("role", { path: "/" });
      return false;
    }

    const isHttps = window.location.protocol === "https:";
    Cookies.set("auth_token", token, {
      expires: 7,
      path: "/",
      sameSite: "lax",
      secure: isHttps,
    });

    const userRole = role || (decoded.role as string) || "member";
    Cookies.set("role", userRole, {
      expires: 7,
      path: "/",
      sameSite: "lax",
      secure: isHttps,
    });
    return true;
  } catch {
    return false;
  }
};

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
      const storedToken = typeof window !== "undefined"
        ? localStorage.getItem("auth_token") || Cookies.get("auth_token")
        : null;

      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Ensure cookie is in sync before calling backend
      const isValid = syncAuthCookie(storedToken);
      if (!isValid) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get<{ success: boolean; user: AuthUser }>("/api/users/me");
      if (response && response.user) {
        setUser(response.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(response.user));
          syncAuthCookie(storedToken, response.user.role);
        }
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          Cookies.remove("auth_token", { path: "/" });
          Cookies.remove("role", { path: "/" });
        }
        setUser(null);
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          Cookies.remove("auth_token", { path: "/" });
          Cookies.remove("role", { path: "/" });
        }
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cachedToken = localStorage.getItem("auth_token") || Cookies.get("auth_token");
        const cachedUserStr = localStorage.getItem("user");
        const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;

        if (cachedToken) {
          const isValid = syncAuthCookie(cachedToken, cachedUser?.role);
          if (isValid && cachedUser) {
            setUser(cachedUser);
          } else if (!isValid) {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        // ignore
      }
    }
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string, securityCode?: string): Promise<LoginResponse> => {
    try {
      const deviceId =
        typeof window !== "undefined"
          ? localStorage.getItem("mec_device_id") || undefined
          : undefined;

      const res = await api.post("/api/users/login", {
        email: identifier,
        studentId: identifier,
        identifier,
        password,
        securityCode: securityCode ? securityCode.trim() : undefined,
        deviceId,
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
      const errData = err?.data || (err instanceof ApiError ? err.data : null);
      const status = err?.status || (err instanceof ApiError ? err.status : 0);
      const message =
        (errData && errData.message) ||
        err?.message ||
        "Invalid credentials or network error";

      const isLocked =
        Boolean(errData?.isLocked) ||
        status === 423 ||
        message.toLowerCase().includes("lock");

      const requiresSecurityCode =
        Boolean(errData?.requiresSecurityCode) ||
        isLocked ||
        message.toLowerCase().includes("security code") ||
        message.toLowerCase().includes("lock");

      const isDeviceBlocked =
        Boolean(errData?.isDeviceBlocked) ||
        message.toLowerCase().includes("device has been blocked") ||
        message.toLowerCase().includes("device login blocked");

      return {
        success: false,
        message,
        requiresSecurityCode,
        isLocked,
        lockRemainingMinutes: errData?.lockRemainingMinutes,
        isDeviceBlocked,
        attemptsRemaining: errData?.attemptsRemaining,
      };
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
