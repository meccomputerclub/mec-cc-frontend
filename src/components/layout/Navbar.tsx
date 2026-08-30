"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAccent } from "@/components/AccentProvider";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, Shield, LayoutDashboard, LogOut } from "lucide-react";
import "./Navbar.css";

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
      { label: "Sheet Tracker", href: "/cp-hub/sheet-tracker" },
      { label: "Contests", href: "/cp-hub/contests" },
      { label: "Leaderboard", href: "/cp-hub/leaderboard" },
      { label: "ICPC Preparation", href: "/cp-hub/icpc-preparation" },
      { label: "Achievements", href: "/cp-hub/achievements" },
    ],
  },
  {
    label: "Resources",
    href: "#",
    children: [
      { label: "Projects", href: "/projects" },
      { label: "Blog", href: "/blog" },
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
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={`${vibe}-${mode}`}
            src={`/logo-${vibe}-${mode}.png`}
            alt=""
            width={160}
            height={40}
            loading="eager"
          />
        ))
      )}
    </div>
  );
}

import { useAuth } from "@/context/AuthContext";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import toast from "react-hot-toast";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`} role="banner">
      <LogoPreloader />
      <nav className="navbar__inner container" aria-label="Main navigation">
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

        {/* Desktop nav */}
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
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                        href="/dashboard?mode=personal"
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
                        href="/dashboard?mode=personal&tab=security"
                        className="navbar__dropdown-link"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Shield size={14} style={{ marginRight: "6px" }} />
                        Security
                      </Link>
                    </li>
                    {(isAdmin || user.role === "moderator") && (
                      <li role="none">
                        <Link
                          href="/dashboard?mode=executive&tab=members-management"
                          className="navbar__dropdown-link"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={14} style={{ marginRight: "6px" }} />
                          Executive Command
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
            <>
              <Link href="/login" className="navbar__login" id="nav-member-login">
                Login
              </Link>
              <Button href="/join" size="sm" id="nav-join-cta">
                Join Club
              </Button>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}
