"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

import {
  ProfileHero,
  ProfileNavTabs,
  ProfileTabKey,
  CoverPresetModal,
  ProjectsTab,
  EventsTab,
  CertificatesTab,
  CPArenaTab,
  ProfileEditTab,
  SecurityTab,
  AvatarPositionModal,
} from "./components";
import type { ProfileEditTabHandle } from "./components/ProfileEditTab";

import { events as staticEvents } from "@/data/events";
import { CoverPreset } from "@/data/coverPresets";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = (searchParams.get("tab") as ProfileTabKey) || "projects";

  const { user, loading: authLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTabKey>(urlTab);

  // Edit Profile Dirty State & Leave Confirmation
  const [isEditDirty, setIsEditDirty] = useState<boolean>(false);
  const isEditDirtyRef = useRef<boolean>(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<boolean>(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState<(() => void) | null>(null);
  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);
  const profileEditRef = useRef<ProfileEditTabHandle | null>(null);
  // Stores the intended navigation target for "Save & Leave" so onProfileUpdated
  // can redirect there instead of the default projects tab.
  const pendingAfterSaveRef = useRef<(() => void) | null>(null);

  const updateEditDirty = (dirty: boolean) => {
    isEditDirtyRef.current = dirty;
    setIsEditDirty(dirty);
  };

  // Datasets for personal profile
  const [allEvents, setAllEvents] = useState<any[]>(staticEvents);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // 1-Click Event Register State
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);

  const scrollToTopSection = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
  };

  // Warn browser-level (refresh / tab close) when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Intercept anchor / Next link clicks page-wide when edit tab is dirty
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!isEditDirtyRef.current) return;
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href") || target.href || "";
      if (
        !href ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) return;
      e.preventDefault();
      e.stopPropagation();
      const capturedHref = href;
      setPendingLeaveAction(() => () => {
        isEditDirtyRef.current = false;
        setIsEditDirty(false);
        router.push(capturedHref);
      });
      setShowLeaveConfirm(true);
    };
    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [router]);
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab: ProfileTabKey, force = false, shouldScroll = true) => {
    if (!force && activeTab === "edit-profile" && isEditDirtyRef.current && tab !== "edit-profile") {
      setPendingLeaveAction(() => () => {
        isEditDirtyRef.current = false;
        setIsEditDirty(false);
        setActiveTab(tab);
        router.replace(`/profile?tab=${tab}`, { scroll: false });
        if (shouldScroll) scrollToTopSection();
      });
      setShowLeaveConfirm(true);
      return;
    }
    isEditDirtyRef.current = false;
    setIsEditDirty(false);
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
    if (shouldScroll || tab !== activeTab) {
      scrollToTopSection();
    }
  };

  // Avatar and Cover upload refs & states
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showCoverModal, setShowCoverModal] = useState<boolean>(false);
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);
  const [isRepositioningCover, setIsRepositioningCover] = useState<boolean>(false);

  // Direct Avatar Upload from Hero Card
  const handleAvatarDirectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPendingAvatarFile(file);
    setShowAvatarModal(true);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // Cover Banner Upload (Supports custom PNG, JPG, WebP)
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

      // Call authenticated cover update endpoint
      await api.upload("/api/users/me/cover", formData, { method: "PATCH" });
      toast.success("Cover banner updated successfully!");
      setShowCoverModal(false);
      await refreshUser();
      scrollToTopSection();
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
      scrollToTopSection();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to set preset cover";
      toast.error(msg);
    } finally {
      setApplyingPreset(null);
    }
  };

  // Select Custom External URL Cover
  const handleSelectCustomUrl = async (url: string) => {
    try {
      await api.patch("/api/users/me", { coverUrl: url });
      toast.success("Cover banner updated successfully!");
      setShowCoverModal(false);
      await refreshUser();
      scrollToTopSection();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to update cover";
      toast.error(msg);
    }
  };

  // Fetch Member Dashboard Data
  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const results = await Promise.allSettled([
        api.get("/api/events"),
        api.get("/api/events/my-events"),
        api.get("/api/certificates/my-certificates"),
        api.get("/api/projects/my-projects"),
      ]);

      // 1. All Club Events (for browsing & registration)
      if (results[0].status === "fulfilled" && results[0].value) {
        const evs = (results[0].value as any).data || (results[0].value as any).events || results[0].value;
        if (Array.isArray(evs) && evs.length > 0) setAllEvents(evs);
      }

      // 2. User's Registered Events
      if (results[1].status === "fulfilled" && results[1].value) {
        const myEvs = (results[1].value as any).data || (results[1].value as any).events || results[1].value;
        if (Array.isArray(myEvs)) setMyEvents(myEvs);
      } else {
        // Fallback to filtering allEvents by user's attended list if my-events is empty
        const userId = user.id || user._id;
        const attendedIds = new Set((user.eventsAttended || []).map((e: any) => (e._id || e.id || e).toString()));
        const myEvsFallback = allEvents.filter((ev) => {
          const evId = (ev._id || ev.id)?.toString();
          return evId && attendedIds.has(evId);
        });
        setMyEvents(myEvsFallback);
      }

      // 3. User's Certificates
      if (results[2].status === "fulfilled" && results[2].value) {
        const certs = (results[2].value as any).data || (results[2].value as any).certificates || results[2].value;
        if (Array.isArray(certs)) setCertificates(certs);
      }

      // 4. User's Own Projects (Only projects added/contributed by the user)
      if (results[3].status === "fulfilled" && results[3].value) {
        const projs = (results[3].value as any).data || (results[3].value as any).projects || results[3].value;
        if (Array.isArray(projs)) {
          setMyProjects(projs);
        } else {
          setMyProjects([]);
        }
      } else {
        setMyProjects([]);
      }
    } catch (err) {
      console.warn("Error hydrating profile data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [user, allEvents]);

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
      await refreshUser();
      await fetchProfileData();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to register for event";
      toast.error(msg);
    } finally {
      setRegisteringEventId(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      const currentUrl =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/profile";
      router.replace(`/login?redirect=${encodeURIComponent(currentUrl)}`);
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
            onAvatarUploadTrigger={() => {
              setPendingAvatarFile(null);
              setShowAvatarModal(true);
            }}
            onEditProfileClick={() => handleTabChange("edit-profile")}
            uploadingCover={uploadingCover}
            uploadingAvatar={uploadingAvatar}
            isRepositioningCover={isRepositioningCover}
            onRepositionCoverChange={setIsRepositioningCover}
            onCoverPositionSaved={async () => {
              await refreshUser();
            }}
          />

          {/* Profile Navigation Tab Strip (Seamlessly docked at the base) */}
          <ProfileNavTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={{
              projects: myProjects.length,
              events: myEvents.length,
              certificates: certificates.length,
            }}
          />
        </div>
      </div>

      {/* ════ 2. TAB MAIN CONTENT AREA ════ */}
      <main className="w-full max-w-[var(--max-width)] mx-auto px-4 sm:px-6">
        {activeTab === "projects" && (
          <ProjectsTab
            user={user}
            projects={myProjects}
            onProjectAdded={fetchProfileData}
          />
        )}

        {activeTab === "events" && (
          <EventsTab
            user={user}
            allEvents={allEvents}
            myEvents={myEvents}
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

        {activeTab === "edit-profile" && (
          <ProfileEditTab
            ref={profileEditRef}
            user={user}
            onDirtyChange={updateEditDirty}
            onProfileUpdated={async () => {
              updateEditDirty(false);
              await refreshUser();
              await fetchProfileData();
              // If "Save & Leave" was used, go to the intended destination;
              // otherwise fall back to the default projects tab.
              if (pendingAfterSaveRef.current) {
                const afterSave = pendingAfterSaveRef.current;
                pendingAfterSaveRef.current = null;
                afterSave();
              } else {
                handleTabChange("projects", true, true);
                scrollToTopSection();
              }
            }}
            onCancel={() => {
              if (isEditDirtyRef.current) {
                setPendingLeaveAction(() => () => {
                  updateEditDirty(false);
                  handleTabChange("projects", true, true);
                  scrollToTopSection();
                });
                setShowLeaveConfirm(true);
              } else {
                handleTabChange("projects", true, true);
                scrollToTopSection();
              }
            }}
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
        currentCoverUrl={user?.coverUrl}
        onSelectPreset={handleSelectPresetCover}
        onSelectCustomUrl={handleSelectCustomUrl}
        onUploadCustomClick={() => coverInputRef.current?.click()}
        onTriggerReposition={() => setIsRepositioningCover(true)}
        applyingPresetId={applyingPreset}
      />

      {/* ════ 4. AVATAR POSITION & COMPRESSION MODAL ════ */}
      {user && (
        <AvatarPositionModal
          isOpen={showAvatarModal}
          onClose={() => {
            setShowAvatarModal(false);
            setPendingAvatarFile(null);
          }}
          userId={user.id || user._id}
          initialImageUrl={user.imageUrl}
          initialPosition={(user as any).imagePosition || "50% 50%"}
          initialFile={pendingAvatarFile}
          onSuccess={async () => {
            await refreshUser();
          }}
        />
      )}

      {/* ════ 5. UNSAVED CHANGES CONFIRMATION MODAL ════ */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[8px_8px_0px_0px_var(--accent-primary)] max-w-md w-full p-6 space-y-4 my-auto relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-warning/15 flex items-center justify-center border border-accent-warning/30 shrink-0">
                <AlertTriangle size={22} className="text-accent-warning" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-text-primary m-0">
                  Unsaved Changes
                </h3>
                <p className="text-xs text-text-secondary font-body mt-0.5">
                  You have made changes to your profile.
                </p>
              </div>
            </div>

            <p className="text-sm text-text-secondary font-body leading-relaxed">
              Are you sure you want to leave without saving? Any unsaved edits to your profile credentials, skills, experience ladder, or education records will be lost.
            </p>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-border-default">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSavingAndLeaving}
                onClick={() => {
                  setShowLeaveConfirm(false);
                  setPendingLeaveAction(null);
                }}
              >
                Keep Editing
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingAndLeaving}
                className="!bg-accent-error !text-white hover:!bg-accent-error/90 !border-accent-error shadow-[3px_3px_0px_0px_var(--text-primary)]"
                onClick={() => {
                  setShowLeaveConfirm(false);
                  if (pendingLeaveAction) {
                    pendingLeaveAction();
                    setPendingLeaveAction(null);
                  }
                }}
              >
                Discard &amp; Leave
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingAndLeaving}
                className="shadow-[3px_3px_0px_0px_var(--text-primary)]"
                onClick={async () => {
                  if (!profileEditRef.current || !pendingLeaveAction) return;
                  // Capture destination before async work clears state
                  const goThere = pendingLeaveAction;
                  pendingAfterSaveRef.current = goThere;
                  setShowLeaveConfirm(false);
                  setPendingLeaveAction(null);
                  setIsSavingAndLeaving(true);
                  try {
                    await profileEditRef.current.save();
                    // onProfileUpdated will pick up pendingAfterSaveRef and navigate
                  } catch {
                    // save() shows a toast on error; clear the override so we don't
                    // silently swallow a failed navigation
                    pendingAfterSaveRef.current = null;
                  } finally {
                    setIsSavingAndLeaving(false);
                  }
                }}
              >
                {isSavingAndLeaving ? "Saving..." : "Save & Leave"}
              </Button>
            </div>
          </div>
        </div>
      )}
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
