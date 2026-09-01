"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

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
    <div className="min-h-[calc(100vh-var(--nav-height))] flex items-stretch py-8 px-4 sm:px-6">
      <div className="flex flex-col justify-center items-center max-w-[540px] mx-auto w-full">
        <div className="mb-4 text-center w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-1">
            Hello, World.
          </h1>
          <p className="text-text-secondary text-base sm:text-lg">
            Initialize your session to access member resources and track your progress.
          </p>
        </div>

        <div className="bg-surface-elevated p-6 sm:p-8 rounded-xl border border-border-brutalist dark:border-border-default shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--accent-primary)] flex flex-col gap-4 w-full transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
          {/* Custom Status Alerts */}
          {statusAlert && (
            <div className="mb-2">
              {statusAlert.type === "pending" && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-text-primary">
                  <div className="flex items-center gap-2 text-accent-warning font-bold mb-1 text-sm sm:text-base">
                    <Clock size={18} /> Application Pending Admin Approval
                  </div>
                  <p className="text-xs text-text-secondary mb-2.5 leading-relaxed">
                    {statusAlert.message} Once club executives cross-check offline billing and activate your node, you will receive an approval email.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/contact?subject=membership&reason=approval-status&email=${encodeURIComponent(statusAlert.email || "")}`}
                      className="text-[11px] text-accent-primary hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      Inquire with Admins <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}

              {statusAlert.type === "unverified" && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-text-primary">
                  <div className="flex items-center gap-2 text-blue-500 font-bold mb-1 text-sm sm:text-base">
                    <Mail size={18} /> Email Verification Required
                  </div>
                  <p className="text-xs text-text-secondary mb-2.5 leading-relaxed">
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
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-accent-error text-sm">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Application Rejected</strong>
                    <div className="text-xs mt-0.5 text-text-secondary">
                      Please contact club executives at Room 402 or via the contact page for further clarification.
                    </div>
                  </div>
                </div>
              )}

              {statusAlert.type === "error" && (
                <div className="text-accent-error p-3 bg-red-500/10 border border-accent-error/30 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <div>{statusAlert.message}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="login-identifier" className="block font-medium text-sm text-text-primary">
                Student ID or Email
              </label>
              <input
                id="login-identifier"
                type="text"
                required
                placeholder="e.g. 210347 or name@mec.edu.bd"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                disabled={loading}
                className="w-full px-3.5 py-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-surface-secondary"
              />
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label htmlFor="login-password" className="block font-medium text-sm text-text-primary">
                Password
              </label>
              <div className="relative flex items-center w-full">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 pr-11 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-accent-primary focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-surface-secondary"
                />
                <button
                  type="button"
                  className={`absolute right-3 p-1 text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center select-none touch-manipulation ${showPassword ? 'text-accent-primary' : ''}`}
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

            <div className="flex justify-between items-center mt-1 mb-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary select-none">
                <input
                  type="checkbox"
                  name="remember"
                  className="w-4 h-4 rounded border-border-brutalist dark:border-border-default text-accent-primary focus:ring-accent-primary cursor-pointer accent-[var(--accent-primary)]"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-accent-primary-hover hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              className="w-full mt-1"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-text-primary/20 border-t-text-primary rounded-full animate-spin"></span>
                  Authenticating...
                </div>
              ) : (
                "SIGN IN"
              )}
            </Button>

            <div className="mt-2 flex flex-col gap-4 text-center">
              <span className="text-sm text-text-secondary">
                Not a member yet? <Link href="/register" className="text-text-primary font-bold hover:text-accent-primary-hover hover:underline ml-1">Apply to join</Link>
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
        <div className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary">Loading terminal...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
