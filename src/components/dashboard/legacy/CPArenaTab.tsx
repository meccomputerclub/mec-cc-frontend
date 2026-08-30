"use client";

import { useState, useEffect } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  Trophy,
  ExternalLink,
  Flame,
  Award,
  Calendar,
  BookOpen,
  Code2,
  CheckCircle2,
  RefreshCw,
  Edit3,
  Copy,
  TrendingUp,
  Sparkles,
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
  const [cfError, setCfError] = useState<string | null>(null);

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
      } catch (err) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* ── Top CP Wall Hero Panel ── */}
      <div className="db-panel">
        <div className="db-panel-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-primary)",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                border: "1.5px solid #000",
              }}
            >
              <Flame size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800 }}>CP Arena &amp; Solvers Wall</h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Live Online Judge statistics, club rankings, and algorithmic milestones.
              </p>
            </div>
          </div>

          <Button size="sm" variant="outline" onClick={onEditProfile}>
            <Edit3 size={13} style={{ marginRight: "5px" }} /> Update Handles
          </Button>
        </div>

        {/* ── Key Metrics Ribbon ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-3)",
            marginTop: "var(--space-2)",
          }}
        >
          {/* CF Rating Stat */}
          <div
            style={{
              padding: "12px 16px",
              background: "var(--surface-secondary)",
              border: "1.5px solid #000000",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "24px" }}>🎯</div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>
                Codeforces Rating
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)", color: getCFRankColor(cfData?.rank) }}>
                {loadingCf ? "Syncing..." : cfData?.rating || (cfHandle ? "Active" : "Unlinked")}
              </div>
            </div>
          </div>

          {/* CF Rank Stat */}
          <div
            style={{
              padding: "12px 16px",
              background: "var(--surface-secondary)",
              border: "1.5px solid #000000",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "24px" }}>⚡</div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>
                Rank Title
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, textTransform: "capitalize", color: getCFRankColor(cfData?.rank) }}>
                {cfData?.rank || (cfHandle ? "Contestant" : "Not Set")}
              </div>
            </div>
          </div>

          {/* Club Leaderboard Standing */}
          <div
            style={{
              padding: "12px 16px",
              background: "var(--surface-secondary)",
              border: "1.5px solid #000000",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "24px" }}>🏆</div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>
                Club Leaderboard
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {clubStanding ? `Rank #${clubStanding.rank}` : "Top Solver Node"}
              </div>
            </div>
          </div>

          {/* Solved Problems Count */}
          <div
            style={{
              padding: "12px 16px",
              background: "var(--surface-secondary)",
              border: "1.5px solid #000000",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ fontSize: "24px" }}>💡</div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)", letterSpacing: "0.05em" }}>
                Estimated Solved
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {clubStanding?.solved ? `${clubStanding.solved}+ Problems` : "Active Solver"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-Column Grid: Online Judge Profiles & Contest Radar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
        
        {/* Left Column: Judge Cards (Codeforces, CodeChef, GitHub) */}
        <div className="db-panel" style={{ margin: 0 }}>
          <div className="db-panel-header">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Connected Judge Profiles</h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Direct links and live stats from competitive platforms.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {/* Codeforces Judge Card */}
            <div
              style={{
                padding: "14px 16px",
                background: "var(--surface-secondary)",
                border: "1.5px solid #000000",
                borderRadius: "var(--radius-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-sm)",
                    background: "#1f2937",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontFamily: "var(--font-mono)",
                    border: "1.5px solid #000",
                  }}
                >
                  CF
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.9375rem" }}>Codeforces</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {cfHandle ? `@${cfHandle}` : "Not Connected"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {cfHandle ? (
                  <>
                    {cfData?.rating && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--surface-primary)",
                          border: "1.5px solid #000",
                          color: getCFRankColor(cfData.rank),
                        }}
                      >
                        {cfData.rating} ({cfData.rank || "rated"})
                      </span>
                    )}
                    <a
                      href={`https://codeforces.com/profile/${cfHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="db-hero-social-btn"
                      title="Open Codeforces Profile"
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
            <div
              style={{
                padding: "14px 16px",
                background: "var(--surface-secondary)",
                border: "1.5px solid #000000",
                borderRadius: "var(--radius-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-sm)",
                    background: "#5b4636",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontFamily: "var(--font-mono)",
                    border: "1.5px solid #000",
                  }}
                >
                  CC
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.9375rem" }}>CodeChef</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {ccHandle ? `@${ccHandle}` : "Not Connected"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {ccHandle ? (
                  <>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--surface-primary)",
                        border: "1.5px solid #000",
                        color: "var(--text-primary)",
                      }}
                    >
                      ⭐ Division Active
                    </span>
                    <a
                      href={`https://www.codechef.com/users/${ccHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="db-hero-social-btn"
                      title="Open CodeChef Profile"
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
            <div
              style={{
                padding: "14px 16px",
                background: "var(--surface-secondary)",
                border: "1.5px solid #000000",
                borderRadius: "var(--radius-md)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-sm)",
                    background: "#000",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid #000",
                  }}
                >
                  <Code2 size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.9375rem" }}>Algorithm Solutions Repository</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {ghHandle ? `github.com/${ghHandle}` : "Open Source Code"}
                  </div>
                </div>
              </div>

              {ghHandle ? (
                <a
                  href={`https://github.com/${ghHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="db-hero-social-btn"
                  title="View GitHub Repositories"
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
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--surface-secondary)",
                  border: "1.5px solid #000000",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>💬</span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "0.8125rem" }}>Discord CP Team Handle:</span>{" "}
                    <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent-primary)" }}>
                      {discordHandle}
                    </code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(discordHandle, "Discord handle")}
                  className="db-hero-social-btn"
                  title="Copy Discord Tag"
                >
                  <Copy size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Contest Radar */}
        <div className="db-panel" style={{ margin: 0 }}>
          <div className="db-panel-header">
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Contest Radar</h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Upcoming official rounds and university contests.
              </p>
            </div>
            <Button size="sm" variant="outline" href="/cp-hub">
              Full Calendar <ExternalLink size={12} style={{ marginLeft: "4px" }} />
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {staticContests.slice(0, 3).map((contest) => (
              <div
                key={contest.id}
                style={{
                  padding: "12px 14px",
                  background: "var(--surface-secondary)",
                  border: "1.5px solid #000000",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "1px 6px",
                        background: "var(--surface-primary)",
                        border: "1.5px solid #000",
                        borderRadius: "var(--radius-sm)",
                        textTransform: "uppercase",
                      }}
                    >
                      {contest.platform}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      {contest.date}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
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

      {/* ── Curated Algorithm Practice & Roadmaps ── */}
      <div className="db-panel">
        <div className="db-panel-header">
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>MEC CC Algorithmic Roadmaps &amp; Problem Sets</h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Curated tutorials and topic-wise practice sets prepared by club CP mentors.
            </p>
          </div>
          <Button size="sm" variant="outline" href="/cp-hub">
            Browse All ({cpResources.length})
          </Button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--space-3)",
          }}
        >
          {cpResources.slice(0, 4).map((res) => (
            <div
              key={res.id}
              style={{
                padding: "14px",
                background: "var(--surface-secondary)",
                border: "1.5px solid #000000",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm)",
                    background: res.difficulty === "advanced" ? "#fee2e2" : res.difficulty === "intermediate" ? "#fef3c7" : "#dcfce7",
                    color: res.difficulty === "advanced" ? "#991b1b" : res.difficulty === "intermediate" ? "#92400e" : "#166534",
                    border: "1px solid #000",
                  }}
                >
                  {res.difficulty}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  {res.author || "MEC CC Lead"}
                </span>
              </div>

              <h4 style={{ margin: "2px 0 0", fontSize: "0.9375rem", fontWeight: 700, lineHeight: 1.3 }}>
                {res.title}
              </h4>

              <div style={{ marginTop: "auto", paddingTop: "6px" }}>
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
