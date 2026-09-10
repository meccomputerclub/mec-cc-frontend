export const revalidate = 60;
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EventCard, ProjectCard } from "@/components/ui/Card";
import { departments } from "@/data/departments";
import { getUpcomingEvents, getHomeEvents } from "@/data/events";
import { getFeaturedProjects } from "@/data/projects";
import { getFeaturedBlogs } from "@/data/blog";
import { getClubLeaderboard } from "@/data/cp";
import { getHomeGalleryItems } from "@/data/gallery";
import { getPartners } from "@/data/partners";
import { getPageContent } from "@/lib/pageContent";
import { HeroEventQueue } from "@/components/home/HeroEventQueue";
import { HomeGallery } from "@/components/home/HomeGallery";
import { HomeSponsors } from "@/components/home/HomeSponsors";
import { HomeBlogs } from "@/components/home/HomeBlogs";
import { AboutContactGlimpse } from "@/components/home/AboutContactGlimpse";

export const metadata: Metadata = {
  title: "MEC Computer Club — Weekly CP Practice, Real Projects, One Club",
  description:
    "The official computer club of MEC. Competitive programming, web development, ML/AI, cybersecurity — join 70+ members building real things.",
};

export default async function HomePage() {
  const [upcomingEvents, homeEvents, galleryItems, sponsors, leaderboardData, homeContent, featuredProjects, featuredBlogs] = await Promise.all([
    getUpcomingEvents(),
    getHomeEvents(5),
    getHomeGalleryItems(5),
    getPartners(),
    getClubLeaderboard(),
    getPageContent("home"),
    getFeaturedProjects(),
    getFeaturedBlogs(),
  ]);

  const topCP = leaderboardData.slice(0, 5);

  const heroTitle = homeContent?.hero?.title || "Debug your limits.\nBuild reality.";
  const heroHighlight = homeContent?.hero?.highlightText || "Welcome to the Club.";
  const heroDesc =
    homeContent?.hero?.description ||
    "MEC Computer Club is where students compete in ICPC, build production software, and grow as developers — not just attend meetings.";
  const heroCtaText = homeContent?.hero?.ctaText || "Become a Member";
  const heroCtaLink = homeContent?.hero?.ctaLink || "/join";
  const announcement = homeContent?.announcement;

  return (
    <div className="w-full overflow-x-hidden">
      {/* ===== 1. HERO SECTION ===== */}
      <section
        className="relative min-h-[calc(100vh-var(--nav-height))] flex flex-col justify-center overflow-hidden py-[var(--space-8)] max-[1024px]:py-[var(--space-6)] max-[480px]:py-[var(--space-4)]"
        id="hero"
      >
        {announcement?.enabled && announcement?.text && (
          <div className="container mb-4">
            <Link
              href={announcement.link || "/events"}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent-primary/40 bg-accent-primary/10 text-xs sm:text-sm font-semibold text-accent-primary hover:bg-accent-primary/20 transition-all"
            >
              <span className="px-2 py-0.5 rounded-full bg-accent-primary text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                {announcement.badge || "Notice"}
              </span>
              <span>{announcement.text}</span>
              <span className="text-xs">→</span>
            </Link>
          </div>
        )}

        <div className="container grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[var(--space-7)] items-center relative max-[1024px]:gap-[var(--space-6)]">
          <div className="animate-fade-in-up">
            <h1 className="font-heading font-bold text-[clamp(2.2rem,5vw,3.75rem)] leading-[1.1] my-[var(--space-4)] tracking-[-0.03em] max-[768px]:text-[clamp(1.8rem,6.5vw,2.6rem)] max-[768px]:my-[var(--space-3)] max-[480px]:text-[clamp(1.55rem,7vw,2rem)] max-[480px]:leading-[1.15] whitespace-pre-line">
              {heroTitle}
              <span className="text-accent-primary-hover max-[1024px]:normal-case max-[480px]:block max-[480px]:mt-1">
                {" "}{heroHighlight}
              </span>
            </h1>
            <p className="text-lg text-text-secondary leading-[var(--leading-relaxed)] max-w-[520px] mb-[var(--space-5)] max-[768px]:text-base max-[768px]:max-w-full max-[768px]:mb-[var(--space-4)]">
              {heroDesc}
            </p>
            <div className="flex gap-[var(--space-3)] mb-[var(--space-6)] flex-wrap max-[768px]:gap-[var(--space-2)] max-[768px]:mb-[var(--space-4)] max-[480px]:flex-col max-[480px]:w-full">
              <Button href={heroCtaLink} size="lg" id="hero-join-cta" className="max-[480px]:w-full">
                {heroCtaText}
              </Button>
              <Button href="/collaborate/sponsor" variant="secondary" size="lg" id="hero-sponsor-cta" className="max-[480px]:w-full">
                Become a Sponsor
              </Button>
            </div>
            <div className="flex items-center gap-[var(--space-4)] max-[768px]:gap-[var(--space-3)] max-[480px]:grid max-[480px]:grid-cols-3 max-[480px]:gap-2 max-[480px]:w-full max-[480px]:text-center max-[480px]:py-[var(--space-3)] max-[480px]:border-t max-[480px]:border-b max-[480px]:border-border-default">
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold text-text-primary leading-none max-[480px]:text-xl">70+</span>
                <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mt-1 max-[480px]:text-[9px]">Members</span>
              </div>
              <div className="w-[1px] h-8 bg-border-default max-[480px]:hidden" />
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold text-text-primary leading-none max-[480px]:text-xl">5</span>
                <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mt-1 max-[480px]:text-[9px]">Departments</span>
              </div>
              <div className="w-[1px] h-8 bg-border-default max-[480px]:hidden" />
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-bold text-text-primary leading-none max-[480px]:text-xl">12+</span>
                <span className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mt-1 max-[480px]:text-[9px]">Events this year</span>
              </div>
            </div>
          </div>

          {/* Right Column: Upcoming Events Queue Widget replacing bubble sort animation */}
          <div className="relative w-full flex justify-end items-center max-[1024px]:justify-center">
            <HeroEventQueue events={upcomingEvents.length > 0 ? upcomingEvents : homeEvents} />
          </div>
        </div>
      </section>

      {/* ===== 2. MISSION STRIP ===== */}
      <section className="bg-text-primary py-[var(--space-5)]" id="mission">
        <div className="container">
          <p className="font-heading text-[clamp(1.1rem,2.5vw,var(--text-xl))] text-surface-primary text-center leading-snug">
            We don&apos;t just learn about technology —{" "}
            <strong className="text-accent-primary-hover">we compete, we build, we ship.</strong>
          </p>
        </div>
      </section>

      {/* ===== 3. UPCOMING EVENTS SECTION (Max 5, 3+2 Centered Desktop) ===== */}
      <section className="section" id="upcoming-events">
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">What&apos;s happening</span>
            <h2>Upcoming Events Queue</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">
              Never an empty calendar. Here&apos;s what&apos;s on the horizon.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {homeEvents.map((event) => (
              <div
                key={event.id}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[420px] flex"
              >
                <EventCard {...event} />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-[var(--space-6)]">
            <Button href="/events" variant="secondary" id="home-all-events">
              View all events →
            </Button>
          </div>
        </div>
      </section>

      {/* ===== 4. GALLERY SECTION (5 Photos/Videos, 3+2 Centered) ===== */}
      <HomeGallery items={galleryItems} />

      {/* ===== 5. SPONSORS SECTION ===== */}
      <HomeSponsors sponsors={sponsors} />

      {/* ===== 6. FIND YOUR PATH (5 Department Cards, 3+2 Centered) ===== */}
      <section className="section bg-surface-secondary" id="departments">
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">Find your path</span>
            <h2>Choose Your Tech Tree</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">
              Every member belongs to at least one. Which track fits your ambition?
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 stagger-children">
            {departments.slice(0, 5).map((dept) => {
              const deptLink =
                dept.id === "cp"
                  ? "/cp-hub"
                  : dept.id === "webdev" || dept.id === "ml"
                  ? "/projects"
                  : dept.id === "cybersec"
                  ? "/events?category=cybersec"
                  : dept.id === "gaming"
                  ? "/events?category=gaming"
                  : "/events";

              const eventCountText =
                dept.id === "cp"
                  ? "8+ EVENTS"
                  : dept.id === "webdev"
                  ? "5+ EVENTS"
                  : "3+ EVENTS";

              return (
                <Link
                  key={dept.id}
                  href={deptLink}
                  className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-[420px] flex no-underline text-inherit group"
                  id={`dept-${dept.id}`}
                >
                  <div className="w-full flex flex-col justify-between bg-surface-elevated border border-border-brutalist rounded-[var(--radius-lg)] p-6 text-center transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                    <div>
                      <div className="font-mono text-xs font-bold text-accent-primary-hover mb-2 uppercase tracking-widest">
                        {dept.icon}
                      </div>
                      <h3 className="font-heading text-xl font-bold mb-2 transition-colors duration-150 group-hover:text-accent-primary">
                        {dept.name}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {dept.description}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-border-default flex items-center justify-between text-xs font-mono text-text-tertiary">
                      <span className="font-bold text-text-secondary">{eventCountText}</span>
                      <span className="text-accent-primary font-bold group-hover:translate-x-1 transition-transform">
                        EXPLORE →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 7. CP / ACHIEVEMENTS SNAPSHOT ===== */}
      <section className="section" id="achievements">
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">Competitive Programming</span>
            <h2>Club Leaderboard</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">
              Our CP team&apos;s standings — updated, not inflated.
            </p>
          </div>
          <div className="max-w-[850px] mx-auto max-[768px]:max-w-full">
            <div className="w-full overflow-x-auto [WebkitOverflowScrolling:touch] pb-1">
              <div className="min-w-[560px] bg-surface-elevated border border-border-brutalist rounded-[var(--radius-lg)] overflow-hidden transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] max-[768px]:min-w-[500px] max-[480px]:min-w-[420px]">
                <div className="grid grid-cols-[55px_1.6fr_1.1fr_85px_75px] p-[var(--space-3)_var(--space-4)] bg-surface-secondary font-mono text-xs font-semibold uppercase tracking-wider text-text-tertiary max-[480px]:grid-cols-[45px_1.4fr_1fr_75px_65px] max-[480px]:p-[var(--space-2)_var(--space-3)]">
                  <span>Rank</span>
                  <span>Member</span>
                  <span>Handle</span>
                  <span className="text-right">Rating</span>
                  <span className="text-right">Solved</span>
                </div>
                {topCP.map((entry) => {
                  const avatarSrc =
                    entry.imageUrl ||
                    entry.avatar ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(entry.name)}&backgroundColor=transparent`;
                  const isTop1 = entry.rank === 1;
                  const isTop2 = entry.rank === 2;
                  const isTop3 = entry.rank === 3;

                  return (
                    <div
                      key={entry.userId || entry.handle || entry.rank}
                      className={`grid grid-cols-[55px_1.6fr_1.1fr_85px_75px] p-[var(--space-3)_var(--space-4)] border-t border-border-default items-center transition-colors duration-150 hover:bg-accent-primary-light/20 max-[480px]:grid-cols-[45px_1.4fr_1fr_75px_65px] max-[480px]:p-[var(--space-2)_var(--space-3)] ${
                        isTop1
                          ? "border-l-4 border-l-amber-400 bg-amber-400/5"
                          : isTop2
                          ? "border-l-4 border-l-slate-400 bg-slate-400/5"
                          : isTop3
                          ? "border-l-4 border-l-amber-600 bg-amber-600/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1 font-mono font-bold">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-400 text-black text-xs font-black shadow-xs">
                            #1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-300 dark:bg-slate-700 text-text-primary text-xs font-black shadow-xs">
                            #2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-amber-700/20 text-amber-600 dark:text-amber-400 text-xs font-black shadow-xs">
                            #3
                          </span>
                        ) : (
                          <span className="text-text-tertiary">#{entry.rank}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border-default bg-surface-secondary">
                          <img
                            src={avatarSrc}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 truncate">
                          {entry.profileUrl ? (
                            <Link
                              href={entry.profileUrl}
                              className="font-semibold text-text-primary hover:text-accent-primary-hover transition-colors truncate block text-sm sm:text-base"
                            >
                              {entry.name}
                            </Link>
                          ) : (
                            <span className="font-semibold text-text-primary truncate block text-sm sm:text-base">
                              {entry.name}
                            </span>
                          )}
                          {entry.designation && (
                            <span className="text-[11px] text-text-tertiary truncate block leading-tight">
                              {entry.designation}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 pr-2">
                        {entry.hasCfHandle ? (
                          <a
                            href={`https://codeforces.com/profile/${entry.handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs sm:text-sm text-accent-primary-hover hover:underline truncate block"
                            title={`Codeforces profile: ${entry.handle}`}
                          >
                            @{entry.handle}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-text-tertiary truncate block">
                            {entry.handle}
                          </span>
                        )}
                        {entry.tier && entry.tier !== "unrated" && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-accent-primary-hover">
                            {entry.tier}
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-mono font-semibold text-right ${
                          entry.rating > 0 ? "text-accent-primary font-bold" : "text-text-tertiary"
                        }`}
                      >
                        {entry.rating > 0 ? entry.rating : "—"}
                      </span>

                      <span className="font-mono text-text-secondary text-right">
                        {entry.solved > 0 ? entry.solved : 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center mt-[var(--space-4)]">
              <Button href="/cp-hub/leaderboard" variant="secondary" id="home-cp-hub">
                Full leaderboard →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8. PROJECTS SHOWCASE ===== */}
      <section className="section bg-surface-secondary" id="projects">
        <div className="container">
          <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
            <span className="kicker">Proof of work</span>
            <h2>Successfully Deployed Projects</h2>
            <p className="text-lg text-text-tertiary max-[768px]:text-base">
              Not tutorials — real software used by real people.
            </p>
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
      </section>

      {/* ===== 8.1 FEATURED BLOGS SECTION (Max 3) ===== */}
      <HomeBlogs blogs={featuredBlogs} />

      {/* ===== 9. ABOUT & CONTACT GLIMPSE ===== */}
      <AboutContactGlimpse contactData={homeContent?.contact} />

      {/* ===== 11. JOIN CTA BAND ===== */}
      <section
        className="bg-[linear-gradient(135deg,var(--surface-secondary)_0%,var(--surface-primary)_100%)] py-[var(--space-8)] border-t border-border-default max-[480px]:py-[var(--space-6)]"
        id="join-cta"
      >
        <div className="container">
          <div className="text-center max-w-[600px] mx-auto">
            <h2 className="text-[clamp(1.8rem,4vw,var(--text-3xl))] text-text-primary mb-[var(--space-3)] max-[768px]:text-[clamp(1.4rem,5vw,1.8rem)] max-[480px]:text-[clamp(1.3rem,6vw,1.6rem)]">
              Ready to sudo join us?
            </h2>
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