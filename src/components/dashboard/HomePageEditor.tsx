/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  Save, Plus, Trash2, LayoutDashboard, Users,
  Image as ImageIcon, Link as LinkIcon, FileText,
  Share2, Layers, AlertCircle,
} from "lucide-react";
import { defaultState, IHomePageData } from "@/lib/types/homePage";
import ImageUpload from "@/components/ui/shared/ImageUpload";
import { rawGalleryItems } from "@/data/gallery";

// ─────────────────────────────────────────────────────────────────────────────
// ALL helper components are defined at MODULE SCOPE (outside any component).
// This is the critical fix: if they were defined inside HomePageEditor, React
// would see a brand-new component type on every render and unmount/remount the
// DOM node, losing focus after every keystroke.
// ─────────────────────────────────────────────────────────────────────────────

const INPUT_CLS =
  "w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-slate-900 dark:text-slate-100";

// Stable text / number input
const CInput = React.memo(function CInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number;
  onChange: (val: string | number) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) =>
        onChange(type === "number" ? Number(e.target.value) : e.target.value)
      }
      className={INPUT_CLS}
    />
  );
});

// Stable textarea
const CTextarea = React.memo(function CTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className={INPUT_CLS + " resize-y"}
    />
  );
});

// Section header — defined outside so its identity is stable
function SectionHeader({
  icon: Icon,
  title,
  color = "text-slate-800",
}: {
  icon: React.ElementType;
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
      <Icon className={`w-5 h-5 ${color}`} />
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
    </div>
  );
}

// Labelled field wrapper — defined outside
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

