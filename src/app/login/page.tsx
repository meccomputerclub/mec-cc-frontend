"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import "./login.css";

interface ExtendedLoginState {
  type: "error" | "pending" | "unverified" | "rejected";
  message: string;
  email?: string;
  rejectionReason?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusAlert, setStatusAlert] = useState<ExtendedLoginState | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusAlert(null);

    if (!identifier || !password) {
      setStatusAlert({
        type: "error",
        message: "Please enter your Student ID or Email, and Password.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        toast.success("Welcome back to MEC CC!");
        router.push(redirectPath);
      } else {
        // Evaluate specific error messages from backend
        const msg = res.message || "";
        if (msg.toLowerCase().includes("not approved") || msg.toLowerCase().includes("pending")) {
          setStatusAlert({
            type: "pending",
            message: "Your application is currently under review by club administrators.",
            email: identifier.trim(),
          });
        } else if (msg.toLowerCase().includes("not verified") || msg.toLowerCase().includes("verify")) {
          setStatusAlert({
            type: "unverified",
            message: "Your institutional email address has not been verified yet.",
            email: identifier.trim(),
          });
        } else if (msg.toLowerCase().includes("rejected")) {
          setStatusAlert({
            type: "rejected",
            message: "Your membership application was not approved.",
          });
        } else {
          setStatusAlert({
            type: "error",
            message: msg || "Invalid institutional credentials.",
          });
        }
      }
    } catch (err: any) {
      setStatusAlert({
        type: "error",
        message: err?.message || "An unexpected error occurred during sign in.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Hello, World.</h1>
          <p>Initialize your session to access member resources and track your progress.</p>
        </div>

        <div className="login-form">
          {/* Custom Status Alerts */}
          {statusAlert && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              {statusAlert.type === "pending" && (
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-4)",
                    color: "var(--text-primary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-warning)", fontWeight: 700, marginBottom: "4px" }}>
                    <Clock size={18} /> Application Pending Admin Approval
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
                    {statusAlert.message} Once club executives cross-check offline billing and activate your node, you will receive an approval email.
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link
                      href={`/contact?subject=membership&reason=approval-status&email=${encodeURIComponent(statusAlert.email || "")}`}
                      style={{ fontSize: "11px", color: "var(--accent-primary)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      Inquire with Admins <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}

              {statusAlert.type === "unverified" && (
                <div
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-4)",
                    color: "var(--text-primary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6", fontWeight: 700, marginBottom: "4px" }}>
                    <Mail size={18} /> Email Verification Required
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
                    {statusAlert.message} Please enter the 6-digit code or click the verification link sent to your inbox.
                  </p>
                  <Button
                    href={`/verify-email?email=${encodeURIComponent(statusAlert.email || "")}`}
                    size="sm"
                    variant="outline"
                  >
                    Verify Email Now
                  </Button>
                </div>
              )}

              {statusAlert.type === "rejected" && (
                <div className="login-alert login-alert--error">
                  <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong>Application Rejected</strong>
                    <div style={{ fontSize: "var(--text-xs)", marginTop: "2px" }}>
                      Please contact club executives at Room 402 or via the contact page for further clarification.
                    </div>
                  </div>
                </div>
              )}

              {statusAlert.type === "error" && (
                <div style={{ color: "var(--accent-primary)", padding: "10px", background: "rgba(255,0,0,0.1)", borderRadius: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <div>{statusAlert.message}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form className="login-form-inner" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-identifier">Student ID or Email</label>
              <input
                id="login-identifier"
                type="text"
                required
                placeholder="e.g. 210347 or name@mec.edu.bd"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={`password-toggle-icon ${showPassword ? 'active' : ''}`}
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  onTouchStart={() => setShowPassword(true)}
                  onTouchEnd={() => setShowPassword(false)}
                  title="Press and hold to reveal password"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" name="remember" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link href="/forgot-password" className="login-form__forgot">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              className="login-submit-btn"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <div className="spinner-wrapper">
                  <span className="spinner"></span>
                  Authenticating...
                </div>
              ) : (
                "SIGN IN"
              )}
            </Button>
            
            <div className="login-form__footer">
              <span className="login-form__signup">
                Not a member yet? <Link href="/register">Apply to join</Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-page">
          <div className="login-card text-center">
            <p style={{ color: "var(--text-secondary)" }}>Loading terminal...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
