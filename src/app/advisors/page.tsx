import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getAdvisors } from "@/data/advisors";

export const metadata: Metadata = {
  title: "Advisor Panel | sudoers",
  description: "The guiding forces behind MEC Computer Club.",
};

export default async function AdvisorsPage() {
  const advisorsList = await getAdvisors();

  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Guidance &amp; Vision</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
            sudoers (Our Honorable Advisors)
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px] mt-3">
            Meet the experienced mentors who guide our club towards excellence and innovation.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-surface-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <ProfileGrid className="stagger-children">
            {advisorsList.map((advisor) => (
              <ProfileCard
                key={advisor.id}
                slug={advisor.id}
                name={advisor.name}
                role={advisor.role}
                department={advisor.department}
                session={advisor.academicPost || (advisor.department ? `Dept. of ${advisor.department}` : "Faculty")}
                image={advisor.image}
                sublabel="FACULTY"
                category="advisor"
                socials={advisor.socials}
              />
            ))}
          </ProfileGrid>
        </div>
      </section>
    </>
  );
}
