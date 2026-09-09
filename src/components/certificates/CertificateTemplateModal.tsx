"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Code,
  Sparkles,
  Upload,
  Copy,
  Check,
  Eye,
  Plus,
  Trash2,
  Award,
  Trophy,
  Star,
  Shield,
  Medal,
  Calendar,
  Layers,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  interpolateCertificateHtml,
  CERTIFICATE_PLACEHOLDERS,
  SAMPLE_HTML_TEMPLATE,
} from "@/lib/utils/templateInterpolation";
import { TemplateItem } from "./CertificateTemplateCard";
import toast from "react-hot-toast";

interface CertificateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: any) => Promise<void>;
  initialData?: TemplateItem | null;
}

const THEME_PRESETS = [
  {
    key: "emerald-clean",
    name: "Emerald Clean",
    primary: "#0D9488",
    accent: "#F59E0B",
    border: "neo-brutalist",
    badge: "award",
  },
  {
    key: "classic-gold",
    name: "Classic Gold Prestige",
    primary: "#D97706",
    accent: "#B45309",
    border: "classic-ornate",
    badge: "trophy",
  },
  {
    key: "tech-cyan",
    name: "Cyber Tech Hackathon",
    primary: "#06B6D4",
    accent: "#8B5CF6",
    border: "neo-brutalist",
    badge: "code",
  },
  {
    key: "crimson-bold",
    name: "Crimson Champion",
    primary: "#DC2626",
    accent: "#F59E0B",
    border: "modern-double",
    badge: "medal",
  },
  {
    key: "midnight-dark",
    name: "Midnight Luxury",
    primary: "#6366F1",
    accent: "#EC4899",
    border: "modern-double",
    badge: "star",
  },
  {
    key: "custom-bg",
    name: "Custom Graphic / Frame",
    primary: "#0F172A",
    accent: "#0D9488",
    border: "none",
    badge: "award",
  },
];

