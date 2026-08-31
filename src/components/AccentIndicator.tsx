"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAccent } from "./AccentProvider";

export function AccentIndicator() {
  const pathname = usePathname();
  const { currentVibe, cycleManualVibe, isManual } = useAccent();
  const barRef = useRef<HTMLDivElement>(null);

  // Restart the progress bar animation each time the vibe changes
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Remove class → force reflow → re-add class
    bar.classList.remove("accent-indicator-bar-animating");
    void bar.offsetWidth; // trigger reflow
    bar.classList.add("accent-indicator-bar-animating");
  }, [currentVibe]);

  // Early return AFTER all hooks
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-[1000] flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-surface-elevated border border-border-brutalist dark:border-border-default font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-secondary tracking-wide uppercase transition-all duration-200 hover:shadow-[4px_4px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-surface-secondary active:translate-y-0 select-none cursor-pointer"
      onClick={cycleManualVibe}
      role="button"
      tabIndex={0}
      aria-label="Cycle theme color"
      title="Click to cycle theme manually"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .accent-indicator-bar-animating {
            animation: accent-progress 30s linear forwards;
          }
          @keyframes accent-progress {
            from { width: 0%; }
            to { width: 100%; }
          }
          @media (prefers-reduced-motion: reduce) {
            .accent-indicator-bar-animating {
              animation: none;
              width: 100%;
            }
          }
        `
      }} />
      <span className="w-2 h-2 rounded-full bg-accent-primary shrink-0 transition-colors duration-500" />
      <span className="font-semibold whitespace-nowrap text-text-primary">{currentVibe}</span>
      {!isManual && (
        <div className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-border-default rounded-full overflow-hidden">
          <div ref={barRef} className="h-full w-0 bg-accent-primary rounded-full transition-colors duration-500" />
        </div>
      )}
    </div>
  );
}
