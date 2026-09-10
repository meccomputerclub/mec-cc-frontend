"use client";
import React, { useEffect } from "react";
import {
  Users, ClipboardCheck, Calendar, FileText,
  Zap, MessageSquare, GalleryHorizontal, HardHat,
  LayoutDashboard, PenLine, FolderOpen, DollarSign,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { DashboardStats } from "@/types";
import Link from "next/link";

export default function AdminOverview() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [recentMessages, setRecentMessages] = React.useState<Array<{
    _id: string;
    subject: string;
    senderName: string;
    senderEmail: string;
    isRead: boolean;
    createdAt: string;
  }>>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, msgsRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/dashboard/admin-stats`,
            { withCredentials: true }
          ),
          axios.get(
            `${API_BASE_URL}/api/contact-messages?limit=4`,
            { withCredentials: true }
          ),
        ]);
        setStats(statsRes.data.data);
        setRecentMessages(msgsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const quickActions = [
    { href: "/dashboard/manage-events/create-event", icon: Calendar, label: "Create Event" },
    { href: "/dashboard/members", icon: Users, label: "Approve Members" },
    { href: "/dashboard/assets", icon: GalleryHorizontal, label: "Upload Media" },
    { href: "/dashboard/assets", icon: HardHat, label: "Manage Assets" },
    { href: "/dashboard/overview/home-page-edit", icon: LayoutDashboard, label: "Home Page Editor" },
    { href: "/dashboard/messages", icon: MessageSquare, label: "View Messages" },
    { href: "/dashboard/blogs", icon: PenLine, label: "Write Blog" },
    { href: "/dashboard/projects", icon: FolderOpen, label: "Add Project" },
    { href: "/dashboard/sponsors/create", icon: DollarSign, label: "Add Sponsor" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-64 bg-surface-secondary border border-border-default rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-secondary border border-border-default rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Members",
      value: stats?.membership.totalMembers ?? "—",
      icon: Users,
      color: "text-accent-primary",
      link: "/dashboard/members",
    },
    {
      title: "Pending Applications",
      value: stats?.membership.pendingApplications ?? "—",
      icon: ClipboardCheck,
      color: "text-accent-error",
      link: "/dashboard/members",
    },
    {
      title: "Upcoming Events",
      value: stats?.activities.upcomingEvents ?? "—",
      icon: Calendar,
      color: "text-accent-success",
      link: "/dashboard/manage-events",
    },
    {
      title: "Total Certificates",
      value: stats?.activities.totalCertificates ?? "—",
      icon: FileText,
      color: "text-accent-warning",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-border-default pb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary">
          Platform Health Overview
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Welcome back, <strong className="text-text-primary">{user?.fullName || user?.email}</strong>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Inner = (
            <div
              className={`bg-surface-elevated rounded-xl border border-border-default p-4 shadow-[4px_4px_0px_0px_var(--border-default)] flex flex-col gap-3 transition hover:shadow-[6px_6px_0px_0px_var(--border-default)] ${card.link ? "cursor-pointer" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  {card.title}
                </p>
                <card.icon size={18} className={card.color} />
              </div>
              <p className="text-3xl font-semibold text-text-primary leading-none">
                {card.value}
              </p>
            </div>
          );

          return card.link ? (
            <Link key={card.title} href={card.link}>
              {Inner}
            </Link>
          ) : (
            <div key={card.title}>{Inner}</div>
          );
        })}
      </div>

      {/* Action Center & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-surface-elevated rounded-xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] p-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
            <Zap size={15} className="text-accent-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center justify-center gap-2 py-4 px-2 bg-surface-secondary rounded-xl border border-border-default hover:border-accent-primary hover:shadow-[3px_3px_0px_0px_var(--accent-primary)] transition-all group"
              >
                <action.icon
                  size={20}
                  className="text-accent-primary group-hover:scale-110 transition-transform"
                />
                <span className="text-xs font-semibold text-text-secondary text-center leading-tight group-hover:text-text-primary transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-surface-elevated rounded-xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] p-5">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
            <MessageSquare size={15} className="text-accent-primary" />
            Recent Messages
          </h3>
          {recentMessages.length === 0 ? (
            <p className="text-xs text-text-secondary font-semibold py-4 text-center">No messages yet</p>
          ) : (
            <ul className="space-y-1">
              {recentMessages.map((msg) => (
                <li
                  key={msg._id}
                  className={`p-3 rounded-lg border-b border-border-default last:border-0 hover:bg-surface-secondary transition-colors cursor-pointer ${!msg.isRead ? "font-semibold" : ""
                    }`}
                >
                  <p className={`text-sm truncate ${!msg.isRead ? "font-semibold text-text-primary" : "font-semibold text-text-secondary"}`}>
                    {!msg.isRead && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-primary mr-1.5 mb-0.5" />
                    )}
                    {msg.subject}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    From: {msg.senderName}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 pt-3 border-t border-border-default">
            <Link
              href="/dashboard/messages"
              className="text-xs font-semibold text-accent-primary hover:underline flex items-center gap-1"
            >
              View All Messages →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
