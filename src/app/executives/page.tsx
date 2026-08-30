import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getExecutives } from "@/data/executives";
import "./executives.css";

export const metadata: Metadata = {
  title: "Executive Panel | Root Users",
  description: "Meet the student leaders driving the MEC Computer Club forward.",
};

export default async function ExecutivesPage() {
  const executivesList = await getExecutives();

  return (
    <>
      <section className="section executives-hero">
        <div className="container">
          <span className="kicker">Leadership</span>
          <h1>Root Users (Executive Panel)</h1>
          <p className="executives-hero__subtitle">
            Meet the dedicated student leaders who run the operations and drive the vision of the MEC Computer Club.
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
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

