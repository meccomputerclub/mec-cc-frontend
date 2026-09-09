"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GalleryItem, getYoutubeEmbedUrl, getCleanMediaTitle, getOptimizedImageUrl } from "@/data/gallery";
import { X, Play, Image as ImageIcon, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HomeGalleryProps {
  items: GalleryItem[];
}

export function HomeGallery({ items }: HomeGalleryProps) {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  return (
    <section className="section bg-surface-secondary/40" id="home-gallery">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
          <span className="kicker">Visual Archive</span>
          <h2>Campus Moments & Hackathons</h2>
          <p className="text-lg text-text-tertiary max-[768px]:text-base">
            From overnight coding sprints to national stages — a glimpse into life at MEC-CC.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className="cursor-pointer">
              <div
                onClick={() => setActiveItem(item)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-border-brutalist bg-surface-secondary cursor-pointer shadow-[4px_4px_0px_0px_var(--border-brutalist)] hover:shadow-[6px_6px_0px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Media preview */}
                {item.type === "image" ? (
                  <Image
                    src={getOptimizedImageUrl(item.url, 800)}
                    alt={getCleanMediaTitle(item.title, item.event)}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : item.thumbnailUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={getOptimizedImageUrl(item.thumbnailUrl, 800)}
                      alt={getCleanMediaTitle(item.title, item.event)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play size={20} className="fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      muted
                      loop
                      playsInline
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play size={20} className="fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Badge: Icon only, visible on hover */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  {item.type === "image" ? (
                    <ImageIcon size={15} className="text-white" />
                  ) : (
                    <Play size={14} className="text-white fill-white ml-0.5" />
                  )}
                </div>

                {/* Bottom Overlay: visible only on hover, no raw image name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="font-mono text-[0.75rem] text-accent-primary-light font-bold uppercase tracking-wider line-clamp-2 leading-tight">
                    {item.event}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-xs text-zinc-300 font-mono">
                    <span>
                      {item.date && !isNaN(new Date(item.date).getTime())
                        ? new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Event"}
                    </span>
                    <span className="text-white inline-flex items-center gap-1 font-bold">
                      View <Maximize2 size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-[var(--space-6)]">
          <Button href="/gallery" variant="secondary" id="home-view-gallery">
            View full gallery archive →
          </Button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative bg-surface-elevated border-2 border-border-brutalist rounded-2xl max-w-4xl w-full overflow-hidden shadow-[8px_8px_0px_var(--accent-primary)] max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-surface-secondary">
              <div>
                <span className="font-mono text-xs font-bold uppercase text-accent-primary-hover">
                  {activeItem.event}
                </span>
                <h3 className="font-bold text-lg text-text-primary mt-0.5">
                  {getCleanMediaTitle(activeItem.title, activeItem.event)}
                </h3>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-lg bg-surface-elevated border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-primary flex items-center justify-center transition-colors"
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
            <div className="px-6 py-3 bg-surface-secondary flex items-center justify-between text-xs font-mono text-text-tertiary">
              <span>
                Captured:{" "}
                {new Date(activeItem.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <Link
                href="/gallery"
                className="text-accent-primary-hover font-bold hover:underline"
              >
                BROWSE GALLERY →
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
