import { Metadata } from "next";
import { leaderboard } from "@/data/cp";

export const metadata: Metadata = {
  title: "Leaderboard | CP Hub | MEC Computer Club",
};

export default function LeaderboardPage() {
  return (
    <main className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <span className="kicker">CP Hub</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
            Leaderboard
          </h1>
          <p className="text-text-tertiary">Codeforces ratings, updated weekly.</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl overflow-hidden shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] transition-all duration-200">
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
    </main>
  );
}
