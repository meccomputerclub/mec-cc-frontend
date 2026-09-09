"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Crown,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Mail,
  Building2,
  Layers,
  Award,
  ExternalLink,
  Copy,
  Code2,
  Globe,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { formatDeptSession } from "@/lib/formatters";
import { getBatchOptions } from "@/lib/batchUtils";
import { useAuth } from "@/context/AuthContext";
import { AuthUser } from "@/types";

/* ── Social SVGs ── */
const IconGH = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const IconLI = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const IconFB = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const IconCF = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="2" y="10" width="4" height="12" rx="1" />
    <rect x="10" y="4" width="4" height="18" rx="1" />
    <rect x="18" y="7" width="4" height="15" rx="1" />
  </svg>
);
const IconCC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.2574.0039c-.37.0101-.7353.041-1.1003.095C9.6164.153 9.0766.4236 8.482.694c-.757.3244-1.5147.6486-2.2176.7027-1.1896.3785-1.568.919-1.8925 1.3516 0 .054-.054.1079-.054.1079-.4325.865-.4873 1.73-.325 2.5952.1621.5407.3786 1.0282.5408 1.5148.3785 1.0274.7578 2.0007.92 3.1362.1622.3244.3235.7571.4316 1.1897.2704.8651.542 1.8383 1.353 2.5952l.0057-.0028c.0175.0183.0301.0387.0482.0568.0072-.0036.0141-.0063.0213-.0099l-.0213-.5849c.6489-.9733 1.5673-1.6221 2.865-1.8925.5195-.1093 1.081-.1497 1.6625-.1278a8.7733 8.7733 0 0 1 1.7988.2357c1.4599.3785 2.595 1.1358 2.6492 1.7846.0273.3549.0398.6952.0326 1.0364-.001.064-.0046.1285-.007.193l.1362.0682c.075-.0375.1424-.107.2059-.1902.0008-.001.002-.002.0028-.0028.0018-.0023.0039-.0061.0057-.0085.0396-.0536.0747-.1236.1107-.1931.0188-.0377.0372-.0866.0554-.1292.2048-.4622.362-1.1536.538-1.9635.0541-.2703.1092-.4864.1633-.7027.4326-.9733 1.0266-1.8382 1.6213-2.6492.9733-1.3518 1.8928-2.5962 1.7846-4.0561-1.784-3.4608-4.2718-4.0017-5.5695-4.272-.2163-.0541-.3233-.0539-.4856-.108-1.3382-.2433-2.4945-.3953-3.6046-.3648zm5.0428 14.3788a9.8602 9.8602 0 0 0-.0326-.9824c-.0541-.703-1.1892-1.46-2.7032-1.8386-.588-.1336-1.1764-.2142-1.7448-.2356-.539-.0137-1.0657.0248-1.5546.1277-1.2436.2704-2.2162.9193-2.811 1.8925l.0511 1.431c.6672-.3558 1.7326-.8747 3.139-.9994.0662-.0059.1368-.0059.2044-.0099.1177-.013.2667-.044.4444-.044 1.6075 0 3.2682.5336 4.8767 1.6483.039-.2744.0611-.549.071-.8234l.044.0227c.0028-.0622.0143-.1268.0156-.1888z" />
  </svg>
);
const IconDiscord = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

import { API_BASE_URL } from "@/lib/api";
const API_URL = API_BASE_URL;

const DEPARTMENT_OPTIONS = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "EEE", label: "Electrical & Electronic Engineering (EEE)" },
  { value: "CE", label: "Civil Engineering (CE)" },
];

const SYSTEM_ROLE_OPTIONS = [
  { value: "member", label: "Member (Standard User)" },
  { value: "moderator", label: "Moderator (Staff Access)" },
  { value: "admin", label: "Administrator (Full Access)" },
  { value: "executive", label: "Executive (Panel Member)" },
  { value: "alumni", label: "Alumni (Graduate Member)" },
  { value: "guest", label: "Guest (Unverified)" },
];

const CLUB_ROLE_OPTIONS = [
  { value: "member", label: "General Member" },
  { value: "executive", label: "Executive Committee" },
  { value: "alumni", label: "Alumni Network" },
  { value: "advisor", label: "Faculty Advisor" },
];

const APPLICATION_STATUS_OPTIONS = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending Review" },
  { value: "rejected", label: "Rejected" },
];

const PROFILE_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "incomplete", label: "Incomplete" },
  { value: "deleted", label: "Deleted" },
  { value: "banned", label: "Banned / Suspended" },
];

const POPULAR_SKILLS = [
  "C++",
  "Competitive Programming",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "TailwindCSS",
  "Git & GitHub",
  "Machine Learning",
  "Django",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Problem Solving",
];

