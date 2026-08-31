import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getExecutives } from "@/data/executives";

export const metadata: Metadata = {
  title: "Executive Panel | Root Users",
  description: "Meet the student leaders driving the MEC Computer Club forward.",
};

export default async function ExecutivesPage() {
  const executivesList = await getExecutives();

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
          <ProfileGrid className="stagger-children">
            {executivesList.map((exec) => (
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
                socials={exec.socials}
              />
            ))}
          </ProfileGrid>
        </div>
      </section>
    </>
  );
}
