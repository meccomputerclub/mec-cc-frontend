import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Mockup3() {
  return (
    <div className="min-h-screen p-4 flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex justify-between items-center mb-8 pb-4 border-b border-border-default">
        <Link href="/" className="text-text-secondary hover:text-accent-primary font-medium transition-colors">← Back to Main</Link>
        <span className="text-text-primary font-semibold font-mono">Concept 3: Floating Node Graph</span>
      </div>

      <section className="min-h-[80vh] flex items-center justify-center relative">
        
        {/* Abstract Node Network */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* SVG for connecting lines */}
          <svg className="w-full h-full absolute inset-0 opacity-20">
            <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="30%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="70%" y1="75%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="150" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>

          {/* Floating Nodes */}
          <div className="absolute top-[20%] left-[20%] w-20 h-20 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center font-bold text-sm text-text-primary shadow-lg animate-bounce">CP</div>
          <div className="absolute top-[30%] right-[20%] w-20 h-20 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center font-bold text-sm text-text-primary shadow-lg animate-pulse">Web</div>
          <div className="absolute bottom-[20%] left-[30%] w-20 h-20 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center font-bold text-sm text-text-primary shadow-lg animate-bounce">AI</div>
          <div className="absolute bottom-[25%] right-[30%] w-20 h-20 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center font-bold text-sm text-text-primary shadow-lg animate-pulse">Cyber</div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-center bg-surface-elevated/90 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-border-brutalist dark:border-border-default max-w-[600px] shadow-[6px_6px_0px_var(--accent-primary)]">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4 text-text-primary">
            Connect. Compete.<br/>
            <span className="text-accent-primary">Create.</span>
          </h1>
          <p className="text-lg text-text-secondary mb-6">
            MEC Computer Club — Where 70+ students build the future.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="border border-accent-primary">Join the Network</Button>
          </div>
        </div>

      </section>
    </div>
  );
}
