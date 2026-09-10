"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Compass,
  Code2,
  BookOpen,
  Users,
  Award,
  ExternalLink,
  ChevronRight,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { LeaderboardEntry, CPResource } from "@/types";
import LeaderboardTable from "../leaderboard/components/LeaderboardTable";
import { Badge } from "@/components/ui/Badge";

interface CPHubViewProps {
  initialLeaderboard: LeaderboardEntry[];
  cpResources: CPResource[];
  kicker: string;
  title: string;
  description: string;
}

const TABS = [
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "roadmaps", label: "Roadmaps", icon: Compass },
  { id: "problem-sets", label: "Problem Sets", icon: Code2 },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "mentor-sessions", label: "Mentor Sessions", icon: Users },
  { id: "achievements", label: "Achievements", icon: Award },
];

const roadmapLevels = [
  {
    level: "Newbie",
    rating: "< 1200",
    color: "#808080",
    description: "Build fundamentals: syntax fluency, time complexity, and brute force techniques.",
    topics: [
      "Language syntax & STL in C++ (vector, string, sort, pair, map, set)",
      "Time & Space Complexity analysis (Big-O)",
      "Basic Simulation, Arrays, Strings & Math",
      "Brute force enumeration & complete search",
      "Practice: Codeforces Div. 3 & Div. 4 Problems A, B",
    ],
  },
  {
    level: "Pupil",
    rating: "1200 - 1399",
    color: "#008000",
    description: "Standard algorithmic paradigms and efficient data processing.",
    topics: [
      "Binary Search & Two Pointers technique",
      "Prefix Sums & Difference Arrays",
      "Basic Number Theory (Sieve of Eratosthenes, GCD, LCM, Modular arithmetic)",
      "Greedy Algorithms & Constructive algorithms",
      "Practice: Codeforces Div. 2 Problems A, B & Div. 3 Problem C",
    ],
  },
  {
    level: "Specialist",
    rating: "1400 - 1599",
    color: "#03A89E",
    description: "Dynamic programming, graph theory, and intermediate data structures.",
    topics: [
      "Binary Search on Answer range",
      "Dynamic Programming (0/1 Knapsack, LIS, LCS, Grid DP)",
      "Bitmasking & Bitwise Operations",
      "Graph Traversals (BFS, DFS, Connected Components, Topological Sort)",
      "Disjoint Set Union (DSU / Union-Find)",
      "Practice: Codeforces Div. 2 Problem C & CSES DP Section",
    ],
  },
  {
    level: "Expert+",
    rating: "1600+",
    color: "#0000FF",
    description: "Advanced graph theory, range queries, and complex tree algorithms.",
    topics: [
      "Segment Trees, Fenwick Trees (Binary Indexed Tree), Sparse Table",
      "Shortest Paths (Dijkstra, Bellman-Ford, Floyd-Warshall)",
      "Trees (LCA, Tree DP, Binary Lifting)",
      "Combinatorics, Inverses, and Game Theory",
      "Practice: Codeforces Div. 2 Problem D, E & AtCoder ABC E, F",
    ],
  },
];

const problemSets = [
  { title: "Dynamic Programming", count: 50, tag: "CSES + CF", desc: "Classic memoization, tabulation, knapsack, and grid paths.", link: "https://cses.fi/problemset/list/#dynamic" },
  { title: "Graph Theory", count: 35, tag: "BFS/DFS", desc: "Traversal, shortest paths, topological sort, and cycles.", link: "https://cses.fi/problemset/list/#graph" },
  { title: "Range Queries & Trees", count: 40, tag: "SegTree", desc: "Segment trees, fenwick trees, and LCA operations.", link: "https://cses.fi/problemset/list/#range" },
  { title: "Mathematics & Number Theory", count: 25, tag: "Sieve & Mod", desc: "Primes, modular arithmetic, matrix exponentiation.", link: "https://cses.fi/problemset/list/#math" },
  { title: "Binary Search & Two Pointers", count: 30, tag: "Technique", desc: "Searching answer space, interval merging, prefix ranges.", link: "https://codeforces.com/problemset?tags=binary%20search" },
  { title: "Greedy & Constructive", count: 45, tag: "Invariants", desc: "Sorting strategies, interval scheduling, and constructive proofs.", link: "https://codeforces.com/problemset?tags=greedy" },
  { title: "String Algorithms", count: 20, tag: "Hashing & Trie", desc: "String hashing, KMP, Z-algorithm, and Tries.", link: "https://cses.fi/problemset/list/#string" },
  { title: "Tree Algorithms", count: 25, tag: "Subtree DP", desc: "Tree diameter, tree distance, and path queries.", link: "https://cses.fi/problemset/list/#tree" },
];

