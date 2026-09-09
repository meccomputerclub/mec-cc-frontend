export const dynamic = "force-dynamic";

import { Metadata } from "next";
import { getGalleryItems } from "@/data/gallery";
import { GalleryClient } from "./GalleryClient";

export const metadata: Metadata = {
  title: "Event Gallery & Photo Highlights | MEC Computer Club",
  description:
    "Explore photos and videos from tech events, coding contests, intra-college bootcamps, and workshops hosted by the MEC Computer Club in Sylhet.",
  keywords: [
    "MEC Computer Club photos",
    "MEC event gallery",
    "Murari Chand College tech events photo",
    "MEC programming contest photos",
  ],
  alternates: {
    canonical: "https://meccomputerclub.org/gallery",
  },
  openGraph: {
    title: "Event Gallery & Highlights | MEC Computer Club",
    description: "Visual memories from workshops, contests, seminars, and club activities.",
    url: "https://meccomputerclub.org/gallery",
    images: ["/mec-club-photo.jpg"],
  },
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <main className="min-h-screen">
      <section className="pt-8 pb-16 container mx-auto px-4 md:px-8">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <span className="kicker">Memories &amp; Moments</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            Visual Cache (Our Gallery)
          </h1>
          <p className="text-base sm:text-lg text-text-tertiary">
            Highlights from our past events, workshops, hackathons, and tournaments.
          </p>
        </div>

        <GalleryClient initialItems={items} />
      </section>
    </main>
  );
}
