"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";

import {
  ProfileHero,
  ProfileNavTabs,
  ProfileTabKey,
  CoverPresetModal,
  ProjectsTab,
  EventsTab,
  CertificatesTab,
  CPArenaTab,
  FormsTab,
  ProfileEditTab,
  SecurityTab,
} from "./components";

import { events as staticEvents } from "@/data/events";
import { projects as staticProjects } from "@/data/projects";
import { CoverPreset } from "@/data/coverPresets";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = (searchParams.get("tab") as ProfileTabKey) || "projects";

  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTabKey>(urlTab);

  // Datasets for personal profile
  const [allEvents, setAllEvents] = useState<any[]>(staticEvents);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>(staticProjects);
  const [forms, setForms] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // 1-Click Event Register State
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);

  // Sync tab with URL
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab: ProfileTabKey) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  // Avatar and Cover upload refs & states
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [uploadingCover, setUploadingCover] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);

  // Direct Avatar Upload from Hero Card
  const handleAvatarDirectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo exceeds maximum 5MB size limit.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      return;
    }

    const localUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = async () => {
      if (img.width !== img.height) {
        toast.error("Photo MUST be exactly squared (1:1 ratio). Please crop before uploading.");
        if (avatarInputRef.current) avatarInputRef.current.value = "";
        return;
      }

      setUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const userId = user.id || user._id;
        await api.upload(`/api/users/update/image/${userId}`, formData, { method: "PATCH" });
        toast.success("Profile photo updated successfully!");
        await refreshUser();
      } catch (err: any) {
        const msg = err instanceof ApiError ? err.message : err?.message || "Failed to upload photo";
        toast.error(msg);
      } finally {
        setUploadingAvatar(false);
        if (avatarInputRef.current) avatarInputRef.current.value = "";
      }
    };

    img.onerror = () => {
      toast.error("Invalid or corrupted image file.");
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    };

    img.src = localUrl;
  };

  // Cover Banner Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover photo exceeds 5MB size limit.");
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("cover", file);

      const userId = user.id || user._id;
      await api.upload(`/api/users/update/cover/${userId}`, formData, { method: "PATCH" });
      toast.success("Cover banner updated successfully!");
      setShowCoverModal(false);
      await refreshUser();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to upload cover banner";
      toast.error(msg);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Select Preset Cover
  const handleSelectPresetCover = async (preset: CoverPreset) => {
    setApplyingPreset(preset.id);
    try {
      await api.patch("/api/users/me", { coverUrl: preset.url });
      toast.success(`Cover banner updated to "${preset.name}"!`);
      setShowCoverModal(false);
      await refreshUser();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to set preset cover";
      toast.error(msg);
    } finally {
      setApplyingPreset(null);
    }
  };

  // Fetch Member Dashboard Data
  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const results = await Promise.allSettled([
        api.get("/api/events"),
        api.get("/api/certificates/my-certificates"),
        api.get("/api/projects/my-projects"),
        api.get("/api/forms/active"),
      ]);

      if (results[0].status === "fulfilled" && results[0].value) {
        const evs = (results[0].value as any).data || (results[0].value as any).events || results[0].value;
        if (Array.isArray(evs) && evs.length > 0) setAllEvents(evs);
      }
      if (results[1].status === "fulfilled" && results[1].value) {
        const certs = (results[1].value as any).data || (results[1].value as any).certificates || results[1].value;
        if (Array.isArray(certs)) setCertificates(certs);
      }
      if (results[2].status === "fulfilled" && results[2].value) {
        const projs = (results[2].value as any).data || (results[2].value as any).projects || results[2].value;
        if (Array.isArray(projs) && projs.length > 0) setAllProjects(projs);
      }
      if (results[3].status === "fulfilled" && results[3].value) {
        const fms = (results[3].value as any).data || (results[3].value as any).forms || results[3].value;
        if (Array.isArray(fms)) setForms(fms);
      }
    } catch (err) {
      console.warn("Error hydrating profile data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, fetchProfileData]);

  // 1-Click Event Register
  const handleRegisterEvent = async (eventId: string) => {
    setRegisteringEventId(eventId);
    try {
      await api.post(`/api/events/${eventId}/participants/register`);
      toast.success("Registered for event successfully!");
      refreshUser();
      fetchProfileData();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to register for event";
      toast.error(msg);
    } finally {
      setRegisteringEventId(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="w-full max-w-[var(--max-width)] mx-auto px-4 sm:px-6 text-center py-24">
        <p className="text-text-secondary font-mono text-sm">
          &gt; initializing profile terminal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-var(--nav-height,64px))] flex flex-col pb-24 bg-transparent pt-0">
      {/* Hidden file inputs for direct Cover & Avatar uploads */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleCoverUpload}
        className="hidden"
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleAvatarDirectUpload}
        className="hidden"
      />

      {/* ════ 1. PROFILE IDENTITY HERO & NAVIGATION CARD ════ */}
      <div className="w-full max-w-[var(--max-width)] mx-auto px-4 sm:px-6 mb-6 pt-4 sm:pt-6">
        <div className="w-full bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[6px_6px_0px_0px_var(--accent-primary)] overflow-hidden transition-all duration-150">
          {/* Profile Hero Header Content */}
          <ProfileHero
            user={user}
            onOpenCoverModal={() => setShowCoverModal(true)}
            onAvatarUploadTrigger={() => avatarInputRef.current?.click()}
            onEditProfileClick={() => handleTabChange("edit-profile")}
            uploadingCover={uploadingCover}
            uploadingAvatar={uploadingAvatar}
          />

          {/* Profile Navigation Tab Strip (Seamlessly docked at the base) */}
          <ProfileNavTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={{
              projects: allProjects.length,
              events: allEvents.length,
              certificates: certificates.length,
              forms: forms.length,
            }}
          />
        </div>
      </div>

      {/* ════ 2. TAB MAIN CONTENT AREA ════ */}
      <main className="w-full max-w-[var(--max-width)] mx-auto px-4 sm:px-6">
        {activeTab === "projects" && (
          <ProjectsTab user={user} projects={allProjects} />
        )}

        {activeTab === "events" && (
          <EventsTab
            user={user}
            allEvents={allEvents}
            onRegisterEvent={handleRegisterEvent}
            registeringEventId={registeringEventId}
          />
        )}

        {activeTab === "certificates" && (
          <CertificatesTab user={user} certificates={certificates} />
        )}

        {activeTab === "cp" && (
          <CPArenaTab user={user} onEditProfile={() => handleTabChange("edit-profile")} />
        )}

        {activeTab === "forms" && (
          <FormsTab user={user} forms={forms} />
        )}

        {activeTab === "edit-profile" && (
          <ProfileEditTab
            user={user}
            onProfileUpdated={async () => {
              await refreshUser();
              await fetchProfileData();
              handleTabChange("projects");
            }}
            onCancel={() => handleTabChange("projects")}
          />
        )}

        {activeTab === "security" && (
          <SecurityTab user={user} />
        )}
      </main>

      {/* ════ 3. PRESET COVER MODAL ════ */}
      <CoverPresetModal
        isOpen={showCoverModal}
        onClose={() => setShowCoverModal(false)}
        currentCoverUrl={user.coverUrl}
        onSelectPreset={handleSelectPresetCover}
        onUploadCustomClick={() => coverInputRef.current?.click()}
        applyingPresetId={applyingPreset}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[var(--max-width)] mx-auto px-4 sm:px-6 text-center py-24">
          <p className="text-text-secondary font-mono text-sm">Loading profile workspace...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
