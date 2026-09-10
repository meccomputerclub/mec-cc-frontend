"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Plus, Globe, Sparkles, Users, Search, Check, FolderGit2, Trash2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import ImageUpload from "@/components/ui/shared/ImageUpload";
import { extractProjectRepositories } from "@/lib/projectUtils";

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: any) => void;
  initialData?: any | null;
  isAdmin?: boolean;
}

const DEPARTMENT_OPTIONS = [
  { value: "webdev", label: "Web Development" },
  { value: "appdev", label: "Mobile Applications" },
  { value: "cp-tools", label: "Competitive Programming Tools" },
  { value: "aiml", label: "AI & Machine Learning" },
  { value: "cybersec", label: "Cybersecurity & Systems" },
  { value: "other", label: "Other Software / Open Source" },
];

const STATUS_OPTIONS = [
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "planning", label: "Planning / Idea" },
  { value: "on_hold", label: "On Hold" },
  { value: "archived", label: "Archived" },
];

export function ProjectModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isAdmin = false,
}: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("webdev");
  const [status, setStatus] = useState("in_progress");
  const [repositories, setRepositories] = useState<Array<{ label: string; url: string }>>([
    { label: "Frontend", url: "" },
  ]);
  const [liveDemoLink, setLiveDemoLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [featured, setFeatured] = useState(false);

  // Fetch members for contributor assignment
  useEffect(() => {
    if (!isOpen) return;
    const loadMembers = async () => {
      try {
        const res = await api.get<{ success?: boolean; members?: any[]; data?: any[] }>("/api/users/all-members");
        const list = res.members || res.data || [];
        if (Array.isArray(list)) {
          setAllMembers(list);
        }
      } catch (err) {
        console.warn("Could not load members list for project teammates:", err);
      }
    };
    loadMembers();
  }, [isOpen]);

  // Handle outside click for member search dropdown
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(e.target as Node)) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Populate data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setDepartment(initialData.department || "webdev");
      setStatus(initialData.status === "in-progress" ? "in_progress" : initialData.status || "in_progress");

      const extractedRepos = extractProjectRepositories(initialData);
      if (extractedRepos.length > 0) {
        setRepositories(extractedRepos);
      } else {
        setRepositories([{ label: "Frontend", url: initialData.githubLink || initialData.repoUrl || "" }]);
      }

      setLiveDemoLink(initialData.liveDemoLink || initialData.liveUrl || "");
      setImageUrl(initialData.imageUrl || initialData.image || "");
      setFeatured(Boolean(initialData.featured));

      const skills = Array.isArray(initialData.techStack)
        ? initialData.techStack
        : Array.isArray(initialData.requiredSkills)
        ? initialData.requiredSkills
        : [];
      setTechStackInput(skills.join(", "));

      if (Array.isArray(initialData.teamMembers)) {
        setSelectedMembers(initialData.teamMembers);
      } else {
        setSelectedMembers([]);
      }
    } else {
      setTitle("");
      setDescription("");
      setDepartment("webdev");
      setStatus("in_progress");
      setRepositories([{ label: "Frontend", url: "" }]);
      setLiveDemoLink("");
      setImageUrl("");
      setTechStackInput("");
      setSelectedMembers([]);
      setFeatured(false);
    }
  }, [isOpen, initialData]);

  // Dynamic preview fallback if no custom image was uploaded
  const autoCoverPreview = useMemo(() => {
    if (imageUrl.trim()) return "";
    const live = liveDemoLink.trim();
    if (live && (live.startsWith("http://") || live.startsWith("https://"))) {
      return `https://s0.wp.com/mshots/v1/${encodeURIComponent(live)}?w=600`;
    }
    const primaryRepo = repositories[0]?.url.trim() || "";
    const ghMatch = primaryRepo.match(/github\.com\/([^\/]+)\/([^\/\#\?]+)/i);
    if (ghMatch) {
      const owner = ghMatch[1];
      const repoName = ghMatch[2].replace(/\.git$/i, "");
      return `https://opengraph.githubassets.com/1/${owner}/${repoName}`;
    }
    return "";
  }, [imageUrl, liveDemoLink, repositories]);

  if (!isOpen) return null;

  const filteredMembers = allMembers.filter((m) => {
    if (selectedMembers.some((sm) => sm._id === m._id)) return false;
    const query = memberSearch.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = m.fullName?.toLowerCase().includes(query);
    const idMatch = m.studentId?.toLowerCase().includes(query);
    const emailMatch = m.email?.toLowerCase().includes(query);
    return nameMatch || idMatch || emailMatch;
  });

  const handleAddMember = (m: any) => {
    setSelectedMembers((prev) => [...prev, m]);
    setMemberSearch("");
    setShowMemberDropdown(false);
  };

  const handleRemoveMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== id));
  };

  // Repository management
  const handleAddRepo = () => {
    const nextLabel = repositories.length === 1 ? "Backend" : `Repository #${repositories.length + 1}`;
    setRepositories((prev) => [...prev, { label: nextLabel, url: "" }]);
  };

  const handleUpdateRepo = (index: number, field: "label" | "url", value: string) => {
    setRepositories((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveRepo = (index: number) => {
    if (repositories.length <= 1) {
      toast.error("At least one GitHub repository link is required.");
      return;
    }
    setRepositories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Project title and description are required.");
      return;
    }

    // Validation: at least one GitHub repository link is mandatory
    const validRepos = repositories.filter((r) => r.url.trim().length > 0);
    if (validRepos.length === 0) {
      toast.error("At least one GitHub repository link is mandatory.");
      return;
    }

    setLoading(true);
    try {
      const skills = techStackInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        department,
        status,
        githubLink: validRepos[0].url.trim(),
        githubRepositories: validRepos.map((r) => ({
          label: r.label.trim() || "Repository",
          url: r.url.trim(),
        })),
        githubLinks: validRepos.map((r) => r.url.trim()),
        liveDemoLink: liveDemoLink.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        techStack: skills,
        requiredSkills: skills,
        teamMembers: selectedMembers.map((m) => m._id),
      };

      if (isAdmin) {
        payload.featured = featured;
      }

      let res;
      if (initialData?._id || initialData?.id) {
        const id = initialData._id || initialData.id;
        res = await api.patch(`/api/projects/${id}`, payload);
        toast.success("Project updated successfully!");
      } else {
        res = await api.post("/api/projects", payload);
        toast.success("Project published successfully!");
      }

      const savedDoc = res?.data || res;
      if (onSuccess) onSuccess(savedDoc);
      onClose();
    } catch (err: any) {
      console.error("Project submission error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div
        className="relative w-full max-w-3xl my-auto bg-surface-elevated rounded-2xl border-2 border-border-brutalist dark:border-border-default shadow-[6px_6px_0px_0px_var(--border-brutalist)] dark:shadow-[6px_6px_0px_0px_var(--border-default)] overflow-hidden animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border-default bg-surface-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary-light/50 dark:bg-accent-primary/20 text-accent-text-on-surface dark:text-accent-primary flex items-center justify-center border border-accent-primary/30 font-black shadow-[2px_2px_0px_0px_var(--border-default)]">
              <FolderGit2 size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-text-primary">
                {initialData ? "Edit Project" : "Add New Project"}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Showcase your software, tools, and repositories on the MEC Computer Club platform.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-transparent hover:border-border-default transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Banner Image with Auto-Preview Fallback */}
          <div>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              label="Project Banner / Thumbnail"
              hint="Images are auto-compressed to WebP under 1.5MB before upload. 16:9 ratio recommended."
              folder="projects"
            />
            {!imageUrl && autoCoverPreview && (
              <div className="mt-2.5 p-3 rounded-xl border border-dashed border-accent-primary/50 bg-accent-primary/5 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-border-default shrink-0 bg-surface-secondary">
                  <img
                    src={autoCoverPreview}
                    alt="Auto preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-text-secondary flex-1">
                  <span className="font-bold text-text-primary inline-flex items-center gap-1">
                    <Sparkles size={12} className="text-accent-primary" />
                    Auto-preview fallback:
                  </span>{" "}
                  {liveDemoLink.trim()
                    ? "Live website screenshot will be displayed automatically in the project cards."
                    : "GitHub repository card will be displayed automatically in the project cards."}
                  {" "}Upload an image above to use a custom banner.
                </div>
              </div>
            )}
          </div>

          {/* Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Project Title <span className="text-accent-error">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MEC Judge, Campus AI Assistant"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Domain / Department <span className="text-accent-error">*</span>
              </label>
              <Select
                value={department}
                onChange={(val) => setDepartment(val)}
                options={DEPARTMENT_OPTIONS}
              />
            </div>
          </div>

          {/* Status & Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Project Status <span className="text-accent-error">*</span>
              </label>
              <Select
                value={status}
                onChange={(val) => setStatus(val)}
                options={STATUS_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Tech Stack <span className="text-text-secondary font-normal lowercase">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="Next.js, TypeScript, MongoDB, Tailwind"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Description &amp; Overview <span className="text-accent-error">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the software solves, key features, architecture, and technology highlights..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none transition-all resize-y"
            />
          </div>

          {/* GitHub Repositories (Multi-repo with + icon) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-surface-secondary/40 border border-border-default">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
                <FaGithub size={13} /> GitHub Repositories <span className="text-accent-error">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddRepo}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent-text-on-surface dark:text-accent-primary hover:underline"
              >
                <Plus size={13} /> Add Extra Repo (e.g. Backend, Frontend)
              </button>
            </div>

            {repositories.map((repo, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={repo.label}
                  onChange={(e) => handleUpdateRepo(idx, "label", e.target.value)}
                  placeholder="e.g. Frontend / Backend"
                  className="w-28 sm:w-36 px-3 py-2 rounded-xl border border-border-default bg-surface-primary text-text-primary text-xs font-bold focus:ring-2 focus:ring-accent-primary outline-none shrink-0"
                />
                <input
                  type="url"
                  value={repo.url}
                  onChange={(e) => handleUpdateRepo(idx, "url", e.target.value)}
                  placeholder="https://github.com/organization/repo"
                  required={idx === 0}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none min-w-0"
                />
                {repositories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRepo(idx)}
                    className="p-2 rounded-lg text-accent-error hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                    title="Remove Repository"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
            <p className="text-[11px] text-text-secondary">
              Link your repository (frontend, backend, or full-stack). At least one GitHub repository is mandatory.
            </p>
          </div>

          {/* Live Demo URL */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              <Globe size={13} /> Live Demo URL <span className="text-text-secondary font-normal lowercase">(optional)</span>
            </label>
            <input
              type="url"
              value={liveDemoLink}
              onChange={(e) => setLiveDemoLink(e.target.value)}
              placeholder="https://your-project.vercel.app"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none transition-all"
            />
          </div>

          {/* Contributor / Teammate Picker */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              <span className="flex items-center gap-1.5">
                <Users size={13} /> Team Members &amp; Contributors ({selectedMembers.length})
              </span>
              <span className="text-[11px] font-normal lowercase text-text-secondary">
                Auto-links to member profiles
              </span>
            </label>

            {/* Selected Member Chips */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-2 bg-surface-secondary rounded-xl border border-border-default">
                {selectedMembers.map((m) => (
                  <span
                    key={m._id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-default text-xs font-semibold text-text-primary shadow-sm"
                  >
                    {m.fullName || m.name || "Member"}
                    {m.studentId && <span className="text-[10px] text-text-secondary font-mono">({m.studentId})</span>}
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m._id)}
                      className="text-text-secondary hover:text-accent-error p-0.5 rounded transition-colors"
                      aria-label={`Remove ${m.fullName}`}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Searchable dropdown input */}
            <div className="relative" ref={memberDropdownRef}>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={memberSearch}
                  onFocus={() => setShowMemberDropdown(true)}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                  }}
                  placeholder="Search club members by name, student ID, or email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none transition-all"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showMemberDropdown && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-surface-elevated border border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] z-50 max-h-52 overflow-y-auto">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.slice(0, 10).map((m) => (
                      <button
                        key={m._id}
                        type="button"
                        onClick={() => handleAddMember(m)}
                        className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-surface-secondary border-b border-border-default last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-surface-secondary flex items-center justify-center font-bold text-xs text-text-primary overflow-hidden border border-border-default">
                            {m.imageUrl ? (
                              <img src={m.imageUrl} alt={m.fullName} className="w-full h-full object-cover" />
                            ) : (
                              m.fullName?.charAt(0) || "U"
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-primary">{m.fullName}</p>
                            <p className="text-[10px] text-text-secondary font-mono">
                              ID: {m.studentId || "N/A"} · {m.department || "CSE"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-accent-primary flex items-center gap-1">
                          <Plus size={12} /> Add
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-xs text-text-secondary">
                      No matching verified club members found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Admin Spotlight / Featured Toggle */}
          {isAdmin && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-border-default bg-surface-secondary">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-primary-light/50 dark:bg-accent-primary/20 flex items-center justify-center text-accent-text-on-surface dark:text-accent-primary border border-accent-primary/30">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Feature on Home Showcase</h4>
                  <p className="text-xs text-text-secondary">
                    Featured projects are highlighted prominently on the website homepage.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-elevated border-2 border-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-primary after:border-border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary peer-checked:after:bg-surface-elevated"></div>
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-default">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Processing..." : (initialData ? "Save Changes" : "Publish Project")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
