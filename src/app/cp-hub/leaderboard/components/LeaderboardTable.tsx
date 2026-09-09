"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Trophy, Award, ExternalLink, User, Flame } from "lucide-react";
import { LeaderboardEntry } from "@/types";
import FilterSelect from "@/app/dashboard/components/FilterSelect";

interface LeaderboardTableProps {
  initialEntries: LeaderboardEntry[];
}

export default function LeaderboardTable({ initialEntries }: LeaderboardTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "solved" | "name">("rating");

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Members", count: initialEntries.length },
    {
      value: "rated",
      label: "Codeforces Rated",
      count: initialEntries.filter((e) => e.rating > 0).length,
    },
    {
      value: "has_cf",
      label: "Has CF Handle",
      count: initialEntries.filter((e) => e.hasCfHandle).length,
    },
  ];

  const sortOptions = [
    { value: "rating", label: "Sort: Rating (High → Low)" },
    { value: "solved", label: "Sort: Solved (High → Low)" },
    { value: "name", label: "Sort: Name (A → Z)" },
  ];

  // Top stats
  const topRated = useMemo(() => {
    const rated = [...initialEntries].filter((e) => e.rating > 0).sort((a, b) => b.rating - a.rating);
    return rated[0];
  }, [initialEntries]);

  const topSolver = useMemo(() => {
    const solved = [...initialEntries].filter((e) => e.solved > 0).sort((a, b) => b.solved - a.solved);
    return solved[0];
  }, [initialEntries]);

  const totalProblemsSolved = useMemo(() => {
    return initialEntries.reduce((acc, curr) => acc + (curr.solved || 0), 0);
  }, [initialEntries]);

  // Filtered and sorted entries
  const filteredEntries = useMemo(() => {
    return initialEntries
      .filter((entry) => {
        // Category filter
        if (categoryFilter === "rated" && (!entry.rating || entry.rating <= 0)) {
          return false;
        }
        if (categoryFilter === "has_cf" && !entry.hasCfHandle) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = entry.name.toLowerCase().includes(q);
          const handleMatch = entry.handle.toLowerCase().includes(q);
          const desigMatch = entry.designation?.toLowerCase().includes(q) || false;
          const batchMatch = entry.batch?.toLowerCase().includes(q) || false;
          return nameMatch || handleMatch || desigMatch || batchMatch;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating") {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return (b.solved || 0) - (a.solved || 0);
        }
        if (sortBy === "solved") {
          if ((b.solved || 0) !== (a.solved || 0)) return (b.solved || 0) - (a.solved || 0);
          return b.rating - a.rating;
        }
        return a.name.localeCompare(b.name);
      });
  }, [initialEntries, categoryFilter, searchQuery, sortBy]);

  const getTierColor = (tier?: string) => {
    const t = tier?.toLowerCase() || "";
    if (t.includes("grandmaster")) return "text-red-500 bg-red-500/10 border-red-500/30";
    if (t.includes("master")) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    if (t.includes("candidate")) return "text-purple-500 bg-purple-500/10 border-purple-500/30";
    if (t.includes("expert")) return "text-blue-500 bg-blue-500/10 border-blue-500/30";
    if (t.includes("specialist")) return "text-teal-500 bg-teal-500/10 border-teal-500/30";
    if (t.includes("pupil")) return "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30";
    if (t.includes("newbie")) return "text-slate-500 bg-slate-500/10 border-slate-500/30";
    return "text-text-tertiary bg-surface-secondary border-border-default";
  };

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl p-4 shadow-[3px_3px_0px_var(--accent-primary)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-400/15 text-amber-500 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-wider font-mono text-text-tertiary block">
              Top Rated Member
            </span>
            <span className="font-bold text-text-primary text-sm sm:text-base truncate block">
              {topRated ? `${topRated.name} (${topRated.rating})` : "N/A"}
            </span>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl p-4 shadow-[3px_3px_0px_var(--accent-primary)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-wider font-mono text-text-tertiary block">
              Top Problem Solver
            </span>
            <span className="font-bold text-text-primary text-sm sm:text-base truncate block">
              {topSolver ? `${topSolver.name} (${topSolver.solved} solved)` : "N/A"}
            </span>
          </div>
        </div>

        <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl p-4 shadow-[3px_3px_0px_var(--accent-primary)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-primary-light/40 text-accent-primary flex items-center justify-center shrink-0 border border-accent-primary/30">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs uppercase tracking-wider font-mono text-text-tertiary block">
              Total Problems Solved
            </span>
            <span className="font-bold text-text-primary text-sm sm:text-base truncate block">
              {totalProblemsSolved.toLocaleString()} Problems
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member, handle, designation..."
            className="w-full pl-9.5 pr-4 py-2 text-sm bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary font-sans text-text-primary placeholder:text-text-tertiary"
          />
        </div>

        {/* Filter and Sort Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={filterOptions}
            placeholder="Filter Category"
          />

          <FilterSelect
            value={sortBy}
            onChange={(v) => setSortBy(v as any)}
            options={sortOptions}
            placeholder="Sort by"
          />
        </div>
      </div>

      {/* 3. Neo-Brutalist Leaderboard Table */}
      <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl overflow-hidden shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] transition-all duration-200">
        {/* Table Header */}
        <div className="grid grid-cols-[55px_1.8fr_1.2fr_90px_80px_70px] p-3 sm:px-4 bg-surface-secondary font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-semibold uppercase tracking-wider text-text-tertiary border-b border-border-default max-[768px]:grid-cols-[50px_1.6fr_1fr_80px_70px] max-[480px]:grid-cols-[45px_1.4fr_1fr_70px_60px]">
          <span>#</span>
          <span>Member</span>
          <span>Handle</span>
          <span className="text-right">Rating</span>
          <span className="text-right">Solved</span>
          <span className="text-right max-[768px]:hidden">Profile</span>
        </div>

        {/* Rows */}
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-text-tertiary text-sm">
            No club members match your search or filter.
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            const actualRank = entry.rank || index + 1;
            const isTop1 = actualRank === 1;
            const isTop2 = actualRank === 2;
            const isTop3 = actualRank === 3;
            const avatarSrc =
              entry.imageUrl ||
              entry.avatar ||
              `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(entry.name)}&backgroundColor=transparent`;

            return (
              <div
                key={entry.userId || entry.handle || actualRank}
                className={`grid grid-cols-[55px_1.8fr_1.2fr_90px_80px_70px] p-3 sm:px-4 border-t border-border-default items-center transition-colors hover:bg-accent-primary-light/20 max-[768px]:grid-cols-[50px_1.6fr_1fr_80px_70px] max-[480px]:grid-cols-[45px_1.4fr_1fr_70px_60px] ${
                  isTop1
                    ? "border-l-4 border-l-amber-400 bg-amber-400/5"
                    : isTop2
                    ? "border-l-4 border-l-slate-400 bg-slate-400/5"
                    : isTop3
                    ? "border-l-4 border-l-amber-600 bg-amber-600/5"
                    : ""
                }`}
              >
                {/* Rank */}
                <div className="flex items-center font-mono font-bold">
                  {isTop1 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-400 text-black text-xs font-black shadow-xs">
                      #1
                    </span>
                  ) : isTop2 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-300 dark:bg-slate-700 text-text-primary text-xs font-black shadow-xs">
                      #2
                    </span>
                  ) : isTop3 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-700/20 text-amber-600 dark:text-amber-400 text-xs font-black shadow-xs">
                      #3
                    </span>
                  ) : (
                    <span className="text-text-tertiary text-sm">#{actualRank}</span>
                  )}
                </div>

                {/* Member Name & Avatar */}
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border-default bg-surface-secondary">
                    <img
                      src={avatarSrc}
                      alt={entry.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(entry.name)}&backgroundColor=transparent`;
                      }}
                    />
                  </div>
                  <div className="min-w-0 truncate">
                    {entry.profileUrl ? (
                      <Link
                        href={entry.profileUrl}
                        className="font-semibold text-text-primary hover:text-accent-primary-hover transition-colors truncate block text-sm sm:text-base"
                      >
                        {entry.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-text-primary truncate block text-sm sm:text-base">
                        {entry.name}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary truncate">
                      {entry.designation && <span>{entry.designation}</span>}
                      {entry.designation && entry.batch && <span>•</span>}
                      {entry.batch && <span>{entry.batch}</span>}
                    </div>
                  </div>
                </div>

                {/* Handle & Tier */}
                <div className="min-w-0 pr-2">
                  {entry.hasCfHandle ? (
                    <div className="flex flex-col items-start gap-0.5">
                      <a
                        href={`https://codeforces.com/profile/${entry.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs sm:text-sm text-accent-primary-hover hover:underline inline-flex items-center gap-1 truncate max-w-full"
                        title={`Open Codeforces: ${entry.handle}`}
                      >
                        @{entry.handle}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                      </a>
                      {entry.tier && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getTierColor(
                            entry.tier
                          )}`}
                        >
                          {entry.tier}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-mono text-xs text-text-tertiary truncate">
                        {entry.handle}
                      </span>
                      <span className="text-[10px] font-semibold text-text-tertiary uppercase">
                        Unrated
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="text-right">
                  <span
                    className={`font-mono [font-feature-settings:'liga'_0,'calt'_0] font-bold text-sm sm:text-base ${
                      entry.rating > 0 ? "text-accent-primary" : "text-text-tertiary font-normal"
                    }`}
                  >
                    {entry.rating > 0 ? entry.rating : "—"}
                  </span>
                  {entry.maxRating && entry.maxRating > entry.rating ? (
                    <span className="block text-[10px] font-mono text-text-tertiary">
                      max: {entry.maxRating}
                    </span>
                  ) : null}
                </div>

                {/* Solved */}
                <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-text-secondary text-right font-medium text-sm sm:text-base">
                  {entry.solved > 0 ? entry.solved : 0}
                </span>

                {/* Action Link to Profile */}
                <div className="text-right max-[768px]:hidden">
                  {entry.profileUrl ? (
                    <Link
                      href={entry.profileUrl}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-border-default bg-surface-secondary text-text-secondary hover:text-accent-primary-hover hover:border-accent-primary transition-colors"
                      title="View Member Profile"
                    >
                      <User className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
