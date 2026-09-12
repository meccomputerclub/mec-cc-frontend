"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Upload, X, Loader2, Sparkles, ClipboardPaste, Trash2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { compressImage } from "@/lib/imageCompressor";
import {
  parseDroppedOrPastedFiles,
  readClipboardMedia,
  isDragTransferValid,
} from "@/lib/utils/mediaDropzone";
import toast from "react-hot-toast";

export interface UniversalImageDropzoneProps {
  label?: string;
  hint?: string;
  aspectRatioHint?: string;
  // Deferred mode props (holds local File for upload on form submit)
  selectedFile?: File | null;
  onFileSelect?: (file: File) => void;
  // Immediate mode props (uploads directly to Cloudinary and returns URL)
  value?: string;
  onChange?: (url: string) => void;
  folder?: string;
  // Common
  currentUrl?: string; // fallback if selectedFile is null
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function UniversalImageDropzone({
  label,
  hint,
  aspectRatioHint,
  selectedFile,
  onFileSelect,
  value,
  onChange,
  folder = "uploads",
  currentUrl,
  onClear,
  disabled = false,
  className = "",
}: UniversalImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  // Sync local object URL for preview when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setLocalPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreview(null);
    }
  }, [selectedFile]);

  // Active preview priority: local selected file > direct value > currentUrl
  const preview = localPreview || value || currentUrl;

  // Window-level dragover prevention: safely allows drops across the window
  // and prevents Chrome from opening dropped files in new tabs if dropped outside
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      if (
        dropzoneRef.current &&
        !dropzoneRef.current.contains(e.target as Node)
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);
    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  // Process a newly acquired File (from disk, web, or clipboard)
  const handleIncomingFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|avif|svg)$/i.test(file.name)) {
        toast.error("Please provide a valid image file (PNG, JPG, WebP)");
        return;
      }

      // Deferred Mode: pass File to parent for later upload
      if (onFileSelect) {
        onFileSelect(file);
        return;
      }

      // Immediate Mode: compress and upload directly to Cloudinary
      if (onChange) {
        setUploading(true);
        const toastId = toast.loading("Compressing & uploading image…");
        try {
          const compressed = await compressImage(file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.85,
          });

          const fd = new FormData();
          fd.append("image", compressed.file);
          fd.append("folder", folder);

          const base = API_BASE_URL;
          const uploadUrl = base.endsWith("/api")
            ? `${base}/upload/image`
            : `${base}/api/upload/image`;

          const res = await axios.post(
            `${uploadUrl}?folder=${encodeURIComponent(folder)}`,
            fd,
            { withCredentials: true }
          );

          const url: string = res.data.url || res.data.secure_url;
          onChange(url);
          toast.success("Image uploaded successfully!", { id: toastId });
        } catch (err: any) {
          console.error("Upload error:", err);
          toast.error(err?.response?.data?.message || "Failed to upload image", {
            id: toastId,
          });
        } finally {
          setUploading(false);
        }
      }
    },
    [onFileSelect, onChange, folder]
  );

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || isProcessing || uploading) return;

    setIsProcessing(true);
    try {
      const files = await parseDroppedOrPastedFiles(e.dataTransfer, {
        accept: "image/*",
        maxFiles: 1,
      });

      if (files.length > 0) {
        await handleIncomingFile(files[0]);
      } else {
        toast.error("No valid image recognized from dropped item");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (disabled || isProcessing || uploading) return;

    setIsProcessing(true);
    try {
      const files = await parseDroppedOrPastedFiles(e.clipboardData, {
        accept: "image/*",
        maxFiles: 1,
      });

      if (files.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        toast.success("Image pasted from clipboard!");
        await handleIncomingFile(files[0]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isProcessing || uploading) return;

    setIsProcessing(true);
    try {
      const files = await readClipboardMedia({ accept: "image/*" });
      if (files.length > 0) {
        toast.success("Image captured from clipboard!");
        await handleIncomingFile(files[0]);
      } else {
        toast.error(
          "No image or image URL found in clipboard. Press Ctrl+V to paste."
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleIncomingFile(file);
    }
    e.target.value = "";
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange("");
    }
    setLocalPreview(null);
  };

  const isBusy = isProcessing || uploading;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || aspectRatioHint) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </label>
          )}
          {aspectRatioHint && (
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              {aspectRatioHint}
            </span>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        disabled={disabled || isBusy}
        className="hidden"
      />

      <div
        ref={dropzoneRef}
        tabIndex={0}
        onClick={() => !disabled && !isBusy && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onPaste={handlePaste}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dragCounter.current++;
          if (!disabled) setIsDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "copy";
          }
          if (!disabled && !isDragOver) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dragCounter.current--;
          if (dragCounter.current <= 0) {
            setIsDragOver(false);
            dragCounter.current = 0;
          }
        }}
        onDrop={(e) => {
          dragCounter.current = 0;
          handleDrop(e);
        }}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer select-none p-4 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isDragOver
            ? "border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/60 ring-4 ring-indigo-500/30 scale-[1.006]"
            : preview
            ? "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs"
            : "border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isBusy ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-2 pointer-events-none">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {uploading ? "Compressing & uploading image…" : "Capturing image from web…"}
            </p>
            <p className="text-xs text-slate-400">Please hold on a moment</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative w-full sm:w-44 h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Image Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-1 pointer-events-none">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {selectedFile ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <Sparkles size={12} /> Ready to compress &amp; upload on save
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    <CheckCircle2 size={12} className="text-indigo-500" /> Saved Cloud Image
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                {selectedFile ? selectedFile.name : preview}
              </p>
              {selectedFile && (
                <p className="text-[11px] text-slate-400">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Auto-optimizing
                </p>
              )}
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                Click, drag new image, or paste (Ctrl+V) to replace
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition shrink-0 z-10 pointer-events-auto"
              title="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-4 space-y-2 pointer-events-none">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                isDragOver
                  ? "bg-indigo-600 text-white scale-110"
                  : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              <Upload size={22} className={isDragOver ? "animate-bounce" : ""} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {isDragOver
                  ? "Drop image right here!"
                  : "Drag & drop image here, or click to browse"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Drop from computer or web (Facebook, etc.) &bull; Or paste with Ctrl+V
              </p>
            </div>
            <div className="pt-1 pointer-events-auto">
              <button
                type="button"
                onClick={handlePasteClick}
                disabled={disabled || isBusy}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 transition shadow-2xs"
              >
                <ClipboardPaste size={13} />
                <span>Paste from clipboard (Ctrl+V)</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
