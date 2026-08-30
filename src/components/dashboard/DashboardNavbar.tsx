"use client";
import React, { useState, useRef, useEffect } from "react";
import { Menu, User, ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/types";

interface DashboardNavbarProps {
  role: AuthUser["role"];
  onRoleChange: (role: "admin" | "member") => void;
  user: AuthUser | null;
  onMenuToggle: () => void;
}

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
  role,
  onRoleChange,
  user,
  onMenuToggle,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, user: authUser } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-surface-elevated/80 backdrop-blur-md border-b border-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-text-secondary hover:bg-surface-secondary transition"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="lg:hidden text-lg font-semibold text-text-primary">
              MEC Computer Club
            </span>
          </div>

          {/* Right side — User menu */}
          <div className="ml-auto relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-secondary border border-transparent hover:border-border-default transition"
            >
              <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-accent-primary-text font-semibold text-sm flex-shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase() || <User size={16} />}
              </div>
              <span className="font-semibold text-sm text-text-primary hidden sm:inline">
                {user?.fullName || "User"}
              </span>
              <ChevronDown
                size={15}
                className={`text-text-secondary transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-elevated rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] ring-1 ring-black/5 z-50 border border-border-default overflow-hidden animate-fade-in">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border-default bg-surface-secondary">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-primary text-accent-primary-text">
                    {role}
                  </span>
                </div>

                <div className="p-1.5 space-y-0.5">
                  {/* Role Switch — dev only */}
                  {authUser?.role === "admin" && process.env.NODE_ENV === "development" && (
                    <button
                      onClick={() => {
                        onRoleChange(role === "admin" ? "member" : "admin");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-semibold text-accent-primary hover:bg-surface-secondary rounded-lg transition"
                    >
                      Switch to {role === "admin" ? "Member" : "Admin"} View
                    </button>
                  )}

                  {/* Profile Settings */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/dashboard/profile");
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-semibold text-text-primary hover:bg-surface-secondary rounded-lg transition"
                  >
                    <Settings size={14} className="text-text-secondary" />
                    Profile Settings
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-semibold text-accent-error hover:bg-surface-secondary rounded-lg transition"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
