"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ui/Card";
import { Code2, Plus } from "lucide-react";
import { ProjectModal } from "@/components/projects/ProjectModal";

interface ProjectsTabProps {
  user: AuthUser;
  projects: any[];
}

export function ProjectsTab({ user, projects }: ProjectsTabProps) {
  const [projectsList, setProjectsList] = useState<any[]>(projects);
  const [showModal, setShowModal] = useState(false);

  const handleProjectSuccess = (newDoc: any) => {
    setProjectsList((prev) => [newDoc, ...prev]);
  };

  return (
    <div className="db-panel">
      <div className="db-panel-header">
        <div>
          <h2>Club Projects &amp; Software ({projectsList.length})</h2>
          <p>Open-source tools, platforms, and applications built by club members.</p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={14} style={{ marginRight: "4px" }} /> Add Project
        </Button>
      </div>

      {/* ── Project Cards Grid ── */}
      {projectsList.length > 0 ? (
        <div className="grid grid--3">
          {projectsList.map((proj) => {
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
            const image = proj.image || proj.imageUrl || "/images/projects/default.jpg";

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
                liveUrl={proj.liveUrl || proj.liveDemoLink}
                featured={Boolean(proj.featured)}
              />
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "var(--space-8) 0", color: "var(--text-secondary)" }}>
          <Code2 size={48} style={{ margin: "0 auto var(--space-3)", opacity: 0.4 }} />
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-1)" }}>No Projects Linked Yet</h3>
          <p style={{ maxWidth: "480px", margin: "0 auto var(--space-4)" }}>
            Have you built an application or open-source tool? Add your project to showcase your work on the club website and link it to your profile.
          </p>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus size={14} style={{ marginRight: "4px" }} /> Add a Project
          </Button>
        </div>
      )}

      {/* Unified Project Modal */}
      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleProjectSuccess}
        isAdmin={user.role === "admin" || user.role === "moderator"}
      />
    </div>
  );
}
