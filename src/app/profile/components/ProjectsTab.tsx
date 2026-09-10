"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ui/Card";
import { Code2, Plus, FolderGit2 } from "lucide-react";
import { ProjectModal } from "@/components/projects/ProjectModal";

interface ProjectsTabProps {
  user: AuthUser;
  projects: any[];
  onProjectAdded?: () => void;
}

export function ProjectsTab({ user, projects, onProjectAdded }: ProjectsTabProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
        <div>
          <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">
            My Projects &amp; Software ({projects.length})
          </h2>
          <p className="font-body text-xs text-text-secondary mt-0.5">
            Software, tools, and repositories you have created or contributed to.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={14} style={{ marginRight: "4px" }} /> Add Project
        </Button>
      </div>

      {/* Project Cards Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((proj) => {
            const id = proj._id || proj.id || `p-${Math.random()}`;
            const slug = proj.slug || proj.id || proj._id || "project";
            const techStack = Array.isArray(proj.techStack)
              ? proj.techStack
              : typeof proj.techStack === "string" && proj.techStack.trim().length > 0
              ? proj.techStack.split(",").map((s: string) => s.trim())
              : [];
            const team = Array.isArray(proj.team) && proj.team.length > 0
              ? proj.team
              : Array.isArray(proj.teamMembers) && proj.teamMembers.length > 0
              ? proj.teamMembers.map((m: any) => m.fullName || m.name || "Member")
              : [user.fullName || "Club Contributor"];
            const department = proj.department || "webdev";
            const status = (proj.status === "completed" || proj.status === "archived" ? proj.status : "in-progress") as "in-progress" | "completed" | "archived";
            const image = proj.imageUrl || proj.image || "/images/projects/default.jpg";

            return (
              <ProjectCard
                key={id}
                title={proj.title || "Untitled Project"}
                description={proj.description || "Open-source application built by club members."}
                department={department}
                techStack={techStack}
                team={team}
                status={status}
                slug={slug}
                image={image}
                liveUrl={proj.liveDemoLink || proj.liveUrl}
                repoUrl={proj.githubLink || proj.repoUrl}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-text-secondary">
          <Code2 size={48} className="mx-auto mb-3 opacity-40 text-accent-primary" />
          <h3 className="text-lg font-bold text-text-primary mb-1">No Projects Linked Yet</h3>
          <p className="max-w-md mx-auto mb-4 text-sm text-text-secondary">
            Have you built an application or open-source tool? Add your project to automatically showcase your work on the club website and your profile.
          </p>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus size={14} style={{ marginRight: "4px" }} /> Add Your First Project
          </Button>
        </div>
      )}

      {/* Unified Reusable Project Modal */}
      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => onProjectAdded?.()}
        isAdmin={user.role === "admin" || user.role === "moderator"}
      />
    </div>
  );
}
