"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { formatDeptSession } from "@/lib/formatters";
import { toSocialUrl } from "@/app/register/page";

/* ── Social auto-link builders matching Join Form ── */
const toGithubUrl = (u: string) => toSocialUrl("github", u);
const toCfUrl = (u: string) => toSocialUrl("codeforces", u);
const toCodechefUrl = (u: string) => toSocialUrl("codechef", u);
const toLiUrl = (u: string) => toSocialUrl("linkedin", u);
const toFbUrl = (u: string) => toSocialUrl("facebook", u);

/* ── Social Icon SVGs matching Join Form ── */
const IconGH = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);
const IconLI = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const IconFB = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const IconDiscord = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);
const IconCF = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="10" width="4" height="12" rx="1"/><rect x="10" y="4" width="4" height="18" rx="1"/><rect x="18" y="7" width="4" height="15" rx="1"/></svg>
);
const IconCC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.2574.0039c-.37.0101-.7353.041-1.1003.095C9.6164.153 9.0766.4236 8.482.694c-.757.3244-1.5147.6486-2.2176.7027-1.1896.3785-1.568.919-1.8925 1.3516 0 .054-.054.1079-.054.1079-.4325.865-.4873 1.73-.325 2.5952.1621.5407.3786 1.0282.5408 1.5148.3785 1.0274.7578 2.0007.92 3.1362.1622.3244.3235.7571.4316 1.1897.2704.8651.542 1.8383 1.353 2.5952l.0057-.0028c.0175.0183.0301.0387.0482.0568.0072-.0036.0141-.0063.0213-.0099l-.0213-.5849c.6489-.9733 1.5673-1.6221 2.865-1.8925.5195-.1093 1.081-.1497 1.6625-.1278a8.7733 8.7733 0 0 1 1.7988.2357c1.4599.3785 2.595 1.1358 2.6492 1.7846.0273.3549.0398.6952.0326 1.0364-.001.064-.0046.1285-.007.193l.1362.0682c.075-.0375.1424-.107.2059-.1902.0008-.001.002-.002.0028-.0028.0018-.0023.0039-.0061.0057-.0085.0396-.0536.0747-.1236.1107-.1931.0188-.0377.0372-.0866.0554-.1292.2048-.4622.362-1.1536.538-1.9635.0541-.2703.1092-.4864.1633-.7027.4326-.9733 1.0266-1.8382 1.6213-2.6492.9733-1.3518 1.8928-2.5962 1.7846-4.0561-1.784-3.4608-4.2718-4.0017-5.5695-4.272-.2163-.0541-.3233-.0539-.4856-.108-1.3382-.2433-2.4945-.3953-3.6046-.3648zm5.0428 14.3788a9.8602 9.8602 0 0 0-.0326-.9824c-.0541-.703-1.1892-1.46-2.7032-1.8386-.588-.1336-1.1764-.2142-1.7448-.2356-.539-.0137-1.0657.0248-1.5546.1277-1.2436.2704-2.2162.9193-2.811 1.8925l.0511 1.431c.6672-.3558 1.7326-.8747 3.139-.9994.0662-.0059.1368-.0059.2044-.0099.1177-.013.2667-.044.4444-.044 1.6075 0 3.2682.5336 4.8767 1.6483.039-.2744.0611-.549.071-.8234l.044.0227c.0028-.0622.0143-.1268.0156-.1888z"/></svg>
);

/* ── Live Card Preview matching Join Form ── */
interface CardPreviewProps {
  name: string;
  batch: string;
  photoUrl: string | null;
  initial: string;
  github: string;
  linkedin: string;
  facebook: string;
  discord: string;
  codeforces: string;
  codechef: string;
  email: string;
}


