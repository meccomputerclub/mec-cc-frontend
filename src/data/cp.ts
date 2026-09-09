import { LeaderboardEntry, CPContest, CPResource } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Nusrat Jahan", handle: "nusrat_cf", platform: "Codeforces", rating: 1687, solved: 580, image: "/images/team/nusrat.jpg" },
  { rank: 2, name: "Rafi Islam", handle: "rafi_codes", platform: "Codeforces", rating: 1542, solved: 420, image: "/images/team/rafi.jpg" },
  { rank: 3, name: "Tanvir Hasan", handle: "tanvir_h", platform: "Codeforces", rating: 1498, solved: 390 },
  { rank: 4, name: "Arif Hossain", handle: "arif_cp", platform: "Codeforces", rating: 1423, solved: 310 },
  { rank: 5, name: "Fariha Noor", handle: "fariha_n", platform: "Codeforces", rating: 1356, solved: 275 },
  { rank: 6, name: "Kamal Uddin", handle: "kamal_u", platform: "Codeforces", rating: 1298, solved: 245 },
  { rank: 7, name: "Sabrina Akter", handle: "sabrina_a", platform: "Codeforces", rating: 1245, solved: 210 },
  { rank: 8, name: "Mehedi Hasan", handle: "mehedi_h", platform: "Codeforces", rating: 1189, solved: 185 },
];

export async function getClubLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch(`${API_URL}/api/users/public/leaderboard`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.filter((entry: LeaderboardEntry) => {
          const desig = (entry.designation || "").toLowerCase();
          const batch = (entry.batch || "").toLowerCase();
          if (desig.includes("advisor") || desig.includes("patron") || desig.includes("principal")) return false;
          if (batch === "faculty") return false;
          return true;
        });
      }
    }
  } catch (err) {
    console.warn("Could not fetch real leaderboard from backend, using fallback:", err);
  }
  return leaderboard;
}



export const contests: CPContest[] = [
  {
    id: "c1",
    name: "ICPC Asia Dhaka Regional — Preliminary",
    platform: "ICPC",
    date: "2025-11-15",
    participants: ["Team Alpha", "Team Beta", "Team Gamma"],
    results: undefined,
  },
  {
    id: "c2",
    name: "Codeforces Round #940 (Div. 2)",
    platform: "Codeforces",
    date: "2025-09-28",
    participants: ["Nusrat Jahan", "Rafi Islam", "Tanvir Hasan", "Arif Hossain"],
  },
  {
    id: "c3",
    name: "Intra-MEC Programming Contest 2025",
    platform: "MEC Judge",
    date: "2025-08-30",
    participants: ["78 participants"],
    results: {
      rank: 1,
      totalTeams: 78,
      highlights: "Nusrat Jahan won 1st place. Rafi Islam placed 2nd. Record participation.",
    },
  },
  {
    id: "c4",
    name: "AtCoder Beginner Contest 365",
    platform: "AtCoder",
    date: "2025-08-17",
    participants: ["Nusrat Jahan", "Rafi Islam"],
  },
];

export const cpResources: CPResource[] = [
  {
    id: "r1",
    title: "Binary Search — Complete Guide",
    type: "tutorial",
    difficulty: "beginner",
    url: "#",
    tags: ["binary-search", "fundamentals"],
    author: "Rafi Islam",
    date: "2025-09-05",
  },
  {
    id: "r2",
    title: "Dynamic Programming: From Zero to Hero",
    type: "tutorial",
    difficulty: "intermediate",
    url: "#",
    tags: ["dynamic-programming", "algorithms"],
    author: "Nusrat Jahan",
    date: "2025-08-20",
  },
  {
    id: "r3",
    title: "Intra-MEC Contest 2025 — Editorial",
    type: "editorial",
    difficulty: "intermediate",
    url: "#",
    tags: ["contest", "editorial"],
    author: "Nusrat Jahan",
    date: "2025-09-01",
  },
  {
    id: "r4",
    title: "Graph Theory Problem Set (30 problems)",
    type: "problem-set",
    difficulty: "intermediate",
    url: "#",
    tags: ["graphs", "bfs", "dfs", "shortest-path"],
    author: "Tanvir Hasan",
  },
  {
    id: "r5",
    title: "Segment Trees Crash Course",
    type: "tutorial",
    difficulty: "advanced",
    url: "#",
    tags: ["data-structures", "segment-tree"],
    author: "Nusrat Jahan",
    date: "2025-07-15",
  },
];
