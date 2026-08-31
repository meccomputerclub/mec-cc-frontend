import type { Metadata } from "next";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { getActiveMembers } from "@/data/members";

export const metadata: Metadata = {
  title: "Members | Active Nodes",
  description: "The passionate individuals driving the MEC Computer Club.",
};

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
