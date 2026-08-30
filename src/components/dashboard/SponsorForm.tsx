"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Globe, Mail, User, DollarSign,
  Calendar, Plus, Trash2, Info, CheckCircle, Search, X,
} from "lucide-react";
import ImageUpload from "@/components/ui/shared/ImageUpload";

// ── Types ──────────────────────────────────────────────────────────────────
export interface SponsorshipRecord {
  _id?: string;
  sponsorshipType: "event" | "duration";
  eventId?: string;
  eventName?: string;
  startDate?: string;
  endDate?: string;
  contributionType: "monetary" | "in_kind" | "service";
  amountOrValue: number;
  notes?: string;
}

export interface SponsorFormData {
  name: string;
  logoUrl: string;
  website: string;
  isActive: boolean;
  contactName: string;
  contactEmail: string;
  sponsorships: SponsorshipRecord[];
}

interface Props {
  initialData?: Partial<SponsorFormData> & { _id?: string };
  mode: "create" | "edit";
}

// ── Helpers ────────────────────────────────────────────────────────────────
const INPUT = "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm";
const SELECT = INPUT;

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function IconInput({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input {...props} className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm`} />
    </div>
  );
}

// ── Event autocomplete combobox ────────────────────────────────────────────
interface EventOption { _id: string; title: string; date?: string; category?: string; }

const EMPTY_SPONSORSHIP: SponsorshipRecord = {
  sponsorshipType: "event",
  eventId: "",
  eventName: "",
  startDate: "",
  endDate: "",
  contributionType: "monetary",
  amountOrValue: 0,
  notes: "",
};

function EventCombobox({
  value,
  eventId,
  onChange,
}: {
  value: string;
  eventId?: string;
  onChange: (eventName: string, eventId: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [allEvents, setAllEvents] = useState<EventOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all events once on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/events`)
      .then((r: any) => setAllEvents(r.data.data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Sync query when parent value changes (edit mode)
  useEffect(() => { setQuery(value); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? allEvents.filter((ev) =>
      ev.title.toLowerCase().includes(query.toLowerCase())
    )
    : allEvents;

  const handleSelect = (ev: EventOption) => {
    setQuery(ev.title);
    onChange(ev.title, ev._id);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange("", "");
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          placeholder="Type to search events…"
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // If user clears the field, also clear the selection
            if (!e.target.value) onChange("", "");
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selected badge */}
      {eventId && (
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
          <CheckCircle size={11} /> Event linked (ID: {eventId.slice(-6)})
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-56 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-xs text-slate-400">Loading events…</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400">
              {query ? `No events matching "${query}"` : "No events found"}
            </div>
          ) : (
            filtered.map((ev) => (
              <button
                key={ev._id}
                type="button"
                onClick={() => handleSelect(ev)}
                className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-start gap-3 ${ev._id === eventId ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                  }`}
              >
                <Calendar size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                    {ev.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ev.date
                      ? new Date(ev.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                      : ""}
                    {ev.category ? ` · ${ev.category}` : ""}
                  </p>
                </div>
                {ev._id === eventId && (
                  <CheckCircle size={14} className="text-indigo-500 flex-shrink-0 ml-auto mt-0.5" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Sponsorship record row ─────────────────────────────────────────────────
function SponsorshipRow({
  record,
  index,
  onChange,
  onRemove,
}: {
  record: SponsorshipRecord;
  index: number;
  onChange: (idx: number, updated: SponsorshipRecord) => void;
  onRemove: (idx: number) => void;
}) {
  const set = (k: keyof SponsorshipRecord, v: string | number) =>
    onChange(index, { ...record, [k]: v });

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Sponsorship #{index + 1}
        </span>
        <button type="button" onClick={() => onRemove(index)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Sponsorship type radio */}
      <div className="flex gap-4">
        {(["event", "duration"] as const).map((t) => (
          <label key={t} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name={`sponsorshipType-${index}`}
              value={t}
              checked={record.sponsorshipType === t}
              onChange={() => set("sponsorshipType", t)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{t}</span>
          </label>
        ))}
      </div>

      {/* Event autocomplete */}
      {record.sponsorshipType === "event" ? (
        <Field label="Event" hint="Search and select the event this sponsorship is for">
          <EventCombobox
            value={record.eventName || ""}
            eventId={record.eventId}
            onChange={(eventName, eventId) =>
              onChange(index, { ...record, eventName, eventId })
            }
          />
        </Field>
      ) : (
        /* Duration fields */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Start Date" required>
            <IconInput icon={Calendar} type="date" required
              value={record.startDate || ""}
              onChange={(e) => set("startDate", e.target.value)} />
          </Field>
          <Field label="End Date" required>
            <IconInput icon={Calendar} type="date" required
              value={record.endDate || ""}
              onChange={(e) => set("endDate", e.target.value)} />
          </Field>
        </div>
      )}

      {/* Contribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contribution Type" required>
          <select value={record.contributionType}
            onChange={(e) => set("contributionType", e.target.value)}
            className={SELECT}>
            <option value="monetary">Monetary</option>
            <option value="in_kind">In-Kind</option>
            <option value="service">Service</option>
          </select>
        </Field>
        <Field label="Amount / Value (BDT)">
          <IconInput icon={DollarSign} type="number" min="0"
            value={record.amountOrValue}
            onChange={(e) => set("amountOrValue", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Notes">
        <textarea rows={2} placeholder="Optional notes for this sponsorship…"
          value={record.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
          className={INPUT + " resize-y"} />
      </Field>
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────
export default function SponsorForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const [profile, setProfile] = useState({
    name: initialData?.name || "",
    logoUrl: initialData?.logoUrl || "",
    website: initialData?.website || "",
    isActive: initialData?.isActive ?? true,
    contactName: initialData?.contactName || "",
    contactEmail: initialData?.contactEmail || "",
  });

  const [sponsorships, setSponsorships] = useState<SponsorshipRecord[]>(
    initialData?.sponsorships?.length
      ? initialData.sponsorships
      : [{ ...EMPTY_SPONSORSHIP }]
  );

  // Re-sync when initialData arrives (edit mode fetch)
  useEffect(() => {
    if (!initialData) return;
    setProfile({
      name: initialData.name || "",
      logoUrl: initialData.logoUrl || "",
      website: initialData.website || "",
      isActive: initialData.isActive ?? true,
      contactName: initialData.contactName || "",
      contactEmail: initialData.contactEmail || "",
    });
    if (initialData.sponsorships?.length) {
      setSponsorships(initialData.sponsorships);
    }
  }, [initialData]);

  const setP = (k: keyof typeof profile, v: string | boolean) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const updateRecord = (idx: number, updated: SponsorshipRecord) =>
    setSponsorships((prev) => prev.map((r, i) => i === idx ? updated : r));

  const removeRecord = (idx: number) =>
    setSponsorships((prev) => prev.filter((_, i) => i !== idx));

  const addRecord = () =>
    setSponsorships((prev) => [...prev, { ...EMPTY_SPONSORSHIP }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { ...profile, sponsorships };
    try {
      if (mode === "edit" && initialData?._id) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sponsors/${initialData._id}`,
          payload,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sponsors`,
          payload,
          { withCredentials: true }
        );
      }
      router.push("/dashboard/sponsors");
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || "Failed to save." : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/sponsors"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            {mode === "edit" ? "Edit Sponsor" : "Add Sponsor"}
          </h1>
        </div>
        <button type="submit" form="sponsor-form" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60">
          <Save size={15} /> {saving ? "Saving…" : mode === "edit" ? "Update Sponsor" : "Save Sponsor"}
        </button>
      </div>

      <form id="sponsor-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Sponsor Profile ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Sponsor Profile
          </h2>

          <Field label="Sponsor Name" required>
            <IconInput icon={User} required placeholder="e.g. TechCorp Bangladesh"
              value={profile.name} onChange={(e) => setP("name", e.target.value)} />
          </Field>

          <Field label="Logo">
            <ImageUpload value={profile.logoUrl} onChange={(url) => setP("logoUrl", url)}
              folder="sponsors" hint="Recommended: square, min 200×200px" />
          </Field>

          <Field label="Website">
            <IconInput icon={Globe} type="url" placeholder="https://example.com"
              value={profile.website} onChange={(e) => setP("website", e.target.value)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Contact Name">
              <IconInput icon={User} placeholder="Contact person"
                value={profile.contactName} onChange={(e) => setP("contactName", e.target.value)} />
            </Field>
            <Field label="Contact Email">
              <IconInput icon={Mail} type="email" placeholder="contact@example.com"
                value={profile.contactEmail} onChange={(e) => setP("contactEmail", e.target.value)} />
            </Field>
          </div>

          {/* Active toggle with tooltip */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={profile.isActive}
                onChange={(e) => setP("isActive", e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle size={15} className={profile.isActive ? "text-green-500" : "text-slate-400"} />
                Active Sponsor
              </span>
            </label>
            {/* Tooltip */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                aria-label="What does Active Sponsor mean?"
              >
                <Info size={15} />
              </button>
              {showTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl z-50 pointer-events-none">
                  <p className="font-semibold mb-1">Active Sponsor</p>
                  <p className="text-slate-300 leading-relaxed">
                    When checked, this sponsor appears on the public website (sponsors carousel, about page, etc.).
                    Uncheck to hide them without deleting their record.
                  </p>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-700" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sponsorship Records ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Sponsorship Records
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                A sponsor can sponsor multiple events or time periods. Add one record per sponsorship.
              </p>
            </div>
            <button type="button" onClick={addRecord}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-semibold transition">
              <Plus size={13} /> Add Record
            </button>
          </div>

          {sponsorships.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              No sponsorship records yet.{" "}
              <button type="button" onClick={addRecord} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Add one
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sponsorships.map((record, idx) => (
                <SponsorshipRow
                  key={idx}
                  record={record}
                  index={idx}
                  onChange={updateRecord}
                  onRemove={removeRecord}
                />
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
