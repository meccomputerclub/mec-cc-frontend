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

const defaultAchievements = [
  {
    id: "ach-1",
    title: "ICPC Asia Dhaka Regional Contest",
    highlight: "Top 25 Finish",
    desc: "MEC Computer Club represented the institution with distinction among national universities.",
    year: "2025",
  },
  {
    id: "ach-2",
    title: "Intra-MEC Programming Contest",
    highlight: "100+ Participants",
    desc: "Annual algorithmic contest hosted on campus with dedicated lab setups and real-time scoreboards.",
    year: "2025",
  },
  {
    id: "ach-3",
    title: "National Collegiate Girls' Contest",
    highlight: "Regional Qualification",
    desc: "Female members of MEC Computer Club qualified for national finals with flying colors.",
    year: "2025",
  },
];

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

  const achievements =
    Array.isArray(cpContent?.achievements) && cpContent.achievements.length > 0
      ? cpContent.achievements
      : defaultAchievements;

  const clubDocs =
    Array.isArray(cpContent?.clubDocs) && cpContent.clubDocs.length > 0
      ? cpContent.clubDocs
      : cpResources;

  return (
    <CPHubView
      initialLeaderboard={leaderboardData}
      initialAchievements={achievements}
      initialClubDocs={clubDocs}
      cpSections={cpContent || {}}
      kicker={kicker}
      title={title}
      description={description}
    />
  );
}
