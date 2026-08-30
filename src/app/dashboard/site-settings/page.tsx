"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Settings, Save, RefreshCw } from "lucide-react";
import ToastNotification, { Toast } from "@/components/ui/shared/ToastNotification";

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/site-settings`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/site-settings`,
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
      <div className="space-y-4">
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-border-default">
        <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary flex items-center gap-2">
          <Settings className="text-accent-primary" size={28} />
          Global Settings
        </h2>
      </div>

      {settings.length === 0 ? (
        <div className="text-center py-20 text-text-secondary font-semibold">
          No settings configured yet.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.key}
              className="bg-surface-elevated rounded-xl border border-border-default p-5 shadow-[4px_4px_0px_0px_var(--border-default)]"
            >
              <label className="block text-sm font-semibold text-text-primary mb-1">
                {setting.label}
              </label>
              {setting.description && (
                <p className="text-xs text-text-secondary font-semibold mb-2">
                  {setting.description}
                </p>
              )}
              <input
                type="text"
                value={setting.value}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                className="w-full px-3 py-2 border border-border-default rounded-lg bg-surface-secondary text-text-primary text-sm focus:ring-2 focus:ring-accent-primary focus:outline-none"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-text-primary hover:bg-surface-inverse text-white border border-border-default rounded-lg text-sm font-semibold shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-md transition disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
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
