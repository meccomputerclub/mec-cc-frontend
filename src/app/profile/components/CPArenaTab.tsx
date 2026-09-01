"use client";

import { useState, useEffect } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  ExternalLink,
  Flame,
  Code2,
  Edit3,
  Copy,
} from "lucide-react";
import { leaderboard, contests as staticContests, cpResources } from "@/data/cp";
import toast from "react-hot-toast";

interface CPArenaTabProps {
  user: AuthUser;
  onEditProfile: () => void;
}

interface CFUserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  contribution?: number;
  friendOfCount?: number;
  avatar?: string;
  titlePhoto?: string;
}

/* Helper to get official Codeforces rank colors */
function getCFRankColor(rank?: string): string {
  if (!rank) return "var(--text-secondary)";
  const r = rank.toLowerCase();
  if (r.includes("legendary") || r.includes("grandmaster")) return "#ef4444"; // Red
  if (r.includes("master")) return "#f97316"; // Orange
  if (r.includes("candidate master")) return "#a855f7"; // Violet/Purple
  if (r.includes("expert")) return "#3b82f6"; // Blue
  if (r.includes("specialist")) return "#06b6d4"; // Cyan
  if (r.includes("pupil")) return "#22c55e"; // Green
  return "#9ca3af"; // Gray (Newbie)
}

