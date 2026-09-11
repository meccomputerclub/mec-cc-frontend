import { formatDeptSession } from "@/lib/formatters";
import { groupPeopleByBatch } from "@/lib/batchUtils";

export interface AlumniMember {
  id: string;
  name: string;
  role: string;
  batch?: string;
  session?: string;
  department?: string;
  image?: string;
  imagePosition?: string;
  bio?: string;
  socials?: {
    linkedin?: string;
    github?: string;
    facebook?: string;
    email?: string;
    codeforces?: string;
  };
}

export interface AlumniBatch {
  batchNumber: string;
  year: string;
  members: AlumniMember[];
}

// Static fallback data (shown if API is unreachable)
export const alumniBatches: AlumniBatch[] = [
  {
    batchNumber: "1st Batch",
    year: "2019 – 2023",
    members: [
      {
        id: "a1-1",
        name: "Sabbir Hossain",
        role: "Former President",
        image: "",
        bio: "Founding member of the club. Currently Software Engineer at TechCorp.",
      },
      {
        id: "a1-2",
        name: "Jamil Akter",
        role: "Former CP Lead",
        image: "",
        bio: "Led the first ICPC team from MEC. Now pursuing MSc at University of Texas.",
      },
      {
        id: "a1-3",
        name: "Mashrafe Ahmed",
        role: "Former Web Lead",
        image: "",
        bio: "Architected the original MEC Judge. Frontend Developer at Innovate BD.",
      },
    ],
  },
  {
    batchNumber: "2nd Batch",
    year: "2020 – 2024",
    members: [
      {
        id: "a2-1",
        name: "Sumaiya Islam",
        role: "Former General Secretary",
        image: "",
        bio: "Organized the first intra-university hackathon. SQA Engineer at QualityWorks.",
      },
      {
        id: "a2-2",
        name: "Rafi Rahman",
        role: "Former ML Lead",
        image: "",
        bio: "Started the ML research wing. AI Researcher at NeuroTech.",
      },
    ],
  },
  {
    batchNumber: "3rd Batch",
    year: "2021 – 2025",
    members: [
      {
        id: "a3-1",
        name: "Ayman Sadiq",
        role: "Former Vice President",
        image: "",
        bio: "Competitive Programming coach. Software Engineer at Optimizely.",
      },
      {
        id: "a3-2",
        name: "Nabila Haque",
        role: "Former CyberSec Lead",
        image: "",
        bio: "Established the CTF team. Security Analyst at SecureNet.",
      },
      {
        id: "a3-3",
        name: "Tahmid Hasan",
        role: "Former Web Lead",
        image: "",
        bio: "Full-stack developer. Started the open-source initiative in the club.",
      },
    ],
  },
];

import { API_BASE_URL } from "@/lib/api";

export async function getAlumniMembers(): Promise<AlumniMember[]> {
  const API_URL = API_BASE_URL;
  try {
    const res = await fetch(`${API_URL}/api/users/profile/active`, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      const backendMembers: any[] = data.data || data.members || [];

      // Filter only alumni
      const alumniMembers = backendMembers.filter(
        (m: any) => m.clubRole === "alumni" || m.role === "alumni"
      );

      if (alumniMembers.length > 0) {
        return alumniMembers.map((m: any) => ({
          id: m._id || m.id,
          name: m.fullName,
          role:
            m.designation ||
            m.customRole ||
            (m.role === "alumni" ? "Alumni" : "Club Alumni"),
          batch: m.batch || "",
          session: formatDeptSession(m.department, m.session, m.batch) || "",
          department: m.department || "",
          image: m.imageUrl || "",
          imagePosition: m.imagePosition || "50% 50%",
          bio: m.bio || "",
          socials: {
            linkedin: m.socialLinks?.linkedin || undefined,
            github: m.socialLinks?.github || undefined,
            facebook: m.socialLinks?.facebook || undefined,
            codeforces: m.socialLinks?.codeforces || undefined,
            email: m.email || undefined,
          },
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch alumni from backend, using static fallback:", err);
  }

  return alumniBatches.flatMap((b) =>
    b.members.map((m) => ({
      ...m,
      batch: b.batchNumber,
      session: b.year,
      department: "CSE",
    }))
  );
}

export async function getAlumni(): Promise<AlumniBatch[]> {
  const members = await getAlumniMembers();
  if (members.length > 0) {
    const grouped = groupPeopleByBatch(members);
    return grouped.map((g) => ({
      batchNumber: g.batchNumber,
      year: g.year || "",
      members: g.members.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }
  return alumniBatches;
}
