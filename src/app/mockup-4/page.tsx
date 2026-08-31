"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState, useRef } from "react";

// Helper for draggable windows
function DraggableWindow({ title, initialX, initialY, zIndex, setZIndex, children }: any) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setZIndex();
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="absolute w-[340px] sm:w-[450px] bg-surface-elevated/95 backdrop-blur-xl border border-border-brutalist dark:border-border-default rounded-2xl overflow-hidden flex flex-col shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] transition-shadow hover:shadow-[6px_6px_0px_var(--accent-primary)]"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, zIndex }}
      onPointerDown={() => setZIndex()}
    >
      <div 
        className="bg-surface-secondary px-3 py-2 flex items-center border-b border-border-default cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex gap-1.5 mr-3">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="font-mono text-xs text-text-secondary flex-1 text-center pr-12">{title}</span>
      </div>
      <div className="p-5 max-h-[500px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default function Mockup4() {
  const [zIndices, setZIndices] = useState([1, 2, 3]);

  const bringToFront = (index: number) => {
    const maxZ = Math.max(...zIndices);
    const newZ = [...zIndices];
    newZ[index] = maxZ + 1;
    setZIndices(newZ);
  };

  return (
    <div className="min-h-screen bg-surface-primary bg-[radial-gradient(circle_at_center,var(--grid-lines)_1px,transparent_1px)] bg-[size:20px_20px] relative overflow-hidden flex flex-col">
      <div className="flex justify-between items-center px-4 py-2 bg-surface-elevated/80 border-b border-border-default backdrop-blur-md z-50 font-mono text-sm">
        <Link href="/" className="text-text-primary hover:text-accent-primary transition-colors">← Return to Normalcy</Link>
        <span className="text-text-secondary">MEC OS • v2026</span>
      </div>

      <div className="flex-1 relative min-h-[85vh]">
        
        {/* Window 1: The Main Message */}
        <DraggableWindow 
          title="welcome.md - MEC_CC" 
          initialX={60} 
          initialY={60} 
          zIndex={zIndices[0]} 
          setZIndex={() => bringToFront(0)}
        >
          <div className="flex flex-col gap-2 text-text-primary">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2"># We build reality.</h1>
            <p className="text-text-secondary text-sm">MEC Computer Club isn&apos;t just about attending meetings.</p>
            <p className="text-text-secondary text-sm">We are a collective of <strong className="text-text-primary">70+ developers, hackers, and designers</strong> pushing boundaries.</p>
            <div className="mt-4">
              <Button size="lg">Initialize Application &gt;</Button>
            </div>
          </div>
        </DraggableWindow>

        {/* Window 2: The Terminal / Stats */}
        <DraggableWindow 
          title="Terminal - zsh" 
          initialX={450} 
          initialY={220} 
          zIndex={zIndices[1]} 
          setZIndex={() => bringToFront(1)}
        >
          <div className="font-mono text-xs text-text-secondary flex flex-col gap-2">
            <p><span className="text-accent-primary font-bold">mec-cc@server:~$</span> fetch-stats</p>
            <div className="grid grid-cols-2 gap-2 my-2 pl-2 border-l border-dashed border-border-default">
              <div>[+] Active Members:</div><div className="text-text-primary font-bold">70+</div>
              <div>[+] Departments:</div><div className="text-text-primary font-bold">4 (CP, Web, ML, Cyber)</div>
              <div>[+] Projects Shipped:</div><div className="text-text-primary font-bold">6 in production</div>
              <div>[+] CP Problems Solved:</div><div className="text-text-primary font-bold">2,000+</div>
              <div>[+] ICPC Teams Qualified:</div><div className="text-text-primary font-bold">3 Teams</div>
            </div>
            <p><span className="text-accent-primary font-bold">mec-cc@server:~$</span> <span className="inline-block w-2 h-3.5 bg-text-primary align-middle animate-pulse" /></p>
          </div>
        </DraggableWindow>

        {/* Window 3: The "Art" / Vibe Window */}
        <DraggableWindow 
          title="vibe_check.exe" 
          initialX={680} 
          initialY={30} 
          zIndex={zIndices[2]} 
          setZIndex={() => bringToFront(2)}
        >
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="w-20 h-20 rounded-full bg-accent-primary shadow-[0_0_40px_var(--accent-primary)] animate-pulse" />
            <p className="text-xs font-mono text-text-secondary">Theme Sync Active</p>
          </div>
        </DraggableWindow>

      </div>

      {/* Massive Background Typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-text-primary opacity-[0.03] pointer-events-none select-none whitespace-nowrap">
        MEC_CC
      </div>
    </div>
  );
}
