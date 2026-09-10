"use client";
import React, { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DASHBOARD_MENU } from "@/lib/constants/dashboard";
import { useAuth } from "@/context/AuthContext";
import UnauthorizedPage from "@/components/ui/shared/Unauthorized";
import { AuthUser } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, setCustomRole } = useAuth();
  const [, startTransition] = useTransition();
  const [role, setRole] = useState<AuthUser["role"]>(user?.role || "member");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const userRole = String(user?.role || "").toLowerCase();
  const isExecutive =
    userRole === "admin" ||
    userRole === "moderator" ||
    userRole === "executive" ||
    String(user?.clubRole || "").toLowerCase() === "executive";

  // Redirect to login if not authenticated, or to /profile if not executive
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const currentPath =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : pathname;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else if (user && !isExecutive) {
        router.replace("/profile");
      }
    }
  }, [isLoading, isAuthenticated, user, isExecutive, router, pathname]);

  // Sync role when user loads
  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  // Derive active tab from the current URL path
  const activeTab = useMemo(() => {
    if (!pathname) return "overview";
    const rest = pathname.replace(/^\/dashboard\/?/, "");
    if (!rest) return "overview";
    const firstSegment = rest.split("/")[0];
    return firstSegment || "overview";
  }, [pathname]);

  const handleSetRole = async (newRole: "admin" | "member") => {
    if (user?.role !== "admin") {
      alert("Only admins can switch roles");
      return;
    }
    setRole(newRole);
    setCustomRole(newRole);
    router.push("/dashboard");
  };

  const currentMenu = useMemo(() => {
    if (!user) return [];
    return DASHBOARD_MENU[role || user.role] || [];
  }, [user, role]);

  const handleTabChange = (tabKey: string) => {
    startTransition(() => {
      router.push(`/dashboard/${tabKey}`);
    });
  };

  if (isLoading || !isAuthenticated || !user || !isExecutive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">
            {isLoading
              ? "Loading dashboard..."
              : !isAuthenticated
              ? "Redirecting to login..."
              : "Redirecting to profile..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-primary">
      <DashboardSidebar
        menu={currentMenu}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={`flex flex-col flex-1 ${isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          } min-w-0 transition-all duration-300 ease-in-out`}
      >
        <DashboardNavbar
          role={role}
          onRoleChange={handleSetRole}
          user={user}
          onMenuToggle={() => setIsSidebarOpen((v) => !v)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
