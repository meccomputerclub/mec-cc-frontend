"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Award,
  Plus,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Copy,
  Calendar,
  Layers,
  X,
  FileCheck,
  RefreshCw,
  Share2,
  Check,
  Sparkles,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import FilterSelect from "@/app/dashboard/components/FilterSelect";
import { CertificateTemplateCard, TemplateItem } from "@/components/certificates/CertificateTemplateCard";
import { CertificateTemplateModal } from "@/components/certificates/CertificateTemplateModal";
import { CertificateTemplatePreviewModal } from "@/components/certificates/CertificateTemplatePreviewModal";

import { API_BASE_URL } from "@/lib/api";

const API = `${API_BASE_URL}/api`;

interface CertificateItem {
  _id: string;
  certificateId: string;
  name: string;
  description?: string;
  type: "participation" | "winner" | "completion" | "achievement" | "appreciation" | "other";
  position?: string;
  issueDate: string;
  status: "valid" | "revoked";
  revokedAt?: string;
  revocationReason?: string;
  recipient?: {
    _id: string;
    fullName: string;
    studentId: string;
    email: string;
    department?: string;
    batch?: string;
    session?: string;
    imageUrl?: string;
  };
  associatedEvent?: {
    _id: string;
    title: string;
    slug?: string;
    date?: string;
    location?: string;
  };
  issuedBy?: {
    fullName: string;
    role: string;
  };
  template?: {
    _id: string;
    name: string;
    type: "visual" | "html";
    theme?: string;
    primaryColor?: string;
    borderStyle?: string;
  };
}

interface MemberOption {
  _id: string;
  fullName: string;
  studentId: string;
  email: string;
  department?: string;
  batch?: string;
  imageUrl?: string;
}

interface EventOption {
  _id: string;
  title: string;
  date: string;
  attendees?: MemberOption[];
}

