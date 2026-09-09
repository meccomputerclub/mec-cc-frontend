import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getAlumni } from "@/data/alumni";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Alumni | Legacy Code",
  description: "Meet the legends who built MEC Computer Club.",
};

export default async function AlumniPage() {
  const batches = await getAlumni();

  return (
    <>
      <section className="pt-10 md:pt-14 pb-8 md:pb-10 text-center">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Hall of Fame</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary my-3">
            Our Alumni Network (Legacy Code)
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-[600px] mx-auto">
            The legends who built this club and shaped its culture.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-surface-secondary">
        <div className="container mx-auto px-4 md:px-8">
          {batches.length === 0 ? (
            <p className="text-center text-text-secondary py-12">
              No alumni records found yet.
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
                        batch={member.batch}
                        session={member.session}
                        department={member.department}
                        sublabel={batch.batchNumber}
                        category="alumni"
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
