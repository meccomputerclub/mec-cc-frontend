export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getClubLeaderboard, cpResources } from "@/data/cp";
import { getPageContent } from "@/lib/pageContent";

export const metadata: Metadata = {
  title: "CP Hub & Codeforces Leaderboard | MEC Computer Club",
  description:
    "Official Competitive Programming hub of MEC Computer Club. Track live Codeforces ratings, access curated ICPC roadmaps, problem sets, and practice logs in Sylhet.",
  keywords: [
    "MEC CP Hub",
    "MEC Codeforces leaderboard",
    "Murari Chand College competitive programming",
    "MEC ICPC training",
    "Sylhet CP community",
    "MEC programming contest leaderboard",
  ],
  alternates: {
    canonical: "https://meccomputerclub.org/cp-hub",
  },
  openGraph: {
    title: "CP Hub & Codeforces Leaderboard | MEC Computer Club",
    description:
      "Live club rankings, ICPC roadmaps, and competitive programming resources for Murari Chand College students.",
    url: "https://meccomputerclub.org/cp-hub",
    images: ["/mec-club-photo.jpg"],
  },
};

export default async function CPHubPage() {
  const [leaderboardData, cpContent] = await Promise.all([
    getClubLeaderboard(),
    getPageContent("cp-hub"),
  ]);

  const kicker = cpContent?.header?.kicker || "Competitive Programming";
  const title = cpContent?.header?.title || "CP Hub";
  const description =
    cpContent?.header?.description ||
    "Leaderboard, curated roadmaps, problem sets, and resources — everything the CP team needs in one place.";

  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">{kicker}</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            {title}
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px]">
            {description}
          </p>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-8 md:py-12 bg-surface-secondary" id="leaderboard">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Leaderboard</h2>
              <p className="text-text-tertiary">Real standings of our club members powered by Codeforces.</p>
            </div>
            <Button href="/cp-hub/leaderboard" variant="secondary" size="sm">
              Full Leaderboard →
            </Button>
          </div>

          <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="grid grid-cols-[55px_1.6fr_1.1fr_85px_75px] p-3 sm:px-4 bg-surface-secondary font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-semibold uppercase tracking-wider text-text-tertiary border-b border-border-default max-[480px]:grid-cols-[45px_1.4fr_1fr_75px_65px] max-[480px]:p-[var(--space-2)_var(--space-3)]">
              <span>#</span>
              <span>Member</span>
              <span>Handle</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Solved</span>
            </div>
            {leaderboardData.map((entry) => {
              const isRank1 = entry.rank === 1;
              const isRank2 = entry.rank === 2;
              const isRank3 = entry.rank === 3;
              const avatarSrc =
                entry.imageUrl ||
                entry.avatar ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(entry.name)}&backgroundColor=transparent`;

              return (
                <div
                  key={entry.userId || entry.handle || entry.rank}
                  className={`grid grid-cols-[55px_1.6fr_1.1fr_85px_75px] p-3 sm:px-4 border-t border-border-default items-center transition-colors hover:bg-accent-primary-light/20 max-[480px]:grid-cols-[45px_1.4fr_1fr_75px_65px] max-[480px]:p-[var(--space-2)_var(--space-3)] ${
                    isRank1
                      ? "border-l-4 border-l-amber-400 bg-amber-400/5"
                      : isRank2
                      ? "border-l-4 border-l-slate-400 bg-slate-400/5"
                      : isRank3
                      ? "border-l-4 border-l-amber-600 bg-amber-600/5"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-1 font-mono font-bold">
                    {isRank1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-400 text-black text-xs font-black shadow-xs">
                        #1
                      </span>
                    ) : isRank2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-300 dark:bg-slate-700 text-text-primary text-xs font-black shadow-xs">
                        #2
                      </span>
                    ) : isRank3 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-700/20 text-amber-600 dark:text-amber-400 text-xs font-black shadow-xs">
                        #3
                      </span>
                    ) : (
                      <span className="text-text-tertiary">#{entry.rank}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border-default bg-surface-secondary">
                      <img
                        src={avatarSrc}
                        alt={entry.name}
                        className="w-full h-full object-cover"
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
                      {entry.designation && (
                        <span className="text-[11px] text-text-tertiary truncate block leading-tight">
                          {entry.designation}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 pr-2">
                    {entry.hasCfHandle ? (
                      <a
                        href={`https://codeforces.com/profile/${entry.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs sm:text-sm text-accent-primary-hover hover:underline truncate block"
                        title={`Codeforces profile: ${entry.handle}`}
                      >
                        @{entry.handle}
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-text-tertiary truncate block">
                        {entry.handle}
                      </span>
                    )}
                    {entry.tier && entry.tier !== "unrated" && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-accent-primary-hover">
                        {entry.tier}
                      </span>
                    )}
                  </div>

                  <span
                    className={`font-mono font-semibold text-right ${
                      entry.rating > 0 ? "text-accent-primary font-bold" : "text-text-tertiary"
                    }`}
                  >
                    {entry.rating > 0 ? entry.rating : "—"}
                  </span>

                  <span className="font-mono text-text-secondary text-right">
                    {entry.solved > 0 ? entry.solved : 0}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-8 md:py-12" id="resources">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
            Docs, Algorithms &amp; Editorials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cpResources.map((r) => (
              <a
                key={r.id}
                href={r.url}
                className="flex flex-col gap-2 p-5 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 no-underline"
              >
                <div className="flex gap-2">
                  <Badge variant={r.difficulty === "beginner" ? "active" : r.difficulty === "intermediate" ? "info" : "pending"} size="sm">
                    {r.difficulty}
                  </Badge>
                  <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-tertiary uppercase">
                    {r.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary m-0">{r.title}</h3>
                <span className="text-sm text-text-tertiary">{r.author}</span>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-[0.65rem] py-0.5 px-2 bg-surface-secondary rounded border border-border-default text-text-tertiary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
