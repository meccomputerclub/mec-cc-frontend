"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  Palette,
  Camera,
  ShieldCheck,
  User,
  GraduationCap,
  Clock,
  MapPin,
  Move,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";

/* ── Social Icon SVGs ── */
const IconGitHub = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconCodeforces = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16">
    <rect x="2" y="10" width="4" height="12" rx="1" />
    <rect x="10" y="4" width="4" height="18" rx="1" />
    <rect x="18" y="7" width="4" height="15" rx="1" />
  </svg>
);

const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

function ensureSocialUrl(base: string, value: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("www.")) return "https://" + trimmed;
  const hostPart = base.replace(/^https?:\/\//, "").split("/")[0];
  if (trimmed.includes(hostPart)) return "https://" + trimmed.replace(/^\/+/, "");
  return base + trimmed.replace(/^@/, "").replace(/^\/+/, "");
}

interface ProfileHeroProps {
  user: AuthUser;
  onOpenCoverModal: () => void;
  onAvatarUploadTrigger: () => void;
  onEditProfileClick: () => void;
  uploadingCover?: boolean;
  uploadingAvatar?: boolean;
  onCoverPositionSaved?: (position: string) => Promise<void>;
  isRepositioningCover?: boolean;
  onRepositionCoverChange?: (isRepositioning: boolean) => void;
}

