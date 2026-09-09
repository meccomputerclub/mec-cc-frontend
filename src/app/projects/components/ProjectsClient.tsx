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
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    department: "webdev",
    status: "in-progress",
    description: "",
    techStack: "",
    githubLink: "",
    liveDemoLink: "",
    imageUrl: "",
    featured: false,
  });

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
    setForm({
      title: "",
      department: "webdev",
      status: "in-progress",
      description: "",
      techStack: "",
      githubLink: "",
      liveDemoLink: "",
      imageUrl: "",
      featured: false,
    });
    setIsModalOpen(true);
  };

  // Submit Project
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please enter a title and description.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        department: form.department,
        status: form.status === "in-progress" ? "in_progress" : form.status,
        description: form.description.trim(),
        requiredSkills: form.techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        techStack: form.techStack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        githubLink: form.githubLink.trim() || undefined,
        liveDemoLink: form.liveDemoLink.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        featured: isAdmin ? form.featured : false,
      };

      const res = await api.post("/api/projects", payload);
      const newDoc = res.data || res;

      // Transform backend response to Project interface
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
        team: user?.fullName ? [user.fullName] : ["Club Member"],
        liveUrl: newDoc.liveDemoLink || newDoc.liveUrl || undefined,
        repoUrl: newDoc.githubLink || newDoc.repoUrl || undefined,
        status: newDoc.status === "completed" ? "completed" : "in-progress",
        featured: Boolean(newDoc.featured),
        createdBy: user?.id,
      };

      setProjectsList((prev) => [newProject, ...prev]);
      setIsModalOpen(false);
      toast.success("Project added and published immediately!");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
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

      {/* ── Add Project Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div
            className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl shadow-[8px_8px_0px_0px_var(--border-brutalist)] dark:shadow-[8px_8px_0px_0px_var(--border-default)] w-full max-w-xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-surface-elevated z-10 px-5 py-4 border-b border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-primary text-white flex items-center justify-center font-bold">
                  <Code2 size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-text-primary m-0">
                    Add Club Project
                  </h2>
                  <p className="text-xs text-text-secondary m-0">
                    Your project will appear immediately on the projects page.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitProject} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEC Judge, Campus Chatbot, Alumni Platform"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.department}
                    onChange={(val) => setForm({ ...form, department: val })}
                    options={FORM_DEPARTMENT_OPTIONS}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Status
                  </label>
                  <Select
                    value={form.status}
                    onChange={(val) => setForm({ ...form, status: val })}
                    options={STATUS_OPTIONS}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="What does this project do? What technologies and problems does it address?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Node.js, PostgreSQL, Docker"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={form.githubLink}
                    onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.liveDemoLink}
                    onChange={(e) => setForm({ ...form, liveDemoLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Cover Image URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://... or /images/projects/..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-secondary border border-border-default text-text-primary text-sm focus:outline-none focus:border-accent-primary"
                />
              </div>

              {/* Admin Highlight Checkbox */}
              {isAdmin && (
                <div className="pt-2 border-t border-dashed border-border-default">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-accent-primary border-border-default focus:ring-accent-primary cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-bold text-text-primary flex items-center gap-1">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        Highlight on Home Page
                      </span>
                      <span className="text-xs text-text-secondary block">
                        Will appear in the &quot;Successfully Deployed Projects&quot; showcase on the homepage.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border-default flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="min-w-[120px]"
                >
                  {submitting ? "Publishing..." : "Publish Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
