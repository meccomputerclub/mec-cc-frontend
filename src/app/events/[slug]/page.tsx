export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { events, getEventBySlug } from "@/data/events";
import { EventRegisterButton } from "./EventRegisterButton";

export async function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventDetailPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { success } = await searchParams;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="py-12 md:py-16">
      <div className="container max-w-[var(--max-width-narrow)] mx-auto px-4 md:px-8">
        <div className="mb-8">
          {success === "true" && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-accent-success rounded-lg text-emerald-800 dark:text-emerald-300 text-center text-sm">
              <strong>Registration Successful!</strong> We&apos;ve received your registration for this event.
            </div>
          )}
          <Badge variant={event.status === "upcoming" ? "upcoming" : "past"} size="md">
            {event.status}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary my-3">
            {event.title}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-surface-secondary rounded-xl border border-border-default mb-6">
            <div className="flex flex-col gap-1">
              <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-tertiary uppercase tracking-wider font-semibold">Date</span>
              <span className="font-semibold text-text-primary text-sm">{formattedDate}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-tertiary uppercase tracking-wider font-semibold">Time</span>
              <span className="font-semibold text-text-primary text-sm">{event.time}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-tertiary uppercase tracking-wider font-semibold">Location</span>
              <span className="font-semibold text-text-primary text-sm">{event.location}</span>
            </div>
            {event.attendeeCount && (
              <div className="flex flex-col gap-1">
                <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-tertiary uppercase tracking-wider font-semibold">Attendees</span>
                <span className="font-semibold text-text-primary text-sm">{event.attendeeCount}</span>
              </div>
            )}
          </div>
          {event.status === "upcoming" && (
            <EventRegisterButton eventId={event.id} externalUrl={event.registrationUrl} />
          )}
        </div>

        <div className="text-base leading-relaxed text-text-secondary">
          <p className="mb-6 whitespace-pre-line">{event.longDescription || event.description}</p>
          {event.speakers && event.speakers.length > 0 && (
            <div className="mt-6 p-5 bg-surface-secondary rounded-xl border border-border-default">
              <h3 className="text-lg font-bold text-text-primary mb-3">Speakers / Teams</h3>
              <ul className="list-none p-0 m-0 flex flex-col divide-y divide-border-default">
                {event.speakers.map((s) => (
                  <li key={s} className="py-2.5 font-medium text-text-primary">{s}</li>
                ))}
              </ul>
            </div>
          )}
          {event.tags && (
            <div className="flex flex-wrap gap-2 mt-6">
              {event.tags.map((tag) => (
                <span key={tag} className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs py-1 px-3 bg-surface-secondary border border-border-default rounded-full text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-border-default">
          <Button href="/events" variant="ghost">
            ← Back to all events
          </Button>
        </div>
      </div>
    </article>
  );
}
