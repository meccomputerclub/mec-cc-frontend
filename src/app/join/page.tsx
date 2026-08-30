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
import "./join.css";

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
    <section className="section join-gate-page">
      <div className="container">
        {/* Header */}
        <div className="join-gate-header">
          <span className="kicker">
            <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
            MEC Computer Club Clearance
          </span>
          <h1>Join the Club</h1>
          <p>
            Membership is invite-only. Enter your exclusive invitation access key to unlock the registration portal.
          </p>
        </div>

        {/* Gate Card */}
        <div className="join-gate-card-wrap">
          <div className="join-gate-card">
            <div className="join-gate-icon-badge">
              <KeyRound size={28} />
            </div>

            <div className="join-gate-status-pill">
              <Lock size={13} /> INVITATION ACCESS KEY REQUIRED
            </div>

            <h2 className="join-gate-title">Enter Invitation Code</h2>
            <p className="join-gate-subtitle">
              Please input the 6-character access key provided to you by the MEC Computer Club committee or received in your email.
            </p>

            {error && (
              <div className="join-gate-error" role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {successInfo && (
              <div className="join-gate-success" role="status">
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>
                  Key verified for <strong>{successInfo.role.toUpperCase()}</strong>! Redirecting to registration...
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="join-gate-form">
              <div className="join-gate-input-wrapper">
                <input
                  type="text"
                  id="invitation-code"
                  name="invitationCode"
                  className="join-gate-code-input"
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
                className="join-gate-submit-btn"
                style={{ width: "100%" }}
              >
                {loading ? (
                  "Verifying Access Key..."
                ) : (
                  <>
                    Unlock Registration Form <ArrowRight size={18} style={{ marginLeft: 8 }} />
                  </>
                )}
              </Button>
            </form>

            <div className="join-gate-login-prompt">
              <span>Already a verified member?</span>{" "}
              <Link href="/login" className="join-gate-login-link">
                Sign in to your dashboard <ArrowRight size={13} style={{ display: "inline", verticalAlign: "middle" }} />
              </Link>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="join-info-grid">
          <div className="join-info-card">
            <div className="join-info-card__icon">
              <HelpCircle size={22} />
            </div>
            <h3>How to get an invitation code?</h3>
            <p>
              Invitations are issued by the executive committee and faculty advisors to enrolled students during seasonal recruitment drives and workshops.
            </p>
          </div>

          <div className="join-info-card">
            <div className="join-info-card__icon">
              <Users size={22} />
            </div>
            <h3>Multi-Track Membership</h3>
            <p>
              Your invitation clearance key automatically unlocks your respective track: <strong>General Member</strong> (Students), <strong>Alumni Network</strong>, or <strong>Faculty Advisor</strong>.
            </p>
          </div>

          <div className="join-info-card">
            <div className="join-info-card__icon">
              <Building2 size={22} />
            </div>
            <h3>MEC Computer Club</h3>
            <p>
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
    <Suspense fallback={<div className="container" style={{ padding: "80px 0", textAlign: "center" }}>Loading invitation clearance...</div>}>
      <JoinGateContent />
    </Suspense>
  );
}