const resourceCategories = [
  {
    name: "Websites & Problem Archives",
    items: [
      { name: "Codeforces", desc: "The premier competitive programming platform with bi-weekly rated rounds.", url: "https://codeforces.com" },
      { name: "CSES Problem Set", desc: "Curated collection of 300 classic algorithmic problems covering all core topics.", url: "https://cses.fi/problemset/" },
      { name: "AtCoder", desc: "High-quality, elegant educational problems (AtCoder Beginner & Regular Contests).", url: "https://atcoder.jp" },
      { name: "CP-Algorithms", desc: "Comprehensive tutorials and implementations on data structures and algorithms.", url: "https://cp-algorithms.com" },
      { name: "USACO Guide", desc: "Free, curated roadmap and practice curriculum maintained by top competitive programmers.", url: "https://usaco.guide" },
    ],
  },
  {
    name: "Standard Literature & Books",
    items: [
      { name: "Competitive Programming 4 (CP4)", desc: "By Steven & Felix Halim — the definitive ICPC handbook covering all algorithmic archetypes.", url: "https://cpbook.net" },
      { name: "Guide to Competitive Programming", desc: "By Antti Laaksonen — rigorous, concise computer science foundations for contest coders.", url: "https://link.springer.com/book/10.1007/978-3-319-72547-5" },
    ],
  },
  {
    name: "Productivity Tools & Visualizers",
    items: [
      { name: "CF-Predictor", desc: "Browser extension to see live rating changes during and immediately after contests.", url: "https://cf-predictor.wasyl.net" },
      { name: "Codeforces Visualizer", desc: "Track solved problems, tag distribution, and rating history with rich charts.", url: "https://cfviz.netlify.app" },
      { name: "Virtual Judge (VJudge)", desc: "Unified practice platform aggregating POJ, SPOJ, Codeforces, and UVa problems.", url: "https://vjudge.net" },
    ],
  },
];

const mentorSessions = [
  {
    topic: "Introduction to Segment Trees & Point Updates",
    mentor: "Ashik (ICPC Regionalist)",
    date: "Every Friday, 8:00 PM",
    status: "Upcoming",
    desc: "Range minimum/sum queries, tree representation in array, point update and query functions.",
  },
  {
    topic: "Dynamic Programming on Trees & Rerooting",
    mentor: "Rahim (Codeforces Master)",
    date: "Every Saturday, 9:00 PM",
    status: "Upcoming",
    desc: "Subtree DP, computing answer for all roots in O(N), classic tree DP problems.",
  },
  {
    topic: "Graph Theory: BFS, DFS & Connected Components",
    mentor: "Karim (Codeforces Expert)",
    date: "Past Session — Archive Available",
    status: "Completed",
    desc: "Cycle detection, topological sort, bipartite checking, and flood fill algorithms.",
  },
];

const achievements = [
  {
    title: "ICPC Asia Dhaka Regional Contest",
    highlight: "Top 25 Finish",
    desc: "MEC Computer Club represented the institution with distinction among national universities.",
    year: "2025",
  },
  {
    title: "Intra-MEC Programming Contest",
    highlight: "100+ Participants",
    desc: "Annual algorithmic contest hosted on campus with dedicated lab setups and real-time scoreboards.",
    year: "2025",
  },
  {
    title: "National Collegiate Girls' Contest",
    highlight: "Regional Qualification",
    desc: "Female members of MEC Computer Club qualified for national finals with flying colors.",
    year: "2025",
  },
];

