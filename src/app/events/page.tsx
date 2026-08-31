export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { EventCard } from "@/components/ui/Card";
import { getUpcomingEvents, getPastEvents } from "@/data/events";

export const metadata: Metadata = {
  title: "Events | Execution Queue",
  description: "Upcoming and past events — workshops, contests, seminars, and more from MEC Computer Club.",
};

export default async function EventsPage() {
  const upcoming = await getUpcomingEvents();
  const past = await getPastEvents();

  return (
    <>
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

      {/* Upcoming */}
      <section className="py-8 md:py-12" id="upcoming">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-5">
            Next in Queue
          </h2>
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-surface-secondary rounded-xl text-text-tertiary">
              <p>No upcoming events right now — check back soon or browse past events below.</p>
            </div>
          )}
        </div>
      </section>

      {/* Past */}
      <section className="py-8 md:py-12 bg-surface-secondary/50" id="past">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-5">
            Successfully Executed (Past Events)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-90 hover:opacity-100 transition-opacity">
            {past.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
