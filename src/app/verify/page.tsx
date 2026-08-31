"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { CheckCircle2, AlertCircle, ShieldCheck, Mail, Award, Search } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";
  const certParam = searchParams.get("certificate") || searchParams.get("cert") || "";

  const [activeTab, setActiveTab] = useState<"email" | "certificate">(certParam ? "certificate" : "email");
  
  // Email verification state
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Certificate verification state
  const [certificateId, setCertificateId] = useState(certParam);
  const [certificateData, setCertificateData] = useState<any | null>(null);
  const [certVerifying, setCertVerifying] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  // Auto-verify email token if present
  useEffect(() => {
    if (token && emailParam) {
      handleTokenVerification(emailParam, token);
    }
  }, [token, emailParam]);

  // Auto-verify certificate if present in URL
  useEffect(() => {
    if (certParam) {
      verifyCert(certParam);
    }
  }, [certParam]);

  const handleTokenVerification = async (targetEmail: string, targetToken: string) => {
    setEmailVerifying(true);
    setEmailError(null);
    try {
      await api.post("/api/users/verify/token", { email: targetEmail, token: targetToken });
      setEmailVerified(true);
      toast.success("Email verified successfully!");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to verify email token.";
      setEmailError(msg);
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;

    setEmailVerifying(true);
    setEmailError(null);
    try {
      await api.post("/api/users/verify/code", { email: email.trim(), code: code.trim() });
      setEmailVerified(true);
      toast.success("Email verified successfully!");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Invalid or expired verification code.";
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setEmailVerifying(false);
    }
  };

  const verifyCert = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setCertVerifying(true);
    setCertError(null);
    setCertificateData(null);

    try {
      const res = await api.get(`/api/certificates/verify/${idToVerify.trim()}`);
      if (res && (res.data || res.certificate)) {
        setCertificateData(res.data || res.certificate);
        toast.success("Certificate verified authentic!");
      } else {
        setCertificateData(res);
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Certificate could not be verified.";
      setCertError(msg);
      toast.error(msg);
    } finally {
      setCertVerifying(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="max-w-[540px] w-full bg-surface-elevated p-6 sm:p-8 rounded-xl border border-border-brutalist dark:border-border-default shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--accent-primary)] transition-all duration-200">
        <div className="text-center mb-6">
          <span className="kicker">
            <ShieldCheck size={14} className="inline align-middle mr-1" />
            Trust &amp; Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Verification Portal</h1>
          <p className="text-sm text-text-secondary">Verify institutional email activation or validate authentic club certificates.</p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-6 p-1 bg-surface-secondary rounded-lg border border-border-default">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2 px-3 rounded-md border-none flex items-center justify-center gap-1.5 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "email"
                ? "bg-surface-elevated text-text-primary shadow-sm"
                : "bg-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <Mail size={15} /> Email Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("certificate")}
            className={`flex-1 py-2 px-3 rounded-md border-none flex items-center justify-center gap-1.5 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "certificate"
                ? "bg-surface-elevated text-text-primary shadow-sm"
                : "bg-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <Award size={15} /> Certificate Check
          </button>
        </div>

        {activeTab === "email" ? (
          <div>
            {emailVerified ? (
              <div className="text-center py-4">
                <div className="w-[50px] h-[50px] rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-2">Email Verified!</h2>
                <p className="text-text-secondary text-sm mb-6">
                  Your email address has been confirmed. Our club administrators will review and approve your membership application shortly.
                </p>
                <Button href="/login" size="md" className="w-full">
                  Go to Login
                </Button>
              </div>
            ) : (
              <form className="flex flex-col gap-4 w-full" onSubmit={handleCodeVerification}>
                {emailError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-accent-error/30 rounded-lg p-3 text-sm text-accent-error">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="w-full flex flex-col gap-1.5">
                  <label className="block font-medium text-sm text-text-primary" htmlFor="verify-email">
                    Institutional Email
                  </label>
                  <input
                    id="verify-email"
                    type="email"
                    required
                    className="w-full px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-surface-secondary"
                    placeholder="name@std.mec.edu.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="w-full flex flex-col gap-1.5">
                  <label className="block font-medium text-sm text-text-primary" htmlFor="verify-code">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="verify-code"
                    type="text"
                    required
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-lg text-center font-mono [font-feature-settings:'liga'_0,'calt'_0] tracking-[0.2em] text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5"
                    placeholder="e.g. 849201"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-1"
                  disabled={emailVerifying}
                >
                  {emailVerifying ? "Verifying..." : "Verify Code"}
                </Button>
              </form>
            )}
          </div>
        ) : (
          <div>
            <form onSubmit={(e) => { e.preventDefault(); verifyCert(certificateId); }} className="flex flex-col gap-4 w-full">
              <div className="w-full flex flex-col gap-1.5">
                <label className="block font-medium text-sm text-text-primary" htmlFor="cert-id">
                  Certificate ID or Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="cert-id"
                    type="text"
                    required
                    className="flex-1 px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5"
                    placeholder="e.g. CERT-2026-XXXXX"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                  />
                  <Button type="submit" size="md" disabled={certVerifying}>
                    <Search size={16} />
                  </Button>
                </div>
              </div>
            </form>

            {certError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-accent-error/30 rounded-lg p-3 text-sm text-accent-error mt-4">
                <AlertCircle size={16} className="shrink-0" />
                <span>{certError}</span>
              </div>
            )}

            {certificateData && (
              <div className="mt-4 p-4 rounded-xl bg-surface-secondary border border-border-default">
                <div className="flex items-center gap-2 text-emerald-500 font-bold mb-2 text-sm">
                  <CheckCircle2 size={18} /> Official Certificate Verified
                </div>
                <div className="text-sm text-text-primary flex flex-col gap-1">
                  <p><strong>Title:</strong> {certificateData.title || certificateData.eventName || "Certificate of Excellence"}</p>
                  {certificateData.recipientName && <p><strong>Issued to:</strong> {certificateData.recipientName}</p>}
                  {certificateData.issueDate && <p><strong>Issue Date:</strong> {new Date(certificateData.issueDate).toLocaleDateString()}</p>}
                  {certificateData.credentialId && <p><strong>Credential ID:</strong> {certificateData.credentialId}</p>}
                </div>
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
    <Suspense fallback={<div className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center"><div className="text-center text-text-secondary"><p>Loading verification portal...</p></div></div>}>
      <VerifyContent />
    </Suspense>
  );
}
