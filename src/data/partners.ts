export interface Partner {
  id?: string;
  name: string;
  type: string;
  desc: string;
  logoPlaceholder: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}

export const partners: Partner[] = [
  { 
    name: "TechCorp Inc.", 
    type: "Title Sponsor", 
    desc: "Supported our flagship hackathon and provided cloud credits.",
    logoPlaceholder: "TC"
  },
  { 
    name: "DevAcademy", 
    type: "Learning Partner", 
    desc: "Provides premium courses for our competitive programming panel.",
    logoPlaceholder: "DA"
  },
  { 
    name: "Local Software Solutions", 
    type: "Event Sponsor", 
    desc: "Sponsored prizes for the intra-university programming contest.",
    logoPlaceholder: "LSS"
  },
  {
    name: "Innovate BD",
    type: "Platinum Partner",
    desc: "Provides mentorship and recruitment drives for fresh graduates.",
    logoPlaceholder: "IBD"
  },
  {
    name: "CloudForge",
    type: "Technology Partner",
    desc: "Official hosting and cloud infrastructure provider.",
    logoPlaceholder: "CF"
  }
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function getPartners(): Promise<Partner[]> {
  try {
    const res = await fetch(`${API_URL}/api/sponsors`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      const backendSponsors: any[] = data.data || data.sponsors || [];
      if (backendSponsors && backendSponsors.length > 0) {
        const mapped: Partner[] = backendSponsors.map((s: any) => {
          let displayType = s.tier || "";
          if (!displayType) {
            if (s.contributionType === "service") displayType = "Service Partner";
            else if (s.contributionType === "in_kind") displayType = "Event Partner";
            else if (s.contributionType === "monetary") displayType = "Official Sponsor";
            else displayType = "Partner";
          }

          return {
            id: String(s._id || s.id),
            name: s.name,
            type: displayType,
            desc: s.notes || s.description || "Official partner of MEC Computer Club.",
            logoPlaceholder: (s.name || "SP").slice(0, 2).toUpperCase(),
            logoUrl: s.logoUrl || undefined,
            website: s.website || undefined,
            isActive: s.isActive !== false,
          };
        });

        // Backend sponsors first, followed by static fallback partners
        return [...mapped, ...partners];
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend sponsors, using static partners:", err);
  }
  return partners;
}
