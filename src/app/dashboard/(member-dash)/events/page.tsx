"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, MapPin, Clock, RefreshCw, FileText } from "lucide-react";
import { FormsTab } from "@/components/dashboard/legacy/FormsTab";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface EventItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  eventTime: string;
  location: string;
  status: string;
  category: string;
  isUpcoming: boolean;
}

export default function MemberEventsPage() {
  const [activeTab, setActiveTab] = useState<"events" | "forms">("events");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/events`, {
        withCredentials: true,
      });
      setEvents(res.data.data || res.data);
    } catch {
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchForms = async () => {
    try {
      const res = await api.get("/api/forms/active");
      if (res && res.data) {
        setForms(res.data);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchForms();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchEvents}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const upcoming = events.filter((e) => e.isUpcoming);
  const past = events.filter((e) => !e.isUpcoming);

  return (
    <div className="space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-3 border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="text-blue-500" size={28} />
          Events & Club Forms
        </h2>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "events"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
          >
            <Calendar size={14} />
            <span>Events</span>
          </button>
          <button
            onClick={() => setActiveTab("forms")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${activeTab === "forms"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
          >
            <FileText size={14} />
            <span>Registration Forms</span>
          </button>
        </div>
      </div>

      {activeTab === "forms" ? (
        user ? (
          <FormsTab user={user} forms={forms} />
        ) : (
          <div className="text-center py-10 text-gray-500">Please sign in to view forms.</div>
        )
      ) : upcoming.length === 0 && past.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          No events found.
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Upcoming
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Past Events
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((event) => (
                  <EventCard key={event._id} event={event} muted />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, muted = false }: { event: EventItem; muted?: boolean }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-md ${muted
          ? "border-gray-200 dark:border-gray-800 opacity-70"
          : "border-blue-100 dark:border-blue-900/40 shadow-sm"
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">
          {event.title}
        </h4>
        <span
          className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md ${event.isUpcoming
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}
        >
          {event.status || (event.isUpcoming ? "Upcoming" : "Past")}
        </span>
      </div>

      {event.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="space-y-1.5 mt-auto">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={13} />
          {new Date(event.date).toDateString().split(" ").slice(1).join(" ")}
        </div>
        {event.eventTime && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock size={13} />
            {event.eventTime}
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={13} />
            {event.location}
          </div>
        )}
      </div>
    </div>
  );
}
