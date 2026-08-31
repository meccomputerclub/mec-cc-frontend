import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { leaderboard, contests, cpResources } from "@/data/cp";

export const metadata: Metadata = {
  title: "CP Hub",
  description: "MEC Computer Club Competitive Programming hub — leaderboard, contest calendar, resources, and editorials.",
};

export default function CPHubPage() {
  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Competitive Programming</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            CP Hub
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px]">
            Leaderboard, contest calendar, and curated resources — everything
            the CP team needs in one place.
          </p>
        </div>
      </section>

      {/* Contest Calendar */}
      <section className="py-8 md:py-12" id="contests">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
            Scheduled Contests
          </h2>
          <div className="flex flex-col gap-4">
            {contests.map((c) => {
              const isPast = new Date(c.date) < new Date();
              return (
                <div
                  key={c.id}
                  className="flex gap-4 p-4 sm:p-5 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col items-center justify-center w-14 shrink-0 bg-surface-secondary rounded-lg p-2 border border-border-default">
                    <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs uppercase text-accent-primary-hover font-bold tracking-wider">
                      {new Date(c.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-xl font-bold text-text-primary leading-none mt-1">
                      {new Date(c.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-base font-bold text-text-primary">{c.name}</h4>
                      <Badge variant={isPast ? "past" : "upcoming"} size="sm">
                        {isPast ? "Past" : "Upcoming"}
                      </Badge>
                    </div>
                    <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-tertiary block">
                      {c.platform}
                    </span>
                    {c.results && (
                      <p className="text-sm text-accent-primary-hover mt-1 font-medium">{c.results.highlights}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-8 md:py-12 bg-surface-secondary" id="leaderboard">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">Leaderboard</h2>
          <p className="text-text-tertiary mb-6">Codeforces ratings, updated weekly.</p>
          <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="grid grid-cols-[50px_1.5fr_1fr_80px_80px] p-3 sm:px-4 bg-surface-secondary font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-semibold uppercase tracking-wider text-text-tertiary border-b border-border-default">
              <span>#</span>
              <span>Member</span>
              <span>Handle</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Solved</span>
            </div>
            {leaderboard.map((entry) => {
              const isRank1 = entry.rank === 1;
              const isRank2 = entry.rank === 2;
              const isRank3 = entry.rank === 3;
              return (
                <div
                  key={entry.rank}
                  className={`grid grid-cols-[50px_1.5fr_1fr_80px_80px] p-3 sm:px-4 border-t border-border-default items-center transition-colors hover:bg-accent-primary-light/20 ${
                    isRank1
                      ? "border-l-4 border-l-amber-400 bg-amber-400/5"
                      : isRank2
                      ? "border-l-4 border-l-slate-400 bg-slate-400/5"
                      : isRank3
                      ? "border-l-4 border-l-amber-600 bg-amber-600/5"
                      : ""
                  }`}
                >
                  <span className={`font-mono [font-feature-settings:'liga'_0,'calt'_0] font-bold text-accent-primary-hover ${entry.rank <= 3 ? "text-lg" : ""}`}>
                    #{entry.rank}
                  </span>
                  <span className="font-semibold text-text-primary text-sm sm:text-base">{entry.name}</span>
                  <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-sm text-accent-primary-hover">@{entry.handle}</span>
                  <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] font-semibold text-text-primary text-right">{entry.rating}</span>
                  <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-text-secondary text-right">{entry.solved}</span>
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
