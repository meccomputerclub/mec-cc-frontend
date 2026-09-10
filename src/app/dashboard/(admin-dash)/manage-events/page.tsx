"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Calendar,
  Users,
  Search,
  Plus,
  FilePlus,
  MoreVertical,
  Video,
  Image as ImageIcon,
  ChevronRight,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

type EventItem = {
  title: string;
  _id: string;
  date: string;
  eventTime: string;
  attendees: string[];
  isUpcoming: boolean;
  registrationLink: string;
  location: string;
  status: string;
  description: string;
  category: string;
};

type FormItem = {
  _id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
};

export default function EventsManagementPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [forms, setForms] = useState<FormItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tabs = ["All", "Events", "Forms", "Content"];

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/forms`, { withCredentials: true });
        setForms(response.data.data || []);
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/events`, { withCredentials: true });
        setEvents(response.data.data || []);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
    fetchForms();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: string, type: "event" | "form") => {
    setDeleteError(null);
    try {
      const endpoint = type === "event" ? `/api/events/${id}` : `/api/forms/${id}`;
      await axios.delete(`${API_BASE_URL}${endpoint}`, {
        withCredentials: true,
      });
      if (type === "event") {
        setEvents((prev) => prev.filter((e) => e._id !== id));
      } else {
        setForms((prev) => prev.filter((f) => f._id !== id));
      }
      setOpenDropdown(null);
    } catch {
      setDeleteError("Failed to delete. Please try again.");
    }
  };

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "All" || activeTab === "Events";
        return matchesSearch && matchesTab;
      }),
    [searchQuery, activeTab, events]
  );

  const filteredForms = useMemo(
    () =>
      forms.filter((f) => {
        const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "All" || activeTab === "Forms";
        return matchesSearch && matchesTab;
      }),
    [searchQuery, activeTab, forms]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b border-border-default pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
              Events &amp; Content Management
            </h2>
            <p className="text-text-secondary mt-1 text-sm">
              Manage your upcoming events, digital content, and registration forms.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/dashboard/manage-events/create-event"
              className="flex items-center gap-2 whitespace-nowrap bg-text-primary hover:bg-surface-inverse text-white px-4 py-2.5 rounded-lg font-semibold transition-all shadow-[3px_3px_0px_0px_var(--border-default)] text-sm border border-border-default"
              style={{ color: "#FFFFFF" }}
            >
              <Plus size={16} />
              New Event
            </Link>
            <Link
              href="/dashboard/manage-events/create-form"
              className="flex items-center gap-2 whitespace-nowrap bg-surface-elevated border border-border-default hover:bg-surface-secondary text-text-primary px-4 py-2.5 rounded-lg font-semibold transition-all shadow-[3px_3px_0px_0px_var(--border-default)] text-sm"
            >
              <FilePlus size={16} />
              Create Form
            </Link>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-surface-secondary p-1 rounded-xl w-fit border border-border-default overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                    ? "bg-surface-elevated text-text-primary shadow-[2px_2px_0px_0px_var(--border-default)] border border-border-default"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-default bg-surface-elevated text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none transition-all shadow-sm text-sm"
            />
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {deleteError}
        </div>
      )}

      {/* Events Grid */}
      {(activeTab === "All" || activeTab === "Events") && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-text-primary">
              <Calendar className="text-accent-primary" size={20} />
              Active Events
              <span className="ml-1 px-2 py-0.5 text-xs bg-surface-secondary rounded-full text-text-secondary">
                {filteredEvents.length}
              </span>
            </h3>
          </div>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event._id}
                  onClick={() => router.push(`/dashboard/manage-events/event-detail/${event._id}`)}
                  className="group relative bg-surface-elevated p-6 rounded-2xl shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-[6px_6px_0px_0px_var(--border-default)] hover:-translate-y-0.5 border border-border-default transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  {/* Dropdown */}
                  <div
                    className="absolute top-4 right-4 z-10"
                    ref={openDropdown === event._id ? dropdownRef : null}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === event._id ? null : event._id);
                      }}
                      className="p-1.5 hover:bg-surface-secondary rounded-lg text-text-secondary transition-colors"
                      aria-label="Options"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openDropdown === event._id && (
                      <div
                        className="absolute right-0 mt-1 w-44 bg-surface-elevated rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] border border-border-default z-20 py-1 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/manage-events/event-detail/${event._id}`);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary transition"
                        >
                          <Pencil size={13} /> Edit / Manage
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/manage-events/event-detail/${event._id}`);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary transition"
                        >
                          <Eye size={13} /> View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event._id, "event");
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-accent-error hover:bg-surface-secondary transition"
                        >
                          <Trash2 size={13} /> Delete Event
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="inline-block px-2 py-1 rounded-md bg-accent-success text-surface-elevated text-[10px] font-semibold uppercase tracking-wider mb-4">
                      {event.status}
                    </div>
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-primary transition-colors pr-6">
                      {event.title}
                    </h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-text-secondary gap-2">
                        <Calendar size={14} />
                        {new Date(event.date).toDateString().split(" ").slice(1).join(" ")}
                      </div>
                      <div className="flex items-center text-sm text-text-secondary gap-2">
                        <Users size={14} />
                        <span className="font-semibold text-text-primary">
                          {event.attendees?.length ?? 0}
                        </span>{" "}
                        registered
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border-default flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/manage-events/event-detail/${event._id}`);
                      }}
                      className="text-sm font-semibold text-accent-primary flex items-center gap-1 hover:underline"
                    >
                      Manage <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/manage-events/event-detail/${event._id}`);
                      }}
                      className="text-sm font-semibold text-text-secondary hover:text-text-primary"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState query={searchQuery} />
          )}
        </section>
      )}

      {/* Forms Grid */}
      {(activeTab === "All" || activeTab === "Forms") && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-text-primary">
              <FilePlus className="text-accent-primary" size={20} />
              Active Forms
              <span className="ml-1 px-2 py-0.5 text-xs bg-surface-secondary rounded-full text-text-secondary">
                {filteredForms.length}
              </span>
            </h3>
          </div>
          {filteredForms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <div
                  key={form._id}
                  onClick={() => router.push(`/dashboard/manage-events/forms/${form._id}`)}
                  className="group relative bg-surface-elevated p-6 rounded-2xl shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-[6px_6px_0px_0px_var(--border-default)] hover:-translate-y-0.5 border border-border-default transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  {/* Dropdown */}
                  <div
                    className="absolute top-4 right-4 z-10"
                    ref={openDropdown === form._id ? dropdownRef : null}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === form._id ? null : form._id);
                      }}
                      className="p-1.5 hover:bg-surface-secondary rounded-lg text-text-secondary transition-colors"
                      aria-label="Options"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openDropdown === form._id && (
                      <div
                        className="absolute right-0 mt-1 w-44 bg-surface-elevated rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] border border-border-default z-20 py-1 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/manage-events/forms/${form._id}/edit`);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary transition"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/manage-events/forms/${form._id}`);
                            setOpenDropdown(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-secondary transition"
                        >
                          <Eye size={13} /> View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(form._id, "form");
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-accent-error hover:bg-surface-secondary transition"
                        >
                          <Trash2 size={13} /> Delete Form
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="inline-block px-2 py-1 rounded-md bg-accent-success text-surface-elevated text-[10px] font-semibold uppercase tracking-wider mb-4">
                      {form.status}
                    </div>
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-accent-primary transition-colors pr-6">
                      {form.title}
                    </h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-text-secondary gap-2">
                        <Calendar size={14} />
                        Ends: {new Date(form.endDate).toDateString().split(" ").slice(1).join(" ")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border-default flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/manage-events/forms/${form._id}`);
                      }}
                      className="text-sm font-semibold text-accent-primary flex items-center gap-1 hover:underline"
                    >
                      View Responses <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/manage-events/forms/${form._id}/edit`);
                      }}
                      className="text-sm font-semibold text-text-secondary hover:text-accent-primary transition"
                    >
                      Edit Form
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState query={searchQuery} />
          )}
        </section>
      )}

      {/* CMS Quick Links */}
      <section className="pt-8 border-t border-border-default">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-text-primary">
          <Video className="text-accent-primary" size={20} />
          Media &amp; Tutorials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CMSCard
            title="Resource Center"
            desc="Update your documentation and video guides."
            icon={<Video className="text-accent-primary" />}
            btnText="Open CMS"
            link="/dashboard/assets"
          />
          <CMSCard
            title="Media Gallery"
            desc="Manage assets, photos, and branding files."
            icon={<ImageIcon className="text-accent-primary" />}
            btnText="Upload Media"
            link="/dashboard/assets"
          />
        </div>
      </section>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-16 bg-surface-elevated rounded-2xl border-2 border-dashed border-border-default shadow-[4px_4px_0px_0px_var(--border-default)]">
      <Search className="mx-auto text-text-secondary mb-4" size={36} />
      <p className="text-text-secondary text-sm font-semibold">
        {query ? `No matches found for "${query}"` : "No items yet."}
      </p>
    </div>
  );
}

interface CMSCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  btnText: string;
  link: string;
}

function CMSCard({ title, desc, icon, btnText, link }: CMSCardProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(link)}
      className="flex items-center justify-between p-5 bg-surface-elevated rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-[6px_6px_0px_0px_var(--border-default)] hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-surface-secondary rounded-xl group-hover:bg-accent-primary-light transition-colors">{icon}</div>
        <div>
          <h4 className="font-semibold text-text-primary text-sm group-hover:text-accent-primary transition-colors">{title}</h4>
          <p className="text-xs text-text-secondary">{desc}</p>
        </div>
      </div>
      <Link
        href={link}
        onClick={(e) => e.stopPropagation()}
        className="bg-text-primary hover:bg-surface-inverse text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-[2px_2px_0px_0px_var(--border-default)] whitespace-nowrap"
        style={{ color: "#FFFFFF" }}
      >
        {btnText}
      </Link>
    </div>
  );
}

