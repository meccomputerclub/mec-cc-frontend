import { BlogPost } from "@/types";

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    slug: "getting-started-competitive-programming",
    title: "Getting Started with Competitive Programming: A Complete Roadmap",
    excerpt:
      "A structured guide for beginners — which platforms to use, what topics to learn first, and how to build a consistent practice habit.",
    content: `Starting competitive programming can feel overwhelming. There are dozens of platforms, thousands of problems, and no obvious "right" path. This guide gives you a concrete roadmap based on what's worked for MEC CP team members.

## Step 1: Pick One Platform
Don't spread yourself thin. Start with **Codeforces** — it has the most active contest schedule and the problem difficulty ratings make it easy to find your level.

## Step 2: Learn the Fundamentals
Before you touch algorithms, make sure you're comfortable with:
- Arrays, strings, and basic math
- Sorting and binary search
- Basic recursion and brute force

## Step 3: Build a Practice Habit
Solve 2–3 problems daily. Consistency beats intensity. Track your progress — our CP Tracker dashboard makes this automatic.

## Step 4: Start Competing
Enter every Codeforces round. Your rating will fluctuate wildly at first — that's normal. The goal isn't rating, it's getting comfortable with timed problem-solving.

## Step 5: Learn Standard Algorithms
Once you're solving Div 2 A/B consistently, start learning: graph traversal (BFS/DFS), dynamic programming basics, greedy algorithms, and number theory.

The club's weekly practice sessions cover these topics systematically — join us on Thursdays at 4 PM.`,
    author: "Rafi Islam",
    authorImage: "/images/team/rafi.jpg",
    date: "2025-09-01",
    readTime: 6,
    tags: ["competitive-programming", "beginner", "roadmap"],
    featured: true,
  },
  {
    id: "b2",
    slug: "deploying-nextjs-production",
    title: "Deploying a Next.js App to Production: Lessons from MEC Judge",
    excerpt:
      "What we learned deploying a real-time online judge that handles 80+ concurrent users during contest time.",
    content: `When we built MEC Judge, the development phase was straightforward. The real challenge was deployment — handling real load, real users, and real deadlines (you can't tell 80 students "the judge is down" mid-contest).

## Architecture Decisions
We chose Docker + a VPS over serverless because online judges need persistent WebSocket connections for real-time leaderboards, and cold starts on serverless would kill the user experience during contests.

## Database
PostgreSQL with connection pooling via PgBouncer. During our first contest, we hit the connection limit within 10 minutes. PgBouncer solved it immediately.

## Caching
Redis for submission queue and leaderboard caching. Without it, every leaderboard refresh would trigger a full database query across all submissions.

## Monitoring
We added basic health checks and error alerting after the first contest. Nothing fancy — just a Discord webhook that pings us if the judge goes down.

## Key Takeaway
Ship early, monitor everything, and have a rollback plan. Our first contest had bugs — but because we could fix and redeploy in under 5 minutes, nobody noticed.`,
    author: "Farhan Ahmed",
    authorImage: "/images/team/farhan.jpg",
    date: "2025-08-15",
    readTime: 8,
    tags: ["web-development", "deployment", "devops", "nextjs"],
    featured: true,
  },
  {
    id: "b3",
    slug: "first-kaggle-competition",
    title: "Our First Kaggle Competition: What Went Right and Wrong",
    excerpt:
      "A honest post-mortem of the ML panel's first team Kaggle submission — top 20% finish with lessons for next time.",
    content: `Three members of the ML panel entered our first Kaggle competition last month. We placed in the top 20% — not bad for a first attempt, but we made plenty of mistakes along the way.

## What the Competition Was
A tabular data classification problem — predicting customer churn for a telecom company. Standard enough that we could focus on learning the workflow rather than fighting novel problem types.

## What Went Right
- We started with a simple baseline (logistic regression) and iterated from there
- Feature engineering made the biggest difference — not model complexity
- We split the work: one person on EDA, one on feature engineering, one on model tuning

## What Went Wrong
- We spent too long on hyperparameter tuning instead of feature engineering
- We didn't set up proper cross-validation until week 2 (of 3)
- We overfitted to the public leaderboard and dropped 50 positions on the private one

## Lessons
1. Feature engineering > model complexity, every time
2. Set up proper validation from day one
3. Don't chase the public leaderboard

We're entering another competition next month — this time with a proper workflow from the start.`,
    author: "Mehedi Hasan",
    authorImage: "/images/team/mehedi.jpg",
    date: "2025-07-28",
    readTime: 5,
    tags: ["machine-learning", "kaggle", "data-science", "post-mortem"],
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function mapBackendBlog(b: any): BlogPost {
  return {
    id: b._id || b.id,
    slug: b.slug || b._id || b.id,
    title: b.title,
    excerpt: b.excerpt || b.summary || (b.content ? b.content.slice(0, 140) + "..." : ""),
    content: b.content || "",
    author: b.author?.fullName || b.authorName || "Club Member",
    authorImage: b.author?.imageUrl || "/images/team/mehedi.jpg",
    date: b.createdAt ? new Date(b.createdAt).toISOString().split("T")[0] : "2025-08-01",
    readTime: b.readTime || 4,
    tags: b.tags || [],
    image: b.coverImageUrl || b.image || "/images/blog/default.jpg",
    featured: !!b.featured,
  };
}

export async function getBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/blogs`, { next: { revalidate: 30 } });
    if (res.ok) {
      const data = await res.json();
      const backendBlogs: any[] = data.data || data.blogs || [];
      if (backendBlogs && backendBlogs.length > 0) {
        return [...backendBlogs.map(mapBackendBlog), ...blogPosts];
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend blogs, using static blog posts:", err);
  }
  return blogPosts;
}

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((p) => p.featured);
}
