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

export default async function MembersPage() {
  const membersList = await getActiveMembers();
  const batches = groupPeopleByBatch(membersList);

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
          {batches.length === 0 ? (
            <p className="text-center text-text-secondary py-12">
              No member records found yet.
            </p>
          ) : (
            <div className="flex flex-col gap-12">
              {batches.map((batch) => (
                <div key={batch.batchNumber} className="flex flex-col">
                  <div className="flex items-baseline gap-4 mb-6 pb-3 border-b border-border-default">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary m-0">
                      {batch.batchNumber}
                    </h2>
                    {batch.year && (
                      <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-accent-primary-hover text-base font-bold">
                        {batch.year}
                      </span>
                    )}
                  </div>
                  <ProfileGrid className="stagger-children">
                    {batch.members.map((member) => (
                      <ProfileCard
                        key={member.id}
                        slug={member.id}
                        name={member.name}
                        role={member.role}
                        systemRole={member.systemRole}
                        department={member.department}
                        session={member.session}
                        batch={member.batch}
                        sublabel={member.session || member.batch || "MEMBER"}
                        category="member"
                        image={member.image}
                        imagePosition={member.imagePosition}
                        socials={member.socials}
                      />
                    ))}
                  </ProfileGrid>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
