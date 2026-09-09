export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { getClubLeaderboard } from "@/data/cp";
import LeaderboardTable from "./components/LeaderboardTable";

export const metadata: Metadata = {
  title: "Leaderboard | CP Hub | MEC Computer Club",
  description: "Official Competitive Programming leaderboard for MEC Computer Club members with live Codeforces stats.",
};

export default async function LeaderboardPage() {
  const leaderboardData = await getClubLeaderboard();

  return (
    <main className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="text-center max-w-[640px] mx-auto mb-8">
          <span className="kicker">CP Hub</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
            Leaderboard
          </h1>
          <p className="text-text-tertiary">
            Real standings of our club members powered by Codeforces.
          </p>
        </div>

        <LeaderboardTable initialEntries={leaderboardData} />
      </div>
    </main>
  );
}

