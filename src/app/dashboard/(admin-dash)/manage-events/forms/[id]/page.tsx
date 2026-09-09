"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Search,
  Users,
  Calendar,
  BarChart3,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Link2,
  Check,
  Edit3,
  Pin,
  Download,
  ChevronDown,
  FileDown,
} from "lucide-react";
import FilterSelect from "@/app/dashboard/components/FilterSelect";
import toast from "react-hot-toast";

interface FormField {
  label: string;
  name: string;
  type: string;
  required: boolean;
  options?: { label: string; value: string }[];
}
interface FormData {
  _id: string;
  title: string;
  description?: string;
  fields: FormField[];
  status: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}
interface Submission {
  _id: string;
  formId: string;
  userId?: { _id: string; fullName: string; email: string };
  responses: Record<string, unknown>;
  createdAt: string;
}

import { API_BASE_URL } from "@/lib/api";
const API_URL = API_BASE_URL;
const ROWS_PER_PAGE = 10;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    published: { label: "Published", color: "var(--accent-success)" },
    closed: { label: "Closed", color: "var(--accent-error)" },
    draft: { label: "Draft", color: "var(--accent-warning)" },
  };
  const s = map[status] ?? { label: status, color: "var(--text-secondary)" };
  return (
    <span style={{ backgroundColor: s.color, color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 10px", borderRadius: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

function cellValue(value: unknown): string {
  if (value == null || value === "") return "\u2014";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.url) return String(obj.url);
    return JSON.stringify(value);
  }
  return String(value);
}

function isLink(value: unknown): string | false {
  if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://"))) return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.url) return String(obj.url);
  }
  return false;
}

