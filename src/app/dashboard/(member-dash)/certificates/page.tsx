"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Award,
  ShieldCheck,
  ExternalLink,
  Copy,
  Printer,
  Calendar,
  AlertCircle,
  Search,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

import { API_BASE_URL } from "@/lib/api";

const API = `${API_BASE_URL}/api`;

interface CertificateItem {
  _id: string;
  certificateId: string;
  name: string;
  description?: string;
  type: string;
  position?: string;
  issueDate: string;
  status: "valid" | "revoked";
  associatedEvent?: {
    _id: string;
    title: string;
    date?: string;
  };
}

export default function MemberCertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCertificates = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/certificates/user/${user.id}`, {
        withCredentials: true,
      });
      setCertificates(res.data.data || []);
    } catch {
      toast.error("Failed to load your certificates.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyCertificates();
  }, [fetchMyCertificates]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2">
            <Award className="text-accent-primary" size={28} />
            My Earned Credentials &amp; Certificates
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Official verifiable club credentials issued to your account for hackathons, workshops, and competitions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button href="/verify" size="sm" variant="secondary">
            <Search size={14} className="mr-1.5" /> Public Verify Portal
          </Button>
          <button
            type="button"
            onClick={fetchMyCertificates}
            className="p-2 border border-border-default rounded-lg text-text-secondary hover:text-text-primary transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="p-12 text-center text-text-tertiary font-mono text-sm">
          Loading credentials…
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-12 bg-surface-elevated rounded-2xl border border-dashed border-border-default text-center">
          <Award size={48} className="mx-auto mb-3 text-accent-primary opacity-40" />
          <h3 className="text-lg font-bold text-text-primary mb-1">No Certificates Issued Yet</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-5">
            Participate in club hackathons, CP practice sessions, and bootcamps to earn official verifiable credentials.
          </p>
          <Button href="/events" size="sm">
            View Upcoming Events →
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-surface-elevated border-2 border-border-brutalist rounded-xl p-5 flex flex-col justify-between shadow-[4px_4px_0px_var(--border-brutalist)] transition-all hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase py-0.5 px-2 rounded-full border ${
                      cert.status === "valid"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/15 text-red-600 border-red-500/30"
                    }`}
                  >
                    <ShieldCheck size={11} /> {cert.status === "valid" ? "Verified" : "Revoked"}
                  </span>
                  <span className="font-mono text-[10px] font-bold py-0.5 px-2 rounded bg-surface-secondary text-text-secondary border border-border-default uppercase">
                    {cert.type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-1 leading-snug">
                  {cert.name}
                </h3>

                {cert.position && (
                  <span className="inline-block text-[11px] font-mono font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded mb-2">
                    ★ {cert.position}
                  </span>
                )}

                {cert.associatedEvent && (
                  <p className="text-xs text-text-secondary font-mono flex items-center gap-1.5 mb-2">
                    <Calendar size={12} className="text-accent-primary flex-shrink-0" />
                    <span className="truncate">{cert.associatedEvent.title}</span>
                  </p>
                )}

                {cert.description && (
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 italic mb-3">
                    &ldquo;{cert.description}&rdquo;
                  </p>
                )}

                <div className="pt-3 border-t border-border-default font-mono text-xs text-text-tertiary flex items-center justify-between">
                  <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => copyText(cert.certificateId, "Credential ID")}
                    className="hover:text-text-primary flex items-center gap-1 text-accent-primary font-bold"
                  >
                    <span>{cert.certificateId}</span>
                    <Copy size={11} />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-border-default flex items-center justify-between gap-2">
                <Link
                  href={`/verify?cert=${cert.certificateId}`}
                  target="_blank"
                  className="text-xs font-mono font-bold text-accent-primary-hover hover:underline inline-flex items-center gap-1"
                >
                  Verify Online <ExternalLink size={12} />
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const url = `${window.location.origin}/verify?cert=${cert.certificateId}`;
                    copyText(url, "Public Verification Link");
                  }}
                >
                  Share Link
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Tool Callout Card */}
      <div className="bg-surface-secondary border-2 border-border-brutalist rounded-2xl p-6 sm:p-7 shadow-[4px_4px_0px_var(--border-brutalist)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary mb-1">
            Need to Verify Any Certificate or Look Up Club Members?
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Use the official verification portal to validate credentials, check student IDs, and inspect club activity records.
          </p>
        </div>
        <Button href="/verify" size="md" className="flex-shrink-0">
          Launch Verification Portal →
        </Button>
      </div>
    </div>
  );
}
