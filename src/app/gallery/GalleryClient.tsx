"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  GalleryItem,
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
  getCleanMediaTitle,
  getOptimizedImageUrl,
} from "@/data/gallery";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  Play,
  Image as ImageIcon,
  X,
  Maximize2,
  ExternalLink,
  Film,
  Calendar,
  Loader2,
  Sparkles,
} from "lucide-react";

interface GalleryClientProps {
  initialItems: GalleryItem[];
}

const INITIAL_BATCH_SIZE = 12;
const BATCH_INCREMENT = 8;

/* ── Neo-Brutalist Skeleton Card ── */
function GallerySkeletonCard() {
  return (
    <div className="relative aspect-[4/3] bg-surface-secondary rounded-2xl border-2 border-border-default overflow-hidden animate-pulse shadow-[3px_3px_0px_var(--border-default)]">
      <div className="w-full h-full bg-gradient-to-br from-surface-secondary via-surface-elevated to-surface-secondary" />
      <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-surface-tertiary/70 border border-border-default" />
      <div className="absolute bottom-3 left-3 right-3 space-y-2">
        <div className="h-3 w-2/3 bg-surface-tertiary/80 rounded" />
        <div className="h-2.5 w-1/3 bg-surface-tertiary/50 rounded" />
      </div>
    </div>
  );
}