export default function FormResponsesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<FormData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "csv" | "excel">("idle");
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [stickyColumnKey, setStickyColumnKey] = useState<string>("auto");

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [formRes, subRes] = await Promise.all([
        axios.get(`${API_URL}/api/forms/${id}`, { withCredentials: true }),
        axios.get(`${API_URL}/api/forms/submissions/${id}`, { withCredentials: true }),
      ]);
      const fetchedForm = formRes.data.data;
      setForm(fetchedForm);
      setSubmissions(subRes.data.data || []);

      // Auto-determine best sticky column (e.g. full_name if present)
      if (stickyColumnKey === "auto") {
        const nameField = fetchedForm?.fields?.find(
          (f: FormField) => f.name === "full_name" || f.name.toLowerCase().includes("name")
        );
        if (nameField) {
          setStickyColumnKey(nameField.name);
        } else {
          setStickyColumnKey("submitted_by");
        }
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message || "Failed to load form data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const fields = form?.fields ?? [];

  // Sticky column options for FilterSelect
  const stickyOptions = useMemo(() => {
    const opts = [
      { value: "submitted_by", label: "Pin: Submitted By (Account)" },
      ...fields.map((f) => ({ value: f.name, label: `Pin: ${f.label}` })),
      { value: "none", label: "Pin: None (# only)" },
    ];
    return opts;
  }, [fields]);

  // Determine active sticky field
  const isStickyField = stickyColumnKey !== "none" && stickyColumnKey !== "submitted_by";
  const stickyFieldObj = isStickyField ? fields.find((f) => f.name === stickyColumnKey) : null;

  // Non-sticky scrollable fields (exclude the one pinned as sticky)
  const scrollableFields = useMemo(() => {
    if (!isStickyField) return fields;
    return fields.filter((f) => f.name !== stickyColumnKey);
  }, [fields, isStickyField, stickyColumnKey]);

  const filtered = useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.toLowerCase();
    return submissions.filter((s) => {
      const name = s.userId?.fullName?.toLowerCase() ?? "";
      const email = s.userId?.email?.toLowerCase() ?? "";
      const values = Object.values(s.responses).map((v) => cellValue(v).toLowerCase()).join(" ");
      return name.includes(q) || email.includes(q) || values.includes(q);
    });
  }, [submissions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const publicLink = typeof window !== "undefined" ? `${window.location.origin}/forms/${id}` : `/forms/${id}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const triggerDownload = async (url: string, filename: string) => {
    try {
      const res = await axios.get(url, {
        withCredentials: true,
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename; // forces correct file name + extension
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Download failed. Please try again.");
    }
  };

  const safeFileBase = () => (form?.title || "responses").replace(/[^a-z0-9\-_]+/gi, "_");

  const exportCSV = async () => {
    if (submissions.length === 0) {
      toast.error("No submissions to export.");
      return;
    }
    setExportStatus("csv");
    await triggerDownload(`${API_URL}/api/forms/export/${id}?format=csv`, `${safeFileBase()}.csv`);
    toast.success("CSV export started!");
    setTimeout(() => setExportStatus("idle"), 1500);
  };

  const exportExcel = async () => {
    if (submissions.length === 0) {
      toast.error("No submissions to export.");
      return;
    }
    setExportStatus("excel");
    await triggerDownload(`${API_URL}/api/forms/export/${id}?format=xlsx`, `${safeFileBase()}.xlsx`);
    toast.success("Excel export started!");
    setTimeout(() => setExportStatus("idle"), 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div style={{ width: 40, height: 40, border: "3px solid var(--border-default)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p className="text-text-secondary text-sm font-medium">Loading responses...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <XCircle size={40} style={{ color: "var(--accent-error)" }} />
        <p className="text-text-primary font-semibold">{error}</p>
        <button onClick={() => fetchData()} className="px-4 py-2 text-sm font-semibold rounded-lg border border-border-default hover:bg-surface-secondary transition">Try Again</button>
      </div>
    );
  }

  /* ── sticky layout dimensions ── */
  const stickyNumW = 44;
  const stickyColW = 190;
  const hasStickySecondCol = stickyColumnKey !== "none";

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition mt-1.5 shrink-0">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-text-primary" style={{ wordBreak: "break-word" }}>{form?.title}</h1>
            {form?.status && <StatusBadge status={form.status} />}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 mt-1">
          {/* Icon-only action buttons */}
          <button
            title="Edit Form"
            onClick={() => router.push(`/dashboard/manage-events/forms/${id}/edit`)}
            className="flex items-center justify-center border border-border-default rounded-lg bg-surface-elevated hover:border-accent-primary hover:text-accent-primary hover:shadow-[2px_2px_0px_0px_var(--accent-primary)] transition"
            style={{ width: 34, height: 34 }}
          >
            <Edit3 size={14} />
          </button>
          <button
            title={copied ? "Copied!" : "Copy Link"}
            onClick={handleCopy}
            className="flex items-center justify-center border border-border-default rounded-lg bg-surface-elevated hover:border-accent-primary hover:shadow-[2px_2px_0px_0px_var(--accent-primary)] transition"
            style={{ width: 34, height: 34, color: copied ? "var(--accent-success)" : undefined }}
          >
            {copied ? <Check size={14} /> : <Link2 size={14} />}
          </button>
          <a
            title="View Form"
            href={`/forms/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center border border-border-default rounded-lg bg-surface-elevated hover:border-accent-primary hover:shadow-[2px_2px_0px_0px_var(--accent-primary)] transition"
            style={{ width: 34, height: 34 }}
          >
            <ExternalLink size={14} />
          </a>
          <button
            title="Refresh"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center justify-center border border-border-default rounded-lg bg-surface-elevated hover:border-accent-primary hover:shadow-[2px_2px_0px_0px_var(--accent-primary)] transition disabled:opacity-50"
            style={{ width: 34, height: 34 }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
          </button>

          {/* Export dropdown */}
          <div className="relative" style={{ marginLeft: 4 }}>
            <button
              onClick={() => setExportDropdownOpen((v) => !v)}
              disabled={submissions.length === 0}
              style={{
                background: "var(--accent-primary)",
                color: "white",
                border: "1px solid var(--accent-primary)",
                boxShadow: "3px 3px 0px 0px var(--text-primary)",
              }}
              className="flex items-center gap-1.5 px-3 py-0 text-xs font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-40"
            >
              <Download size={13} />
              <span style={{ lineHeight: "34px" }}>{exportStatus !== "idle" ? "Exporting..." : "Export"}</span>
              <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: exportDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>

            {exportDropdownOpen && (
              <>
                {/* backdrop */}
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setExportDropdownOpen(false)} />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    zIndex: 50,
                    minWidth: 180,
                    border: "1px solid var(--text-primary)",
                    borderRadius: "var(--radius-md, 10px)",
                    boxShadow: "4px 4px 0px 0px var(--accent-primary)",
                    background: "var(--surface-elevated)",
                    overflow: "hidden",
                  }}
                >
                  {[
                    { label: "Export as CSV", icon: <FileText size={14} />, onClick: exportCSV, format: "csv" as const },
                    { label: "Export as Excel", icon: <FileSpreadsheet size={14} />, onClick: exportExcel, format: "xlsx" as const },
                  ].map((item, i, arr) => (
                    <button
                      key={item.format}
                      onClick={() => { item.onClick(); setExportDropdownOpen(false); }}
                      className="flex items-center gap-2.5 w-full text-left text-text-primary hover:font-semibold transition-all"
                      style={{
                        padding: "9px 14px",
                        fontSize: "13px",
                        fontWeight: 500,
                        background: "transparent",
                        border: "none",
                        borderBottom: i < arr.length - 1 ? "1px solid var(--border-default)" : "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--accent-primary) 15%, var(--surface-elevated))";
                        e.currentTarget.style.fontWeight = "700";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.fontWeight = "500";
                      }}
                    >
                      <span style={{ color: "var(--accent-primary)" }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Users size={18} style={{ color: "var(--accent-primary)" }} />, label: "Total Responses", value: submissions.length },
          { icon: <BarChart3 size={18} style={{ color: "var(--accent-success)" }} />, label: "Form Fields", value: fields.length },
          { icon: <Calendar size={18} style={{ color: "var(--accent-warning)" }} />, label: "Deadline", value: form?.endDate ? new Date(form.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No deadline" },
          { icon: <CheckCircle2 size={18} style={{ color: form?.status === "published" ? "var(--accent-success)" : "var(--accent-error)" }} />, label: "Status", value: form?.status ? form.status.charAt(0).toUpperCase() + form.status.slice(1) : "N/A" },
        ].map((card, i) => (
          <div key={i} className="bg-surface-elevated border border-border-default rounded-xl p-4 shadow-[3px_3px_0px_0px_var(--border-default)]">
            <div className="flex items-center gap-2 mb-2">{card.icon}<span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{card.label}</span></div>
            <p className="text-xl font-black text-text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-surface-elevated border border-border-default rounded-2xl overflow-hidden" style={{ boxShadow: "4px 4px 0px 0px var(--border-default)" }}>
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border-default flex-wrap justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-sm font-black text-text-primary flex items-center gap-2">
              <Users size={16} style={{ color: "var(--accent-primary)" }} />
              Responses
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-secondary text-text-secondary">{filtered.length}</span>
            </h2>

            {/* Sticky column picker */}
            <div className="flex items-center gap-1.5">
              <Pin size={13} className="text-accent-primary" />
              <span className="text-xs font-semibold text-text-secondary">Sticky Column:</span>
              <FilterSelect
                value={stickyColumnKey}
                onChange={(val) => setStickyColumnKey(val)}
                options={stickyOptions}
                placeholder="Choose sticky column..."
              />
            </div>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input type="text" placeholder="Search responses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-1.5 text-xs font-medium rounded-lg border border-border-default bg-surface-primary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-primary transition"
              style={{ minWidth: 180 }} />
          </div>
        </div>

        {/* Empty / no-match states */}
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Users size={48} style={{ color: "var(--border-default)", strokeWidth: 1.5 }} />
            <p className="text-text-primary font-semibold text-lg">No responses yet</p>
            <p className="text-text-secondary text-sm text-center max-w-xs">Share the form link with members to start collecting responses.</p>
            <button onClick={handleCopy} className="mt-2 flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-border-default hover:border-accent-primary hover:shadow-[2px_2px_0px_0px_var(--accent-primary)] transition">
              <Copy size={13} /> Copy Form Link
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Search size={36} style={{ color: "var(--border-default)" }} />
            <p className="text-text-primary font-semibold">No matches found</p>
            <p className="text-text-secondary text-sm">Try a different search term.</p>
          </div>
        ) : (
          /* Scrollable table with customizable sticky column */
          <div style={{ overflowX: "auto", overflowY: "visible" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "12px", width: "max-content", minWidth: "100%", tableLayout: "auto" }}>
              <thead>
                <tr style={{ background: "var(--surface-secondary)", borderBottom: "2px solid var(--border-default)" }}>
                  {/* Sticky # */}
                  <th style={{
                    position: "sticky", left: 0, zIndex: 10,
                    background: "var(--surface-secondary)",
                    padding: "12px 14px",
                    textAlign: "left", fontSize: "10px", fontWeight: 900,
                    color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em",
                    whiteSpace: "nowrap", width: stickyNumW, minWidth: stickyNumW,
                    borderRight: hasStickySecondCol ? "1px solid var(--border-default)" : "2px solid var(--border-default)",
                  }}>#</th>

                  {/* Sticky Column (if enabled) */}
                  {hasStickySecondCol && (
                    <th style={{
                      position: "sticky", left: stickyNumW, zIndex: 10,
                      background: "var(--surface-secondary)",
                      padding: "12px 16px",
                      textAlign: "left", fontSize: "10px", fontWeight: 900,
                      color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em",
                      width: stickyColW, minWidth: stickyColW, maxWidth: 220,
                      borderRight: "2px solid var(--border-default)",
                      boxShadow: "2px 0 4px -2px rgba(0,0,0,0.1)",
                    }}>
                      <div className="flex items-center gap-1.5">
                        <Pin size={11} className="text-accent-primary shrink-0" />
                        <span className="truncate">
                          {stickyColumnKey === "submitted_by" ? "Submitted By" : (stickyFieldObj?.label ?? stickyColumnKey)}
                        </span>
                        {stickyFieldObj?.required && <span style={{ color: "var(--accent-error)" }}>*</span>}
                      </div>
                    </th>
                  )}

                  {/* Submitted At */}
                  <th style={{
                    padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 900,
                    color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em",
                    whiteSpace: "nowrap", minWidth: 140,
                  }}>
                    Submitted At
                  </th>

                  {/* If stickyColumn is NOT "submitted_by", show Submitted By as a normal scrollable column */}
                  {stickyColumnKey !== "submitted_by" && (
                    <th style={{
                      padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 900,
                      color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em",
                      whiteSpace: "nowrap", minWidth: 180, maxWidth: 220,
                    }}>
                      Submitted By
                    </th>
                  )}

                  {/* All other scrollable form fields */}
                  {scrollableFields.map((f) => (
                    <th key={f.name} style={{
                      padding: "12px 16px", textAlign: "left", fontSize: "10px", fontWeight: 900,
                      color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em",
                      minWidth: 200, maxWidth: 280, verticalAlign: "top",
                      wordBreak: "break-word", lineHeight: 1.35,
                    }}>
                      <div style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
                        {f.label}
                        {f.required && <span style={{ color: "var(--accent-error)", marginLeft: 3 }}>*</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((sub, i) => {
                  const rowNum = (page - 1) * ROWS_PER_PAGE + i + 1;
                  const rowBg = i % 2 === 0 ? "var(--surface-elevated)" : "var(--surface-primary)";
                  return (
                    <tr key={sub._id} style={{ borderBottom: "1px solid var(--border-default)", background: rowBg }}
                      className="hover:bg-surface-secondary transition-colors">
                      {/* Sticky # */}
                      <td style={{
                        position: "sticky", left: 0, zIndex: 5, background: rowBg,
                        padding: "12px 14px", fontSize: "11px", fontWeight: 700,
                        color: "var(--text-secondary)", whiteSpace: "nowrap",
                        width: stickyNumW, minWidth: stickyNumW,
                        borderRight: hasStickySecondCol ? "1px solid var(--border-default)" : "2px solid var(--border-default)",
                      }}>{rowNum}</td>

                      {/* Sticky Column Cell (if enabled) */}
                      {hasStickySecondCol && (
                        <td style={{
                          position: "sticky", left: stickyNumW, zIndex: 5, background: rowBg,
                          padding: "12px 16px",
                          width: stickyColW, minWidth: stickyColW, maxWidth: 220,
                          borderRight: "2px solid var(--border-default)",
                          boxShadow: "2px 0 4px -2px rgba(0,0,0,0.1)",
                        }}>
                          {stickyColumnKey === "submitted_by" ? (
                            sub.userId ? (
                              <div>
                                <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{sub.userId.fullName}</p>
                                <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{sub.userId.email}</p>
                              </div>
                            ) : <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>Anonymous</span>
                          ) : (
                            (() => {
                              const val = sub.responses[stickyColumnKey];
                              const display = cellValue(val);
                              const link = isLink(val);
                              return link ? (
                                <a href={link} target="_blank" rel="noopener noreferrer"
                                  style={{ color: "var(--accent-primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                  <ExternalLink size={11} /> View
                                </a>
                              ) : (
                                <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 190, fontWeight: 700 }}
                                  title={display !== "\u2014" ? display : undefined}>
                                  {display}
                                </span>
                              );
                            })()
                          )}
                        </td>
                      )}

                      {/* Submitted At */}
                      <td style={{ padding: "12px 16px", fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap", minWidth: 140 }}>
                        {new Date(sub.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        {" "}
                        <span style={{ opacity: 0.7 }}>{new Date(sub.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>

                      {/* If stickyColumn is NOT "submitted_by", render Submitted By as regular column */}
                      {stickyColumnKey !== "submitted_by" && (
                        <td style={{ padding: "12px 16px", minWidth: 180, maxWidth: 220 }}>
                          {sub.userId ? (
                            <div>
                              <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{sub.userId.fullName}</p>
                              <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{sub.userId.email}</p>
                            </div>
                          ) : <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic" }}>Anonymous</span>}
                        </td>
                      )}

                      {/* All other scrollable field cells */}
                      {scrollableFields.map((f) => {
                        const val = sub.responses[f.name];
                        const display = cellValue(val);
                        const link = isLink(val);
                        return (
                          <td key={f.name} style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-primary)", minWidth: 200, maxWidth: 280 }}>
                            {link ? (
                              <a href={link} target="_blank" rel="noopener noreferrer"
                                style={{ color: "var(--accent-primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                <ExternalLink size={11} /> View
                              </a>
                            ) : (
                              <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 250 }}
                                title={display !== "\u2014" ? display : undefined}>
                                {display}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-default flex-wrap gap-3">
            <p className="text-xs text-text-secondary font-medium">
              Showing <span className="font-semibold text-text-primary">{(page - 1) * ROWS_PER_PAGE + 1}&#8211;{Math.min(page * ROWS_PER_PAGE, filtered.length)}</span> of <span className="font-semibold text-text-primary">{filtered.length}</span> responses
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-default hover:border-accent-primary transition disabled:opacity-40">
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition"
                  style={{ borderColor: page === p ? "var(--accent-primary)" : "var(--border-default)", background: page === p ? "var(--accent-primary)" : "var(--surface-elevated)", color: page === p ? "white" : "var(--text-primary)", boxShadow: page === p ? "2px 2px 0px 0px var(--text-primary)" : "none" }}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-default hover:border-accent-primary transition disabled:opacity-40">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}