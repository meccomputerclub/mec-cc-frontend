"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Bell,
  CheckCircle2,
  Calendar,
  Award,
  Mail,
  Shield,
  AlertCircle,
  Check,
  CheckCheck,
  Trash2,
  ChevronRight,
  Sparkles,
  Inbox,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  type: "approval" | "event" | "certificate" | "message" | "security" | "announcement" | "system";
  title: string;
  message: string;
  timeAgo: string;
  link?: string;
  actionLabel?: string;
  priority?: "normal" | "high" | "urgent";
}

export function NotificationCenter() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "important">("all");
  const [baseAlerts, setBaseAlerts] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const userId = user?.id || user?._id || "";
  const isModerator = user?.role === "moderator";
  const isExecutive = isAdmin || isModerator;

  // Storage key for user read/dismissed IDs
  const storageKey = userId ? `mcc_notifs_${userId}` : null;

  // 1. Load persisted read/dismissed state
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.read)) setReadIds(parsed.read);
        if (Array.isArray(parsed.dismissed)) setDismissedIds(parsed.dismissed);
      }
    } catch {
      // Ignore storage read error
    }
  }, [storageKey]);

  // 2. Persist read/dismissed state
  const persistState = useCallback(
    (newRead: string[], newDismissed: string[]) => {
      if (!storageKey) return;
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ read: newRead, dismissed: newDismissed })
        );
      } catch {
        // Ignore storage write error
      }
    },
    [storageKey]
  );

  // 3. Fetch base notifications (runs only on mount / user switch)
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchAlerts = async () => {
      const list: NotificationItem[] = [];

      // A. Application Status
      if (user.applicationStatus === "approved") {
        list.push({
          id: "status-approved",
          type: "approval",
          title: "Membership Approved",
          message: "Your application is active with verified club credentials.",
          timeAgo: "Permanent",
          link: "/dashboard?mode=personal&tab=profile",
          actionLabel: "View Credentials",
          priority: "normal",
        });
      } else if (user.applicationStatus === "pending") {
        list.push({
          id: "status-pending",
          type: "approval",
          title: "Application In Review",
          message: "Your membership registration is being processed by the executive board.",
          timeAgo: "Active",
          link: "/dashboard?mode=personal&tab=overview",
          actionLabel: "Check Status",
          priority: "high",
        });
      }

      // B. Email verification warning
      if (!user.isVerified) {
        list.push({
          id: "email-verify-needed",
          type: "security",
          title: "Email Verification Required",
          message: "Please complete email verification to ensure full access.",
          timeAgo: "Action Needed",
          link: `/verify-email?email=${encodeURIComponent(user.email || "")}`,
          actionLabel: "Verify Email",
          priority: "urgent",
        });
      }

      // C. Profile Completion
      if (!user.socialLinks?.github || !user.bio) {
        list.push({
          id: "profile-complete",
          type: "system",
          title: "Profile Incomplete",
          message: "Add your GitHub handle and developer bio to stand out in the directory.",
          timeAgo: "Recommendation",
          link: "/dashboard?mode=personal&tab=profile",
          actionLabel: "Complete Profile",
          priority: "normal",
        });
      }

      // D. Executive Alerts
      if (isExecutive) {
        list.push({
          id: "exec-role-active",
          type: "security",
          title: `${isAdmin ? "Administrator" : "Moderator"} Access`,
          message: "Executive command access is active. Review registrations and manage events.",
          timeAgo: "Active",
          link: "/dashboard?mode=executive&tab=members-management",
          actionLabel: "Executive Hub",
          priority: "high",
        });

        try {
          const [membersRes, msgsRes] = await Promise.all([
            api.get("/api/dashboard/members").catch(() => null),
            api.get("/api/contact-messages").catch(() => null),
          ]);

          const allMembers = membersRes?.data || [];
          const pendingCount = Array.isArray(allMembers)
            ? allMembers.filter((m: any) => m.applicationStatus === "pending").length
            : 0;

          if (pendingCount > 0) {
            list.push({
              id: "pending-approvals-alert",
              type: "approval",
              title: "Pending Member Applications",
              message: `${pendingCount} registration application(s) awaiting verification.`,
              timeAgo: "Action Needed",
              link: "/dashboard?mode=executive&tab=members-management",
              actionLabel: "Review Applications",
              priority: "urgent",
            });
          }

          const messages = msgsRes?.data || msgsRes?.messages || [];
          if (Array.isArray(messages) && messages.length > 0) {
            list.push({
              id: "contact-messages-alert",
              type: "message",
              title: "Contact Messages Received",
              message: `${messages.length} inquiries received in the club contact inbox.`,
              timeAgo: "Inbox",
              link: "/dashboard?mode=executive&tab=messages",
              actionLabel: "Open Messages",
              priority: "normal",
            });
          }
        } catch {
          // Graceful fallback
        }
      }

      // E. Events from API
      try {
        const eventsRes = await api.get("/api/events").catch(() => null);
        const events = eventsRes?.data || eventsRes?.events || [];
        if (Array.isArray(events) && events.length > 0) {
          const topEvent = events[0];
          if (topEvent?.title) {
            list.push({
              id: `event-${topEvent._id || topEvent.slug || "latest"}`,
              type: "event",
              title: `Event: ${topEvent.title}`,
              message: topEvent.description
                ? `${topEvent.description.slice(0, 75)}...`
                : "Upcoming official club event and contest session.",
              timeAgo: topEvent.date
                ? new Date(topEvent.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : "Upcoming",
              link: topEvent.slug ? `/events/${topEvent.slug}` : "/events",
              actionLabel: "Event Details",
              priority: "normal",
            });
          }
        }
      } catch {
        // Graceful fallback
      }

      if (isMounted) {
        setBaseAlerts(list);
      }
    };

    fetchAlerts();

    return () => {
      isMounted = false;
    };
  }, [user, isAdmin, isExecutive]);

  // 4. Derive computed notifications list without network triggers
  const notifications = useMemo(() => {
    return baseAlerts
      .filter((item) => !dismissedIds.includes(item.id))
      .map((item) => ({
        ...item,
        read: readIds.includes(item.id),
      }));
  }, [baseAlerts, dismissedIds, readIds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    persistState(updated, dismissedIds);
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const unique = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(unique);
    persistState(unique, dismissedIds);
  };

  const dismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedDismissed = [...dismissedIds, id];
    setDismissedIds(updatedDismissed);
    persistState(readIds, updatedDismissed);
  };

  const clearAll = () => {
    const allIds = baseAlerts.map((n) => n.id);
    const updatedDismissed = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updatedDismissed);
    persistState(readIds, updatedDismissed);
  };

  const handleActionClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "unread") return !n.read;
      if (activeFilter === "important") return n.priority === "high" || n.priority === "urgent";
      return true;
    });
  }, [notifications, activeFilter]);

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "approval":
        return <CheckCircle2 size={14} className="notif-card__icon--approval" />;
      case "event":
        return <Calendar size={14} className="notif-card__icon--event" />;
      case "certificate":
        return <Award size={14} className="notif-card__icon--cert" />;
      case "message":
        return <Mail size={14} className="notif-card__icon--message" />;
      case "security":
        return <Shield size={14} className="notif-card__icon--security" />;
      case "announcement":
        return <Sparkles size={14} className="notif-card__icon--announcement" />;
      default:
        return <AlertCircle size={14} className="notif-card__icon--default" />;
    }
  };

  if (!user) return null;

  return (
    <div className="notif-container" ref={containerRef}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .notif-container { position: relative; display: inline-flex; align-items: center; }
          .notif-trigger { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--radius-md); border: 2px solid var(--text-primary); background: var(--surface-elevated); color: var(--text-primary); cursor: pointer; box-shadow: 2px 2px 0 var(--text-primary); transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast); outline: none; padding: 0; flex-shrink: 0; box-sizing: border-box; }
          .dark .notif-trigger { border-color: var(--border-default); box-shadow: 2px 2px 0 var(--border-default); color: var(--text-primary); }
          .notif-trigger:hover { background-color: var(--surface-secondary); color: var(--text-primary); border-color: var(--text-primary); box-shadow: 4px 4px 0px var(--text-primary); transform: translate(-2px, -2px); }
          .dark .notif-trigger:hover { border-color: var(--accent-primary); box-shadow: 3px 3px 0 var(--accent-primary); color: #FFFFFF; }
          .notif-trigger--open { border-color: var(--accent-primary) !important; box-shadow: 3px 3px 0 var(--accent-primary) !important; color: var(--text-primary) !important; background-color: var(--surface-secondary); }
          .dark .notif-trigger--open { color: #FFFFFF !important; }
          .notif-trigger__icon { transition: transform var(--transition-fast); }
          .notif-trigger:hover .notif-trigger__icon { transform: rotate(12deg); }
          .notif-badge { position: absolute; top: -5px; right: -5px; min-width: 17px; height: 17px; padding: 0 4px; background-color: var(--accent-error, #ef4444); color: #FFFFFF; border: 1.5px solid var(--surface-primary); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 9px; font-weight: 800; line-height: 1; pointer-events: none; box-shadow: 1px 1px 0 var(--border-brutalist); }
          .notif-badge__ping { position: absolute; inset: -1px; border-radius: var(--radius-full); background-color: var(--accent-error, #ef4444); opacity: 0.75; animation: notifPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none; z-index: -1; }
          @keyframes notifPing { 0% { transform: scale(1); opacity: 0.8; } 75%, 100% { transform: scale(1.6); opacity: 0; } }
          .notif-popover { position: absolute; top: calc(100% + 8px); right: 0; width: 360px; max-width: calc(100vw - 24px); background: var(--surface-elevated); border: 1.5px solid var(--text-primary); border-radius: var(--radius-md); box-shadow: 4px 4px 0px 0px var(--accent-primary); z-index: 1000; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; animation: notifSlideDown 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: top right; }
          .dark .notif-popover { border-color: var(--border-default); box-shadow: 4px 4px 0px 0px var(--accent-primary); background: var(--surface-elevated); }
          @keyframes notifSlideDown { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .notif-header { padding: 10px 14px; background: var(--surface-secondary); border-bottom: 1px solid var(--border-default); display: flex; align-items: center; justify-content: space-between; gap: 8px; box-sizing: border-box; flex-shrink: 0; }
          .notif-header__title-group { display: flex; align-items: center; gap: 8px; }
          .notif-header__title { font-family: var(--font-heading); font-size: var(--text-sm); font-weight: 800; color: var(--text-primary); letter-spacing: -0.2px; }
          .notif-header__count { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 2px 7px; background-color: var(--accent-primary); color: var(--accent-primary-text, #000000); border: 1px solid var(--border-brutalist); border-radius: var(--radius-sm); }
          .notif-header__count--zero { background-color: var(--surface-primary); color: var(--text-tertiary); border-color: var(--border-default); }
          .notif-header__btn { display: inline-flex; align-items: center; background: transparent; border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 3px 8px; font-family: var(--font-body); font-size: 11px; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all var(--transition-fast); }
          .notif-header__btn:hover { background-color: var(--accent-primary-light); color: var(--text-primary); border-color: var(--accent-primary); }
          html.dark .notif-header__btn:hover, .dark .notif-header__btn:hover { background-color: color-mix(in srgb, var(--accent-primary) 25%, var(--surface-primary)); color: #FFFFFF !important; border-color: var(--accent-primary); }
          .notif-tabs { display: flex; background: var(--surface-primary); border-bottom: 1px solid var(--border-default); padding: 5px 8px; gap: 4px; box-sizing: border-box; flex-shrink: 0; }
          .notif-tab { flex: 1; padding: 5px 6px; border: 1.5px solid transparent; background: transparent; font-family: var(--font-body); font-size: 11px; font-weight: 700; color: var(--text-tertiary); border-radius: var(--radius-sm); cursor: pointer; transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast); text-align: center; white-space: nowrap; box-sizing: border-box; line-height: 1.2; }
          .notif-tab:hover { color: var(--text-primary); background: var(--surface-secondary); }
          .notif-tab--active { background: var(--surface-secondary) !important; color: var(--text-primary) !important; border-color: var(--border-brutalist) !important; }
          .dark .notif-tab--active { color: #FFFFFF !important; border-color: var(--border-default) !important; }
          .notif-list { height: 290px; max-height: 290px; overflow-y: auto; display: flex; flex-direction: column; box-sizing: border-box; scroll-behavior: smooth; }
          .notif-list::-webkit-scrollbar { width: 5px; }
          .notif-list::-webkit-scrollbar-track { background: transparent; }
          .notif-list::-webkit-scrollbar-thumb { background: var(--border-default); border-radius: 4px; }
          .notif-card { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--border-default); border-left: 3px solid transparent; box-sizing: border-box; background: var(--surface-elevated); cursor: pointer; transition: background-color var(--transition-fast), border-color var(--transition-fast); position: relative; text-align: left; flex-shrink: 0; }
          .notif-card:last-child { border-bottom: none; }
          .notif-card--unread { background: color-mix(in srgb, var(--accent-primary) 8%, var(--surface-elevated)); }
          .notif-card:hover { background-color: var(--accent-primary-light); }
          html.dark .notif-card:hover, .dark .notif-card:hover { background-color: color-mix(in srgb, var(--accent-primary) 20%, var(--surface-primary)); }
          .notif-card--priority-urgent { border-left-color: var(--accent-error, #ef4444) !important; }
          .notif-card--priority-high { border-left-color: var(--accent-warning, #f59e0b) !important; }
          .notif-card__icon-wrapper { width: 26px; height: 26px; border-radius: var(--radius-sm); background: var(--surface-secondary); border: 1px solid var(--border-brutalist); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
          .dark .notif-card__icon-wrapper { border-color: var(--border-default); }
          .notif-card__icon--approval { color: #10b981; }
          .notif-card__icon--event { color: #3b82f6; }
          .notif-card__icon--cert { color: #8b5cf6; }
          .notif-card__icon--message { color: #f59e0b; }
          .notif-card__icon--security { color: #ef4444; }
          .notif-card__icon--announcement { color: var(--accent-primary); }
          .notif-card__icon--default { color: var(--text-secondary); }
          .notif-card__body { flex: 1; min-width: 0; }
          .notif-card__top { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
          .notif-card__title { font-family: var(--font-body); font-size: 12px; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.3; }
          .dark .notif-card:hover .notif-card__title { color: #FFFFFF; }
          .notif-card__time { font-family: var(--font-mono); font-size: 9px; color: var(--text-tertiary); flex-shrink: 0; }
          .notif-card__message { font-family: var(--font-body); font-size: 11px; color: var(--text-secondary); margin: 3px 0 0 0; line-height: 1.4; }
          .dark .notif-card:hover .notif-card__message { color: rgba(255, 255, 255, 0.85); }
          .notif-card__action-row { margin-top: 5px; }
          .notif-card__action-btn { display: inline-flex; align-items: center; font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--accent-primary-text, var(--accent-primary)); transition: transform var(--transition-fast); }
          .notif-card:hover .notif-card__action-btn { transform: translateX(2px); }
          .notif-card__controls { display: flex; flex-direction: column; gap: 4px; align-items: center; flex-shrink: 0; }
          .notif-card__mark-btn, .notif-card__dismiss-btn { background: transparent; border: none; color: var(--text-tertiary); cursor: pointer; padding: 2px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; transition: all var(--transition-fast); width: 18px; height: 18px; }
          .notif-card__mark-btn:hover { background-color: var(--surface-secondary); color: #10b981; }
          .notif-card__dismiss-btn:hover { background-color: var(--surface-secondary); color: var(--accent-error, #ef4444); }
          .notif-empty { height: 100%; padding: var(--space-6) var(--space-4); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--text-tertiary); box-sizing: border-box; }
          .notif-empty__icon-wrap { width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--surface-secondary); border: 1px solid var(--border-default); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-2); color: var(--text-tertiary); }
          .notif-empty__title { font-family: var(--font-heading); font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0; }
          .notif-empty__desc { font-family: var(--font-body); font-size: 11px; color: var(--text-tertiary); margin: 0; max-width: 240px; }
          .notif-footer { padding: 8px 12px; background: var(--surface-secondary); border-top: 1px solid var(--border-default); display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; flex-shrink: 0; }
          .notif-footer__link { font-family: var(--font-body); font-size: 11px; font-weight: 600; color: var(--text-secondary); text-decoration: none; transition: color var(--transition-fast); }
          .notif-footer__link:hover { color: var(--text-primary); font-weight: 700; }
          .dark .notif-footer__link:hover { color: #FFFFFF; }
          .notif-footer__clear-btn { display: inline-flex; align-items: center; background: transparent; border: none; font-family: var(--font-body); font-size: 11px; color: var(--text-tertiary); cursor: pointer; padding: 2px 4px; border-radius: var(--radius-sm); transition: color var(--transition-fast); }
          .notif-footer__clear-btn:hover { color: var(--accent-error, #ef4444); }
        `
      }} />
      {/* Trigger Bell Button */}
      <button
        type="button"
        className={`notif-trigger ${open ? "notif-trigger--open" : ""} ${unreadCount > 0 ? "notif-trigger--has-unread" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={16} className="notif-trigger__icon" />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-label={`${unreadCount} unread alerts`}>
            <span className="notif-badge__ping" aria-hidden="true" />
            <span className="notif-badge__num">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Popover Dropdown Drawer */}
      {open && (
        <div className="notif-popover" role="dialog" aria-label="Notifications panel">
          {/* Header */}
          <div className="notif-header">
            <div className="notif-header__title-group">
              <span className="notif-header__title">Notifications</span>
              {unreadCount > 0 ? (
                <span className="notif-header__count">{unreadCount} new</span>
              ) : (
                <span className="notif-header__count notif-header__count--zero">All read</span>
              )}
            </div>

            <div className="notif-header__actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notif-header__btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCheck size={13} style={{ marginRight: "4px" }} />
                  Mark read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs (Rock-solid Box Model) */}
          <div className="notif-tabs">
            <button
              type="button"
              className={`notif-tab ${activeFilter === "all" ? "notif-tab--active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`notif-tab ${activeFilter === "unread" ? "notif-tab--active" : ""}`}
              onClick={() => setActiveFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              className={`notif-tab ${activeFilter === "important" ? "notif-tab--active" : ""}`}
              onClick={() => setActiveFilter("important")}
            >
              Important
            </button>
          </div>

          {/* List Content (Fixed Stable Container) */}
          <div className="notif-list">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`notif-card ${!item.read ? "notif-card--unread" : ""} notif-card--priority-${item.priority || "normal"}`}
                  onClick={() => handleActionClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleActionClick(item);
                  }}
                >
                  {/* Left Icon Pill */}
                  <div className="notif-card__icon-wrapper">{getTypeIcon(item.type)}</div>

                  {/* Body Content */}
                  <div className="notif-card__body">
                    <div className="notif-card__top">
                      <h4 className="notif-card__title">{item.title}</h4>
                      <span className="notif-card__time">{item.timeAgo}</span>
                    </div>

                    <p className="notif-card__message">{item.message}</p>

                    {item.link && (
                      <div className="notif-card__action-row">
                        <span className="notif-card__action-btn">
                          {item.actionLabel || "View Details"}
                          <ChevronRight size={12} style={{ marginLeft: "2px" }} />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Controls */}
                  <div className="notif-card__controls" onClick={(e) => e.stopPropagation()}>
                    {!item.read && (
                      <button
                        type="button"
                        className="notif-card__mark-btn"
                        title="Mark as read"
                        onClick={() => markAsRead(item.id)}
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="notif-card__dismiss-btn"
                      title="Dismiss notification"
                      onClick={(e) => dismissNotification(e, item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="notif-empty">
                <div className="notif-empty__icon-wrap">
                  <Inbox size={28} />
                </div>
                <p className="notif-empty__title">No notifications here</p>
                <p className="notif-empty__desc">
                  {activeFilter === "unread"
                    ? "You have marked all alerts as read."
                    : "You are up to date on all MEC Computer Club updates."}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="notif-footer">
            <Link
              href="/dashboard?mode=personal&tab=overview"
              className="notif-footer__link"
              onClick={() => setOpen(false)}
            >
              Member Profile
            </Link>

            {notifications.length > 0 && (
              <button type="button" className="notif-footer__clear-btn" onClick={clearAll}>
                <Trash2 size={11} style={{ marginRight: "3px" }} />
                Clear list
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
