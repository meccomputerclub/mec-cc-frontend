"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Mail,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import "@/app/login/login.css";
import "@/app/register/register.css";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-verify token if both email and token are in URL query params
  useEffect(() => {
    if (token && emailParam && !verified) {
      handleTokenVerification(emailParam, token);
    }
  }, [token, emailParam]);

  const handleTokenVerification = async (targetEmail: string, targetToken: string) => {
    setVerifying(true);
    setErrorMessage(null);
    try {
      await api.post("/api/users/verify/token", {
        email: targetEmail.trim(),
        token: targetToken.trim(),
      });
      setVerified(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success("Email verified successfully! Admins notified.");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Invalid or expired email verification link.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !code.trim()) return;

    setVerifying(true);
    setErrorMessage(null);
    try {
      await api.post("/api/users/verify/code", {
        email: email.trim(),
        code: code.trim(),
      });
      setVerified(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success("Email verified successfully! Admins notified.");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Invalid or expired verification code.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="jc-page">
      <div className="jc-header">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-2)" }}>
          <span className="kicker" style={{ margin: 0 }}>Security &amp; Activation</span>
        </div>
        <h1>Email Verification</h1>
        <p>Confirm your institutional email to activate your club node application.</p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {verifying ? (
          <div className="jc-form__section" style={{ textAlign: "center", padding: "var(--space-6) 0" }}>
            <div className="loading-spinner" style={{ margin: "0 auto var(--space-4)" }}></div>
            <h3>Verifying Credentials...</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              Connecting to terminal database...
            </p>
          </div>
        ) : verified ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="jc-form__section" style={{ textAlign: "center", padding: "var(--space-6) 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "var(--accent-success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-3)",
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>Email Address Confirmed!</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginTop: "4px" }}>
                Your email <strong>{email}</strong> has been successfully verified.
              </p>
            </div>

            <div className="jc-form__section">
              <div className="jc-form__section-header">
                <h2 className="jc-form__section-title">
                  <span className="jc-form__section-num">✓</span> Email Verified
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                Your institutional identity has been cryptographically confirmed.
              </p>
            </div>

            <div className="jc-form__section">
              <div className="jc-form__section-header">
                <h2 className="jc-form__section-title">
                  <span className="jc-form__section-num"><Clock size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }} /></span> Pending Executive Committee Approval
                </h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 0 }}>
                Our club administrators have been notified via email. They will cross-verify your offline joining form &amp; billing to activate your account.
              </p>
            </div>

            <div style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
              <Mail size={24} style={{ color: "var(--accent-warning)", flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: 'var(--text-sm)' }}>Admins Notified</h4>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  An automated notification was dispatched to club administrators. Once approved, you will be able to log into your member dashboard.
                </p>
              </div>
            </div>

            <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
              <Button href="/login" size="lg">
                Go to Sign In
              </Button>
              <Button href="/" variant="outline" size="lg">
                Return Home
              </Button>
            </div>
          </div>
        ) : (
          <div className="jc-form__section" style={{ boxShadow: '5px 5px 0 var(--border-brutalist)' }}>
            <div className="jc-form__section-header">
              <h2 className="jc-form__section-title">
                Enter Verification Code
              </h2>
            </div>
            {errorMessage && (
              <div className="jc-error-msg" style={{ marginBottom: "var(--space-4)" }}>
                <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="jc-form" onSubmit={handleCodeVerification}>
              <div className="jc-form-group">
                <label htmlFor="email">
                  Institutional Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@student.mec.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="jc-form-group">
                <label htmlFor="code">
                  6-Digit Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ letterSpacing: "0.2em", fontFamily: "var(--font-mono)", textAlign: "center", fontSize: "var(--text-lg)" }}
                />
              </div>

              <div className="jc-form__actions" style={{ marginTop: "var(--space-2)" }}>
                <Button type="submit" size="lg" disabled={verifying} style={{ width: '100%' }}>
                  {verifying ? "Verifying Code..." : "Verify Email Code"}
                </Button>
              </div>

              <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
                <Link href="/login" style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", textDecoration: "underline" }}>
                  Already verified? Sign In
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="reg-page">
          <div className="container text-center">
            <p style={{ color: "var(--text-secondary)" }}>Loading verification terminal...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
