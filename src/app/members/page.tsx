import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getActiveMembers } from "@/data/members";
import { groupPeopleByBatch } from "@/lib/batchUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Club Members & Student Developers | MEC Computer Club",
  description:
    "Directory of active student members, problem solvers, and engineers at MEC Computer Club, Murari Chand College, Sylhet. Explore batch-wise member profiles.",
  keywords: [
    "MEC Computer Club members",
    "Murari Chand College CSE students",
    "Sylhet student developers",
    "MEC CC member directory",
    "MEC competitive programmers",
  ],
  alternates: {
    canonical: "https://meccomputerclub.org/members",
  },
  openGraph: {
    title: "Club Members & Student Developers | MEC Computer Club",
    description:
      "Meet the talented student engineers, developers, and problem solvers at Murari Chand College (MEC), Sylhet.",
    url: "https://meccomputerclub.org/members",
    images: ["/mec-club-photo.jpg"],
  },
};

import PeopleDirectory from "@/components/people/PeopleDirectory";

export default async function MembersPage() {
  const membersList = await getActiveMembers();

  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Our Core</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
            Active Nodes (Members)
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px] mt-3">
            Meet the talented developers, designers, and problem solvers who make up the heart of our community.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-surface-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <PeopleDirectory
            initialPeople={membersList}
            category="member"
            emptyTitle="No members found"
            emptySubtitle="No active member records matched your selected filters."
          />
        </div>
      </section>
    </>
  );
}
