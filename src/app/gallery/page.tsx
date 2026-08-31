import { Metadata } from "next";
import Image from "next/image";
import { galleryItems } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery | Visual Cache",
  description: "Pictures and videos from past events of the MEC Computer Club.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen">
      <section className="pt-8 pb-12 container mx-auto px-4 md:px-8">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <span className="kicker">Memories</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            Visual Cache (Our Gallery)
          </h2>
          <p className="text-base sm:text-lg text-text-tertiary">
            Highlights from our past events, workshops, and hackathons.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[4/3] bg-surface-secondary rounded-xl border border-border-brutalist dark:border-border-default overflow-hidden transition-all duration-200 hover:border-border-brutalist hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer z-0 hover:z-10"
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  poster={item.thumbnailUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              )}

              <div className="absolute top-3 right-3 bg-[#1A1A1A]/70 backdrop-blur-sm text-white font-mono [font-feature-settings:'liga'_0,'calt'_0] text-[0.65rem] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider z-10">
                {item.type === "image" ? "Photo" : "Video"}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-accent-primary uppercase mb-1">
                  {item.event}
                </span>
                <h3 className="font-bold text-lg text-white leading-tight mb-1">
                  {item.title}
                </h3>
                <span className="text-xs text-zinc-300">
                  {new Date(item.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
