"use client";

import React, { useState } from "react";
import {
  Calendar, MapPin, Tag, Link as LinkIcon, AlignLeft, Type, Clock,
  Save, ArrowLeft, Users, DollarSign, Mail, Phone,
  Globe, Code, Eye, EyeOff, Info, Image as ImageIcon,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ui/shared/ImageUpload";
import TagInput from "@/components/ui/shared/TagInput";

// ── Reusable field wrapper ──────────────────────────────────────────────────
function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

// ── Input with optional left icon ──────────────────────────────────────────
function Input({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input
        {...props}
        className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-sm ${props.className || ""}`}
      />
    </div>
  );
}

// ── Image upload widget ─────────────────────────────────────────────────────
// Replaced by shared ImageUpload component

// ── Section card ────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, color = "text-indigo-500", children }: {
  icon: React.ElementType; title: string; color?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Icon className={`w-5 h-5 ${color}`} />
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────────────────
const CATEGORIES = ["workshop", "seminar", "contest", "conference", "hackathon", "social", "other"];
const STATUSES = ["scheduled", "ongoing", "completed", "cancelled", "postponed"];

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "seminar",
    status: "scheduled",
    description: "",
    date: "",
    endDate: "",
    eventTime: "",
    location: "",
    onlineLink: "",
    registrationLink: "",
    registrationDeadline: "",
    maxParticipants: "",
    registrationFee: "0",
    coverImageUrl: "",
    bannerImageUrl: "",
    organizer: "",
    contactEmail: "",
    contactPhone: "",
    isPublished: true,
    customHtmlSection: "",
  });
  const [tags, setTags] = useState<string[]>([]);

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        tags,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        registrationFee: Number(form.registrationFee),
        date: form.date || undefined,
        endDate: form.endDate || undefined,
        registrationDeadline: form.registrationDeadline || undefined,
      };
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, payload, { withCredentials: true });
      router.push("/dashboard/manage-events");
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || "Failed to create event." : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard/manage-events"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition flex-shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">Create New Event</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Fill in the details and publish</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={form.isPublished}
              onChange={(e) => set("isPublished", e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="hidden sm:inline">Publish</span>
          </label>
          <button type="submit" form="event-form" disabled={saving}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition disabled:opacity-60">
            <Save size={15} />
            {saving ? "Saving…" : "Create Event"}
          </button>
        </div>
      </div>

      <form id="event-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── 1. General Info ── */}
        <Section icon={Type} title="General Information">
          <Field label="Event Title" required>
            <Input icon={Type} name="title" required placeholder="e.g. MEC Intra Programming Contest 2025"
              value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Category" required>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select value={form.category} onChange={(e) => set("category", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Description" required>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <textarea name="description" required rows={4} placeholder="Describe the event, its goals, and what participants can expect…"
                value={form.description} onChange={(e) => set("description", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-y" />
            </div>
          </Field>

          <Field label="Tags" hint="Press Enter or comma to add. Backspace to remove last.">
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="programming, AI, robotics…"
            />
          </Field>
        </Section>

        {/* ── 2. Date & Location ── */}
        <Section icon={Calendar} title="Date & Location" color="text-blue-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Start Date" required>
              <Input icon={Calendar} type="date" required value={form.date}
                onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="End Date" hint="Leave blank for single-day events">
              <Input icon={Calendar} type="date" value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)} />
            </Field>
            <Field label="Time / Duration">
              <Input icon={Clock} placeholder="e.g. 09:00 AM – 05:00 PM" value={form.eventTime}
                onChange={(e) => set("eventTime", e.target.value)} />
            </Field>
          </div>

          <Field label="Venue / Location" required>
            <Input icon={MapPin} required placeholder="e.g. Department of CSE, MEC" value={form.location}
              onChange={(e) => set("location", e.target.value)} />
          </Field>

          <Field label="Online Link" hint="Zoom, Google Meet, or live stream URL">
            <Input icon={Globe} type="url" placeholder="https://meet.google.com/..." value={form.onlineLink}
              onChange={(e) => set("onlineLink", e.target.value)} />
          </Field>
        </Section>

        {/* ── 3. Registration ── */}
        <Section icon={Users} title="Registration" color="text-green-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Registration Link">
              <Input icon={LinkIcon} type="url" placeholder="https://forms.gle/..." value={form.registrationLink}
                onChange={(e) => set("registrationLink", e.target.value)} />
            </Field>
            <Field label="Registration Deadline">
              <Input icon={Calendar} type="date" value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)} />
            </Field>
            <Field label="Max Participants">
              <Input icon={Users} type="number" min="1" placeholder="e.g. 100" value={form.maxParticipants}
                onChange={(e) => set("maxParticipants", e.target.value)} />
            </Field>
            <Field label="Registration Fee (BDT)">
              <Input icon={DollarSign} type="number" min="0" placeholder="0 for free" value={form.registrationFee}
                onChange={(e) => set("registrationFee", e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── 4. Media ── */}
        <Section icon={ImageIcon} title="Event Images" color="text-purple-500">
          <Field label="Cover Image" hint="Shown in event cards (recommended: 16:9, min 800×450px)">
            <ImageUpload
              label=""
              value={form.coverImageUrl}
              onChange={(url) => set("coverImageUrl", url)}
              folder="events"
              hint="Shown in event cards (recommended: 16:9, min 800×450px)"
            />
          </Field>
          <Field label="Banner / Hero Image" hint="Full-width banner shown on the event detail page">
            <ImageUpload
              label=""
              value={form.bannerImageUrl}
              onChange={(url) => set("bannerImageUrl", url)}
              folder="events"
              hint="Full-width banner shown on the event detail page"
            />
          </Field>
        </Section>

        {/* ── 5. Organiser ── */}
        <Section icon={Info} title="Organiser & Contact" color="text-orange-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Organiser Name">
              <Input icon={Users} placeholder="e.g. MEC Computer Club" value={form.organizer}
                onChange={(e) => set("organizer", e.target.value)} />
            </Field>
            <Field label="Contact Email">
              <Input icon={Mail} type="email" placeholder="events@meccomputerclub.org" value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)} />
            </Field>
            <Field label="Contact Phone">
              <Input icon={Phone} type="tel" placeholder="+8801XXXXXXXXX" value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── 6. Custom HTML Section ── */}
        <Section icon={Code} title="Custom HTML Section" color="text-rose-500">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 flex gap-2">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>Dynamic content area.</strong> Use this to add post-event updates — selected participant lists, schedules, results, or any custom HTML. This section is rendered below the main event details on the public page.
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">HTML Editor</span>
            <button type="button" onClick={() => setShowHtmlPreview((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              {showHtmlPreview ? <><EyeOff size={13} /> Hide Preview</> : <><Eye size={13} /> Show Preview</>}
            </button>
          </div>

          <textarea
            rows={12}
            placeholder={`<!-- Example: Participant list -->
<h2>Selected Participants</h2>
<table>
  <thead><tr><th>Name</th><th>ID</th></tr></thead>
  <tbody>
    <tr><td>Alice</td><td>1801001</td></tr>
  </tbody>
</table>`}
            value={form.customHtmlSection}
            onChange={(e) => set("customHtmlSection", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-900 text-green-400 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
            spellCheck={false}
          />

          {showHtmlPreview && form.customHtmlSection && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800">
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Preview</p>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: form.customHtmlSection }}
              />
            </div>
          )}
        </Section>

        {/* Bottom actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/dashboard/manage-events"
            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition disabled:opacity-60 text-sm">
            <Save size={16} />
            {saving ? "Creating…" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
