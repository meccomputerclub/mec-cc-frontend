// Codeforces Roadmap Page

const roadmapLevels = [
  {
    level: "Newbie",
    rating: "< 1200",
    color: "#808080", // Gray
    topics: [
      "Basic syntax (C++, Java, or Python)",
      "Time Complexity Analysis",
      "Basic Arrays & Strings",
      "Brute Force & Simulation",
    ],
  },
  {
    level: "Pupil",
    rating: "1200 - 1399",
    color: "#008000", // Green
    topics: [
      "Sorting & Searching",
      "Prefix Sums & Two Pointers",
      "Basic Number Theory (Sieve, GCD)",
      "Greedy Algorithms",
    ],
  },
  {
    level: "Specialist",
    rating: "1400 - 1599",
    color: "#03A89E", // Cyan
    topics: [
      "Binary Search (on answer)",
      "Basic Dynamic Programming",
      "Bit Manipulation",
      "Graph Traversals (BFS / DFS)",
    ],
  },
  {
    level: "Expert+",
    rating: "1600+",
    color: "#0000FF", // Blue
    topics: [
      "Advanced DP (Bitmask, Digit)",
      "Shortest Paths (Dijkstra)",
      "Segment Trees & Fenwick Trees",
      "Combinatorics & Game Theory",
    ],
  },
];

export default function RoadmapsPage() {
  return (
    <main className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <span className="kicker">CP Hub</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
            Codeforces Roadmaps
          </h1>
          <p className="text-text-secondary text-lg">Follow the path to reach your target rating!</p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="relative pl-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border-default my-6">
            {roadmapLevels.map((r) => (
              <div key={r.level} className="relative pb-8 last:pb-0 pl-4">
                <div 
                  className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-surface-primary z-10" 
                  style={{ backgroundColor: r.color }} 
                />
                <div>
                  <span
                    className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold uppercase tracking-wider inline-block mb-2 py-0.5 px-2 bg-surface-secondary rounded border border-border-default"
                    style={{ color: r.color }}
                  >
                    {r.rating}
                  </span>
                  <h4 className="text-2xl font-bold mb-3 text-text-primary" style={{ color: r.color }}>{r.level}</h4>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2">
                    {r.topics.map((t, idx) => (
                      <li key={idx} className="text-base text-text-secondary flex items-start gap-2">
                        <span className="text-text-tertiary font-mono [font-feature-settings:'liga'_0,'calt'_0]">→</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
