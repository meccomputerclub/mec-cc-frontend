"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAccent } from "@/components/AccentProvider";
import { useAuth } from "@/context/AuthContext";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Shield, LayoutDashboard, LogOut, Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  {
    label: "About",
    href: "#",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Constitution", href: "/constitution" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    label: "Our People",
    href: "#",
    children: [
      { label: "Advisor Panel", href: "/advisors" },
      { label: "Alumni", href: "/alumni" },
      { label: "Executive Panel", href: "/executives" },
      { label: "Members", href: "/members" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Upcoming Event", href: "/events#upcoming" },
      { label: "Past Event", href: "/events#past" },
    ],
  },
  {
    label: "CP Hub",
    href: "#",
    children: [
      { label: "Roadmaps", href: "/cp-hub/roadmaps" },
      { label: "Resources", href: "/cp-hub/resources" },
      { label: "Problem Sets", href: "/cp-hub/problem-sets" },
      { label: "Leaderboard", href: "/cp-hub/leaderboard" },
      { label: "Achievements", href: "/cp-hub/achievements" },
    ],
  },
  {
    label: "Resources",
    href: "#",
    children: [
      { label: "Projects", href: "/projects" },
      { label: "Blog", href: "/blog" },
      { label: "Verify & Lookup", href: "/verify" },
    ],
  },
  {
    label: "Collaborate",
    href: "#",
    children: [
      { label: "Become a Sponsor", href: "/collaborate/sponsor" },
      { label: "Our Partners", href: "/collaborate/partners" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
];

const VIBES = ["lime", "mint", "sky", "amber", "rose", "violet", "slate"];
const MODES = ["light", "dark"];

function LogoPreloader() {
  return (
    <div style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
      {VIBES.map((vibe) =>
        MODES.map((mode) => (
          <Fragment key={`${vibe}-${mode}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/logo-${vibe}-${mode}.png`}
              alt=""
              width={160}
              height={40}
              loading="eager"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/logo-icon-${vibe}-${mode}.png`}
              alt=""
              width={32}
              height={32}
              loading="eager"
            />
          </Fragment>
        ))
      )}
    </div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { currentVibe } = useAccent();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns and mobile menu on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const toggleMobileSubmenu = (label: string) => {
    setMobileExpandedItem(prev => prev === label ? null : label);
  };

  return (
    <header className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`} role="banner">
      <style dangerouslySetInnerHTML={{
        __html: `
          .navbar { position: sticky; top: 0; left: 0; right: 0; z-index: 1000; height: var(--nav-height); background-color: var(--nav-bg) !important; border-bottom: 1px solid var(--border-default); transition: border-color var(--transition-base); }
          .navbar--scrolled { background-color: var(--nav-bg) !important; border-bottom: 1px solid var(--border-default); box-shadow: none; }
          .navbar__inner { display: flex; align-items: center; justify-content: space-between; height: 100%; gap: var(--space-4); width: 100%; max-width: var(--max-width) !important; margin-left: auto !important; margin-right: auto !important; padding-left: var(--gutter) !important; padding-right: var(--gutter) !important; padding-top: 0 !important; padding-bottom: 0 !important; }
          @media (min-width: 1920px) {
            .navbar__inner { max-width: var(--max-width-wide) !important; }
          }
          @media (max-width: 768px) {
            .navbar__inner { padding-left: var(--gutter-mobile) !important; padding-right: var(--gutter-mobile) !important; }
          }
          .navbar__logo { display: flex; align-items: center; text-decoration: none; flex-shrink: 0; height: 36px; }
          .navbar__logo-image { object-fit: contain; }
          .navbar__links { display: flex; align-items: center; gap: var(--space-1); list-style: none; padding: 0; margin: 0; }
          .navbar__item { position: relative; }
          .navbar__link { display: flex; align-items: center; gap: 4px; padding: var(--space-2) var(--space-3); font-family: var(--font-body); font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--text-secondary); text-decoration: none; border-radius: var(--radius-md); transition: all var(--transition-fast); }
          .navbar__link:hover { color: #000000 !important; font-weight: 700 !important; background-color: var(--surface-secondary); }
          .dark .navbar__link:hover { color: #FFFFFF !important; font-weight: 700 !important; background-color: var(--surface-secondary); }
          .navbar__link--active { color: var(--text-primary); font-weight: var(--weight-semibold); }
          .navbar__chevron { transition: transform var(--transition-fast); }
          .navbar__item--has-dropdown:hover .navbar__chevron { transform: rotate(180deg); }
          .navbar__dropdown-wrapper { position: absolute; top: 100%; left: 0; padding-top: var(--space-2); z-index: 100; }
          .navbar__dropdown { min-width: 180px; background-color: var(--surface-primary); border: 1px solid var(--text-primary); border-radius: var(--radius-md); box-shadow: 4px 4px 0px 0px var(--accent-primary); list-style: none; margin: 0; padding: 0; overflow: hidden; animation: slideDown var(--transition-fast) forwards; }
          .dark .navbar__dropdown { border-color: var(--border-default); box-shadow: 4px 4px 0px 0px var(--accent-primary); }
          .navbar__dropdown li { margin: 0; }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
          .navbar__dropdown-link { display: flex; align-items: center; padding: var(--space-2) var(--space-3); font-family: var(--font-body); font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--text-secondary); text-decoration: none; border-bottom: 1px solid var(--border-default); transition: background var(--transition-fast), color var(--transition-fast), font-weight var(--transition-fast); }
          li:last-child .navbar__dropdown-link { border-bottom: none; }
          .navbar__dropdown-link:hover { background-color: var(--accent-primary-light); color: var(--text-primary); font-weight: 700; }
          html.dark .navbar__dropdown-link:hover, .dark .navbar__dropdown-link:hover { background-color: color-mix(in srgb, var(--accent-primary) 25%, var(--surface-primary)); color: #FFFFFF !important; font-weight: 700 !important; }
          .navbar__actions { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
          .navbar__login { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--text-tertiary); text-decoration: none; transition: color var(--transition-fast), font-weight var(--transition-fast); }
          .navbar__login:hover { color: #000000 !important; font-weight: 700 !important; }
          .dark .navbar__login:hover { color: #FFFFFF !important; font-weight: 700 !important; }
          .navbar__user-menu-wrap { position: relative; }
          .navbar__user-btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); height: 36px; padding: 0 var(--space-3); background-color: var(--surface-elevated); color: var(--text-primary); border: 2px solid var(--text-primary); border-radius: var(--radius-md); font-family: var(--font-body); font-size: var(--text-sm); font-weight: var(--weight-semibold); cursor: pointer; transition: all var(--transition-fast); white-space: nowrap; line-height: 1; }
          .dark .navbar__user-btn { border-color: var(--border-default); }
          .navbar__user-btn:hover { background-color: var(--surface-secondary); color: var(--text-primary); box-shadow: 4px 4px 0px var(--text-primary); transform: translate(-2px, -2px); }
          .dark .navbar__user-btn:hover { border-color: var(--accent-primary); box-shadow: 3px 3px 0 var(--accent-primary); color: #FFFFFF; }
          .navbar__user-btn:active { transform: translateY(0); box-shadow: none; }
          .navbar__user-avatar { width: 22px; height: 22px; border-radius: var(--radius-sm); border: 1.5px solid var(--text-primary); object-fit: cover; flex-shrink: 0; }
          .navbar__user-initials { width: 22px; height: 22px; border-radius: var(--radius-sm); border: 1.5px solid var(--text-primary); background: var(--accent-primary); color: var(--accent-primary-text, #000); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 11px; font-weight: 800; flex-shrink: 0; }
          .navbar__user-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--font-body); font-size: var(--text-sm); font-weight: var(--weight-semibold); }
          .navbar__user-dropdown-wrapper { right: 0; left: auto; }
          .navbar__user-dropdown { min-width: 210px; border: 1.5px solid var(--text-primary); border-radius: var(--radius-md); box-shadow: 4px 4px 0px 0px var(--accent-primary); background: var(--surface-elevated); overflow: hidden; padding: 0; margin: 0; list-style: none; }
          .dark .navbar__user-dropdown { border-color: var(--border-default); box-shadow: 4px 4px 0px 0px var(--accent-primary); }
          .navbar__user-dropdown-header { padding: 7px 12px; background-color: var(--surface-secondary); border-bottom: 1px solid var(--border-default); display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
          .navbar__user-dropdown-name { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-bold); color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .navbar__user-role-badge { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; padding: 1px 6px; border-radius: var(--radius-sm); background: var(--accent-primary); color: var(--accent-primary-text, #000); border: 1px solid var(--border-brutalist); flex-shrink: 0; }
          .navbar__dropdown-link--danger { width: 100%; border: none; background: transparent; cursor: pointer; text-align: left; }
          .navbar__dropdown-link--danger:hover { background-color: rgba(239, 68, 68, 0.1); color: var(--accent-error, #ef4444); }
          .navbar__desktop-auth { display: flex; align-items: center; gap: var(--space-3); }
          .navbar__hamburger-btn { display: none; align-items: center; justify-content: center; width: 38px; height: 38px; background-color: var(--surface-elevated); border: 2px solid var(--text-primary); border-radius: var(--radius-md); color: var(--text-primary); cursor: pointer; transition: all var(--transition-fast); box-shadow: 2px 2px 0px 0px var(--text-primary); flex-shrink: 0; order: -1; }
          .dark .navbar__hamburger-btn { border-color: var(--border-default); box-shadow: 2px 2px 0px 0px var(--accent-primary); }
          .navbar__hamburger-btn:hover { background-color: var(--surface-secondary); transform: translate(-1px, -1px); box-shadow: 3px 3px 0px 0px var(--accent-primary); }
          .navbar__mobile-drawer-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 9999; display: flex; justify-content: flex-start; animation: fadeIn 0.2s ease forwards; }
          .navbar__mobile-drawer { width: 88vw; max-width: 360px; height: 100%; background-color: var(--surface-primary); border-right: 2px solid var(--text-primary); border-left: none; display: flex; flex-direction: column; box-shadow: 6px 0px 0px 0px var(--accent-primary); animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; overflow: hidden; }
          .dark .navbar__mobile-drawer { border-right-color: var(--border-default); border-left: none; }
          @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .navbar__mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-default); background-color: var(--surface-secondary); }
          .navbar__mobile-close-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: var(--surface-primary); border: 1.5px solid var(--text-primary); border-radius: var(--radius-sm); color: var(--text-primary); cursor: pointer; transition: all var(--transition-fast); }
          .navbar__mobile-close-btn:hover { background-color: var(--accent-primary-light); transform: rotate(90deg); }
          .navbar__mobile-body { flex: 1; overflow-y: auto; padding: 16px 20px 24px; display: flex; flex-direction: column; gap: 20px; }
          .navbar__mobile-nav-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
          .navbar__mobile-nav-item { border-bottom: 1px solid var(--border-default); padding-bottom: 4px; }
          .navbar__mobile-nav-link { display: flex; align-items: center; justify-content: space-between; padding: 10px 8px; font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); text-decoration: none; border-radius: var(--radius-sm); transition: background-color var(--transition-fast); }
          .navbar__mobile-nav-link:hover, .navbar__mobile-nav-link--active { background-color: var(--accent-primary-light); color: var(--text-primary); }
          .navbar__mobile-nav-parent { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 10px 8px; background: transparent; border: none; font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: var(--text-primary); cursor: pointer; border-radius: var(--radius-sm); transition: background-color var(--transition-fast); }
          .navbar__mobile-nav-parent:hover { background-color: var(--surface-secondary); }
          .navbar__mobile-sub-list { list-style: none; padding: 4px 0 8px 16px; margin: 0; display: flex; flex-direction: column; gap: 2px; border-left: 2px solid var(--accent-primary); margin-left: 8px; margin-top: 4px; }
          .navbar__mobile-sub-link { display: block; padding: 6px 8px; font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--text-secondary); text-decoration: none; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
          .navbar__mobile-sub-link:hover, .navbar__mobile-sub-link--active { background-color: var(--accent-primary-light); color: var(--text-primary); padding-left: 12px; }
          .navbar__mobile-footer { margin-top: auto; padding-top: 16px; border-top: 2px solid var(--border-default); }
          .navbar__mobile-auth-actions { display: flex; flex-direction: column; gap: 8px; }
          .navbar__mobile-btn { display: flex; align-items: center; justify-content: center; padding: 10px 16px; font-family: var(--font-body); font-size: 14px; font-weight: 700; border-radius: var(--radius-md); text-decoration: none; text-align: center; transition: all var(--transition-fast); }
          .navbar__mobile-btn--primary { background-color: var(--accent-primary); color: #000000 !important; border: 2px solid var(--text-primary); box-shadow: 3px 3px 0px 0px var(--text-primary); }
          .navbar__mobile-btn--secondary { background-color: var(--surface-elevated); color: var(--text-primary); border: 2px solid var(--text-primary); box-shadow: 3px 3px 0px 0px var(--border-default); }
          .navbar__mobile-user-box { background-color: var(--surface-secondary); border: 1.5px solid var(--border-default); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 12px; }
          .navbar__mobile-user-info { display: flex; align-items: center; gap: 10px; }
          .navbar__mobile-user-name { font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0; }
          .navbar__mobile-user-role { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; color: var(--accent-primary-hover); margin: 0; font-weight: 700; }
          .navbar__mobile-user-actions { display: flex; flex-direction: column; gap: 6px; }
          .navbar__mobile-action-btn { display: flex; align-items: center; gap: 8px; padding: 8px 10px; font-size: 12px; font-weight: 600; color: var(--text-primary); text-decoration: none; background-color: var(--surface-primary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); transition: all var(--transition-fast); }
          .navbar__mobile-action-btn:hover { background-color: var(--accent-primary-light); border-color: var(--accent-primary); }
          .navbar__mobile-action-btn--logout { color: var(--accent-error); cursor: pointer; }
          @media (max-width: 1024px) {
            .navbar__links { display: none !important; }
            .navbar__hamburger-btn { display: flex !important; }
            .navbar__desktop-auth { display: none !important; }
            .navbar__user-menu-wrap { display: none; }
            .navbar__inner { gap: var(--space-2); }
          }
        `
      }} />
      <LogoPreloader />
      <nav className="navbar__inner container" aria-label="Main navigation">

        {/* Hamburger toggle button — LEFT side on mobile/tablet */}
        <button
          type="button"
          className={`navbar__hamburger-btn ${mobileMenuOpen ? "navbar__hamburger-btn--active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link href="/" className="navbar__logo" aria-label="MEC Computer Club — Home">
          {mounted ? (
            <Image
              src={`/logo-${currentVibe}-${resolvedTheme === 'dark' ? 'dark' : 'light'}.png`}
              alt="MEC Computer Club Logo"
              width={160}
              height={40}
              priority
              className="navbar__logo-image"
            />
          ) : (
            <Image
              src="/logo-lime-light.png"
              alt="MEC Computer Club Logo"
              width={160}
              height={40}
              priority
              className="navbar__logo-image"
            />
          )}
        </Link>

        {/* Desktop nav — centered */}
        <ul className="navbar__links" role="menubar">
          {navItems.map((item) => (
            <li
              key={item.label}
              className={`navbar__item ${item.children ? "navbar__item--has-dropdown" : ""}`}
              onMouseEnter={() => item.children && setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
              role="none"
            >
              <Link
                href={item.href}
                className={`navbar__link ${pathname === item.href ? "navbar__link--active" : ""}`}
                role="menuitem"
                aria-haspopup={item.children ? "true" : undefined}
                aria-expanded={item.children ? activeDropdown === item.label : undefined}
              >
                {item.label}
                {item.children && (
                  <svg className="navbar__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </Link>
              {item.children && activeDropdown === item.label && (
                <div className="navbar__dropdown-wrapper">
                  <ul className="navbar__dropdown" role="menu">
                    {item.children.map((child) => (
                      <li key={child.href} role="none">
                        <Link href={child.href} className="navbar__dropdown-link" role="menuitem">
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Right side — CTA & Auth */}
        <div className="navbar__actions">
          <ThemeToggle />
          {user ? (
            <>
              <NotificationCenter />
              <div className="navbar__user-menu-wrap" onMouseLeave={() => setUserDropdownOpen(false)}>
                <button
                  type="button"
                  className="navbar__user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onMouseEnter={() => setUserDropdownOpen(true)}
                  aria-label="User menu"
                >
                  {user.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={user.imageUrl}
                      src={user.imageUrl}
                      alt={user.fullName}
                      className="navbar__user-avatar"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.navbar__user-initials');
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span
                    className="navbar__user-initials"
                    style={{ display: user.imageUrl ? 'none' : 'flex' }}
                  >
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="navbar__user-name">{user.fullName?.split(" ")[0] || "Member"}</span>
                  <svg className="navbar__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="navbar__dropdown-wrapper navbar__user-dropdown-wrapper">
                    <ul className="navbar__dropdown navbar__user-dropdown" role="menu">
                      <li className="navbar__user-dropdown-header">
                        <div className="navbar__user-dropdown-name">{user.fullName}</div>
                        <span className="navbar__user-role-badge">{user.role}</span>
                      </li>
                      <li role="none">
                        <Link
                          href="/profile"
                          className="navbar__dropdown-link"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User size={14} style={{ marginRight: "6px" }} />
                          Profile
                        </Link>
                      </li>
                      <li role="none">
                        <Link
                          href="/profile?tab=security"
                          className="navbar__dropdown-link"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Shield size={14} style={{ marginRight: "6px" }} />
                          Security
                        </Link>
                      </li>
                      {(isAdmin || user.role === "moderator" || user.role === "executive" || user.clubRole === "executive") && (
                        <li role="none">
                          <Link
                            href="/dashboard"
                            className="navbar__dropdown-link"
                            role="menuitem"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <LayoutDashboard size={14} style={{ marginRight: "6px" }} />
                            Dashboard
                          </Link>
                        </li>
                      )}
                      <li role="none">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="navbar__dropdown-link navbar__dropdown-link--danger"
                          role="menuitem"
                        >
                          <LogOut size={14} style={{ marginRight: "6px" }} />
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar__desktop-auth">
              <Link href="/login" className="navbar__login" id="nav-member-login">
                Login
              </Link>
              <Button href="/join" size="sm" id="nav-join-cta">
                Join Club
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="navbar__mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="navbar__mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            {/* Mobile Header */}
            <div className="navbar__mobile-header">
              <div className="navbar__mobile-logo">
                <Image
                  src={`/logo-${currentVibe}-${resolvedTheme === 'dark' ? 'dark' : 'light'}.png`}
                  alt="MEC Computer Club"
                  width={130}
                  height={32}
                  className="navbar__logo-image"
                />
              </div>
              <button
                type="button"
                className="navbar__mobile-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation Links Accordion */}
            <div className="navbar__mobile-body">
              <ul className="navbar__mobile-nav-list">
                {navItems.map((item) => (
                  <li key={item.label} className="navbar__mobile-nav-item">
                    {item.children ? (
                      <div>
                        <button
                          type="button"
                          className="navbar__mobile-nav-parent"
                          onClick={() => toggleMobileSubmenu(item.label)}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            size={16}
                            style={{
                              transform: mobileExpandedItem === item.label ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease"
                            }}
                          />
                        </button>
                        {mobileExpandedItem === item.label && (
                          <ul className="navbar__mobile-sub-list">
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={`navbar__mobile-sub-link ${pathname === child.href ? "navbar__mobile-sub-link--active" : ""}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`navbar__mobile-nav-link ${pathname === item.href ? "navbar__mobile-nav-link--active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              {/* Mobile Auth and Action Section */}
              <div className="navbar__mobile-footer">
                {user ? (
                  <div className="navbar__mobile-user-box">
                    <div className="navbar__mobile-user-info">
                      <span className="navbar__user-initials">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                      </span>
                      <div>
                        <p className="navbar__mobile-user-name">{user.fullName}</p>
                        <p className="navbar__mobile-user-role">{user.role}</p>
                      </div>
                    </div>
                    <div className="navbar__mobile-user-actions">
                      <Link
                        href="/profile"
                        className="navbar__mobile-action-btn"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User size={15} /> Profile
                      </Link>
                      {(isAdmin || user.role === "moderator" || user.role === "executive" || user.clubRole === "executive") && (
                        <Link
                          href="/dashboard"
                          className="navbar__mobile-action-btn"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard size={15} /> Executive Command
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="navbar__mobile-action-btn navbar__mobile-action-btn--logout"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="navbar__mobile-auth-actions">
                    <Link
                      href="/login"
                      className="navbar__mobile-btn navbar__mobile-btn--secondary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/join"
                      className="navbar__mobile-btn navbar__mobile-btn--primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Join Club
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
