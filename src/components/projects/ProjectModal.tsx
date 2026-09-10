"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Plus, Globe, Sparkles, Users, Search, Check, FolderGit2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import ImageUpload from "@/components/ui/shared/ImageUpload";

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
  const [githubLink, setGithubLink] = useState("");
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
      setGithubLink(initialData.githubLink || initialData.repoUrl || "");
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
      setGithubLink("");
      setLiveDemoLink("");
      setImageUrl("");
      setTechStackInput("");
      setSelectedMembers([]);
      setFeatured(false);
    }
  }, [isOpen, initialData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Project title and description are required.");
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
        githubLink: githubLink.trim() || undefined,
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
            <div className="w-10 h-10 rounded-xl bg-accent-primary text-black flex items-center justify-center border border-border-default font-black shadow-[2px_2px_0px_0px_var(--border-default)]">
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
          {/* Banner Image */}
          <div>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              label="Project Banner / Thumbnail"
              hint="Recommended aspect ratio 16:9. Used as the card thumbnail in the public showcase."
              folder="projects"
            />
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
                Development Status <span className="text-accent-error">*</span>
              </label>
              <Select
                value={status}
                onChange={(val) => setStatus(val)}
                options={STATUS_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Tech Stack / Skills
              </label>
              <input
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="e.g. Next.js, Node.js, Python, MongoDB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none transition-all"
              />
              <span className="text-[11px] text-text-secondary mt-1 block">Comma-separated tags</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Project Description <span className="text-accent-error">*</span>
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

          {/* Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                <FaGithub size={13} /> GitHub / Repository URL
              </label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                <Globe size={13} /> Live Demo URL
              </label>
              <input
                type="url"
                value={liveDemoLink}
                onChange={(e) => setLiveDemoLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm font-medium focus:ring-2 focus:ring-accent-primary outline-none transition-all"
              />
            </div>
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
                      className="hover:text-accent-error transition-colors ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Input & Dropdown */}
            <div className="relative" ref={memberDropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={15} />
                <input
                  type="text"
                  value={memberSearch}
                  onFocus={() => setShowMemberDropdown(true)}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                  }}
                  placeholder="Search club members by name, student ID, or email..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-default bg-surface-primary text-text-primary text-sm focus:ring-2 focus:ring-accent-primary outline-none transition-all"
                />
              </div>

              {showMemberDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-48 overflow-y-auto bg-surface-elevated rounded-xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] z-30 py-1">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.slice(0, 15).map((m) => (
                      <button
                        type="button"
                        key={m._id}
                        onClick={() => handleAddMember(m)}
                        className="flex items-center justify-between w-full px-3.5 py-2 text-left hover:bg-surface-secondary transition-colors text-xs font-semibold text-text-primary"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold text-[10px]">
                            {(m.fullName || "M").charAt(0)}
                          </span>
                          <div>
                            <span className="font-bold">{m.fullName}</span>
                            {m.studentId && <span className="text-[10px] text-text-secondary ml-1 font-mono">({m.studentId})</span>}
                          </div>
                        </div>
                        <span className="text-[10px] text-accent-primary flex items-center gap-1 font-bold">
                          <Plus size={12} /> Add
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-text-secondary text-center">
                      {memberSearch ? "No members found matching that search" : "All members are already selected"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Admin Toggle: Featured on Home Showcase */}
          {isAdmin && (
            <div className="flex items-center justify-between p-3.5 bg-surface-secondary rounded-xl border border-border-default">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-accent-primary/20 text-accent-primary">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-text-primary block">Feature on Home Showcase</span>
                  <span className="text-[11px] text-text-secondary block">
                    Featured projects are highlighted prominently on the website homepage.
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-elevated border-2 border-border-default peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-primary after:border-border-default after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary peer-checked:after:bg-black"></div>
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
