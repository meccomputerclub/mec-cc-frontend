"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import "@/app/login/login.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await api.post("/api/users/password/request", { email: email.trim() });
      setSent(true);
      toast.success("Password reset instructions sent!");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to send reset link.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-badge">Account Recovery</span>
          <h1>Reset Password</h1>
          <p>Enter your institutional email address and we&apos;ll send you a password reset link.</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--space-4)" }}>
              <CheckCircle2 size={28} />
            </div>
            <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-2)" }}>Check Your Inbox</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-6)" }}>
              We have sent password recovery instructions to <strong>{email}</strong>.
            </p>
            <Button href="/login" size="md" className="login-submit-btn">
              Return to Login
            </Button>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-alert login-alert--error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">
                Institutional Email
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                className="form-input"
                placeholder="name@std.mec.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>

            <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
              <Link href="/login" style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
