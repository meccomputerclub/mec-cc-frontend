"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { interpolateCertificateHtml } from "@/lib/utils/templateInterpolation";
import {
  ShieldCheck,
  Award,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Printer,
  Calendar,
  MapPin,
  ExternalLink,
  Code2,
  FolderGit2,
  FileText,
  Trophy,
  Share2,
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const certParam = searchParams.get("certificate") || searchParams.get("cert") || "";
  const memberParam = searchParams.get("member") || searchParams.get("studentId") || "";

  const initialTab = certParam
    ? "certificate"
    : memberParam
    ? "member"
    : "certificate";

  const [activeTab, setActiveTab] = useState<"certificate" | "member">(initialTab);

  // ── Certificate Verification State ──
  const [certificateId, setCertificateId] = useState(certParam);
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [certVerifying, setCertVerifying] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    if (certificateData?.template?.type === "html" && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }
  };

  // ── Member Activity Lookup State ──
  const [memberQuery, setMemberQuery] = useState(memberParam);
  const [memberData, setMemberData] = useState<any | null>(null);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  // Auto-verify certificate if present in URL
  useEffect(() => {
    if (certParam) {
      verifyCert(certParam);
    }
  }, [certParam]);

  // Auto-lookup member if present in URL
  useEffect(() => {
    if (memberParam) {
      lookupMember(memberParam);
    }
  }, [memberParam]);

  // ── Certificate Verification Handler ──
  const verifyCert = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setCertVerifying(true);
    setCertError(null);
    setCertificateData(null);

    try {
      const res = await api.get(`/api/certificates/verify/${encodeURIComponent(idToVerify.trim())}`);
      const cert = res.data || res.certificate || res;
      setCertificateData(cert);
      if (cert.status === "revoked") {
        toast.error("This certificate was revoked by the club administration.");
      } else {
        toast.success("Certificate verified authentic!");
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Certificate could not be verified.";
      setCertError(msg);
      toast.error(msg);
    } finally {
      setCertVerifying(false);
    }
  };

  // ── Member Lookup Handler ──
  const lookupMember = async (idToQuery: string) => {
    if (!idToQuery.trim()) return;
    setMemberSearching(true);
    setMemberError(null);
    setMemberData(null);

    try {
      const res = await api.get(`/api/users/lookup/${encodeURIComponent(idToQuery.trim())}`);
      setMemberData(res.data);
      toast.success("Member record found!");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Member record could not be found.";
      setMemberError(msg);
      toast.error(msg);
    } finally {
      setMemberSearching(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 print:hidden">
          <span className="kicker">
            <ShieldCheck size={14} className="inline align-middle mr-1" />
            Official Registry &bull; MEC-CC
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-3">
            Verification &amp; Member Lookup
          </h1>
          <p className="text-base text-text-secondary leading-relaxed">
            Verify authentic club certificates and check official club member activity records.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 max-w-md mx-auto mb-8 p-1.5 bg-surface-secondary rounded-xl border border-border-default shadow-sm print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab("certificate")}
            className={`flex-1 py-2.5 px-3 rounded-lg border-none flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "certificate"
                ? "bg-surface-elevated text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] border border-border-default"
                : "bg-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <Award size={16} className="text-accent-primary" /> Certificate Check
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("member")}
            className={`flex-1 py-2.5 px-3 rounded-lg border-none flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "member"
                ? "bg-surface-elevated text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] border border-border-default"
                : "bg-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <UserCheck size={16} className="text-accent-primary" /> Member Activity
          </button>
        </div>

        {/* ── TAB 1: CERTIFICATE VERIFICATION ── */}
        {activeTab === "certificate" && (
          <div className="space-y-6">
            {/* Search Card */}
            <div className="max-w-2xl mx-auto bg-surface-elevated p-6 sm:p-7 rounded-2xl border-2 border-border-brutalist shadow-[6px_6px_0px_var(--accent-primary)] print:hidden">
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <Award size={20} className="text-accent-primary" />
                Validate Official Credential
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mb-4">
                Enter the unique Certificate ID printed on the credential (e.g., <code className="font-mono bg-surface-secondary px-1.5 py-0.5 rounded text-accent-primary font-bold">MCC-2026-A8F29C</code>).
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyCert(certificateId);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                    placeholder="Enter Certificate ID…"
                    className="w-full px-4 py-3 border-2 border-border-brutalist rounded-xl bg-surface-primary text-base font-mono uppercase tracking-wider text-text-primary focus:outline-none focus:border-accent-primary transition-all"
                  />
                </div>
                <Button type="submit" size="lg" disabled={certVerifying} className="flex-shrink-0">
                  {certVerifying ? "Verifying…" : "Verify Credential →"}
                </Button>
              </form>

              {certError && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2.5">
                  <XCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Verification Failed</strong>
                    <span>{certError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Verified Certificate Display Card */}
            {certificateData && (() => {
              const certPrimaryColor = certificateData.template?.primaryColor || "#0F766E";
              const certIsRevoked = certificateData.status === "revoked";

              return (
                <div
                  id="certificate-print-area"
                  className="max-w-3xl mx-auto bg-surface-elevated border-2 border-border-brutalist rounded-2xl overflow-hidden shadow-[8px_8px_0px_var(--border-brutalist)] animate-fade-in"
                >
                  {/* Header Strip - Official Status */}
                  <div
                    className={`px-6 py-4 flex items-center justify-between border-b-2 border-border-brutalist print:hidden ${
                      certIsRevoked
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {certIsRevoked ? (
                        <>
                          <AlertTriangle size={20} className="text-red-500" />
                          <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                            REVOKED CREDENTIAL
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={20} className="text-emerald-500 animate-pulse" />
                          <span className="font-mono text-xs font-extrabold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                            OFFICIAL VERIFIED CREDENTIAL
                          </span>
                        </>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-text-secondary bg-surface-elevated px-2.5 py-1 rounded-md border border-border-default uppercase shadow-sm">
                      {certificateData.type || "PARTICIPATION"}
                    </span>
                  </div>

                  {/* Custom HTML Template Rendering */}
                  {certificateData.template?.type === "html" && certificateData.template?.htmlContent ? (
                    <div id="certificate-print-canvas" className="p-4 sm:p-6 bg-slate-100 flex justify-center print:p-0 print:m-0 print:border-none print:bg-white">
                      <iframe
                        ref={iframeRef}
                        title="Official Certificate"
                        srcDoc={interpolateCertificateHtml(certificateData.template.htmlContent, {
                          recipient_name: certificateData.recipient?.fullName,
                          student_id: certificateData.recipient?.studentId,
                          department: certificateData.recipient?.department,
                          batch: certificateData.recipient?.batch,
                          session: certificateData.recipient?.session,
                          event_title: certificateData.associatedEvent?.title,
                          certificate_title: certificateData.name,
                          certificate_id: certificateData.certificateId,
                          issue_date: new Date(certificateData.issueDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }),
                          position: certificateData.position,
                          description: certificateData.description,
                          verification_url: `${typeof window !== "undefined" ? window.location.origin : ""}/verify?cert=${certificateData.certificateId}`,
                        })}
                        sandbox="allow-same-origin"
                        className="w-full max-w-3xl aspect-[1.414/1] rounded-xl border border-slate-300 shadow-md bg-white"
                      />
                    </div>
                  ) : (
                    /* Visual Mode Body - Strictly Fixed Authentic Colors (Immutable) */
                    <div
                      id="certificate-print-canvas"
                      className="p-8 sm:p-12 text-center relative bg-white text-slate-900 border-t-2 border-b-2 border-slate-900"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#0F172A",
                        backgroundImage: certificateData.template?.backgroundUrl
                          ? `url(${certificateData.template.backgroundUrl})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-4 shadow-sm"
                        style={{
                          backgroundColor: `${certPrimaryColor}15`,
                          borderColor: certPrimaryColor,
                          color: certPrimaryColor,
                        }}
                      >
                        <Award size={36} />
                      </div>

                      <span
                        className="font-mono text-xs font-extrabold uppercase tracking-widest block mb-1"
                        style={{ color: certPrimaryColor }}
                      >
                        {certificateData.template?.headerSubtitle || "MYMENSINGH ENGINEERING COLLEGE COMPUTER CLUB"}
                      </span>

                      <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                        {certificateData.name || "Certificate of Excellence"}
                      </h2>

                      {certificateData.position && (
                        <div className="inline-block my-2 py-1 px-4 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-mono text-sm font-extrabold uppercase tracking-wider">
                          ★ {certificateData.position}
                        </div>
                      )}

                      <div className="border-t-2 border-b-2 border-dashed border-slate-300 py-6 my-6 max-w-xl mx-auto">
                        <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-widest block mb-1">
                          {certificateData.template?.presentationText || "PROUDLY PRESENTED TO"}
                        </span>
                        <h3
                          className="text-2xl sm:text-3xl font-black mb-1"
                          style={{ color: certPrimaryColor }}
                        >
                          {certificateData.recipient?.fullName || "Club Member"}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 font-mono">
                          Student ID: <strong className="text-slate-900">{certificateData.recipient?.studentId || "N/A"}</strong> &bull; Dept. of {certificateData.recipient?.department || "CSE"}
                        </p>
                      </div>

                      {certificateData.description && (
                        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-6 italic">
                          &ldquo;{certificateData.description}&rdquo;
                        </p>
                      )}

                      {certificateData.associatedEvent && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto mb-6 text-xs text-slate-700 font-mono flex items-center justify-center gap-2">
                          <Calendar size={13} style={{ color: certPrimaryColor }} />
                          <span>Event: <strong className="text-slate-900">{certificateData.associatedEvent.title}</strong></span>
                        </div>
                      )}

                      {certIsRevoked && (
                        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-left max-w-lg mx-auto mb-6 text-xs text-red-700">
                          <strong>Revocation Note:</strong> {certificateData.revocationReason || "Revoked by club committee."}
                        </div>
                      )}

                      {/* Metadata & Signatories Row - Fixed Crisp Text */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-6 border-t border-slate-200 max-w-2xl mx-auto font-mono text-xs text-slate-600">
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Issue Date</span>
                          <strong className="text-slate-900">
                            {new Date(certificateData.issueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </strong>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Credential ID</span>
                          <strong className="text-slate-900">{certificateData.certificateId}</strong>
                        </div>
                        {certificateData.template?.signatories && certificateData.template.signatories.length > 0 ? (
                          certificateData.template.signatories.slice(0, 2).map((sig: any, idx: number) => (
                            <div key={idx}>
                              <span className="block text-[10px] text-slate-400 uppercase font-semibold line-clamp-1">{sig.title}</span>
                              <strong className="text-slate-900 line-clamp-1">{sig.name}</strong>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2">
                            <span className="block text-[10px] text-slate-400 uppercase font-semibold">Issuer Authority</span>
                            <strong className="text-slate-900">MEC-CC Executive Board</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="px-6 py-4 bg-surface-secondary border-t-2 border-border-brutalist flex flex-wrap items-center justify-between gap-3 print:hidden">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="print:hidden"
                    >
                      <Printer size={14} className="mr-1.5" /> Print / Save PDF
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/verify?cert=${certificateData.certificateId}`;
                        copyToClipboard(url, "Public Verification Link");
                      }}
                      className="print:hidden"
                    >
                      <Share2 size={14} className="mr-1.5" /> Share Link
                    </Button>
                  </div>

                  {certificateData.recipient?.studentId && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveTab("member");
                        setMemberQuery(certificateData.recipient.studentId);
                        lookupMember(certificateData.recipient.studentId);
                      }}
                      className="print:hidden"
                    >
                      <UserCheck size={14} className="mr-1.5" /> View Member Activity →
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
          </div>
        )}

        {/* ── TAB 2: MEMBER ACTIVITY LOOKUP ── */}
        {activeTab === "member" && (
          <div className="space-y-6">
            {/* Search Card */}
            <div className="max-w-2xl mx-auto bg-surface-elevated p-6 sm:p-7 rounded-2xl border-2 border-border-brutalist shadow-[6px_6px_0px_var(--accent-primary)]">
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <UserCheck size={20} className="text-accent-primary" />
                Inspect Club Member Activity
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mb-4">
                Enter a student ID (e.g. <code className="font-mono bg-surface-secondary px-1.5 py-0.5 rounded text-accent-primary font-bold">2021331501</code>) or email to look up official club records, attended events, certificates, and achievements.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  lookupMember(memberQuery);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    placeholder="Enter Student ID or Email…"
                    className="w-full px-4 py-3 border-2 border-border-brutalist rounded-xl bg-surface-primary text-base text-text-primary focus:outline-none focus:border-accent-primary transition-all"
                  />
                </div>
                <Button type="submit" size="lg" disabled={memberSearching} className="flex-shrink-0">
                  {memberSearching ? "Looking up…" : "Check Activity →"}
                </Button>
              </form>

              {memberError && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2.5">
                  <XCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Member Not Found</strong>
                    <span>{memberError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Member Activity Profile Display */}
            {memberData && (
              <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                {/* Profile Identity Card */}
                <div className="bg-surface-elevated border-2 border-border-brutalist rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_var(--border-brutalist)]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border-default">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-secondary border-2 border-border-brutalist relative overflow-hidden flex items-center justify-center font-bold text-xl text-text-primary flex-shrink-0 shadow-sm">
                        {memberData.member.imageUrl ? (
                          <Image
                            src={memberData.member.imageUrl}
                            alt={memberData.member.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          memberData.member.fullName?.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-2xl font-black text-text-primary">
                            {memberData.member.fullName}
                          </h3>
                          <span className="font-mono text-[10px] font-extrabold uppercase py-0.5 px-2 rounded bg-accent-primary-light text-accent-primary-text border border-accent-primary/20">
                            {memberData.member.clubRole || "MEMBER"}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-text-secondary font-mono">
                          ID: <strong className="text-text-primary">{memberData.member.studentId}</strong> &bull; Dept: {memberData.member.department} &bull; Session: {memberData.member.session || "N/A"}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          <CheckCircle2 size={13} />
                          <span>VERIFIED MEC COMPUTER CLUB MEMBER</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto">
                      <Link
                        href={`/members`}
                        className="text-xs font-mono font-bold text-accent-primary-hover hover:underline inline-flex items-center gap-1"
                      >
                        ALL MEMBERS <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
                    <div className="bg-surface-secondary p-3.5 rounded-xl border border-border-default text-center">
                      <span className="block text-2xl font-black text-text-primary">
                        {memberData.metrics.eventsCount}
                      </span>
                      <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
                        Events Attended
                      </span>
                    </div>
                    <div className="bg-surface-secondary p-3.5 rounded-xl border border-border-default text-center">
                      <span className="block text-2xl font-black text-accent-primary">
                        {memberData.metrics.certificatesCount}
                      </span>
                      <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
                        Certificates
                      </span>
                    </div>
                    <div className="bg-surface-secondary p-3.5 rounded-xl border border-border-default text-center">
                      <span className="block text-2xl font-black text-amber-500">
                        {memberData.metrics.achievementsCount}
                      </span>
                      <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
                        Podium Wins
                      </span>
                    </div>
                    <div className="bg-surface-secondary p-3.5 rounded-xl border border-border-default text-center">
                      <span className="block text-2xl font-black text-text-primary">
                        {memberData.metrics.projectsCount}
                      </span>
                      <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
                        Projects Shipped
                      </span>
                    </div>
                  </div>
                </div>

                {/* Earned Certificates List */}
                <div className="bg-surface-elevated border-2 border-border-brutalist rounded-2xl p-6 shadow-[6px_6px_0px_var(--border-brutalist)]">
                  <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Award size={18} className="text-accent-primary" />
                    Official Certificates &amp; Credentials ({memberData.certificates?.length || 0})
                  </h4>

                  {memberData.certificates && memberData.certificates.length > 0 ? (
                    <div className="space-y-3">
                      {memberData.certificates.map((c: any) => (
                        <div
                          key={c._id || c.certificateId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-secondary rounded-xl border border-border-default gap-3 hover:border-accent-primary transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-mono text-[10px] font-bold py-0.5 px-2 rounded uppercase ${
                                c.status === "revoked"
                                  ? "bg-red-500/15 text-red-600"
                                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              }`}>
                                {c.status === "revoked" ? "REVOKED" : "VALID"}
                              </span>
                              <span className="font-mono text-[10px] text-text-tertiary uppercase">
                                {c.type}
                              </span>
                            </div>
                            <h5 className="font-bold text-base text-text-primary">
                              {c.name}
                            </h5>
                            <div className="flex items-center gap-3 text-xs font-mono text-text-secondary mt-1">
                              <span>ID: <code className="text-accent-primary font-bold">{c.certificateId}</code></span>
                              <span>&bull;</span>
                              <span>Issued: {new Date(c.issueDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setActiveTab("certificate");
                                setCertificateId(c.certificateId);
                                verifyCert(c.certificateId);
                              }}
                            >
                              Verify Credential ↗
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary font-mono italic text-center py-4">
                      No certificates recorded yet for this member.
                    </p>
                  )}
                </div>

                {/* Attended Events & Contest Wins */}
                <div className="bg-surface-elevated border-2 border-border-brutalist rounded-2xl p-6 shadow-[6px_6px_0px_var(--border-brutalist)]">
                  <h4 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" />
                    Events Attended &amp; Achievements ({memberData.eventsAttended?.length || 0})
                  </h4>

                  {memberData.eventsAttended && memberData.eventsAttended.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {memberData.eventsAttended.map((ev: any) => (
                        <div
                          key={ev._id}
                          className="p-4 bg-surface-secondary rounded-xl border border-border-default flex flex-col justify-between"
                        >
                          <div>
                            <span className="font-mono text-[10px] font-bold text-accent-primary uppercase block mb-1">
                              {ev.category || "WORKSHOP"}
                            </span>
                            <h5 className="font-bold text-sm text-text-primary leading-snug">
                              {ev.title}
                            </h5>
                          </div>
                          <div className="mt-3 pt-2 border-t border-border-default/60 text-xs font-mono text-text-tertiary flex items-center justify-between">
                            <span>{new Date(ev.date).toLocaleDateString()}</span>
                            <span>{ev.location || "Campus"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary font-mono italic text-center py-4">
                      No event attendance records on file.
                    </p>
                  )}
                </div>

                {/* Projects & Articles Snapshot */}
                {(memberData.projects?.length > 0 || memberData.blogs?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Projects */}
                    <div className="bg-surface-elevated border-2 border-border-brutalist rounded-2xl p-6 shadow-[4px_4px_0px_var(--border-brutalist)]">
                      <h4 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
                        <FolderGit2 size={16} className="text-accent-primary" />
                        Projects ({memberData.projects.length})
                      </h4>
                      <div className="space-y-2">
                        {memberData.projects.slice(0, 3).map((p: any) => (
                          <div key={p._id} className="p-3 bg-surface-secondary rounded-lg border border-border-default">
                            <h5 className="font-bold text-sm text-text-primary truncate">{p.title}</h5>
                            <span className="font-mono text-[10px] text-text-secondary uppercase">{p.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Blogs */}
                    <div className="bg-surface-elevated border-2 border-border-brutalist rounded-2xl p-6 shadow-[4px_4px_0px_var(--border-brutalist)]">
                      <h4 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-accent-primary" />
                        Articles ({memberData.blogs.length})
                      </h4>
                      <div className="space-y-2">
                        {memberData.blogs.slice(0, 3).map((b: any) => (
                          <Link
                            key={b._id}
                            href={`/blog/${b.slug}`}
                            className="block p-3 bg-surface-secondary rounded-lg border border-border-default hover:border-accent-primary transition-colors no-underline text-inherit"
                          >
                            <h5 className="font-bold text-sm text-text-primary truncate hover:text-accent-primary">{b.title}</h5>
                            <span className="font-mono text-[10px] text-text-tertiary">{b.views} views</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center">
          <div className="text-center text-text-secondary font-mono">
            <p>Loading Verification Portal…</p>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
