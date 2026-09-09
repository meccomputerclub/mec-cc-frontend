"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, X, Check, Image as ImageIcon, Info, Sparkles, Link2, Move } from "lucide-react";
import { coverPresets, CoverPreset } from "@/data/coverPresets";

interface CoverPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoverUrl?: string;
  onSelectPreset: (preset: CoverPreset) => void;
  onSelectCustomUrl?: (url: string) => void;
  onUploadCustomClick: () => void;
  onTriggerReposition?: () => void;
  isApplying?: boolean;
  applyingPresetId?: string | null;
}

export function CoverPresetModal({
  isOpen,
  onClose,
  currentCoverUrl,
  onSelectPreset,
  onSelectCustomUrl,
  onUploadCustomClick,
  onTriggerReposition,
  applyingPresetId,
}: CoverPresetModalProps) {
  const [customUrlInput, setCustomUrlInput] = useState("");

  if (!isOpen) return null;

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    if (onSelectCustomUrl) {
      onSelectCustomUrl(customUrlInput.trim());
    } else {
      onSelectPreset({
        id: "custom-url",
        name: "Custom Web Banner",
        category: "Custom",
        url: customUrlInput.trim(),
        description: "Custom external banner URL",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-3 sm:p-4 animate-[fadeIn_0.2s_ease_forwards]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] max-h-[92vh] overflow-y-auto bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[8px_8px_0px_0px_var(--accent-primary)] p-4 sm:p-6 relative animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b-2 border-border-default">
          <div>
            <div className="flex items-center gap-1.5 text-accent-primary font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={14} /> Profile Personalization
            </div>
            <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">
              Change Profile Cover Banner
            </h2>
            <p className="font-body text-xs text-text-secondary mt-0.5">
              Select one of our handcrafted cyber presets, enter an image URL, or upload from your device.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 bg-surface-secondary border border-border-default rounded-md text-text-primary cursor-pointer font-extrabold transition-all duration-150 hover:bg-accent-primary-light hover:rotate-90 shrink-0"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 📐 IDEAL SIZE SPECIFICATION BANNER (Requested by user) */}
        <div className="mb-4 p-3.5 bg-accent-primary/10 border-2 border-accent-primary rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_0px_var(--accent-primary)]">
          <div className="p-1.5 bg-accent-primary text-black rounded-md shrink-0 mt-0.5">
            <Info size={18} />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-text-primary m-0 text-xs sm:text-sm">
              Recommended Cover Dimensions: <span className="underline decoration-accent-primary font-mono font-extrabold">1200 × 300 px</span> (or <span className="font-mono font-extrabold">1920 × 480 px</span>)
            </p>
            <p className="text-text-secondary m-0 leading-relaxed text-[11px] sm:text-xs">
              A wide <strong className="text-text-primary">4:1 panoramic aspect ratio</strong> fits the header perfectly across desktops, tablets, and phones without cropping your avatar or header information. Formats: PNG, JPG, or WebP (Max 5MB).
            </p>
          </div>
        </div>

        {/* 🖐 Drag & Reposition Current Banner Action */}
        {currentCoverUrl && onTriggerReposition && (
          <div className="mb-4 p-3 bg-surface-secondary border-2 border-border-default rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-[2px_2px_0px_0px_var(--border-default)]">
            <div>
              <span className="font-bold text-xs sm:text-sm text-text-primary flex items-center gap-1.5">
                <Move size={14} className="text-accent-primary" /> Drag & Reposition Current Banner
              </span>
              <p className="m-0 text-[11px] text-text-secondary mt-0.5">
                Want to adjust the focal point of your active banner? Drag and position it directly in your header.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onTriggerReposition();
              }}
              className="shrink-0"
            >
              <Move size={13} style={{ marginRight: "4px" }} /> Reposition Now
            </Button>
          </div>
        )}

        {/* Upload from PC & Direct URL row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Option A: Upload from PC */}
          <div className="p-3 bg-surface-secondary border-2 border-border-default rounded-xl flex flex-col justify-between gap-2.5">
            <div>
              <span className="font-bold text-xs sm:text-sm text-text-primary flex items-center gap-1.5">
                <Upload size={14} className="text-accent-primary" /> Upload From PC
              </span>
              <p className="m-0 text-[11px] text-text-secondary mt-1">
                Upload your custom 1200×300 photo from your local files.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onUploadCustomClick();
              }}
              className="w-full justify-center"
            >
              <Upload size={13} style={{ marginRight: "4px" }} /> Choose File...
            </Button>
          </div>

          {/* Option B: Direct Image URL */}
          <form onSubmit={handleApplyCustomUrl} className="p-3 bg-surface-secondary border-2 border-border-default rounded-xl flex flex-col justify-between gap-2.5">
            <div>
              <span className="font-bold text-xs sm:text-sm text-text-primary flex items-center gap-1.5">
                <Link2 size={14} className="text-accent-primary" /> Paste Image URL
              </span>
              <p className="m-0 text-[11px] text-text-secondary mt-1">
                Link an external image from Unsplash, Imgur, or Cloudinary.
              </p>
            </div>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-2.5 py-1 text-xs rounded border border-border-default bg-surface-primary text-text-primary font-mono focus:outline-none focus:border-accent-primary"
              />
              <Button type="submit" size="sm" variant="secondary" disabled={!customUrlInput.trim()}>
                Apply
              </Button>
            </div>
          </form>
        </div>

        {/* Preset Header */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-dashed border-border-default">
          <span className="font-mono text-xs font-bold text-text-tertiary uppercase tracking-wider">
            Built-In Cyber &amp; Brutalist Covers ({coverPresets.length})
          </span>
          <span className="text-[11px] text-text-tertiary">Click any cover to preview and apply</span>
        </div>

        {/* Preset List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {coverPresets.map((preset) => {
            const isSelected = currentCoverUrl === preset.url;
            const isApplying = applyingPresetId === preset.id;

            return (
              <div
                key={preset.id}
                className={`group rounded-xl overflow-hidden bg-surface-secondary flex flex-col transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "border-2 border-accent-primary shadow-[4px_4px_0px_0px_var(--accent-primary)] ring-2 ring-accent-primary/20"
                    : "border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_0px_var(--border-default)] hover:shadow-[4px_4px_0px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                }`}
                onClick={() => onSelectPreset(preset)}
              >
                {/* Banner Thumbnail */}
                <div className="w-full h-[95px] relative overflow-hidden bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-accent-primary text-black px-2 py-0.5 rounded text-[10px] font-extrabold font-mono flex items-center gap-1 shadow-md">
                      <Check size={12} /> ACTIVE
                    </div>
                  )}
                </div>

                {/* Info & Button Bar */}
                <div className="p-2.5 flex flex-col justify-between flex-1 gap-2 bg-surface-elevated">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-heading font-extrabold text-xs sm:text-sm text-text-primary m-0 truncate">
                        {preset.name}
                      </h4>
                      <span className="text-[9px] text-accent-primary bg-accent-primary/10 border border-accent-primary/30 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                        {preset.category}
                      </span>
                    </div>
                    <p className="mt-1 mb-0 text-[11px] text-text-secondary line-clamp-1 leading-snug">
                      {preset.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border-default flex items-center justify-between">
                    <span className="text-[10px] font-mono text-text-tertiary">Ratio 4:1 · Built-in</span>
                    <Button
                      size="sm"
                      variant={isSelected ? "outline" : "primary"}
                      disabled={isApplying}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPreset(preset);
                      }}
                      className="h-7 px-2.5 text-xs"
                    >
                      {isApplying ? "Applying..." : isSelected ? "Current" : "Use Cover"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
