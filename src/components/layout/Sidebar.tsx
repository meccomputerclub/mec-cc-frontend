"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import { useAccent } from "@/components/AccentProvider";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Settings,
  Users,
  Inbox,
  Ticket,
  Menu,
} from "lucide-react";

interface SidebarProps {
  type: "user" | "admin";
}

export function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { currentVibe } = useAccent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted
    ? `/logo-${currentVibe || "lime"}-${resolvedTheme === "dark" ? "dark" : "light"}.png`
    : "/logo-lime-light.png";

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const userLinks = [
    { href: "/dashboard", label: "Profile", icon: <LayoutDashboard size={16} /> },
    { href: "/dashboard/cp-profile", label: "CP Profile", icon: <Trophy size={16} /> },
    { href: "/dashboard/events", label: "My Events", icon: <Calendar size={16} /> },
    { href: "/dashboard/settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { href: "/admin/applications", label: "Applications", icon: <Inbox size={16} /> },
    { href: "/admin/members", label: "Members", icon: <Users size={16} /> },
    { href: "/admin/events", label: "Manage Events", icon: <Ticket size={16} /> },
  ];

  const links = type === "admin" ? adminLinks : userLinks;

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        className="md:hidden flex items-center justify-center p-2 rounded-md bg-surface-elevated border border-border-default text-text-primary fixed top-4 left-4 z-[999] cursor-pointer"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`w-[280px] bg-surface-elevated border-r border-border-default flex flex-col fixed top-0 bottom-0 left-0 z-[999] transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "max-md:-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-default">
          <Link href="/" className="flex items-center gap-2 no-underline hover:opacity-85 transition-opacity" aria-label="MEC Computer Club — Home">
            <Image
              src={logoSrc}
              alt="MEC Computer Club Logo"
              width={160}
              height={40}
              priority
              className="h-9 w-auto object-contain"
            />
            {type === "admin" && (
              <span className="bg-accent-primary-light text-accent-primary-text font-mono text-[0.65rem] py-0.5 px-1.5 rounded-sm font-bold ml-1">
                ADMIN
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto flex flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-3 text-sm font-medium no-underline rounded-md transition-all duration-150 border ${
                  isActive
                    ? "text-text-primary bg-surface-secondary border-text-primary dark:border-border-default shadow-[2px_2px_0px_var(--accent-primary)] font-bold"
                    : "text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-secondary"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-default flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent-primary flex items-center justify-center font-bold text-accent-primary-text font-mono text-base">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : type === "admin" ? "AD" : "US"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary">
                {user?.fullName || (type === "admin" ? "Admin User" : "Member")}
              </span>
              <span className="text-xs text-text-tertiary font-mono">
                {user?.role ? user.role.toUpperCase() : type === "admin" ? "Executive" : "Member"}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="py-1 px-2 text-xs font-semibold text-text-secondary hover:text-accent-error bg-transparent border-none cursor-pointer transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
