export interface Partner {
  name: string;
  type: string;
  desc: string;
  logoPlaceholder: string;
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
        const mapped = backendSponsors.map((s: any) => ({
          name: s.name,
          type: s.tier || "Partner",
          desc: s.description || "Official partner of MEC Computer Club.",
          logoPlaceholder: s.name.slice(0, 2).toUpperCase(),
        }));
        return [...mapped, ...partners];
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend sponsors, using static partners:", err);
  }
  return partners;
}
