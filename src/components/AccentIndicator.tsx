"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAccent } from "./AccentProvider";
import "./AccentIndicator.css";

export function AccentIndicator() {
  const pathname = usePathname();
  const { currentVibe, cycleManualVibe, isManual } = useAccent();
  const barRef = useRef<HTMLDivElement>(null);

  // Restart the progress bar animation each time the vibe changes
  // Must be called before any conditional return (Rules of Hooks)
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Remove class → force reflow → re-add class
    bar.classList.remove("accent-indicator__bar--animating");
    void bar.offsetWidth; // trigger reflow
    bar.classList.add("accent-indicator__bar--animating");
  }, [currentVibe]);

  // Early return AFTER all hooks
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <div 
      className={`accent-indicator ${isManual ? "accent-indicator--manual" : ""}`}
      onClick={cycleManualVibe}
      role="button"
      tabIndex={0}
      aria-label="Cycle theme color"
      title="Click to cycle theme manually"
    >
      <span className="accent-indicator__dot" />
      <span className="accent-indicator__label">{currentVibe}</span>
      {!isManual && (
        <div className="accent-indicator__progress">
          <div ref={barRef} className="accent-indicator__bar" />
        </div>
      )}
    </div>
  );
}
