"use client";
import React, { useEffect, useState } from "react";
import type { MenuItem } from "@/lib/constants/dashboard";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useAccent } from "@/components/AccentProvider";
import Link from "next/link";
import { LogOut, X, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthUser } from "@/types";

interface DashboardSidebarProps {
  menu: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: AuthUser["role"];
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarContent: React.FC<{
  menu: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  role: AuthUser["role"];
  onClose?: () => void;
  showCloseButton?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}> = ({
  menu,
  activeTab,
  onTabChange,
  role,
  onClose,
  showCloseButton,
  isCollapsed = false,
  onToggleCollapse,
}) => {
    const { resolvedTheme } = useTheme();
    const { currentVibe } = useAccent();
    const [mounted, setMounted] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
      setMounted(true);
    }, []);

    const logoSrc = mounted
      ? `/logo-${currentVibe || "lime"}-${resolvedTheme === "dark" ? "dark" : "light"}.png`
      : "/logo-lime-light.png";

    return (
      <div className="flex flex-col h-full bg-surface-elevated border-r border-border-default select-none">
        {/* ── Top Header Section (Higher up with thin divider line) ── */}
        {isCollapsed ? (
          <div className="py-3 px-2 flex flex-col items-center gap-2.5 border-b border-border-default">
            {/* Menu Button sitting on top to expand */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <Menu size={18} />
            </button>

            {/* Logo Icon Mark Only */}
            <Link
              href="/"
              className="flex items-center justify-center rounded-lg hover:opacity-85 transition-opacity"
              title="MEC Computer Club"
              aria-label="MEC Computer Club — Home"
            >
              <div className="w-8 h-8 overflow-hidden flex-shrink-0 flex items-center justify-start">
                <Image
                  alt="MEC Computer Club Logo"
                  src={logoSrc}
                  width={160}
                  height={40}
                  priority
                  className="h-8 w-auto max-w-none object-left object-cover"
                />
              </div>
            </Link>
          </div>
        ) : (
          <div className="px-4 py-3 flex items-center justify-between border-b border-border-default">
            {/* Full Logo — matching Navbar logo */}
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center flex-shrink-0 h-9 min-w-0 pr-2 hover:opacity-85 transition-opacity"
              aria-label="MEC Computer Club — Home"
            >
              <Image
                alt="MEC Computer Club Logo"
                src={logoSrc}
                width={160}
                height={40}
                priority
                className="h-[120px] w-auto object-contain"
              />
            </Link>

            {/* Role badge + Collapse/Cross Button */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${role === "admin"
                  ? "bg-accent-primary-light text-text-primary border border-border-default"
                  : "bg-surface-secondary text-text-secondary border border-border-default"
                  }`}
              >
                {role}
              </span>

              {/* Toggle / Close Button */}
              <button
                type="button"
                onClick={onToggleCollapse || onClose}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        )}

        {/* ── Navigation Items ── */}
        <nav className={`flex-grow ${isCollapsed ? "px-2 py-3" : "px-3 py-3"} space-y-1.5 overflow-y-auto overflow-x-hidden`}>
          {menu.map((item) => {
            const isActive = item.key === activeTab;
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                title={item.label}
                onClick={() => {
                  onTabChange(item.key);
                  onClose?.();
                }}
                className={`
                flex items-center rounded-xl transition-all cursor-pointer group
                ${isCollapsed
                    ? "w-full justify-center py-2.5 px-0"
                    : "w-full px-3.5 py-2.5 gap-3 text-left"
                  }
                ${isActive
                    ? "bg-accent-primary-light text-text-primary font-semibold shadow-[2px_2px_0px_0px_var(--border-default)] border border-border-default"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary border border-transparent"
                  }
              `}
              >
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  <IconComponent
                    className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                      }`}
                  />
                </div>
                {!isCollapsed && (
                  <span className="text-xs font-semibold truncate leading-tight">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Logout Section ── */}
        <div className={`border-t border-border-default ${isCollapsed ? "p-2" : "p-3"} mt-auto`}>
          <button
            type="button"
            title="Logout"
            className={`
            flex items-center rounded-xl text-accent-error hover:bg-surface-secondary transition cursor-pointer font-semibold
            ${isCollapsed
                ? "w-full justify-center py-2.5 px-0"
                : "w-full px-3.5 py-2.5 gap-3 text-left"
              }
          `}
            onClick={() => {
              onClose?.();
              logout();
            }}
          >
            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              <LogOut size={18} className="w-5 h-5" />
            </div>
            {!isCollapsed && <span className="text-xs font-semibold">Logout</span>}
          </button>
        </div>
      </div>
    );
  };

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  menu,
  activeTab,
  onTabChange,
  role,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-30 transition-all duration-300 ease-in-out ${isCollapsed ? "lg:w-20" : "lg:w-64"
          }`}
      >
        <SidebarContent
          menu={menu}
          activeTab={activeTab}
          onTabChange={onTabChange}
          role={role}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* ── Mobile drawer (below lg) ── */}
      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-elevated border-r border-border-default transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <SidebarContent
          menu={menu}
          activeTab={activeTab}
          onTabChange={onTabChange}
          role={role}
          onClose={onClose}
          showCloseButton
          isCollapsed={false}
        />
      </aside>
    </>
  );
};
