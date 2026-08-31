"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

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
    <div className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="max-w-[480px] w-full bg-surface-elevated p-6 sm:p-8 rounded-xl border border-border-brutalist dark:border-border-default shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--accent-primary)] transition-all duration-200">
        <div className="text-center mb-6">
          <span className="kicker">Account Recovery</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Reset Password</h1>
          <p className="text-sm text-text-secondary">Enter your institutional email address and we&apos;ll send you a password reset link.</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-[50px] h-[50px] rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Check Your Inbox</h2>
            <p className="text-text-secondary text-sm mb-6">
              We have sent password recovery instructions to <strong>{email}</strong>.
            </p>
            <Button href="/login" size="md" className="w-full">
              Return to Login
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-accent-error/30 rounded-lg p-3 text-sm text-accent-error">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="w-full flex flex-col gap-1.5">
              <label className="block font-medium text-sm text-text-primary" htmlFor="forgot-email">
                Institutional Email
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                className="w-full px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-surface-secondary"
                placeholder="name@std.mec.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-1"
              disabled={loading}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-text-secondary text-sm hover:text-text-primary inline-flex items-center gap-1.5 transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
