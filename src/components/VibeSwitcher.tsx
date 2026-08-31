"use client";

import { useAccent } from "@/components/AccentProvider";
import { VIBE_ORDER } from "@/lib/accent-themes";

const VIBE_COLORS: Record<string, string> = {
  lime: "#84CC16",
  mint: "#2E8B6B",
  sky: "#2D5BC0",
  amber: "#B25A15",
  rose: "#B23A4D",
  violet: "#5A4FBF",
  slate: "#5F5E5A",
};

export function VibeSwitcher() {
  const { currentVibe, setManualVibe } = useAccent();

  return (
    <div className="flex gap-1.5 items-center p-1.5 bg-surface-secondary rounded-full border border-border-brutalist dark:border-border-default transition-all duration-200 hover:shadow-[4px_4px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
      {VIBE_ORDER.map((vibe) => {
        const isActive = currentVibe === vibe;
        return (
          <button
            key={vibe}
            style={{ backgroundColor: VIBE_COLORS[vibe] || "#84CC16" }}
            className={`w-3.5 h-3.5 rounded-full border-2 p-0 cursor-pointer transition-all duration-200 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:scale-115 ${
              isActive
                ? "border-text-primary scale-115"
                : "border-transparent"
            }`}
            onClick={() => setManualVibe(vibe)}
            aria-label={`Set theme to ${vibe}`}
            title={vibe}
          />
        );
      })}
    </div>
  );
}
