import Link from "next/link";
import { Event } from "@/types";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";

interface HeroEventQueueProps {
  events: Event[];
}

export function HeroEventQueue({ events }: HeroEventQueueProps) {
  const displayEvents = events.slice(0, 3);

  return (
    <div className="w-full max-w-[460px] bg-surface-elevated border-2 border-border-brutalist rounded-2xl shadow-[8px_8px_0px_var(--accent-primary)] overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-surface-secondary border-b border-border-default">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-extrabold tracking-wider uppercase text-text-primary">
            Upcoming Events Queue
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold py-0.5 px-2 bg-accent-primary-light text-accent-primary-text border border-accent-primary/20 rounded uppercase">
          Live Schedule
        </span>
      </div>

      {/* Events List */}
      <div className="divide-y divide-border-default/60">
        {displayEvents.length > 0 ? (
          displayEvents.map((evt) => {
            const eventDate = evt.date ? new Date(evt.date) : null;
            const isValidDate = eventDate && !isNaN(eventDate.getTime());
            const month = isValidDate
              ? eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
              : "TBA";
            const day = isValidDate ? eventDate.getDate() : "--";

            return (
              <Link
                key={evt.slug || evt.id}
                href={`/events/${evt.slug}`}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-secondary/60 group no-underline"
              >
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center min-w-[50px] py-2 px-2 rounded-lg bg-surface-secondary border border-border-brutalist font-mono leading-none flex-shrink-0 group-hover:border-accent-primary transition-colors">
                  <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
                    {month}
                  </span>
                  <span className="text-xl font-extrabold text-text-primary group-hover:text-accent-primary-hover transition-colors">
                    {day}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] font-bold uppercase py-0.5 px-1.5 rounded bg-surface-secondary text-accent-primary-hover border border-border-default">
                      {evt.type || "WORKSHOP"}
                    </span>
                    <span className="text-xs text-text-tertiary font-mono flex items-center gap-1">
                      <Clock size={11} /> {evt.time || "15:00"}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-text-primary leading-snug truncate group-hover:text-accent-primary-hover transition-colors">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5 font-mono">
                    <MapPin size={11} className="flex-shrink-0 opacity-70" />
                    <span className="truncate">{evt.location || "MEC CSE Lab"}</span>
                  </p>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-lg border border-border-default bg-surface-secondary flex items-center justify-center text-text-secondary group-hover:text-text-primary group-hover:border-accent-primary flex-shrink-0 transition-colors">
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-6 text-center text-sm text-text-secondary font-mono">
            No upcoming events scheduled right now. Check back soon!
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div className="px-5 py-3 bg-surface-secondary border-t border-border-default flex items-center justify-between">
        <span className="font-mono text-xs text-text-tertiary">
          Open to all MEC students
        </span>
        <Link
          href="/events"
          className="font-mono text-xs font-bold text-accent-primary-hover hover:underline inline-flex items-center gap-1"
        >
          FULL SCHEDULE <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
