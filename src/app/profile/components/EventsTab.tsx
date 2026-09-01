"use client";

import Link from "next/link";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Calendar, MapPin, Clock, ExternalLink, CheckCircle2 } from "lucide-react";
import { isEventUpcoming } from "@/data/events";

interface EventsTabProps {
  user: AuthUser;
  allEvents: any[];
  onRegisterEvent: (eventId: string) => void;
  registeringEventId: string | null;
}

export function EventsTab({
  user,
  allEvents,
  onRegisterEvent,
  registeringEventId,
}: EventsTabProps) {
  const attendedIds = new Set(
    (user.eventsAttended || []).map((e: any) => e._id || e.id || e)
  );

  const upcomingEvents = allEvents.filter(isEventUpcoming);

  const myRegisteredEvents = allEvents.filter((ev) =>
    attendedIds.has(ev._id || ev.id)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* My Registrations */}
      <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">My Event Registrations ({myRegisteredEvents.length})</h2>
            <p className="font-body text-xs text-text-secondary mt-0.5">Events you are currently registered for or have attended.</p>
          </div>
        </div>

        {myRegisteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {myRegisteredEvents.map((ev) => {
              const eventId = ev._id || ev.id;
              const eventDate = ev.date ? new Date(ev.date) : new Date();
              const isValidDate = !isNaN(eventDate.getTime());
              const month = isValidDate
                ? eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
                : "TBA";
              const day = isValidDate ? eventDate.getDate() : "--";
              const type = ev.type || ev.category || "workshop";
              const slug = ev.slug || eventId;

              return (
                <div
                  key={eventId}
                  id={`event-${slug}`}
                  className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-[6px_6px_0px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex flex-col overflow-hidden"
                >
                  <div className="p-4 sm:p-5 flex gap-3.5 sm:gap-4 flex-1">
                    {/* Left Date Column */}
                    <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 bg-accent-primary/10 rounded-lg border border-accent-primary shrink-0 self-start min-w-[54px] text-center">
                      <span className="font-mono text-[10px] font-extrabold uppercase text-accent-primary tracking-wider">{month}</span>
                      <span className="font-heading text-xl sm:text-2xl font-black text-text-primary leading-tight">{day}</span>
                    </div>

                    <div className="w-px bg-border-default shrink-0 self-stretch my-1" />

                    {/* Right Content Column */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="font-mono text-[10px] font-bold text-text-tertiary uppercase">
                          <span className="opacity-70">TYPE:</span> {type.toUpperCase()}
                        </div>
                        <Badge variant="upcoming">
                          REGISTERED
                        </Badge>
                      </div>

                      <h3 className="font-heading text-base sm:text-lg font-extrabold text-text-primary m-0 line-clamp-2 leading-snug">{ev.title}</h3>

                      <div className="flex items-center gap-1.5 text-xs text-text-secondary my-1.5 flex-wrap font-medium">
                        <span className="inline-flex items-center text-text-tertiary">
                          <MapPin size={12} />
                        </span>
                        <span>{ev.location || "MEC Campus"}</span>
                        <span className="text-text-tertiary">&bull;</span>
                        <span className="inline-flex items-center text-text-tertiary">
                          <Clock size={12} />
                        </span>
                        <span>{ev.time || "15:00 - 17:00"}</span>
                      </div>

                      <p className="text-xs text-text-secondary line-clamp-2 m-0 mb-3 leading-relaxed">
                        {ev.description || "Hands-on technical workshop and collaborative session."}
                      </p>

                      <div className="mt-auto pt-2 border-t border-dashed border-border-default flex items-center justify-between">
                        <Link
                          href={`/events/${slug}`}
                          className="font-mono text-xs font-bold uppercase text-text-secondary hover:text-accent-primary transition-colors"
                        >
                          DETAILS →
                        </Link>
                        <div className="font-mono text-xs text-text-primary font-bold">
                          {ev.time || "15:00"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-text-secondary">
            <Calendar size={36} className="mx-auto mb-2 opacity-40 text-accent-primary" />
            <p className="text-sm">You have not registered for any events yet. Check out the upcoming schedule below!</p>
          </div>
        )}
      </div>

      {/* Available Upcoming Events */}
      <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">Available Club Events ({upcomingEvents.length})</h2>
            <p className="font-body text-xs text-text-secondary mt-0.5">Register for hands-on sessions, contests, and technical workshops.</p>
          </div>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {upcomingEvents.map((ev) => {
              const eventId = ev._id || ev.id;
              const isAlreadyRegistered = attendedIds.has(eventId);
              const isRegistering = registeringEventId === eventId;
              const eventDate = ev.date ? new Date(ev.date) : new Date();
              const isValidDate = !isNaN(eventDate.getTime());
              const month = isValidDate
                ? eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
                : "TBA";
              const day = isValidDate ? eventDate.getDate() : "--";
              const isDateUpcoming = isValidDate ? eventDate >= new Date() : true;
              const type = ev.type || ev.category || "workshop";
              const slug = ev.slug || eventId;

              return (
                <div
                  key={eventId}
                  id={`event-${slug}`}
                  className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-[6px_6px_0px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex flex-col overflow-hidden"
                >
                  <div className="p-4 sm:p-5 flex gap-3.5 sm:gap-4 flex-1">
                    {/* Left Date Column */}
                    <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 bg-accent-primary/10 rounded-lg border border-accent-primary shrink-0 self-start min-w-[54px] text-center">
                      <span className="font-mono text-[10px] font-extrabold uppercase text-accent-primary tracking-wider">{month}</span>
                      <span className="font-heading text-xl sm:text-2xl font-black text-text-primary leading-tight">{day}</span>
                    </div>

                    <div className="w-px bg-border-default shrink-0 self-stretch my-1" />

                    {/* Right Content Column */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="font-mono text-[10px] font-bold text-text-tertiary uppercase">
                          <span className="opacity-70">TYPE:</span> {type.toUpperCase()}
                        </div>
                        <Badge variant={isDateUpcoming ? "upcoming" : "past"}>
                          {isDateUpcoming ? "UPCOMING" : "PAST"}
                        </Badge>
                      </div>

                      <h3 className="font-heading text-base sm:text-lg font-extrabold text-text-primary m-0 line-clamp-2 leading-snug">{ev.title}</h3>

                      <div className="flex items-center gap-1.5 text-xs text-text-secondary my-1.5 flex-wrap font-medium">
                        <span className="inline-flex items-center text-text-tertiary">
                          <MapPin size={12} />
                        </span>
                        <span>{ev.location || "MEC Campus"}</span>
                        <span className="text-text-tertiary">&bull;</span>
                        <span className="inline-flex items-center text-text-tertiary">
                          <Clock size={12} />
                        </span>
                        <span>{ev.time || "15:00 - 17:00"}</span>
                      </div>

                      <p className="text-xs text-text-secondary line-clamp-2 m-0 mb-3 leading-relaxed">
                        {ev.description || "Hands-on technical workshop and collaborative session."}
                      </p>

                      <div className="mt-auto pt-2 border-t border-dashed border-border-default flex items-center justify-between gap-2">
                        {isAlreadyRegistered ? (
                          <span className="font-mono text-[11px] font-extrabold text-accent-success inline-flex items-center gap-1">
                            <CheckCircle2 size={13} /> Registered
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            disabled={isRegistering}
                            onClick={() => onRegisterEvent(eventId)}
                            className="h-[30px] px-3 text-xs"
                          >
                            {isRegistering ? "Registering..." : "Register Now"}
                          </Button>
                        )}

                        <Link
                          href={`/events/${slug}`}
                          className="font-mono text-xs font-bold uppercase text-text-secondary hover:text-accent-primary inline-flex items-center gap-1 transition-colors"
                        >
                          <span>DETAILS</span>
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-text-secondary">
            <p className="text-sm">No new scheduled events at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
