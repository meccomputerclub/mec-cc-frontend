import { formatDeptSession } from "@/lib/formatters";

export interface Member {
  id: string;
  name: string;
  role: string;
  department?: string;
  systemRole?: string;
  batch?: string;
  session?: string;
  image?: string;
  socials?: {
    github?: string;
    linkedin?: string;
  };
}

export const activeMembers: Member[] = [
  {
    id: "mem-1",
    name: "Sakib Al Hasan",
    role: "Senior Developer",
    session: "CSE (21-22)",
    batch: "CSE, 5th",
    image: "",
    socials: {
      github: "#",
    },
  },
  {
    id: "mem-2",
    name: "Nushrat Jahan",
    role: "UI/UX Designer",
    session: "CSE (21-22)",
    batch: "CSE, 5th",
    image: "",
    socials: {
      linkedin: "#",
    },
  },
  {
    id: "mem-3",
    name: "Fahim Faysal",
    role: "Cybersecurity Analyst",
    session: "CSE (21-22)",
    batch: "CSE, 5th",
    image: "",
    socials: {
      github: "#",
      linkedin: "#",
    },
  },
  {
    id: "mem-4",
    name: "Tasnia Rahman",
    role: "Competitive Programmer",
    session: "CSE (21-22)",
    batch: "CSE, 5th",
    image: "",
    socials: {
      github: "#",
    },
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getActiveMembers(): Promise<Member[]> {
  try {
    const res = await fetch(`${API_URL}/api/users/profile/active`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const backendMembers: any[] = data.data || data.members || [];
      const generalMembers = backendMembers.filter((m: any) => {
        // 1. Strictly exclude Advisors
        if (
          m.clubRole === "advisor" ||
          (m.designation && (m.designation.toLowerCase().includes("advisor") || m.designation.toLowerCase().includes("patron"))) ||
          (m.customRole && (m.customRole.toLowerCase().includes("advisor") || m.customRole.toLowerCase().includes("patron")))
        ) {
          return false;
        }

        // 2. Strictly exclude Alumni
        if (m.clubRole === "alumni" || m.role === "alumni") {
          return false;
        }

        // 3. Strictly exclude Executives
        if (m.clubRole === "executive" || m.role === "executive") return false;
        if (
          m.customRole &&
          m.customRole.trim().length > 0 &&
          m.customRole !== "Club Member" &&
          m.customRole !== "General Member" &&
          m.role !== "member"
        ) {
          return false;
        }

        return true;
      });

      if (generalMembers.length > 0) {
        const mapped = generalMembers.map((m: any) => ({
          id: m._id || m.id,
          name: m.fullName,
          role: m.customRole || m.designation || (m.role === "member" ? "Club Member" : m.role),
          systemRole: m.role,
          department: m.department,
          session: formatDeptSession(m.department, m.session, m.batch) || "CSE (21-22)",
          batch: m.batch || `${m.department || "CSE"}`,
          image: m.imageUrl || "",
          socials: {
            github: m.socialLinks?.github || undefined,
            linkedin: m.socialLinks?.linkedin || undefined,
          },
        }));
        return mapped;
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend members, using static members:", err);
  }
  return activeMembers;
}
