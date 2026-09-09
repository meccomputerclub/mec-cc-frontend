"use client";

import { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from "react";
import { AuthUser, UserExperience, UserEducation } from "@/types";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Save,
  Upload,
  Move,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Globe,
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  X,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { AvatarPositionModal } from "./AvatarPositionModal";
import { coverPresets, CoverPreset } from "@/data/coverPresets";

/* Helper to format social handles into clean URLs */
function toSocialUrl(platform: string, input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("www.")) return "https://" + trimmed;

  const clean = trimmed.replace(/^@/, "").replace(/^\/+/, "");
  switch (platform) {
    case "github":
      return `https://github.com/${clean}`;
    case "linkedin":
      return `https://linkedin.com/in/${clean}`;
    case "facebook":
      return `https://facebook.com/${clean}`;
    case "codeforces":
      return `https://codeforces.com/profile/${clean}`;
    case "codechef":
      return `https://codechef.com/users/${clean}`;
    default:
      return clean;
  }
}

/* ── Social Icon SVGs matching Join Form ── */
const IconGH = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.8, flexShrink: 0 }}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const IconLI = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.8, flexShrink: 0 }}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const IconFB = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.8, flexShrink: 0 }}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IconCF = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.8, flexShrink: 0 }}>
    <rect x="2" y="10" width="4" height="12" rx="1"/><rect x="10" y="4" width="4" height="18" rx="1"/><rect x="18" y="7" width="4" height="15" rx="1"/>
  </svg>
);
const IconCC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.2574.0039c-.37.0101-.7353.041-1.1003.095C9.6164.153 9.0766.4236 8.482.694c-.757.3244-1.5147.6486-2.2176.7027-1.1896.3785-1.568.919-1.8925 1.3516 0 .054-.054.1079-.054.1079-.4325.865-.4873 1.73-.325 2.5952.1621.5407.3786 1.0282.5408 1.5148.3785 1.0274.7578 2.0007.92 3.1362.1622.3244.3235.7571.4316 1.1897.2704.8651.542 1.8383 1.353 2.5952l.0057-.0028c.0175.0183.0301.0387.0482.0568.0072-.0036.0141-.0063.0213-.0099l-.0213-.5849c.6489-.9733 1.5673-1.6221 2.865-1.8925.5195-.1093 1.081-.1497 1.6625-.1278a8.7733 8.7733 0 0 1 1.7988.2357c1.4599.3785 2.595 1.1358 2.6492 1.7846.0273.3549.0398.6952.0326 1.0364-.001.064-.0046.1285-.007.193l.1362.0682c.075-.0375.1424-.107.2059-.1902.0008-.001.002-.002.0028-.0028.0018-.0023.0039-.0061.0057-.0085.0396-.0536.0747-.1236.1107-.1931.0188-.0377.0372-.0866.0554-.1292.2048-.4622.362-1.1536.538-1.9635.0541-.2703.1092-.4864.1633-.7027.4326-.9733 1.0266-1.8382 1.6213-2.6492.9733-1.3518 1.8928-2.5962 1.7846-4.0561-1.784-3.4608-4.2718-4.0017-5.5695-4.272-.2163-.0541-.3233-.0539-.4856-.108-1.3382-.2433-2.4945-.3953-3.6046-.3648zm5.0428 14.3788a9.8602 9.8602 0 0 0-.0326-.9824c-.0541-.703-1.1892-1.46-2.7032-1.8386-.588-.1336-1.1764-.2142-1.7448-.2356-.539-.0137-1.0657.0248-1.5546.1277-1.2436.2704-2.2162.9193-2.811 1.8925l.0511 1.431c.6672-.3558 1.7326-.8747 3.139-.9994.0662-.0059.1368-.0059.2044-.0099.1177-.013.2667-.044.4444-.044 1.6075 0 3.2682.5336 4.8767 1.6483.039-.2744.0611-.549.071-.8234l.044.0227c.0028-.0622.0143-.1268.0156-.1888z"/>
  </svg>
);
const IconDiscord = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.8, flexShrink: 0 }}>
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const DEPARTMENT_LABEL_MAP: Record<string, string> = {
  CSE: "Computer Science & Engineering (CSE)",
  EEE: "Electrical & Electronic (EEE)",
  CE: "Civil Engineering (CE)",
};

export interface ProfileEditTabHandle {
  save: () => Promise<void>;
}

interface ProfileEditTabProps {
  user: AuthUser;
  onProfileUpdated: () => void;
  onCancel?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

const POPULAR_SKILLS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "C++",
  "Competitive Programming",
  "Django",
  "TailwindCSS",
  "Docker",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Git & GitHub",
  "Machine Learning",
  "System Design",
];

