export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getClubLeaderboard, cpResources } from "@/data/cp";
import { getPageContent } from "@/lib/pageContent";
import CPHubView from "./components/CPHubView";

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
    <CPHubView
      initialLeaderboard={leaderboardData}
      cpResources={cpResources}
      kicker={kicker}
      title={title}
      description={description}
    />
  );
}
