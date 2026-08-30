import { formatDeptSession } from "@/lib/formatters";

export interface Executive {
  id: string;
  name: string;
  role: string;
  department?: string;
  systemRole?: string;
  batch?: string;
  session?: string;
  image: string;
  bio?: string;
  socials?: {
    linkedin?: string;
    github?: string;
    email?: string;
    facebook?: string;
    codeforces?: string;
  };
}

/* ============================================================
   MEC Computer Club — Executive Committee (Term 2025–26)
   Source: MEC-CC/25-26/01 (13-10-2025) &
           MEC-CC/25-26/03 (09-04-2026)
   ============================================================ */

export const executives: Executive[] = [

  /* ── Core Officers (MEC-CC/25-26/01) ── */
  {
    id: "exec-president",
    name: "Faisal Ahmed",
    role: "President",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-vice-president",
    name: "Abdullah Bin Ziad",
    role: "Vice President",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-general-secretary",
    name: "Hossain Bin Sayeed",
    role: "General Secretary",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-joint-secretary",
    name: "Md Shazid Al Hasan",
    role: "Joint Secretary",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-organizing-secretary",
    name: "Estiak Ahammed",
    role: "Organizing Secretary",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-creative-media",
    name: "Tawhid Ahmmmed",
    role: "Creative & Media Executive",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-event-coordinator",
    name: "Dween Mohammad",
    role: "Event Co-Ordinator",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-finance-secretary",
    name: "Md. Nasir Ahmed",
    role: "Finance Secretary",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-resource-logistics",
    name: "Abdullah Zubayer Talukder",
    role: "Resource & Logistics Manager",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-public-relations",
    name: "MD Robiullah",
    role: "Public Relations Executive",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-web-admin",
    name: "Asadullah Islam Joy",
    role: "Web Administrator",
    batch: "CSE, 5th",
    image: "",
  },

  /* ── Assigned Responsibilities (MEC-CC/25-26/03) ── */
  {
    id: "exec-hardware-systems",
    name: "Abdullah Al Shafi",
    role: "Hardware & Systems Coordinator",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-it-infrastructure",
    name: "Sadid Abrar",
    role: "IT & Infrastructure Lead",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-cybersec",
    name: "Khokamoni",
    role: "Cyber Security Coordinator",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-operations",
    name: "Abir Hossain",
    role: "Operations Coordinator",
    batch: "CSE, 5th",
    image: "",
  },

  /* ── Executive Members (MEC-CC/25-26/01) ── */
  {
    id: "exec-member-fahim",
    name: "Md. Fahim Hossain Abir",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-akram",
    name: "Akram Hossen",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-shahriyar",
    name: "Md Shahriyar Ahammed Joy",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-maisha",
    name: "Maisha Mubashshira",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-sayeem",
    name: "Sayeem Shahriar Sami",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },

  /* ── Executive Members (MEC-CC/25-26/03) ── */
  {
    id: "exec-member-fida",
    name: "Fida Zaman",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-tamim",
    name: "Md. Tamim Khan",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-johana",
    name: "Johana Hossain",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-muaz",
    name: "Abdullah Al Muaz",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-rajdeep",
    name: "Rajdeep Mondal Rudra",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-sadia",
    name: "Sadia Islam",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
  {
    id: "exec-member-joyanta",
    name: "Joyanta Kumar Roy",
    role: "Executive Member",
    batch: "CSE, 5th",
    image: "",
  },
];

export const staticExecutives = executives;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getExecutives(): Promise<Executive[]> {
  try {
    // 1. Fetch active designations to build order precedence map
    const orderMap: Record<string, number> = {};
    try {
      const desigRes = await fetch(`${API_URL}/api/designations?category=executive`, { cache: "no-store" });
      if (desigRes.ok) {
        const desigData = await desigRes.json();
        const list = desigData.data || [];
        list.forEach((d: any) => {
          if (d.title) {
            orderMap[d.title.toLowerCase().trim()] = d.order ?? 999;
          }
        });
      }
    } catch {
      // ignore
    }

    // 2. Fetch active approved members from DB
    const res = await fetch(`${API_URL}/api/users/profile/active`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const backendMembers: any[] = data.data || data.members || [];
      const execs = backendMembers.filter((m: any) => {
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

        // 3. Include only if clubRole === "executive", role === "executive", or has executive designation
        if (m.clubRole === "executive") return true;
        if (m.clubRole && m.clubRole !== "executive") return false;
        if (m.role === "executive") return true;
        if (
          m.customRole &&
          m.customRole.trim().length > 0 &&
          m.customRole !== "Club Member" &&
          m.customRole !== "General Member" &&
          m.role !== "member"
        ) {
          return true;
        }
        return false;
      });
      if (execs.length > 0) {
        const mapped: Executive[] = execs.map((m: any) => ({
          id: m._id || m.id,
          name: m.fullName,
          role:
            m.designation ||
            m.customRole ||
            (m.role === "admin"
              ? "Administrator"
              : m.role === "moderator"
              ? "Moderator"
              : "Executive Member"),
          systemRole: m.role,
          department: m.department,
          session: formatDeptSession(m.department, m.session, m.batch) || "CSE (21-22)",
          image: m.imageUrl || "",
          socials: {
            github: m.socialLinks?.github || undefined,
            linkedin: m.socialLinks?.linkedin || undefined,
            facebook: m.socialLinks?.facebook || undefined,
            codeforces: m.socialLinks?.codeforces || undefined,
            email: m.email || undefined,
          },
        }));

        // Sort by precedence rank order
        mapped.sort((a, b) => {
          const rankA = orderMap[a.role.toLowerCase().trim()] ?? 999;
          const rankB = orderMap[b.role.toLowerCase().trim()] ?? 999;
          if (rankA !== rankB) return rankA - rankB;
          return a.name.localeCompare(b.name);
        });

        return mapped;
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend executives, using static fallback:", err);
  }
  return executives;
}
