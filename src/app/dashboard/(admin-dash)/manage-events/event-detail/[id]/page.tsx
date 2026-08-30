"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import MultiFileUpload, { UploadedFile } from "@/components/ui/shared/MultiFileUpload";
import {
  ArrowLeft, Calendar, MapPin, Tag, Users, Trophy, Building2,
  Image as ImageIcon, Award, Search, X, Plus, Trash2, Check,
  AlertCircle, Clock, Mail, User, Loader2,
  ExternalLink, Edit, Star,
} from "lucide-react";

const API = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface UserRef {
  _id: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  studentId?: string;
  department?: string;
  batch?: string;
}

interface PendingParticipant {
  _id: string;
  userId: UserRef;
  registeredAt: string;
}

interface Winner {
  _id: string;
  teamName?: string;
  members: UserRef[];
  position: string;
  prize?: string;
}

interface EventSponsor {
  _id: string;
  sponsorId: string;
  sponsorName: string;
  logoUrl?: string;
  tier?: string;
}

interface MediaItem {
  _id: string;
  title: string;
  url: string;
  mediaType: "image" | "video";
}

interface Certificate {
  _id: string;
  name: string;
  type: string;
  certificateId: string;
  issueDate: string;
  recipient: { fullName: string };
}

interface EventData {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  eventTime?: string;
  location: string;
  category: string;
  status: string;
  tags: string[];
  organizer?: string;
  contactEmail?: string;
  coverImageUrl?: string;
  attendees: UserRef[];
  pendingParticipants: PendingParticipant[];
  winners: Winner[];
  eventSponsors: EventSponsor[];
  media: MediaItem[];
  certificates: Certificate[];
}

interface SponsorOption {
  _id: string;
  name: string;
  logoUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────
const TAG_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
];
const tagColor = (t: string) => TAG_COLORS[t.charCodeAt(0) % TAG_COLORS.length];

const TIER_COLORS: Record<string, string> = {
  Gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  Silver: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  Bronze: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Partner: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  ongoing: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  completed: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  postponed: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const CERT_TYPE_COLORS: Record<string, string> = {
  participation: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  winner: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  completion: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  achievement: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const WINNER_CATEGORIES = ["contest", "hackathon", "other"];
const TIERS = ["Gold", "Silver", "Bronze", "Partner"];
const CERT_TYPES = ["participation", "winner", "completion", "achievement"];

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components (all at module scope to prevent focus loss)
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  );
}