export const CertificateTemplateModal: React.FC<CertificateTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Visual Builder fields
  const [theme, setTheme] = useState<any>("emerald-clean");
  const [primaryColor, setPrimaryColor] = useState("#0D9488");
  const [accentColor, setAccentColor] = useState("#F59E0B");
  const [borderStyle, setBorderStyle] = useState<any>("neo-brutalist");
  const [badgeIcon, setBadgeIcon] = useState<any>("award");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("MYMENSINGH ENGINEERING COLLEGE COMPUTER CLUB");
  const [titleText, setTitleText] = useState("Certificate of Excellence");
  const [presentationText, setPresentationText] = useState("PROUDLY PRESENTED TO");
  const [footerNote, setFooterNote] = useState("Official credential verified on the MEC Computer Club registry.");
  const [signatories, setSignatories] = useState<Array<{ name: string; title: string; signatureImageUrl?: string }>>([
    { name: "Executive Committee", title: "MEC Computer Club" },
    { name: "Faculty Advisor", title: "Mymensingh Engineering College" },
  ]);

  // HTML Mode fields
  const [htmlContent, setHtmlContent] = useState(SAMPLE_HTML_TEMPLATE);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Preview toggle on mobile / split screen
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialData
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setActiveTab(initialData.type || "visual");
      setIsDefault(Boolean(initialData.isDefault));
      if (initialData.htmlContent) setHtmlContent(initialData.htmlContent);
      if (initialData.theme) setTheme(initialData.theme);
      if (initialData.primaryColor) setPrimaryColor(initialData.primaryColor);
      if (initialData.accentColor) setAccentColor(initialData.accentColor);
      if (initialData.borderStyle) setBorderStyle(initialData.borderStyle);
      if (initialData.badgeIcon) setBadgeIcon(initialData.badgeIcon);
      if (initialData.backgroundUrl !== undefined) setBackgroundUrl(initialData.backgroundUrl);
      if (initialData.headerSubtitle) setHeaderSubtitle(initialData.headerSubtitle);
      if (initialData.titleText) setTitleText(initialData.titleText);
      if (initialData.presentationText) setPresentationText(initialData.presentationText);
      if (initialData.footerNote !== undefined) setFooterNote(initialData.footerNote);
      if (initialData.signatories && initialData.signatories.length > 0) {
        setSignatories(initialData.signatories);
      }
    } else {
      setName("");
      setDescription("");
      setActiveTab("visual");
      setIsDefault(false);
      setTheme("emerald-clean");
      setPrimaryColor("#0D9488");
      setAccentColor("#F59E0B");
      setBorderStyle("neo-brutalist");
      setBadgeIcon("award");
      setBackgroundUrl("");
      setHeaderSubtitle("MYMENSINGH ENGINEERING COLLEGE COMPUTER CLUB");
      setTitleText("Certificate of Excellence");
      setPresentationText("PROUDLY PRESENTED TO");
      setFooterNote("Official credential verified on the MEC Computer Club registry.");
      setSignatories([
        { name: "Executive Committee", title: "MEC Computer Club" },
        { name: "Faculty Advisor", title: "Mymensingh Engineering College" },
      ]);
      setHtmlContent(SAMPLE_HTML_TEMPLATE);
    }
  }, [initialData, isOpen]);

  // Apply theme preset
  const handleApplyPreset = (presetKey: string) => {
    const p = THEME_PRESETS.find((x) => x.key === presetKey);
    if (!p) return;
    setTheme(p.key);
    setPrimaryColor(p.primary);
    setAccentColor(p.accent);
    setBorderStyle(p.border);
    setBadgeIcon(p.badge);
    toast.success(`Applied ${p.name} preset!`);
  };

  // Signatory add/remove
  const handleAddSignatory = () => {
    if (signatories.length >= 4) {
      toast.error("Maximum 4 signatories allowed.");
      return;
    }
    setSignatories([...signatories, { name: "President", title: "MEC Computer Club" }]);
  };

  const handleUpdateSignatory = (index: number, field: "name" | "title", value: string) => {
    const updated = [...signatories];
    updated[index][field] = value;
    setSignatories(updated);
  };

  const handleRemoveSignatory = (index: number) => {
    if (signatories.length <= 1) {
      toast.error("At least one signatory is required.");
      return;
    }
    setSignatories(signatories.filter((_, i) => i !== index));
  };

  // Upload .html file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      toast.error("Please upload a valid .html file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlContent(content);
        setActiveTab("html");
        toast.success(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)!`);
      }
    };
    reader.readAsText(file);
  };

  // Copy placeholder
  const handleCopyPlaceholder = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedToken(key);
    toast.success(`Copied ${key}`);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Live rendered HTML with mock data
  const sampleInterpolatedHtml = useMemo(() => {
    return interpolateCertificateHtml(htmlContent, {
      recipient_name: "Nafis Fuad",
      student_id: "2021331501",
      department: "Computer Science & Engineering",
      batch: "Batch 08",
      session: "2020-21",
      event_title: "MEC National Hackathon 2026",
      certificate_title: titleText || "Certificate of Excellence",
      certificate_id: "MCC-2026-DEMO01",
      issue_date: "September 6, 2026",
      position: "Champion (1st Place)",
      description: "For exemplary problem solving, teamwork, and software innovation.",
    });
  }, [htmlContent, titleText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Template name is required.");
      return;
    }

    if (activeTab === "html" && !htmlContent.trim()) {
      toast.error("HTML content cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        type: activeTab,
        htmlContent: activeTab === "html" ? htmlContent : undefined,
        theme,
        primaryColor,
        accentColor,
        borderStyle,
        badgeIcon,
        backgroundUrl,
        headerSubtitle,
        titleText,
        presentationText,
        footerNote,
        signatories,
        isDefault,
      });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[10px_10px_0px_var(--accent-primary)] max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-border-brutalist bg-surface-secondary flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                {initialData ? "Edit Certificate Template" : "Create Certificate Template"}
              </h2>
              <p className="text-xs text-text-secondary">
                Design custom event templates with visual styling or uploaded HTML/CSS code.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border-default hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs: Visual Builder vs Custom HTML */}
        <div className="px-5 pt-3 bg-surface-secondary/50 border-b border-border-default flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={`py-2 px-3.5 rounded-t-lg font-bold text-xs sm:text-sm flex items-center gap-2 border-t-2 border-x-2 transition-all cursor-pointer ${
                activeTab === "visual"
                  ? "bg-surface-elevated border-border-brutalist text-text-primary shadow-sm"
                  : "bg-transparent border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Sparkles size={14} className="text-accent-primary" /> Visual Design Builder
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("html")}
              className={`py-2 px-3.5 rounded-t-lg font-bold text-xs sm:text-sm flex items-center gap-2 border-t-2 border-x-2 transition-all cursor-pointer ${
                activeTab === "html"
                  ? "bg-surface-elevated border-border-brutalist text-text-primary shadow-sm"
                  : "bg-transparent border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Code size={14} className="text-blue-500" /> Custom HTML / Upload File
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1.5 pb-2 cursor-pointer bg-transparent border-none"
          >
            <Eye size={13} /> {showLivePreview ? "Hide Preview" : "Show Live Preview"}
          </button>
        </div>

        {/* Modal Body: Split Screen (Editor + Live Preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main Editor Form */}
          <div className={showLivePreview ? "lg:col-span-6 space-y-5" : "lg:col-span-12 space-y-5"}>
            {/* General Meta Fields */}
            <div className="space-y-3 p-4 bg-surface-secondary rounded-xl border border-border-default">
              <span className="font-mono text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">
                1. General Settings
              </span>
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., National Hackathon 2026 Champion Template"
                  className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Used for all competitive programming and hackathon podium winners."
                  className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tpl-default"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded accent-accent-primary"
                />
                <label htmlFor="tpl-default" className="text-xs font-bold text-text-primary cursor-pointer">
                  Set as club-wide default template (auto-selected during issuance)
                </label>
              </div>
            </div>

            {/* TAB 1: VISUAL DESIGN BUILDER */}
            {activeTab === "visual" && (
              <div className="space-y-4">
                {/* Theme Preset Picker */}
                <div className="p-4 bg-surface-secondary rounded-xl border border-border-default space-y-3">
                  <span className="font-mono text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">
                    2. Theme Preset
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {THEME_PRESETS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleApplyPreset(p.key)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          theme === p.key
                            ? "bg-surface-elevated border-accent-primary shadow-[2px_2px_0px_var(--accent-primary)]"
                            : "bg-surface-elevated/60 border-border-default hover:border-text-secondary"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-text-primary">{p.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary }} />
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-text-tertiary">{p.border}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors, Borders & Badges */}
                <div className="p-4 bg-surface-secondary rounded-xl border border-border-default space-y-3">
                  <span className="font-mono text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">
                    3. Styling & Accents
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-9 h-9 rounded cursor-pointer border border-border-default bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-surface-elevated border border-border-default rounded-lg font-mono text-xs text-text-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">Accent Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-9 h-9 rounded cursor-pointer border border-border-default bg-transparent p-0.5"
                        />
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-surface-elevated border border-border-default rounded-lg font-mono text-xs text-text-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">Border Style</label>
                      <select
                        value={borderStyle}
                        onChange={(e) => setBorderStyle(e.target.value as any)}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-xs font-bold text-text-primary"
                      >
                        <option value="neo-brutalist">Neo-Brutalist (Offset Shadow)</option>
                        <option value="classic-ornate">Classic Ornate (Double Gold)</option>
                        <option value="modern-double">Modern Double Inset</option>
                        <option value="minimal-clean">Minimal Clean</option>
                        <option value="none">None (Frameless)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">Badge Icon</label>
                      <select
                        value={badgeIcon}
                        onChange={(e) => setBadgeIcon(e.target.value as any)}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-xs font-bold text-text-primary"
                      >
                        <option value="award">Award Ribbon</option>
                        <option value="trophy">Trophy</option>
                        <option value="medal">Medal</option>
                        <option value="code">Code Glyph</option>
                        <option value="star">Star</option>
                        <option value="shield">Shield</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1">
                      Custom Background / Frame Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={backgroundUrl}
                      onChange={(e) => setBackgroundUrl(e.target.value)}
                      placeholder="https://example.com/certificate-frame.png"
                      className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-xs font-mono text-text-primary"
                    />
                    <p className="text-[10px] text-text-tertiary mt-1">
                      Provide a URL to a transparent border frame or parchment background texture.
                    </p>
                  </div>
                </div>

                {/* Typography & Copy */}
                <div className="p-4 bg-surface-secondary rounded-xl border border-border-default space-y-3">
                  <span className="font-mono text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">
                    4. Content & Text
                  </span>
                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1">Header Subtitle</label>
                    <input
                      type="text"
                      value={headerSubtitle}
                      onChange={(e) => setHeaderSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-xs text-text-primary font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">Award Title Text</label>
                      <input
                        type="text"
                        value={titleText}
                        onChange={(e) => setTitleText(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-xs text-text-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-primary mb-1">Presentation Line</label>
                      <input
                        type="text"
                        value={presentationText}
                        onChange={(e) => setPresentationText(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-xs text-text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-primary mb-1">Footer Verification Note</label>
                    <input
                      type="text"
                      value={footerNote}
                      onChange={(e) => setFooterNote(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-xs text-text-primary"
                    />
                  </div>
                </div>

                {/* Signatories Manager */}
                <div className="p-4 bg-surface-secondary rounded-xl border border-border-default space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">
                      5. Signatories ({signatories.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSignatory}
                      className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
                    >
                      <Plus size={13} /> Add Signatory
                    </button>
                  </div>

                  <div className="space-y-2">
                    {signatories.map((sig, idx) => (
                      <div key={idx} className="p-3 bg-surface-elevated rounded-lg border border-border-default flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Signatory Name / Role"
                            value={sig.name}
                            onChange={(e) => handleUpdateSignatory(idx, "name", e.target.value)}
                            className="px-2.5 py-1.5 bg-surface-secondary border border-border-default rounded text-xs font-bold text-text-primary"
                          />
                          <input
                            type="text"
                            placeholder="Title / Organization"
                            value={sig.title}
                            onChange={(e) => handleUpdateSignatory(idx, "title", e.target.value)}
                            className="px-2.5 py-1.5 bg-surface-secondary border border-border-default rounded text-xs text-text-secondary"
                          />
                        </div>
                        {signatories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSignatory(idx)}
                            className="p-1 text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOM HTML / CSS EDITOR */}
            {activeTab === "html" && (
              <div className="space-y-4">
                {/* Upload & Boilerplate Action Bar */}
                <div className="p-4 bg-surface-secondary rounded-xl border border-border-default flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-text-primary block mb-0.5">
                      Import or Write Custom HTML / CSS
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      Upload an existing <code className="font-mono bg-surface-elevated px-1 py-0.5 rounded">.html</code> file or write HTML directly with embedded <code className="font-mono">&lt;style&gt;</code>.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".html,.htm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} className="mr-1.5" /> Upload .html File
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (confirm("Replace current editor content with the sample boilerplate template?")) {
                          setHtmlContent(SAMPLE_HTML_TEMPLATE);
                          toast.success("Loaded boilerplate template!");
                        }
                      }}
                    >
                      <FileCode size={14} className="mr-1.5" /> Reset to Boilerplate
                    </Button>
                  </div>
                </div>

                {/* Token Placeholders Cheat Sheet */}
                <div className="p-3 bg-surface-secondary rounded-xl border border-border-default">
                  <span className="font-mono text-[10px] font-bold text-text-tertiary uppercase tracking-wider block mb-1.5">
                    Click to Copy Dynamic Placeholders:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CERTIFICATE_PLACEHOLDERS.map((token) => (
                      <button
                        key={token.key}
                        type="button"
                        onClick={() => handleCopyPlaceholder(token.key)}
                        className={`px-2 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1 transition cursor-pointer border ${
                          copiedToken === token.key
                            ? "bg-accent-primary text-white border-accent-primary"
                            : "bg-surface-elevated text-accent-primary border-border-default hover:border-accent-primary"
                        }`}
                        title={`Click to copy: ${token.label}`}
                      >
                        {copiedToken === token.key ? <Check size={11} /> : <Copy size={11} />}
                        {token.key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HTML Textarea Code Editor */}
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    HTML &amp; CSS Source Code
                  </label>
                  <textarea
                    rows={16}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border-2 border-border-brutalist focus:outline-none focus:border-accent-primary leading-relaxed shadow-inner"
                    placeholder="<!DOCTYPE html>..."
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right / Live Real-Time Preview Pane */}
          {showLivePreview && (
            <div className="lg:col-span-6 flex flex-col">
              <div className="sticky top-2 bg-surface-secondary p-3 sm:p-4 rounded-xl border-2 border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)]">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border-default">
                  <span className="font-mono text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Eye size={14} className="text-accent-primary" />
                    Live Certificate Preview
                  </span>
                  <span className="text-[10px] font-mono text-text-tertiary bg-surface-elevated px-2 py-0.5 rounded border border-border-default">
                    Sample Data &bull; {activeTab === "html" ? "Custom HTML Mode" : "Visual Mode"}
                  </span>
                </div>

                {/* Container for Preview */}
                <div className="overflow-hidden rounded-lg border border-border-default bg-white dark:bg-slate-900 shadow-sm max-h-[560px] flex items-center justify-center p-2">
                  {activeTab === "html" ? (
                    <iframe
                      title="Live Certificate Preview"
                      srcDoc={sampleInterpolatedHtml}
                      sandbox="allow-same-origin"
                      className="w-full aspect-[1.414/1] border-none rounded overflow-auto"
                    />
                  ) : (
                    /* Visual Mode Live Mockup */
                    <div
                      className="w-full aspect-[1.414/1] bg-surface-elevated p-6 text-center relative flex flex-col justify-between overflow-hidden"
                      style={{
                        borderColor: primaryColor,
                        borderStyle: borderStyle === "classic-ornate" ? "double" : "solid",
                        borderWidth: borderStyle === "none" ? "0px" : borderStyle === "classic-ornate" ? "6px" : "4px",
                        boxShadow:
                          borderStyle === "neo-brutalist" ? `6px 6px 0px ${primaryColor}` : undefined,
                        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: primaryColor }}>
                          <Award size={20} />
                          <span className="font-mono text-[9px] font-extrabold tracking-widest uppercase">
                            {headerSubtitle}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-text-primary tracking-tight uppercase mb-0.5">
                          {titleText}
                        </h3>
                        <span className="inline-block text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30">
                          ★ Champion (1st Place)
                        </span>
                      </div>

                      {/* Recipient Section */}
                      <div className="my-2 py-2 border-t border-b border-dashed border-border-default/80">
                        <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider block">
                          {presentationText}
                        </span>
                        <h4 className="text-base sm:text-lg font-black" style={{ color: primaryColor }}>
                          Nafis Fuad
                        </h4>
                        <span className="text-[10px] font-mono text-text-secondary">
                          Student ID: <strong>2021331501</strong> &bull; Dept. of CSE
                        </span>
                        <p className="text-[10px] text-text-secondary italic mt-1 max-w-sm mx-auto line-clamp-2">
                          &ldquo;For exemplary problem solving, teamwork, and software innovation.&rdquo;
                        </p>
                      </div>

                      {/* Event Pill */}
                      <div className="text-[10px] font-mono text-text-secondary">
                        Event: <strong className="text-text-primary">MEC National Hackathon 2026</strong>
                      </div>

                      {/* Signatories & Footer */}
                      <div className="pt-2 border-t border-border-default flex items-end justify-between text-left font-mono">
                        {signatories.map((sig, i) => (
                          <div key={i} className="text-center">
                            <div className="w-20 border-t border-text-primary mx-auto pt-0.5 font-bold text-[9px] text-text-primary line-clamp-1">
                              {sig.name}
                            </div>
                            <div className="text-[8px] text-text-tertiary line-clamp-1">{sig.title}</div>
                          </div>
                        ))}

                        <div className="text-right">
                          <span className="block text-[8px] text-text-tertiary">ID: MCC-2026-DEMO01</span>
                          <span className="block text-[7px] text-text-secondary font-bold">Verified Authentic</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t-2 border-border-brutalist bg-surface-secondary flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>

          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving Template..." : initialData ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </div>
    </div>
  );
};
