import type { Metadata } from "next";
import { departments } from "@/data/departments";

export const metadata: Metadata = {
  title: "About | whoami",
  description:
    "Learn about MEC Computer Club — our mission, departments, and the team behind it all.",
};

const historyMilestones = [
  {
    year: "2019",
    title: "Founded",
    description: "Started as a CP study group with 12 members and a shared Google Sheet.",
  },
  {
    year: "2020",
    title: "First ICPC participation",
    description: "Sent our first team to ICPC Asia Dhaka Regional. Didn't place, but learned everything.",
  },
  {
    year: "2022",
    title: "Expanded to 4 departments",
    description: "Added Web Dev, ML/AI, and Cybersecurity panels. Membership grew to 40+.",
  },
  {
    year: "2024",
    title: "Built MEC Judge",
    description: "Launched our own online judge platform. 80+ students used it in the first contest.",
  },
  {
    year: "2025",
    title: "70+ members, 3 ICPC teams",
    description: "Largest year yet. Shipping projects, running workshops, and sending 3 teams to ICPC.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Mission Hero */}
      <section className="pt-10 md:pt-14 pb-8 md:pb-12">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">About us</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary mb-4">
            Hello World! Meet the Club
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary leading-relaxed max-w-[700px] mb-4">
            MEC Computer Club exists to give students a structured path from
            &quot;I&apos;m interested in CS&quot; to &quot;I&apos;ve shipped real projects, competed
            at ICPC, and have something concrete to show for it.&quot;
          </p>
          <p className="text-base text-text-tertiary leading-relaxed max-w-[700px]">
            Founded in 2019, the club started as a small competitive programming
            group. Today, 70+ members work across specialized departments — Competitive
            Programming, Web Development, Machine Learning, and Cybersecurity.
            We run weekly practice sessions, build internal tools, host contests,
            and send teams to national and regional competitions.
          </p>
        </div>
      </section>

      {/* Departments */}
      <section className="py-12 md:py-16 bg-surface-secondary" id="departments">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-10">
            <span className="kicker">Departments</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Your Core Functions &amp; Tasks
            </h2>
            <p className="text-base sm:text-lg text-text-tertiary">
              Each department runs its own activities, projects, and learning tracks.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="group flex-1 basis-[320px] max-w-[500px] flex flex-col bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-6 transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-[2px] hover:-translate-y-[2px]"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-surface-secondary rounded-xl mb-4 border border-border-brutalist dark:border-border-default font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold text-text-primary transition-all duration-200 group-hover:bg-accent-primary group-hover:text-text-inverse group-hover:border-accent-primary group-hover:scale-110 group-hover:-rotate-6">
                  {dept.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-2 transition-colors duration-150 group-hover:text-accent-primary">
                    {dept.name}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-text-secondary mb-4">
                    {dept.description}
                  </p>
                </div>
                {dept.memberCount && (
                  <div className="mt-auto pt-4 border-t border-dashed border-border-default">
                    <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-accent-primary-hover uppercase font-bold tracking-wider">
                      {dept.memberCount}+ Active Members
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-12 md:py-16">
        <div className="container max-w-[var(--max-width-narrow)] mx-auto px-4 md:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-10">
            <span className="kicker">History</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-3">
              Our Version History (How it started)
            </h2>
          </div>

          <div className="relative pl-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border-default">
            {historyMilestones.map((item, idx) => (
              <div key={idx} className="relative pb-8 last:pb-0 pl-4">
                <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-accent-secondary border-2 border-surface-primary z-10" />
                <div>
                  <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-accent-primary-hover font-bold uppercase tracking-wider block mb-1">
                    {item.year}
                  </span>
                  <h4 className="text-lg font-bold text-text-primary my-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
