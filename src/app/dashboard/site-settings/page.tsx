"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Save, RefreshCw, GraduationCap, Globe, Building2, Info } from "lucide-react";
import ToastNotification, { Toast } from "@/components/ui/shared/ToastNotification";
import { API_BASE_URL } from "@/lib/api";

interface SiteSetting {
  key: string;
  value: string;
  label: string;
  description?: string;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/site-settings`,
        { withCredentials: true }
      );
      setSettings(res.data.data || res.data);
    } catch {
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/site-settings`,
        { settings },
        { withCredentials: true }
      );
      setToast({ type: "success", message: "Settings saved successfully!" });
    } catch {
      setToast({ type: "error", message: "Failed to save settings. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-surface-secondary border border-border-default rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-surface-secondary border border-border-default rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-accent-error font-semibold mb-4">{error}</p>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-text-primary hover:bg-surface-inverse text-white border border-border-default rounded-lg text-sm font-semibold shadow-[4px_4px_0px_0px_var(--border-default)] transition"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  // Categorize settings
  const batchSettings = settings.filter((s) => s.key.startsWith("batch_current_"));
  const contactKeys = ["contact_email", "contact_phone", "whatsapp_number", "facebook_url", "linkedin_url", "youtube_url"];
  const contactSettings = settings.filter((s) => contactKeys.includes(s.key));
  const generalSettings = settings.filter((s) => !s.key.startsWith("batch_current_") && !contactKeys.includes(s.key));

  const renderSettingInput = (setting: SiteSetting) => {
    const isBatchSetting = setting.key.startsWith("batch_current_");
    return (
      <div
        key={setting.key}
        className="bg-surface-elevated rounded-xl border border-border-default p-5 shadow-[3px_3px_0px_0px_var(--border-default)] transition hover:shadow-[4px_4px_0px_0px_var(--border-default)]"
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <label className="block text-sm font-bold text-text-primary">
            {setting.label}
          </label>
          {isBatchSetting && (
            <span className="text-[11px] font-mono px-2 py-0.5 bg-accent-primary-light text-text-primary border border-border-default rounded font-bold">
              Latest Batch: #{setting.value}
            </span>
          )}
        </div>
        {setting.description && (
          <p className="text-xs text-text-secondary font-medium mb-3">
            {setting.description}
          </p>
        )}
        <input
          type={isBatchSetting ? "number" : "text"}
          min={isBatchSetting ? 1 : undefined}
          max={isBatchSetting ? 100 : undefined}
          value={setting.value}
          onChange={(e) => handleChange(setting.key, e.target.value)}
          className="w-full px-3.5 py-2.5 border border-border-default rounded-lg bg-surface-secondary text-text-primary text-sm font-semibold focus:ring-2 focus:ring-accent-primary focus:outline-none transition"
        />
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between border-b pb-4 border-border-default">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Settings className="text-accent-primary" size={28} />
            Global Settings
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Configure club information, contact channels, and dynamic batch options.
          </p>
        </div>
      </div>

      {settings.length === 0 ? (
        <div className="text-center py-20 text-text-secondary font-semibold">
          No settings configured yet.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Academic Batch Settings */}
          {batchSettings.length > 0 && (
            <div className="space-y-4">
              <div className="border-b border-border-default pb-2">
                <div className="flex items-center gap-2 text-lg font-bold text-text-primary">
                  <GraduationCap className="text-accent-primary" size={20} />
                  Academic Batch Settings (Current Junior Batch)
                </div>
                <div className="flex items-start gap-1.5 mt-1.5 p-3 bg-surface-secondary border border-border-default rounded-lg text-xs text-text-secondary">
                  <Info size={16} className="text-accent-primary shrink-0 mt-0.5" />
                  <span>
                    Set the current most junior (latest) batch number for each department. The registration form uses this to calculate and display only the most recent 10 batches (e.g. CSE #6 displays 1st through 6th, EEE #14 displays 5th through 14th).
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {batchSettings.map(renderSettingInput)}
              </div>
            </div>
          )}

          {/* Section 2: General Information */}
          {generalSettings.length > 0 && (
            <div className="space-y-4">
              <div className="border-b border-border-default pb-2">
                <div className="flex items-center gap-2 text-lg font-bold text-text-primary">
                  <Building2 className="text-accent-primary" size={20} />
                  General Club Information
                </div>
              </div>

              <div className="space-y-4">
                {generalSettings.map(renderSettingInput)}
              </div>
            </div>
          )}

          {/* Section 3: Contact & Socials */}
          {contactSettings.length > 0 && (
            <div className="space-y-4">
              <div className="border-b border-border-default pb-2">
                <div className="flex items-center gap-2 text-lg font-bold text-text-primary">
                  <Globe className="text-accent-primary" size={20} />
                  Contact Channels &amp; Social Links
                </div>
              </div>

              <div className="space-y-4">
                {contactSettings.map(renderSettingInput)}
              </div>
            </div>
          )}

          <div className="pt-2 sticky bottom-4 z-10">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-accent-primary hover:bg-accent-primary-hover text-white border-2 border-text-primary rounded-xl text-sm font-extrabold shadow-[4px_4px_0px_0px_var(--text-primary)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_var(--text-primary)] transition disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Saving Changes..." : "Save All Settings"}
            </button>
          </div>
        </form>
      )}

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
