"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/api";

export interface SiteSettingsData {
  club_name: string;
  club_tagline: string;
  founded_year: string;
  membership_fee: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  facebook_url: string;
  linkedin_url: string;
  youtube_url: string;
  github_url: string;
  batch_current_CSE: string;
  batch_current_EEE: string;
  batch_current_CE: string;
  [key: string]: string;
}

const DEFAULT_SETTINGS_DATA: SiteSettingsData = {
  club_name: "MEC Computer Club",
  club_tagline: "Learn. Build. Share.",
  founded_year: "2015",
  membership_fee: "500",
  address: "Department of CSE, Mymensingh Engineering College, Khagdahar, Mymensingh-2200",
  contact_email: "meccomputerclub@gmail.com",
  contact_phone: "+8801780667954",
  whatsapp_number: "8801780667954",
  facebook_url: "https://www.facebook.com/mec.programmingclub",
  linkedin_url: "https://www.linkedin.com/in/mec-computer-club/",
  youtube_url: "https://www.youtube.com/@MECComputerClub",
  github_url: "https://github.com",
  batch_current_CSE: "6",
  batch_current_EEE: "14",
  batch_current_CE: "8",
};

interface SiteSettingsContextType {
  settings: SiteSettingsData;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SETTINGS_DATA,
  loading: false,
  refreshSettings: async () => {},
});

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SETTINGS_DATA);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/site-settings/public`);
      if (!res.ok) throw new Error("Failed to fetch public settings");
      const data = await res.json();
      if (data && data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch {
      // Retain defaults gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("site_settings_updated", handleUpdate);
      return () => {
        window.removeEventListener("site_settings_updated", handleUpdate);
      };
    }
  }, [fetchSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
