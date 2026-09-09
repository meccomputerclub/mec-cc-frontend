import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getProjects, getProjectBySlug } from "@/data/projects";

export async function generateStaticParams() {
  const allProjects = await getProjects();
  return allProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return { title: project.title, description: project.description };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <article className="py-12 md:py-16">
      <div className="container max-w-[var(--max-width-narrow)] mx-auto px-4 md:px-8">
        <Badge variant={project.status === "completed" ? "completed" : "pending"} size="md">
          {project.status === "in-progress" ? "In Progress" : project.status}
        </Badge>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary my-3">
          {project.title}
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-6 whitespace-pre-line">
          {project.longDescription || project.description}
        </p>

        <div className="flex flex-col gap-5 bg-surface-secondary p-6 rounded-xl border border-border-default">
          <div>
            <h4 className="text-xs font-mono [font-feature-settings:'liga'_0,'calt'_0] uppercase tracking-wider text-text-tertiary mb-3 font-semibold">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((t) => (
                <span
                  key={t}
                  className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-sm py-1 px-3 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded text-text-primary font-medium shadow-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-mono [font-feature-settings:'liga'_0,'calt'_0] uppercase tracking-wider text-text-tertiary mb-3 font-semibold">
              Team
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-1.5 text-text-primary font-medium">
              {project.team.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </div>
          {(project.liveUrl || project.repoUrl) && (
            <div>
              <h4 className="text-xs font-mono [font-feature-settings:'liga'_0,'calt'_0] uppercase tracking-wider text-text-tertiary mb-3 font-semibold">
                Links
              </h4>
              <div className="flex gap-3 flex-wrap">
                {project.liveUrl && <Button href={project.liveUrl} size="sm">Live Demo ↗</Button>}
                {project.repoUrl && <Button href={project.repoUrl} variant="secondary" size="sm">GitHub ↗</Button>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border-default">
          <Button href="/projects" variant="ghost">← Back to projects</Button>
        </div>
      </div>
    </article>
  );
}