export default function CertificatesManagementPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [metrics, setMetrics] = useState({ total: 0, valid: 0, revoked: 0 });

  // Available members & events for issuance modals
  const [membersList, setMembersList] = useState<MemberOption[]>([]);
  const [eventsList, setEventsList] = useState<EventOption[]>([]);

  // Modals state
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [revokeCertTarget, setRevokeCertTarget] = useState<CertificateItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CertificateItem | null>(null);

  // Single Issuance Form
  const [singleRecipient, setSingleRecipient] = useState("");
  const [singleRecipientSearch, setSingleRecipientSearch] = useState("");
  const [singleEvent, setSingleEvent] = useState("");
  const [singleName, setSingleName] = useState("");
  const [singleType, setSingleType] = useState<string>("participation");
  const [singlePosition, setSinglePosition] = useState("");
  const [singleDescription, setSingleDescription] = useState("");
  const [singleDate, setSingleDate] = useState(new Date().toISOString().split("T")[0]);
  const [singleCertId, setSingleCertId] = useState("");
  const [singleIssuing, setSingleIssuing] = useState(false);

  // Bulk Issuance Form (Mass Participation)
  const [bulkEventId, setBulkEventId] = useState("");
  const [bulkEventAttendees, setBulkEventAttendees] = useState<MemberOption[]>([]);
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<Set<string>>(new Set());
  const [bulkManualIds, setBulkManualIds] = useState("");
  const [bulkName, setBulkName] = useState("");
  const [bulkType, setBulkType] = useState("participation");
  const [bulkDescription, setBulkDescription] = useState("");
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split("T")[0]);
  const [bulkIssuing, setBulkIssuing] = useState(false);
  const [bulkMode, setBulkMode] = useState<"event_attendees" | "manual_paste">("event_attendees");

  // Tab Switcher state
  const [pageTab, setPageTab] = useState<"registry" | "templates">("registry");

  // Templates Management State
  const [templatesList, setTemplatesList] = useState<TemplateItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateTypeFilter, setTemplateTypeFilter] = useState("all");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateItem | null>(null);

  // Selected template for single & bulk forms
  const [singleTemplateId, setSingleTemplateId] = useState("");
  const [bulkTemplateId, setBulkTemplateId] = useState("");

  // ── Fetch Certificates ──
  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/certificates`, {
        params: {
          search: search.trim() || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          limit: 100,
        },
        withCredentials: true,
      });

      setCertificates(res.data.data || []);
      if (res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // ── Fetch Members and Events for Issuance ──
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [membersRes, eventsRes] = await Promise.all([
          axios.get(`${API}/users/public/members`, { withCredentials: true }),
          axios.get(`${API}/events`, { withCredentials: true }),
        ]);

        setMembersList(membersRes.data.data || membersRes.data || []);
        const eventsData = eventsRes.data.data || eventsRes.data.events || [];
        setEventsList(eventsData);
      } catch (err) {
        console.warn("Could not preload members or events for issuance:", err);
      }
    };
    loadOptions();
  }, []);

  // Filtered members for autocomplete in single issuance modal
  const filteredMemberSuggestions = useMemo(() => {
    if (!singleRecipientSearch.trim()) return membersList.slice(0, 8);
    const q = singleRecipientSearch.toLowerCase().trim();
    return membersList.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.studentId && m.studentId.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [membersList, singleRecipientSearch]);

  // ── Fetch Templates ──
  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const res = await axios.get(`${API}/certificate-templates`, { withCredentials: true });
      const tpls = res.data.data || [];
      setTemplatesList(tpls);

      const defaultTpl = tpls.find((t: TemplateItem) => t.isDefault) || tpls[0];
      if (defaultTpl) {
        setSingleTemplateId((prev) => prev || defaultTpl._id);
        setBulkTemplateId((prev) => prev || defaultTpl._id);
      }
    } catch {
      console.warn("Could not load certificate templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSaveTemplate = async (templateData: any) => {
    if (editingTemplate) {
      await axios.put(`${API}/certificate-templates/${editingTemplate._id}`, templateData, {
        withCredentials: true,
      });
      toast.success("Template updated successfully!");
    } else {
      await axios.post(`${API}/certificate-templates`, templateData, { withCredentials: true });
      toast.success("Template created successfully!");
    }
    fetchTemplates();
  };

  const handleDeleteTemplate = async (template: TemplateItem) => {
    if (!confirm(`Are you sure you want to delete template "${template.name}"?`)) return;
    try {
      await axios.delete(`${API}/certificate-templates/${template._id}`, { withCredentials: true });
      toast.success("Template deleted successfully!");
      fetchTemplates();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete template.");
    }
  };

  const handleSetDefaultTemplate = async (template: TemplateItem) => {
    try {
      await axios.patch(`${API}/certificate-templates/${template._id}/default`, {}, { withCredentials: true });
      toast.success(`"${template.name}" is now the default template!`);
      fetchTemplates();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to set default template.");
    }
  };

  // Filtered templates for templates tab
  const filteredTemplates = useMemo(() => {
    return templatesList.filter((tpl) => {
      const matchesSearch =
        !templateSearch.trim() ||
        tpl.name.toLowerCase().includes(templateSearch.toLowerCase().trim()) ||
        (tpl.description && tpl.description.toLowerCase().includes(templateSearch.toLowerCase().trim()));
      const matchesType = templateTypeFilter === "all" || tpl.type === templateTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [templatesList, templateSearch, templateTypeFilter]);

  // ── Handle Single Issuance ──
  const handleSingleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleRecipient || !singleName.trim()) {
      toast.error("Please select a recipient and enter a certificate title.");
      return;
    }

    setSingleIssuing(true);
    try {
      await axios.post(
        `${API}/certificates`,
        {
          recipientId: singleRecipient,
          associatedEventId: singleEvent || undefined,
          name: singleName.trim(),
          type: singleType,
          position: singlePosition.trim() || undefined,
          description: singleDescription.trim() || undefined,
          templateId: singleTemplateId || undefined,
          issueDate: singleDate,
          certificateId: singleCertId.trim() || undefined,
        },
        { withCredentials: true }
      );

      toast.success("Certificate issued successfully!");
      setShowSingleModal(false);
      resetSingleForm();
      fetchCertificates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to issue certificate.");
    } finally {
      setSingleIssuing(false);
    }
  };

  const resetSingleForm = () => {
    setSingleRecipient("");
    setSingleRecipientSearch("");
    setSingleEvent("");
    setSingleName("");
    setSingleType("participation");
    setSinglePosition("");
    setSingleDescription("");
    setSingleDate(new Date().toISOString().split("T")[0]);
    setSingleCertId("");
  };

  // ── Handle Event Selection for Bulk Issuance ──
  const handleSelectBulkEvent = async (eventId: string) => {
    setBulkEventId(eventId);
    if (!eventId) {
      setBulkEventAttendees([]);
      setSelectedAttendeeIds(new Set());
      return;
    }

    try {
      const res = await axios.get(`${API}/events/${eventId}`, { withCredentials: true });
      const eventData = res.data.data;
      const attendees = eventData.attendees || [];
      setBulkEventAttendees(attendees);
      // Select all by default
      setSelectedAttendeeIds(new Set(attendees.map((a: any) => a._id || a.id)));

      // Set default title & description
      setBulkName(`Certificate of Participation — ${eventData.title}`);
      setBulkDescription(`Awarded for active participation in ${eventData.title} organized by MEC Computer Club.`);
      if (eventData.date) {
        setBulkDate(new Date(eventData.date).toISOString().split("T")[0]);
      }
    } catch {
      toast.error("Failed to load attendees for this event.");
    }
  };

  // Toggle single attendee selection
  const toggleAttendee = (id: string) => {
    setSelectedAttendeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle select all attendees
  const toggleSelectAllAttendees = () => {
    if (selectedAttendeeIds.size === bulkEventAttendees.length) {
      setSelectedAttendeeIds(new Set());
    } else {
      setSelectedAttendeeIds(new Set(bulkEventAttendees.map((a: any) => a._id || a.id)));
    }
  };

  // ── Handle Bulk Issuance (100+ Students) ──
  const handleBulkIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetRecipientIds: string[] = [];

    if (bulkMode === "event_attendees") {
      targetRecipientIds = Array.from(selectedAttendeeIds);
      if (targetRecipientIds.length === 0) {
        toast.error("Please select at least one attendee.");
        return;
      }
    } else {
      // Parse manual student IDs / emails
      const rawTokens = bulkManualIds
        .split(/[\n,;]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (rawTokens.length === 0) {
        toast.error("Please enter Student IDs or Emails.");
        return;
      }

      // Match against membersList
      const matched = membersList.filter(
        (m) =>
          rawTokens.includes(m.studentId?.toLowerCase()) ||
          rawTokens.includes(m.email?.toLowerCase())
      );

      if (matched.length === 0) {
        toast.error("None of the entered Student IDs / Emails matched registered club members.");
        return;
      }

      targetRecipientIds = matched.map((m) => m._id);
    }

    if (!bulkName.trim()) {
      toast.error("Please provide a certificate title.");
      return;
    }

    setBulkIssuing(true);
    try {
      const res = await axios.post(
        `${API}/certificates/bulk`,
        {
          name: bulkName.trim(),
          description: bulkDescription.trim() || undefined,
          associatedEventId: bulkEventId || undefined,
          templateId: bulkTemplateId || undefined,
          issueDate: bulkDate,
          type: bulkType,
          recipients: targetRecipientIds,
        },
        { withCredentials: true }
      );

      toast.success(res.data.message || `Issued ${res.data.count || targetRecipientIds.length} certificates!`);
      setShowBulkModal(false);
      fetchCertificates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to bulk issue certificates.");
    } finally {
      setBulkIssuing(false);
    }
  };

  // ── Revoke Certificate Handler ──
  const handleRevokeConfirm = async () => {
    if (!revokeCertTarget) return;
    try {
      await axios.patch(
        `${API}/certificates/${revokeCertTarget._id}/revoke`,
        { reason: revokeReason.trim() || "Revoked by club administration" },
        { withCredentials: true }
      );
      toast.success(`Certificate ${revokeCertTarget.certificateId} revoked.`);
      setRevokeCertTarget(null);
      setRevokeReason("");
      fetchCertificates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revoke certificate.");
    }
  };

  // ── Delete Certificate Handler ──
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/certificates/${deleteTarget._id}`, { withCredentials: true });
      toast.success("Certificate deleted permanently.");
      setDeleteTarget(null);
      fetchCertificates();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete certificate.");
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2">
            <Award className="text-accent-primary" size={28} />
            Certificates Issuance &amp; Registry
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Issue individual awards, batch-issue mass participation certificates to 100+ event attendees, and manage the official registry.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-accent-primary hover:bg-accent-primary-hover text-surface-primary border border-border-default rounded-xl font-bold text-xs sm:text-sm transition shadow-[2px_2px_0px_var(--border-brutalist)]"
          >
            <Users size={16} /> Batch Issue Event (100+)
          </button>
          <button
            type="button"
            onClick={() => setShowSingleModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-elevated hover:bg-surface-secondary text-text-primary border border-border-default rounded-xl font-bold text-xs sm:text-sm transition shadow-[2px_2px_0px_var(--border-brutalist)]"
          >
            <Plus size={16} /> Issue Single Award
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-elevated p-5 rounded-xl border border-border-default shadow-[3px_3px_0px_var(--border-default)]">
          <span className="font-mono text-xs uppercase text-text-tertiary font-bold block mb-1">
            Total Certificates Issued
          </span>
          <span className="text-3xl font-black text-text-primary">{metrics.total}</span>
        </div>
        <div className="bg-surface-elevated p-5 rounded-xl border border-border-default shadow-[3px_3px_0px_var(--border-default)]">
          <span className="font-mono text-xs uppercase text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
            Active &amp; Authentic
          </span>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{metrics.valid}</span>
        </div>
        <div className="bg-surface-elevated p-5 rounded-xl border border-border-default shadow-[3px_3px_0px_var(--border-default)]">
          <span className="font-mono text-xs uppercase text-red-600 dark:text-red-400 font-bold block mb-1">
            Revoked Certificates
          </span>
          <span className="text-3xl font-black text-red-600 dark:text-red-400">{metrics.revoked}</span>
        </div>
      </div>

      {/* View Switcher: Registry vs Templates */}
      <div className="flex gap-2 p-1.5 bg-surface-secondary rounded-xl border border-border-default w-fit shadow-sm">
        <button
          type="button"
          onClick={() => setPageTab("registry")}
          className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer border-none ${
            pageTab === "registry"
              ? "bg-surface-elevated text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] border border-border-default"
              : "bg-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Award size={16} className="text-accent-primary" />
          Certificates Registry
          <span className="ml-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-primary border border-border-default">
            {metrics.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPageTab("templates")}
          className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer border-none ${
            pageTab === "templates"
              ? "bg-surface-elevated text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] border border-border-default"
              : "bg-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <Layers size={16} className="text-accent-primary" />
          Certificate Templates
          <span className="ml-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-primary border border-border-default">
            {templatesList.length}
          </span>
        </button>
      </div>

      {pageTab === "registry" && (
        <>
          {/* Filter & Search Bar */}
      <div className="bg-surface-elevated p-4 rounded-xl border border-border-default flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient, student ID, cert ID…"
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-border-default bg-surface-primary text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="w-36">
            <FilterSelect
              placeholder="Filter Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "valid", label: "Valid Only" },
                { value: "revoked", label: "Revoked" },
              ]}
            />
          </div>

          {/* Type Filter */}
          <div className="w-40">
            <FilterSelect
              placeholder="Filter Type"
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              options={[
                { value: "all", label: "All Types" },
                { value: "participation", label: "Participation" },
                { value: "winner", label: "Winner / Podium" },
                { value: "completion", label: "Completion" },
                { value: "achievement", label: "Achievement" },
                { value: "appreciation", label: "Appreciation" },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={fetchCertificates}
            title="Refresh registry"
            className="p-2 border border-border-default rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-elevated rounded-xl border border-border-default overflow-hidden shadow-[4px_4px_0px_var(--border-default)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-default bg-surface-secondary font-mono text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Credential ID</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Award Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Associated Event</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default text-xs font-sans">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-tertiary font-mono">
                    Loading certificate registry…
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-tertiary font-mono">
                    No certificates found matching criteria. Click &quot;Issue Single Award&quot; or &quot;Batch Issue Event&quot; to issue certificates.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-surface-secondary/50 transition-colors">
                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase py-0.5 px-2 rounded-full border ${
                          cert.status === "valid"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                        }`}
                      >
                        {cert.status === "valid" ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        {cert.status}
                      </span>
                    </td>

                    {/* Certificate ID */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-text-primary">
                      <div className="flex items-center gap-1.5">
                        <span>{cert.certificateId}</span>
                        <button
                          type="button"
                          onClick={() => copyText(cert.certificateId, "Certificate ID")}
                          className="text-text-tertiary hover:text-text-primary p-0.5"
                          title="Copy ID"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-surface-secondary border border-border-default flex items-center justify-center font-bold text-xs text-text-primary flex-shrink-0 overflow-hidden relative">
                          {cert.recipient?.imageUrl ? (
                            <Image src={cert.recipient.imageUrl} alt="" fill className="object-cover" />
                          ) : (
                            cert.recipient?.fullName?.slice(0, 2).toUpperCase() || "MB"
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-text-primary block leading-tight">
                            {cert.recipient?.fullName || "Unknown Member"}
                          </span>
                          <span className="font-mono text-[10px] text-text-tertiary">
                            {cert.recipient?.studentId || "No Student ID"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Award Title */}
                    <td className="py-3 px-4 font-semibold text-text-primary max-w-xs truncate">
                      {cert.name}
                      {cert.position && (
                        <span className="ml-1.5 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {cert.position}
                        </span>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] uppercase text-text-secondary">
                      {cert.type}
                    </td>

                    {/* Associated Event */}
                    <td className="py-3 px-4 whitespace-nowrap text-text-secondary">
                      {cert.associatedEvent ? (
                        <span className="truncate max-w-[180px] block" title={cert.associatedEvent.title}>
                          {cert.associatedEvent.title}
                        </span>
                      ) : (
                        <span className="text-text-tertiary italic font-mono text-[11px]">Standalone</span>
                      )}
                    </td>

                    {/* Issue Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-text-secondary">
                      {new Date(cert.issueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* View in Verify */}
                        <Link
                          href={`/verify?cert=${cert.certificateId}`}
                          target="_blank"
                          className="p-1.5 text-text-secondary hover:text-accent-primary hover:bg-surface-secondary rounded transition"
                          title="Open Public Verification"
                        >
                          <ExternalLink size={14} />
                        </Link>

                        {/* Copy Link */}
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/verify?cert=${cert.certificateId}`;
                            copyText(url, "Verification URL");
                          }}
                          className="p-1.5 text-text-secondary hover:text-accent-primary hover:bg-surface-secondary rounded transition"
                          title="Copy Verification Link"
                        >
                          <Share2 size={14} />
                        </button>

                        {/* Revoke */}
                        {cert.status === "valid" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setRevokeCertTarget(cert);
                              setRevokeReason("");
                            }}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 rounded transition font-mono text-[11px] font-bold"
                            title="Revoke Certificate"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-red-500 font-bold px-1">REVOKED</span>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(cert)}
                          className="p-1.5 text-text-tertiary hover:text-red-600 hover:bg-red-500/10 rounded transition"
                          title="Delete Certificate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {/* ── TAB 2: CERTIFICATE TEMPLATES MANAGEMENT ── */}
  {pageTab === "templates" && (
    <div className="space-y-6">
      {/* Top Bar with Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">
            Certificate Design Templates
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Customize event-specific visual themes, brutalist styling, or upload custom HTML/CSS certificate files.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingTemplate(null);
            setShowTemplateModal(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus size={16} className="mr-1.5" /> Create Template
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface-elevated p-3 rounded-xl border border-border-default flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
            placeholder="Search templates by name…"
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-border-default bg-surface-primary text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-44">
            <FilterSelect
              placeholder="Template Type"
              value={templateTypeFilter}
              onChange={(val) => setTemplateTypeFilter(val)}
              options={[
                { value: "all", label: "All Template Types" },
                { value: "visual", label: "Visual Presets" },
                { value: "html", label: "Custom HTML" },
              ]}
            />
          </div>

          <button
            type="button"
            onClick={fetchTemplates}
            title="Refresh templates"
            className="p-2 border border-border-default rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Grid of Templates */}
      {loadingTemplates ? (
        <div className="py-16 text-center text-text-tertiary font-mono">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-3"></div>
          Loading certificate templates…
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-16 text-center bg-surface-elevated rounded-2xl border border-dashed border-border-default p-6">
          <Award size={36} className="mx-auto text-text-tertiary mb-3 opacity-50" />
          <h3 className="text-base font-bold text-text-primary mb-1">No templates found</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto mb-4">
            Create custom certificate themes or upload HTML files to personalize your event awards.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateModal(true);
            }}
          >
            <Plus size={14} className="mr-1.5" /> Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => (
            <CertificateTemplateCard
              key={tpl._id}
              template={tpl}
              onPreview={(t) => setPreviewingTemplate(t)}
              onEdit={(t) => {
                setEditingTemplate(t);
                setShowTemplateModal(true);
              }}
              onDelete={handleDeleteTemplate}
              onSetDefault={handleSetDefaultTemplate}
            />
          ))}
        </div>
      )}
    </div>
  )}

      {/* ── MODAL 1: SINGLE CERTIFICATE ISSUANCE ── */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-surface-elevated border-2 border-border-brutalist rounded-2xl max-w-xl w-full p-6 shadow-[8px_8px_0px_var(--accent-primary)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border-default mb-5">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Plus size={20} className="text-accent-primary" />
                Issue Single Certificate
              </h2>
              <button
                type="button"
                onClick={() => setShowSingleModal(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSingleIssue} className="space-y-4 text-xs sm:text-sm">
              {/* Recipient Selection */}
              <div>
                <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                  Recipient Member *
                </label>
                <input
                  type="text"
                  value={singleRecipientSearch}
                  onChange={(e) => setSingleRecipientSearch(e.target.value)}
                  placeholder="Type name, student ID, or email to search…"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                />

                {/* Suggestions List */}
                <div className="mt-2 max-h-36 overflow-y-auto border border-border-default rounded-lg divide-y divide-border-default bg-surface-secondary">
                  {filteredMemberSuggestions.map((m) => {
                    const isSelected = singleRecipient === m._id;
                    return (
                      <div
                        key={m._id}
                        onClick={() => {
                          setSingleRecipient(m._id);
                          setSingleRecipientSearch(`${m.fullName} (${m.studentId || m.email})`);
                        }}
                        className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected ? "bg-accent-primary-light font-bold" : "hover:bg-surface-primary"
                        }`}
                      >
                        <div>
                          <strong className="text-text-primary block">{m.fullName}</strong>
                          <span className="text-[11px] font-mono text-text-tertiary">
                            {m.studentId} &bull; {m.department || "Member"}
                          </span>
                        </div>
                        {isSelected && <Check size={16} className="text-accent-primary" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Linkage (Optional) */}
              <div>
                <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                  Associated Event (Optional)
                </label>
                <select
                  value={singleEvent}
                  onChange={(e) => {
                    const evId = e.target.value;
                    setSingleEvent(evId);
                    const ev = eventsList.find((x) => x._id === evId);
                    if (ev && !singleName) {
                      setSingleName(`Certificate of Achievement — ${ev.title}`);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="">None (Standalone Award / Recognition)</option>
                  {eventsList.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} ({new Date(ev.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Certificate Template Selection */}
              <div>
                <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1 flex items-center justify-between">
                  <span>Certificate Template</span>
                  <span className="text-[10px] text-text-tertiary font-normal">Controls colors, theme or HTML</span>
                </label>
                <select
                  value={singleTemplateId}
                  onChange={(e) => setSingleTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary font-sans"
                >
                  {templatesList.map((tpl) => (
                    <option key={tpl._id} value={tpl._id}>
                      {tpl.name} ({tpl.type === "html" ? "Custom HTML" : tpl.theme}){tpl.isDefault ? " ★ Default" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Certificate Title */}
              <div>
                <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="e.g. Certificate of Excellence / 1st Place Champion"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              {/* Type and Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                    Award Type
                  </label>
                  <select
                    value={singleType}
                    onChange={(e) => setSingleType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                  >
                    <option value="participation">Participation</option>
                    <option value="winner">Winner / Podium</option>
                    <option value="completion">Completion</option>
                    <option value="achievement">Achievement</option>
                    <option value="appreciation">Appreciation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                    Position / Rank (Optional)
                  </label>
                  <input
                    type="text"
                    value={singlePosition}
                    onChange={(e) => setSinglePosition(e.target.value)}
                    placeholder="e.g. Champion, 1st Runner Up"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              {/* Citation Description */}
              <div>
                <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                  Citation / Description
                </label>
                <textarea
                  rows={3}
                  value={singleDescription}
                  onChange={(e) => setSingleDescription(e.target.value)}
                  placeholder="In recognition of outstanding performance and dedication in..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>

              {/* Issue Date & Custom Certificate ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                    Custom ID (Leave blank to auto-generate)
                  </label>
                  <input
                    type="text"
                    value={singleCertId}
                    onChange={(e) => setSingleCertId(e.target.value.toUpperCase())}
                    placeholder="e.g. MCC-2026-EXCELLENCE"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary font-mono uppercase text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
                <Button variant="secondary" size="md" onClick={() => setShowSingleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="md" disabled={singleIssuing}>
                  {singleIssuing ? "Issuing…" : "Issue Certificate →"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: MASS BATCH EVENT ISSUANCE (100+ PARTICIPANTS) ── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-surface-elevated border-2 border-border-brutalist rounded-2xl max-w-2xl w-full p-6 shadow-[8px_8px_0px_var(--accent-primary)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border-default mb-5">
              <div>
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <Users size={20} className="text-accent-primary" />
                  Mass Participation Certificate Issuance
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Automated high-speed batch generation for 100+ event participants in 1 click.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2 p-1 bg-surface-secondary rounded-lg mb-5 border border-border-default">
              <button
                type="button"
                onClick={() => setBulkMode("event_attendees")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                  bulkMode === "event_attendees"
                    ? "bg-surface-elevated text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Select from Event Attendees
              </button>
              <button
                type="button"
                onClick={() => setBulkMode("manual_paste")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                  bulkMode === "manual_paste"
                    ? "bg-surface-elevated text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Paste Student IDs / Emails
              </button>
            </div>

            <form onSubmit={handleBulkIssue} className="space-y-4 text-xs sm:text-sm">
              {bulkMode === "event_attendees" ? (
                <>
                  {/* Select Event */}
                  <div>
                    <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                      Target Event *
                    </label>
                    <select
                      required
                      value={bulkEventId}
                      onChange={(e) => handleSelectBulkEvent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                    >
                      <option value="">-- Choose an Event to load attendees --</option>
                      {eventsList.map((ev) => (
                        <option key={ev._id} value={ev._id}>
                          {ev.title} ({new Date(ev.date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attendees Selection Box */}
                  {bulkEventId && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs uppercase font-mono text-text-primary">
                          Recipients ({selectedAttendeeIds.size} of {bulkEventAttendees.length} selected)
                        </span>
                        <button
                          type="button"
                          onClick={toggleSelectAllAttendees}
                          className="text-xs font-bold text-accent-primary-hover hover:underline"
                        >
                          {selectedAttendeeIds.size === bulkEventAttendees.length ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto border border-border-default rounded-lg divide-y divide-border-default bg-surface-secondary">
                        {bulkEventAttendees.length === 0 ? (
                          <div className="p-4 text-center text-text-tertiary italic font-mono text-xs">
                            No approved attendees recorded for this event yet.
                          </div>
                        ) : (
                          bulkEventAttendees.map((att: any) => {
                            const isChecked = selectedAttendeeIds.has(att._id || att.id);
                            return (
                              <label
                                key={att._id || att.id}
                                className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-surface-primary transition-colors select-none"
                              >
                                <div>
                                  <strong className="text-text-primary block text-xs">{att.fullName}</strong>
                                  <span className="font-mono text-[10px] text-text-tertiary">
                                    {att.studentId} &bull; {att.department || "Member"}
                                  </span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleAttendee(att._id || att.id)}
                                  className="rounded border-border-default text-accent-primary focus:ring-accent-primary w-4 h-4"
                                />
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Manual Paste Mode */
                <div>
                  <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                    Paste Student IDs or Emails (comma or line separated)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={bulkManualIds}
                    onChange={(e) => setBulkManualIds(e.target.value)}
                    placeholder="2021331501, 2021331502&#10;2021331503&#10;alice@std.mec.edu.bd"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary font-mono text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                  <span className="text-[11px] text-text-tertiary font-mono mt-1 block">
                    The system will automatically resolve them against registered club members.
                  </span>
                </div>
              )}

              {/* Certificate Template Selection */}
              <div>
                <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1 flex items-center justify-between">
                  <span>Certificate Template</span>
                  <span className="text-[10px] text-text-tertiary font-normal">Applied to all batch attendees</span>
                </label>
                <select
                  value={bulkTemplateId}
                  onChange={(e) => setBulkTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary font-sans"
                >
                  {templatesList.map((tpl) => (
                    <option key={tpl._id} value={tpl._id}>
                      {tpl.name} ({tpl.type === "html" ? "Custom HTML" : tpl.theme}){tpl.isDefault ? " ★ Default" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Title */}
              <div>
                <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                  Certificate Title *
                </label>
                <input
                  type="text"
                  required
                  value={bulkName}
                  onChange={(e) => setBulkName(e.target.value)}
                  placeholder="e.g. Certificate of Participation — MEC Hackathon 2026"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              {/* Citation Template */}
              <div>
                <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                  Citation / Description
                </label>
                <textarea
                  rows={2}
                  value={bulkDescription}
                  onChange={(e) => setBulkDescription(e.target.value)}
                  placeholder="Awarded for active participation and dedication in..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>

              {/* Issue Date & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={bulkDate}
                    onChange={(e) => setBulkDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                    Type
                  </label>
                  <select
                    value={bulkType}
                    onChange={(e) => setBulkType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary focus:outline-none focus:border-accent-primary"
                  >
                    <option value="participation">Participation</option>
                    <option value="completion">Completion</option>
                    <option value="appreciation">Appreciation</option>
                    <option value="winner">Winner</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
                <Button variant="secondary" size="md" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="md" disabled={bulkIssuing}>
                  {bulkIssuing ? "Batch Issuing…" : "Run Batch Issuance →"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: REVOCATION MODAL ── */}
      {revokeCertTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-elevated border-2 border-red-500 rounded-2xl max-w-md w-full p-6 shadow-[8px_8px_0px_var(--accent-error)]">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-2">
              <AlertTriangle size={20} />
              Revoke Certificate?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-4">
              You are revoking certificate <strong className="text-text-primary">{revokeCertTarget.certificateId}</strong> issued to <strong className="text-text-primary">{revokeCertTarget.recipient?.fullName}</strong>. The verification page will flag this credential as invalid.
            </p>

            <div className="mb-4">
              <label className="block font-bold text-xs uppercase font-mono text-text-primary mb-1">
                Reason for Revocation *
              </label>
              <input
                type="text"
                required
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Issued in error / Disciplinary violation"
                className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-xs sm:text-sm text-text-primary focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setRevokeCertTarget(null)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleRevokeConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: DELETE CONFIRMATION ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-elevated border-2 border-border-brutalist rounded-2xl max-w-md w-full p-6 shadow-[6px_6px_0px_var(--border-brutalist)]">
            <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" />
              Delete Certificate Permanently?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-5">
              This will completely remove <strong className="text-text-primary">{deleteTarget.certificateId}</strong> from the database and unlink it from the member profile.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: CREATE / EDIT CERTIFICATE TEMPLATE ── */}
      <CertificateTemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        initialData={editingTemplate}
      />

      {/* ── MODAL 6: PREVIEW CERTIFICATE TEMPLATE ── */}
      <CertificateTemplatePreviewModal
        template={previewingTemplate}
        onClose={() => setPreviewingTemplate(null)}
      />
    </div>
  );
}
