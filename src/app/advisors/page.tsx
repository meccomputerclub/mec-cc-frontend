import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getAdvisors } from "@/data/advisors";
import "./advisors.css";

export const metadata: Metadata = {
  title: "Advisor Panel | sudoers",
  description: "The guiding forces behind MEC Computer Club.",
};

export default async function AdvisorsPage() {
  const advisorsList = await getAdvisors();

  return (
    <>
      <section className="section advisors-hero">
        <div className="container">
          <span className="kicker">Guidance &amp; Vision</span>
          <h1>sudoers (Our Honorable Advisors)</h1>
          <p className="advisors-hero__subtitle">
            Meet the experienced mentors who guide our club towards excellence and innovation.
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
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