function Avatar({ user, size = 36 }: { user: UserRef; size?: number }) {
  if (user.imageUrl) {
    return (
      <div
        className="relative flex-shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700"
        style={{ width: size, height: size }}
      >
        <Image src={user.imageUrl} alt={user.fullName} fill style={{ objectFit: "cover" }} unoptimized />
      </div>
    );
  }
  return (
    <div
      className="flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {user.fullName.charAt(0).toUpperCase()}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number; color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`} />;
}

function SectionCard({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function MemberSearch({
  placeholder,
  onSelect,
  disabled,
}: {
  placeholder?: string;
  onSelect: (user: UserRef) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<UserRef | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResult(null); setError(""); return; }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/users/profile/${encodeURIComponent(q.trim())}`, { withCredentials: true });
      setResult(res.data.data || res.data);
    } catch {
      setResult(null);
      setError("User not found");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 500);
  };

  const handleSelect = () => {
    if (!result) return;
    onSelect(result);
    setQuery("");
    setResult(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder || "Search by name or student ID…"}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-50"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {result && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <Avatar user={result} size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{result.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{result.email}{result.studentId ? ` · ${result.studentId}` : ""}</p>
          </div>
          <button
            type="button"
            onClick={handleSelect}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children, badge }: {
  active: boolean; onClick: () => void; children: React.ReactNode; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
        ${active
          ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 1: Overview
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ event }: { event: EventData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Attendees" value={event.attendees.length}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
        <StatCard icon={Clock} label="Pending" value={event.pendingParticipants.length}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" />
        <StatCard icon={Award} label="Certificates" value={event.certificates.length}
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400" />
        <StatCard icon={ImageIcon} label="Media" value={event.media.length}
          color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{event.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[event.status] || "bg-slate-100 text-slate-600"}`}>
                {event.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 capitalize">
                {event.category}
              </span>
            </div>
          </div>
          <Link
            href={`/dashboard/manage-events/create-event?edit=${event._id}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex-shrink-0"
          >
            <Edit size={14} /> Edit Event
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Calendar size={15} className="text-slate-400 flex-shrink-0" />
            <span>{fmtDate(event.date)}{event.endDate ? ` → ${fmtDate(event.endDate)}` : ""}</span>
          </div>
          {event.eventTime && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock size={15} className="text-slate-400 flex-shrink-0" />
              <span>{event.eventTime}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <MapPin size={15} className="text-slate-400 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
          {event.organizer && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <User size={15} className="text-slate-400 flex-shrink-0" />
              <span>{event.organizer}</span>
            </div>
          )}
          {event.contactEmail && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail size={15} className="text-slate-400 flex-shrink-0" />
              <span>{event.contactEmail}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
            {event.description}
          </p>
        )}

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            {event.tags.map((t) => (
              <span key={t} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tagColor(t)}`}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {event.coverImageUrl && (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <Image src={event.coverImageUrl} alt={event.title} fill style={{ objectFit: "cover" }} unoptimized />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: Participants
// ─────────────────────────────────────────────────────────────────────────────
function ParticipantsTab({
  event,
  onApprove,
  onReject,
  onRemove,
  onAdd,
  inFlight,
}: {
  event: EventData;
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onAdd: (user: UserRef) => Promise<void>;
  inFlight: Set<string>;
}) {
  const [search, setSearch] = useState("");

  const filtered = event.attendees.filter((a) =>
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (a.studentId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {event.pendingParticipants.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-4 flex items-center gap-2">
            <Clock size={16} /> Pending Approvals ({event.pendingParticipants.length})
          </h3>
          <div className="space-y-3">
            {event.pendingParticipants.map((p) => (
              <div key={p._id} className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-amber-100 dark:border-amber-900/40">
                <Avatar user={p.userId} size={38} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{p.userId.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{p.userId.email}</p>
                  {(p.userId.studentId || p.userId.department) && (
                    <p className="text-xs text-slate-400 truncate">
                      {[p.userId.studentId, p.userId.department].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onApprove(p.userId._id)}
                    disabled={inFlight.has(p.userId._id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                  >
                    {inFlight.has(p.userId._id) ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Approve
                  </button>
                  <button
                    onClick={() => onReject(p.userId._id)}
                    disabled={inFlight.has(p.userId._id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SectionCard
        title={`Approved Attendees (${event.attendees.length})`}
        action={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter…"
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        }
      >
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No attendees yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filtered.map((a) => (
              <div key={a._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <Avatar user={a} size={34} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{a.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{a.email}{a.studentId ? ` · ${a.studentId}` : ""}</p>
                </div>
                <button
                  onClick={() => onRemove(a._id)}
                  disabled={inFlight.has(a._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                  title="Remove attendee"
                >
                  {inFlight.has(a._id) ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Add Attendee Manually">
        <p className="text-xs text-slate-500 mb-3">Search by name or student ID to add directly.</p>
        <MemberSearch onSelect={onAdd} />
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 3: Winners (team-aware)
// ─────────────────────────────────────────────────────────────────────────────
interface DraftTeam {
  teamName: string;
  members: UserRef[];
  position: string;
  prize: string;
}

const EMPTY_DRAFT: DraftTeam = { teamName: "", members: [], position: "", prize: "" };

function WinnersTab({
  event,
  onSave,
  saving,
}: {
  event: EventData;
  onSave: (winners: { teamName?: string; members: string[]; position: string; prize?: string }[]) => Promise<void>;
  saving: boolean;
}) {
  const [teams, setTeams] = useState<(DraftTeam & { id: string })[]>(
    event.winners.map((w, i) => ({
      id: w._id || String(i),
      teamName: w.teamName || "",
      members: w.members || [],
      position: w.position,
      prize: w.prize || "",
    }))
  );
  const [draft, setDraft] = useState<DraftTeam>({ ...EMPTY_DRAFT });

  const setD = (k: keyof DraftTeam, v: string) =>
    setDraft((p) => ({ ...p, [k]: v }));

  const addMemberToDraft = useCallback((user: UserRef) => {
    setDraft((p) => ({
      ...p,
      members: p.members.some((m) => m._id === user._id) ? p.members : [...p.members, user],
    }));
  }, []);

  const removeMemberFromDraft = useCallback((id: string) => {
    setDraft((p) => ({ ...p, members: p.members.filter((m) => m._id !== id) }));
  }, []);

  const addTeam = useCallback(() => {
    if (draft.members.length === 0 || !draft.position.trim()) return;
    setTeams((prev) => [...prev, { ...draft, id: Date.now().toString() }]);
    setDraft({ ...EMPTY_DRAFT });
  }, [draft]);

  const removeTeam = useCallback((id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSave = useCallback(() => {
    onSave(teams.map(({ teamName, members, position, prize }) => ({
      teamName: teamName || undefined,
      members: members.map((m) => m._id),
      position,
      prize: prize || undefined,
    })));
  }, [teams, onSave]);

  if (!WINNER_CATEGORIES.includes(event.category)) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Trophy size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Winners are only available for Contest, Hackathon, and Other categories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300">
        <strong>How to mark winners:</strong> Each winner entry is a <em>team</em> — it can have 1 or more members.
        Search and add all team members, set the position (e.g. "1st Place"), optionally name the team and add a prize,
        then click <strong>Add Team to Winners List</strong>. Repeat for each placing. Click <strong>Save Winners</strong> when done.
      </div>

      <SectionCard title={`Winner Teams (${teams.length})`}>
        {teams.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No winners set yet.</p>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <div key={team.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-semibold">
                      <Trophy size={11} /> {team.position}
                    </span>
                    {team.teamName && (
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{team.teamName}</span>
                    )}
                    {team.prize && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">· {team.prize}</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.members.map((m) => (
                    <div key={m._id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
                      <Avatar user={m} size={18} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{m.fullName}</span>
                      {m.studentId && <span className="text-slate-400">({m.studentId})</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Add Winner Team">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={draft.position}
              onChange={(e) => setD("position", e.target.value)}
              placeholder="Position * (e.g. 1st Place)"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              value={draft.teamName}
              onChange={(e) => setD("teamName", e.target.value)}
              placeholder="Team name (optional)"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              value={draft.prize}
              onChange={(e) => setD("prize", e.target.value)}
              placeholder="Prize (optional)"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {draft.members.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 self-center mr-1">
                Team ({draft.members.length}):
              </span>
              {draft.members.map((m) => (
                <span key={m._id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-full border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Avatar user={m} size={16} />
                  {m.fullName}
                  <button onClick={() => removeMemberFromDraft(m._id)} className="ml-0.5 text-slate-400 hover:text-red-500 transition">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 mb-2">Search and add all team members before clicking "Add Team":</p>
            <MemberSearch placeholder="Search member by name or student ID…" onSelect={addMemberToDraft} />
          </div>

          <button
            onClick={addTeam}
            disabled={draft.members.length === 0 || !draft.position.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            <Plus size={14} /> Add Team to Winners List
          </button>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          {saving ? "Saving…" : "Save Winners"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4: Sponsors
// ─────────────────────────────────────────────────────────────────────────────
function SponsorsTab({
  event,
  onAdd,
  onRemove,
  inFlight,
}: {
  event: EventData;
  onAdd: (sponsorId: string, sponsorName: string, logoUrl: string, tier: string) => Promise<void>;
  onRemove: (sponsorId: string) => Promise<void>;
  inFlight: Set<string>;
}) {
  const [allSponsors, setAllSponsors] = useState<SponsorOption[]>([]);
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorOption | null>(null);
  const [tier, setTier] = useState("Gold");
  const [dropOpen, setDropOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`${API}/sponsors`, { withCredentials: true })
      .then((r: any) => setAllSponsors(r.data.data || []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allSponsors.filter((s) =>
    s.name.toLowerCase().includes(sponsorSearch.toLowerCase())
  );

  const handleAdd = async () => {
    if (!selectedSponsor) return;
    setAdding(true);
    await onAdd(selectedSponsor._id, selectedSponsor.name, selectedSponsor.logoUrl || "", tier);
    setSelectedSponsor(null);
    setSponsorSearch("");
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <SectionCard title={`Event Sponsors (${event.eventSponsors.length})`}>
        {event.eventSponsors.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No sponsors added yet.</p>
        ) : (
          <div className="space-y-3">
            {event.eventSponsors.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {s.logoUrl ? (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <Image src={s.logoUrl} alt={s.sponsorName} fill style={{ objectFit: "contain" }} unoptimized />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{s.sponsorName}</p>
                  {s.tier && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[s.tier] || "bg-slate-100 text-slate-600"}`}>
                      {s.tier}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemove(s.sponsorId)}
                  disabled={inFlight.has(s.sponsorId)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                >
                  {inFlight.has(s.sponsorId) ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Add Sponsor">
        <div className="space-y-3">
          <div ref={dropRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={selectedSponsor ? selectedSponsor.name : sponsorSearch}
                onChange={(e) => { setSponsorSearch(e.target.value); setSelectedSponsor(null); setDropOpen(true); }}
                onFocus={() => setDropOpen(true)}
                placeholder="Search sponsors…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            {dropOpen && filtered.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-48 overflow-y-auto">
                {filtered.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => { setSelectedSponsor(s); setSponsorSearch(""); setDropOpen(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-3 transition"
                  >
                    {s.logoUrl ? (
                      <div className="relative w-7 h-7 rounded overflow-hidden flex-shrink-0">
                        <Image src={s.logoUrl} alt={s.name} fill style={{ objectFit: "contain" }} unoptimized />
                      </div>
                    ) : (
                      <Building2 size={16} className="text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-sm text-slate-800 dark:text-slate-100">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSponsor && (
            <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-sm">
              <Building2 size={14} className="text-indigo-500" />
              <span className="font-medium text-indigo-700 dark:text-indigo-300">{selectedSponsor.name}</span>
              <button onClick={() => setSelectedSponsor(null)} className="ml-auto text-slate-400 hover:text-red-500 transition">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              onClick={handleAdd}
              disabled={!selectedSponsor || adding}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 5: Media Gallery (uses MultiFileUpload)
// ─────────────────────────────────────────────────────────────────────────────
function MediaTab({
  event,
  onUpload,
  onRemove,
  inFlight,
}: {
  event: EventData;
  onUpload: (files: UploadedFile[]) => Promise<void>;
  onRemove: (mediaId: string) => Promise<void>;
  inFlight: Set<string>;
}) {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ name: string; ok: boolean }[]>([]);

  const handleUploaded = useCallback(async (files: UploadedFile[]) => {
    setUploadResults([]);
    await onUpload(files);
    setUploadResults(files.map((f) => ({ name: f.originalName, ok: true })));
  }, [onUpload]);

  const handleAddVideo = async () => {
    if (!videoUrl.trim()) return;
    setAddingVideo(true);
    await onUpload([{
      url: videoUrl.trim(),
      public_id: "",
      mediaType: "video",
      originalName: videoTitle.trim() || "Video",
    }]);
    setVideoUrl("");
    setVideoTitle("");
    setAddingVideo(false);
  };

  return (
    <div className="space-y-6">
      <SectionCard title={`Media Gallery (${event.media.length})`}>
        {event.media.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {event.media.map((m) => (
              <div
                key={m._id}
                className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800"
              >
                {m.mediaType === "image" ? (
                  <Image src={m.url} alt={m.title} fill style={{ objectFit: "cover" }} unoptimized />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <ExternalLink size={20} className="text-slate-400" />
                    <span className="text-xs text-slate-500 px-2 text-center truncate w-full">{m.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => onRemove(m._id)}
                    disabled={inFlight.has(m._id)}
                    className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white transition disabled:opacity-50"
                  >
                    {inFlight.has(m._id) ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-xs truncate">{m.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Upload images/videos via MultiFileUpload */}
      <SectionCard title="Upload Images / Videos">
        <p className="text-xs text-slate-500 mb-4">
          Drag and drop or click to select images and video files. They will be uploaded to Cloudinary and added to the gallery automatically.
        </p>
        <MultiFileUpload
          onUploaded={handleUploaded}
          folder="event_media"
          accept="image/*,video/*"
          maxFiles={20}
        />
        {uploadResults.length > 0 && (
          <div className="mt-3 space-y-1">
            {uploadResults.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${r.ok ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                {r.ok ? <Check size={12} /> : <AlertCircle size={12} />}
                {r.name} {r.ok ? "added to gallery" : "failed"}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Add video URL (YouTube / Vimeo) */}
      <SectionCard title="Add Video Link">
        <p className="text-xs text-slate-500 mb-3">Paste a YouTube, Vimeo, or other video URL to add it to the gallery.</p>
        <div className="space-y-3">
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Video title (optional)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <div className="flex gap-3">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleAddVideo}
              disabled={!videoUrl.trim() || addingVideo}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {addingVideo ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab 6: Certificates
// ─────────────────────────────────────────────────────────────────────────────
function CertificatesTab({
  event,
  onIssue,
  issuing,
}: {
  event: EventData;
  onIssue: (payload: {
    name: string;
    description: string;
    issueDate: string;
    digitalUrl: string;
    recipients: { userId: string; type: string }[];
  }) => Promise<void>;
  issuing: boolean;
}) {
  const [certName, setCertName] = useState(`${event.title} Certificate`);
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [digitalUrl, setDigitalUrl] = useState("");
  const [certType, setCertType] = useState("participation");
  const [recipients, setRecipients] = useState<UserRef[]>([]);

  const addAllAttendees = useCallback(() => {
    setRecipients(event.attendees);
  }, [event.attendees]);

  const addWinnersOnly = useCallback(() => {
    const winnerMembers: UserRef[] = [];
    event.winners.forEach((w) => {
      w.members.forEach((m) => {
        if (!winnerMembers.some((x) => x._id === m._id)) winnerMembers.push(m);
      });
    });
    setRecipients(winnerMembers);
  }, [event.winners]);

  const addRecipient = useCallback((user: UserRef) => {
    setRecipients((prev) => prev.some((r) => r._id === user._id) ? prev : [...prev, user]);
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setRecipients((prev) => prev.filter((r) => r._id !== id));
  }, []);

  const handleIssue = async () => {
    if (recipients.length === 0 || !certName.trim()) return;
    await onIssue({
      name: certName,
      description,
      issueDate,
      digitalUrl,
      recipients: recipients.map((r) => ({ userId: r._id, type: certType })),
    });
    setRecipients([]);
  };

  return (
    <div className="space-y-6">
      <SectionCard title={`Issued Certificates (${event.certificates.length})`}>
        {event.certificates.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No certificates issued yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {event.certificates.map((c) => (
              <div key={c._id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Award size={18} className="text-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{c.recipient?.fullName}</p>
                  <p className="text-xs text-slate-500">{c.name} · {fmtDate(c.issueDate)}</p>
                  <p className="text-xs text-slate-400 font-mono">{c.certificateId}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${CERT_TYPE_COLORS[c.type] || "bg-slate-100 text-slate-600"}`}>
                  {c.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Issue Certificates">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Certificate Name</label>
              <input
                type="text"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Certificate Type</label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {CERT_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Digital URL (certificate image/PDF link)</label>
              <input
                type="url"
                value={digitalUrl}
                onChange={(e) => setDigitalUrl(e.target.value)}
                placeholder="https://…"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Recipients ({recipients.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addAllAttendees}
                  className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  All Attendees
                </button>
                {event.winners.length > 0 && (
                  <button
                    type="button"
                    onClick={addWinnersOnly}
                    className="text-xs px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition"
                  >
                    Winners Only
                  </button>
                )}
              </div>
            </div>

            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl max-h-32 overflow-y-auto">
                {recipients.map((r) => (
                  <span key={r._id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                    {r.fullName}
                    <button onClick={() => removeRecipient(r._id)} className="hover:opacity-70 transition">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <MemberSearch placeholder="Search and add individual recipient…" onSelect={addRecipient} />
          </div>

          <button
            onClick={handleIssue}
            disabled={issuing || recipients.length === 0 || !certName.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50"
          >
            {issuing ? <Loader2 size={15} className="animate-spin" /> : <Award size={15} />}
            {issuing ? "Issuing…" : `Issue to ${recipients.length} Recipient${recipients.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
type TabId = "overview" | "participants" | "winners" | "sponsors" | "media" | "certificates";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());
  const [winnerSaving, setWinnerSaving] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const addInFlight = useCallback((key: string) =>
    setInFlight((s) => new Set(s).add(key)), []);
  const removeInFlight = useCallback((key: string) =>
    setInFlight((s) => { const n = new Set(s); n.delete(key); return n; }), []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchEvent = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/events/${id}`, { withCredentials: true });
      const raw = res.data.data;
      setEvent({
        ...raw,
        attendees: raw.attendees || [],
        pendingParticipants: raw.pendingParticipants || [],
        winners: raw.winners || [],
        eventSponsors: raw.eventSponsors || [],
        media: raw.media || [],
        certificates: raw.certificates || [],
        tags: raw.tags || [],
      });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || `Server error (${err.response?.status})`
        : "Failed to load event.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  // ── Participant handlers ──────────────────────────────────────────────────
  const handleApprove = useCallback(async (userId: string) => {
    addInFlight(userId);
    try {
      await axios.patch(`${API}/events/${id}/participants/${userId}/approve`, {}, { withCredentials: true });
      setEvent((prev) => {
        if (!prev) return prev;
        const pending = prev.pendingParticipants.find((p) => p.userId._id === userId);
        if (!pending) return prev;
        return {
          ...prev,
          pendingParticipants: prev.pendingParticipants.filter((p) => p.userId._id !== userId),
          attendees: [...prev.attendees, pending.userId],
        };
      });
      showToast("Participant approved.");
    } catch {
      showToast("Failed to approve.", "error");
    } finally {
      removeInFlight(userId);
    }
  }, [id, addInFlight, removeInFlight, showToast]);

  const handleReject = useCallback(async (userId: string) => {
    addInFlight(userId);
    try {
      await axios.patch(`${API}/events/${id}/participants/${userId}/reject`, {}, { withCredentials: true });
      setEvent((prev) => prev ? {
        ...prev,
        pendingParticipants: prev.pendingParticipants.filter((p) => p.userId._id !== userId),
      } : prev);
      showToast("Participant rejected.");
    } catch {
      showToast("Failed to reject.", "error");
    } finally {
      removeInFlight(userId);
    }
  }, [id, addInFlight, removeInFlight, showToast]);

  const handleRemoveAttendee = useCallback(async (userId: string) => {
    addInFlight(userId);
    try {
      await axios.delete(`${API}/events/${id}/participants/${userId}`, { withCredentials: true });
      setEvent((prev) => prev ? {
        ...prev,
        attendees: prev.attendees.filter((a) => a._id !== userId),
      } : prev);
      showToast("Attendee removed.");
    } catch {
      showToast("Failed to remove.", "error");
    } finally {
      removeInFlight(userId);
    }
  }, [id, addInFlight, removeInFlight, showToast]);

  const handleAddAttendee = useCallback(async (user: UserRef) => {
    addInFlight(user._id);
    try {
      await axios.post(`${API}/events/${id}/participants/add`, { userIds: [user._id] }, { withCredentials: true });
      setEvent((prev) => prev ? {
        ...prev,
        attendees: prev.attendees.some((a) => a._id === user._id)
          ? prev.attendees
          : [...prev.attendees, user],
      } : prev);
      showToast(`${user.fullName} added as attendee.`);
    } catch {
      showToast("Failed to add attendee.", "error");
    } finally {
      removeInFlight(user._id);
    }
  }, [id, addInFlight, removeInFlight, showToast]);

  // ── Winners handler ───────────────────────────────────────────────────────
  const handleSaveWinners = useCallback(async (
    winners: { teamName?: string; members: string[]; position: string; prize?: string }[]
  ) => {
    setWinnerSaving(true);
    try {
      await axios.put(`${API}/events/${id}/winners`, { winners }, { withCredentials: true });
      await fetchEvent();
      showToast("Winners saved.");
    } catch {
      showToast("Failed to save winners.", "error");
    } finally {
      setWinnerSaving(false);
    }
  }, [id, fetchEvent, showToast]);

  // ── Sponsor handlers ──────────────────────────────────────────────────────
  const handleAddSponsor = useCallback(async (
    sponsorId: string, sponsorName: string, logoUrl: string, tier: string
  ) => {
    addInFlight(sponsorId);
    try {
      await axios.post(`${API}/events/${id}/sponsors`, { sponsorId, sponsorName, logoUrl, tier }, { withCredentials: true });
      setEvent((prev) => prev ? {
        ...prev,
        eventSponsors: [...prev.eventSponsors, { _id: sponsorId, sponsorId, sponsorName, logoUrl, tier }],
      } : prev);
      showToast("Sponsor added.");
    } catch {
      showToast("Failed to add sponsor.", "error");
    } finally {
      removeInFlight(sponsorId);
    }
  }, [id, addInFlight, removeInFlight, showToast]);

  const handleRemoveSponsor = useCallback(async (sponsorId: string) => {
    addInFlight(sponsorId);
    try {
      await axios.delete(`${API}/events/${id}/sponsors/${sponsorId}`, { withCredentials: true });
      setEvent((prev) => prev ? {
        ...prev,
        eventSponsors: prev.eventSponsors.filter((s) => s.sponsorId !== sponsorId),
      } : prev);
      showToast("Sponsor removed.");
    } catch {
      showToast("Failed to remove sponsor.", "error");
    } finally {
      removeInFlight(sponsorId);
    }
  }, [id, addInFlight, removeInFlight, showToast]);

  // ── Media handlers ────────────────────────────────────────────────────────
  const handleUploadMedia = useCallback(async (files: UploadedFile[]) => {
    for (const file of files) {
      const mediaId = `upload-${Date.now()}-${Math.random()}`;
      addInFlight(mediaId);
      try {
        const res = await axios.post(
          `${API}/events/${id}/media`,
          {
            url: file.url,
            title: file.originalName,
            mediaType: file.mediaType,
            publicId: file.public_id,   // pass public_id so backend can delete from Cloudinary later
          },
          { withCredentials: true }
        );
        const newItem: MediaItem = res.data.data || {
          _id: mediaId,
          url: file.url,
          title: file.originalName,
          mediaType: file.mediaType,
        };
        setEvent((prev) => prev ? { ...prev, media: [...prev.media, newItem] } : prev);
      } catch {
        showToast(`Failed to save ${file.originalName}.`, "error");
      } finally {
        removeInFlight(mediaId);
      }
    }
    if (files.length > 0) showToast(`${files.length} item${files.length !== 1 ? "s" : ""} added to gallery.`);
  }, [id, addInFlight, removeInFlight, showToast]);

  const handleRemoveMedia = useCallback(async (mediaId: string) => {
    addInFlight(mediaId);
    try {
      await axios.delete(`${API}/events/${id}/media/${mediaId}`, { withCredentials: true });
      setEvent((prev) => prev ? { ...prev, media: prev.media.filter((m) => m._id !== mediaId) } : prev);
      showToast("Media removed.");
    } catch {
      showToast("Failed to remove media.", "error");
    } finally {
      removeInFlight(mediaId);
    }
  }, [id, addInFlight, removeInFlight, showToast]);

  // ── Certificate handler ───────────────────────────────────────────────────
  const handleIssueCertificates = useCallback(async (payload: {
    name: string;
    description: string;
    issueDate: string;
    digitalUrl: string;
    recipients: { userId: string; type: string }[];
  }) => {
    setIssuing(true);
    try {
      await axios.post(`${API}/events/${id}/certificates`, payload, { withCredentials: true });
      await fetchEvent();
      showToast(`Certificates issued to ${payload.recipients.length} recipient${payload.recipients.length !== 1 ? "s" : ""}.`);
    } catch {
      showToast("Failed to issue certificates.", "error");
    } finally {
      setIssuing(false);
    }
  }, [id, fetchEvent, showToast]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={40} className="mx-auto mb-3 text-red-400" />
        <p className="text-slate-500">Event not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Tag },
    { id: "participants", label: "Participants", icon: Users },
    { id: "winners", label: "Winners", icon: Trophy },
    { id: "sponsors", label: "Sponsors", icon: Building2 },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "certificates", label: "Certificates", icon: Award },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white truncate">{event.title}</h1>
          <p className="text-xs text-slate-500 capitalize">{event.category} · {event.status}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <div className="flex min-w-max">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <TabBtn
              key={tabId}
              active={activeTab === tabId}
              onClick={() => setActiveTab(tabId)}
              badge={tabId === "participants" ? event.pendingParticipants.length : undefined}
            >
              <Icon size={14} />
              {label}
            </TabBtn>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab event={event} />}

      {activeTab === "participants" && (
        <ParticipantsTab
          event={event}
          onApprove={handleApprove}
          onReject={handleReject}
          onRemove={handleRemoveAttendee}
          onAdd={handleAddAttendee}
          inFlight={inFlight}
        />
      )}

      {activeTab === "winners" && (
        <WinnersTab
          event={event}
          onSave={handleSaveWinners}
          saving={winnerSaving}
        />
      )}

      {activeTab === "sponsors" && (
        <SponsorsTab
          event={event}
          onAdd={handleAddSponsor}
          onRemove={handleRemoveSponsor}
          inFlight={inFlight}
        />
      )}

      {activeTab === "media" && (
        <MediaTab
          event={event}
          onUpload={handleUploadMedia}
          onRemove={handleRemoveMedia}
          inFlight={inFlight}
        />
      )}

      {activeTab === "certificates" && (
        <CertificatesTab
          event={event}
          onIssue={handleIssueCertificates}
          issuing={issuing}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
