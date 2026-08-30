"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { CheckCircle2, AlertCircle, ShieldCheck, Mail, Award, Search } from "lucide-react";
import "@/app/login/login.css";

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
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: "520px" }}>
        <div className="login-header">
          <span className="login-badge">
            <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            Trust &amp; Verification
          </span>
          <h1>Verification Portal</h1>
          <p>Verify institutional email activation or validate authentic club certificates.</p>
        </div>

        {/* Tab switch */}
        <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-6)", padding: "4px", background: "var(--surface-secondary)", borderRadius: "var(--radius-lg)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            style={{
              flex: 1,
              padding: "var(--space-2)",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: activeTab === "email" ? "var(--surface-elevated)" : "transparent",
              color: activeTab === "email" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === "email" ? "var(--weight-semibold)" : "var(--weight-normal)",
              boxShadow: activeTab === "email" ? "var(--shadow-xs)" : "none",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "var(--text-sm)"
            }}
          >
            <Mail size={15} /> Email Verification
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("certificate")}
            style={{
              flex: 1,
              padding: "var(--space-2)",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: activeTab === "certificate" ? "var(--surface-elevated)" : "transparent",
              color: activeTab === "certificate" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: activeTab === "certificate" ? "var(--weight-semibold)" : "var(--weight-normal)",
              boxShadow: activeTab === "certificate" ? "var(--shadow-xs)" : "none",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontSize: "var(--text-sm)"
            }}
          >
            <Award size={15} /> Certificate Check
          </button>
        </div>

        {activeTab === "email" ? (
          <div>
            {emailVerified ? (
              <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-4)" }}>
                  <CheckCircle2 size={28} />
                </div>
                <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>Email Verified!</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
                  Your email address has been confirmed. Our club administrators will review and approve your membership application shortly.
                </p>
                <Button href="/login" size="md" className="login-submit-btn">
                  Go to Login
                </Button>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleCodeVerification}>
                {emailError && (
                  <div className="login-alert login-alert--error">
                    <AlertCircle size={16} />
                    <span>{emailError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="verify-email">
                    Institutional Email
                  </label>
                  <input
                    id="verify-email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@std.mec.edu.bd"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="verify-code">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="verify-code"
                    type="text"
                    required
                    maxLength={6}
                    className="form-input"
                    placeholder="e.g. 849201"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ letterSpacing: "4px", fontSize: "1.1rem", fontFamily: "var(--font-mono)" }}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="login-submit-btn"
                  disabled={emailVerifying}
                >
                  {emailVerifying ? "Verifying..." : "Verify Code"}
                </Button>
              </form>
            )}
          </div>
        ) : (
          <div>
            <form onSubmit={(e) => { e.preventDefault(); verifyCert(certificateId); }} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="cert-id">
                  Certificate ID or Verification Code
                </label>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <input
                    id="cert-id"
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. CERT-2026-XXXXX"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button type="submit" size="md" disabled={certVerifying}>
                    <Search size={16} />
                  </Button>
                </div>
              </div>
            </form>

            {certError && (
              <div className="login-alert login-alert--error" style={{ marginTop: "var(--space-4)" }}>
                <AlertCircle size={16} />
                <span>{certError}</span>
              </div>
            )}

            {certificateData && (
              <div style={{ marginTop: "var(--space-4)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", background: "var(--surface-secondary)", border: "1px solid var(--border-default)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontWeight: "bold", marginBottom: "var(--space-2)" }}>
                  <CheckCircle2 size={18} /> Official Certificate Verified
                </div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
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
    <Suspense fallback={<div className="login-page"><div className="login-card text-center"><p style={{ color: "var(--text-secondary)" }}>Loading verification portal...</p></div></div>}>
      <VerifyContent />
    </Suspense>
  );
}
