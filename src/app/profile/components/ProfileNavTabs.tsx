"use client";

import React from "react";

export type ProfileTabKey =
  | "projects"
  | "events"
  | "certificates"
  | "cp"
  | "edit-profile"
  | "security";

interface ProfileNavTabsProps {
  activeTab: string;
  onTabChange: (tab: ProfileTabKey) => void;
  counts?: {
    projects?: number;
    events?: number;
    certificates?: number;
  };
}

export function ProfileNavTabs({
  activeTab,
  onTabChange,
  counts = {},
}: ProfileNavTabsProps) {
  const { projects = 0, events = 0, certificates = 0 } = counts;

  const tabs: { key: ProfileTabKey; label: string; count?: number }[] = [
    { key: "projects", label: "My Projects", count: projects },
    { key: "events", label: "My Events", count: events },
    { key: "certificates", label: "Certificates", count: certificates },
    { key: "cp", label: "CP Arena" },
    { key: "edit-profile", label: "Edit Profile" },
    { key: "security", label: "Security" },
  ];

  return (
    <div className="border-t-2 border-text-primary dark:border-border-default bg-surface-secondary px-3 sm:px-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-max py-0.5" role="tablist" aria-label="Profile navigation">
        {tabs.map(({ key, label, count }) => {
          const isSelected = activeTab === key || (key === "edit-profile" && activeTab === "profile");
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 font-heading text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap cursor-pointer border-b-[3px] select-none ${
                isSelected
                  ? "text-text-primary dark:text-white border-b-accent-primary bg-surface-elevated shadow-[inset_0_-2px_0_var(--accent-primary)]"
                  : "text-text-secondary border-b-transparent bg-transparent hover:text-text-primary dark:hover:text-white hover:bg-surface-primary"
              }`}
              onClick={() => onTabChange(key)}
            >
              <span>{label}</span>
              {typeof count === "number" && count > 0 && (
                <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm border border-border-brutalist dark:border-border-default bg-surface-primary text-text-primary dark:text-white">
                  {count}
                </span>
              )}
              {isSelected && (
                <span className="text-accent-primary text-xs font-black ml-0.5">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
