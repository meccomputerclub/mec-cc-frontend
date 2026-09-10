import { Project } from "@/types";
import { getProjectCoverImage, extractProjectRepositories } from "@/lib/projectUtils";

export const projects: Project[] = [
  {
    id: "p1",
    slug: "mec-judge",
    title: "MEC Judge",
    description:
      "An online judge platform built for hosting intra-university programming contests with real-time leaderboards and automated grading.",
    longDescription:
      "MEC Judge is a full-stack online judge system designed specifically for our intra-university contests. It supports multiple languages (C++, Python, Java), real-time submission tracking, automated test-case grading with time/memory limits, and a live leaderboard.\n\nBuilt by the Web Dev panel, it handles 80+ concurrent users during contest time and has processed 2,000+ submissions across 3 contests.",
    department: "webdev",
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Docker", "Redis"],
    image: "/images/projects/mec-judge.jpg",
    team: ["Farhan Ahmed", "Sadia Rahman", "Arif Hossain"],
    liveUrl: "https://judge.meccc.org",
    repoUrl: "https://github.com/mec-cs-club/mec-judge",
    status: "completed",
    featured: true,
    completedDate: "2025-06",
  },
  {
    id: "p2",
    slug: "cp-tracker",
    title: "CP Progress Tracker",
    description:
      "A dashboard that aggregates Codeforces, AtCoder, and LeetCode stats for club members into a unified leaderboard.",
    department: "cp",
    techStack: ["React", "Python", "FastAPI", "Codeforces API"],
    image: "/images/projects/cp-tracker.jpg",
    team: ["Rafi Islam", "Nusrat Jahan", "Tanvir Hasan"],
    repoUrl: "https://github.com/mec-cs-club/cp-tracker",
    status: "in-progress",
    featured: true,
  },
  {
    id: "p3",
    slug: "event-management-system",
    title: "Event Management System",
    description:
      "Internal tool for the exec committee to create events, manage RSVPs, track attendance, and send announcements.",
    department: "webdev",
    techStack: ["Next.js", "Prisma", "PostgreSQL", "Auth.js"],
    image: "/images/projects/event-system.jpg",
    team: ["Tasnim Akter", "Kamal Uddin"],
    status: "in-progress",
    featured: false,
  },
  {
    id: "p4",
    slug: "campus-chatbot",
    title: "Campus Info Chatbot",
    description:
      "An AI-powered chatbot trained on MEC academic data — class schedules, faculty info, and campus services.",
    department: "ml",
    techStack: ["Python", "LangChain", "OpenAI API", "FastAPI", "React"],
    image: "/images/projects/chatbot.jpg",
    team: ["Rafi Islam", "Mehedi Hasan", "Fariha Noor"],
    status: "completed",
    featured: true,
    completedDate: "2025-04",
  },
  {
    id: "p5",
    slug: "network-vulnerability-scanner",
    title: "Network Vulnerability Scanner",
    description:
      "A lightweight scanner that identifies common vulnerabilities in campus network configurations for the IT department.",
    department: "cybersec",
    techStack: ["Python", "Nmap", "Flask", "SQLite"],
    image: "/images/projects/vuln-scanner.jpg",
    team: ["Imran Khan", "Sabrina Akter"],
    repoUrl: "https://github.com/mec-cs-club/vuln-scanner",
    status: "completed",
    completedDate: "2025-03",
  },
  {
    id: "p6",
    slug: "alumni-network",
    title: "Alumni Network Platform",
    description:
      "A platform connecting current members with club alumni for mentorship, job referrals, and knowledge sharing.",
    department: "webdev",
    techStack: ["Next.js", "Supabase", "Tailwind CSS"],
    image: "/images/projects/alumni-network.jpg",
    team: ["Farhan Ahmed", "Nusrat Jahan"],
    status: "in-progress",
  },
];

import { API_BASE_URL } from "@/lib/api";
const API_URL = API_BASE_URL;

function mapBackendProject(p: any): Project {
  const teamMembers = Array.isArray(p.teamMembers)
    ? p.teamMembers.map((m: any) =>
        typeof m === "object" && m ? m.fullName || m.name || "Member" : "Member"
      )
    : Array.isArray(p.team)
    ? p.team
    : p.contributors
    ? p.contributors.map((c: any) => c.fullName || c.name || "Member")
    : ["Club Member"];

  const skills = Array.isArray(p.techStack) && p.techStack.length > 0
    ? p.techStack
    : Array.isArray(p.requiredSkills) && p.requiredSkills.length > 0
    ? p.requiredSkills
    : Array.isArray(p.technologies)
    ? p.technologies
    : ["TypeScript", "React"];

  const repos = extractProjectRepositories(p);
  const coverImage = getProjectCoverImage(p);

  return {
    id: p._id || p.id,
    slug: p.slug || p._id || p.id,
    title: p.title || "Untitled Project",
    description: p.description || "",
    longDescription: p.longDescription || p.description || "",
    department: p.department || "webdev",
    techStack: skills,
    image: coverImage,
    team: teamMembers.length > 0 ? teamMembers : ["Club Member"],
    liveUrl: p.liveDemoLink || p.liveUrl || p.projectUrl || undefined,
    repoUrl: p.githubLink || p.repoUrl || (repos[0]?.url) || undefined,
    repositories: repos,
    githubLinks: p.githubLinks || repos.map((r: any) => r.url),
    status: p.status === "completed" ? "completed" : p.status === "archived" ? "archived" : "in-progress",
    featured: Boolean(p.featured),
    completedDate: p.endDate ? String(p.endDate).slice(0, 7) : p.completedDate,
    createdBy: typeof p.createdBy === "object" ? p.createdBy?._id : p.createdBy,
  };
}

export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_URL}/api/projects`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const backendProjects: any[] = data.data || data.projects || [];
      if (backendProjects && backendProjects.length > 0) {
        return backendProjects.map(mapBackendProject);
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend projects, using static projects:", err);
  }
  return projects;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${API_URL}/api/projects?featured=true`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const backendProjects: any[] = data.data || data.projects || [];
      if (backendProjects && backendProjects.length > 0) {
        return backendProjects.map(mapBackendProject);
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend featured projects, fallback to static:", err);
  }
  return projects.filter((p) => p.featured);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  try {
    const all = await getProjects();
    const found = all.find((p) => p.slug === slug || p.id === slug);
    if (found) return found;
  } catch (err) {
    console.warn("Error looking up project by slug:", err);
  }
  return projects.find((p) => p.slug === slug || p.id === slug);
}

export async function getProjectsByDepartment(dept: string): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.department === dept);
}

