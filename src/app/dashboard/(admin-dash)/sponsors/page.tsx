"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, RefreshCw,
  DollarSign, CheckCircle, XCircle, ExternalLink,
} from "lucide-react";
import SponsorLogo from "@/components/dashboard/SponsorLogo";

interface Sponsor {
  _id: string;
  name: string;
  logoUrl: string;
  website?: string;
  isActive: boolean;
  contactName?: string;
  contactEmail?: string;
  sponsorships: Array<{
    _id?: string;
    sponsorshipType: "event" | "duration";
    eventName?: string;
    startDate?: string;
    endDate?: string;
    contributionType: string;
    amountOrValue: number;
    notes?: string;
  }>;
}

const API = `${API_BASE_URL}/api/sponsors`;

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, { withCredentials: true });
      setSponsors(res.data.data || []);
    } catch {
      console.error("Failed to load sponsors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSponsors(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/${id}`, { withCredentials: true });
      setSponsors((prev) => prev.filter((s) => s._id !== id));
      setDeleteConfirm(null);
    } catch { alert("Delete failed."); }
  };

  const toggleActive = async (sponsor: Sponsor) => {
    try {
      await axios.patch(`${API}/${sponsor._id}`, { isActive: !sponsor.isActive }, { withCredentials: true });
      setSponsors((prev) => prev.map((s) => s._id === sponsor._id ? { ...s, isActive: !s.isActive } : s));
    } catch { alert("Update failed."); }
  };

  const filtered = sponsors.filter((s) => {
    if (filterActive === "active") return s.isActive;
    if (filterActive === "inactive") return !s.isActive;
    return true;
  });

  const activeCount = sponsors.filter((s) => s.isActive).length;
  const totalValue = sponsors
    .flatMap((s) => s.sponsorships || [])
    .filter((r) => r.contributionType === "monetary")
    .reduce((sum, r) => sum + (r.amountOrValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary flex items-center gap-2">
            <DollarSign className="text-accent-primary" size={28} /> Sponsors & Finance
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage club sponsors, contribution details, and contact information.
          </p>
        </div>
        <Link
          href="/dashboard/sponsors/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap"
          style={{
            backgroundColor: "#1A1A1A",
            color: "#FFFFFF",
            border: "1px solid rgba(26,26,26,0.15)",
            boxShadow: "4px 4px 0px 0px rgba(26,26,26,0.15)",
          }}
        >
          <Plus size={16} /> Add Sponsor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Sponsors" value={sponsors.length} color="text-accent-primary" />
        <StatCard label="Active Sponsors" value={activeCount} color="text-accent-success" />
        <StatCard label="Total Monetary Value" value={`৳${totalValue.toLocaleString()}`} color="text-accent-warning" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-secondary border border-border-default p-1 rounded-xl w-fit">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition capitalize ${filterActive === f
                ? "bg-surface-elevated text-text-primary border border-border-default shadow-[2px_2px_0px_0px_var(--border-default)]"
                : "text-text-secondary hover:text-text-primary"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-secondary rounded-2xl animate-pulse border border-border-default" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface-elevated rounded-2xl border border-dashed border-border-default">
          <DollarSign className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary font-semibold">No sponsors found</p>
          <Link href="/dashboard/sponsors/create" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-primary hover:underline">
            <Plus size={14} /> Add your first sponsor
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sponsor) => (
            <div
              key={sponsor._id}
              className={`bg-surface-elevated rounded-2xl border border-border-default p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-[6px_6px_0px_0px_var(--border-default)] shadow-[4px_4px_0px_0px_var(--border-default)] transition ${sponsor.isActive
                  ? ""
                  : "opacity-70"
                }`}
            >
              {/* Logo - adaptive background auto-detected from image pixels */}
              <SponsorLogo logoUrl={sponsor.logoUrl} name={sponsor.name} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-text-primary">{sponsor.name}</h4>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${sponsor.isActive
                      ? "bg-accent-success text-surface-elevated"
                      : "bg-surface-secondary text-text-secondary"
                    }`}>
                    {sponsor.isActive ? "Active" : "Inactive"}
                  </span>
                  {(sponsor.sponsorships?.length ?? 0) > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-surface-secondary text-text-secondary border border-border-default">
                      {sponsor.sponsorships.length} sponsorship{sponsor.sponsorships.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-text-secondary font-semibold">
                  {(sponsor.sponsorships?.length ?? 0) > 0 && (
                    <span>
                      Total: ৳{(sponsor.sponsorships || [])
                        .filter((r) => r.contributionType === "monetary")
                        .reduce((s, r) => s + (r.amountOrValue || 0), 0)
                        .toLocaleString()}
                    </span>
                  )}
                  {sponsor.contactName && <span>{sponsor.contactName}</span>}
                  {sponsor.contactEmail && <span>{sponsor.contactEmail}</span>}
                </div>
                {/* Sponsorship records summary */}
                {(sponsor.sponsorships?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {sponsor.sponsorships.slice(0, 3).map((r, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-surface-secondary border border-border-default text-text-secondary font-semibold">
                        {r.sponsorshipType === "event"
                          ? r.eventName || "Event"
                          : `${r.startDate ? new Date(r.startDate).getFullYear() : "?"} – ${r.endDate ? new Date(r.endDate).getFullYear() : "?"}`}
                      </span>
                    ))}
                    {sponsor.sponsorships.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-secondary border border-border-default text-text-secondary font-semibold">
                        +{sponsor.sponsorships.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {sponsor.website && (
                  <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-surface-secondary transition"
                    title="Visit website">
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  onClick={() => toggleActive(sponsor)}
                  className={`p-2 rounded-lg transition font-semibold ${sponsor.isActive
                      ? "text-accent-success hover:bg-surface-secondary"
                      : "text-text-secondary hover:text-accent-success hover:bg-surface-secondary"
                    }`}
                  title={sponsor.isActive ? "Deactivate" : "Activate"}
                >
                  {sponsor.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </button>
                <Link
                  href={`/dashboard/sponsors/${sponsor._id}/edit`}
                  className="p-2 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-surface-secondary transition"
                  title="Edit"
                >
                  <Pencil size={16} />
                </Link>
                {deleteConfirm === sponsor._id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDelete(sponsor._id)}
                      className="px-2 py-1 text-xs bg-accent-error hover:bg-red-700 text-surface-elevated font-semibold rounded-lg transition">
                      Confirm
                    </button>
                    <button onClick={() => setDeleteConfirm(null)}
                      className="px-2 py-1 text-xs text-text-secondary font-semibold hover:text-text-primary transition">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(sponsor._id)}
                    className="p-2 rounded-lg text-text-secondary hover:text-accent-error hover:bg-surface-secondary transition"
                    title="Delete">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="flex justify-end">
          <button onClick={fetchSponsors}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-default p-5 shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-md">
      <p className="text-sm font-semibold text-text-secondary">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