/* ── Individual Gallery Media Card with Progressive Fade-In ── */
function GalleryCardItem({
  item,
  onClick,
}: {
  item: GalleryItem;
  onClick: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isYt = item.isYoutube || Boolean(getYoutubeEmbedUrl(item.url));
  const rawThumb = item.thumbnailUrl || (item.type === "image" ? item.url : null);
  const displayThumb = rawThumb ? getOptimizedImageUrl(rawThumb, 800) : null;

  return (
    <div
      onClick={onClick}
      className="group relative aspect-[4/3] bg-surface-secondary rounded-2xl border-2 border-border-brutalist overflow-hidden transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer z-0 hover:z-10"
      id={`gallery-item-${item.id}`}
    >
      {/* Background Skeleton Shimmer while Image is Loading */}
      {displayThumb && !imageLoaded && (
        <div className="absolute inset-0 bg-surface-secondary animate-pulse flex items-center justify-center">
          <ImageIcon size={28} className="text-text-tertiary opacity-30 animate-pulse" />
        </div>
      )}

      {/* Media Presentation */}
      {displayThumb ? (
        <div className="relative w-full h-full">
          <Image
            src={displayThumb}
            alt={getCleanMediaTitle(item.title, item.event)}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      ) : item.type === "video" ? (
        // Stylized Video Card without heavy in-grid video stream buffering
        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-zinc-900 to-black flex flex-col items-center justify-center p-4 text-center">
          <div className="w-14 h-14 rounded-full bg-accent-primary/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform mb-2">
            <Play size={24} className="fill-current ml-1" />
          </div>
          <span className="text-[11px] font-mono text-zinc-300 font-bold uppercase tracking-wider line-clamp-1 max-w-[85%]">
            {item.event}
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Click to Play Video</span>
        </div>
      ) : (
        <div className="w-full h-full bg-surface-tertiary flex items-center justify-center">
          <ImageIcon size={32} className="text-text-tertiary" />
        </div>
      )}

      {/* Top Right Badge: Icon only, visible on hover */}
      <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {item.type === "image" ? (
          <ImageIcon size={14} className="text-white" />
        ) : isYt ? (
          <Play size={13} className="text-red-400 fill-red-400 ml-0.5" />
        ) : (
          <Play size={13} className="text-white fill-white ml-0.5" />
        )}
      </div>

      {/* Bottom Overlay Info: visible on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="font-mono text-[0.75rem] text-accent-primary-light font-bold uppercase tracking-wider mb-1 line-clamp-2 leading-tight">
          {item.event}
        </span>
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/20 text-xs text-zinc-300 font-mono">
          <span className="flex items-center gap-1 text-[11px]">
            <Calendar size={11} />
            {item.date && !isNaN(new Date(item.date).getTime())
              ? new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Past Event"}
          </span>
          <span className="text-white inline-flex items-center gap-1 font-bold text-[11px]">
            View <Maximize2 size={11} />
          </span>
        </div>
      </div>
    </div>
  );
}

export function GalleryClient({ initialItems }: GalleryClientProps) {
  const [items] = useState<GalleryItem[]>(initialItems);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  // Progressive Loading on Scroll state
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Extract unique events for the filter dropdown
  const uniqueEvents = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.event))).filter(Boolean);
  }, [items]);

  // Filtered media items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter !== "all" && item.type !== filter) return false;
      if (selectedEvent !== "all" && item.event !== selectedEvent) return false;
      return true;
    });
  }, [items, filter, selectedEvent]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [filter, selectedEvent]);

  // Currently sliced visible items
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  // Load next batch handler
  const loadNextBatch = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    // Smooth micro-delay for seamless perception
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredItems.length));
      setIsLoadingMore(false);
    }, 180);
  }, [hasMore, isLoadingMore, filteredItems.length]);

  // IntersectionObserver for automatic Load-on-Scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextBatch();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadNextBatch]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveItem(null);
      }
    };
    if (activeItem) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem]);

  return (
    <>
      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-surface-secondary/70 p-4 rounded-2xl border border-border-default backdrop-blur-sm shadow-sm">
        {/* Type Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-primary border border-border-default rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              filter === "all"
                ? "bg-accent-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            All Media ({items.length})
          </button>
          <button
            onClick={() => setFilter("image")}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              filter === "image"
                ? "bg-accent-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <ImageIcon size={13} /> Photos ({items.filter((i) => i.type === "image").length})
          </button>
          <button
            onClick={() => setFilter("video")}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
              filter === "video"
                ? "bg-accent-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Film size={13} /> Videos ({items.filter((i) => i.type === "video").length})
          </button>
        </div>

        {/* Event Dropdown Filter */}
        <div className="flex items-center gap-2 w-full md:w-72">
          <Select
            options={[
              { value: "all", label: "All Events & Archives" },
              ...uniqueEvents.map((evt) => ({ value: evt, label: evt })),
            ]}
            value={selectedEvent}
            onChange={(val) => setSelectedEvent(val)}
            placeholder="All Events & Archives"
          />
        </div>
      </div>

      {/* ── Status Count Header ── */}
      <div className="flex items-center justify-between mb-4 px-1 text-xs font-mono text-text-tertiary">
        <span>
          Showing <strong className="text-text-primary">{visibleItems.length}</strong> of{" "}
          <strong className="text-text-primary">{filteredItems.length}</strong> items
        </span>
        {hasMore && (
          <span className="hidden sm:inline-flex items-center gap-1 text-accent-primary">
            <Sparkles size={12} /> Auto-loads as you scroll
          </span>
        )}
      </div>

      {/* ── Grid Layout ── */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-surface-secondary/40 rounded-2xl border border-dashed border-border-default">
          <ImageIcon size={40} className="mx-auto text-text-tertiary mb-3 opacity-40" />
          <h3 className="font-bold text-lg text-text-secondary">No media found</h3>
          <p className="text-sm text-text-tertiary mt-1 font-mono">
            Try adjusting your filter selection or clear the event search.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleItems.map((item) => (
              <GalleryCardItem
                key={item.id}
                item={item}
                onClick={() => setActiveItem(item)}
              />
            ))}

            {/* Skeletons rendered at bottom while loading next batch */}
            {isLoadingMore && (
              <>
                <GallerySkeletonCard />
                <GallerySkeletonCard />
                <GallerySkeletonCard />
                <GallerySkeletonCard />
              </>
            )}
          </div>

          {/* Load-on-scroll Sentinel Target */}
          <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

          {/* Fallback Manual Trigger / End of Gallery Notice */}
          {hasMore ? (
            <div className="flex justify-center pt-2 pb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={loadNextBatch}
                disabled={isLoadingMore}
                className="font-mono text-xs"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={13} className="animate-spin mr-1.5" /> Loading next batch...
                  </>
                ) : (
                  `Load more photos (${filteredItems.length - visibleCount} remaining) ↓`
                )}
              </Button>
            </div>
          ) : filteredItems.length > INITIAL_BATCH_SIZE ? (
            <div className="text-center py-6 border-t border-border-default">
              <span className="text-xs font-mono text-text-tertiary">
                ✓ You have reached the end of the visual archive ({filteredItems.length} items)
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Interactive Lightbox Modal ── */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative bg-surface-elevated border-2 border-border-brutalist rounded-2xl max-w-4xl w-full overflow-hidden shadow-[8px_8px_0px_var(--accent-primary)] max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-surface-secondary">
              <div className="min-w-0 pr-4">
                <span className="font-mono text-xs font-bold uppercase text-accent-primary">
                  {activeItem.event}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-text-primary truncate mt-0.5">
                  {getCleanMediaTitle(activeItem.title, activeItem.event)}
                </h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-primary flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Media Body */}
            <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[65vh] overflow-hidden">
              {activeItem.type === "image" ? (
                <div className="relative w-full h-[60vh]">
                  <Image
                    src={getOptimizedImageUrl(activeItem.url, 1600)}
                    alt={activeItem.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 85vw"
                    className="object-contain"
                    priority
                  />
                </div>
              ) : getYoutubeEmbedUrl(activeItem.url) ? (
                <div className="w-full aspect-video max-h-[65vh]">
                  <iframe
                    src={`${getYoutubeEmbedUrl(activeItem.url)}?autoplay=1&rel=0`}
                    title={activeItem.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={activeItem.url}
                  controls
                  autoPlay
                  className="w-full max-h-[60vh] object-contain"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-surface-secondary flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-text-tertiary">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-accent-primary" />
                <span>
                  Captured:{" "}
                  {activeItem.date && !isNaN(new Date(activeItem.date).getTime())
                    ? new Date(activeItem.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "MEC Computer Club"}
                </span>
              </div>

              {activeItem.eventSlug && (
                <Link
                  href={`/events/${activeItem.eventSlug}`}
                  className="text-accent-primary font-bold hover:underline inline-flex items-center gap-1"
                >
                  VIEW EVENT DETAILS <ExternalLink size={12} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
