export interface Advisor {
  id: string;
  name: string;
  role: string;
  academicPost?: string;
  department?: string;
  image: string;
  imagePosition?: string;
  bio?: string;
  socials?: {
    linkedin?: string;
    github?: string;
    email?: string;
    facebook?: string;
  };
}

export const staticAdvisors: Advisor[] = [
  {
    id: "adv-1",
    name: "Dr. Abu Sayed",
    role: "Chief Advisor",
    academicPost: "Head of CSE Department",
    department: "CSE",
    image: "",
    bio: "Head of CSE Department. Passionate about algorithms and data structures.",
    socials: {
      linkedin: "#",
    },
  },
  {
    id: "adv-2",
    name: "Prof. Farhana Haque",
    role: "Technical Advisor",
    academicPost: "Professor, Dept. of CSE",
    department: "CSE",
    image: "",
    bio: "Specializes in Artificial Intelligence and Machine Learning research.",
    socials: {
      linkedin: "#",
      github: "#",
    },
  },
  {
    id: "adv-3",
    name: "Dr. Rakib Hasan",
    role: "Faculty Advisor",
    academicPost: "Associate Professor, Dept. of CSE",
    department: "CSE",
    image: "",
    bio: "Expert in Cyber Security and Software Engineering principles.",
    socials: {
      linkedin: "#",
    },
  },
];

export const advisors = staticAdvisors;

export async function getAdvisors(): Promise<Advisor[]> {
  const API_URL =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";
  try {
    // 1. Fetch active designations to build order precedence map
    const orderMap: Record<string, number> = {};
    try {
      const desigRes = await fetch(`${API_URL}/api/designations?category=advisor`, { next: { revalidate: 60 } });
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
    const res = await fetch(`${API_URL}/api/users/profile/active`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const backendMembers: any[] = data.data || data.members || [];
      const advisorMembers = backendMembers.filter((m: any) => {
        if (m.clubRole === "advisor") return true;
        if (m.clubRole && m.clubRole !== "advisor") return false;
        if (m.designation && (m.designation.toLowerCase().includes("advisor") || m.designation.toLowerCase().includes("patron"))) return true;
        if (m.customRole && (m.customRole.toLowerCase().includes("advisor") || m.customRole.toLowerCase().includes("patron"))) return true;
        return false;
      });

      if (advisorMembers.length > 0) {
        const mapped: Advisor[] = advisorMembers.map((m: any) => ({
          id: m._id || m.id,
          name: m.fullName,
          role: m.designation || m.customRole || "Faculty Advisor",
          academicPost: m.session && m.session !== "Faculty" ? m.session : (m.department ? `Dept. of ${m.department}` : "Faculty"),
          department: m.department || "CSE",
          image: m.imageUrl || "",
          imagePosition: m.imagePosition || "50% 50%",
          bio: m.bio || undefined,
          socials: {
            linkedin: m.socialLinks?.linkedin || undefined,
            github: m.socialLinks?.github || undefined,
            email: m.email || undefined,
            facebook: m.socialLinks?.facebook || undefined,
          },
        }));

        // Sort by precedence rank
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
    console.warn("Could not fetch backend advisors, using static fallback:", err);
  }

  return staticAdvisors;
}
