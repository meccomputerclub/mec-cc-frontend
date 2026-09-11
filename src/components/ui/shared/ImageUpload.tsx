"use client";

/**
 * ImageUpload — reusable image upload widget
 *
 * Features:
 *  - Click to browse
 *  - Drag & drop
 *  - Paste from clipboard (Ctrl+V / Cmd+V)
 *  - Manual URL input
 *  - Cloudinary upload via POST /api/upload/image
 *  - Preview thumbnail
 *  - Clear button
 *
 * Props:
 *  value        — current image URL (controlled)
 *  onChange     — called with the new URL after upload or manual entry
 *  label        — optional label shown above the zone
 *  hint         — optional hint text below
 *  folder       — Cloudinary folder name (default: "uploads")
 *  previewShape — "rect" (default) | "circle"
 *  error        — optional error string shown in red
 *  disabled     — disables all interactions
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Upload, X, Link as LinkIcon, ImageIcon, ClipboardPaste } from "lucide-react";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/imageCompressor";
import {
  parseDroppedOrPastedFiles,
  readClipboardMedia,
  isDragTransferValid,
} from "@/lib/utils/mediaDropzone";

export interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  folder?: string;
  previewShape?: "rect" | "circle";
  error?: string;
  disabled?: boolean;
}

import { API_BASE_URL } from "@/lib/api";

const getApiBaseUrl = () => {
  return API_BASE_URL.endsWith("/api") ? API_BASE_URL : `${API_BASE_URL}/api`;
};

export default function ImageUpload({
  value,
  onChange,
  label,
  hint,
  folder = "uploads",
  previewShape = "rect",
  error,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value);
  // Track the Cloudinary public_id so we can delete it if the user removes the image
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  // Keep urlDraft in sync when value changes externally
  useEffect(() => {
    setUrlDraft(value);
  }, [value]);

  // ── Upload a File object to Cloudinary ──────────────────────────────────
  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Image file size must be under 15MB");
        return;
      }
      setUploading(true);
      try {
        const compressed = await compressImage(file);
        const fd = new FormData();
        fd.append("image", compressed.file);
        fd.append("folder", folder);
        const res = await axios.post(
          `${getApiBaseUrl()}/upload/image?folder=${encodeURIComponent(folder)}`,
          fd,
          { withCredentials: true }
        );
        const url: string = res.data.url || res.data.secure_url;
        const publicId: string = res.data.public_id || "";
        setUploadedPublicId(publicId);
        onChange(url);
        toast.success("Image uploaded successfully!");
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Image upload failed. Please try again.";
        toast.error(msg);
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  // ── Delete from Cloudinary when user removes an uploaded image ───────────
  const handleRemove = useCallback(async () => {
    if (uploadedPublicId) {
      try {
        await axios.delete(
          `${getApiBaseUrl()}/upload/image`,
          {
            data: { public_id: uploadedPublicId },
            withCredentials: true,
          }
        );
      } catch {
        // Best-effort — don't block the UI if delete fails
        console.warn("Failed to delete image from Cloudinary:", uploadedPublicId);
      }
      setUploadedPublicId(null);
    }
    onChange("");
  }, [uploadedPublicId, onChange]);

  // ── File input change ───────────────────────────────────────────────────
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };
  // Safe window-level dragover prevention
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      if (isDragTransferValid(e.dataTransfer)) {
        e.preventDefault();
      }
    };
    window.addEventListener("dragover", handleWindowDragOver);
    return () => window.removeEventListener("dragover", handleWindowDragOver);
  }, []);

  // ── Drag & drop ─────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || uploading) return;

    const files = await parseDroppedOrPastedFiles(e.dataTransfer, {
      accept: "image/*",
      maxFiles: 1,
    });
    if (files.length > 0) {
      uploadFile(files[0]);
    } else {
      toast.error("No valid image file detected in dropped item");
    }
  };

  // ── Paste from clipboard ────────────────────────────────────────────────
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (disabled || uploading) return;
      // Check if the zone or any child has focus or is hovered
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable) &&
        !zoneRef.current?.contains(activeEl)
      ) {
        return;
      }

      if (!zoneRef.current?.contains(activeEl) && activeEl !== zoneRef.current) {
        return;
      }

      const files = await parseDroppedOrPastedFiles(e.clipboardData, {
        accept: "image/*",
        maxFiles: 1,
      });
      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        toast.success("Image pasted from clipboard!");
        uploadFile(files[0]);
      }
    },
    [disabled, uploading, uploadFile]
  );

  const handlePasteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || uploading) return;

    const files = await readClipboardMedia({ accept: "image/*" });
    if (files.length > 0) {
      toast.success("Image captured from clipboard!");
      uploadFile(files[0]);
    } else {
      toast.error("No image found in clipboard. Press Ctrl+V to paste.");
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  // ── Commit manual URL ───────────────────────────────────────────────────
  const commitUrl = () => {
    onChange(urlDraft.trim());
    setShowUrlInput(false);
  };

  const isCircle = previewShape === "circle";

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
          {label}
        </label>
      )}

      {/* ── Drop zone ── */}
      <div
        ref={zoneRef}
        tabIndex={0}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none outline-none",
          "focus-visible:ring-2 focus-visible:ring-blue-500",
          value ? "p-3" : "p-6",
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : error
            ? "border-red-400 bg-red-50 dark:bg-red-900/10"
            : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-500">Uploading…</span>
          </div>
        ) : value ? (
          /* Preview */
          <div className="flex items-center gap-4 w-full">
            <div className={[
              "relative flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700",
              isCircle ? "w-16 h-16 rounded-full" : "w-20 h-14 rounded-lg",
            ].join(" ")}>
              <Image src={value} alt="preview" fill style={{ objectFit: "cover" }} unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{value}</p>
              <p className="text-xs text-blue-500 mt-0.5">Click to replace · Drag or paste new image</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          /* Empty state */
          <>
            <div className={[
              "flex items-center justify-center rounded-xl",
              isDragOver ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-700",
              isCircle ? "w-16 h-16 rounded-full" : "w-12 h-12",
            ].join(" ")}>
              {isDragOver
                ? <Upload size={22} className="text-blue-500" />
                : <ImageIcon size={22} className="text-slate-400" />}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isDragOver ? "Drop to upload" : "Click, drag & drop, or paste"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WEBP &bull; From computer or web</p>
            </div>
            <div className="pt-1 pointer-events-auto">
              <button
                type="button"
                onClick={handlePasteClick}
                disabled={disabled || uploading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 transition shadow-2xs"
              >
                <ClipboardPaste size={12} />
                <span>Paste (Ctrl+V)</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── URL input toggle ── */}
      {!showUrlInput ? (
        <button
          type="button"
          onClick={() => setShowUrlInput(true)}
          disabled={disabled}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition w-fit"
        >
          <LinkIcon size={12} /> Enter URL manually
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            autoFocus
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitUrl(); } if (e.key === "Escape") setShowUrlInput(false); }}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button type="button" onClick={commitUrl}
            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
            Use
          </button>
          <button type="button" onClick={() => setShowUrlInput(false)}
            className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
            Cancel
          </button>
        </div>
      )}

      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
