import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getExecutives } from "@/data/executives";
import { groupPeopleByBatch } from "@/lib/batchUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Executive Committee & Student Leaders | MEC Computer Club",
  description:
    "Meet the executive committee and student leadership driving the MEC Computer Club forward at Murari Chand College, Sylhet. Explore batch-wise panels, presidents, and secretaries.",
  keywords: [
    "MEC Computer Club executives",
    "MEC CC executive committee",
    "MEC CC leadership",
    "Murari Chand College computer club leaders",
    "MEC CSE executives",
    "MEC Computer Club president",
  ],
  alternates: {
    canonical: "https://meccomputerclub.org/executives",
  },
  openGraph: {
    title: "Executive Committee & Leadership | MEC Computer Club",
    description:
      "Meet the student leaders driving the MEC Computer Club at Murari Chand College, Sylhet. Batch-wise executive panels and leads.",
    url: "https://meccomputerclub.org/executives",
    images: ["/mec-club-photo.jpg"],
  },
};

export default async function ExecutivesPage() {
  const executivesList = await getExecutives();
  const batches = groupPeopleByBatch(executivesList);

  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Leadership</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
            Root Users (Executive Panel)
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px] mt-3">
            Meet the dedicated student leaders who run the operations and drive the vision of the MEC Computer Club.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-surface-secondary">
        <div className="container mx-auto px-4 md:px-8">
          {batches.length === 0 ? (
            <p className="text-center text-text-secondary py-12">
              No executive records found yet.
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
                    {batch.members.map((exec) => (
                      <ProfileCard
                        key={exec.id}
                        slug={exec.id}
                        name={exec.name}
                        role={exec.role}
                        systemRole={exec.systemRole}
                        department={exec.department}
                        session={exec.session}
                        batch={exec.batch}
                        sublabel="PANEL"
                        category="executive"
                        image={exec.image}
                        imagePosition={exec.imagePosition}
                        socials={exec.socials}
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
