"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, Clock, ShieldCheck, XCircle, Users,
  Send, ExternalLink, Info, LogIn, AlertCircle, X, Sparkles
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Event, ParticipationClaim } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

interface EventParticipationClaimProps {
  event: Event;
}

const ROLE_OPTIONS = [
  { value: "Participant", label: "General Participant / Attendee" },
  { value: "Volunteer", label: "Volunteer / Organizing Helper" },
  { value: "Speaker", label: "Speaker / Workshop Mentor" },
  { value: "Contestant", label: "Contestant / Competitor" },
  { value: "Organizer", label: "Event Organizer / Coordinator" },
  { value: "Other", label: "Other Role" },
];

export function EventParticipationClaim({ event }: EventParticipationClaimProps) {
  const { user, isAuthenticated } = useAuth();
  const eventId = event.id || (event as any)._id;

  // Rule 1: strictly past events only
  const today = new Date();
  const eventDate = event.date ? new Date(event.date) : null;
  const isPast =
    (eventDate && eventDate < today) ||
    event.status === "past" ||
    (event as any).status === "completed";

  const [claim, setClaim] = useState<ParticipationClaim | null>(null);
  const [isAttendee, setIsAttendee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states with profile autofill benefits (Rule 2)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Participant");
  const [notes, setNotes] = useState("");

  const fetchMyClaim = useCallback(async () => {
    if (!isAuthenticated || !eventId) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/events/${eventId}/my-claim`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setClaim(res.data.data || null);
        setIsAttendee(Boolean(res.data.isAttendee));
      }
    } catch {
      // Ignored if user has no claim or error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, eventId]);

  useEffect(() => {
    fetchMyClaim();
  }, [fetchMyClaim]);

  // Autofill user profile info when opening modal (Rule 2)
  useEffect(() => {
    if (user && modalOpen) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setStudentId(user.studentId || "");
      setDepartment(user.department || "");
      setPhone((user as any).phone || (user as any).contactNumber || "");
    }
  }, [user, modalOpen]);

  // If not past event or claims not allowed, do not render
  if (!isPast || !event.allowParticipationClaims) {
    return null;
  }

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Full Name and Email are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/events/${eventId}/claim-participation`,
        {
          fullName: fullName.trim(),
          email: email.trim(),
          studentId: studentId.trim(),
          department: department.trim(),
          phone: phone.trim(),
          role,
          notes: notes.trim(),
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Claim submitted successfully!");
        setModalOpen(false);
        await fetchMyClaim();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to submit claim. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // State 1: Officially verified attendee
  if (isAttendee || claim?.status === "approved") {
    return (
      <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold text-sm shadow-[3px_3px_0px_#10B981]">
        <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
        <span>Verified Participant ✓</span>
      </div>
    );
  }

  // State 2: Claim is submitted and pending review
  if (claim?.status === "pending") {
    return (
      <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border-2 border-amber-500 text-amber-800 dark:text-amber-300 font-semibold text-xs sm:text-sm shadow-[3px_3px_0px_#F59E0B]">
        <Clock size={17} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Participation Claim Under Admin Review ({claim.role})</span>
      </div>
    );
  }

  // State 3: Not logged in
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 bg-surface-secondary border-2 border-border-brutalist rounded-xl shadow-[3px_3px_0px_var(--border-brutalist)]">
        <div className="text-xs text-text-secondary">
          <span className="font-bold text-text-primary block sm:inline">Did you attend this past event? </span>
          Log in to claim your participation and get officially verified.
        </div>
        <Link
          href={`/login?redirect=/events/${event.slug || eventId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-text-primary text-white text-xs font-bold hover:bg-surface-inverse transition shrink-0"
          style={{ color: "#FFFFFF" }}
        >
          <LogIn size={14} /> Log In to Claim
        </Link>
      </div>
    );
  }

  // State 4: Logged in and can claim (or rejected previous claim)
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm border-2 border-border-brutalist shadow-[4px_4px_0px_0px_var(--border-brutalist)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_var(--border-brutalist)] transition-all"
          style={{ color: "#FFFFFF" }}
        >
          <CheckCircle2 size={18} />
          {claim?.status === "rejected" ? "Re-submit Participation Claim" : "I Participated in this Event"}
        </button>

        {claim?.status === "rejected" && (
          <span className="text-xs text-red-500 font-medium">
            (Your previous claim was not approved. You can submit updated proof.)
          </span>
        )}
      </div>

      {/* ── Participation Claim Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[6px_6px_0px_0px_var(--border-brutalist)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-surface-secondary">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    Claim Event Participation
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {event.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitClaim} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                <strong>Archive Verification:</strong> Your profile details have been autofilled below. Please review them, choose your participation role, and submit your claim for club admin verification.
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2 rounded-xl border border-border-default bg-surface-secondary text-text-primary text-sm outline-none focus:border-accent-primary"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-primary">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-border-default bg-surface-secondary text-text-primary text-sm outline-none focus:border-accent-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-primary">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-border-default bg-surface-secondary text-text-primary text-sm outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              {/* Student ID & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-primary">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 190104"
                    className="w-full px-3.5 py-2 rounded-xl border border-border-default bg-surface-secondary text-text-primary text-sm outline-none focus:border-accent-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-primary">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSE / EEE / CE"
                    className="w-full px-3.5 py-2 rounded-xl border border-border-default bg-surface-secondary text-text-primary text-sm outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              {/* Participation Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">
                  Participation Role / Contribution <span className="text-red-500">*</span>
                </label>
                <Select
                  value={role}
                  onChange={setRole}
                  options={ROLE_OPTIONS}
                />
              </div>

              {/* Optional Notes / Proof */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-primary">
                  Notes or Proof Link (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Google Drive link to certificate/photo, team name, or additional details to help admins verify your claim…"
                  className="w-full px-3.5 py-2 rounded-xl border border-border-default bg-surface-secondary text-text-primary text-xs outline-none focus:border-accent-primary resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-[3px_3px_0px_0px_var(--border-brutalist)] transition-all disabled:opacity-50"
                  style={{ color: "#FFFFFF" }}
                >
                  <Send size={13} />
                  {submitting ? "Submitting Claim…" : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
