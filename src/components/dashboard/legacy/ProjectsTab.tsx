"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";
import { Code2, Plus, X, Sparkles, Send, CheckCircle2, Layers } from "lucide-react";

interface ProjectsTabProps {
  user: AuthUser;
  projects: any[];
}

const DEPARTMENT_OPTIONS = [
  { value: "webdev", label: "Web Development" },
  { value: "cp-tools", label: "Competitive Programming Tools" },
  { value: "appdev", label: "Mobile Applications" },
  { value: "aiml", label: "AI & Machine Learning" },
  { value: "cybersec", label: "Cybersecurity & Systems" },
  { value: "other", label: "Other Software / Open Source" },
];

export function ProjectsTab({ user, projects }: ProjectsTabProps) {
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

  const handleProposeProject = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("Project proposal submitted to club project leads!");
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
    }, 400);
  };

  return (
    <div className="db-panel">
      <div className="db-panel-header">
        <div>
          <h2>Club Projects &amp; Software ({projects.length})</h2>
          <p>Open-source tools, platforms, and applications built by club members.</p>
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

      {/* ── Inline Expandable Proposal Panel (No Modal / No Popup) ── */}
      {showProposePanel && (
        <div
          style={{
            background: "var(--surface-secondary)",
            border: "1.5px solid var(--border-brutalist)",
            boxShadow: "3px 3px 0 var(--border-brutalist)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5)",
            marginBottom: "var(--space-6)",
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-4)",
              paddingBottom: "var(--space-3)",
              borderBottom: "1px dashed var(--border-default)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent-primary)",
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #000",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Propose or Link a Project</h3>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  Submit your application to be reviewed and showcased on the club platform.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProposePanel(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
              }}
              title="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleProposeProject} className="jc-form" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div className="jc-form__row jc-form__row--2">
              <div className="jc-form-group">
                <label htmlFor="pj-title">
                  Project Title <span style={{ color: "var(--accent-primary)" }}>*</span>
                </label>
                <input
                  id="pj-title"
                  type="text"
                  required
                  placeholder="e.g. SEC Contest Judge & Leaderboard"
                  value={proposalData.title}
                  onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
                />
              </div>

              <div className="jc-form-group">
                <label htmlFor="pj-dept">Project Domain / Category</label>
                <Select
                  id="pj-dept"
                  value={proposalData.department}
                  options={DEPARTMENT_OPTIONS}
                  onChange={(val) => setProposalData({ ...proposalData, department: val })}
                />
              </div>
            </div>

            <div className="jc-form-group">
              <label htmlFor="pj-desc">
                Project Description <span style={{ color: "var(--accent-primary)" }}>*</span>
              </label>
              <textarea
                id="pj-desc"
                rows={3}
                required
                placeholder="Briefly describe what this software does, target audience, and key features..."
                value={proposalData.description}
                onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
                style={{
                  width: "100%",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-primary)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  fontSize: "var(--text-sm)",
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>

            <div className="jc-form__row jc-form__row--2">
              <div className="jc-form-group">
                <label htmlFor="pj-repo">
                  GitHub Repository URL <span style={{ color: "var(--accent-primary)" }}>*</span>
                </label>
                <input
                  id="pj-repo"
                  type="text"
                  inputMode="url"
                  required
                  placeholder="https://github.com/username/project"
                  value={proposalData.repoUrl}
                  onChange={(e) => setProposalData({ ...proposalData, repoUrl: e.target.value })}
                />
              </div>

              <div className="jc-form-group">
                <label htmlFor="pj-live">Live Demo / Deployment URL (Optional)</label>
                <input
                  id="pj-live"
                  type="text"
                  inputMode="url"
                  placeholder="https://my-app.vercel.app"
                  value={proposalData.liveUrl}
                  onChange={(e) => setProposalData({ ...proposalData, liveUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="jc-form-group">
              <label htmlFor="pj-tech">Tech Stack (comma separated)</label>
              <input
                id="pj-tech"
                type="text"
                placeholder="React, TypeScript, Next.js, Node.js, Tailwind"
                value={proposalData.techStack}
                onChange={(e) => setProposalData({ ...proposalData, techStack: e.target.value })}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
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

      {/* ── Project Cards Grid ── */}
      {projects.length > 0 ? (
        <div className="grid grid--3">
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
        <div style={{ textAlign: "center", padding: "var(--space-8) 0", color: "var(--text-secondary)" }}>
          <Code2 size={48} style={{ margin: "0 auto var(--space-3)", opacity: 0.4 }} />
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-1)" }}>No Projects Linked Yet</h3>
          <p style={{ maxWidth: "480px", margin: "0 auto var(--space-4)" }}>
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
