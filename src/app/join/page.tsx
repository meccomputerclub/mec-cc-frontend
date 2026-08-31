"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { api, ApiError } from "@/lib/api";
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Users,
  Building2,
  Lock,
} from "lucide-react";

function JoinGateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ role: string; email?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setError("Please enter your invitation code.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/api/invite/verify", { code: cleanCode });
      if (res.success) {
        const detectedRole = res.data?.role || "member";
        setSuccessInfo({ role: detectedRole, email: res.data?.email });
        toast.success(`Access code verified! Unlocking registration for ${detectedRole}...`);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#84CC16", "#3b82f6", "#a855f7", "#ec4899"],
        });

        setTimeout(() => {
          router.push(`/register?role=${encodeURIComponent(detectedRole)}&code=${encodeURIComponent(cleanCode)}`);
        }, 500);
      } else {
        setError(res.message || "Invalid or expired invitation code.");
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Invalid or expired invitation code.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-16 min-h-[85vh] flex flex-col justify-center">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="kicker">
            <Sparkles size={14} className="inline align-middle mr-1" />
            MEC Computer Club Clearance
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight my-2 bg-gradient-to-br from-text-primary via-text-primary to-accent-primary bg-clip-text text-transparent">
            Join the Club
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-[620px] mx-auto leading-relaxed">
            Membership is invite-only. Enter your exclusive invitation access key to unlock the registration portal.
          </p>
        </div>

        {/* Gate Card */}
        <div className="max-w-[580px] mx-auto mb-12 w-full">
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_var(--border-brutalist)] dark:shadow-[6px_6px_0px_var(--accent-primary)] flex flex-col items-center text-center relative overflow-hidden transition-all duration-200">
            <div className="w-[68px] h-[68px] rounded-xl bg-surface-secondary border-2 border-border-brutalist dark:border-border-default flex items-center justify-center text-accent-primary shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--accent-primary)] mb-4">
              <KeyRound size={28} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold tracking-wider bg-red-500/10 text-accent-error border border-red-500/25 rounded-full mb-4">
              <Lock size={13} /> INVITATION ACCESS KEY REQUIRED
            </div>

            <h2 className="text-2xl font-extrabold text-text-primary mb-2 tracking-tight">
              Enter Invitation Code
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-[440px] mb-5">
              Please input the 6-character access key provided to you by the MEC Computer Club committee or received in your email.
            </p>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-accent-error rounded-md p-3 sm:px-4 text-sm text-accent-error w-full text-left mb-4" role="alert">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successInfo && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-accent-success rounded-md p-3 sm:px-4 text-sm text-accent-success w-full text-left mb-4" role="status">
                <ShieldCheck size={18} className="shrink-0" />
                <span>
                  Key verified for <strong>{successInfo.role.toUpperCase()}</strong>! Redirecting to registration...
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="w-full">
                <input
                  type="text"
                  id="invitation-code"
                  name="invitationCode"
                  className="w-full py-4 px-4 border-2 border-border-brutalist dark:border-border-default rounded-md bg-surface-primary font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xl font-extrabold tracking-[0.25em] text-center uppercase text-text-primary shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--accent-primary)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[5px_5px_0px_var(--accent-primary)] focus:-translate-x-px focus:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="e.g. 358921"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    if (error) setError(null);
                  }}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={30}
                  disabled={loading || Boolean(successInfo)}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading || !code.trim() || Boolean(successInfo)}
                className="w-full"
              >
                {loading ? (
                  "Verifying Access Key..."
                ) : (
                  <>
                    Unlock Registration Form <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 text-xs text-text-secondary">
              <span>Already a verified member?</span>{" "}
              <Link href="/login" className="text-accent-text-on-surface dark:text-accent-primary-hover font-bold hover:underline ml-1">
                Sign in to your dashboard <ArrowRight size={13} className="inline align-middle ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1050px] mx-auto w-full">
          <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl p-5 shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--accent-primary)]">
            <div className="w-11 h-11 rounded-lg bg-surface-secondary border border-border-default flex items-center justify-center text-accent-primary mb-1">
              <HelpCircle size={22} />
            </div>
            <h3 className="text-base font-bold text-text-primary m-0">How to get an invitation code?</h3>
            <p className="text-xs text-text-secondary leading-relaxed m-0">
              Invitations are issued by the executive committee and faculty advisors to enrolled students during seasonal recruitment drives and workshops.
            </p>
          </div>

          <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl p-5 shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--accent-primary)]">
            <div className="w-11 h-11 rounded-lg bg-surface-secondary border border-border-default flex items-center justify-center text-accent-primary mb-1">
              <Users size={22} />
            </div>
            <h3 className="text-base font-bold text-text-primary m-0">Multi-Track Membership</h3>
            <p className="text-xs text-text-secondary leading-relaxed m-0">
              Your invitation clearance key automatically unlocks your respective track: <strong>General Member</strong> (Students), <strong>Alumni Network</strong>, or <strong>Faculty Advisor</strong>.
            </p>
          </div>

          <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl p-5 shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--accent-primary)]">
            <div className="w-11 h-11 rounded-lg bg-surface-secondary border border-border-default flex items-center justify-center text-accent-primary mb-1">
              <Building2 size={22} />
            </div>
            <h3 className="text-base font-bold text-text-primary m-0">MEC Computer Club</h3>
            <p className="text-xs text-text-secondary leading-relaxed m-0">
              The premier student organization at Mymensingh Engineering College empowering programmers, developers, and tech innovators.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-20 text-center text-text-secondary">Loading invitation clearance...</div>}>
      <JoinGateContent />
    </Suspense>
  );
}
