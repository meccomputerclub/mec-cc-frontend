import { Event } from "@/types";

export const events: Event[] = [
  {
    id: "e-web-hacking-ctf",
    slug: "web-hacking-ctf-essentials",
    title: "Hands-on Web Hacking & CTF Essentials",
    description:
      "MEC Computer Club proudly presents a Hands-on Web Hacking & CTF Essentials course designed to help beginners build a solid foundation in cybersecurity through practical learning.",
    longDescription:
      "Over the course of 3 Days, you'll explore cybersecurity fundamentals, Linux basics, Burp Suite, Docker, the six core CTF categories, and the OWASP Top 10. You'll also gain hands-on experience with real-world web security labs covering XSS, SQL Injection, SSRF, CSRF, RCE, Broken Access Control, and Path Traversal using industry-standard tools and intentionally vulnerable applications.\n\nWhether your goal is CTF Competitions, Bug Bounty, or starting a career in Cybersecurity, this course is the perfect place to begin.",
    date: "2026-08-02",
    endDate: "2026-08-04",
    time: "TBA",
    location: "TBA",
    type: "workshop",
    department: "cybersec",
    image: "/images/events/web-hacking-ctf.jpg",
    speakers: ["Khoka Moni"],
    status: "upcoming",
    registrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLScX1gsfbH8qVhQPeYswODA-YFtXbyh6ltDoYaKqrg92RD53lQ/viewform?usp=send_form",
    attendeeCount: 15,
    tags: ["cybersecurity", "web-hacking", "ctf", "beginner"],
  },
  {
    id: "e-free-fire-lan-2026",
    slug: "free-fire-lan-tournament-2026",
    title: "Free Fire LAN Tournament 2026 (Pre-Registration)",
    description:
      "MEC Computer Club is planning to organize a Free Fire Tournament 2026 with an exciting 25,000 BDT Prize Pool, FREE Registration, and FREE jerseys for the Top 12 finalist teams!",
    longDescription:
      "Before we finalize the tournament, we're collecting responses to estimate the number of interested teams and evaluate the feasibility of the event.\n\n⚠️ Important: This is NOT the final tournament registration. Filling out this form does not guarantee participation or reserve a slot. It is only a pre-registration survey to help us plan the event.\n\n📋 Tournament Highlights:\n🎮 Mode: Squad (4 Players)\n💰 Prize Pool: 25,000 BDT\n🆓 Registration Fee: FREE\n👕 Top 12 Finalist Teams receive FREE Jerseys\n👥 Planned Capacity: 24 Teams\n👩‍🎓 Only for students of MEC",
    date: "TBA",
    time: "TBA",
    location: "TBA",
    type: "contest",
    department: "esports",
    image: "/images/events/free-fire.jpg",
    status: "upcoming",
    registrationUrl: "https://forms.gle/9s1ZWsBDap9u8XA19",
    tags: ["esports", "gaming", "free-fire", "tournament"],
  },
  {
    id: "e4",
    slug: "intra-mec-programming-contest-2025",
    title: "Intra-MEC Programming Contest 2025",
    description:
      "The annual intra-university programming contest. Open to all MEC students. Prizes for top 3 individuals and top freshman.",
    date: "2025-08-30",
    time: "2:00 PM - 5:00 PM",
    location: "Computer Lab 1 & 2, CSE Building",
    type: "contest",
    department: "cp",
    image: "/images/events/intra-contest.jpg",
    status: "past",
    attendeeCount: 78,
    tags: ["programming-contest", "competitive-programming", "intra-university"],
  },
  {
    id: "e5",
    slug: "ctf-night-2025",
    title: "Capture The Flag Night",
    description:
      "An overnight CTF competition. Solve security challenges, crack codes, and compete in teams of 2–3.",
    date: "2025-08-15",
    time: "8:00 PM - 8:00 AM",
    location: "Club Room + Online",
    type: "contest",
    department: "cybersec",
    image: "/images/events/ctf-night.jpg",
    status: "past",
    attendeeCount: 30,
    tags: ["ctf", "cybersecurity", "overnight", "team-contest"],
  },
  {
    id: "e6",
    slug: "github-and-open-source-seminar",
    title: "Git, GitHub & Open Source — Getting Started",
    description:
      "A beginner-friendly seminar on version control, GitHub workflows, and how to make your first open source contribution.",
    date: "2025-07-22",
    time: "4:00 PM - 5:30 PM",
    location: "Lab 301, CSE Building",
    type: "seminar",
    department: "webdev",
    image: "/images/events/git-seminar.jpg",
    speakers: ["Nusrat Jahan"],
    status: "past",
    attendeeCount: 55,
    tags: ["git", "github", "open-source", "beginner"],
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function isEventUpcoming(e: any): boolean {
  if (!e) return false;
  const status = (e.status || "").toLowerCase();
  if (status === "completed" || status === "past" || status === "cancelled") {
    return false;
  }
  if (status === "upcoming" || status === "scheduled" || status === "ongoing") {
    return true;
  }
  if (!e.date || e.date === "TBA") return true;
  const d = new Date(e.date);
  if (isNaN(d.getTime())) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

export function isEventPast(e: any): boolean {
  return !isEventUpcoming(e);
}

function mapBackendEvent(e: any): Event {
  const eventDate = e.date ? new Date(e.date) : null;
  const isDateValid = eventDate && !isNaN(eventDate.getTime());
  const isUpcoming = isEventUpcoming(e);

  return {
    id: e._id ? String(e._id) : String(e.id),
    slug: e.slug || (e._id ? String(e._id) : String(e.id)),
    title: e.title,
    description: e.description || "",
    longDescription: e.longDescription || e.description || "",
    date: isDateValid ? eventDate.toISOString().split("T")[0] : (e.date || "TBA"),
    endDate: e.endDate ? new Date(e.endDate).toISOString().split("T")[0] : undefined,
    time: e.eventTime || e.time || "15:00 - 17:00",
    location: e.location || "MEC Campus",
    type: e.category || e.type || "workshop",
    department: e.department || "General",
    image: e.coverImageUrl || e.bannerImageUrl || "/images/events/web-hacking-ctf.jpg",
    speakers: e.organizer ? [e.organizer] : (e.speakers || []),
    status: isUpcoming ? "upcoming" : "past",
    registrationUrl: e.registrationLink || e.registrationUrl || undefined,
    attendeeCount: e.participants?.length ?? (Array.isArray(e.attendees) ? e.attendees.length : (typeof e.attendeeCount === "number" ? e.attendeeCount : 0)),
    tags: e.tags || [],
  };
}

export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${API_URL}/api/events`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const backendEvents: any[] = data.data || data.events || [];
      if (backendEvents && backendEvents.length > 0) {
        const mapped = backendEvents.map(mapBackendEvent);
        const upcoming = mapped.filter(isEventUpcoming);
        if (upcoming.length > 0) return upcoming;
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend events, using static fallback:", err);
  }
  return events.filter(isEventUpcoming);
}

export async function getPastEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${API_URL}/api/events`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const backendEvents: any[] = data.data || data.events || [];
      if (backendEvents && backendEvents.length > 0) {
        const mapped = backendEvents.map(mapBackendEvent);
        const past = mapped.filter(isEventPast);
        if (past.length > 0) return past;
      }
    }
  } catch (err) {
    console.warn("Could not fetch backend events, using static fallback:", err);
  }
  return events.filter(isEventPast);
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  // 1. Try backend lookup first
  try {
    const res = await fetch(`${API_URL}/api/events/${slug}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data) {
        return mapBackendEvent(data.data);
      }
    }
  } catch {
    // Ignore and fallback to static
  }

  // 2. Static list fallback
  const staticFound = events.find((e) => e.slug === slug || e.id === slug);
  if (staticFound) return staticFound;

  return undefined;
}