/* Clean handle cleaner */
function extractHandle(urlOrHandle?: string, platform: string = ""): string {
  if (!urlOrHandle) return "";
  let clean = urlOrHandle.trim();
  if (platform === "codeforces") {
    clean = clean.replace(/^https?:\/\/(www\.)?codeforces\.com\/profile\//i, "");
  } else if (platform === "codechef") {
    clean = clean.replace(/^https?:\/\/(www\.)?codechef\.com\/users\//i, "");
  } else if (platform === "github") {
    clean = clean.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
  }
  return clean.replace(/^@/, "").replace(/\/$/, "");
}

export function CPArenaTab({ user, onEditProfile }: CPArenaTabProps) {
  const userSocials = user.socialLinks || {};
  const cfHandle = extractHandle((userSocials as any)?.codeforces, "codeforces");
  const ccHandle = extractHandle((userSocials as any)?.codechef, "codechef");
  const ghHandle = extractHandle(userSocials?.github, "github");
  const discordHandle = userSocials?.discord || "";

  const [cfData, setCfData] = useState<CFUserInfo | null>(null);
  const [loadingCf, setLoadingCf] = useState(false);
  const [, setCfError] = useState<string | null>(null);

  // Find club leaderboard match
  const clubStanding = leaderboard.find(
    (entry) =>
      (cfHandle && entry.handle?.toLowerCase() === cfHandle.toLowerCase()) ||
      (user.fullName && entry.name?.toLowerCase() === user.fullName.toLowerCase())
  );

  // Fetch Live Codeforces Data
  useEffect(() => {
    if (!cfHandle) return;

    let isMounted = true;
    const fetchCF = async () => {
      setLoadingCf(true);
      setCfError(null);
      try {
        const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(cfHandle)}`);
        const json = await res.json();
        if (json.status === "OK" && json.result?.length > 0 && isMounted) {
          setCfData(json.result[0]);
        } else if (isMounted) {
          setCfError("Handle not found on Codeforces");
        }
      } catch {
        if (isMounted) {
          setCfError("Could not connect to Codeforces API");
        }
      } finally {
        if (isMounted) setLoadingCf(false);
      }
    };

    fetchCF();
    return () => {
      isMounted = false;
    };
  }, [cfHandle]);

  const copyToClipboard = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top CP Wall Hero Panel */}
      <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-md bg-accent-primary text-black flex items-center justify-center font-black border-[1.5px] border-black shrink-0">
              <Flame size={22} />
            </div>
            <div>
              <h2 className="m-0 text-lg sm:text-xl font-extrabold text-text-primary">CP Arena &amp; Solvers Wall</h2>
              <p className="m-0 mt-0.5 text-xs text-text-secondary">
                Live Online Judge statistics, club rankings, and algorithmic milestones.
              </p>
            </div>
          </div>

          <Button size="sm" variant="outline" onClick={onEditProfile}>
            <Edit3 size={13} style={{ marginRight: "5px" }} /> Update Handles
          </Button>
        </div>

        {/* Key Metrics Ribbon (Responsive: 2x2 on mobile, 4x1 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
          {/* CF Rating Stat */}
          <div className="p-3 sm:px-4 sm:py-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex items-center gap-2.5 sm:gap-3 shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)]">
            <div className="text-xl sm:text-2xl shrink-0">🎯</div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase text-text-tertiary tracking-wider truncate">
                CF Rating
              </div>
              <div
                className="text-base sm:text-lg font-extrabold font-mono truncate"
                style={{ color: getCFRankColor(cfData?.rank) }}
              >
                {loadingCf ? "Syncing..." : cfData?.rating || (cfHandle ? "Active" : "Unlinked")}
              </div>
            </div>
          </div>

          {/* CF Rank Stat */}
          <div className="p-3 sm:px-4 sm:py-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex items-center gap-2.5 sm:gap-3 shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)]">
            <div className="text-xl sm:text-2xl shrink-0">⚡</div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase text-text-tertiary tracking-wider truncate">
                Rank Title
              </div>
              <div
                className="text-sm sm:text-base font-extrabold capitalize truncate"
                style={{ color: getCFRankColor(cfData?.rank) }}
              >
                {cfData?.rank || (cfHandle ? "Contestant" : "Not Set")}
              </div>
            </div>
          </div>

          {/* Club Leaderboard Standing */}
          <div className="p-3 sm:px-4 sm:py-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex items-center gap-2.5 sm:gap-3 shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)]">
            <div className="text-xl sm:text-2xl shrink-0">🏆</div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase text-text-tertiary tracking-wider truncate">
                Club Standing
              </div>
              <div className="text-sm sm:text-base md:text-lg font-extrabold font-mono text-text-primary dark:text-white truncate">
                {clubStanding ? `Rank #${clubStanding.rank}` : "Active Solver"}
              </div>
            </div>
          </div>

          {/* Solved Problems Count */}
          <div className="p-3 sm:px-4 sm:py-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex items-center gap-2.5 sm:gap-3 shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)]">
            <div className="text-xl sm:text-2xl shrink-0">💡</div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase text-text-tertiary tracking-wider truncate">
                Solved Count
              </div>
              <div className="text-sm sm:text-base md:text-lg font-extrabold font-mono text-text-primary dark:text-white truncate">
                {clubStanding?.solved ? `${clubStanding.solved}+ AC` : "Active"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Online Judge Profiles & Contest Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Judge Cards (Codeforces, CodeChef, GitHub, Discord) */}
        <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
            <div>
              <h3 className="m-0 text-base font-extrabold text-text-primary">Connected Judge Profiles</h3>
              <p className="m-0 mt-0.5 text-xs text-text-secondary">
                Direct links and live stats from competitive platforms.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Codeforces Judge Card */}
            <div className="p-3.5 sm:px-4 sm:py-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex justify-between items-center flex-wrap gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-gray-800 text-white flex items-center justify-center font-black font-mono border-[1.5px] border-black shrink-0 text-xs">
                  CF
                </div>
                <div>
                  <div className="font-extrabold text-sm text-text-primary">Codeforces</div>
                  <div className="text-xs text-text-secondary font-mono">
                    {cfHandle ? `@${cfHandle}` : "Not Connected"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cfHandle ? (
                  <>
                    {cfData?.rating && (
                      <span
                        className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-sm bg-surface-primary border-[1.5px] border-border-brutalist dark:border-border-default"
                        style={{ color: getCFRankColor(cfData.rank) }}
                      >
                        {cfData.rating} ({cfData.rank || "rated"})
                      </span>
                    )}
                    <a
                      href={`https://codeforces.com/profile/${cfHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary transition-all duration-150 hover:bg-accent-primary-light dark:hover:bg-[color-mix(in_srgb,var(--accent-primary)_25%,var(--surface-primary))] dark:hover:text-white hover:border-text-primary hover:-translate-x-px hover:-translate-y-px hover:shadow-[2px_2px_0px_0px_var(--accent-primary)]"
                      title="Open Codeforces Profile"
                      aria-label="Open Codeforces Profile"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={onEditProfile}>
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* CodeChef Judge Card */}
            <div className="p-3.5 sm:px-4 sm:py-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex justify-between items-center flex-wrap gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#5b4636] text-white flex items-center justify-center font-black font-mono border-[1.5px] border-black shrink-0 text-xs">
                  CC
                </div>
                <div>
                  <div className="font-extrabold text-sm text-text-primary">CodeChef</div>
                  <div className="text-xs text-text-secondary font-mono">
                    {ccHandle ? `@${ccHandle}` : "Not Connected"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {ccHandle ? (
                  <>
                    <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-sm bg-surface-primary border-[1.5px] border-border-brutalist dark:border-border-default text-text-primary">
                      ⭐ Division Active
                    </span>
                    <a
                      href={`https://www.codechef.com/users/${ccHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary transition-all duration-150 hover:bg-accent-primary-light dark:hover:bg-[color-mix(in_srgb,var(--accent-primary)_25%,var(--surface-primary))] dark:hover:text-white hover:border-text-primary hover:-translate-x-px hover:-translate-y-px hover:shadow-[2px_2px_0px_0px_var(--accent-primary)]"
                      title="Open CodeChef Profile"
                      aria-label="Open CodeChef Profile"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={onEditProfile}>
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* GitHub Solutions Repo */}
            <div className="p-3.5 sm:px-4 sm:py-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex justify-between items-center flex-wrap gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-black text-white flex items-center justify-center border-[1.5px] border-black shrink-0">
                  <Code2 size={18} />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-text-primary">Algorithm Solutions Repository</div>
                  <div className="text-xs text-text-secondary font-mono">
                    {ghHandle ? `github.com/${ghHandle}` : "Open Source Code"}
                  </div>
                </div>
              </div>

              {ghHandle ? (
                <a
                  href={`https://github.com/${ghHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary transition-all duration-150 hover:bg-accent-primary-light dark:hover:bg-[color-mix(in_srgb,var(--accent-primary)_25%,var(--surface-primary))] dark:hover:text-white hover:border-text-primary hover:-translate-x-px hover:-translate-y-px hover:shadow-[2px_2px_0px_0px_var(--accent-primary)]"
                  title="View GitHub Repositories"
                  aria-label="View GitHub Repositories"
                >
                  <ExternalLink size={14} />
                </a>
              ) : (
                <Button size="sm" variant="outline" onClick={onEditProfile}>
                  Connect
                </Button>
              )}
            </div>

            {/* Discord Handle */}
            {discordHandle && (
              <div className="p-3 sm:px-4 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">💬</span>
                  <div className="text-xs font-bold text-text-primary">
                    <span>Discord CP Team:</span>{" "}
                    <code className="font-mono text-xs text-accent-primary font-bold">
                      {discordHandle}
                    </code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(discordHandle, "Discord handle")}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-sm border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary transition-all duration-150 hover:bg-accent-primary-light dark:hover:bg-[color-mix(in_srgb,var(--accent-primary)_25%,var(--surface-primary))] dark:hover:text-white hover:border-text-primary p-1 cursor-pointer"
                  title="Copy Discord Tag"
                  aria-label="Copy Discord Tag"
                >
                  <Copy size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Contest Radar */}
        <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
            <div>
              <h3 className="m-0 text-base font-extrabold text-text-primary">Contest Radar</h3>
              <p className="m-0 mt-0.5 text-xs text-text-secondary">
                Upcoming official rounds and university contests.
              </p>
            </div>
            <Button size="sm" variant="outline" href="/cp-hub">
              Full Calendar <ExternalLink size={12} style={{ marginLeft: "4px" }} />
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {staticContests.slice(0, 3).map((contest) => (
              <div
                key={contest.id}
                className="p-3 sm:px-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex justify-between items-center gap-2.5"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 bg-surface-primary border-[1.5px] border-border-brutalist dark:border-border-default rounded-sm uppercase text-text-primary">
                      {contest.platform}
                    </span>
                    <span className="text-[11px] text-text-tertiary font-mono">
                      {contest.date}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-text-primary">
                    {contest.name}
                  </div>
                </div>

                <Button size="sm" variant="ghost" href="/cp-hub">
                  Participate
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curated Algorithm Practice & Roadmaps */}
      <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
          <div>
            <h3 className="m-0 text-base font-extrabold text-text-primary">MEC CC Algorithmic Roadmaps &amp; Problem Sets</h3>
            <p className="m-0 mt-0.5 text-xs text-text-secondary">
              Curated tutorials and topic-wise practice sets prepared by club CP mentors.
            </p>
          </div>
          <Button size="sm" variant="outline" href="/cp-hub">
            Browse All ({cpResources.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cpResources.slice(0, 4).map((res) => (
            <div
              key={res.id}
              className="p-3.5 bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-md flex flex-col gap-2 shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] hover:border-accent-primary transition-all duration-150"
            >
              <div className="flex justify-between items-center">
                <span
                  className={`font-mono text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm border ${
                    res.difficulty === "advanced"
                      ? "bg-red-500/15 text-red-500 border-red-500/40"
                      : res.difficulty === "intermediate"
                      ? "bg-amber-500/15 text-amber-500 border-amber-500/40"
                      : "bg-emerald-500/15 text-emerald-500 border-emerald-500/40"
                  }`}
                >
                  {res.difficulty}
                </span>
                <span className="text-[11px] text-text-tertiary font-medium">
                  {res.author || "MEC CC Lead"}
                </span>
              </div>

              <h4 className="m-0 mt-0.5 text-sm font-bold text-text-primary leading-snug">
                {res.title}
              </h4>

              <div className="mt-auto pt-1.5">
                <Button size="sm" variant="ghost" href="/cp-hub" style={{ padding: "0", fontSize: "12px", color: "var(--accent-primary)" }}>
                  Open Practice Guide →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
