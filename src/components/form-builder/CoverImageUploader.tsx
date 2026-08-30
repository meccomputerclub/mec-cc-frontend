"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Trash2,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  coverImageUrl: string;
  pendingFile: File | null;
  onImageSelected: (url: string, file: File | null) => void;
}

const BANNER_PRESETS = [
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80",
];

export default function CoverImageUploader({
  coverImageUrl,
  pendingFile,
  onImageSelected,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState(coverImageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCustomUrl(coverImageUrl || "");
  }, [coverImageUrl]);

  const handleLocalFileSelection = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, GIF).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file size must be under 15MB.");
      return;
    }

    // Instant zero-latency local preview (Upload deferred until Save & Deploy)
    const previewUrl = URL.createObjectURL(file);
    onImageSelected(previewUrl, file);
    setShowUrlInput(false);
    toast.success("Cover image selected. Will be uploaded to Cloudinary on Save & Deploy.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLocalFileSelection(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLocalFileSelection(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          handleLocalFileSelection(file);
          return;
        }
      }
    }

    // Check if URL text was pasted
    const pastedText = e.clipboardData?.getData("text");
    if (pastedText && (pastedText.startsWith("http://") || pastedText.startsWith("https://"))) {
      onImageSelected(pastedText.trim(), null);
      setCustomUrl(pastedText.trim());
      toast.success("Cover URL applied from clipboard.");
    }
  };

  return (
    <div
      ref={dropzoneRef}
      onPaste={handlePaste}
      tabIndex={0}
      className="focus:outline-none"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── If Cover Image Exists ── */}
      {coverImageUrl ? (
        <div className="relative group overflow-hidden border-b border-border-default">
          <div
            className="w-full h-44 sm:h-60 bg-cover bg-center transition-all duration-300"
            style={{ backgroundImage: `url(${coverImageUrl})` }}
          />

          {/* Pending Upload Indicator Badge */}
          {pendingFile && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-accent-primary font-semibold text-[11px] px-3 py-1 rounded-full border border-accent-primary/40 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pending Cloudinary Upload on Save</span>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-lg">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 rounded-lg transition flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-accent-primary" />
              Replace Cover
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition flex items-center gap-1"
              title="Edit URL or pick preset"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                onImageSelected("", null);
                setCustomUrl("");
              }}
              className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 rounded-lg transition"
              title="Remove Cover Image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* ── No Cover Image: Interactive Dropzone & Browse ── */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`p-6 border-b border-border-default transition-all ${isDragging
              ? "bg-accent-primary-light/40 border-accent-primary"
              : "bg-surface-secondary/50 hover:bg-surface-secondary"
            }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-2xl border-2 border-dashed border-accent-primary/60 bg-surface-elevated flex items-center justify-center text-accent-primary cursor-pointer hover:scale-105 transition shadow-sm shrink-0"
              >
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <div className="text-xs sm:text-sm font-extrabold text-text-primary flex items-center gap-2 justify-center sm:justify-start">
                  <span>Add Google Forms Cover Photo</span>
                  <span className="text-[10px] bg-accent-primary-light text-accent-primary font-semibold px-2 py-0.5 rounded-full border border-accent-primary/30 hidden sm:inline">
                    Uploads on Save &amp; Deploy
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  <strong
                    onClick={() => fileInputRef.current?.click()}
                    className="text-accent-primary hover:underline cursor-pointer font-semibold"
                  >
                    Click to browse
                  </strong>
                  , drag &amp; drop file, or press{" "}
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-elevated border border-border-default rounded">
                    Ctrl + V
                  </kbd>{" "}
                  to paste screenshot
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-accent-primary text-accent-primary-text hover:opacity-90 transition shadow-sm"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Select Image
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border-default bg-surface-elevated text-text-primary hover:bg-surface-primary transition shadow-sm"
              >
                <LinkIcon className="w-3.5 h-3.5 text-accent-primary" /> URL / Presets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Collapsible URL & Preset Picker Panel ── */}
      {showUrlInput && (
        <div className="p-5 border-b border-border-default bg-surface-secondary/70 space-y-3.5 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary flex items-center justify-between">
              <span>Paste Direct Image URL</span>
              <span className="text-[10px] text-text-tertiary">PNG, JPG, WEBP, GIF</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (customUrl.trim()) {
                      onImageSelected(customUrl.trim(), null);
                      toast.success("Cover image URL applied.");
                      setShowUrlInput(false);
                    }
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-border-default bg-surface-elevated text-text-primary text-xs font-medium focus:outline-none focus:border-accent-primary shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (customUrl.trim()) {
                    onImageSelected(customUrl.trim(), null);
                    toast.success("Cover image URL applied.");
                    setShowUrlInput(false);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-text-primary text-surface-primary hover:bg-surface-inverse transition shadow-sm"
              >
                Apply URL
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-border-default bg-surface-elevated text-text-secondary hover:text-text-primary"
              >
                Close
              </button>
            </div>
          </div>

          {/* Quick Header Presets */}
          <div className="space-y-2 pt-1 border-t border-border-default/60">
            <span className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-primary" /> Or select a curated tech banner preset:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BANNER_PRESETS.map((presetUrl, pi) => (
                <button
                  key={pi}
                  type="button"
                  onClick={() => {
                    onImageSelected(presetUrl, null);
                    setCustomUrl(presetUrl);
                    setShowUrlInput(false);
                    toast.success(`Applied Tech Preset #${pi + 1}`);
                  }}
                  className="h-16 rounded-xl border-2 border-border-default bg-cover bg-center relative hover:border-accent-primary transition overflow-hidden group shadow-sm active:scale-95"
                  style={{ backgroundImage: `url(${presetUrl})` }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-white bg-black/70 px-2 py-0.5 rounded-md border border-white/20">
                      Preset #{pi + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