function CPHubViewContent({
  initialLeaderboard,
  cpResources,
  kicker,
  title,
  description,
}: CPHubViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") || "leaderboard";
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  useEffect(() => {
    const p = searchParams.get("tab") || "leaderboard";
    if (TABS.some((t) => t.id === p)) {
      setActiveTab(p);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "leaderboard") {
      router.replace("/cp-hub", { scroll: false });
    } else {
      router.replace(`/cp-hub?tab=${tabId}`, { scroll: false });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <section className="pt-8 pb-2">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">{kicker}</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            {title}
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-[680px]">
            {description}
          </p>
        </div>
      </section>

      {/* Main Tab Switcher */}
      <section className="border-b border-border-default sticky top-[var(--nav-height)] z-20 bg-surface-primary/95 backdrop-blur-sm py-2">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-accent-primary text-black shadow-[3px_3px_0px_var(--border-brutalist)] border-2 border-text-primary"
                      : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-default hover:bg-surface-secondary"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab 1: Leaderboard */}
      {activeTab === "leaderboard" && (
        <section className="container mx-auto px-4 md:px-8 max-w-6xl">
          <LeaderboardTable initialEntries={initialLeaderboard} />
        </section>
      )}

      {/* Tab 2: Roadmaps */}
      {activeTab === "roadmaps" && (
        <section className="container mx-auto px-4 md:px-8 max-w-4xl space-y-6">
          <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)]">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Compass className="text-accent-primary" /> Codeforces Rating Milestone Roadmaps
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Step-by-step topics and training drills crafted by club seniors to advance through Codeforces divisions systematically.
            </p>
          </div>

          <div className="space-y-6">
            {roadmapLevels.map((lvl) => (
              <div
                key={lvl.level}
                className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-6 shadow-[4px_4px_0px_0px_var(--border-default)] transition-all hover:shadow-[6px_6px_0px_var(--accent-primary)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-border-default">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: lvl.color }}
                    />
                    <h3 className="text-xl font-bold text-text-primary" style={{ color: lvl.color }}>
                      {lvl.level}
                    </h3>
                  </div>
                  <span
                    className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-surface-secondary border border-border-default"
                    style={{ color: lvl.color }}
                  >
                    Rating: {lvl.rating}
                  </span>
                </div>

                <p className="text-sm text-text-secondary mb-4 italic">
                  {lvl.description}
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-text-tertiary tracking-wider">
                    Core Curriculum &amp; Practice Drills:
                  </h4>
                  <ul className="space-y-2">
                    {lvl.topics.map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary">
                        <span className="text-accent-primary font-mono font-bold">→</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 3: Problem Sets */}
      {activeTab === "problem-sets" && (
        <section className="container mx-auto px-4 md:px-8 max-w-6xl space-y-6">
          <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)]">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Code2 className="text-accent-primary" /> Topic-Wise Problem Sets
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Target your algorithmic weaknesses with curated problem collections from CSES, Codeforces, and AtCoder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {problemSets.map((ps) => (
              <a
                key={ps.title}
                href={ps.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-5 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 no-underline text-inherit"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-accent-primary-light text-text-primary">
                      {ps.tag}
                    </span>
                    <span className="font-mono text-xs text-text-tertiary font-bold">
                      {ps.count} Problems
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                    {ps.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {ps.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-border-default flex items-center justify-between text-xs font-bold text-accent-primary">
                  <span>Start Practicing</span>
                  <ExternalLink size={13} />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Tab 4: Resources */}
      {activeTab === "resources" && (
        <section className="container mx-auto px-4 md:px-8 max-w-6xl space-y-10">
          {/* Main Resource Categories */}
          <div className="space-y-6">
            <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)]">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <BookOpen className="text-accent-primary" /> Curated Tools, Books &amp; Judges
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Essential reference libraries, coding portals, and practice platforms recommended for all competitive coders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resourceCategories.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-5 shadow-[4px_4px_0px_0px_var(--border-default)] flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-text-primary pb-3 border-b border-border-default mb-4">
                      {cat.name}
                    </h3>
                    <ul className="space-y-3">
                      {cat.items.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-2.5 rounded-xl border border-border-default bg-surface-secondary hover:border-accent-primary transition-all no-underline"
                          >
                            <div className="flex items-center justify-between text-sm font-bold text-text-primary group-hover:text-accent-primary">
                              <span>{item.name}</span>
                              <ExternalLink size={13} />
                            </div>
                            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                              {item.desc}
                            </p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Club Editorials & Algorithmic Docs */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-primary">
              Club Docs, Algorithms &amp; Editorials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cpResources.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-2 p-5 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 no-underline text-inherit"
                >
                  <div className="flex gap-2">
                    <Badge variant={r.difficulty === "beginner" ? "active" : r.difficulty === "intermediate" ? "info" : "pending"} size="sm">
                      {r.difficulty}
                    </Badge>
                    <span className="font-mono text-xs text-text-tertiary uppercase">
                      {r.type}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-text-primary m-0">{r.title}</h4>
                  <span className="text-xs text-text-tertiary">{r.author}</span>
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[0.65rem] py-0.5 px-2 bg-surface-secondary rounded border border-border-default text-text-tertiary"
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
      )}

      {/* Tab 5: Mentor Sessions */}
      {activeTab === "mentor-sessions" && (
        <section className="container mx-auto px-4 md:px-8 max-w-4xl space-y-6">
          <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)]">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Users className="text-accent-primary" /> Senior Mentorship Sessions
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Live code-alongs and contest analysis hosted by ICPC regionalists and rated candidates to accelerate beginner learning.
            </p>
          </div>

          <div className="space-y-4">
            {mentorSessions.map((s) => (
              <div
                key={s.topic}
                className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-6 shadow-[4px_4px_0px_0px_var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        s.status === "Upcoming"
                          ? "bg-accent-primary text-black border border-text-primary"
                          : "bg-surface-secondary text-text-secondary"
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-xs font-mono text-text-tertiary">{s.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{s.topic}</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                  <p className="text-xs font-semibold text-text-primary">
                    Instructor: <span className="text-accent-primary-hover font-bold">{s.mentor}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 6: Achievements */}
      {activeTab === "achievements" && (
        <section className="container mx-auto px-4 md:px-8 max-w-4xl space-y-6">
          <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)]">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Award className="text-accent-primary" /> Contest Milestones &amp; Accolades
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Official records of our club teams competing in national hackathons, ICPC regionals, and collegiate contests.
            </p>
          </div>

          <div className="space-y-4">
            {achievements.map((ach) => (
              <div
                key={ach.title}
                className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-6 shadow-[4px_4px_0px_0px_var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-accent-primary text-black">
                      {ach.year}
                    </span>
                    <span className="font-bold text-accent-primary-hover text-sm">
                      {ach.highlight}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{ach.title}</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {ach.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function CPHubView(props: CPHubViewProps) {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-text-tertiary">Loading CP Hub...</div>
      }
    >
      <CPHubViewContent {...props} />
    </Suspense>
  );
}