export default function DashboardMemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = (params?.id as string) || "";
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global batch settings config from site-settings
  const [batchConfig, setBatchConfig] = useState<Record<string, number>>({
    CSE: 6,
    EEE: 14,
    CE: 8,
  });

  // Edit Form State
  const [editData, setEditData] = useState<Partial<AuthUser>>({});

  // Fetch Member Details
  const fetchMember = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/users/profile/${encodeURIComponent(userId)}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMember(json.data);
          // Initialize edit form data
          setEditData({
            fullName: json.data.fullName || "",
            email: json.data.email || "",
            studentId: json.data.studentId || "",
            department: json.data.department || "CSE",
            batch: json.data.batch || "",
            session: json.data.session || "",
            isGraduated: Boolean(json.data.isGraduated),
            passingYear: json.data.passingYear || undefined,
            role: json.data.role || "member",
            clubRole: json.data.clubRole || "member",
            customRole: json.data.customRole || json.data.designation || "",
            designation: json.data.designation || "",
            applicationStatus: json.data.applicationStatus || "approved",
            profileStatus: json.data.profileStatus || "active",
            contactNumber: json.data.contactNumber || "",
            address: json.data.address || "",
            bio: json.data.bio || "",
            website: json.data.website || "",
            skills: Array.isArray(json.data.skills) ? [...json.data.skills] : [],
            imageUrl: json.data.imageUrl || "",
            imagePosition: json.data.imagePosition || "50% 50%",
            coverUrl: json.data.coverUrl || "",
            coverPosition: json.data.coverPosition || "50% 50%",
            socialLinks: { ...(json.data.socialLinks || {}) },
          });
          setLoading(false);
          return;
        }
      }
      setError("Member not found with ID: " + userId);
    } catch (err: any) {
      console.error("Error fetching member details:", err);
      setError("Failed to fetch member details from server.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch public site settings for dynamic batches
  useEffect(() => {
    fetch(`${API_URL}/api/site-settings/public`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const cfg: Record<string, number> = {};
          if (json.data.batch_current_cse) cfg.CSE = parseInt(json.data.batch_current_cse, 10);
          if (json.data.batch_current_eee) cfg.EEE = parseInt(json.data.batch_current_eee, 10);
          if (json.data.batch_current_ce) cfg.CE = parseInt(json.data.batch_current_ce, 10);
          if (Object.keys(cfg).length > 0) {
            setBatchConfig((prev) => ({ ...prev, ...cfg }));
          }
        }
      })
      .catch(() => {
        // Fallback to defaults
      });

    fetchMember();
  }, [fetchMember]);

  const copyText = (txt: string, label: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(txt);
      toast.success(`${label} copied!`);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const publicUrl = `${window.location.origin}/profile/${userId}`;
      navigator.clipboard.writeText(publicUrl);
      toast.success("Public profile link copied to clipboard!");
    }
  };

  // Toggle skill addition
  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    const current = editData.skills || [];
    if (!current.includes(trimmed)) {
      setEditData((prev) => ({ ...prev, skills: [...current, trimmed] }));
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }));
  };

  // Save changes to backend
  const handleSaveChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editData.fullName?.trim()) {
      toast.error("Full Name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...editData,
        designation: editData.customRole || editData.designation || "",
        customRole: editData.customRole || editData.designation || "",
        passingYear: editData.passingYear ? Number(editData.passingYear) : null,
      };

      const res = await fetch(`${API_URL}/api/users/admin/update/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update member.");
      }

      toast.success("Member profile updated successfully!");
      if (json.data?.user) {
        setMember(json.data.user);
      } else {
        await fetchMember();
      }
      setIsEditMode(false);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!member?._id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/users/admin/${encodeURIComponent(member._id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to delete member.");
      }
      toast.success(json.message || "Member permanently deleted.");
      setIsDeleteModalOpen(false);
      router.push("/dashboard/members");
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete member.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-text-secondary font-semibold">
        <Sparkles size={36} className="animate-spin text-accent-primary" />
        <p className="font-mono text-sm">&gt; loading member dossier from database...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[6px_6px_0px_var(--border-brutalist)] dark:shadow-[6px_6px_0px_var(--accent-primary)] p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary mb-2">Member Not Found</h2>
          <p className="text-text-secondary text-xs sm:text-sm mb-6">
            {error || "The requested member profile could not be located in the system."}
          </p>
          <Link
            href="/dashboard/members"
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-surface-elevated text-text-primary border-2 border-border-brutalist dark:border-border-default rounded-md shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] text-xs font-bold transition-all hover:shadow-[3px_3px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <ArrowLeft size={14} /> Back to Member Directory
          </Link>
        </div>
      </div>
    );
  }

  /* Compute Details */
  const name = member.fullName || "Unnamed Member";
  const initial = name.trim().charAt(0).toUpperCase();
  const sessionDisplay = formatDeptSession(member.department, member.session, member.batch);
  const designation =
    member.designation ||
    member.customRole ||
    (member.clubRole === "advisor"
      ? "Faculty Advisor"
      : member.clubRole === "executive"
      ? "Executive Member"
      : member.clubRole === "alumni"
      ? "Alumni"
      : "Club Member");

  const isAdv = member.clubRole === "advisor" || designation.toLowerCase().includes("advisor");
  const isExec = member.clubRole === "executive";
  const isAlumni = member.clubRole === "alumni" || member.isGraduated || member.role === "alumni";
  const isAdmin = member.role === "admin";
  const isMod = member.role === "moderator";

  const socials = member.socialLinks || {};

  // Batch options for selected department in edit mode
  const currentDept = editData.department || member.department || "CSE";
  const dynamicBatchOptions = getBatchOptions(currentDept, batchConfig);

  return (
    <div className="space-y-6 pb-16">
      {/* ── Action Header & Breadcrumb ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-elevated p-4 border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)]">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/members"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-surface-secondary text-text-primary border border-border-brutalist dark:border-border-default rounded-md text-xs font-bold transition-all hover:shadow-[2px_2px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <ArrowLeft size={14} /> Back to Members
          </Link>
          <div className="hidden sm:block text-xs font-mono text-text-tertiary">
            dashboard / members / <span className="text-text-primary font-bold">{member.fullName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Public Profile View Link */}
          <Link
            href={`/profile/${member._id || userId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-surface-secondary text-text-primary border border-border-brutalist dark:border-border-default rounded-md text-xs font-bold transition-all hover:bg-accent-primary-light/40"
            title="Open public profile page in new tab"
          >
            <Eye size={14} /> Public View <ExternalLink size={12} className="opacity-50" />
          </Link>

          {/* Delete Member Button (Admin only) */}
          {currentUser?.role === "admin" && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-surface-secondary text-red-600 dark:text-red-400 border border-border-default hover:border-red-500 rounded-md text-xs font-bold transition-all hover:bg-red-500/10 cursor-pointer"
              title="Permanently delete member record"
            >
              <Trash2 size={13} /> Delete
            </button>
          )}

          {/* Edit Mode Toggle */}
          {!isEditMode ? (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="inline-flex items-center gap-1.5 py-1.5 px-4 bg-accent-primary text-accent-primary-text border-2 border-border-brutalist dark:border-border-default rounded-md shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] text-xs font-bold transition-all hover:shadow-[3px_3px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer"
            >
              <Pencil size={14} /> Edit Member Details
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(false);
                  // Reset form data back to current member
                  setEditData({
                    fullName: member.fullName || "",
                    email: member.email || "",
                    studentId: member.studentId || "",
                    department: member.department || "CSE",
                    batch: member.batch || "",
                    session: member.session || "",
                    isGraduated: Boolean(member.isGraduated),
                    passingYear: member.passingYear || undefined,
                    role: member.role || "member",
                    clubRole: member.clubRole || "member",
                    customRole: member.customRole || member.designation || "",
                    designation: member.designation || "",
                    applicationStatus: member.applicationStatus || "approved",
                    profileStatus: member.profileStatus || "active",
                    contactNumber: member.contactNumber || "",
                    address: member.address || "",
                    bio: member.bio || "",
                    website: member.website || "",
                    skills: Array.isArray(member.skills) ? [...member.skills] : [],
                    imageUrl: member.imageUrl || "",
                    imagePosition: member.imagePosition || "50% 50%",
                    coverUrl: member.coverUrl || "",
                    coverPosition: member.coverPosition || "50% 50%",
                    socialLinks: { ...(member.socialLinks || {}) },
                  });
                }}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-surface-secondary text-text-primary border border-border-default rounded-md text-xs font-bold hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer"
                disabled={saving}
              >
                <X size={14} /> Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveChanges()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 py-1.5 px-4 bg-accent-primary text-accent-primary-text border-2 border-border-brutalist dark:border-border-default rounded-md shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] text-xs font-bold transition-all hover:shadow-[3px_3px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Sparkles size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving Changes..." : "Save Member Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── VIEW MODE (Public Profile Design Pulled In) ── */}
      {!isEditMode && (
        <div className="space-y-6">
          {/* ── 1. Cover Banner ── */}
          <div className="relative w-full h-[180px] sm:h-[220px] bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-800 border-2 border-border-brutalist dark:border-border-default rounded-xl overflow-hidden shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)]">
            {member.coverUrl ? (
              <Image
                src={member.coverUrl}
                alt={`${name}'s cover`}
                fill
                sizes="100vw"
                className="w-full h-full object-cover"
                style={{ objectPosition: member.coverPosition || "50% 50%" }}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            )}

            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-surface-elevated text-text-primary border-2 border-border-brutalist dark:border-border-default rounded-md shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] text-xs font-bold transition-all hover:shadow-[3px_3px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer"
                title="Share profile link"
              >
                <Share2 size={14} /> Share Profile
              </button>
            </div>
          </div>

          {/* ── 2. Hero Identity Card ── */}
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[6px_6px_0px_var(--border-brutalist)] dark:shadow-[6px_6px_0px_var(--accent-primary)] -mt-10 sm:-mt-14 p-5 sm:p-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6 mb-5 text-center sm:text-left">
              {/* Avatar Photo */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 min-w-[96px] sm:min-w-[112px] rounded-xl border-2 border-border-brutalist dark:border-border-default shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--accent-primary)] bg-surface-secondary overflow-hidden -mt-8 sm:-mt-12">
                {member.imageUrl ? (
                  <Image
                    src={member.imageUrl}
                    alt={`${name}'s profile photo`}
                    fill
                    sizes="130px"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: member.imagePosition || "50% 50%" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-text-primary bg-surface-secondary">
                    {initial}
                  </div>
                )}
              </div>

              {/* Main Info */}
              <div className="flex-1">
                {/* Role Badges & Statuses */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-sm font-bold text-[11px] uppercase tracking-wider bg-gradient-to-br from-yellow-300 to-amber-500 text-black border border-black shadow-[1.5px_1.5px_0px_#000]">
                      <Crown size={12} /> ADMIN
                    </span>
                  )}
                  {isMod && !isAdmin && (
                    <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-sm font-bold text-[11px] uppercase tracking-wider bg-gradient-to-br from-orange-200 to-orange-600 text-black border border-black shadow-[1.5px_1.5px_0px_#000]">
                      <ShieldCheck size={12} /> MODERATOR
                    </span>
                  )}
                  {isExec && (
                    <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-sm font-bold text-[11px] uppercase tracking-wider bg-accent-primary/15 text-accent-primary-hover border border-accent-primary">
                      <Sparkles size={12} /> EXECUTIVE
                    </span>
                  )}
                  {isAdv && (
                    <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-sm font-bold text-[11px] uppercase tracking-wider bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500">
                      <GraduationCap size={12} /> ADVISOR
                    </span>
                  )}
                  {isAlumni && (
                    <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-sm font-bold text-[11px] uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500">
                      <Building2 size={12} /> ALUMNI
                    </span>
                  )}
                  {!isExec && !isAdv && !isAlumni && (
                    <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-sm font-bold text-[11px] uppercase tracking-wider bg-surface-secondary text-text-secondary border border-border-default">
                      <CheckCircle2 size={12} /> MEMBER
                    </span>
                  )}

                  {/* Application Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      member.applicationStatus === "approved"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500"
                        : member.applicationStatus === "pending"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500"
                        : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500"
                    }`}
                  >
                    STATUS: {member.applicationStatus || "approved"}
                  </span>

                  {/* Profile Status Badge */}
                  {member.profileStatus && member.profileStatus !== "active" && (
                    <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500">
                      <ShieldAlert size={10} /> {member.profileStatus}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary mb-1">{name}</h1>

                {/* Subtitle & Designation */}
                <div className="text-xs sm:text-sm text-text-secondary flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <span>{sessionDisplay}</span>
                  {member.studentId && <span>• ID: {member.studentId}</span>}
                </div>
                <div className="text-sm sm:text-base font-bold text-accent-text-on-surface dark:text-accent-primary-hover">
                  {designation}
                </div>
              </div>
            </div>

            {/* Bio statement */}
            {member.bio && (
              <div className="mt-4 p-3 sm:px-4 bg-surface-secondary border-l-4 border-accent-primary rounded-r-md text-xs sm:text-sm text-text-primary leading-relaxed">
                &ldquo;{member.bio}&rdquo;
              </div>
            )}

            {/* Social Quick Bar */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4 pt-4 border-t border-border-default">
              {socials.github && (
                <a
                  href={socials.github.startsWith("http") ? socials.github : `https://github.com/${socials.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary text-xs font-bold hover:bg-accent-primary-light/40 transition-colors"
                >
                  <IconGH /> GitHub
                </a>
              )}
              {socials.linkedin && (
                <a
                  href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary text-xs font-bold hover:bg-accent-primary-light/40 transition-colors"
                >
                  <IconLI /> LinkedIn
                </a>
              )}
              {socials.codeforces && (
                <a
                  href={socials.codeforces.startsWith("http") ? socials.codeforces : `https://codeforces.com/profile/${socials.codeforces}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary text-xs font-bold hover:bg-accent-primary-light/40 transition-colors"
                >
                  <IconCF /> Codeforces
                </a>
              )}
              {socials.codechef && (
                <a
                  href={socials.codechef.startsWith("http") ? socials.codechef : `https://www.codechef.com/users/${socials.codechef}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary text-xs font-bold hover:bg-accent-primary-light/40 transition-colors"
                >
                  <IconCC /> CodeChef
                </a>
              )}
              {socials.facebook && (
                <a
                  href={socials.facebook.startsWith("http") ? socials.facebook : `https://facebook.com/${socials.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary text-xs font-bold hover:bg-accent-primary-light/40 transition-colors"
                >
                  <IconFB /> Facebook
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md border border-border-brutalist dark:border-border-default bg-surface-secondary text-text-primary text-xs font-bold hover:bg-accent-primary-light/40 transition-colors"
                >
                  <Mail size={14} /> {member.email}
                </a>
              )}
              {member.website && (
                <a
                  href={member.website.startsWith("http") ? member.website : `https://${member.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md border border-border-brutalist dark:border-border-default bg-accent-primary-light/50 dark:bg-accent-primary/20 text-text-primary text-xs font-bold hover:bg-accent-primary-light transition-colors"
                >
                  <Globe size={14} className="text-accent-primary" /> Portfolio Website <ExternalLink size={12} className="opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* ── 3. Bento Grid Section ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Club & Academic Dossier */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider mb-4 pb-3 border-b border-border-default">
                <Layers size={16} /> Club &amp; Academic Dossier
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                  <span className="text-text-secondary font-semibold">Department</span>
                  <span className="text-text-primary font-bold text-right">{member.department || "Computer Science & Eng."}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                  <span className="text-text-secondary font-semibold">Batch</span>
                  <span className="text-text-primary font-bold text-right">
                    {member.batch
                      ? member.batch.toLowerCase().includes("batch")
                        ? member.batch
                        : `${member.batch} Batch`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                  <span className="text-text-secondary font-semibold">Academic Session</span>
                  <span className="text-text-primary font-bold text-right">{member.session || "N/A"}</span>
                </div>
                {member.studentId && (
                  <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                    <span className="text-text-secondary font-semibold">Student ID</span>
                    <span className="text-text-primary font-mono font-bold text-right">{member.studentId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                  <span className="text-text-secondary font-semibold">Graduation Status</span>
                  <span className="text-text-primary font-bold text-right">
                    {member.isGraduated
                      ? member.passingYear
                        ? `Graduated (Class of ${member.passingYear})`
                        : "Graduated Alumni"
                      : "Undergraduate Student"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                  <span className="text-text-secondary font-semibold">Club Standing</span>
                  <span className="text-text-primary font-bold text-right">
                    {isAdv ? "Faculty Advisor" : isExec ? "Executive Committee" : isAlumni ? "Alumni Network" : "General Member"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                  <span className="text-text-secondary font-semibold">Platform Privilege</span>
                  <span className="text-text-primary font-bold text-right">
                    {isAdmin ? "Administrator" : isMod ? "Moderator" : "Standard Member"}
                  </span>
                </div>
                {member.email && (
                  <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                    <span className="text-text-secondary font-semibold flex items-center gap-1.5">
                      <Mail size={13} /> Email
                    </span>
                    <div className="flex items-center gap-1.5 text-right">
                      <a
                        href={`mailto:${member.email}`}
                        className="text-text-primary font-semibold hover:text-accent-primary underline transition-colors"
                      >
                        {member.email}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText(member.email, "Email address")}
                        className="text-text-secondary hover:text-accent-primary p-0.5 cursor-pointer"
                        title="Copy email"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                )}
                {member.contactNumber && (
                  <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                    <span className="text-text-secondary font-semibold flex items-center gap-1.5">
                      <Phone size={13} /> Contact
                    </span>
                    <div className="flex items-center gap-1.5 text-right">
                      <a
                        href={`tel:${member.contactNumber}`}
                        className="text-text-primary font-semibold hover:text-accent-primary transition-colors"
                      >
                        {member.contactNumber}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText(member.contactNumber!, "Contact number")}
                        className="text-text-secondary hover:text-accent-primary p-0.5 cursor-pointer"
                        title="Copy contact number"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                )}
                {member.address && (
                  <div className="flex justify-between items-center text-xs sm:text-sm pb-2 border-b border-dashed border-border-default">
                    <span className="text-text-secondary font-semibold flex items-center gap-1.5">
                      <MapPin size={13} /> Campus / City
                    </span>
                    <span className="text-text-primary font-bold text-right">{member.address}</span>
                  </div>
                )}
                {member.createdAt && (
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-text-secondary font-semibold">Member Since</span>
                    <span className="text-text-primary font-semibold text-right">
                      {new Date(member.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Developer & CP Handles */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider mb-4 pb-3 border-b border-border-default">
                <Code2 size={16} /> Competitive &amp; Dev Hub
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {socials.github && (
                  <a
                    href={socials.github.startsWith("http") ? socials.github : `https://github.com/${socials.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-surface-secondary border border-border-default rounded-md text-text-primary hover:border-accent-primary hover:shadow-[2px_2px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-8 h-8 rounded bg-surface-elevated border border-border-default flex items-center justify-center shrink-0">
                      <IconGH />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-extrabold uppercase text-text-secondary tracking-wider block">GitHub</span>
                      <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis block">
                        {socials.github.replace(/https?:\/\/(www\.)?github\.com\//, "")}
                      </span>
                    </div>
                    <ExternalLink size={12} className="ml-auto opacity-50" />
                  </a>
                )}

                {socials.codeforces && (
                  <a
                    href={socials.codeforces.startsWith("http") ? socials.codeforces : `https://codeforces.com/profile/${socials.codeforces}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-surface-secondary border border-border-default rounded-md text-text-primary hover:border-accent-primary hover:shadow-[2px_2px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-8 h-8 rounded bg-surface-elevated border border-border-default flex items-center justify-center shrink-0">
                      <IconCF />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-extrabold uppercase text-text-secondary tracking-wider block">Codeforces</span>
                      <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis block">
                        {socials.codeforces.replace(/https?:\/\/(www\.)?codeforces\.com\/profile\//, "")}
                      </span>
                    </div>
                    <ExternalLink size={12} className="ml-auto opacity-50" />
                  </a>
                )}

                {socials.codechef && (
                  <a
                    href={socials.codechef.startsWith("http") ? socials.codechef : `https://www.codechef.com/users/${socials.codechef}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-surface-secondary border border-border-default rounded-md text-text-primary hover:border-accent-primary hover:shadow-[2px_2px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-8 h-8 rounded bg-surface-elevated border border-border-default flex items-center justify-center shrink-0">
                      <IconCC />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-extrabold uppercase text-text-secondary tracking-wider block">CodeChef</span>
                      <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis block">
                        {socials.codechef.replace(/https?:\/\/(www\.)?codechef\.com\/users\//, "")}
                      </span>
                    </div>
                    <ExternalLink size={12} className="ml-auto opacity-50" />
                  </a>
                )}

                {socials.discord && (
                  <button
                    type="button"
                    onClick={() => copyText(socials.discord!, "Discord handle")}
                    className="flex items-center gap-2.5 p-2.5 bg-surface-secondary border border-border-default rounded-md text-text-primary hover:border-accent-primary hover:shadow-[2px_2px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all w-full text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded bg-surface-elevated border border-border-default flex items-center justify-center shrink-0">
                      <IconDiscord />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-extrabold uppercase text-text-secondary tracking-wider block">Discord</span>
                      <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis block">{socials.discord}</span>
                    </div>
                    <Copy size={12} className="ml-auto opacity-50" />
                  </button>
                )}

                {socials.linkedin && (
                  <a
                    href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 bg-surface-secondary border border-border-default rounded-md text-text-primary hover:border-accent-primary hover:shadow-[2px_2px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-8 h-8 rounded bg-surface-elevated border border-border-default flex items-center justify-center shrink-0">
                      <IconLI />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-extrabold uppercase text-text-secondary tracking-wider block">LinkedIn</span>
                      <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis block">Profile</span>
                    </div>
                    <ExternalLink size={12} className="ml-auto opacity-50" />
                  </a>
                )}
              </div>

              {!socials.github && !socials.codeforces && !socials.codechef && !socials.discord && !socials.linkedin && (
                <p className="text-xs sm:text-sm text-text-secondary m-0">No public competitive handles connected yet.</p>
              )}
            </div>

            {/* Card 3: Club Engagements & Milestones */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 md:col-span-2">
              <h2 className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider mb-4 pb-3 border-b border-border-default">
                <Award size={16} /> Club Engagements &amp; Milestones
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-surface-secondary border border-border-default rounded-md">
                  <div className="text-xl sm:text-2xl font-black text-accent-primary-hover mb-1">
                    {Array.isArray(member.eventsAttended) ? member.eventsAttended.length : 0}
                  </div>
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Events Attended</div>
                </div>
                <div className="p-3 bg-surface-secondary border border-border-default rounded-md">
                  <div className="text-xl sm:text-2xl font-black text-accent-primary-hover mb-1">
                    {Array.isArray(member.certificates) ? member.certificates.length : 0}
                  </div>
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Certificates</div>
                </div>
                <div className="p-3 bg-surface-secondary border border-border-default rounded-md">
                  <div className="text-xl sm:text-2xl font-black text-accent-primary-hover mb-1">
                    {Array.isArray(member.projectsContributed) ? member.projectsContributed.length : 0}
                  </div>
                  <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Projects Contributed</div>
                </div>
              </div>
            </div>

            {/* Card 4: Technical Skills */}
            {Array.isArray(member.skills) && member.skills.length > 0 && (
              <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 md:col-span-2">
                <h2 className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider mb-4 pb-3 border-b border-border-default">
                  <Sparkles size={16} className="text-accent-primary" /> Technical Skills &amp; Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-mono font-bold bg-surface-secondary border border-border-brutalist dark:border-border-default rounded-md shadow-[2px_2px_0px_var(--border-default)] text-text-primary hover:border-accent-primary transition-all"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Card 5: Professional Experience */}
            {Array.isArray(member.experiences) && member.experiences.length > 0 && (
              <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 md:col-span-2">
                <h2 className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider mb-5 pb-3 border-b border-border-default">
                  <Briefcase size={16} className="text-accent-primary" /> Professional Experience
                </h2>
                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-default">
                  {member.experiences.map((exp: any, i: number) => (
                    <div key={i} className="relative group">
                      <div className="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                      </div>
                      <div className="p-4 bg-surface-secondary border border-border-default rounded-lg">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-extrabold text-text-primary m-0">{exp.jobTitle}</h3>
                            <span className="text-xs sm:text-sm font-semibold text-text-secondary">@ {exp.companyName}</span>
                          </div>
                          {exp.isCurrent && (
                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-accent-primary text-accent-primary-text shadow-[1px_1px_0px_black]">
                              Current Role
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary mb-2 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                          </span>
                          {exp.location && (
                            <span className="flex items-center gap-1 font-body">
                              <MapPin size={12} /> {exp.location}
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-xs text-text-secondary font-body mt-1 leading-relaxed whitespace-pre-line m-0">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 6: Higher Education */}
            {Array.isArray(member.education) && member.education.length > 0 && (
              <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 md:col-span-2">
                <h2 className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider mb-5 pb-3 border-b border-border-default">
                  <GraduationCap size={16} className="text-accent-primary" /> Higher Education &amp; Academic Milestones
                </h2>
                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-default">
                  {member.education.map((edu: any, i: number) => (
                    <div key={i} className="relative group">
                      <div className="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                      </div>
                      <div className="p-4 bg-surface-secondary border border-border-default rounded-lg">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-extrabold text-text-primary m-0">{edu.degree}</h3>
                            <span className="text-xs sm:text-sm font-semibold text-text-secondary">at {edu.institution}</span>
                          </div>
                          {edu.isCurrent && (
                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-accent-primary text-accent-primary-text shadow-[1px_1px_0px_black]">
                              Currently Pursuing
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary mb-2">
                          {edu.fieldOfStudy && <span className="font-semibold text-text-secondary">Major: {edu.fieldOfStudy}</span>}
                          {(edu.startDate || edu.endDate) && (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar size={12} /> {edu.startDate || ""} – {edu.isCurrent ? "Present" : edu.endDate || "Present"}
                            </span>
                          )}
                          {edu.location && (
                            <span className="flex items-center gap-1 font-body">
                              <MapPin size={12} /> {edu.location}
                            </span>
                          )}
                        </div>
                        {edu.description && (
                          <p className="text-xs text-text-secondary font-body mt-1 leading-relaxed whitespace-pre-line m-0">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT MODE (Admin Management Form) ── */}
      {isEditMode && (
        <form onSubmit={handleSaveChanges} className="space-y-6">
          {/* Top Banner Alert */}
          <div className="p-4 bg-accent-primary/10 border-2 border-accent-primary rounded-xl flex items-center justify-between gap-3 text-text-primary">
            <div className="flex items-center gap-2.5">
              <Pencil size={18} className="text-accent-primary" />
              <div>
                <h3 className="text-sm font-extrabold">Admin Member Editor</h3>
                <p className="text-xs text-text-secondary">
                  Editing record for <span className="font-bold">{member.fullName}</span> ({member.studentId || member.email}). Changes reflect immediately across directory and public pages.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="py-1.5 px-3 bg-surface-secondary text-text-primary border border-border-default rounded-md text-xs font-bold hover:bg-surface-elevated transition-colors cursor-pointer"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="py-1.5 px-4 bg-accent-primary text-accent-primary-text border-2 border-border-brutalist dark:border-border-default rounded-md shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] text-xs font-bold transition-all hover:shadow-[3px_3px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── 1. Academic & University Record ── */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary pb-2 border-b border-border-default flex items-center gap-2">
                <Building2 size={16} className="text-accent-primary" /> Academic &amp; University Records
              </h3>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Department
                </label>
                <Select
                  value={editData.department || "CSE"}
                  options={DEPARTMENT_OPTIONS}
                  onChange={(val) => {
                    setEditData((prev) => ({
                      ...prev,
                      department: val,
                      // auto-reset batch when department changes if batch prefix doesn't match
                      batch: "",
                    }));
                  }}
                />
              </div>

              {/* Batch (Dynamic based on department) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Batch ({currentDept})
                </label>
                <Select
                  value={editData.batch || ""}
                  options={dynamicBatchOptions}
                  placeholder={`Select ${currentDept} Batch...`}
                  onChange={(val) => setEditData((prev) => ({ ...prev, batch: val }))}
                />
                <p className="text-[11px] text-text-tertiary mt-1">
                  Dynamic batch options based on global site settings.
                </p>
              </div>

              {/* Academic Session & Student ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={editData.session || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, session: e.target.value }))}
                    placeholder="e.g. 2021-22 or 2021-2022"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={editData.studentId || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, studentId: e.target.value }))}
                    placeholder="e.g. 19101001"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary font-mono focus:border-accent-primary outline-none"
                  />
                </div>
              </div>

              {/* Graduation Status & Passing Year */}
              <div className="p-3 bg-surface-secondary border border-border-default rounded-lg space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(editData.isGraduated)}
                    onChange={(e) => setEditData((prev) => ({ ...prev, isGraduated: e.target.checked }))}
                    className="w-4 h-4 accent-accent-primary rounded cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-text-primary">
                    Mark as Graduated Alumni
                  </span>
                </label>

                {editData.isGraduated && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Passing / Graduation Year
                    </label>
                    <input
                      type="number"
                      value={editData.passingYear || ""}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          passingYear: e.target.value ? parseInt(e.target.value, 10) : undefined,
                        }))
                      }
                      placeholder="e.g. 2025"
                      className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── 2. Role, Club Standing & Admin Controls ── */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary pb-2 border-b border-border-default flex items-center gap-2">
                <Crown size={16} className="text-amber-500" /> Platform Role &amp; Standing
              </h3>

              {/* System Role & Club Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Platform System Role
                  </label>
                  <Select
                    value={editData.role || "member"}
                    options={SYSTEM_ROLE_OPTIONS}
                    onChange={(val: any) => setEditData((prev) => ({ ...prev, role: val }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Club Role Category
                  </label>
                  <Select
                    value={editData.clubRole || "member"}
                    options={CLUB_ROLE_OPTIONS}
                    onChange={(val: any) => setEditData((prev) => ({ ...prev, clubRole: val }))}
                  />
                </div>
              </div>

              {/* Custom Role / Designation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Official Designation / Title
                </label>
                <input
                  type="text"
                  value={editData.customRole || editData.designation || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      customRole: e.target.value,
                      designation: e.target.value,
                    }))
                  }
                  placeholder="e.g. President, Head of Competitive Programming, Faculty Advisor"
                  className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                />
                <p className="text-[11px] text-text-tertiary mt-1">
                  Displays on identity card and profile hero.
                </p>
              </div>

              {/* Application & Profile Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Application Status
                  </label>
                  <Select
                    value={editData.applicationStatus || "approved"}
                    options={APPLICATION_STATUS_OPTIONS}
                    onChange={(val: any) => setEditData((prev) => ({ ...prev, applicationStatus: val }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Profile Status
                  </label>
                  <Select
                    value={editData.profileStatus || "active"}
                    options={PROFILE_STATUS_OPTIONS}
                    onChange={(val: any) => setEditData((prev) => ({ ...prev, profileStatus: val }))}
                  />
                </div>
              </div>
            </div>

            {/* ── 3. Personal & Contact Details ── */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary pb-2 border-b border-border-default flex items-center gap-2">
                <Mail size={16} className="text-accent-primary" /> Personal &amp; Contact Details
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editData.fullName || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Alice Johnson"
                  className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editData.email || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="name@example.com"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={editData.contactNumber || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, contactNumber: e.target.value }))}
                    placeholder="01700-000000"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
              </div>

              {/* Address / Campus */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Campus / Present Location
                </label>
                <input
                  type="text"
                  value={editData.address || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. MEC Campus, Moulvibazar, Sylhet"
                  className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                />
              </div>

              {/* Portfolio Website */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Personal / Portfolio Website
                </label>
                <input
                  type="text"
                  value={editData.website || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://myportfolio.com"
                  className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Member Bio / Introduction
                </label>
                <textarea
                  rows={3}
                  value={editData.bio || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="A short introduction about passions, contributions, and interests..."
                  className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                />
              </div>
            </div>

            {/* ── 4. Social & CP Handles ── */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary pb-2 border-b border-border-default flex items-center gap-2">
                <Code2 size={16} className="text-accent-primary" /> Competitive &amp; Social Handles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GitHub */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <IconGH /> GitHub Handle or URL
                  </label>
                  <input
                    type="text"
                    value={editData.socialLinks?.github || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        socialLinks: { ...(prev.socialLinks || {}), github: e.target.value },
                      }))
                    }
                    placeholder="octocat"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <IconLI /> LinkedIn Username or URL
                  </label>
                  <input
                    type="text"
                    value={editData.socialLinks?.linkedin || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        socialLinks: { ...(prev.socialLinks || {}), linkedin: e.target.value },
                      }))
                    }
                    placeholder="in/username"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>

                {/* Codeforces */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <IconCF /> Codeforces Handle
                  </label>
                  <input
                    type="text"
                    value={editData.socialLinks?.codeforces || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        socialLinks: { ...(prev.socialLinks || {}), codeforces: e.target.value },
                      }))
                    }
                    placeholder="tourist"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>

                {/* CodeChef */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <IconCC /> CodeChef Handle
                  </label>
                  <input
                    type="text"
                    value={editData.socialLinks?.codechef || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        socialLinks: { ...(prev.socialLinks || {}), codechef: e.target.value },
                      }))
                    }
                    placeholder="gennady"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <IconFB /> Facebook Username or URL
                  </label>
                  <input
                    type="text"
                    value={editData.socialLinks?.facebook || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        socialLinks: { ...(prev.socialLinks || {}), facebook: e.target.value },
                      }))
                    }
                    placeholder="john.doe"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>

                {/* Discord */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <IconDiscord /> Discord Tag
                  </label>
                  <input
                    type="text"
                    value={editData.socialLinks?.discord || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        socialLinks: { ...(prev.socialLinks || {}), discord: e.target.value },
                      }))
                    }
                    placeholder="user#1234 or username"
                    className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ── 5. Technical Skills Manager ── */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 space-y-4 md:col-span-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary pb-2 border-b border-border-default flex items-center gap-2">
                <Sparkles size={16} className="text-accent-primary" /> Technical Skills &amp; Stack
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(newSkillInput);
                    }
                  }}
                  placeholder="Type a skill and press Enter or Add (e.g. C++, React, Docker)"
                  className="flex-1 py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="py-2 px-4 bg-accent-primary text-accent-primary-text border-2 border-border-brutalist dark:border-border-default rounded-md font-bold text-xs shadow-[2px_2px_0px_var(--border-brutalist)] cursor-pointer"
                >
                  <Plus size={14} className="inline mr-1" /> Add Skill
                </button>
              </div>

              {/* Selected Skills Chips */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(editData.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-surface-secondary border border-border-brutalist dark:border-border-default rounded-md shadow-[2px_2px_0px_var(--border-default)] text-text-primary"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-text-tertiary hover:text-red-500 cursor-pointer p-0.5"
                      title={`Remove ${skill}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {(editData.skills || []).length === 0 && (
                  <p className="text-xs text-text-tertiary italic">No skills added yet.</p>
                )}
              </div>

              {/* Quick Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block mb-2">
                  Popular Suggestions (Click to Add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map((sk) => {
                    const isAdded = (editData.skills || []).includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => (isAdded ? handleRemoveSkill(sk) : handleAddSkill(sk))}
                        className={`text-[11px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                          isAdded
                            ? "bg-accent-primary/20 text-accent-primary border-accent-primary"
                            : "bg-surface-secondary text-text-secondary border-border-default hover:border-accent-primary"
                        }`}
                      >
                        {isAdded ? "✓ " : "+ "}
                        {sk}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── 6. Profile Photo & Cover Positioning ── */}
            <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] p-5 sm:p-6 space-y-4 md:col-span-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary pb-2 border-b border-border-default flex items-center gap-2">
                <Globe size={16} className="text-accent-primary" /> Profile Photo &amp; Cover Imagery
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar URL & Position */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                      Avatar Image URL
                    </label>
                    <input
                      type="text"
                      value={editData.imageUrl || ""}
                      onChange={(e) => setEditData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                      Avatar Position (e.g. &quot;50% 50%&quot;)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.imagePosition || "50% 50%"}
                        onChange={(e) => setEditData((prev) => ({ ...prev, imagePosition: e.target.value }))}
                        className="flex-1 py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary font-mono focus:border-accent-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditData((prev) => ({ ...prev, imagePosition: "50% 20%" }))}
                        className="py-1 px-2.5 bg-surface-secondary text-[11px] font-bold border border-border-default rounded hover:border-accent-primary"
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditData((prev) => ({ ...prev, imagePosition: "50% 50%" }))}
                        className="py-1 px-2.5 bg-surface-secondary text-[11px] font-bold border border-border-default rounded hover:border-accent-primary"
                      >
                        Center
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cover URL & Position */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                      Cover Banner URL
                    </label>
                    <input
                      type="text"
                      value={editData.coverUrl || ""}
                      onChange={(e) => setEditData((prev) => ({ ...prev, coverUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary focus:border-accent-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                      Cover Position (e.g. &quot;50% 50%&quot;)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.coverPosition || "50% 50%"}
                        onChange={(e) => setEditData((prev) => ({ ...prev, coverPosition: e.target.value }))}
                        className="flex-1 py-2 px-3 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-md text-sm text-text-primary font-mono focus:border-accent-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditData((prev) => ({ ...prev, coverPosition: "50% 25%" }))}
                        className="py-1 px-2.5 bg-surface-secondary text-[11px] font-bold border border-border-default rounded hover:border-accent-primary"
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditData((prev) => ({ ...prev, coverPosition: "50% 50%" }))}
                        className="py-1 px-2.5 bg-surface-secondary text-[11px] font-bold border border-border-default rounded hover:border-accent-primary"
                      >
                        Center
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 7. Danger Zone ── */}
            {currentUser?.role === "admin" && (
              <div className="p-5 sm:p-6 bg-red-500/5 border-2 border-red-500/30 rounded-xl space-y-3 md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <Trash2 size={16} /> Danger Zone: Permanently Delete Member
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Once deleted, this member&apos;s account, login credentials, and all profile data will be permanently removed from the database.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="py-1.5 px-4 bg-red-600 hover:bg-red-700 text-white border-2 border-border-brutalist rounded-md text-xs font-bold shadow-[2px_2px_0px_#000] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={13} /> Delete Member
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="py-2 px-4 bg-surface-secondary text-text-primary border border-border-default rounded-md text-xs font-bold hover:bg-surface-primary transition-colors cursor-pointer"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-2 px-6 bg-accent-primary text-accent-primary-text border-2 border-border-brutalist dark:border-border-default rounded-md shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] text-xs font-bold transition-all hover:shadow-[3px_3px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Sparkles size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving Changes..." : "Save Member Details"}
            </button>
          </div>
        </form>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[8px_8px_0px_var(--border-brutalist)] dark:shadow-[8px_8px_0px_#ef4444] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-text-primary">Delete Member Permanently?</h3>
                <p className="text-xs text-text-secondary">This operation cannot be reversed.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-text-primary font-bold">{member.fullName}</strong> ({member.studentId || member.email})? All profile data and club records for this user will be removed immediately.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="py-1.5 px-4 rounded-md border border-border-default bg-surface-secondary text-text-primary text-xs font-bold hover:bg-surface-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="py-1.5 px-4 rounded-md border-2 border-border-brutalist bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-[2px_2px_0px_#000] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? <Sparkles size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isDeleting ? "Deleting..." : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
