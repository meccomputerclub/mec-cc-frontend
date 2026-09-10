"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { EventCard } from "@/components/ui/Card";
import { Event } from "@/types";
import { Shield, Gamepad2, Code2, Globe, Cpu, Layers } from "lucide-react";

interface EventsFilterViewProps {
  initialUpcoming: Event[];
  initialPast: Event[];
}

const CATEGORIES = [
  { id: "all", label: "All Events", icon: Layers },
  { id: "cybersec", label: "Cybersecurity", icon: Shield },
  { id: "gaming", label: "Gaming & Esports", icon: Gamepad2 },
  { id: "cp", label: "Competitive Programming", icon: Code2 },
  { id: "webdev", label: "Web Development", icon: Globe },
  { id: "ml", label: "Machine Learning & AI", icon: Cpu },
];

function matchEventCategory(event: Event, catId: string): boolean {
  if (catId === "all") return true;

  const dept = (event.department || "").toLowerCase();
  const title = (event.title || "").toLowerCase();
  const tags = (event.tags || []).map((t) => t.toLowerCase());

  if (catId === "cybersec") {
    return (
      dept === "cybersec" ||
      dept === "cybersecurity" ||
      tags.some((t) => t.includes("cyber") || t.includes("ctf") || t.includes("security") || t.includes("hacking")) ||
      title.includes("ctf") ||
      title.includes("hacking") ||
      title.includes("security")
    );
  }

  if (catId === "gaming") {
    return (
      dept === "gaming" ||
      dept === "esports" ||
      tags.some((t) => t.includes("gaming") || t.includes("esports") || t.includes("game") || t.includes("free fire")) ||
      title.includes("free fire") ||
      title.includes("tournament") ||
      title.includes("gaming") ||
      title.includes("esports")
    );
  }

  if (catId === "cp") {
    return (
      dept === "cp" ||
      dept === "competitive programming" ||
      tags.some((t) => t.includes("cp") || t.includes("icpc") || t.includes("programming-contest") || t.includes("contest")) ||
      title.includes("contest") ||
      title.includes("programming contest") ||
      title.includes("icpc")
    );
  }

  if (catId === "webdev") {
    return (
      dept === "webdev" ||
      dept === "web" ||
      tags.some((t) => t.includes("web") || t.includes("git") || t.includes("frontend") || t.includes("backend")) ||
      title.includes("web") ||
      title.includes("git")
    );
  }

  if (catId === "ml") {
    return (
      dept === "ml" ||
      dept === "ai" ||
      tags.some((t) => t.includes("ml") || t.includes("ai") || t.includes("data") || t.includes("kaggle")) ||
      title.includes("machine learning") ||
      title.includes("ai")
    );
  }

  return false;
}

function EventsFilterContent({ initialUpcoming, initialPast }: EventsFilterViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = searchParams.get("category") || searchParams.get("dept") || "all";
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);

  useEffect(() => {
    const catParam = searchParams.get("category") || searchParams.get("dept") || "all";
    if (CATEGORIES.some((c) => c.id === catParam)) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      router.replace("/events", { scroll: false });
    } else {
      router.replace(`/events?category=${catId}`, { scroll: false });
    }
  };

  const filteredUpcoming = useMemo(
    () => initialUpcoming.filter((e) => matchEventCategory(e, selectedCategory)),
    [initialUpcoming, selectedCategory]
  );

  const filteredPast = useMemo(
    () => initialPast.filter((e) => matchEventCategory(e, selectedCategory)),
    [initialPast, selectedCategory]
  );

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div>
      {/* Category Pills Filter Bar */}
      <section className="pb-6">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-wrap items-center gap-2 pt-2 pb-4 border-b border-border-default">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === "all"
                  ? initialUpcoming.length + initialPast.length
                  : initialUpcoming.filter((e) => matchEventCategory(e, cat.id)).length +
                    initialPast.filter((e) => matchEventCategory(e, cat.id)).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-accent-primary text-black shadow-[3px_3px_0px_var(--border-brutalist)] border-2 border-text-primary"
                      : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-default hover:bg-surface-secondary"
                  }`}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                      isSelected ? "bg-black/15 text-black" : "bg-surface-secondary text-text-tertiary"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedCategory !== "all" && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs sm:text-sm text-text-secondary">
                Showing events in{" "}
                <span className="font-bold text-text-primary">{activeCategoryObj?.label}</span>
              </div>
              <button
                onClick={() => handleCategorySelect("all")}
                className="text-xs font-bold text-accent-primary hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-8 md:py-12" id="upcoming">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-text-primary">Next in Queue</h2>
            <span className="text-xs font-mono font-bold text-text-tertiary uppercase">
              {filteredUpcoming.length} Upcoming
            </span>
          </div>

          {filteredUpcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUpcoming.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-surface-secondary rounded-xl text-text-tertiary border border-border-default">
              <p className="font-semibold text-text-secondary">
                No upcoming events found for {activeCategoryObj?.label || "this category"}.
              </p>
              <p className="text-xs mt-1 text-text-tertiary">
                Check back soon or view past sessions below.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      <section className="py-8 md:py-12 bg-surface-secondary/50" id="past">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-text-primary">Successfully Executed (Past Events)</h2>
            <span className="text-xs font-mono font-bold text-text-tertiary uppercase">
              {filteredPast.length} Past
            </span>
          </div>

          {filteredPast.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-90 hover:opacity-100 transition-opacity">
              {filteredPast.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 bg-surface-elevated rounded-xl text-text-tertiary border border-border-default">
              <p className="text-sm">No past events recorded in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function EventsFilterView(props: EventsFilterViewProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-tertiary">Loading events...</div>}>
      <EventsFilterContent {...props} />
    </Suspense>
  );
}
