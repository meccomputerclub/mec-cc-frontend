import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Mockup1() {
  return (
    <div className="min-h-screen p-4 flex flex-col">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-default">
        <Link href="/" className="text-text-secondary hover:text-accent-primary font-medium transition-colors">← Back to Main</Link>
        <span className="text-text-primary font-semibold font-mono">Concept 1: Bento Dashboard</span>
      </div>

      <section className="max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto md:auto-rows-[240px]">
          
          {/* Main Content Block */}
          <div className="md:col-span-8 md:row-span-2 flex flex-col justify-center bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-3xl p-8 transition-all hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-none mb-4 text-text-primary">
              Weekly CP practice,<br/>
              real projects,<br/>
              <span className="text-accent-primary">one club.</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-[500px] mb-6 leading-relaxed">
              MEC Computer Club is where students compete in ICPC, build production software, and grow as developers.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button size="lg">Apply to join</Button>
              <Button variant="secondary" size="lg">Upcoming events</Button>
            </div>
          </div>

          {/* Terminal Block */}
          <div className="md:col-span-4 md:row-span-2 flex flex-col bg-[#0D0F0A] text-white border border-border-brutalist rounded-3xl overflow-hidden transition-all hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="bg-[#1a1c15] p-3 px-4 flex items-center border-b border-white/10">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="mx-auto font-mono text-xs text-zinc-400">bash</span>
            </div>
            <div className="p-4 font-mono text-sm leading-relaxed flex-1">
              <p><span className="text-accent-primary font-semibold">~/mec-cc$</span> npm run build</p>
              <p className="text-zinc-500">Compiling...</p>
              <p className="text-emerald-400">✓ 6 Projects shipped to production</p>
              <p className="text-emerald-400">✓ 3 Teams qualified for ICPC Regionals</p>
              <p><span className="text-accent-primary font-semibold">~/mec-cc$</span> <span className="inline-block w-2 h-4 bg-white align-middle animate-pulse" /></p>
            </div>
          </div>

          {/* Stat Block 1 */}
          <div className="md:col-span-4 md:row-span-1 flex flex-col justify-center items-center text-center bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-3xl p-8 transition-all hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="text-5xl font-bold text-text-primary leading-none mb-2">70+</div>
            <div className="text-text-secondary font-medium">Active Members</div>
          </div>

          {/* Stat Block 2 */}
          <div className="md:col-span-4 md:row-span-1 flex flex-col justify-center items-center text-center bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-3xl p-8 transition-all hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="text-5xl font-bold text-text-primary leading-none mb-2">2,000+</div>
            <div className="text-text-secondary font-medium">Problems Solved</div>
          </div>

          {/* Abstract Vibe Block */}
          <div className="md:col-span-4 md:row-span-1 relative flex flex-col justify-center items-center bg-surface-secondary border border-border-brutalist dark:border-border-default rounded-3xl p-8 overflow-hidden transition-all hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
            <div className="w-24 h-24 rounded-full bg-accent-primary opacity-80 animate-pulse relative z-10" />
            <div className="absolute w-36 h-36 bg-accent-primary filter blur-2xl opacity-40 z-0" />
            <span className="absolute bottom-4 font-mono text-sm text-text-primary font-bold z-20">4 Departments</span>
          </div>

        </div>
      </section>
    </div>
  );
}
