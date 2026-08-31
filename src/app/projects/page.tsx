import type { Metadata } from "next";
import { ProjectCard } from "@/components/ui/Card";
import { getProjects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects | ./codebase",
  description: "Real projects built by MEC Computer Club members — online judges, dashboards, chatbots, and more.",
};

export default async function ProjectsPage() {
  const allProjects = await getProjects();

  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Projects</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            Deployed to Production
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px]">
            Not tutorials. Not toy apps. Software built by members, used by real people.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProjects.map((project) => (
              <ProjectCard key={project.id} {...project} team={project.team || []} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
