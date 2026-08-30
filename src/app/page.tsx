export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EventCard, ProjectCard } from "@/components/ui/Card";
import { departments } from "@/data/departments";
import { getUpcomingEvents, events } from "@/data/events";
import { getFeaturedProjects } from "@/data/projects";
import { testimonials } from "@/data/testimonials";
import { leaderboard } from "@/data/cp";
import { AlgorithmVisualizer } from "@/components/ui/AlgorithmVisualizer";
import "./page.css";

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
    <>
      {/* ===== 1. HERO — 50ms credibility check (§6.1) ===== */}
      <section className="hero" id="hero">
        <div className="hero__bg">
          <div className="hero__gradient" />
          <div className="hero__pattern" />
        </div>
        <div className="container hero__content">
          <div className="hero__text">
            <h1 className="hero__title">
              Debug your limits.
              <br />
              Build reality.
              <span className="hero__accent"> Welcome to the Club.</span>
            </h1>
            <p className="hero__subtitle">
              MEC Computer Club is where students compete in ICPC, build
              production software, and grow as developers — not just attend
              meetings.
            </p>
            <div className="hero__actions">
              <Button href="/join" size="lg" id="hero-join-cta">
                Become a Member
              </Button>
              <Button href="/contact" variant="secondary" size="lg" id="hero-sponsor-cta">
                Become a Sponsor
              </Button>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-value">70+</span>
                <span className="hero__stat-label">Members</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-value">4</span>
                <span className="hero__stat-label">Departments</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-value">12+</span>
                <span className="hero__stat-label">Events this year</span>
              </div>
            </div>
          </div>
          
          {upcomingEvents.length > 0 && (
            <div className="hero__floating-event-border" style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 30, width: '100%', maxWidth: '340px', borderRadius: 'var(--radius-sm)' }}>
              <div className="hero__floating-event-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-brutalist)', paddingBottom: '6px' }}>
                  <span className="hero__floating-event-label">
                    Next in queue.
                  </span>
                  <Link href="/events#upcoming" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    VIEW ALL →
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {upcomingEvents.slice(0, 2).map((evt, index) => {
                    const eventDate = evt.date ? new Date(evt.date) : null;
                    const isValidDate = eventDate && !isNaN(eventDate.getTime());
                    const month = isValidDate ? eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "TBA";
                    const day = isValidDate ? eventDate.getDate() : "--";

                    return (
                      <Link
                        key={evt.slug || evt.id}
                        href={`/events/${evt.slug}`}
                        style={{
                          textDecoration: 'none',
                          padding: '8px 0',
                          borderBottom: index !== Math.min(upcomingEvents.length, 2) - 1 ? '1px solid var(--border-default)' : 'none',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '42px',
                          padding: '3px 4px',
                          background: 'var(--surface-secondary)',
                          border: '1px solid var(--border-brutalist)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '9px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 'bold',
                          color: 'var(--text-primary)',
                          lineHeight: '1.1',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '8px', opacity: 0.8 }}>{month}</span>
                          <span style={{ fontSize: '13px', fontWeight: 800 }}>{day}</span>
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p className="hero__floating-event-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {evt.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                            <span style={{ textTransform: 'uppercase', color: 'var(--accent-primary-hover)', fontWeight: 700, fontSize: '10px' }}>
                              {evt.type?.toUpperCase() || "WORKSHOP"}
                            </span>
                            <span>&bull;</span>
                            <span style={{ fontSize: '10px' }}>{evt.time || "15:00"}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <div className="hero__visual">
            <AlgorithmVisualizer />
          </div>
        </div>
      </section>

      {/* ===== 2. MISSION STRIP (§6.2) ===== */}
      <section className="mission-strip" id="mission">
        <div className="container">
          <p className="mission-strip__text">
            We don&apos;t just learn about technology —{" "}
            <strong>we compete, we build, we ship.</strong>
          </p>
        </div>
      </section>

      {/* ===== 3. UPCOMING EVENT TEASER (§6.3) ===== */}
      <section className="section" id="upcoming-events">
        <div className="container">
          <div className="section-header">
            <span className="kicker">What&apos;s happening</span>
            <h2>Upcoming Events Queue</h2>
            <p>Never an empty calendar. Here&apos;s what&apos;s next.</p>
          </div>
          <div className="home-events-grid">
            {(upcomingEvents.length > 0 ? upcomingEvents : events.slice(0, 3)).map(
              (event) => (
                <EventCard key={event.id} {...event} />
              )
            )}
          </div>
          <div className="section-cta">
            <Button href="/events" variant="secondary" id="home-all-events">
              View all events →
            </Button>
          </div>
        </div>
      </section>

      {/* ===== 4. DEPARTMENTS (§6.4) ===== */}
      <section className="section section--alt" id="departments">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Find your path</span>
            <h2>Choose Your Tech Tree</h2>
            <p>Every member belongs to at least one. Which one fits you?</p>
          </div>
          <div className="departments-grid stagger-children">
            {departments.map((dept) => (
              <div key={dept.id} className="dept-card" id={`dept-${dept.id}`}>
                <h3 className="dept-card__name">{dept.name}</h3>
                <p className="dept-card__desc">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. CP / ACHIEVEMENTS SNAPSHOT (§6.5) ===== */}
      <section className="section" id="achievements">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Competitive Programming</span>
            <h2>Club Leaderboard</h2>
            <p>Our CP team&apos;s standings — updated, not inflated.</p>
          </div>
          <div className="cp-snapshot">
            <div className="cp-snapshot__leaderboard">
              <div className="cp-snapshot__header">
                <span>Rank</span>
                <span>Member</span>
                <span>Handle</span>
                <span>Rating</span>
                <span>Solved</span>
              </div>
              {topCP.map((entry) => (
                <div key={entry.rank} className="cp-snapshot__row">
                  <span className="cp-snapshot__rank">#{entry.rank}</span>
                  <span className="cp-snapshot__name">{entry.name}</span>
                  <span className="cp-snapshot__handle">@{entry.handle}</span>
                  <span className="cp-snapshot__rating">{entry.rating}</span>
                  <span className="cp-snapshot__solved">{entry.solved}</span>
                </div>
              ))}
            </div>
            <div className="cp-snapshot__cta">
              <Button href="/cp-hub/leaderboard" variant="secondary" id="home-cp-hub">
                Full leaderboard →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6. PROJECTS SHOWCASE (§6.6) ===== */}
      <section className="section section--alt" id="projects">
        <div className="container">
          <div className="section-header">
            <span className="kicker">Proof of work</span>
            <h2>Successfully Deployed Projects</h2>
            <p>Not tutorials — real software used by real people.</p>
          </div>
          <div className="grid grid--3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} team={project.team || []} />
            ))}
          </div>
          <div className="section-cta">
            <Button href="/projects" variant="secondary" id="home-all-projects">
              View all projects →
            </Button>
          </div>
        </div>
      </section>

      {/* ===== 7. TESTIMONIALS (§6.7) ===== */}
      <section className="section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="kicker">From our members</span>
            <h2>System Logs: Member Feedbacks</h2>
            <p>
              What actual club members say — not &quot;Great club!&quot; quotes.
            </p>
          </div>
          <div className="grid grid--3 testimonials-grid stagger-children">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="card card--project card--hoverable testimonial" id={`testimonial-${t.id}`}>
                <div className="card__content" style={{ padding: 'var(--space-3)' }}>
                  <div className="testimonial__quote-mark">
                    &ldquo;
                  </div>
                  
                  <p className="testimonial__quote-text" style={{ marginTop: '0', marginBottom: 'var(--space-3)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {t.quote}
                  </p>

                  <div className="card__footer card__footer--spaced testimonial__footer" style={{ paddingTop: 'var(--space-2)' }}>
                    <div className="testimonial__name-wrap" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}>
                      <span className="testimonial__name-label">{t.name}</span> →
                    </div>
                    <div className="avatar-group">
                      <div className="avatar">
                        {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    </div>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. JOIN CTA BAND (§6.8) ===== */}
      <section className="cta-band" id="join-cta">
        <div className="container">
          <div className="cta-band__content">
            <h2 className="cta-band__title">Ready to sudo join us?</h2>
            <p className="cta-band__subtitle">
              Applications are open. No prerequisites — just bring curiosity and
              consistency.
            </p>
            <div className="cta-band__actions">
              <Button href="/join" size="lg" id="cta-band-join">
                Apply to join
              </Button>
              <Button href="/contact" variant="secondary" size="lg" id="cta-band-contact">
                Have questions? Contact us →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
