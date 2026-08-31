export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EventCard, ProjectCard } from "@/components/ui/Card";
import { departments } from "@/data/departments";
import { getUpcomingEvents, events } from "@/data/events";
import { getFeaturedProjects } from "@/data/projects";
import { testimonials } from "@/data/testimonials";
import { leaderboard } from "@/data/cp";
import { AlgorithmVisualizer } from "@/components/ui/AlgorithmVisualizer";

export const metadata: Metadata = {
  title: "MEC Computer Club — Weekly CP Practice, Real Projects, One Club",
  description:
    "The official computer club of MEC. Competitive programming, web development, ML/AI, cybersecurity — join 70+ members building real things.",
};

export default async function HomePage() {
  const upcomingEvents = await getUpcomingEvents();
  const featuredProjects = getFeaturedProjects();
  const nextEvent = upcomingEvents[0];
  const topCP = leaderboard.slice(0, 3);

  return (
    <div className="w-full overflow-x-hidden">
      {/* ===== 1. HERO — 50ms credibility check (§6.1) ===== */}
      <section className="relative min-h-[calc(100vh-var(--nav-height))] flex items-center overflow-hidden py-[var(--space-8)] max-[1024px]:py-[var(--space-6)] max-[480px]:py-[var(--space-4)]" id="hero">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-transparent" />
          <div className="hidden" />
        </div>
        <div className="container grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[var(--space-7)] items-center relative max-[1024px]:gap-[var(--space-6)]">
          <div className="animate-fade-in-up">
            <h1 className="font-heading font-bold text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.1] my-[var(--space-4)] tracking-[-0.03em] max-[768px]:text-[clamp(1.8rem,6.5vw,2.6rem)] max-[768px]:my-[var(--space-3)] max-[480px]:text-[clamp(1.55rem,7vw,2rem)] max-[480px]:leading-[1.15]">
              Debug your limits.
              <br />
              Build reality.
              <span className="text-accent-primary-hover max-[1024px]:normal-case max-[480px]:block max-[480px]:mt-1"> Welcome to the Club.</span>
            </h1>
            <p className="text-lg text-text-secondary leading-[var(--leading-relaxed)] max-w-[520px] mb-[var(--space-5)] max-[768px]:text-base max-[768px]:max-w-full max-[768px]:mb-[var(--space-4)]">
              MEC Computer Club is where students compete in ICPC, build
              production software, and grow as developers — not just attend
              meetings.
            </p>
            <div className="flex gap-[var(--space-3)] mb-[var(--space-6)] flex-wrap max-[768px]:gap-[var(--space-2)] max-[768px]:mb-[var(--space-4)] max-[480px]:flex-col max-[480px]:w-full">
              <Button href="/join" size="lg" id="hero-join-cta" className="max-[480px]:w-full">
                Become a Member
              </Button>
              <Button href="/contact" variant="secondary" size="lg" id="hero-sponsor-cta" className="max-[480px]:w-full">
                Become a Sponsor
              </Button>
            </div>
            <div className="flex items-center gap-[var(--space-4)] max-[768px]:gap-[var(--space-3)] max-[480px]:grid max-[480px]:grid-cols-3 max-[480px]:gap-2 max-[480px]:w-full max-[480px]:text-center max-[480px]:py-[var(--space-3)] max-[480px]:border-t max-[480px]:border-b max-[480px]:border-border-default max-[480px]:mb-[var(--space-3)]">
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold text-text-primary leading-none max-[480px]:text-xl">70+</span>
                <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mt-1 max-[480px]:text-[9px]">Members</span>
              </div>
              <div className="w-[1px] h-8 bg-border-default max-[480px]:hidden" />
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold text-text-primary leading-none max-[480px]:text-xl">4</span>
                <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mt-1 max-[480px]:text-[9px]">Departments</span>
              </div>
              <div className="w-[1px] h-8 bg-border-default max-[480px]:hidden" />
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold text-text-primary leading-none max-[480px]:text-xl">12+</span>
                <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mt-1 max-[480px]:text-[9px]">Events this year</span>
              </div>
            </div>

            {/* Floating event card — inside text column, flows naturally on mobile */}
            {upcomingEvents.length > 0 && (
              <div className="block mt-[var(--space-5)] p-[4px] bg-[repeating-linear-gradient(45deg,var(--border-brutalist),var(--border-brutalist)_10px,var(--accent-primary)_10px,var(--accent-primary)_20px)] bg-[length:28px_28px] animate-[stripeMove_1s_linear_infinite] rounded-[var(--radius-sm)] shadow-[6px_6px_0px_var(--border-brutalist)] transition-transform duration-200 ease-out w-full max-w-[380px] hover:scale-[1.02] dark:bg-[repeating-linear-gradient(45deg,var(--surface-inverse),var(--surface-inverse)_10px,var(--accent-primary)_10px,var(--accent-primary)_20px)] max-[1024px]:max-w-full max-[1024px]:mb-[var(--space-5)] max-[1024px]:shadow-[4px_4px_0px_var(--border-brutalist)] max-[480px]:shadow-[3px_3px_0px_var(--border-brutalist)]">
                <div className="bg-surface-elevated p-[var(--space-3)] md:p-[var(--space-4)] flex flex-col gap-2 border border-border-brutalist rounded-[2px]">
                  <div className="flex items-center justify-between border-b border-border-brutalist pb-[6px]">
                    <span className="font-mono text-[0.7rem] font-bold uppercase text-text-secondary">
                      Next in queue.
                    </span>
                    <Link href="/events#upcoming" className="font-mono text-[10px] font-extrabold uppercase text-text-secondary no-underline transition-colors duration-150 hover:text-accent-primary-hover">
                      VIEW ALL →
                    </Link>
                  </div>
                  <div className="flex flex-col">
                    {upcomingEvents.slice(0, 2).map((evt, index) => {
                      const eventDate = evt.date ? new Date(evt.date) : null;
                      const isValidDate = eventDate && !isNaN(eventDate.getTime());
                      const month = isValidDate ? eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "TBA";
                      const day = isValidDate ? eventDate.getDate() : "--";

                      return (
                        <Link
                          key={evt.slug || evt.id}
                          href={`/events/${evt.slug}`}
                          className="no-underline py-2 flex items-start gap-[10px]"
                          style={{
                            borderBottom: index !== Math.min(upcomingEvents.length, 2) - 1 ? '1px solid var(--border-default)' : 'none',
                          }}
                        >
                          <div className="flex flex-col items-center justify-center min-w-[42px] p-[3px_4px] bg-surface-secondary border border-border-brutalist rounded-[var(--radius-sm)] font-mono leading-[1.1] flex-shrink-0">
                            <span className="text-[8px] opacity-80 font-bold text-text-secondary">{month}</span>
                            <span className="text-[13px] font-extrabold text-text-primary">{day}</span>
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p className="font-heading text-sm font-bold text-text-primary m-0 leading-snug whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-150 hover:text-accent-primary-hover">
                              {evt.title}
                            </p>
                            <div className="flex items-center gap-[6px] mt-[3px] text-[11px] font-mono text-text-secondary">
                              <span className="uppercase text-accent-primary-hover font-bold text-[10px]">
                                {evt.type?.toUpperCase() || "WORKSHOP"}
                              </span>
                              <span>&bull;</span>
                              <span>{evt.time || "15:00"}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative w-full flex justify-end items-center overflow-hidden max-[1024px]:justify-center">
            <AlgorithmVisualizer />
          </div>
        </div>
      </section>

      {/* ===== 2. MISSION STRIP (§6.2) ===== */}
      <section className="bg-text-primary py-[var(--space-5)]" id="mission">
        <div className="container">
          <p className="font-heading text-[clamp(1.1rem,2.5vw,var(--text-xl))] text-surface-primary text-center leading-snug">
            We don&apos;t just learn about technology —{" "}
            <strong className="text-accent-primary-hover">we compete, we build, we ship.</strong>
          </p>
        </div>
      </section >

      {/* ===== 3. UPCOMING EVENT TEASER (§6.3) ===== */}
      < section className="section" id="upcoming-events" >
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">What&apos;s happening</span>
            <h2>Upcoming Events Queue</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">Never an empty calendar. Here&apos;s what&apos;s next.</p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[var(--gutter)] justify-center max-[768px]:grid-cols-1">
            {(upcomingEvents.length > 0 ? upcomingEvents : events.slice(0, 3)).map(
              (event) => (
                <EventCard key={event.id} {...event} />
              )
            )}
          </div>
          <div className="flex justify-center mt-[var(--space-6)]">
            <Button href="/events" variant="secondary" id="home-all-events">
              View all events →
            </Button>
          </div>
        </div>
      </section >

      {/* ===== 4. DEPARTMENTS (§6.4) ===== */}
      < section className="section bg-surface-secondary" id="departments" >
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">Find your path</span>
            <h2>Choose Your Tech Tree</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">Every member belongs to at least one. Which one fits you?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--gutter)] max-[768px]:gap-[var(--space-3)] stagger-children">
            {departments.map((dept) => (
              <div key={dept.id} className="group w-full bg-surface-elevated border border-border-brutalist rounded-[var(--radius-lg)] p-[var(--space-5)] text-center transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] max-[768px]:p-[var(--space-4)] max-[480px]:p-[var(--space-3)]" id={`dept-${dept.id}`}>
                <h3 className="font-heading text-lg font-bold mb-[var(--space-2)] transition-colors duration-150 group-hover:text-accent-primary">{dept.name}</h3>
                <p className="text-sm text-text-secondary leading-normal">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* ===== 5. CP / ACHIEVEMENTS SNAPSHOT (§6.5) ===== */}
      < section className="section" id="achievements" >
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">Competitive Programming</span>
            <h2>Club Leaderboard</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">Our CP team&apos;s standings — updated, not inflated.</p>
          </div>
          <div className="max-w-[800px] mx-auto max-[768px]:max-w-full">
            <div className="w-full overflow-x-auto [WebkitOverflowScrolling:touch] pb-1">
              <div className="min-w-[520px] bg-surface-elevated border border-border-brutalist rounded-[var(--radius-lg)] overflow-hidden transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] max-[768px]:min-w-[480px] max-[480px]:min-w-[380px]">
                <div className="grid grid-cols-[50px_1.5fr_1.2fr_80px_80px] p-[var(--space-3)_var(--space-4)] bg-surface-secondary font-mono text-xs font-semibold uppercase tracking-wider text-text-tertiary max-[480px]:grid-cols-[40px_1.2fr_1fr_65px_65px] max-[480px]:p-[var(--space-2)_var(--space-3)]">
                  <span>Rank</span>
                  <span>Member</span>
                  <span>Handle</span>
                  <span>Rating</span>
                  <span>Solved</span>
                </div>
                {topCP.map((entry) => (
                  <div key={entry.rank} className="grid grid-cols-[50px_1.5fr_1.2fr_80px_80px] p-[var(--space-3)_var(--space-4)] border-t border-border-default items-center transition-colors duration-150 hover:bg-accent-primary-light max-[480px]:grid-cols-[40px_1.2fr_1fr_65px_65px] max-[480px]:p-[var(--space-2)_var(--space-3)]">
                    <span className="font-mono font-bold text-accent-primary-hover">#{entry.rank}</span>
                    <span className="font-semibold text-text-primary">{entry.name}</span>
                    <span className="font-mono text-sm text-accent-primary-hover">@{entry.handle}</span>
                    <span className="font-mono font-semibold text-text-primary text-right">{entry.rating}</span>
                    <span className="font-mono text-text-secondary text-right">{entry.solved}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-[var(--space-4)]">
              <Button href="/cp-hub/leaderboard" variant="secondary" id="home-cp-hub">
                Full leaderboard →
              </Button>
            </div>
          </div>
        </div>
      </section >

      {/* ===== 6. PROJECTS SHOWCASE (§6.6) ===== */}
      < section className="section bg-surface-secondary" id="projects" >
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">Proof of work</span>
            <h2>Successfully Deployed Projects</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">Not tutorials — real software used by real people.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--gutter)]">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} team={project.team || []} />
            ))}
          </div>
          <div className="flex justify-center mt-[var(--space-6)]">
            <Button href="/projects" variant="secondary" id="home-all-projects">
              View all projects →
            </Button>
          </div>
        </div>
      </section >

      {/* ===== 7. TESTIMONIALS (§6.7) ===== */}
      < section className="section" id="testimonials" >
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">From our members</span>
            <h2>System Logs: Member Feedbacks</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">
              What actual club members say — not &quot;Great club!&quot; quotes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--gutter)] stagger-children">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="group w-full bg-surface-elevated border border-border-brutalist rounded-[var(--radius-lg)] overflow-hidden transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-y-0 cursor-pointer" id={`testimonial-${t.id}`}>
                <div className="p-[var(--space-3)]">
                  <div className="font-heading text-[2.5rem] leading-[0.5] text-text-tertiary mt-[5px] mb-[5px] transition-colors duration-150 group-hover:text-accent-primary">
                    &ldquo;
                  </div>

                  <p className="mt-0 mb-[var(--space-3)] text-[0.9rem] leading-[1.4] text-text-secondary">
                    {t.quote}
                  </p>

                  <div className="flex justify-between items-center pt-[var(--space-2)] border-t border-border-default">
                    <div className="font-mono text-text-xs font-bold uppercase text-text-secondary transition-colors duration-150 group-hover:text-accent-primary">
                      <span className="testimonial__name-label">{t.name}</span> →
                    </div>
                    <div className="flex items-center -space-x-1.5">
                      <div className="w-6 h-6 rounded-sm border border-border-brutalist bg-accent-primary text-[10px] text-accent-primary-text flex items-center justify-center font-mono font-bold uppercase transition-transform duration-150 hover:scale-110 hover:z-10">
                        {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    </div>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section >

      {/* ===== 8. JOIN CTA BAND (§6.8) ===== */}
      < section className="bg-[linear-gradient(135deg,var(--surface-secondary)_0%,var(--surface-primary)_100%)] py-[var(--space-8)] border-t border-border-default max-[480px]:py-[var(--space-6)]" id="join-cta" >
        <div className="container">
          <div className="text-center max-w-[600px] mx-auto">
            <h2 className="text-[clamp(1.8rem,4vw,var(--text-3xl))] text-text-primary mb-[var(--space-3)] max-[768px]:text-[clamp(1.4rem,5vw,1.8rem)] max-[480px]:text-[clamp(1.3rem,6vw,1.6rem)]">Ready to sudo join us?</h2>
            <p className="text-lg text-text-tertiary mb-[var(--space-5)] leading-relaxed max-[768px]:text-base">
              Applications are open. No prerequisites — just bring curiosity and
              consistency.
            </p>
            <div className="flex gap-[var(--space-3)] justify-center flex-wrap max-[480px]:flex-col max-[480px]:w-full">
              <Button href="/join" size="lg" id="cta-band-join" className="max-[480px]:w-full">
                Apply to join
              </Button>
              <Button href="/contact" variant="secondary" size="lg" id="cta-band-contact" className="max-[480px]:w-full">
                Have questions? Contact us →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}