"use client";

import React, { useState, useEffect } from "react";
import { X, Users, User, ShieldCheck, Trophy, Gamepad2, Plus, Trash2, Check, AlertCircle, Phone, Mail, Hash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { Event } from "@/types";

interface EventRegistrationModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TeamMemberInput {
  fullName: string;
  studentId: string;
  email: string;
  inGameId: string;
}

export function EventRegistrationModal({
  event,
  isOpen,
  onClose,
  onSuccess,
}: EventRegistrationModalProps) {
  const { user } = useAuth();

  const isTeamEvent = event.registrationType === "team" || event.type === "gaming";
  const minMembers = event.teamSize?.min || 1;
  const maxMembers = event.teamSize?.max || 4;

  // Form states
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [leaderStudentId, setLeaderStudentId] = useState("");
  const [leaderInGameId, setLeaderInGameId] = useState("");

  const [members, setMembers] = useState<TeamMemberInput[]>([
    { fullName: "", studentId: "", email: "", inGameId: "" },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill leader info if user is authenticated
  useEffect(() => {
    if (user) {
      if (!leaderName) setLeaderName(user.fullName || "");
      if (!leaderEmail) setLeaderEmail(user.email || "");
      if (!leaderStudentId) setLeaderStudentId(user.studentId || "");
      if (!leaderPhone && user.contactNumber) setLeaderPhone(user.contactNumber || "");
    }
  }, [user]);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (members.length + 1 >= maxMembers) {
      toast.error(`Maximum team capacity is ${maxMembers} players (including leader).`);
      return;
    }
    setMembers((prev) => [
      ...prev,
      { fullName: "", studentId: "", email: "", inGameId: "" },
    ]);
  };

  const handleRemoveMember = (idx: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx: number, field: keyof TeamMemberInput, val: string) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isTeamEvent && !teamName.trim()) {
        throw new Error("Please provide a team name.");
      }
      if (!leaderName.trim()) throw new Error("Leader / Participant name is required.");
      if (!leaderEmail.trim()) throw new Error("Email address is required.");

      const payload: any = {
        userId: user?._id || undefined,
        leaderName: leaderName.trim(),
        leaderEmail: leaderEmail.trim(),
        leaderPhone: leaderPhone.trim(),
        leaderStudentId: leaderStudentId.trim(),
        inGameId: leaderInGameId.trim(),
      };

      if (isTeamEvent) {
        payload.teamName = teamName.trim();
        payload.members = members
          .filter((m) => m.fullName.trim())
          .map((m) => ({
            fullName: m.fullName.trim(),
            studentId: m.studentId.trim(),
            email: m.email.trim(),
            inGameId: m.inGameId.trim(),
          }));
      }

      const res = await api.post(`/api/events/${event.id}/participants/register`, payload);
      toast.success(res.message || "Registration submitted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to submit registration.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[8px_8px_0px_var(--border-brutalist)] overflow-hidden my-8 animate-fade-in text-text-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-secondary border-b-2 border-border-brutalist flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-primary-light border border-accent-primary flex items-center justify-center text-text-primary">
              {isTeamEvent ? <Gamepad2 size={20} /> : <Users size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary leading-tight">
                {isTeamEvent ? "Team Tournament Registration" : "Event Registration"}
              </h2>
              <p className="text-xs text-text-secondary line-clamp-1">{event.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-default hover:bg-surface-secondary flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Event Quick Info Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-surface-secondary border border-border-default text-xs font-mono">
            <div>
              <span className="text-[10px] text-text-tertiary uppercase block">Date</span>
              <strong className="text-text-primary">{event.date}</strong>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary uppercase block">Venue</span>
              <strong className="text-text-primary truncate block">{event.location}</strong>
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary uppercase block">Fee</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {event.registrationFee ? `${event.registrationFee} BDT` : "FREE Entry"}
              </strong>
            </div>
          </div>

          {/* Team Specific Section */}
          {isTeamEvent && (
            <div className="space-y-4 p-4 rounded-xl bg-surface-secondary/40 border border-border-default">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  1. Team Information
                </label>
                <span className="text-[11px] font-mono text-text-tertiary">
                  Squad Size: 1 Leader + up to {maxMembers - 1} Members
                </span>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-text-secondary">
                  Team / Clan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEC Vipers, Cyber Sentinels"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-default focus:border-accent-primary text-sm outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Leader / Primary Registrant Info */}
          <div className="space-y-4 p-4 rounded-xl bg-surface-secondary/40 border border-border-default">
            <label className="text-xs font-bold uppercase tracking-wider text-text-primary block">
              {isTeamEvent ? "2. Team Leader (Captain)" : "1. Participant Information"}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold mb-1 text-text-secondary">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-default focus:border-accent-primary text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-text-secondary">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 210347"
                  value={leaderStudentId}
                  onChange={(e) => setLeaderStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-default focus:border-accent-primary text-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-text-secondary">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Email for confirmation"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-default focus:border-accent-primary text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-text-secondary">
                  Phone / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+8801XXXXXXXXX"
                  value={leaderPhone}
                  onChange={(e) => setLeaderPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-default focus:border-accent-primary text-sm outline-none font-mono"
                />
              </div>

              {isTeamEvent && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1 text-text-secondary">
                    Leader In-Game UID / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FreeFire Player ID (123456789) / Ign"
                    value={leaderInGameId}
                    onChange={(e) => setLeaderInGameId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-border-default focus:border-accent-primary text-sm outline-none font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Team Members Roster */}
          {isTeamEvent && (
            <div className="space-y-4 p-4 rounded-xl bg-surface-secondary/40 border border-border-default">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  3. Team Roster (Members)
                </label>
                {members.length + 1 < maxMembers && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMember}
                    className="text-xs h-8"
                  >
                    <Plus size={13} className="mr-1" /> Add Player
                  </Button>
                )}
              </div>

              <div className="space-y-3.5">
                {members.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-surface-elevated rounded-xl border border-border-default space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-accent-primary uppercase">
                        Player #{idx + 2}
                      </span>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="text-text-tertiary hover:text-red-500 transition p-1"
                          title="Remove player"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Member Full Name *"
                          value={member.fullName}
                          onChange={(e) => handleMemberChange(idx, "fullName", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default text-xs outline-none focus:border-accent-primary"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Student ID (e.g. 210348)"
                          value={member.studentId}
                          onChange={(e) => handleMemberChange(idx, "studentId", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default text-xs font-mono outline-none focus:border-accent-primary"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={member.email}
                          onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default text-xs outline-none focus:border-accent-primary"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="In-Game UID / Ign"
                          value={member.inGameId}
                          onChange={(e) => handleMemberChange(idx, "inGameId", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-surface-secondary border border-border-default text-xs font-mono outline-none focus:border-accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Terms */}
          <p className="text-[11px] text-text-tertiary leading-relaxed">
            By submitting this registration, you agree to abide by the event rules and code of conduct set by MEC Computer Club. Approved teams will receive an email confirmation.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border-default">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : isTeamEvent ? "Submit Team Registration →" : "Confirm Registration →"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
