import type { Metadata } from "next";
import { getAlumniMembers } from "@/data/alumni";
import PeopleDirectory from "@/components/people/PeopleDirectory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Alumni | Legacy Code",
  description: "Meet the legends who built MEC Computer Club.",
};

export default async function AlumniPage() {
  const alumniMembers = await getAlumniMembers();

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
          <PeopleDirectory
            initialPeople={alumniMembers}
            category="alumni"
            emptyTitle="No alumni found"
            emptySubtitle="No alumni records matched your selected department, batch, or search query."
          />
        </div>
      </section>
    </>
  );
}
