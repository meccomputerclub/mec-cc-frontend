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
import "./NotificationCenter.css";

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
