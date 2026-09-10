"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Project, AuthUser } from "@/types";
import { ProjectCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ProjectModal } from "@/components/projects/ProjectModal";
import {
  Plus,
  Search,
  Sparkles,
  X,
  Code2,
  Globe,
  Tag,
  Star,
  Layers,
  CheckCircle2,
  ExternalLink,
  Shield,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

interface ProjectsClientProps {
  initialProjects: Project[];
}

const DEPARTMENT_OPTIONS = [
  { value: "all", label: "All Departments" },
  { value: "webdev", label: "Web Development" },
  { value: "cp", label: "Competitive Programming" },
  { value: "ml", label: "AI & Machine Learning" },
  { value: "cybersec", label: "Cybersecurity & Systems" },
  { value: "appdev", label: "Mobile Applications" },
  { value: "other", label: "Other Software / Tools" },
];

const FORM_DEPARTMENT_OPTIONS = [
  { value: "webdev", label: "Web Development" },
  { value: "cp", label: "Competitive Programming Tools" },
  { value: "ml", label: "AI & Machine Learning" },
  { value: "cybersec", label: "Cybersecurity & Systems" },
  { value: "appdev", label: "Mobile Applications" },
  { value: "other", label: "Other Software / Open Source" },
];

const STATUS_OPTIONS = [
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "planning", label: "Planning" },
];

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(p.techStack) &&
          p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesDept =
        selectedDept === "all" ||
        p.department?.toLowerCase() === selectedDept.toLowerCase();

      const matchesFeatured = !featuredOnly || Boolean(p.featured);

      return matchesSearch && matchesDept && matchesFeatured;
    });
  }, [projectsList, searchQuery, selectedDept, featuredOnly]);

  const featuredCount = useMemo(() => {
    return projectsList.filter((p) => p.featured).length;
  }, [projectsList]);

  // Open "Add Project" handler
  const handleOpenAddProject = () => {
    if (!isAuthenticated || !user) {
      setShowAuthPrompt(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleProjectSuccess = (newDoc: any) => {
    const skills = Array.isArray(newDoc.techStack) && newDoc.techStack.length > 0
      ? newDoc.techStack
      : Array.isArray(newDoc.requiredSkills)
      ? newDoc.requiredSkills
      : [];

    const newProject: Project = {
      id: newDoc._id || newDoc.id || String(Date.now()),
      slug: newDoc.slug || newDoc._id || newDoc.id,
      title: newDoc.title,
      description: newDoc.description || "",
      department: newDoc.department || "webdev",
      techStack: skills.length > 0 ? skills : ["Code"],
      image: newDoc.imageUrl || newDoc.image || "/images/projects/cp-tracker.jpg",
      team: Array.isArray(newDoc.teamMembers) && newDoc.teamMembers.length > 0
        ? newDoc.teamMembers.map((m: any) => m.fullName || m.name || "Member")
        : [user?.fullName || "Club Member"],
      liveUrl: newDoc.liveDemoLink || newDoc.liveUrl || undefined,
      repoUrl: newDoc.githubLink || newDoc.repoUrl || undefined,
      status: newDoc.status === "completed" ? "completed" : "in-progress",
      featured: Boolean(newDoc.featured),
      createdBy: newDoc.createdBy?._id || newDoc.createdBy || user?.id,
    };

    setProjectsList((prev) => [newProject, ...prev]);
    router.refresh();
  };

  // Toggle Featured (Admin only)
  const handleToggleFeatured = async (project: Project) => {
    if (!isAdmin) return;
    const newFeatured = !project.featured;

    // Optimistic UI update
    setProjectsList((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, featured: newFeatured } : p))
    );

    try {
      await api.patch(`/api/projects/${project.id}/featured`, { featured: newFeatured });
      toast.success(
        newFeatured
          ? `"${project.title}" is now highlighted on the Home page!`
          : `"${project.title}" removed from Home highlights.`
      );
      router.refresh();
    } catch (err: any) {
      // Revert optimistic update
      setProjectsList((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: project.featured } : p))
      );
      toast.error(err?.message || "Failed to update highlight status");
    }
  };

  // Delete project
  const handleDeleteProject = async (project: Project) => {
    const isOwner = user?.id && project.createdBy === user.id;
    if (!isAdmin && !isOwner) {
      toast.error("You don't have permission to delete this project");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/api/projects/${project.id}`);
      setProjectsList((prev) => prev.filter((p) => p.id !== project.id));
      toast.success("Project deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete project");
    }
  };

  return (
    <>
      {/* Header Section */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-default pb-6">
            <div>
              <span className="kicker">Projects &amp; Codebase</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-2">
                Deployed to Production
              </h1>
              <p className="text-base sm:text-lg text-text-secondary max-w-[640px]">
                Real software built by MEC Computer Club members. Any member can showcase their work, and highlights appear on the club homepage.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                onClick={handleOpenAddProject}
                className="inline-flex items-center gap-2 shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)]"
              >
                <Plus size={16} />
                <span>Add Project</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Highlight Quick Banner (Visible only to admins) */}
      {isAdmin && (
        <div className="container mx-auto px-4 md:px-8 pt-2">
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-text-primary">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-amber-500 shrink-0" />
              <span>
                <strong className="font-semibold text-amber-600 dark:text-amber-400">Admin Mode:</strong> You can select which projects appear in the Home page highlights using the <strong>★ Feature on Home</strong> buttons. ({featuredCount} currently highlighted)
              </span>
            </div>
            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`text-xs font-mono font-bold px-3 py-1 rounded border transition-all shrink-0 ${
                featuredOnly
                  ? "bg-amber-500 text-black border-amber-600"
                  : "bg-surface-elevated text-text-primary border-border-default hover:border-amber-500"
              }`}
            >
              {featuredOnly ? "Show All Projects" : "Filter Highlighted Only (★)"}
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <section className="pt-4 pb-2">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-secondary/60 p-3 rounded-xl border border-border-default">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects by title, tech, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-surface-elevated border border-border-default text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
              />
            </div>

            {/* Department Select (Using custom Select complying with AGENTS.md) */}
            <div className="w-full sm:w-[220px]">
              <Select
                value={selectedDept}
                onChange={(val) => setSelectedDept(val)}
                options={DEPARTMENT_OPTIONS}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-8">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-surface-secondary/40 rounded-2xl border border-dashed border-border-default">
              <Layers className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-text-primary mb-1">No projects found</h3>
              <p className="text-sm text-text-secondary max-w-[420px] mx-auto mb-5">
                {searchQuery || selectedDept !== "all" || featuredOnly
                  ? "Try adjusting your filters or search terms."
                  : "Be the first member to publish a project to the club codebase!"}
              </p>
              <Button variant="primary" size="sm" onClick={handleOpenAddProject}>
                <Plus size={14} className="mr-1.5" /> Submit First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const isOwner = user?.id && project.createdBy === user.id;
                return (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    team={project.team || []}
                    isAdmin={isAdmin}
                    canManage={Boolean(isOwner)}
                    onToggleFeatured={isAdmin ? () => handleToggleFeatured(project) : undefined}
                    onDelete={isAdmin || isOwner ? () => handleDeleteProject(project) : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Unified Project Modal ── */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectSuccess}
        isAdmin={isAdmin}
      />

      {/* ── Not Logged In Auth Prompt ── */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl shadow-[8px_8px_0px_0px_var(--border-brutalist)] dark:shadow-[8px_8px_0px_0px_var(--border-default)] w-full max-w-md p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-primary text-white flex items-center justify-center mx-auto mb-4 font-bold">
              <Code2 size={24} />
            </div>
            <h3 className="text-xl font-extrabold text-text-primary mb-2">Member Login Required</h3>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              Any registered club member can publish projects to the club showcase. Please log in or register to add your project!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthPrompt(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                href="/login?redirect=/projects"
              >
                Go to Login →
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
