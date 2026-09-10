"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FolderGit2,
  Plus,
  Search,
  Sparkles,
  Globe,
  Pencil,
  Trash2,
  Users,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ProjectModal } from "@/components/projects/ProjectModal";
import FilterSelect from "@/app/dashboard/components/FilterSelect";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  // Fetch all projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success?: boolean; data?: any[] }>("/api/projects");
      const list = res.data || [];
      if (Array.isArray(list)) {
        setProjects(list);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      toast.error("Could not fetch projects list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.techStack?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = deptFilter === "all" || p.department === deptFilter;
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && p.featured) ||
        (featuredFilter === "standard" && !p.featured);

      return matchesSearch && matchesDept && matchesFeatured;
    });
  }, [projects, searchQuery, deptFilter, featuredFilter]);

  // Toggle Featured
  const handleToggleFeatured = async (project: any) => {
    try {
      const newStatus = !project.featured;
      await api.patch(`/api/projects/${project._id || project.id}/featured`, {
        featured: newStatus,
      });
      setProjects((prev) =>
        prev.map((p) =>
          (p._id || p.id) === (project._id || project.id) ? { ...p, featured: newStatus } : p
        )
      );
      toast.success(newStatus ? "Project highlighted on Home page!" : "Removed from Home showcase");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update featured status");
    }
  };

  // Delete Project
  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success("Project deleted successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete project");
    }
  };

  const handleOpenAdd = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const featuredCount = projects.filter((p) => p.featured).length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-primary text-black flex items-center justify-center border border-border-default font-black shadow-[2px_2px_0px_0px_var(--border-default)]">
              <FolderGit2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                Software &amp; Projects
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Manage club software, open-source repositories, showcase highlights, and contributors.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" size="md">
          <Plus size={16} style={{ marginRight: "6px" }} /> Add Project
        </Button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-surface-elevated rounded-xl border border-border-default shadow-[3px_3px_0px_0px_var(--border-default)]">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Total Projects</span>
          <p className="text-2xl sm:text-3xl font-black text-text-primary mt-1">{projects.length}</p>
        </div>
        <div className="p-4 bg-surface-elevated rounded-xl border border-border-default shadow-[3px_3px_0px_0px_var(--border-default)]">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
            <Sparkles size={14} className="text-accent-primary" /> Featured on Home
          </span>
          <p className="text-2xl sm:text-3xl font-black text-text-primary mt-1">{featuredCount}</p>
        </div>
        <div className="p-4 bg-surface-elevated rounded-xl border border-border-default shadow-[3px_3px_0px_0px_var(--border-default)]">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
            <CheckCircle2 size={14} className="text-accent-success" /> Completed
          </span>
          <p className="text-2xl sm:text-3xl font-black text-text-primary mt-1">{completedCount}</p>
        </div>
        <div className="p-4 bg-surface-elevated rounded-xl border border-border-default shadow-[3px_3px_0px_0px_var(--border-default)]">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
            <Clock size={14} className="text-accent-warning" /> In Development
          </span>
          <p className="text-2xl sm:text-3xl font-black text-text-primary mt-1">{projects.length - completedCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-elevated rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <input
            type="text"
            placeholder="Search by title, tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm focus:ring-2 focus:ring-accent-primary outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <div className="w-full sm:w-48">
            <FilterSelect
              value={deptFilter}
              onChange={(val) => setDeptFilter(val)}
              options={[
                { value: "all", label: "All Departments" },
                { value: "webdev", label: "Web Development" },
                { value: "appdev", label: "Mobile Apps" },
                { value: "cp-tools", label: "CP Tools" },
                { value: "aiml", label: "AI & Machine Learning" },
                { value: "cybersec", label: "Cybersecurity" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>

          <div className="w-full sm:w-44">
            <FilterSelect
              value={featuredFilter}
              onChange={(val) => setFeaturedFilter(val)}
              options={[
                { value: "all", label: "All Showcase" },
                { value: "featured", label: "⭐ Featured Only" },
                { value: "standard", label: "Standard Only" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-surface-secondary border border-border-default animate-pulse"
            />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const id = project._id || project.id;
            const skills = Array.isArray(project.techStack)
              ? project.techStack
              : Array.isArray(project.requiredSkills)
              ? project.requiredSkills
              : [];

            return (
              <div
                key={id}
                className="group relative bg-surface-elevated rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-[6px_6px_0px_0px_var(--border-default)] hover:-translate-y-0.5 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Thumbnail / Header */}
                <div className="relative h-40 w-full bg-surface-secondary overflow-hidden border-b border-border-default">
                  {project.imageUrl || project.image ? (
                    <img
                      src={project.imageUrl || project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-secondary text-text-secondary">
                      <FolderGit2 size={44} className="opacity-30" />
                    </div>
                  )}

                  {/* Status & Featured Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-surface-elevated border border-border-default text-text-primary shadow-sm">
                      {project.status?.replace("_", " ") || "In Progress"}
                    </span>
                    {project.featured && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent-primary text-black border border-black shadow-sm flex items-center gap-1">
                        <Sparkles size={11} /> Featured
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Top Right */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleFeatured(project)}
                      title={project.featured ? "Remove from Home Showcase" : "Feature on Home Showcase"}
                      className={`p-1.5 rounded-lg border border-border-default transition-colors shadow-sm ${
                        project.featured
                          ? "bg-accent-primary text-black"
                          : "bg-surface-elevated text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <Sparkles size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(project)}
                      title="Edit Project"
                      className="p-1.5 rounded-lg bg-surface-elevated border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors shadow-sm"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(id, project.title)}
                      title="Delete Project"
                      className="p-1.5 rounded-lg bg-surface-elevated border border-border-default text-accent-error hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tech Stack Chips */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {skills.slice(0, 4).map((tech: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-surface-secondary text-[11px] font-semibold text-text-secondary border border-border-default"
                          >
                            {tech}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-text-secondary font-bold">
                            +{skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Team Members & Links Footer */}
                  <div className="mt-5 pt-3.5 border-t border-border-default flex items-center justify-between">
                    {/* Contributor Avatars / Count */}
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Users size={14} />
                      <span className="font-semibold text-text-primary">
                        {project.teamMembers?.length || (project.createdBy ? 1 : 0)}
                      </span>
                      <span>contributor(s)</span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-2">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="GitHub Repository"
                          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                        >
                          <FaGithub size={15} />
                        </a>
                      )}
                      {project.liveDemoLink && (
                        <a
                          href={project.liveDemoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Live Demo"
                          className="p-1.5 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-surface-secondary transition-colors"
                        >
                          <Globe size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-elevated rounded-2xl border-2 border-dashed border-border-default shadow-[4px_4px_0px_0px_var(--border-default)]">
          <FolderGit2 className="mx-auto text-text-secondary mb-3 opacity-40" size={44} />
          <h3 className="text-base font-bold text-text-primary">No projects found</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            {searchQuery || deptFilter !== "all"
              ? "Try adjusting your filters or search keywords."
              : "No projects have been added yet. Click 'Add Project' above to create one."}
          </p>
          <Button onClick={handleOpenAdd} variant="primary" size="sm" className="mt-4">
            <Plus size={14} style={{ marginRight: "4px" }} /> Add First Project
          </Button>
        </div>
      )}

      {/* Unified Project Modal Form */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchProjects()}
        initialData={editingProject}
        isAdmin={true}
      />
    </div>
  );
}
