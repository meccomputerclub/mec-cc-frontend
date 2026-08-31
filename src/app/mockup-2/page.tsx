import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Mockup2() {
  return (
    <div className="min-h-screen p-4 flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex justify-between items-center mb-8 pb-4 border-b border-border-default">
        <Link href="/" className="text-text-secondary hover:text-accent-primary font-medium transition-colors">← Back to Main</Link>
        <span className="text-text-primary font-semibold font-mono">Concept 2: Interactive Code Canvas</span>
      </div>

      <section className="min-h-[80vh] flex flex-col justify-center relative">
        
        {/* Background Marquee Code */}
        <div className="absolute top-0 -left-[10vw] w-[120vw] h-full z-0 flex flex-col justify-around opacity-5 pointer-events-none -rotate-6 scale-125 overflow-hidden select-none">
          <div className="flex whitespace-nowrap font-mono text-5xl md:text-7xl font-bold text-text-primary gap-8 animate-pulse">
            <span>{`import { algorithm } from 'icpc'; const team = new Developers(); team.ship(production);`}</span>
            <span>{`import { algorithm } from 'icpc'; const team = new Developers(); team.ship(production);`}</span>
          </div>
          <div className="flex whitespace-nowrap font-mono text-5xl md:text-7xl font-bold text-text-primary gap-8 animate-pulse">
            <span>{`sudo apt-get install skills && while(true) { compete(); learn(); build(); }`}</span>
            <span>{`sudo apt-get install skills && while(true) { compete(); learn(); build(); }`}</span>
          </div>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black leading-[0.9] tracking-tight mb-8 flex flex-col select-none group">
            <span className="text-transparent [-webkit-text-stroke:1px_var(--text-tertiary)] group-hover:[-webkit-text-stroke:1px_var(--text-secondary)] transition-all">BUILD</span>
            <span className="text-transparent [-webkit-text-stroke:2px_var(--accent-primary)] group-hover:text-accent-primary group-hover:[-webkit-text-stroke:0] group-hover:scale-105 transition-all duration-300">SOMETHING</span>
            <span className="text-transparent [-webkit-text-stroke:1px_var(--text-tertiary)] group-hover:[-webkit-text-stroke:1px_var(--text-secondary)] transition-all">REAL.</span>
          </h1>
          
          <div className="max-w-[600px]">
            <p className="text-xl text-text-secondary mb-6">
              Weekly CP practice, real projects, one club.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="rounded-full px-12">Join MEC CC</Button>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
