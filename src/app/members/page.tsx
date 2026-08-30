import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getActiveMembers } from "@/data/members";
import "./members.css";

export const metadata: Metadata = {
  title: "Members | Active Nodes",
  description: "The passionate individuals driving the MEC Computer Club.",
};

export default async function MembersPage() {
  const membersList = await getActiveMembers();

  return (
    <>
      <section className="section members-hero">
        <div className="container">
          <span className="kicker">Our Core</span>
          <h1>Active Nodes (Members)</h1>
          <p className="members-hero__subtitle">
            Meet the talented developers, designers, and problem solvers who make up the heart of our community.
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <ProfileGrid className="stagger-children">
            {membersList.map((member) => (
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
                socials={member.socials}
              />
            ))}
          </ProfileGrid>
        </div>
      </section>
    </>
  );
}
