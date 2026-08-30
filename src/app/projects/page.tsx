import type { Metadata } from "next";
import { ProjectCard } from "@/components/ui/Card";
import { getProjects } from "@/data/projects";
import "./projects.css";

export const metadata: Metadata = {
  title: "Projects | ./codebase",
  description: "Real projects built by MEC Computer Club members — online judges, dashboards, chatbots, and more.",
};

export default async function ProjectsPage() {
  const allProjects = await getProjects();

  return (
    <>
      <section className="section projects-hero">
        <div className="container">
          <span className="kicker">Projects</span>
          <h1>Deployed to Production</h1>
          <p className="projects-hero__subtitle">
            Not tutorials. Not toy apps. Software built by members, used by real people.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            {allProjects.map((project) => (
              <ProjectCard key={project.id} {...project} team={project.team || []} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
