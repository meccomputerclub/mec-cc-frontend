"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Mail,
  Fingerprint,
} from "lucide-react";

interface SecurityTabProps {
  user: AuthUser;
}

export function SecurityTab({ user }: SecurityTabProps) {
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.post("/api/users/change-password", {
        id: user.id || user._id,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to change password.";
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Section 01: Account Security Overview */}
      <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
        <div className="mb-4 pb-2 border-b-[1.5px] border-border-default">
          <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">01</span> Security Status &amp; Credentials
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">Institutional Account Verification</label>
            <div className={`flex items-center gap-2 py-2.5 px-3.5 rounded-md font-mono text-xs sm:text-sm font-bold border shadow-[2px_2px_0px_0px_currentColor] ${
              user.isVerified
                ? "bg-emerald-500/10 border-accent-success text-accent-success"
                : "bg-amber-500/10 border-accent-warning text-accent-warning"
            }`}>
              {user.isVerified ? <CheckCircle2 size={16} className="shrink-0" /> : <ShieldAlert size={16} className="shrink-0" />}
              <span className="truncate">{user.isVerified ? "Verified Institutional Email" : "Email Pending Verification"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">Primary Login Email</label>
            <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden">
              <span className="flex items-center px-2.5 bg-surface-secondary border-r border-border-default font-mono text-xs font-bold text-text-secondary h-10 shrink-0"><Mail size={13} /></span>
              <input
                type="text"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2 font-body text-xs sm:text-sm font-medium text-text-primary bg-transparent border-none shadow-none outline-none opacity-80 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">Security Role Clearance</label>
            <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden">
              <span className="flex items-center px-2.5 bg-surface-secondary border-r border-border-default font-mono text-xs font-bold text-text-secondary h-10 shrink-0"><ShieldCheck size={13} /></span>
              <input
                type="text"
                value={`ROLE: ${(user.role || "member").toUpperCase()}`}
                disabled
                className="w-full px-3.5 py-2 font-body text-xs sm:text-sm font-medium text-text-primary bg-transparent border-none shadow-none outline-none opacity-80 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">Member Node ID</label>
            <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden">
              <span className="flex items-center px-2.5 bg-surface-secondary border-r border-border-default font-mono text-xs font-bold text-text-secondary h-10 shrink-0"><Fingerprint size={13} /></span>
              <input
                type="text"
                value={user.studentId || "210347"}
                disabled
                className="w-full px-3.5 py-2 font-body text-xs sm:text-sm font-medium text-text-primary bg-transparent border-none shadow-none outline-none opacity-80 cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 02: Change Authentication Password */}
      <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
        <div className="mb-4 pb-2 border-b-[1.5px] border-border-default">
          <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">02</span> Change Account Password
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="flex flex-col max-w-xl gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="old-pass" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
              Current Password <span className="text-accent-error">*</span>
            </label>
            <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden transition-all duration-150 focus-within:border-accent-primary focus-within:shadow-[3px_3px_0px_0px_var(--accent-primary)]">
              <input
                id="old-pass"
                type={showOldPassword ? "text" : "password"}
                required
                placeholder="Enter your current password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 font-body text-sm text-text-primary border-none shadow-none bg-transparent outline-none focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="bg-transparent border-none px-3 cursor-pointer text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center"
                aria-label={showOldPassword ? "Hide current password" : "Show current password"}
              >
                {showOldPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-pass" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                New Password <span className="text-accent-error">*</span>
              </label>
              <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden transition-all duration-150 focus-within:border-accent-primary focus-within:shadow-[3px_3px_0px_0px_var(--accent-primary)]">
                <input
                  id="new-pass"
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 font-body text-sm text-text-primary border-none shadow-none bg-transparent outline-none focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="bg-transparent border-none px-3 cursor-pointer text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="conf-pass" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                Confirm Password <span className="text-accent-error">*</span>
              </label>
              <input
                id="conf-pass"
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="Re-enter new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
              />
            </div>
          </div>

          <div className="mt-2">
            <Button type="submit" size="md" disabled={changingPassword} id="security-save-btn">
              <KeyRound size={14} style={{ marginRight: "6px" }} />
              {changingPassword ? "Updating Password..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