export function ProfileHero({
  user,
  onOpenCoverModal,
  onAvatarUploadTrigger,
  onEditProfileClick,
  uploadingCover = false,
  uploadingAvatar = false,
  onCoverPositionSaved,
  isRepositioningCover: controlledIsRepositioning,
  onRepositionCoverChange,
}: ProfileHeroProps) {
  // Parse initial X and Y percentages
  const parsePos = useCallback((posStr?: string) => {
    if (!posStr) return { x: 50, y: 50 };
    const parts = posStr.trim().split(/\s+/);
    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1] || parts[0]);
    return {
      x: Math.min(100, Math.max(0, isNaN(x) ? 50 : x)),
      y: Math.min(100, Math.max(0, isNaN(y) ? 50 : y)),
    };
  }, []);

  const [internalIsRepositioning, setInternalIsRepositioning] = useState(false);
  const isRepositioning = controlledIsRepositioning !== undefined ? controlledIsRepositioning : internalIsRepositioning;
  const setIsRepositioning = useCallback(
    (val: boolean) => {
      if (onRepositionCoverChange) {
        onRepositionCoverChange(val);
      }
      setInternalIsRepositioning(val);
    },
    [onRepositionCoverChange]
  );

  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [savingPosition, setSavingPosition] = useState(false);

  const coverContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 50, posY: 50 });

  useEffect(() => {
    const { x, y } = parsePos((user as any).coverPosition);
    setPosX(x);
    setPosY(y);
  }, [user, parsePos]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioning) return;
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX,
      posY,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isRepositioning) return;
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      posX,
      posY,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !coverContainerRef.current) return;
      e.preventDefault();
      const rect = coverContainerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      // Inverted delta for natural drag feel: pulling down reveals top, pulling up reveals bottom
      const percentDeltaX = (deltaX / rect.width) * 100;
      const percentDeltaY = (deltaY / rect.height) * 100;

      const nextX = Math.min(100, Math.max(0, dragStartRef.current.posX - percentDeltaX));
      const nextY = Math.min(100, Math.max(0, dragStartRef.current.posY - percentDeltaY));

      setPosX(Math.round(nextX));
      setPosY(Math.round(nextY));
    },
    [isDragging]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !coverContainerRef.current) return;
      const rect = coverContainerRef.current.getBoundingClientRect();
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;

      const percentDeltaX = (deltaX / rect.width) * 100;
      const percentDeltaY = (deltaY / rect.height) * 100;

      const nextX = Math.min(100, Math.max(0, dragStartRef.current.posX - percentDeltaX));
      const nextY = Math.min(100, Math.max(0, dragStartRef.current.posY - percentDeltaY));

      setPosX(Math.round(nextX));
      setPosY(Math.round(nextY));
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  // Save new cover position
  const handleSavePosition = async () => {
    const posString = `${posX}% ${posY}%`;
    setSavingPosition(true);
    try {
      await api.patch("/api/users/me", { coverPosition: posString });
      toast.success("Cover banner position saved!");
      setIsRepositioning(false);
      if (onCoverPositionSaved) {
        await onCoverPositionSaved(posString);
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to save cover position";
      toast.error(msg);
    } finally {
      setSavingPosition(false);
    }
  };

  // Cancel repositioning and revert
  const handleCancelReposition = () => {
    setIsRepositioning(false);
    const { x, y } = parsePos((user as any).coverPosition);
    setPosX(x);
    setPosY(y);
  };

  const userSocials = user.socialLinks;
  const heroSocialLinks: { href: string; label: string; icon: React.ReactNode }[] = [];

  if (userSocials?.github) {
    heroSocialLinks.push({
      href: ensureSocialUrl("https://github.com/", userSocials.github),
      label: `${user.fullName}'s GitHub`,
      icon: <IconGitHub />,
    });
  }
  if (userSocials?.linkedin) {
    heroSocialLinks.push({
      href: ensureSocialUrl("https://linkedin.com/in/", userSocials.linkedin),
      label: `${user.fullName}'s LinkedIn`,
      icon: <IconLinkedIn />,
    });
  }
  if (userSocials?.facebook) {
    heroSocialLinks.push({
      href: ensureSocialUrl("https://facebook.com/", userSocials.facebook),
      label: `${user.fullName}'s Facebook`,
      icon: <IconFacebook />,
    });
  }
  if ((userSocials as any)?.codeforces) {
    heroSocialLinks.push({
      href: ensureSocialUrl("https://codeforces.com/profile/", (userSocials as any).codeforces),
      label: `${user.fullName}'s Codeforces`,
      icon: <IconCodeforces />,
    });
  }
  if (user.email) {
    heroSocialLinks.push({
      href: `mailto:${user.email}`,
      label: `Email ${user.fullName}`,
      icon: <IconEmail />,
    });
  }

  return (
    <div className="w-full bg-surface-elevated relative">
      {/* Top Half: Cover Photo Banner */}
      <div
        ref={coverContainerRef}
        className={`w-full h-[160px] sm:h-[190px] md:h-[230px] relative bg-slate-900 overflow-hidden select-none ${
          isRepositioning ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {user.coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={user.coverUrl}
            src={user.coverUrl}
            alt="Profile Cover"
            className="w-full h-full object-cover block pointer-events-none select-none transition-[object-position] duration-75"
            style={{ objectPosition: `${posX}% ${posY}%` }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 bg-[radial-gradient(rgba(132,204,22,0.2)_1px,transparent_1px)] bg-[size:16px_16px]" />
        )}

        {/* MEC Badge */}
        <div
          className={`absolute top-3 left-3 sm:top-3.5 sm:left-4 flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] font-extrabold tracking-wider text-white bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded border border-white/20 z-10 transition-opacity ${
            isRepositioning ? "opacity-30 pointer-events-none" : "opacity-100"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-accent-primary inline-block shadow-[0_0_8px_var(--accent-primary)]" />
          <span>MEC COMPUTER CLUB // SEC CSE</span>
        </div>

        {/* ── Repositioning Mode Overlays & Controls ── */}
        {isRepositioning ? (
          <>
            {/* Center Draggable Floating Indicator */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-white/25 rounded-full text-white shadow-xl pointer-events-none z-30 animate-pulse">
              <Move size={14} className="text-accent-primary" />
              <span className="font-mono text-xs font-bold tracking-wide">
                Drag to Reposition ({posX}% {posY}%)
              </span>
            </div>

            {/* Subtle Rule-of-Thirds Alignment Guidelines */}
            <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between py-8 px-12 opacity-30">
              <div className="w-full border-t border-dashed border-white" />
              <div className="w-full border-t border-dashed border-white" />
            </div>

            {/* Bottom-right Action Buttons */}
            <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-4 flex items-center gap-2 z-30">
              <button
                type="button"
                onClick={() => {
                  setPosX(50);
                  setPosY(50);
                }}
                className="px-2.5 py-1.5 bg-surface-elevated/95 hover:bg-surface-secondary text-text-primary border border-border-default rounded-lg text-xs font-mono font-bold shadow-[2px_2px_0px_0px_var(--border-default)] cursor-pointer transition-all duration-150 hover:-translate-x-px hover:-translate-y-px"
                title="Reset position to Center (50% 50%)"
              >
                Reset
              </button>
              <button
                type="button"
                id="btn-cancel-cover-reposition"
                onClick={handleCancelReposition}
                disabled={savingPosition}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-surface-elevated/95 hover:bg-surface-secondary text-text-primary dark:text-white border-2 border-text-primary dark:border-border-default rounded-lg text-xs font-bold shadow-[2px_2px_0px_0px_var(--text-primary)] cursor-pointer transition-all duration-150 hover:-translate-x-px hover:-translate-y-px disabled:opacity-50"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                id="btn-save-cover-reposition"
                onClick={handleSavePosition}
                disabled={savingPosition}
                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-accent-primary hover:bg-accent-primary-hover text-accent-primary-text border-2 border-text-primary rounded-lg text-xs font-heading font-black shadow-[2px_2px_0px_0px_var(--text-primary)] cursor-pointer transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_var(--text-primary)] disabled:opacity-50"
              >
                <Check size={14} />
                <span>{savingPosition ? "Saving..." : "Save Position"}</span>
              </button>
            </div>
          </>
        ) : (
          /* ── Normal Mode Action Buttons ── */
          <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-4 flex items-center gap-2 z-20">
            {user.coverUrl && (
              <button
                type="button"
                id="btn-reposition-cover"
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-surface-elevated/95 border-2 border-text-primary dark:border-border-default rounded-lg shadow-[2px_2px_0px_0px_var(--text-primary)] dark:shadow-[2px_2px_0px_0px_var(--accent-primary)] font-body text-xs font-bold text-text-primary dark:text-white cursor-pointer transition-all duration-150 hover:bg-accent-primary-light dark:hover:bg-[color-mix(in_srgb,var(--accent-primary)_30%,var(--surface-primary))] dark:hover:text-white hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                onClick={() => setIsRepositioning(true)}
                title="Drag to reposition cover banner"
              >
                <Move size={14} />
                <span>Reposition</span>
              </button>
            )}

            <button
              type="button"
              id="btn-change-cover"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-surface-elevated/95 border-2 border-text-primary dark:border-border-default rounded-lg shadow-[2px_2px_0px_0px_var(--text-primary)] dark:shadow-[2px_2px_0px_0px_var(--accent-primary)] font-body text-xs font-bold text-text-primary dark:text-white cursor-pointer transition-all duration-150 hover:bg-accent-primary-light dark:hover:bg-[color-mix(in_srgb,var(--accent-primary)_30%,var(--surface-primary))] dark:hover:text-white hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onOpenCoverModal}
              disabled={uploadingCover}
              title="Select Built-in or Upload Custom Cover Photo (1200x300 recommended)"
            >
              <Camera size={14} />
              <span>{uploadingCover ? "Uploading..." : "Change Cover"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Half: Profile Identity Layout */}
      <div className="px-4 sm:px-6 pt-1 sm:pt-1.5 pb-5 flex flex-col gap-3.5 relative">
        {/* Level 1: Top Identity & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 sm:gap-4 text-center sm:text-left">
            {/* Profile Avatar (Aligned to designation line bottom) */}
            <div
              className="-mt-10 sm:-mt-12 md:-mt-14 w-24 h-24 sm:w-28 sm:h-28 md:w-[108px] md:h-[108px] rounded-xl border-[3px] border-surface-elevated shadow-[3px_3px_0px_0px_var(--text-primary)] dark:shadow-[3px_3px_0px_0px_var(--accent-primary)] relative cursor-pointer overflow-hidden bg-surface-secondary shrink-0 group"
              key={user.imageUrl || "hero-avatar"}
              onClick={onAvatarUploadTrigger}
              title="Click to change profile picture"
            >
              {user.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={user.imageUrl}
                  src={user.imageUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover block"
                  style={{ objectPosition: (user as any).imagePosition || "50% 50%" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.parentElement?.querySelector(
                      ".avatar-initial-fallback"
                    );
                    if (fallback) (fallback as HTMLElement).style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="avatar-initial-fallback w-full h-full bg-accent-primary text-accent-primary-text items-center justify-center font-heading text-2xl sm:text-3xl md:text-4xl font-black"
                style={{ display: user.imageUrl ? "none" : "flex" }}
              >
                {(user.fullName?.charAt(0) || "U").toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[11px] font-bold font-body">
                <Camera size={18} />
                <span>{uploadingAvatar ? "..." : "Change"}</span>
              </div>
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-accent-success border-2 border-surface-elevated" title="Active Member" />
            </div>

            {/* User Name (Line 1) & Designation + ID (Line 2) */}
            <div className="flex flex-col items-center sm:items-start gap-1 pb-0.5">
              {/* Line 1: Name */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
                <h1 className="font-heading text-xl sm:text-2xl md:text-[26px] font-extrabold text-text-primary m-0 leading-tight">
                  {user.fullName}
                </h1>
                <span className="text-accent-primary inline-flex" title="Verified SEC Member">
                  <ShieldCheck size={20} />
                </span>
              </div>

              {/* Line 2: Designation and ID in one line */}
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start text-xs sm:text-sm">
                <span className="font-body font-bold text-accent-text-on-surface dark:text-accent-primary-hover">
                  {user.designation ||
                    user.customRole ||
                    (user.clubRole === "executive"
                      ? "Executive Member · MEC Computer Club"
                      : user.clubRole === "advisor"
                      ? "Club Advisor · MEC Computer Club"
                      : user.clubRole === "alumni"
                      ? "Alumni Member · MEC Computer Club"
                      : "General Member · MEC Computer Club")}
                </span>
                <span className="text-text-tertiary font-bold">&bull;</span>
                <span className="font-mono text-xs font-bold text-text-secondary bg-surface-secondary px-2 py-0.5 rounded border border-border-default">
                  ID: {user.studentId || "210347"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0 pb-0.5">
            <Button variant="outline" size="sm" onClick={onEditProfileClick}>
              <User size={13} style={{ marginRight: "5px" }} /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Level 2: Bio */}
        {user.bio && (
          <p className="font-body text-xs sm:text-sm text-text-secondary leading-relaxed m-0 max-w-[800px] text-center sm:text-left">
            {user.bio}
          </p>
        )}

        {/* Level 3: Metadata Info & Social Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border-default">
          <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-text-secondary">
              <GraduationCap size={14} className="text-text-tertiary shrink-0" />
              <span>{user.department || "Computer Science & Engineering"}</span>
            </span>

            {user.session && (
              <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-text-secondary">
                <Clock size={14} className="text-text-tertiary shrink-0" />
                <span>Session {user.session}</span>
              </span>
            )}

            {user.address && (
              <span className="inline-flex items-center gap-1.5 font-body text-xs font-semibold text-text-secondary">
                <MapPin size={14} className="text-text-tertiary shrink-0" />
                <span>{user.address}</span>
              </span>
            )}
          </div>

          {heroSocialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap" role="group" aria-label="Social links">
              {heroSocialLinks.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary transition-all duration-150 hover:bg-accent-primary-light dark:hover:bg-[color-mix(in_srgb,var(--accent-primary)_25%,var(--surface-primary))] dark:hover:text-white hover:border-text-primary hover:-translate-x-px hover:-translate-y-px hover:shadow-[2px_2px_0px_0px_var(--accent-primary)]"
                  aria-label={label}
                  title={label}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  onClick={(e) => e.stopPropagation()}
                >
                  {icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
