"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Check,
  Loader2,
  Settings2,
  Copy,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Trash2,
  Search,
  Infinity,
  KeyRound,
  Send,
  RefreshCw,
} from "lucide-react";
import CustomInput from "@/components/ui/shared/CustomInput";
import { Select } from "@/components/ui/Select";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";

type Role = "member" | "alumni" | "advisor" | "moderator" | "admin" | "guest";

const ROLE_OPTIONS = [
  { value: "member", label: "Student Member" },
  { value: "alumni", label: "Alumni Network" },
  { value: "advisor", label: "Faculty Advisor" },
  { value: "moderator", label: "Club Moderator" },
  { value: "admin", label: "Administrator" },
];

const InvitationCodeContent = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingList, setFetchingList] = useState(true);
  const [codesList, setCodesList] = useState<any[]>([]);

  // Generation form
  const [codeType, setCodeType] = useState<"permanent" | "single_use">("permanent");
  const [inviteEmail, setInviteEmail] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [inviteLabel, setInviteLabel] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("member");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [invitationResult, setInvitationResult] = useState<any | null>(null);

  // Table filters & search
  const [filterTab, setFilterTab] = useState<"all" | "available" | "permanent" | "single_use" | "discontinued">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    setFetchingList(true);
    try {
      const res = await api.get("/api/invite/all");
      if (res && res.data) {
        setCodesList(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch invitation codes:", err);
    } finally {
      setFetchingList(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codeType === "single_use" && !inviteEmail.trim()) {
      toast.error("Please enter a recipient email for single-use codes.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/invite/create", {
        codeType,
        email: inviteEmail.trim(),
        role: selectedRole,
        customCode: customCode.trim(),
        label: inviteLabel.trim(),
        expiresInDays: codeType === "permanent" ? 36500 : parseInt(expiresInDays) || 30,
      });

      if (res.success && res.invite) {
        setInvitationResult(res.invite);
        toast.success(
          codeType === "permanent"
            ? `Permanent invitation code "${res.invite.code}" created!`
            : `Invitation code generated and emailed to ${inviteEmail}!`
        );
        setInviteEmail("");
        setCustomCode("");
        setInviteLabel("");
        fetchCodes();
      }
    } catch (error: any) {
      const msg = error instanceof ApiError ? error.message : error?.message || "Failed to create invitation code.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "consumable" ? "discontinued" : "consumable";
    setActionLoadingId(id);
    try {
      const res = await api.patch("/api/invite/status", {
        id,
        status: nextStatus,
      });
      if (res.success) {
        toast.success(nextStatus === "consumable" ? "Code activated and made available!" : "Code discontinued.");
        fetchCodes();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update code status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteCode = async (id: string, codeText: string) => {
    if (!confirm(`Are you sure you want to permanently remove invitation code "${codeText}"?`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      const res = await api.delete(`/api/invite/${id}`);
      if (res.success) {
        toast.success(`Invitation code "${codeText}" removed.`);
        fetchCodes();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete code");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredCodes = codesList.filter((inv) => {
    if (filterTab === "available" && inv.effectiveStatus !== "consumable") return false;
    if (filterTab === "permanent" && inv.codeType !== "permanent") return false;
    if (filterTab === "single_use" && inv.codeType !== "single_use") return false;
    if (filterTab === "discontinued" && inv.effectiveStatus !== "discontinued" && inv.status !== "discontinued") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = inv.code?.toLowerCase().includes(q);
      const emailMatch = inv.email?.toLowerCase().includes(q);
      const labelMatch = inv.label?.toLowerCase().includes(q);
      const roleMatch = inv.role?.toLowerCase().includes(q);
      return codeMatch || emailMatch || labelMatch || roleMatch;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* ── 1. Create Invitation Code Section ── */}
      <div className="bg-surface-elevated p-6 rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] border border-border-default space-y-6">
        <div className="flex flex-wrap justify-between items-center border-b pb-4 border-border-default gap-3">
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Issue Invitation Code</h3>
            <p className="text-text-secondary text-sm font-semibold">
              Create permanent multi-user codes or single-use direct invitations.
            </p>
          </div>

          {/* Code Type Switcher */}
          <div className="flex gap-1 bg-surface-secondary p-1 rounded-lg border border-border-default">
            <button
              type="button"
              onClick={() => {
                setCodeType("permanent");
                setInvitationResult(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${codeType === "permanent"
                  ? "bg-accent-primary text-accent-primary-text shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
                }`}
            >
              <Infinity className="w-3.5 h-3.5 inline mr-1" /> Permanent (Multi-Use)
            </button>
            <button
              type="button"
              onClick={() => {
                setCodeType("single_use");
                setInvitationResult(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${codeType === "single_use"
                  ? "bg-accent-primary text-accent-primary-text shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
                }`}
            >
              <KeyRound className="w-3.5 h-3.5 inline mr-1" /> Single-Use (Individual)
            </button>
          </div>
        </div>

        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {codeType === "single_use" ? (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-primary">
                  Recipient Email <span className="text-accent-error">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@mec.edu.bd"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-border-default p-2.5 rounded-lg bg-surface-primary text-text-primary text-sm font-medium focus:outline-none focus:border-accent-primary shadow-[2px_2px_0px_0px_var(--border-default)]"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-primary">
                  Custom Code <span className="text-text-tertiary font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MCC-2026 or leave blank"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  className="w-full border border-border-default p-2.5 rounded-lg bg-surface-primary text-text-primary text-sm font-mono font-semibold uppercase focus:outline-none focus:border-accent-primary shadow-[2px_2px_0px_0px_var(--border-default)]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-primary">Campaign Label</label>
              <input
                type="text"
                placeholder={codeType === "permanent" ? "e.g. 2026 Batch Drive" : "e.g. Executive Candidate"}
                value={inviteLabel}
                onChange={(e) => setInviteLabel(e.target.value)}
                className="w-full border border-border-default p-2.5 rounded-lg bg-surface-primary text-text-primary text-sm font-medium focus:outline-none focus:border-accent-primary shadow-[2px_2px_0px_0px_var(--border-default)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-primary">Assigned Role</label>
              <Select
                id="dashboard-invite-role"
                value={selectedRole}
                onChange={(val) => setSelectedRole(val as Role)}
                options={ROLE_OPTIONS}
              />
            </div>

            {codeType === "single_use" ? (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-text-primary">Validity</label>
                <Select
                  id="dashboard-expires-days"
                  value={expiresInDays}
                  onChange={setExpiresInDays}
                  options={[
                    { value: "7", label: "7 Days" },
                    { value: "14", label: "14 Days" },
                    { value: "30", label: "30 Days (Default)" },
                    { value: "90", label: "90 Days" },
                  ]}
                />
              </div>
            ) : (
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-text-primary text-surface-primary border border-border-default py-2.5 px-4 rounded-lg font-semibold hover:bg-surface-inverse transition flex items-center justify-center shadow-[3px_3px_0px_0px_var(--border-default)] disabled:opacity-50 text-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Create Permanent Key
                </button>
              </div>
            )}
          </div>

          {codeType === "single_use" && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading || !inviteEmail.trim()}
                className="bg-text-primary text-surface-primary border border-border-default py-2.5 px-6 rounded-lg font-semibold hover:bg-surface-inverse transition flex items-center shadow-[3px_3px_0px_0px_var(--border-default)] disabled:opacity-50 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                Generate &amp; Email Key
              </button>
            </div>
          )}
        </form>

        {/* Success Result Box */}
        {invitationResult && (
          <div className="p-4 rounded-lg bg-surface-secondary border-2 border-accent-success flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase text-accent-success flex items-center gap-1">
                <Check className="w-4 h-4" /> Code Created ({invitationResult.codeType === "permanent" ? "Permanent / Reusable" : "Single-Use"})
              </span>
              <div className="mt-1 flex items-center gap-3">
                <code className="text-2xl font-mono font-extrabold text-text-primary tracking-wider">
                  {invitationResult.code}
                </code>
                <span className="text-xs text-text-secondary font-semibold">
                  Role: <strong className="uppercase text-text-primary">{invitationResult.role}</strong>
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(invitationResult.code);
                  toast.success(`Code "${invitationResult.code}" copied!`);
                }}
                className="bg-surface-elevated border border-border-default px-3 py-1.5 rounded-md text-xs font-semibold text-text-primary hover:bg-accent-primary-light flex items-center gap-1.5 shadow-[2px_2px_0px_0px_var(--border-default)]"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>
              <button
                type="button"
                onClick={() => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
                  navigator.clipboard.writeText(
                    `${origin}/register?role=${invitationResult.role || selectedRole}&code=${encodeURIComponent(invitationResult.code)}`
                  );
                  toast.success("Direct registration URL copied!");
                }}
                className="bg-surface-elevated border border-border-default px-3 py-1.5 rounded-md text-xs font-semibold text-text-primary hover:bg-accent-primary-light flex items-center gap-1.5 shadow-[2px_2px_0px_0px_var(--border-default)]"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Copy Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. All Invitation Codes Directory & Table ── */}
      <div className="bg-surface-elevated p-6 rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] border border-border-default space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Available Invitation Codes</h3>
            <p className="text-text-secondary text-sm font-semibold">
              Manage status, pause/discontinue, or remove permanent and single-use codes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search code, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs font-medium border border-border-default rounded-md bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            <button
              type="button"
              onClick={fetchCodes}
              className="p-1.5 border border-border-default rounded-md hover:bg-surface-secondary text-text-secondary transition"
              title="Refresh codes list"
            >
              <RefreshCw className={`w-4 h-4 ${fetchingList ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-border-default pb-3 overflow-x-auto">
          {[
            { key: "all", label: `All (${codesList.length})` },
            { key: "available", label: `Available (${codesList.filter((i) => i.effectiveStatus === "consumable" || i.status === "consumable").length})` },
            { key: "permanent", label: `Permanent (${codesList.filter((i) => i.codeType === "permanent").length})` },
            { key: "single_use", label: `Single-Use (${codesList.filter((i) => i.codeType === "single_use").length})` },
            { key: "discontinued", label: `Discontinued (${codesList.filter((i) => i.status === "discontinued" || i.effectiveStatus === "discontinued").length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterTab(tab.key as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-md border border-border-default transition whitespace-nowrap ${filterTab === tab.key
                  ? "bg-accent-primary text-accent-primary-text shadow-[2px_2px_0px_0px_var(--border-default)]"
                  : "bg-surface-secondary text-text-secondary hover:text-text-primary"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border-default bg-surface-secondary text-text-secondary text-xs font-semibold uppercase tracking-wider">
                <th className="p-3">Code Key</th>
                <th className="p-3">Type</th>
                <th className="p-3">Role</th>
                <th className="p-3">Label / Recipient</th>
                <th className="p-3">Registrations</th>
                <th className="p-3">Status</th>
                <th className="p-3">Expires</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {filteredCodes.length > 0 ? (
                filteredCodes.map((inv) => {
                  const isAvail = inv.status === "consumable" || inv.effectiveStatus === "consumable";
                  const isPermanent = inv.codeType === "permanent";
                  const isDiscontinued = inv.status === "discontinued" || inv.effectiveStatus === "discontinued";
                  const isConsumed = inv.status === "consumed" || inv.effectiveStatus === "consumed";

                  return (
                    <tr key={inv._id || inv.code} className="hover:bg-accent-primary-light transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-semibold text-text-primary text-sm tracking-wide">
                            {inv.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(inv.code);
                              toast.success(`Code "${inv.code}" copied!`);
                            }}
                            className="text-text-tertiary hover:text-text-primary p-0.5"
                            title="Copy Code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="p-3">
                        {isPermanent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Infinity className="w-3 h-3" /> Permanent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-secondary text-text-secondary border border-border-default">
                            Single-Use
                          </span>
                        )}
                      </td>

                      <td className="p-3 capitalize font-semibold text-xs text-text-primary">
                        {inv.role || "member"}
                      </td>

                      <td className="p-3 text-xs">
                        <div className="font-semibold text-text-primary">
                          {inv.label || (isPermanent ? "Permanent Code" : "Individual Member Invite")}
                        </div>
                        {inv.email && <div className="text-text-secondary text-[11px]">{inv.email}</div>}
                      </td>

                      <td className="p-3 font-mono font-semibold text-xs text-text-primary">
                        {inv.usageCount || 0} {isPermanent ? "users" : inv.usageCount === 1 ? "used" : "unused"}
                      </td>

                      <td className="p-3">
                        {isAvail ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            ● Available
                          </span>
                        ) : isDiscontinued ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            ⏸ Discontinued
                          </span>
                        ) : isConsumed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            ✓ Consumed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Expired
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-xs text-text-secondary">
                        {isPermanent ? "Never" : inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : "30 days"}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy URL */}
                          <button
                            type="button"
                            onClick={() => {
                              const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
                              navigator.clipboard.writeText(
                                `${origin}/register?role=${inv.role || "member"}&code=${encodeURIComponent(inv.code)}`
                              );
                              toast.success(`Registration URL for "${inv.code}" copied!`);
                            }}
                            className="px-2 py-1 text-xs font-semibold rounded border border-border-default bg-surface-secondary text-text-primary hover:bg-surface-elevated transition shadow-sm"
                            title="Copy Registration Link"
                          >
                            <ExternalLink className="w-3 h-3 inline mr-1" /> Link
                          </button>

                          {/* Discontinue / Make Available */}
                          {isAvail ? (
                            <button
                              type="button"
                              disabled={actionLoadingId === inv._id}
                              onClick={() => handleToggleStatus(inv._id, inv.status)}
                              className="px-2 py-1 text-xs font-semibold rounded border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 transition"
                              title="Discontinue / Pause Code"
                            >
                              <PauseCircle className="w-3 h-3 inline mr-1" /> Discontinue
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoadingId === inv._id}
                              onClick={() => handleToggleStatus(inv._id, inv.status)}
                              className="px-2 py-1 text-xs font-semibold rounded border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 transition"
                              title="Make Code Available"
                            >
                              <PlayCircle className="w-3 h-3 inline mr-1" /> Make Available
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={actionLoadingId === inv._id}
                            onClick={() => handleDeleteCode(inv._id, inv.code)}
                            className="p-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900 transition"
                            title="Remove Code Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-text-secondary text-xs">
                    {fetchingList ? "Loading invitation codes..." : "No invitation codes found for this filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvitationCodeContent;
