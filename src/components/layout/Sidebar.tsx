"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
import "./Sidebar.css";

interface SidebarProps {
  type: "user" | "admin";
}

export function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
        className="sidebar-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        style={{ position: "fixed", top: "16px", left: "16px", zIndex: 999 }}
      >
        <Menu size={18} />
      </button>

      {isOpen && (
        <div
          className="sidebar-overlay sidebar-overlay--open"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <Link href="/" className="sidebar__logo">
            MEC CC {type === "admin" && <span className="sidebar__badge">ADMIN</span>}
          </Link>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar__link ${pathname === link.href ? "sidebar__link--active" : ""}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : type === "admin" ? "AD" : "US"}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">
                {user?.fullName || (type === "admin" ? "Admin User" : "Member")}
              </span>
              <span className="sidebar__user-role">
                {user?.role ? user.role.toUpperCase() : type === "admin" ? "Executive" : "Member"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="sidebar__link"
              style={{ padding: "4px 8px", fontSize: "12px", background: "none", border: "none", cursor: "pointer" }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
