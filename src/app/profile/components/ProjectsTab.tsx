"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";
import { Code2, Plus, X, Sparkles, Send } from "lucide-react";

import { api } from "@/lib/api";

interface ProjectsTabProps {
  user: AuthUser;
  projects: any[];
  onProjectAdded?: () => void;
}

const DEPARTMENT_OPTIONS = [
  { value: "webdev", label: "Web Development" },
  { value: "cp-tools", label: "Competitive Programming Tools" },
  { value: "appdev", label: "Mobile Applications" },
  { value: "aiml", label: "AI & Machine Learning" },
  { value: "cybersec", label: "Cybersecurity & Systems" },
  { value: "other", label: "Other Software / Open Source" },
];

export function ProjectsTab({ user, projects, onProjectAdded }: ProjectsTabProps) {
  const [showProposePanel, setShowProposePanel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalData, setProposalData] = useState({
    title: "",
    department: "webdev",
    description: "",
    repoUrl: "",
    liveUrl: "",
    techStack: "",
  });

  const handleProposeProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/api/projects/propose", proposalData);
      toast.success("Project added successfully!");
      setIsSubmitting(false);
      setShowProposePanel(false);
      setProposalData({
        title: "",
        department: "webdev",
        description: "",
        repoUrl: "",
        liveUrl: "",
        techStack: "",
      });
      if (onProjectAdded) onProjectAdded();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit project");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
        <div>
          <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">My Projects &amp; Software ({projects.length})</h2>
          <p className="font-body text-xs text-text-secondary mt-0.5">Software, tools, and repositories you have created or contributed to.</p>
        </div>
        <Button
          size="sm"
          variant={showProposePanel ? "outline" : "primary"}
          onClick={() => setShowProposePanel(!showProposePanel)}
        >
          {showProposePanel ? (
            <>
              <X size={14} style={{ marginRight: "4px" }} /> Close Form
            </>
          ) : (
            <>
              <Plus size={14} style={{ marginRight: "4px" }} /> Propose Project
            </>
          )}
        </Button>
      </div>

      {/* Inline Expandable Proposal Panel */}
      {showProposePanel && (
        <div className="bg-surface-secondary border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[3px_3px_0px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_0px_var(--border-default)] p-4 sm:p-5 mb-6 animate-[fadeIn_0.25s_ease-out]">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-dashed border-border-default">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-md bg-accent-primary text-black flex items-center justify-center border-[1.5px] border-black shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="m-0 text-base font-extrabold text-text-primary">Propose or Link a Project</h3>
                <p className="m-0 text-xs sm:text-[13px] text-text-secondary">
                  Submit your application to be reviewed and showcased on the club platform.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProposePanel(false)}
              className="bg-transparent border-none cursor-pointer text-text-tertiary flex items-center justify-center p-1 hover:text-text-primary transition-colors"
              title="Close form"
              aria-label="Close proposal form"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleProposeProject} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pj-title" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  Project Title <span className="text-accent-primary">*</span>
                </label>
                <input
                  id="pj-title"
                  type="text"
                  required
                  placeholder="e.g. SEC Contest Judge & Leaderboard"
                  value={proposalData.title}
                  onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pj-dept" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">Project Domain / Category</label>
                <Select
                  id="pj-dept"
                  value={proposalData.department}
                  options={DEPARTMENT_OPTIONS}
                  onChange={(val) => setProposalData({ ...proposalData, department: val })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pj-desc" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                Project Description <span className="text-accent-primary">*</span>
              </label>
              <textarea
                id="pj-desc"
                rows={3}
                required
                placeholder="Briefly describe what this software does, target audience, and key features..."
                value={proposalData.description}
                onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                className="w-full p-3 rounded-md bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default text-text-primary font-body text-sm shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pj-repo" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  GitHub Repository URL <span className="text-accent-primary">*</span>
                </label>
                <input
                  id="pj-repo"
                  type="text"
                  inputMode="url"
                  required
                  placeholder="https://github.com/username/project"
                  value={proposalData.repoUrl}
                  onChange={(e) => setProposalData({ ...proposalData, repoUrl: e.target.value })}
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pj-live" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">Live Demo / Deployment URL (Optional)</label>
                <input
                  id="pj-live"
                  type="text"
                  inputMode="url"
                  placeholder="https://my-app.vercel.app"
                  value={proposalData.liveUrl}
                  onChange={(e) => setProposalData({ ...proposalData, liveUrl: e.target.value })}
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pj-tech" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">Tech Stack (comma separated)</label>
              <input
                id="pj-tech"
                type="text"
                placeholder="React, TypeScript, Next.js, Node.js, Tailwind"
                value={proposalData.techStack}
                onChange={(e) => setProposalData({ ...proposalData, techStack: e.target.value })}
                className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowProposePanel(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                <Send size={13} style={{ marginRight: "5px" }} />
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </div>
          </form>
        </div>
      )}

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
              : typeof proj.team === "string" && proj.team.trim().length > 0
              ? proj.team.split(",").map((s: string) => s.trim())
              : [user.fullName || "Club Contributor"];
            const department = proj.department || "webdev";
            const status = (proj.status === "completed" || proj.status === "archived" ? proj.status : "in-progress") as "in-progress" | "completed" | "archived";
            const image = proj.image || "/images/projects/default.jpg";

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
                liveUrl={proj.liveUrl}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-text-secondary">
          <Code2 size={48} className="mx-auto mb-3 opacity-40 text-accent-primary" />
          <h3 className="text-lg font-bold text-text-primary mb-1">No Projects Linked Yet</h3>
          <p className="max-w-md mx-auto mb-4 text-sm text-text-secondary">
            Have you built an application or open-source tool? Link your repository to showcase your work on the club website.
          </p>
          <Button size="sm" onClick={() => setShowProposePanel(true)}>
            <Plus size={14} style={{ marginRight: "4px" }} /> Propose a Project
          </Button>
        </div>
      )}
    </div>
  );
}
