import { Metadata } from "next";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Achievements | CP Hub | MEC Computer Club",
  description: "Milestones and contest achievements of MEC Computer Club.",
};

export default function AchievementsPage() {
  return (
    <main className="section container min-h-[60vh] flex flex-col justify-center">
      <div className="section-header text-center max-w-[640px] mx-auto">
        <span className="kicker">CP Hub</span>
        <h2>Achievements</h2>
        <p className="text-text-secondary">
          A timeline of our competitive programming milestones and hall of fame.
        </p>
      </div>

      <div className="max-w-[580px] mx-auto w-full p-8 sm:p-12 bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-2xl shadow-[6px_6px_0px_0px_var(--accent-primary)] text-center flex flex-col items-center gap-4 mt-6">
        <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 border-2 border-accent-primary flex items-center justify-center text-accent-primary shadow-[3px_3px_0px_0px_var(--text-primary)]">
          <Trophy size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-text-primary m-0">
            Achievements will appear here
          </h3>
          <p className="font-body text-sm text-text-secondary max-w-[420px] leading-relaxed m-0">
            Our contest accolades, regional placements, and national podium finishes are being compiled and verified. Check back soon!
          </p>
        </div>
        <div className="pt-2">
          <Button variant="outline" href="/cp-hub/leaderboard">
            Explore CP Leaderboard →
          </Button>
        </div>
      </div>
    </main>
  );
}
