"use client";

import { useState } from "react";
import Image from "next/image";
import { EventMediaItem } from "@/types";
import { getYoutubeEmbedUrl, getYoutubeThumbnail, getCleanMediaTitle, getOptimizedImageUrl } from "@/data/gallery";
import {
  Play,
  Image as ImageIcon,
  Film,
  X,
  Maximize2,
  Sparkles,
} from "lucide-react";

interface EventMediaGalleryProps {
  media?: EventMediaItem[];
  eventTitle: string;
}

export function EventMediaGallery({ media, eventTitle }: EventMediaGalleryProps) {
  const [activeItem, setActiveItem] = useState<EventMediaItem | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  if (!media || media.length === 0) return null;

  const photos = media.filter((m) => m.mediaType === "image");
  const videos = media.filter((m) => m.mediaType === "video" || Boolean(getYoutubeEmbedUrl(m.url)));

  const filtered = media.filter((m) => {
    if (filter === "image") return m.mediaType === "image";
    if (filter === "video") return m.mediaType === "video" || Boolean(getYoutubeEmbedUrl(m.url));
    return true;
  });

  return (
    <section className="p-6 sm:p-8 bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)] space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <span className="font-mono text-xs text-accent-primary uppercase font-bold tracking-wider flex items-center gap-1">
            <Sparkles size={13} /> Visual Memories
          </span>
          <h2 className="text-xl font-bold text-text-primary mt-1">
            Event Gallery &amp; Highlights
          </h2>
        </div>

        {/* Filter Buttons if both types exist */}
        {photos.length > 0 && videos.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                filter === "all"
                  ? "bg-accent-primary text-white border-accent-primary"
                  : "bg-surface-secondary text-text-secondary border-border-default hover:text-text-primary"
              }`}
            >
              All ({media.length})
            </button>
            <button
              onClick={() => setFilter("image")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1 ${
                filter === "image"
                  ? "bg-accent-primary text-white border-accent-primary"
                  : "bg-surface-secondary text-text-secondary border-border-default hover:text-text-primary"
              }`}
            >
              <ImageIcon size={12} /> Photos ({photos.length})
            </button>
            <button
              onClick={() => setFilter("video")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1 ${
                filter === "video"
                  ? "bg-accent-primary text-white border-accent-primary"
                  : "bg-surface-secondary text-text-secondary border-border-default hover:text-text-primary"
              }`}
            >
              <Film size={12} /> Videos ({videos.length})
            </button>
          </div>
        )}
      </div>

      {/* Videos Highlight Section (if any videos exist) */}
      {videos.length > 0 && filter !== "image" && (
        <div className="space-y-4">
          <h3 className="text-sm font-mono font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Film size={14} className="text-accent-primary" /> Videos &amp; Live Streams ({videos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((vid, i) => {
              const ytEmbed = getYoutubeEmbedUrl(vid.url);
              const isYt = Boolean(ytEmbed);

              if (isYt && ytEmbed) {
                return (
                  <div
                    key={vid._id || `vid-${i}`}
                    className="rounded-xl overflow-hidden border-2 border-border-brutalist bg-black aspect-video shadow-[3px_3px_0px_var(--border-brutalist)] flex flex-col"
                  >
                    <iframe
                      src={`${ytEmbed}?rel=0`}
                      title={vid.title || "Event Video"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }

              // Direct video file or custom player
              return (
                <div
                  key={vid._id || `vid-${i}`}
                  className="rounded-xl overflow-hidden border-2 border-border-brutalist bg-black aspect-video shadow-[3px_3px_0px_var(--border-brutalist)] relative group cursor-pointer"
                  onClick={() => setActiveItem(vid)}
                >
                  <video
                    src={vid.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/25 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play size={20} className="fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs truncate">
                    {getCleanMediaTitle(vid.title, eventTitle)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photos Grid Section */}
      {photos.length > 0 && filter !== "video" && (
        <div className="space-y-4">
          <h3 className="text-sm font-mono font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon size={14} className="text-accent-primary" /> Captured Photos ({photos.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {photos.map((photo, i) => (
              <div
                key={photo._id || `photo-${i}`}
                onClick={() => setActiveItem(photo)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-border-brutalist bg-surface-secondary cursor-pointer transition-all hover:shadow-[4px_4px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <Image
                  src={getOptimizedImageUrl(photo.url, 600)}
                  alt={getCleanMediaTitle(photo.title, eventTitle)}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  <span className="text-xs font-bold truncate">{getCleanMediaTitle(photo.title, eventTitle)}</span>
                  <span className="text-[10px] font-mono opacity-80 flex items-center gap-1 mt-0.5">
                    Click to enlarge <Maximize2 size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
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
                  {eventTitle}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-text-primary truncate mt-0.5">
                  {getCleanMediaTitle(activeItem.title, eventTitle)}
                </h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-xl bg-surface-elevated border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-primary flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Media Body */}
            <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[65vh] overflow-hidden">
              {activeItem.mediaType === "image" ? (
                <div className="relative w-full h-[60vh]">
                  <Image
                    src={getOptimizedImageUrl(activeItem.url, 1600)}
                    alt={activeItem.title || "Photo"}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : getYoutubeEmbedUrl(activeItem.url) ? (
                <div className="w-full aspect-video max-h-[65vh]">
                  <iframe
                    src={`${getYoutubeEmbedUrl(activeItem.url)}?autoplay=1&rel=0`}
                    title={activeItem.title || "Video"}
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
            <div className="px-6 py-3 bg-surface-secondary flex items-center justify-between text-xs font-mono text-text-tertiary">
              <span>{activeItem.mediaType === "image" ? "Photo Preview" : "Video Player"}</span>
              <a
                href={activeItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary font-bold hover:underline"
              >
                OPEN ORIGINAL ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