export const ProfileEditTab = forwardRef<ProfileEditTabHandle, ProfileEditTabProps>(function ProfileEditTab(
  { user, onProfileUpdated, onCancel, onDirtyChange }: ProfileEditTabProps,
  ref
) {
  const [profileData, setProfileData] = useState({
    fullName: user.fullName || "",
    contactNumber: user.contactNumber || "",
    department: user.department || "CSE",
    session: user.session || "2021-2022",
    batch: user.batch || "",
    address: user.address || "",
    bio: user.bio || "",
    facebook: user.socialLinks?.facebook || "",
    github: user.socialLinks?.github || "",
    linkedin: user.socialLinks?.linkedin || "",
    codeforces: user.socialLinks?.codeforces || "",
    codechef: user.socialLinks?.codechef || "",
    discord: user.socialLinks?.discord || "",
  });

  // Online & Portfolio Link
  const [website, setWebsite] = useState(user.website || "");

  // Skills Tag Manager
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = (skillToAdd?: string) => {
    const target = (skillToAdd || skillInput).trim();
    if (!target) return;
    if (skills.some((s) => s.toLowerCase() === target.toLowerCase())) {
      toast.error(`"${target}" is already in your skills list.`);
      return;
    }
    setSkills([...skills, target]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Experience Ladder Manager
  const [experiences, setExperiences] = useState<UserExperience[]>(user.experiences || []);
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);
  const [expForm, setExpForm] = useState<UserExperience>({
    companyName: "",
    jobTitle: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    location: "",
    description: "",
  });

  const openAddExp = () => {
    setExpForm({
      companyName: "",
      jobTitle: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      location: "",
      description: "",
    });
    setEditingExpIndex(null);
    setShowExpModal(true);
  };

  const openEditExp = (index: number) => {
    const item = experiences[index];
    const isCur = Boolean(item.isCurrent || item.endDate === "Present");
    setExpForm({
      ...item,
      isCurrent: isCur,
      endDate: isCur || item.endDate === "Present" ? "" : (item.endDate || ""),
    });
    setEditingExpIndex(index);
    setShowExpModal(true);
  };

  const handleSaveExp = () => {
    if (!expForm.companyName.trim() || !expForm.jobTitle.trim() || !expForm.startDate.trim()) {
      toast.error("Company Name, Job Title, and Start Date are required.");
      return;
    }
    const cleanExp: UserExperience = {
      ...expForm,
      companyName: expForm.companyName.trim(),
      jobTitle: expForm.jobTitle.trim(),
      startDate: expForm.startDate.trim(),
      endDate: expForm.isCurrent ? "Present" : (expForm.endDate === "Present" ? "" : expForm.endDate?.trim() || ""),
      location: expForm.location?.trim() || "",
      description: expForm.description?.trim() || "",
    };

    if (editingExpIndex !== null) {
      const updated = [...experiences];
      updated[editingExpIndex] = cleanExp;
      setExperiences(updated);
      toast.success("Position updated!");
    } else {
      setExperiences([...experiences, cleanExp]);
      toast.success("Position added to experience ladder!");
    }
    setShowExpModal(false);
  };

  const handleDeleteExp = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
    toast.success("Experience removed.");
  };

  // Education Manager
  const [education, setEducation] = useState<UserEducation[]>(user.education || []);
  const [showEduModal, setShowEduModal] = useState(false);
  const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);
  const [eduForm, setEduForm] = useState<UserEducation>({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    location: "",
    description: "",
  });

  const openAddEdu = () => {
    setEduForm({
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      location: "",
      description: "",
    });
    setEditingEduIndex(null);
    setShowEduModal(true);
  };

  const openEditEdu = (index: number) => {
    const item = education[index];
    const isCur = Boolean(item.isCurrent || item.endDate === "Present");
    setEduForm({
      ...item,
      isCurrent: isCur,
      endDate: isCur || item.endDate === "Present" ? "" : (item.endDate || ""),
    });
    setEditingEduIndex(index);
    setShowEduModal(true);
  };

  // Track if any field was changed
  const [hasSaved, setHasSaved] = useState(false);

  const isDirty = useMemo(() => {
    if (hasSaved) return false;
    if (profileData.fullName !== (user.fullName || "")) return true;
    if (profileData.contactNumber !== (user.contactNumber || "")) return true;
    if (profileData.batch !== (user.batch || "")) return true;
    if (profileData.address !== (user.address || "")) return true;
    if (profileData.bio !== (user.bio || "")) return true;
    if (website !== (user.website || "")) return true;
    if (JSON.stringify(skills) !== JSON.stringify(user.skills || [])) return true;
    if (JSON.stringify(experiences) !== JSON.stringify(user.experiences || [])) return true;
    if (JSON.stringify(education) !== JSON.stringify(user.education || [])) return true;
    if (profileData.facebook !== (user.socialLinks?.facebook || "")) return true;
    if (profileData.github !== (user.socialLinks?.github || "")) return true;
    if (profileData.linkedin !== (user.socialLinks?.linkedin || "")) return true;
    if (profileData.codeforces !== (user.socialLinks?.codeforces || "")) return true;
    if (profileData.codechef !== (user.socialLinks?.codechef || "")) return true;
    if (profileData.discord !== (user.socialLinks?.discord || "")) return true;
    return false;
  }, [hasSaved, profileData, website, skills, experiences, education, user]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Warn on tab/browser close or reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Expose save() to parent via ref for "Save & Leave" dialog option
  useImperativeHandle(ref, () => ({
    save: async () => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleSaveProfile(fakeEvent);
    },
  }));

  const handleSaveEdu = () => {
    if (!eduForm.institution.trim() || !eduForm.degree.trim()) {
      toast.error("Institution / University and Degree are required.");
      return;
    }
    const cleanEdu: UserEducation = {
      ...eduForm,
      institution: eduForm.institution.trim(),
      degree: eduForm.degree.trim(),
      fieldOfStudy: eduForm.fieldOfStudy?.trim() || "",
      startDate: eduForm.startDate?.trim() || "",
      endDate: eduForm.isCurrent ? "Present" : (eduForm.endDate === "Present" ? "" : eduForm.endDate?.trim() || ""),
      location: eduForm.location?.trim() || "",
      description: eduForm.description?.trim() || "",
    };

    if (editingEduIndex !== null) {
      const updated = [...education];
      updated[editingEduIndex] = cleanEdu;
      setEducation(updated);
      toast.success("Education record updated!");
    } else {
      setEducation([...education, cleanEdu]);
      toast.success("Education record added!");
    }
    setShowEduModal(false);
  };

  const handleDeleteEdu = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
    toast.success("Education record removed.");
  };

  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover photo exceeds 5MB size limit.");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setCoverPreviewUrl(localUrl);
    setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("cover", file);

      const userId = user.id || user._id;
      const res = await api.upload(`/api/users/update/cover/${userId}`, formData, { method: "PATCH" });
      toast.success("Cover photo updated successfully!");
      if (res?.user?.coverUrl) {
        setCoverPreviewUrl(res.user.coverUrl);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      await onProfileUpdated();
    } catch (err: any) {
      setCoverPreviewUrl(null);
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to upload cover photo";
      toast.error(msg);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);

  const handleSelectPresetCover = async (preset: CoverPreset) => {
    setApplyingPreset(preset.id);
    try {
      await api.patch("/api/users/me", { coverUrl: preset.url });
      toast.success(`Cover banner updated to "${preset.name}"!`);
      setCoverPreviewUrl(preset.url);
      window.scrollTo({ top: 0, behavior: "smooth" });
      await onProfileUpdated();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to set preset cover";
      toast.error(msg);
    } finally {
      setApplyingPreset(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.contactNumber || !profileData.contactNumber.trim()) {
      toast.error("Contact Phone number is required and cannot be left empty.");
      return;
    }

    setSavingProfile(true);
    try {
      await api.patch("/api/users/me", {
        batch: profileData.batch?.trim() || "",
        contactNumber: profileData.contactNumber.trim(),
        address: profileData.address,
        bio: profileData.bio,
        website: website.trim(),
        skills: skills,
        experiences: experiences,
        education: education,
        socialLinks: {
          facebook: profileData.facebook?.trim() ? toSocialUrl("facebook", profileData.facebook) : "",
          github: profileData.github?.trim() ? toSocialUrl("github", profileData.github) : "",
          linkedin: profileData.linkedin?.trim() ? toSocialUrl("linkedin", profileData.linkedin) : "",
          codeforces: profileData.codeforces?.trim() ? toSocialUrl("codeforces", profileData.codeforces) : "",
          codechef: profileData.codechef?.trim() ? toSocialUrl("codechef", profileData.codechef) : "",
          discord: profileData.discord?.trim() || "",
        },
      });
      toast.success("Profile credentials saved successfully!");
      setHasSaved(true);
      onDirtyChange?.(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      await onProfileUpdated();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingAvatarFile(file);
    setShowAvatarModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Unified Profile Credentials Card */}
      <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
          {/* Part 01: Identity & Profile Photo */}
          <div>
            <div className="mb-4 pb-2 border-b-[1.5px] border-border-default">
              <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">01</span> Identity &amp; Profile Photo
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-4 text-center sm:text-left">
              <button 
                type="button" 
                className="w-20 h-20 sm:w-[90px] sm:h-[90px] rounded-md border-2 border-dashed border-border-brutalist dark:border-border-default bg-surface-secondary cursor-pointer overflow-hidden flex items-center justify-center relative transition-all duration-150 shrink-0 hover:border-accent-primary hover:bg-accent-primary-light" 
                onClick={() => {
                  setPendingAvatarFile(null);
                  setShowAvatarModal(true);
                }} 
                disabled={uploadingPhoto}
                aria-label="Upload profile picture"
              >
                {(previewUrl || user.imageUrl) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    key={previewUrl || user.imageUrl}
                    src={previewUrl || user.imageUrl} 
                    alt={user.fullName} 
                    className="w-full h-full object-cover" 
                    style={{ objectPosition: (user as any).imagePosition || "50% 50%" }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.avatar-upload-placeholder');
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="avatar-upload-placeholder flex flex-col items-center gap-1 text-[10px] font-bold text-text-secondary" 
                  style={{ display: (previewUrl || user.imageUrl) ? 'none' : 'flex' }}
                >
                  <Upload size={22} className="text-text-primary" />
                  <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
                </div>
              </button>

              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                onChange={handleAvatarUpload} 
                className="hidden" 
              />

              <div className="flex flex-col gap-1 text-xs">
                <p className="font-bold text-text-primary m-0">Profile Photo <span className="text-accent-error">*</span></p>
                <div className="font-bold text-xs text-accent-primary">
                  <p className="m-0">Requirements:</p>
                  <ul className="pl-5 mt-0.5 list-disc text-text-secondary font-normal">
                    <li>PNG, JPG, or WEBP (auto-compressed).</li>
                    <li>Easily reposition and align with interactive crop.</li>
                  </ul>
                </div>
                {(user.imageUrl || previewUrl) && (
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingAvatarFile(null);
                        setShowAvatarModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-accent-text-on-surface bg-surface-secondary border border-border-default rounded hover:border-accent-primary transition-colors cursor-pointer"
                    >
                      <Move size={12} />
                      <span>Adjust / Reposition Photo</span>
                    </button>
                  </div>
                )}
                {photoError && <p role="alert" className="text-xs text-accent-error font-semibold m-0">{photoError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fullName" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  Full Name <span className="text-[11px] text-text-tertiary font-medium">(Read Only)</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={user.fullName || profileData.fullName}
                  disabled
                  placeholder="e.g. Abdullah Al Mamun"
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-secondary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none opacity-80 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  Institutional Email <span className="text-[11px] text-text-tertiary font-medium">(Read Only)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-secondary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none opacity-80 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Part 02: Academic Credentials */}
          <div className="pt-2 border-t border-border-default">
            <div className="mb-4 pb-2 border-b-[1.5px] border-border-default">
              <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">02</span> Academic Credentials
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="studentId" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  Student ID <span className="text-[11px] text-text-tertiary font-medium">(Read Only)</span>
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={user.studentId || "N/A"}
                  disabled
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-secondary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none opacity-80 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="department" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  Department <span className="text-[11px] text-text-tertiary font-medium">(Read Only)</span>
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={
                    profileData.department
                      ? DEPARTMENT_LABEL_MAP[profileData.department] || profileData.department
                      : (user.department ? DEPARTMENT_LABEL_MAP[user.department] || user.department : "N/A")
                  }
                  disabled
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-secondary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none opacity-80 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="session" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  Session <span className="text-[11px] text-text-tertiary font-medium">(Read Only)</span>
                </label>
                <input
                  id="session"
                  name="session"
                  type="text"
                  value={profileData.session || user.session || "N/A"}
                  disabled
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-secondary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none opacity-80 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="batch" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  Batch / Intake
                </label>
                <input
                  id="batch"
                  name="batch"
                  type="text"
                  placeholder="e.g. 5th Batch or 2021-2022"
                  value={profileData.batch}
                  onChange={(e) => setProfileData({ ...profileData, batch: e.target.value })}
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contactNumber" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  Contact Phone <span className="text-accent-error">*</span>
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  value={profileData.contactNumber}
                  onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="address" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  <MapPin size={13} className="text-accent-primary" /> Address / Campus Dorm
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="e.g. MEC Campus, Tilagarh, Sylhet"
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="website" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  <Globe size={13} className="text-accent-primary" /> Personal Portfolio / Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  placeholder="https://yourportfolio.dev or yourname.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-4">
              <label htmlFor="bio" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">Bio &amp; Interests</label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="Share a brief statement about your interests in tech, skills, and projects..."
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Part 03: Developer & Social Handles */}
          <div className="pt-2 border-t border-border-default">
            <div className="mb-4 pb-2 border-b-[1.5px] border-border-default">
              <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">03</span> Developer &amp; Social Handles
              </h2>
            </div>

            {/* 1. LinkedIn */}
            <div className="flex flex-col gap-1.5 mt-4">
              <label htmlFor="linkedin" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                <IconLI /> LinkedIn <span className="text-accent-error">*</span>
              </label>
              <input
                id="linkedin"
                name="linkedin"
                type="text"
                inputMode="url"
                placeholder="linkedin.com/in/username or username"
                value={profileData.linkedin}
                onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
              />
            </div>

            {/* 2. GitHub */}
            <div className="flex flex-col gap-1.5 mt-4">
              <label htmlFor="github" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                <IconGH /> GitHub <span className="text-accent-error">*</span>
              </label>
              <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden transition-all duration-150 focus-within:border-accent-primary focus-within:shadow-[3px_3px_0px_0px_var(--accent-primary)]">
                <span className="flex items-center px-2.5 bg-surface-secondary border-r border-border-default font-mono text-xs font-bold text-text-secondary h-10 shrink-0">github.com/</span>
                <input
                  id="github"
                  name="github"
                  type="text"
                  placeholder="username"
                  value={profileData.github}
                  onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                  className="w-full px-3.5 py-2 font-body text-sm text-text-primary border-none shadow-none bg-transparent outline-none focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Codeforces & CodeChef */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="codeforces" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  <IconCF /> Codeforces
                </label>
                <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden transition-all duration-150 focus-within:border-accent-primary focus-within:shadow-[3px_3px_0px_0px_var(--accent-primary)]">
                  <span className="flex items-center px-2.5 bg-surface-secondary border-r border-border-default font-mono text-xs font-bold text-text-secondary h-10 shrink-0">codeforces.com/</span>
                  <input
                    id="codeforces"
                    name="codeforces"
                    type="text"
                    placeholder="handle"
                    value={profileData.codeforces}
                    onChange={(e) => setProfileData({ ...profileData, codeforces: e.target.value })}
                    className="w-full px-3.5 py-2 font-body text-sm text-text-primary border-none shadow-none bg-transparent outline-none focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="codechef" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                  <IconCC /> CodeChef
                </label>
                <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden transition-all duration-150 focus-within:border-accent-primary focus-within:shadow-[3px_3px_0px_0px_var(--accent-primary)]">
                  <span className="flex items-center px-2.5 bg-surface-secondary border-r border-border-default font-mono text-xs font-bold text-text-secondary h-10 shrink-0">codechef.com/</span>
                  <input
                    id="codechef"
                    name="codechef"
                    type="text"
                    placeholder="username"
                    value={profileData.codechef}
                    onChange={(e) => setProfileData({ ...profileData, codechef: e.target.value })}
                    className="w-full px-3.5 py-2 font-body text-sm text-text-primary border-none shadow-none bg-transparent outline-none focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Discord */}
            <div className="flex flex-col gap-1.5 mt-4">
              <label htmlFor="discord" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                <IconDiscord /> Discord
              </label>
              <div className="flex items-center bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] overflow-hidden transition-all duration-150 focus-within:border-accent-primary focus-within:shadow-[3px_3px_0px_0px_var(--accent-primary)]">
                <span className="flex items-center px-2.5 bg-surface-secondary border-r border-border-default font-mono text-xs font-bold text-text-secondary h-10 shrink-0">@</span>
                <input
                  id="discord"
                  name="discord"
                  type="text"
                  placeholder="username"
                  value={profileData.discord}
                  onChange={(e) => setProfileData({ ...profileData, discord: e.target.value })}
                  className="w-full px-3.5 py-2 font-body text-sm text-text-primary border-none shadow-none bg-transparent outline-none focus:outline-none"
                />
              </div>
            </div>

            {/* 5. Facebook */}
            <div className="flex flex-col gap-1.5 mt-4">
              <label htmlFor="facebook" className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                <IconFB /> Facebook
              </label>
              <input
                id="facebook"
                name="facebook"
                type="text"
                inputMode="url"
                placeholder="facebook.com/username or username"
                value={profileData.facebook}
                onChange={(e) => setProfileData({ ...profileData, facebook: e.target.value })}
                className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
              />
            </div>

            {/* Part 04: Technical Skills & Tech Stack */}
            <div className="pt-4 border-t border-border-default">
              <div className="mb-4 pb-2 border-b-[1.5px] border-border-default">
                <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">
                    04
                  </span>
                  Technical Skills &amp; Expertise
                </h2>
                <p className="text-xs text-text-secondary mt-1 font-body">
                  Add technologies, programming languages, and competencies to showcase on your profile.
                </p>
              </div>

              {/* Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React, C++, Docker, AI..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 py-2 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none focus:border-accent-primary"
                />
                <Button type="button" size="sm" onClick={() => handleAddSkill()} className="shrink-0">
                  <Plus size={14} style={{ marginRight: "4px" }} /> Add Skill
                </Button>
              </div>

              {/* Active Tags */}
              <div className="flex flex-wrap gap-2 mt-3 min-h-[38px] p-2 bg-surface-secondary/60 rounded-md border border-dashed border-border-default">
                {skills.length === 0 ? (
                  <span className="text-xs text-text-tertiary font-mono italic flex items-center">
                    No skills added yet. Type a skill or pick from suggestions below.
                  </span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-md shadow-[1.5px_1.5px_0px_0px_var(--border-brutalist)] text-text-primary"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-text-secondary hover:text-accent-error cursor-pointer transition-colors"
                        title="Remove skill"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Suggestions */}
              <div className="mt-2.5">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Popular Suggestions (Click to add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleAddSkill(s)}
                      className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-border-default bg-surface-primary hover:bg-accent-primary-light hover:text-text-primary transition-all cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Part 05: Professional Experience (Job Ladder) */}
            <div className="pt-4 border-t border-border-default">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b-[1.5px] border-border-default">
                <div>
                  <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">
                      05
                    </span>
                    Professional Experience (Career Ladder)
                  </h2>
                  <p className="text-xs text-text-secondary mt-1 font-body">
                    Add current and previous companies, internships, or developer positions.
                  </p>
                </div>
                <Button type="button" size="sm" onClick={openAddExp} className="shrink-0 self-start sm:self-auto">
                  <Plus size={14} style={{ marginRight: "4px" }} /> Add Position
                </Button>
              </div>

              {/* Experience Items */}
              <div className="space-y-3">
                {experiences.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-surface-secondary/40 border border-dashed border-border-default rounded-lg">
                    <Briefcase size={28} className="mx-auto text-text-tertiary mb-2" />
                    <p className="text-xs font-bold text-text-secondary">No professional experience listed yet.</p>
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      Showcase internships, developer roles, and companies you have worked with.
                    </p>
                  </div>
                ) : (
                  experiences.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-lg shadow-[2px_2px_0px_var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-md bg-accent-primary-light/40 border border-border-default flex items-center justify-center text-accent-primary shrink-0 mt-0.5">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-heading text-sm font-bold text-text-primary m-0">
                              {exp.jobTitle}
                            </h4>
                            <span className="text-xs font-semibold text-text-secondary">
                              @ {exp.companyName}
                            </span>
                            {exp.isCurrent && (
                              <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded bg-accent-primary text-accent-primary-text">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-tertiary mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar size={12} /> {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                            </span>
                            {exp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {exp.location}
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <p className="text-xs text-text-secondary mt-1.5 font-body line-clamp-2">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => openEditExp(idx)}
                          className="p-1.5 text-text-secondary hover:text-text-primary border border-border-default rounded bg-surface-secondary hover:bg-surface-elevated transition-colors cursor-pointer"
                          title="Edit experience"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExp(idx)}
                          className="p-1.5 text-accent-error hover:bg-accent-error/10 border border-border-default rounded transition-colors cursor-pointer"
                          title="Delete experience"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Part 06: Higher Education & Academics */}
            <div className="pt-4 border-t border-border-default">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b-[1.5px] border-border-default">
                <div>
                  <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">
                      06
                    </span>
                    Higher Education &amp; Academic Milestones
                  </h2>
                  <p className="text-xs text-text-secondary mt-1 font-body">
                    Ideal for members and alumni pursuing M.Sc., Ph.D., or postgraduate studies abroad &amp; domestically.
                  </p>
                </div>
                <Button type="button" size="sm" onClick={openAddEdu} className="shrink-0 self-start sm:self-auto">
                  <Plus size={14} style={{ marginRight: "4px" }} /> Add Education
                </Button>
              </div>

              {/* Education Items */}
              <div className="space-y-3">
                {education.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-surface-secondary/40 border border-dashed border-border-default rounded-lg">
                    <GraduationCap size={28} className="mx-auto text-text-tertiary mb-2" />
                    <p className="text-xs font-bold text-text-secondary">No higher education records added yet.</p>
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      Add university degrees, postgrad research, M.Sc., or Ph.D. info.
                    </p>
                  </div>
                ) : (
                  education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-surface-primary border border-border-brutalist dark:border-border-default rounded-lg shadow-[2px_2px_0px_var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-md bg-accent-primary-light/40 border border-border-default flex items-center justify-center text-accent-primary shrink-0 mt-0.5">
                          <GraduationCap size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-heading text-sm font-bold text-text-primary m-0">
                              {edu.degree}
                            </h4>
                            <span className="text-xs font-semibold text-text-secondary">
                              at {edu.institution}
                            </span>
                            {edu.isCurrent && (
                              <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded bg-accent-primary text-accent-primary-text">
                                Currently Pursuing
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-tertiary mt-1 flex-wrap">
                            {edu.fieldOfStudy && (
                              <span className="font-medium text-text-secondary">
                                Major: {edu.fieldOfStudy}
                              </span>
                            )}
                            {(edu.startDate || edu.endDate) && (
                              <span className="flex items-center gap-1 font-mono">
                                <Calendar size={12} /> {edu.startDate || ""} – {edu.isCurrent ? "Present" : edu.endDate || "Present"}
                              </span>
                            )}
                            {edu.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} /> {edu.location}
                              </span>
                            )}
                          </div>
                          {edu.description && (
                            <p className="text-xs text-text-secondary mt-1.5 font-body line-clamp-2">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => openEditEdu(idx)}
                          className="p-1.5 text-text-secondary hover:text-text-primary border border-border-default rounded bg-surface-secondary hover:bg-surface-elevated transition-colors cursor-pointer"
                          title="Edit education"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEdu(idx)}
                          className="p-1.5 text-accent-error hover:bg-accent-error/10 border border-border-default rounded transition-colors cursor-pointer"
                          title="Delete education"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5 pt-3 border-t border-border-default">
              {onCancel && (
                <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={savingProfile}>
                  Cancel
                </Button>
              )}
              <Button type="submit" size="lg" disabled={savingProfile} id="profile-save-btn">
                <Save size={16} style={{ marginRight: "6px" }} />
                {savingProfile ? "Saving Profile Changes..." : "Save Profile Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Experience Add/Edit Modal */}
      {showExpModal && (
        <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[6px_6px_0px_0px_var(--border-brutalist)] dark:shadow-[6px_6px_0px_0px_var(--border-default)] max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <h3 className="font-heading text-base sm:text-lg font-bold text-text-primary m-0 flex items-center gap-2">
                <Briefcase size={18} className="text-accent-primary" />
                {editingExpIndex !== null ? "Edit Position" : "Add New Position"}
              </h3>
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-surface-secondary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 font-body">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Company / Organization Name <span className="text-accent-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brain Station 23, Enosis, Google..."
                  value={expForm.companyName}
                  onChange={(e) => setExpForm({ ...expForm, companyName: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Role / Job Title <span className="text-accent-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer, Frontend Intern..."
                  value={expForm.jobTitle}
                  onChange={(e) => setExpForm({ ...expForm, jobTitle: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Start Date / Year <span className="text-accent-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jan 2023 or 2023"
                    value={expForm.startDate}
                    onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    End Date / Year
                  </label>
                  <input
                    type="text"
                    disabled={expForm.isCurrent}
                    placeholder={expForm.isCurrent ? "Present" : "e.g. Dec 2024 or 2024"}
                    value={expForm.isCurrent ? "Present" : (expForm.endDate === "Present" ? "" : (expForm.endDate || ""))}
                    onChange={(e) => setExpForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-text-primary">
                <input
                  type="checkbox"
                  checked={expForm.isCurrent}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setExpForm((prev) => ({
                      ...prev,
                      isCurrent: checked,
                      endDate: checked ? "" : (prev.endDate === "Present" ? "" : prev.endDate),
                    }));
                  }}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-0 cursor-pointer"
                />
                I currently work in this role
              </label>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka, Bangladesh or Remote"
                  value={expForm.location || ""}
                  onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Key Responsibilities &amp; Achievements (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your role, projects built, and tech stack used..."
                  value={expForm.description || ""}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowExpModal(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSaveExp}>
                {editingExpIndex !== null ? "Update Position" : "Add Position"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Education Add/Edit Modal */}
      {showEduModal && (
        <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[6px_6px_0px_0px_var(--border-brutalist)] dark:shadow-[6px_6px_0px_0px_var(--border-default)] max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto my-auto relative">
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <h3 className="font-heading text-base sm:text-lg font-bold text-text-primary m-0 flex items-center gap-2">
                <GraduationCap size={18} className="text-accent-primary" />
                {editingEduIndex !== null ? "Edit Education Record" : "Add Education Record"}
              </h3>
              <button
                type="button"
                onClick={() => setShowEduModal(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-surface-secondary cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 font-body">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Institution / University <span className="text-accent-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Technical University of Munich, Mymensingh Eng. College..."
                  value={eduForm.institution}
                  onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Degree / Program <span className="text-accent-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. M.Sc. in Computer Science, Ph.D. in AI, B.Sc. in CSE..."
                  value={eduForm.degree}
                  onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Field of Study / Major (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Distributed Systems..."
                  value={eduForm.fieldOfStudy || ""}
                  onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Start Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={eduForm.startDate || ""}
                    onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                    className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    End / Expected Graduation
                  </label>
                  <input
                    type="text"
                    disabled={eduForm.isCurrent}
                    placeholder={eduForm.isCurrent ? "Present" : "e.g. 2026"}
                    value={eduForm.isCurrent ? "Present" : (eduForm.endDate === "Present" ? "" : (eduForm.endDate || ""))}
                    onChange={(e) => setEduForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-text-primary">
                <input
                  type="checkbox"
                  checked={eduForm.isCurrent}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setEduForm((prev) => ({
                      ...prev,
                      isCurrent: checked,
                      endDate: checked ? "" : (prev.endDate === "Present" ? "" : prev.endDate),
                    }));
                  }}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-0 cursor-pointer"
                />
                Currently studying / pursuing this degree
              </label>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Munich, Germany or Sylhet, Bangladesh"
                  value={eduForm.location || ""}
                  onChange={(e) => setEduForm({ ...eduForm, location: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Thesis, Lab, or Academic Focus (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Research in Graph Neural Networks under Prof. Schmidt..."
                  value={eduForm.description || ""}
                  onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })}
                  className="w-full py-2 px-3 text-sm bg-surface-primary border border-border-default rounded-md outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border-default">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowEduModal(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSaveEdu}>
                {editingEduIndex !== null ? "Update Record" : "Add Record"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Section 07: Profile Cover Banner */}
      <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6">
        <div className="mb-4 pb-2 border-b-[1.5px] border-border-default">
          <h2 className="flex items-center gap-2 font-heading text-base sm:text-lg font-extrabold text-text-primary m-0">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-accent-primary text-accent-primary-text font-mono text-xs font-black border border-black">07</span> Profile Cover Banner
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          <div
            key={coverPreviewUrl || user.coverUrl || "pf-tab-cover"}
            className="w-full aspect-[4/1] rounded-md border-2 border-dashed border-border-brutalist dark:border-border-default bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 overflow-hidden relative flex items-center justify-center cursor-pointer"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreviewUrl || user.coverUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={coverPreviewUrl || user.coverUrl}
                src={coverPreviewUrl || user.coverUrl}
                alt="Cover Preview"
                className="w-full h-full object-cover"
                style={{ objectPosition: (user as any).coverPosition || "50% 50%" }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-text-secondary">
                <Upload size={24} />
                <span className="text-xs font-bold font-mono">
                  {uploadingCover ? "Uploading Cover..." : "Click to Upload Cover Banner"}
                </span>
              </div>
            )}
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleCoverUpload}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="text-[11px] text-text-secondary">
              Recommended: 1200×300 (4:1 panoramic ratio). Max size 5MB.
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={uploadingCover}
              onClick={() => coverInputRef.current?.click()}
            >
              <Upload size={13} style={{ marginRight: "4px" }} />
              {uploadingCover ? "Uploading..." : "Upload from Computer"}
            </Button>
          </div>

          {/* Brutalist CSE Preset Gallery */}
          <div className="mt-3 border-t border-border-default pt-4">
            <p className="font-bold text-xs text-text-primary uppercase font-mono mb-3">
              Or Select a Handcrafted Brutalist CSE Cover:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {coverPresets.map((preset) => {
                const isSelected = (coverPreviewUrl || user.coverUrl) === preset.url;
                return (
                  <div
                    key={preset.id}
                    className={`rounded-md overflow-hidden bg-surface-secondary cursor-pointer flex flex-col transition-all duration-150 ${
                      isSelected
                        ? "border-[1.5px] border-accent-primary shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                        : "border border-border-brutalist dark:border-border-default shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)]"
                    }`}
                    onClick={() => handleSelectPresetCover(preset)}
                  >
                    <div className="w-full h-20 relative overflow-hidden bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-accent-primary text-black px-1.5 py-0.5 rounded-sm text-[9px] font-extrabold font-mono">
                          ✓ ACTIVE
                        </div>
                      )}
                    </div>
                    <div className="p-2 sm:px-2.5 flex justify-between items-center">
                      <div>
                        <div className="font-extrabold text-xs text-text-primary">{preset.name}</div>
                        <div className="text-[10px] text-text-secondary font-mono">{preset.category}</div>
                      </div>
                      <span className={`text-[11px] font-bold ${isSelected ? "text-accent-primary" : "text-text-tertiary"}`}>
                        {applyingPreset === preset.id ? "..." : isSelected ? "Active" : "Select"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Position Modal */}
      {user && (
        <AvatarPositionModal
          isOpen={showAvatarModal}
          onClose={() => {
            setShowAvatarModal(false);
            setPendingAvatarFile(null);
          }}
          userId={user.id || user._id}
          initialImageUrl={previewUrl || user.imageUrl}
          initialPosition={(user as any).imagePosition || "50% 50%"}
          initialFile={pendingAvatarFile}
          onSuccess={async () => {
            await onProfileUpdated();
          }}
        />
      )}
    </div>
  );
});
