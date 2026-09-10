export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import EventsFilterView from "./components/EventsFilterView";
import { getUpcomingEvents, getPastEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "Tech Events, Contests & Workshops | MEC Computer Club",
  description:
    "Discover upcoming and past programming contests, cybersecurity CTFs, web workshops, and seminars hosted by MEC Computer Club at Murari Chand College, Sylhet.",
  keywords: [
    "MEC Computer Club events",
    "MEC programming contests",
    "Murari Chand College tech events",
    "Sylhet CTF workshop",
    "MEC hackathon",
    "Sylhet CP contest",
  ],
  alternates: {
    canonical: "https://meccomputerclub.org/events",
  },
  openGraph: {
    title: "Tech Events, Contests & Workshops | MEC Computer Club",
    description:
      "Join competitive programming battles, web bootcamps, and cybersecurity CTFs organized by the MEC Computer Club in Sylhet.",
    url: "https://meccomputerclub.org/events",
    images: ["/mec-club-photo.jpg"],
  },
};

export default async function EventsPage() {
  const upcoming = await getUpcomingEvents();
  const past = await getPastEvents();

  const jsonLdEvents = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": upcoming.slice(0, 10).map((event, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "description": event.description,
        "startDate": event.date && event.date !== "TBA" ? event.date : "2026-09-15T10:00:00+06:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": event.location && event.location !== "TBA" ? event.location : "MEC Campus, Sylhet",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Sylhet",
            "addressCountry": "BD"
          }
        },
        "organizer": {
          "@type": "Organization",
          "name": "MEC Computer Club",
          "url": "https://meccomputerclub.org"
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEvents) }}
      />
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Events</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            System Events &amp; Tech Meetups
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px]">
            Workshops, contests, seminars, and socials — all organized by
            members, for members.
          </p>
        </div>
      </section>

      <EventsFilterView initialUpcoming={upcoming} initialPast={past} />
    </>
  );
}
