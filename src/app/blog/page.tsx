import type { Metadata } from "next";
import { Suspense } from "react";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Tech Blog, Engineering Articles & Tutorials | MEC Computer Club",
  description:
    "Explore engineering articles, ICPC problem-solving write-ups, web development guides, and tech tutorials written by MEC Computer Club members in Sylhet.",
  keywords: [
    "MEC Computer Club blog",
    "CP tutorials Sylhet",
    "web development articles MEC",
    "programming tutorials Bangladesh",
    "MEC student tech blogs",
  ],
  alternates: {
    canonical: "https://meccomputerclub.org/blog",
  },
  openGraph: {
    title: "Tech Blog & Tutorials | MEC Computer Club",
    description:
      "Technical write-ups, contest reflections, and developer tutorials by members of the MEC Computer Club.",
    url: "https://meccomputerclub.org/blog",
    images: ["/mec-club-photo.jpg"],
  },
};

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-text-primary/20 border-t-accent-primary rounded-full animate-spin" />
        </div>
      }
    >
      <BlogPageClient />
    </Suspense>
  );
}
