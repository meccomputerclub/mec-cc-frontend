"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing or invalid. Please request a new link.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/api/users/password/reset", {
        email: email.trim(),
        token: token.trim(),
        newPassword,
      });
      toast.success("Password reset successfully! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to reset password.";
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
          <span className="kicker">Security</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Set New Password</h1>
          <p className="text-sm text-text-secondary">Create a strong new password for your account.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-accent-error/30 rounded-lg p-3 text-sm text-accent-error mb-4">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          {!emailParam && (
            <div className="w-full flex flex-col gap-1.5">
              <label className="block font-medium text-sm text-text-primary" htmlFor="reset-email">
                Institutional Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                className="w-full px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-surface-secondary"
                placeholder="name@std.mec.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="w-full flex flex-col gap-1.5">
            <label className="block font-medium text-sm text-text-primary" htmlFor="new-password">New Password</label>
            <div className="relative flex items-center w-full">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-3.5 py-2.5 pr-11 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-surface-secondary"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 p-1 text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center select-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            <label className="block font-medium text-sm text-text-primary" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-surface-secondary"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-1"
            disabled={loading}
          >
            {loading ? "Updating Password..." : "Update Password"}
          </Button>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm font-medium text-accent-primary-hover hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center"><div className="text-center text-text-secondary"><p>Loading reset form...</p></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
