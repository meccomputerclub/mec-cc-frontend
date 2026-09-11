"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  Clock,
} from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
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
      const res: any = await api.post("/api/users/verify/token", {
        email: targetEmail.trim(),
        token: targetToken.trim(),
      });
      setVerified(true);
      if (res?.isApproved || res?.applicationStatus === "approved") {
        setIsApproved(true);
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(
        res?.isApproved || res?.applicationStatus === "approved"
          ? "Email verified! Your account is active and ready to sign in."
          : "Email verified successfully! Admins notified."
      );
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
      const res: any = await api.post("/api/users/verify/code", {
        email: email.trim(),
        code: code.trim(),
      });
      setVerified(true);
      if (res?.isApproved || res?.applicationStatus === "approved") {
        setIsApproved(true);
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(
        res?.isApproved || res?.applicationStatus === "approved"
          ? "Email verified! Your account is active and ready to sign in."
          : "Email verified successfully! Admins notified."
      );
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Invalid or expired verification code.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen py-10 md:py-14 px-4 bg-surface-secondary">
      <div className="text-center max-w-xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="kicker" style={{ margin: 0 }}>Security &amp; Activation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary my-2">Email Verification</h1>
        <p className="text-sm sm:text-base text-text-secondary">Confirm your institutional email to activate your club node application.</p>
      </div>

      <div className="max-w-[640px] mx-auto flex flex-col gap-5">
        {verifying ? (
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl p-8 shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] text-center py-12">
            <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-1">Verifying Credentials...</h3>
            <p className="text-text-secondary text-sm">
              Connecting to terminal database...
            </p>
          </div>
        ) : verified ? (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl p-8 shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] text-center py-10">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-accent-success flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Email Address Confirmed!</h2>
              <p className="text-text-secondary text-sm mt-1">
                Your email <strong>{email}</strong> has been successfully verified.
              </p>
            </div>

            <div className="bg-surface-elevated border border-border-default rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-text-primary mb-1 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent-primary text-surface-primary inline-flex items-center justify-center text-xs">✓</span> Email Verified
              </h2>
              <p className="text-text-secondary text-sm m-0">
                Your institutional identity has been cryptographically confirmed.
              </p>
            </div>

            {isApproved ? (
              <div className="bg-surface-elevated border-2 border-emerald-500 rounded-xl p-5 shadow-sm space-y-2">
                <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-xs">✓</span>
                  Account Activated &amp; Ready
                </h2>
                <p className="text-text-secondary text-sm m-0">
                  Your account has been confirmed and activated without requiring manual review. You can now sign in directly to access all club member features and your dashboard.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-surface-elevated border border-border-default rounded-xl p-5 shadow-sm">
                  <h2 className="text-base font-bold text-text-primary mb-1 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-surface-secondary text-text-primary inline-flex items-center justify-center text-xs">
                      <Clock size={12} />
                    </span>
                    Pending Executive Committee Approval
                  </h2>
                  <p className="text-text-secondary text-sm m-0">
                    Our club administrators have been notified via email. They will cross-verify your offline joining form &amp; billing to activate your account.
                  </p>
                </div>

                <div className="bg-surface-secondary border border-border-default rounded-xl p-4 flex gap-3">
                  <Mail size={24} className="text-accent-warning shrink-0 mt-0.5" />
                  <div>
                    <h4 className="m-0 mb-1 text-sm font-bold text-text-primary">Admins Notified</h4>
                    <p className="m-0 text-sm text-text-secondary">
                      An automated notification was dispatched to club administrators. Once approved, you will be able to log into your member dashboard.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="mt-4 flex gap-3 justify-center">
              <Button href="/login" size="lg">
                Go to Sign In
              </Button>
              <Button href="/" variant="outline" size="lg">
                Return Home
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl p-6 sm:p-8 shadow-[5px_5px_0px_var(--border-brutalist)] dark:shadow-[5px_5px_0px_var(--accent-primary)]">
            <h2 className="text-xl font-bold text-text-primary mb-4 pb-2 border-b border-border-default">
              Enter Verification Code
            </h2>
            {errorMessage && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-accent-error/30 rounded-lg p-3 text-sm text-accent-error mb-4">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="flex flex-col gap-4 w-full" onSubmit={handleCodeVerification}>
              <div className="flex flex-col gap-1.5 w-full">
                <label className="block text-sm font-medium text-text-primary" htmlFor="email">
                  Institutional Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@student.mec.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5"
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="block text-sm font-medium text-text-primary" htmlFor="code">
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
                  className="w-full px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-lg text-center font-mono [font-feature-settings:'liga'_0,'calt'_0] tracking-[0.2em] text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5"
                />
              </div>

              <div className="mt-2">
                <Button type="submit" size="lg" disabled={verifying} className="w-full">
                  {verifying ? "Verifying Code..." : "Verify Email Code"}
                </Button>
              </div>

              <div className="mt-4 text-center">
                <Link href="/login" className="text-text-secondary text-sm hover:text-text-primary underline">
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
        <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
          <div className="text-center text-text-secondary">
            <p>Loading verification terminal...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
