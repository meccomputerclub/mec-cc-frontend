export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { events, getEventBySlug } from "@/data/events";
import { EventRegisterButton } from "./EventRegisterButton";
import { EventParticipationClaim } from "./EventParticipationClaim";
import { EventMediaGallery } from "./EventMediaGallery";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Gift,
  Building2,
  FileText,
  CheckCircle2,
  Gamepad2,
  Share2,
  ShieldCheck,
  Award,
} from "lucide-react";

export async function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} | MEC Computer Club`,
    description: event.description,
  };
}

export default async function EventDetailPage({
  params,
  searchParams,
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

  const isTeam = event.registrationType === "team" || event.type === "gaming";

  return (
    <article className="py-10 md:py-16">
      <div className="container max-w-[var(--max-width)] mx-auto px-4 md:px-8 space-y-12">
        {/* Success Alert if routed back */}
        {success === "true" && (
          <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500 rounded-xl text-emerald-700 dark:text-emerald-300 text-center text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            <span>Registration Successful! Your entry has been submitted for approval.</span>
          </div>
        )}

        {/* ── 1. Hero Header Banner ── */}
        <div className="relative rounded-2xl border-2 border-border-brutalist bg-surface-elevated overflow-hidden shadow-[6px_6px_0px_var(--border-brutalist)]">
          {event.image && (
            <div className="relative w-full h-48 sm:h-72 md:h-80 bg-surface-secondary overflow-hidden border-b-2 border-border-brutalist">
              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge variant={event.status === "upcoming" ? "upcoming" : "past"} size="md">
                  {event.status}
                </Badge>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-surface-elevated text-text-primary border border-border-default shadow-sm">
                  {event.type}
                </span>
                {isTeam && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-indigo-600 text-white shadow-sm flex items-center gap-1">
                    <Gamepad2 size={13} /> Squad Mode
                  </span>
                )}
              </div>

              {event.prizePool && (
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-sm sm:text-base shadow-[3px_3px_0px_#000]">
                  <Trophy size={18} />
                  <span>Prize Pool: {event.prizePool}</span>
                </div>
              )}
            </div>
          )}

          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-4 leading-tight">
              {event.title}
            </h1>

            {/* Quick Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-surface-secondary rounded-xl border border-border-default mb-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-text-tertiary uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Calendar size={13} className="text-accent-primary" /> Date
                </span>
                <span className="font-semibold text-text-primary text-sm">{formattedDate}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-text-tertiary uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Clock size={13} className="text-accent-primary" /> Time
                </span>
                <span className="font-semibold text-text-primary text-sm">{event.time}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-text-tertiary uppercase tracking-wider font-semibold flex items-center gap-1">
                  <MapPin size={13} className="text-accent-primary" /> Location
                </span>
                <span className="font-semibold text-text-primary text-sm truncate">{event.location}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs text-text-tertiary uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Users size={13} className="text-accent-primary" /> Format
                </span>
                <span className="font-semibold text-text-primary text-sm">
                  {isTeam ? `Team (${event.teamSize?.max || 4} Players)` : "Individual Entry"}
                </span>
              </div>
            </div>

            {/* Registration CTA Area */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-default">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-secondary">
                  Entry Fee:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {event.registrationFee ? `${event.registrationFee} BDT` : "FREE Entry"}
                  </strong>
                </span>
                {event.registrationDeadline && (
                  <>
                    <span className="text-text-tertiary">&bull;</span>
                    <span className="font-mono text-xs text-text-secondary">
                      Deadline: <strong>{event.registrationDeadline}</strong>
                    </span>
                  </>
                )}
              </div>

              {event.status === "upcoming" ? (
                <EventRegisterButton event={event} />
              ) : (
                <EventParticipationClaim event={event} />
              )}
            </div>
          </div>
        </div>

        {/* ── 2. Two-Column Details & Schedule ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className="p-6 sm:p-8 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <FileText size={20} className="text-accent-primary" /> About this Event
              </h2>
              <div className="text-base leading-relaxed text-text-secondary whitespace-pre-line space-y-4">
                {event.longDescription || event.description}
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-border-default">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs py-1 px-3 bg-surface-secondary border border-border-default rounded-full text-text-secondary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Rewards & Prizes Section */}
            {((event.rewards && event.rewards.length > 0) || event.prizePool) && (
              <div className="p-6 sm:p-8 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" /> Rewards &amp; Prize Pool
                  </h2>
                  {event.prizePool && (
                    <span className="font-mono font-extrabold text-xs px-3 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full">
                      Total: {event.prizePool}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {event.rewards && event.rewards.length > 0 ? (
                    event.rewards.map((r, i) => (
                      <div
                        key={i}
                        className={`p-5 rounded-xl border-2 text-center transition-all ${
                          i === 0
                            ? "bg-amber-500/10 border-amber-500 shadow-[3px_3px_0px_#F59E0B]"
                            : i === 1
                            ? "bg-slate-200/50 dark:bg-slate-800/50 border-slate-400 shadow-[3px_3px_0px_#94A3B8]"
                            : "bg-orange-500/10 border-orange-400 shadow-[3px_3px_0px_#FB923C]"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-black bg-surface-elevated shadow-sm">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                        </div>
                        <h3 className="font-bold text-sm text-text-primary mb-1">{r.position}</h3>
                        <p className="font-mono text-base font-extrabold text-accent-primary">{r.prize}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 p-5 rounded-xl bg-surface-secondary border border-border-default text-center">
                      <Gift size={28} className="text-accent-primary mx-auto mb-2" />
                      <p className="font-bold text-text-primary text-base">Prize Pool: {event.prizePool}</p>
                      <p className="text-xs text-text-secondary mt-1">
                        Exciting cash prizes, certificates, and trophies for top qualifying teams!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Schedule Timeline */}
            {event.schedule && event.schedule.length > 0 && (
              <div className="p-6 sm:p-8 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
                <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-accent-primary" /> Tournament Schedule
                </h2>
                <div className="relative border-l-2 border-border-brutalist ml-3 sm:ml-4 space-y-6">
                  {event.schedule.map((item, idx) => (
                    <div key={idx} className="relative pl-6 sm:pl-8">
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-accent-primary border-2 border-border-brutalist" />
                      <span className="inline-block px-2 py-0.5 rounded bg-surface-secondary text-text-secondary font-mono text-xs font-bold mb-1 border border-border-default">
                        {item.time}
                      </span>
                      <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom HTML Section (if present) */}
            {event.customHtmlSection && (
              <div className="p-6 sm:p-8 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
                <h2 className="text-xl font-bold text-text-primary mb-4">Event Updates &amp; Highlights</h2>
                <div
                  className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: event.customHtmlSection }}
                />
              </div>
            )}

            {/* Event Media Gallery (Photos & Videos) */}
            {event.media && event.media.length > 0 && (
              <EventMediaGallery media={event.media} eventTitle={event.title} />
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Event Contributors & Organizing Team */}
            {event.contributors && event.contributors.length > 0 && (
              <div className="p-6 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Users size={18} className="text-accent-primary" /> Contributors &amp; Team
                </h2>
                <div className="space-y-3">
                  {event.contributors.map((contrib, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-surface-secondary rounded-xl border border-border-default flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-bold text-xs text-accent-primary flex-shrink-0">
                        {contrib.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-text-primary truncate">{contrib.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-block text-[11px] font-bold text-accent-primary">
                            {contrib.role}
                          </span>
                          {contrib.department && (
                            <>
                              <span className="text-text-tertiary text-[10px]">&bull;</span>
                              <span className="text-[11px] text-text-secondary truncate">
                                {contrib.department}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules Card */}
            {event.rules && event.rules.length > 0 ? (
              <div className="p-6 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-accent-primary" /> Rules &amp; Guidelines
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-text-secondary">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-6 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
                <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-accent-primary" /> Guidelines
                </h2>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Open to all registered MEC students.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Fair play and sportsmanship are strictly enforced.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>Bring institutional student ID on event day.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Event Sponsors & Partners */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div className="p-6 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-accent-primary" /> Sponsors &amp; Partners
                </h2>
                <div className="space-y-3">
                  {event.sponsors.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-surface-secondary rounded-xl border border-border-default flex items-center gap-3"
                    >
                      {s.logoUrl ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-border-default flex-shrink-0">
                          <Image src={s.logoUrl} alt={s.sponsorName} fill className="object-contain p-1" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border-default flex items-center justify-center font-bold text-xs text-text-secondary">
                          {s.sponsorName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-text-primary truncate">{s.sponsorName}</p>
                        <span className="inline-block text-[10px] font-mono uppercase font-bold text-accent-primary">
                          {s.tier || "Partner"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Notice */}
            <div className="p-5 bg-surface-secondary rounded-2xl border border-border-default text-xs text-text-secondary space-y-2">
              <div className="flex items-center gap-2 text-text-primary font-bold">
                <Award size={16} className="text-accent-primary" /> Verified Credentials
              </div>
              <p>
                All approved attendees and podium finishers receive official, verifiable digital certificates from MEC Computer Club.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-6 border-t border-border-default">
          <Button href="/events" variant="ghost">
            ← Back to all events
          </Button>
        </div>
      </div>
    </article>
  );
}