// Image upload widget — defined outside
function ImageUploadField({
  label,
  currentUrl,
  onUploaded,
}: {
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  return (
    <ImageUpload
      label={label}
      value={currentUrl}
      onChange={onUploaded}
      folder="page_images"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main editor component
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePageEditor({ initialData }: { initialData?: Partial<IHomePageData> }) {
  const buildState = (data?: Partial<IHomePageData>): IHomePageData => ({
    heroSection: {
      ...defaultState.heroSection,
      ...(data?.heroSection || {}),
      stats: { ...defaultState.heroSection.stats, ...(data?.heroSection?.stats || {}) },
      links: { ...defaultState.heroSection.links, ...(data?.heroSection?.links || {}) },
    },
    introSection: { ...defaultState.introSection, ...(data?.introSection || {}) },
    featuredData: { ...defaultState.featuredData, ...(data?.featuredData || {}) },
  });

  const [formData, setFormData] = useState<IHomePageData>(() => buildState(initialData));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Re-initialise when parent passes fresh data after fetch
  useEffect(() => {
    if (!initialData) return;
    setFormData(buildState(initialData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Stable deep-path setter
  const setField = useCallback((path: string, value: unknown) => {
    setFormData((prev) => {
      const clone = JSON.parse(JSON.stringify(prev)) as IHomePageData;
      const keys = path.split(".");
      let cur: any = clone;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return clone;
    });
  }, []);

  const addArrayItem = useCallback((cat: keyof IHomePageData["featuredData"]) => {
    setFormData((prev) => ({
      ...prev,
      featuredData: { ...prev.featuredData, [cat]: [...prev.featuredData[cat], ""] },
    }));
  }, []);

  const removeArrayItem = useCallback((cat: keyof IHomePageData["featuredData"], idx: number) => {
    setFormData((prev) => ({
      ...prev,
      featuredData: {
        ...prev.featuredData,
        [cat]: prev.featuredData[cat].filter((_, i) => i !== idx),
      },
    }));
  }, []);

  const updateArrayItem = useCallback(
    (cat: keyof IHomePageData["featuredData"], idx: number, val: string) => {
      setFormData((prev) => {
        const arr = [...prev.featuredData[cat]];
        arr[idx] = val;
        return { ...prev, featuredData: { ...prev.featuredData, [cat]: arr } };
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await axios.patch(
        `${API_BASE_URL}/api/page`,
        formData,
        { withCredentials: true }
      );
      setMessage({ type: "success", text: "Homepage updated successfully!" });
    } catch (err: unknown) {
      let text = "Failed to update homepage. Please try again.";
      if (axios.isAxiosError(err)) {
        text = err.response?.data?.message || err.response?.data?.error || text;
      }
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">CMS Editor</h1>
          <p className="text-xs text-slate-500">Manage Home Page Content</p>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </span>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? <span className="animate-spin">⏳</span> : <Save size={18} />}
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">

        {/* ── HERO ── */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <SectionHeader icon={LayoutDashboard} title="Hero Section" color="text-blue-600" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Field label="Main Title">
              <CInput
                value={formData.heroSection.title}
                onChange={(v) => setField("heroSection.title", v)}
                placeholder="e.g. MEC Computer Club"
              />
            </Field>
            <Field label="Subtitle">
              <CInput
                value={formData.heroSection.subtitle}
                onChange={(v) => setField("heroSection.subtitle", v)}
                placeholder="e.g. Innovate. Build. Inspire."
              />
            </Field>
            <div className="md:col-span-2">
              <ImageUploadField
                label="Background Image"
                currentUrl={formData.heroSection.bgImgUrl}
                onUploaded={(url) => setField("heroSection.bgImgUrl", url)}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Users size={16} /> Impact Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(["members", "totalProjects", "totalEvents", "eventsPerYear"] as const).map((k) => (
                <Field key={k} label={k.replace(/([A-Z])/g, " $1").trim()}>
                  <CInput
                    type="number"
                    value={formData.heroSection.stats[k]}
                    onChange={(v) => setField(`heroSection.stats.${k}`, v)}
                  />
                </Field>
              ))}
            </div>
          </div>

          {/* CTA Links */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <LinkIcon size={16} /> Call to Action Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="'Join' Button URL">
                <CInput
                  value={formData.heroSection.links.join}
                  onChange={(v) => setField("heroSection.links.join", v)}
                  placeholder="/join"
                />
              </Field>
              <Field label="'Events' Button URL">
                <CInput
                  value={formData.heroSection.links.events}
                  onChange={(v) => setField("heroSection.links.events", v)}
                  placeholder="/events"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── INTRO ── */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <SectionHeader icon={FileText} title="Introduction Section" color="text-indigo-600" />
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Section Label">
                <CInput
                  value={formData.introSection.label}
                  onChange={(v) => setField("introSection.label", v)}
                  placeholder="e.g. Who We Are"
                />
              </Field>
              <Field label="Main Heading">
                <CInput
                  value={formData.introSection.title}
                  onChange={(v) => setField("introSection.title", v)}
                  placeholder="e.g. A Community of Developers"
                />
              </Field>
            </div>
            <Field label="Description Text">
              <CTextarea
                value={formData.introSection.description}
                onChange={(v) => setField("introSection.description", v)}
                placeholder="Write a short paragraph..."
              />
            </Field>
            <ImageUploadField
              label="Side Image"
              currentUrl={formData.introSection.imgUrl}
              onUploaded={(url) => setField("introSection.imgUrl", url)}
            />
          </div>
        </div>

        {/* ── FEATURED DATA ── */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <SectionHeader icon={Layers} title="Featured Content References" color="text-purple-600" />
          <p className="text-sm text-slate-500 mb-6 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800 flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            Paste the <strong>MongoDB Object IDs</strong> of items you want featured on the home page.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {([
              { key: "events", label: "Featured Events", icon: LayoutDashboard },
              { key: "projects", label: "Top Projects", icon: Layers },
              { key: "blogs", label: "Latest Blogs", icon: FileText },
              { key: "gallery", label: "Gallery Highlights", icon: ImageIcon },
              { key: "sponsors", label: "Our Sponsors", icon: Share2 },
            ] as const).map((section) => (
              <div key={section.key} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 capitalize">
                    <section.icon size={16} /> {section.label}
                  </h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem(section.key)}
                    className="text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded shadow-sm flex items-center gap-1 transition"
                  >
                    <Plus size={12} /> Add ID
                  </button>
                </div>
                <div className="space-y-2">
                  {section.key === "gallery" && (
                    <div className="mb-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-800">
                      <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block mb-1.5">
                        Quick Select (Max 5 for Homepage):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rawGalleryItems.map((g) => {
                          const isSelected = (formData.featuredData.gallery || []).includes(g.id);
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    featuredData: {
                                      ...prev.featuredData,
                                      gallery: prev.featuredData.gallery.filter((id) => id !== g.id),
                                    },
                                  }));
                                } else {
                                  if ((formData.featuredData.gallery || []).length >= 5) {
                                    alert("Homepage displays up to 5 featured gallery items.");
                                  }
                                  setFormData((prev) => ({
                                    ...prev,
                                    featuredData: {
                                      ...prev.featuredData,
                                      gallery: [...(prev.featuredData.gallery || []), g.id],
                                    },
                                  }));
                                }
                              }}
                              className={`text-[10px] font-mono px-2 py-1 rounded border transition ${
                                isSelected
                                  ? "bg-purple-600 text-white border-purple-700 font-bold"
                                  : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-purple-400"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "}{g.title} ({g.id})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(formData.featuredData[section.key] || []).map((id, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={id}
                        onChange={(e) => updateArrayItem(section.key, idx, e.target.value)}
                        placeholder={`Paste ${section.label.slice(0, -1)} ID…`}
                        className="flex-1 text-xs font-mono p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(section.key, idx)}
                        className="text-slate-400 hover:text-red-500 p-1.5 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {(formData.featuredData[section.key] || []).length === 0 && (
                    <div className="text-xs text-slate-400 italic text-center py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded">
                      No items added yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
