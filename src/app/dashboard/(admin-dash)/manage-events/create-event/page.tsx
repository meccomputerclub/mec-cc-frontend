"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import {
  Calendar, MapPin, Tag, Link as LinkIcon, AlignLeft, Type, Clock,
  Save, ArrowLeft, Users, DollarSign, Mail, Phone,
  Globe, Code, Eye, EyeOff, Info, Image as ImageIcon, Trophy,
  ListChecks, Plus, Trash2, HelpCircle, CheckCircle2, UserCheck, ShieldAlert
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "@/components/ui/shared/ImageUpload";
import TagInput from "@/components/ui/shared/TagInput";
import { Select } from "@/components/ui/Select";
import { useSiteSettings } from "@/context/SiteSettingsContext";

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

// ── Main form options ───────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "contest", label: "Contest" },
  { value: "conference", label: "Conference" },
  { value: "hackathon", label: "Hackathon" },
  { value: "gaming", label: "Gaming Tournament" },
  { value: "social", label: "Social" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed (Past Event)" },
  { value: "cancelled", label: "Cancelled" },
  { value: "postponed", label: "Postponed" },
];

const REGISTRATION_TYPE_OPTIONS = [
  { value: "individual", label: "Individual Registration" },
  { value: "team", label: "Team / Squad Registration" },
];

function CreateEventFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { settings } = useSiteSettings();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "workshop",
    status: "scheduled",
    registrationType: "individual",
    teamSizeMin: 1,
    teamSizeMax: 4,
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
    prizePool: "",
    linkedForm: "",
    customHtmlSection: "",
    allowParticipationClaims: false,
  });

  const [availableForms, setAvailableForms] = useState<{ _id: string; title: string; eventId?: any }[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [rewards, setRewards] = useState<{ position: string; prize: string }[]>([]);
  const [schedule, setSchedule] = useState<{ time: string; title: string; description: string }[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [contributors, setContributors] = useState<{ name: string; role: string; department: string }[]>([]);

  // Default contact information from global site settings (user instruction #3)
  useEffect(() => {
    if (!editId && settings) {
      setForm((prev) => ({
        ...prev,
        organizer: prev.organizer || settings.club_name || "MEC Computer Club",
        contactEmail: prev.contactEmail || settings.contact_email || "meccomputerclub@gmail.com",
        contactPhone: prev.contactPhone || settings.contact_phone || "",
      }));
    }
  }, [settings, editId]);

  const set = (key: keyof typeof form, value: string | boolean | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Check if event is in the past (user instruction #1)
  const isPastEvent = useMemo(() => {
    if (form.status === "completed") return true;
    if (!form.date) return false;
    const eventDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  }, [form.date, form.status]);

  // If event is no longer past, automatically reset allowParticipationClaims
  useEffect(() => {
    if (!isPastEvent && form.allowParticipationClaims) {
      set("allowParticipationClaims", false);
    }
  }, [isPastEvent, form.allowParticipationClaims]);

  // Independent forms or forms currently linked to this event
  const selectableForms = useMemo(() => {
    return availableForms.filter((f) => {
      if (form.linkedForm && f._id === form.linkedForm) return true;
      const evId = f.eventId?._id ? String(f.eventId._id) : (f.eventId ? String(f.eventId) : undefined);
      if (editId && evId === editId) return true;
      const isIndependent = !evId || evId === "" || evId === "111111111111111111111111";
      return isIndependent;
    });
  }, [availableForms, form.linkedForm, editId]);

  // Pre-load available forms from Form Builder
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/forms`, { withCredentials: true })
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setAvailableForms(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  // Pre-load if editing
  useEffect(() => {
    if (!editId) return;
    async function loadEvent() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/events/${editId}`, { withCredentials: true });
        const ev = res.data.data;
        if (ev) {
          setForm({
            title: ev.title || "",
            category: ev.category || "workshop",
            status: ev.status || "scheduled",
            registrationType: ev.registrationType || "individual",
            teamSizeMin: ev.teamSize?.min || 1,
            teamSizeMax: ev.teamSize?.max || 4,
            description: ev.description || "",
            date: ev.date ? ev.date.split("T")[0] : "",
            endDate: ev.endDate ? ev.endDate.split("T")[0] : "",
            eventTime: ev.eventTime || "",
            location: ev.location || "",
            onlineLink: ev.onlineLink || "",
            registrationLink: ev.registrationLink || "",
            registrationDeadline: ev.registrationDeadline ? ev.registrationDeadline.split("T")[0] : "",
            maxParticipants: ev.maxParticipants ? String(ev.maxParticipants) : "",
            registrationFee: ev.registrationFee !== undefined ? String(ev.registrationFee) : "0",
            coverImageUrl: ev.coverImageUrl || "",
            bannerImageUrl: ev.bannerImageUrl || "",
            organizer: ev.organizer || "",
            contactEmail: ev.contactEmail || "",
            contactPhone: ev.contactPhone || "",
            isPublished: ev.isPublished ?? true,
            customHtmlSection: ev.customHtmlSection || "",
            prizePool: ev.prizePool || "",
            linkedForm: ev.linkedForm?._id || ev.linkedForm || (ev.forms && ev.forms[0]?._id) || (ev.forms && ev.forms[0]) || "",
            allowParticipationClaims: ev.allowParticipationClaims ?? false,
          });
          if (ev.tags) setTags(ev.tags);
          if (ev.rewards) setRewards(ev.rewards);
          if (ev.schedule) setSchedule(ev.schedule);
          if (ev.rules) setRules(ev.rules);
          if (ev.contributors) setContributors(ev.contributors);
        }
      } catch (err) {
        console.error("Failed to load event for edit", err);
      }
    }
    loadEvent();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        linkedForm: form.linkedForm ? form.linkedForm : "",
        registrationLink: form.registrationLink ? form.registrationLink.trim() : "",
        allowParticipationClaims: isPastEvent ? form.allowParticipationClaims : false,
        contributors: contributors.filter((c) => c.name.trim() && c.role.trim()),
        tags,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
        registrationFee: Number(form.registrationFee) || 0,
        teamSize: form.registrationType === "team" ? { min: Number(form.teamSizeMin), max: Number(form.teamSizeMax) } : undefined,
        date: form.date || undefined,
        endDate: form.endDate || undefined,
        registrationDeadline: form.registrationDeadline || undefined,
        rewards: rewards.filter((r) => r.position.trim() && r.prize.trim()),
        schedule: schedule.filter((s) => s.time.trim() && s.title.trim()),
        rules: rules.filter((r) => r.trim()),
      };

      if (editId) {
        await axios.patch(`${API_BASE_URL}/api/events/${editId}`, payload, { withCredentials: true });
      } else {
        await axios.post(`${API_BASE_URL}/api/events`, payload, { withCredentials: true });
      }
      router.push("/dashboard/manage-events");
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || "Failed to save event." : "Unexpected error.");
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
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
              {editId ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Configure event details, archiving, contributors, and registration rules
            </p>
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
            {saving ? "Saving…" : editId ? "Update Event" : "Create Event"}
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
            <Input icon={Type} name="title" required placeholder="e.g. Workshop on Modern Full-Stack Development"
              value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Category" required>
              <Select
                value={form.category}
                onChange={(val) => set("category", val)}
                options={CATEGORY_OPTIONS}
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(val) => set("status", val)}
                options={STATUS_OPTIONS}
              />
            </Field>
          </div>

          <Field label="Description" required>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <textarea name="description" required rows={4} placeholder="Describe the purpose, highlights, syllabus, eligibility, and what attendees will experience…"
                value={form.description} onChange={(e) => set("description", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-y" />
            </div>
          </Field>

          <Field label="Tags" hint="Press Enter or comma to add tags (e.g. Workshop, Python, WebDev, AI)">
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Add tags…"
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
              <Input icon={Clock} placeholder="e.g. 10:00 AM – 04:00 PM" value={form.eventTime}
                onChange={(e) => set("eventTime", e.target.value)} />
            </Field>
          </div>

          <Field label="Venue / Location" required>
            <Input icon={MapPin} required placeholder="e.g. MEC Campus Auditorium / CSE Lab 2" value={form.location}
              onChange={(e) => set("location", e.target.value)} />
          </Field>

          <Field label="Online / Meeting Link" hint="Google Meet, Zoom, Discord, or YouTube live stream link">
            <Input icon={Globe} type="url" placeholder="https://meet.google.com/... or https://zoom.us/..." value={form.onlineLink}
              onChange={(e) => set("onlineLink", e.target.value)} />
          </Field>
        </Section>

        {/* ── 3. Past Event Archiving & Participation Claims (User Instruction #1) ── */}
        <Section icon={UserCheck} title="Past Event Archiving & Participation Claims" color="text-emerald-500">
          {isPastEvent ? (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    Allow Participation Claims (&quot;I Participated&quot;)
                  </span>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                    This is recognized as a past event. When enabled, logged-in students who visit this event page can click &quot;I Participated&quot; to claim attendance. You can review, approve, or reject each claim in the dashboard.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={form.allowParticipationClaims}
                    onChange={(e) => set("allowParticipationClaims", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start gap-3 text-xs text-slate-500 leading-relaxed">
              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong>Upcoming Event Notice:</strong> Participation claims (&quot;I Participated&quot;) can only be enabled for events that have already occurred. Once this event concludes or status is set to &quot;Completed&quot;, you will be able to enable participation claims here.
              </div>
            </div>
          )}
        </Section>

        {/* ── 4. Event Contributors & Organizing Team ── */}
        <Section icon={Users} title="Event Contributors & Organizing Team" color="text-indigo-500">
          <p className="text-xs text-slate-500 leading-relaxed">
            Acknowledge the key people who organized, mentored, spoke, or contributed to this event. These individuals will be credited on the public event page.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Contributors List
              </label>
              <button
                type="button"
                onClick={() => setContributors([...contributors, { name: "", role: "", department: "" }])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={14} /> Add Contributor
              </button>
            </div>

            {contributors.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No contributors added yet. Click &quot;Add Contributor&quot; to credit speakers, mentors, or lead organizers.
              </p>
            ) : (
              contributors.map((contrib, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Dr. John Doe)"
                    value={contrib.name}
                    onChange={(e) => {
                      const next = [...contributors];
                      next[idx].name = e.target.value;
                      setContributors(next);
                    }}
                    className="w-full sm:w-1/3 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Keynote Speaker / Lead Organizer)"
                    value={contrib.role}
                    onChange={(e) => {
                      const next = [...contributors];
                      next[idx].role = e.target.value;
                      setContributors(next);
                    }}
                    className="w-full sm:w-1/3 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Dept / Affiliation (optional)"
                    value={contrib.department}
                    onChange={(e) => {
                      const next = [...contributors];
                      next[idx].department = e.target.value;
                      setContributors(next);
                    }}
                    className="w-full sm:flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setContributors(contributors.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-400 hover:text-red-500 transition self-end sm:self-center"
                    title="Remove contributor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* ── 5. Registration Settings ── */}
        <Section icon={Users} title="Registration Settings" color="text-green-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Registration Mode" hint="Individual participant or multi-member team">
              <Select
                value={form.registrationType}
                onChange={(val) => set("registrationType", val)}
                options={REGISTRATION_TYPE_OPTIONS}
              />
            </Field>
            <Field label="Registration Deadline" hint="Optional deadline for upcoming events">
              <Input icon={Calendar} type="date" value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)} />
            </Field>
          </div>

          {form.registrationType === "team" && (
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
                <Users size={16} /> Team / Squad Roster Constraints
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Minimum Members per Team" hint="e.g. 2 for pair, 4 for squad">
                  <Input type="number" min="1" max="10" value={form.teamSizeMin}
                    onChange={(e) => set("teamSizeMin", Number(e.target.value))} />
                </Field>
                <Field label="Maximum Members per Team" hint="e.g. 4 or 5 with substitute">
                  <Input type="number" min="1" max="10" value={form.teamSizeMax}
                    onChange={(e) => set("teamSizeMax", Number(e.target.value))} />
                </Field>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Max Participants / Teams" hint="Leave blank for unlimited">
              <Input icon={Users} type="number" min="1" placeholder="e.g. 100" value={form.maxParticipants}
                onChange={(e) => set("maxParticipants", e.target.value)} />
            </Field>
            <Field label="Registration Fee (BDT)">
              <Input icon={DollarSign} type="number" min="0" placeholder="0 for free" value={form.registrationFee}
                onChange={(e) => set("registrationFee", e.target.value)} />
            </Field>
          </div>

          {/* Direct External Registration URL */}
          <Field label="External Registration URL (Optional)" hint="Paste a Google Form, Microsoft Form, or external ticketing link if registration is hosted outside">
            <Input icon={LinkIcon} type="url" placeholder="https://forms.gle/... or https://eventbrite.com/..."
              value={form.registrationLink} onChange={(e) => set("registrationLink", e.target.value)} />
          </Field>

          {/* Form Builder Linkage */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ListChecks size={16} className="text-indigo-500" />
                Custom Form Linkage (Form Builder)
              </span>
              <Link
                href={
                  editId
                    ? `/dashboard/manage-events/create-form?eventId=${editId}&eventTitle=${encodeURIComponent(form.title || "Event")}`
                    : `/dashboard/manage-events/create-form`
                }
                target="_blank"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Plus size={13} /> Open Form Builder →
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Link a custom registration form created in our Form Builder. Once linked, the public registration button will open this interactive form.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <Field label="Select Registration Form">
                <Select
                  value={form.linkedForm || ""}
                  onChange={(val) => set("linkedForm", val)}
                  options={[
                    { value: "", label: "No Form Linked (Optional / Build Later)" },
                    ...selectableForms.map((f) => ({
                      value: f._id,
                      label: `${f.title}${f._id === form.linkedForm ? " (Linked to this Event)" : " (Independent Form)"}`,
                    })),
                  ]}
                />
              </Field>
              {form.linkedForm && (
                <div className="pb-0.5">
                  <Link
                    href={`/forms/${form.linkedForm}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold hover:border-indigo-500 transition shadow-sm"
                  >
                    <Globe size={14} className="text-indigo-500" />
                    Preview Live Public Form →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ── 6. Prizes & Rewards (Optional) ── */}
        <Section icon={Trophy} title="Prize Pool & Rewards (Optional)" color="text-amber-500">
          <Field label="Total Prize Pool Title" hint="e.g. ৳15,000 BDT or Grand Trophy + Swags">
            <Input icon={Trophy} placeholder="e.g. ৳15,000 BDT" value={form.prizePool}
              onChange={(e) => set("prizePool", e.target.value)} />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Prize Breakdown by Podium Position
              </label>
              <button
                type="button"
                onClick={() => setRewards([...rewards, { position: "", prize: "" }])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={14} /> Add Position
              </button>
            </div>

            {rewards.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No prize breakdown added. Click &quot;Add Position&quot; if this event offers awards or certificates.
              </p>
            ) : (
              rewards.map((rew, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Position (e.g. 1st Place)"
                    value={rew.position}
                    onChange={(e) => {
                      const next = [...rewards];
                      next[idx].position = e.target.value;
                      setRewards(next);
                    }}
                    className="w-1/3 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Prize (e.g. ৳5,000 + Certificate)"
                    value={rew.prize}
                    onChange={(e) => {
                      const next = [...rewards];
                      next[idx].prize = e.target.value;
                      setRewards(next);
                    }}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setRewards(rewards.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* ── 7. Schedule Timeline (Optional) ── */}
        <Section icon={Clock} title="Schedule Timeline (Optional)" color="text-teal-500">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Event Stages & Timing
              </label>
              <button
                type="button"
                onClick={() => setSchedule([...schedule, { time: "", title: "", description: "" }])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={14} /> Add Timeline Item
              </button>
            </div>

            {schedule.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No schedule items added yet. Click &quot;Add Timeline Item&quot; to lay out sessions or match timings.
              </p>
            ) : (
              schedule.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Time (e.g. 10:00 AM)"
                      value={item.time}
                      onChange={(e) => {
                        const next = [...schedule];
                        next[idx].time = e.target.value;
                        setSchedule(next);
                      }}
                      className="w-36 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Session / Stage Title (e.g. Opening Remarks)"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...schedule];
                        next[idx].title = e.target.value;
                        setSchedule(next);
                      }}
                      className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSchedule(schedule.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Optional brief notes or speaker for this session..."
                    value={item.description}
                    onChange={(e) => {
                      const next = [...schedule];
                      next[idx].description = e.target.value;
                      setSchedule(next);
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              ))
            )}
          </div>
        </Section>

        {/* ── 8. Rules & Guidelines (Optional) ── */}
        <Section icon={ListChecks} title="Rules & Guidelines (Optional)" color="text-violet-500">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Official Rules & Conduct
              </label>
              <button
                type="button"
                onClick={() => setRules([...rules, ""])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={14} /> Add Rule
              </button>
            </div>

            {rules.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No specific rules added. Click &quot;Add Rule&quot; to specify eligibility criteria or code of conduct.
              </p>
            ) : (
              rules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Participants must bring their own laptop with Python 3.10+ installed."
                    value={rule}
                    onChange={(e) => {
                      const next = [...rules];
                      next[idx] = e.target.value;
                      setRules(next);
                    }}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Section>

        {/* ── 9. Media ── */}
        <Section icon={ImageIcon} title="Event Images" color="text-purple-500">
          <Field label="Cover Image" hint="Shown in event cards on Home & Events hub (recommended: 16:9, min 800×450px)">
            <ImageUpload
              label=""
              value={form.coverImageUrl}
              onChange={(url) => set("coverImageUrl", url)}
              folder="events"
              hint="Shown in event cards (recommended: 16:9, min 800×450px)"
            />
          </Field>
          <Field label="Banner / Hero Image" hint="Full-width banner shown at top of the dedicated event page">
            <ImageUpload
              label=""
              value={form.bannerImageUrl}
              onChange={(url) => set("bannerImageUrl", url)}
              folder="events"
              hint="Full-width banner shown on the event detail page"
            />
          </Field>
        </Section>

        {/* ── 10. Organiser & Contact (User Instruction #3: Pre-filled from Global Settings) ── */}
        <Section icon={Info} title="Organiser & Contact" color="text-orange-500">
          <p className="text-xs text-slate-500 leading-relaxed">
            Pre-filled with MEC Computer Club global site contact information. You can modify these values if this event has a specific external partner or coordinator.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Organiser Name">
              <Input icon={Users} placeholder="e.g. MEC Computer Club" value={form.organizer}
                onChange={(e) => set("organizer", e.target.value)} />
            </Field>
            <Field label="Contact Email">
              <Input icon={Mail} type="email" placeholder="meccomputerclub@gmail.com" value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)} />
            </Field>
            <Field label="Contact Phone">
              <Input icon={Phone} type="tel" placeholder="+8801XXXXXXXXX" value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── 11. Custom HTML Section ── */}
        <Section icon={Code} title="Custom HTML / Embed Section (Optional)" color="text-rose-500">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 flex gap-2">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <strong>Embeds & widgets.</strong> Use this to embed tournament brackets (Challonge), YouTube live stream frames, or custom interactive standings.
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
            rows={6}
            placeholder={`<!-- Example: Tournament live stream or embedded frame -->
<div style="text-align: center; padding: 20px;">
  <h3>Live Stream Arena</h3>
</div>`}
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
            {saving ? "Saving…" : editId ? "Update Event" : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading form...</div>}>
      <CreateEventFormContent />
    </Suspense>
  );
}
