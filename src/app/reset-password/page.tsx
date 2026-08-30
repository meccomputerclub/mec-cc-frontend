"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import "@/app/login/login.css";

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
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-badge">Security</span>
          <h1>Set New Password</h1>
          <p>Create a strong new password for your account.</p>
        </div>

        {error && (
          <div className="login-alert login-alert--error" style={{ marginBottom: "var(--space-4)" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {!emailParam && (
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">
                Institutional Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                className="form-input"
                placeholder="name@std.mec.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div className="form-input-wrap">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                className="form-input"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              className="form-input"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? "Updating Password..." : "Update Password"}
          </Button>

          <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
            <Link href="/login" className="forgot-link">
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
    <Suspense fallback={<div className="login-page"><div className="login-card text-center"><p style={{ color: "var(--text-secondary)" }}>Loading reset form...</p></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