function CardPreview({
  name,
  batch,
  photoUrl,
  initial,
  github,
  linkedin,
  facebook,
  discord,
  codeforces,
  codechef,
  email,
}: CardPreviewProps) {
  const socials = [
    email && { icon: <IconMail />, label: "Email", url: `mailto:${email}` },
    github && { icon: <IconGH />, label: "GitHub", url: toGithubUrl(github) },
    linkedin && { icon: <IconLI />, label: "LinkedIn", url: toLiUrl(linkedin) },
    discord && { icon: <IconDiscord />, label: `Discord: @${discord}`, url: `https://discord.com` },
    facebook && { icon: <IconFB />, label: "Facebook", url: toFbUrl(facebook) },
    codeforces && { icon: <IconCF />, label: "Codeforces", url: toCfUrl(codeforces) },
    codechef && { icon: <IconCC />, label: "CodeChef", url: toCodechefUrl(codechef) },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; url: string }[];

  return (
    <div className="bg-surface-primary border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] overflow-hidden flex flex-col">
      <div className="w-full aspect-square bg-surface-secondary relative overflow-hidden border-b border-border-default">
        {photoUrl ? (
          <div className="w-full h-full overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt="preview"
              draggable={false}
              className="w-full h-full object-cover absolute top-0 left-0"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-text-primary bg-surface-secondary">{initial || "?"}</div>
        )}
      </div>

      <div className="p-4 flex flex-col items-center text-center">
        <p className="font-bold text-lg text-text-primary mb-0.5">{name || "Your Name"}</p>
        <p className="text-xs font-mono text-text-secondary">{batch || "Your Batch"}</p>
        <p className="mt-2 text-[11px] font-mono font-bold uppercase py-0.5 px-2 bg-surface-secondary border border-border-default rounded text-accent-primary-hover">Club Member</p>
      </div>

      {socials.length > 0 && (
        <div className="flex border-t border-border-default bg-surface-secondary divide-x divide-border-default">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
              title={s.label}
            >
              {s.icon}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MemberApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const applicantId = params.id as string;

  const [applicant, setApplicant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const isExecutive =
    currentUser?.role === "admin" || currentUser?.role === "moderator";

  const fetchApplication = useCallback(async () => {
    if (!applicantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/dashboard/application/${applicantId}`);
      setApplicant(res.data || res);
    } catch (err: any) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err?.message || "Failed to load member application";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [applicantId]);

  useEffect(() => {
    if (!authLoading && isExecutive) {
      fetchApplication();
    }
  }, [authLoading, isExecutive, fetchApplication]);

  const handleApprove = async () => {
    if (!applicant) return;
    setProcessing(true);
    try {
      await api.patch(`/api/dashboard/application-status/${applicant._id}`, {
        status: "approved",
      });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(`🎉 ${applicant.fullName}'s membership approved!`);
      fetchApplication();
    } catch (err: any) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err?.message || "Failed to approve applicant";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!applicant) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setProcessing(true);
    try {
      await api.patch(`/api/dashboard/application-status/${applicant._id}`, {
        status: "rejected",
        reason: rejectionReason,
      });
      toast.success(`Application rejected for ${applicant.fullName}.`);
      setShowRejectModal(false);
      fetchApplication();
    } catch (err: any) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err?.message || "Failed to reject applicant";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="jc-page" style={{ textAlign: "center", paddingTop: "120px" }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: "0 auto 16px", color: "var(--accent-primary)" }} />
        <h1>Retrieving Application...</h1>
        <p>Loading candidate registration form and live identity card.</p>
      </div>
    );
  }

  if (!currentUser || !isExecutive) {
    return (
      <div className="jc-page" style={{ textAlign: "center", paddingTop: "100px" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "var(--space-6)", background: "var(--surface-elevated)", border: "2px solid var(--border-brutalist)", borderRadius: "var(--radius-lg)", boxShadow: "6px 6px 0 var(--border-brutalist)" }}>
          <ShieldAlert size={48} style={{ color: "var(--accent-error)", margin: "0 auto 16px" }} />
          <h2>403 • Executive Access Required</h2>
          <p style={{ color: "var(--text-secondary)", margin: "8px 0 24px" }}>
            Only Club Administrators and Moderators are authorized to inspect member applications.
          </p>
          <Button href="/dashboard">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="jc-page" style={{ textAlign: "center", paddingTop: "100px" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "var(--space-6)", background: "var(--surface-elevated)", border: "2px solid var(--border-brutalist)", borderRadius: "var(--radius-lg)", boxShadow: "6px 6px 0 var(--border-brutalist)" }}>
          <AlertCircle size={48} style={{ color: "var(--accent-warning)", margin: "0 auto 16px" }} />
          <h2>Application Not Found</h2>
          <p style={{ color: "var(--text-secondary)", margin: "8px 0 24px" }}>
            {error || "The requested application does not exist or has been removed."}
          </p>
          <Button href="/dashboard/members">← Back to Member Approvals</Button>
        </div>
      </div>
    );
  }

  const socialLinks = applicant.socialLinks || {};
  const status = applicant.applicationStatus || "pending";
  const initial = (applicant.fullName?.trim().charAt(0) || "?").toUpperCase();
  const appliedDate = applicant.createdAt
    ? new Date(applicant.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <div className="jc-page">
      <div className="container">
        {/* ── Header ── */}
        <div className="jc-header">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-2)" }}>
            <span className="kicker" style={{ margin: 0 }}>Executive Member Review</span>
          </div>
          <h1>Join Application Dossier</h1>
          <p>Reviewing {applicant.fullName}&apos;s submission exactly as filled in the Join Form.</p>
        </div>

        {/* ── Split Layout: Exact same as Join Form ── */}
        <div className="jc-layout">
          {/* ════ LEFT COLUMN: THE JOIN FORM (AS FILLED) ════ */}
          <div className="jc-form">
            {/* Section 01: Identity & Security */}
            <div className="jc-form__section">
              <div className="jc-form__section-header">
                <h2 className="jc-form__section-title">
                  <span className="jc-form__section-num">01</span> Identity
                </h2>
              </div>

              {/* Photo Display */}
              <div className="jc-form__photo-row">
                <div
                  className="jc-photo-upload-btn"
                  style={{ cursor: "default", borderColor: "var(--border-brutalist)", borderStyle: "solid" }}
                >
                  {applicant.imageUrl ? (
                    <Image
                      src={applicant.imageUrl}
                      alt={applicant.fullName}
                      fill
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  ) : (
                    <div className="jc-photo-upload-btn__inner">
                      <span style={{ fontSize: "var(--text-xl)", fontWeight: 800 }}>{initial}</span>
                    </div>
                  )}
                </div>
                <div className="jc-photo-upload-hint">
                  <p style={{ fontWeight: 700, color: "var(--text-primary)" }}>Uploaded Profile Picture</p>
                  <p>1:1 Aspect Ratio • Verified across MEC Network</p>
                </div>
              </div>

              <div className="jc-form__row--2">
                <div className="jc-form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={applicant.fullName || ""}
                    readOnly
                    style={{ background: "var(--surface-secondary)", cursor: "default" }}
                  />
                </div>

                <div className="jc-form-group">
                  <label htmlFor="email">
                    Institutional Email
                    {applicant.email && (
                      <a
                        href={`mailto:${applicant.email}`}
                        title="Send email"
                        style={{ marginLeft: "6px", color: "var(--accent-primary)", display: "inline-flex", verticalAlign: "middle" }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={applicant.email || ""}
                    readOnly
                    style={{ background: "var(--surface-secondary)", cursor: "default" }}
                  />
                </div>
              </div>
            </div>

            {/* Section 02: Academic Credentials */}
            <div className="jc-form__section">
              <div className="jc-form__section-header">
                <h2 className="jc-form__section-title">
                  <span className="jc-form__section-num">02</span> Academic Credentials
                </h2>
              </div>

              <div className="jc-form__row--2">
                <div className="jc-form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    value={applicant.studentId || ""}
                    readOnly
                    style={{ background: "var(--surface-secondary)", cursor: "default", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-primary)" }}
                  />
                </div>

                <div className="jc-form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    value={applicant.department || ""}
                    readOnly
                    style={{ background: "var(--surface-secondary)", cursor: "default" }}
                  />
                </div>
              </div>

              <div className="jc-form__row--2">
                <div className="jc-form-group">
                  <label htmlFor="session">Session</label>
                  <input
                    id="session"
                    name="session"
                    type="text"
                    value={applicant.session ? `${applicant.session} (${applicant.batch || "Batch"})` : ""}
                    readOnly
                    style={{ background: "var(--surface-secondary)", cursor: "default" }}
                  />
                </div>

                <div className="jc-form-group">
                  <label htmlFor="contactNumber">
                    Contact Phone
                    {applicant.contactNumber && (
                      <a
                        href={`tel:${applicant.contactNumber}`}
                        title="Call phone"
                        style={{ marginLeft: "6px", color: "var(--accent-primary)", display: "inline-flex", verticalAlign: "middle" }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={applicant.contactNumber || "N/A"}
                    readOnly
                    style={{ background: "var(--surface-secondary)", cursor: "default", fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>

              <div className="jc-form-group">
                <label htmlFor="bio">Bio &amp; Interests</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={applicant.bio || "No bio provided."}
                  readOnly
                  style={{ background: "var(--surface-secondary)", cursor: "default", resize: "none" }}
                />
              </div>
            </div>

            {/* Section 03: Developer Handles & Socials */}
            <div className="jc-form__section">
              <div className="jc-form__section-header">
                <h2 className="jc-form__section-title">
                  <span className="jc-form__section-num">03</span> Developer &amp; Social Handles
                </h2>
              </div>

              {/* 1. LinkedIn */}
              <div className="jc-form-group">
                <label htmlFor="linkedin">
                  <IconLI /> LinkedIn
                  {socialLinks.linkedin && (
                    <a
                      href={toLiUrl(socialLinks.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open LinkedIn"
                      style={{ marginLeft: "6px", color: "var(--accent-primary)", display: "inline-flex", verticalAlign: "middle" }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </label>
                <input
                  id="linkedin"
                  name="linkedin"
                  type="text"
                  value={socialLinks.linkedin || ""}
                  readOnly
                  placeholder="Not provided"
                  style={{ background: "var(--surface-secondary)", cursor: "default" }}
                />
              </div>

              {/* 2. GitHub */}
              <div className="jc-form-group">
                <label htmlFor="github">
                  <IconGH /> GitHub
                  {socialLinks.github && (
                    <a
                      href={toGithubUrl(socialLinks.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open GitHub"
                      style={{ marginLeft: "6px", color: "var(--accent-primary)", display: "inline-flex", verticalAlign: "middle" }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </label>
                <div className="jc-prefix-input">
                  <span className="jc-prefix-input__base">github.com/</span>
                  <input
                    id="github"
                    name="github"
                    type="text"
                    value={socialLinks.github || ""}
                    readOnly
                    placeholder="—"
                  />
                </div>
              </div>

              {/* 3. Codeforces & CodeChef */}
              <div className="jc-form__row--2">
                <div className="jc-form-group">
                  <label htmlFor="codeforces">
                    <IconCF /> Codeforces
                    {socialLinks.codeforces && (
                      <a
                        href={toCfUrl(socialLinks.codeforces)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Codeforces"
                        style={{ marginLeft: "6px", color: "var(--accent-primary)", display: "inline-flex", verticalAlign: "middle" }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </label>
                  <div className="jc-prefix-input">
                    <span className="jc-prefix-input__base">codeforces.com/</span>
                    <input
                      id="codeforces"
                      name="codeforces"
                      type="text"
                      value={socialLinks.codeforces || ""}
                      readOnly
                      placeholder="—"
                    />
                  </div>
                </div>

                <div className="jc-form-group">
                  <label htmlFor="codechef">
                    <IconCC /> CodeChef
                    {socialLinks.codechef && (
                      <a
                        href={toCodechefUrl(socialLinks.codechef)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open CodeChef"
                        style={{ marginLeft: "6px", color: "var(--accent-primary)", display: "inline-flex", verticalAlign: "middle" }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </label>
                  <div className="jc-prefix-input">
                    <span className="jc-prefix-input__base">codechef.com/</span>
                    <input
                      id="codechef"
                      name="codechef"
                      type="text"
                      value={socialLinks.codechef || ""}
                      readOnly
                      placeholder="—"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Discord */}
              <div className="jc-form-group">
                <label htmlFor="discord">
                  <IconDiscord /> Discord
                </label>
                <div className="jc-prefix-input">
                  <span className="jc-prefix-input__base">@</span>
                  <input
                    id="discord"
                    name="discord"
                    type="text"
                    value={socialLinks.discord || ""}
                    readOnly
                    placeholder="—"
                  />
                </div>
              </div>

              {/* 5. Facebook */}
              <div className="jc-form-group">
                <label htmlFor="facebook">
                  <IconFB /> Facebook
                  {socialLinks.facebook && (
                    <a
                      href={toFbUrl(socialLinks.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Facebook"
                      style={{ marginLeft: "6px", color: "var(--accent-primary)", display: "inline-flex", verticalAlign: "middle" }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </label>
                <input
                  id="facebook"
                  name="facebook"
                  type="text"
                  value={socialLinks.facebook || ""}
                  readOnly
                  placeholder="Not provided"
                  style={{ background: "var(--surface-secondary)", cursor: "default" }}
                />
              </div>
            </div>

            {/* ════ ACTION BUTTONS AT BOTTOM (REPLACING SUBMIT BUTTON) ════ */}
            <div className="jc-form__actions" style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
              {status === "pending" ? (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    disabled={processing}
                    onClick={handleApprove}
                  >
                    ✓ Approve Application
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={processing}
                    onClick={() => setShowRejectModal(true)}
                  >
                    ✕ Reject Application
                  </Button>
                </>
              ) : (
                <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", background: "var(--surface-elevated)", border: "1.5px solid var(--border-brutalist)", borderRadius: "var(--radius-md)", padding: "12px 16px", boxShadow: "3px 3px 0 var(--border-brutalist)" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      Current Status:
                    </span>{" "}
                    <span className={`db-tag db-tag--${status}`} style={{ marginLeft: "6px" }}>
                      {status.toUpperCase()}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (status === "approved") setShowRejectModal(true);
                      else handleApprove();
                    }}
                  >
                    {status === "approved" ? "Change to Reject" : "Change to Approve"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ════ RIGHT COLUMN: LIVE CARD PREVIEW + SUBMISSION INFO ════ */}
          <div className="jc-preview-panel">
            <div className="jc-preview-panel__sticky">
              <div className="jc-preview-label">
                <span className="jc-preview-label__dot" />
                Live Card Preview
              </div>

              <div style={{ width: "100%", maxWidth: "280px", margin: "0 auto" }}>
                <CardPreview
                  name={applicant.fullName}
                  batch={formatDeptSession(applicant.department, applicant.session) || "CSE (22-23)"}
                  photoUrl={applicant.imageUrl || null}
                  initial={initial}
                  github={socialLinks.github || ""}
                  linkedin={socialLinks.linkedin || ""}
                  facebook={socialLinks.facebook || ""}
                  discord={socialLinks.discord || ""}
                  codeforces={socialLinks.codeforces || ""}
                  codechef={socialLinks.codechef || ""}
                  email={applicant.email || ""}
                />
              </div>

              {/* Extra Needed Submission Info Under Profile Card */}
              <div
                className="jc-form__section"
                style={{
                  marginTop: "var(--space-5)",
                  padding: "var(--space-4)",
                  gap: "10px",
                  fontSize: "var(--text-xs)",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-default)", paddingBottom: "6px" }}>
                  Submission Summary
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Status</span>
                  <span className={`db-tag db-tag--${status}`}>
                    {status === "approved" ? (
                      <CheckCircle2 size={11} />
                    ) : status === "rejected" ? (
                      <XCircle size={11} />
                    ) : (
                      <Clock size={11} />
                    )}
                    {status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Submitted</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{appliedDate}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Email OTP</span>
                  <span style={{ color: applicant.isVerified ? "var(--accent-success)" : "var(--accent-warning)", fontWeight: 600 }}>
                    {applicant.isVerified ? "✓ Verified" : "Pending"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-tertiary)" }}>Student ID</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-primary)" }}>
                    {applicant.studentId || "N/A"}
                  </span>
                </div>

                {applicant.rejectionReason && (
                  <div style={{ marginTop: "6px", padding: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--accent-error)", borderRadius: "var(--radius-sm)", color: "var(--accent-error)" }}>
                    <strong>Rejection Reason:</strong> {applicant.rejectionReason}
                  </div>
                )}

                <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: "8px", marginTop: "4px" }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/members")}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <ArrowLeft size={13} style={{ marginRight: "4px" }} /> Back to Approvals
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rejection Reason Modal ── */}
      {showRejectModal && (
        <div className="db-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h2>Reject Member Application</h2>
              <button
                type="button"
                className="db-modal-close-btn"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
              Please specify the reason for rejecting <strong>{applicant.fullName}</strong>&apos;s application. An automated notification will be dispatched to the student.
            </p>

            {/* Quick Reason Presets */}
            <div style={{ marginBottom: "var(--space-3)" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
                QUICK PRESET REASONS:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {[
                  "Offline registration fee not matched at desk",
                  "Student ID does not match MEC enrollment records",
                  "Profile photo does not meet clarity/aspect requirements",
                  "Duplicate registration submitted",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    className="db-tag db-tag--role"
                    style={{ cursor: "pointer", textTransform: "none", fontSize: "11px" }}
                    onClick={() => setRejectionReason(reason)}
                  >
                    + {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="db-form-group">
              <label
                htmlFor="rejection-textarea"
                style={{ fontSize: "var(--text-xs)", fontWeight: 700, textTransform: "uppercase" }}
              >
                Detailed Reason Note
              </label>
              <textarea
                id="rejection-textarea"
                rows={3}
                required
                className="reg-textarea"
                placeholder="Type or select a reason above..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ width: "100%", marginTop: "6px" }}
              />
            </div>

            <div className="db-form-actions">
              <Button
                variant="outline"
                size="sm"
                disabled={processing}
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={processing}
                onClick={handleReject}
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
