"use client";
/**
 * MultiFileUpload — central multi-file upload zone that uploads multiple files
 * to Cloudinary via POST /api/upload/image and returns each result.
 * Supports:
 *  - Native file select & drag-and-drop
 *  - Drag-and-drop from web (Facebook, Google, external sites)
 *  - Clipboard paste (Ctrl+V) for images, screenshots, and image URLs
 *  - One-click "Paste from clipboard" button
 *  - Auto client-side compression for all images before uploading
 *
 * Props:
 *   onUploaded(items)  — called after ALL selected files finish uploading
 *   folder             — Cloudinary folder (default: "uploads")
 *   accept             — file accept string (default: "image/*,video/*")
 *   maxFiles           — max files per selection (default: 20)
 *   disabled
 */
import React, { useCallback, useRef, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ClipboardPaste,
} from "lucide-react";
import { compressImage } from "@/lib/imageCompressor";
import {
  parseDroppedOrPastedFiles,
  readClipboardMedia,
  isDragTransferValid,
} from "@/lib/utils/mediaDropzone";
import toast from "react-hot-toast";

export interface UploadedFile {
  url: string;
  public_id: string;
  mediaType: "image" | "video";
  originalName: string;
}

interface FileState {
  id: string;
  file: File;
  status: "pending" | "compressing" | "uploading" | "done" | "error";
  url?: string;
  public_id?: string;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
}

interface Props {
  onUploaded: (items: UploadedFile[]) => void;
  folder?: string;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
}

export default function MultiFileUpload({
  onUploaded,
  folder = "uploads",
  accept = "image/*,video/*",
  maxFiles = 20,
  disabled = false,
}: Props) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFetchingWeb, setIsFetchingWeb] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Safe window-level dragover prevention
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      if (isDragTransferValid(e.dataTransfer)) {
        e.preventDefault();
      }
    };

    const handleWindowDrop = (e: DragEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        isDragTransferValid(e.dataTransfer)
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

  const uploadOne = useCallback(
    async (fs: FileState): Promise<FileState> => {
      let fileToUpload = fs.file;
      const originalSize = fs.file.size;
      let compressedSize = fs.file.size;

      // Automatically compress images client-side before Cloudinary upload
      if (fs.file.type.startsWith("image/")) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fs.id ? { ...f, status: "compressing" } : f
          )
        );
        try {
          const compressed = await compressImage(fs.file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.85,
          });
          fileToUpload = compressed.file;
          compressedSize = compressed.compressedSize;
        } catch (err) {
          console.warn(
            "Client-side image compression failed, uploading original:",
            err
          );
        }
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fs.id
            ? { ...f, status: "uploading", originalSize, compressedSize }
            : f
        )
      );

      try {
        const fd = new FormData();
        fd.append("image", fileToUpload);
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
        const public_id: string = res.data.public_id || "";
        const updated: FileState = {
          ...fs,
          status: "done",
          url,
          public_id,
          originalSize,
          compressedSize,
        };
        setFiles((prev) => prev.map((f) => (f.id === fs.id ? updated : f)));
        return updated;
      } catch (err: any) {
        const updated: FileState = {
          ...fs,
          status: "error",
          error: err?.response?.data?.message || "Upload failed",
        };
        setFiles((prev) => prev.map((f) => (f.id === fs.id ? updated : f)));
        return updated;
      }
    },
    [folder]
  );

  const processFiles = useCallback(
    async (rawFiles: File[]) => {
      const limited = rawFiles.slice(0, maxFiles);
      const newStates: FileState[] = limited.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: "pending",
      }));
      setFiles((prev) => [...prev, ...newStates]);

      // Upload all concurrently
      const results = await Promise.all(newStates.map(uploadOne));
      const succeeded = results.filter((r) => r.status === "done") as (FileState & {
        url: string;
        public_id: string;
      })[];

      if (succeeded.length > 0) {
        onUploaded(
          succeeded.map((r) => ({
            url: r.url,
            public_id: r.public_id,
            mediaType: r.file.type.startsWith("video/") ? "video" : "image",
            originalName: r.file.name,
          }))
        );
      }
    },
    [maxFiles, uploadOne, onUploaded]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length) processFiles(picked);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    setIsFetchingWeb(true);
    try {
      const parsed = await parseDroppedOrPastedFiles(e.dataTransfer, {
        accept,
        maxFiles,
      });
      if (parsed.length > 0) {
        processFiles(parsed);
      } else {
        toast.error("No valid file recognized in dropped item");
      }
    } finally {
      setIsFetchingWeb(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (disabled) return;

    setIsFetchingWeb(true);
    try {
      const parsed = await parseDroppedOrPastedFiles(e.clipboardData, {
        accept,
        maxFiles,
      });
      if (parsed.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        toast.success(
          `${parsed.length} file${parsed.length > 1 ? "s" : ""} pasted!`
        );
        processFiles(parsed);
      }
    } finally {
      setIsFetchingWeb(false);
    }
  };

  const handlePasteButtonClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    setIsFetchingWeb(true);
    try {
      const parsed = await readClipboardMedia({ accept });
      if (parsed.length > 0) {
        toast.success("Media captured from clipboard!");
        processFiles(parsed);
      } else {
        toast.error(
          "No image or video found in clipboard. Press Ctrl+V to paste."
        );
      }
    } finally {
      setIsFetchingWeb(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => setFiles([]);

  const compressing = files.some((f) => f.status === "compressing");
  const uploading = files.some((f) => f.status === "uploading");
  const isBusy = compressing || uploading || isFetchingWeb;
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        ref={containerRef}
        tabIndex={0}
        onClick={() => !disabled && !isBusy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onPaste={handlePaste}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
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
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-7 cursor-pointer transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          isDragOver
            ? "border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/50 ring-4 ring-indigo-500/20 scale-[1.006]"
            : "border-slate-300 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/40 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <div className="pointer-events-none flex flex-col items-center gap-2">
          {isFetchingWeb ? (
            <Loader2 size={30} className="text-indigo-600 animate-spin" />
          ) : compressing ? (
            <div className="relative">
              <Loader2 size={30} className="text-amber-500 animate-spin" />
              <Sparkles
                size={14}
                className="absolute -top-1 -right-1 text-amber-500"
              />
            </div>
          ) : uploading ? (
            <Loader2 size={30} className="text-indigo-500 animate-spin" />
          ) : (
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform ${
                isDragOver
                  ? "bg-indigo-600 text-white scale-110"
                  : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              <Upload
                size={22}
                className={isDragOver ? "animate-bounce" : ""}
              />
            </div>
          )}

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {isFetchingWeb
                ? "Capturing image from web…"
                : compressing
                ? "Compressing & optimizing image…"
                : uploading
                ? "Uploading to Cloudinary…"
                : isDragOver
                ? "Drop file right here!"
                : "Drag & drop files here, or click to browse"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Drop local files or drag from Facebook/web &bull; Auto-compressed to WebP
            </p>
          </div>
        </div>

        {/* Quick Paste Button */}
        <div className="pointer-events-auto pt-1">
          <button
            type="button"
            onClick={handlePasteButtonClick}
            disabled={disabled || isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 transition shadow-2xs disabled:opacity-50"
          >
            <ClipboardPaste size={13} />
            <span>Paste from clipboard (Ctrl+V)</span>
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleInput}
          disabled={disabled || isBusy}
        />
      </div>

      {/* File progress list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {doneCount} uploaded
              {errorCount > 0 ? `, ${errorCount} failed` : ""}
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-500 transition"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {f.status === "compressing" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-500 font-semibold">
                      <Loader2 size={13} className="animate-spin" /> Compressing
                    </span>
                  )}
                  {f.status === "uploading" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-500 font-semibold">
                      <Loader2 size={13} className="animate-spin" /> Uploading
                    </span>
                  )}
                  {f.status === "done" && (
                    <CheckCircle size={14} className="text-green-500" />
                  )}
                  {f.status === "error" && (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                  {f.status === "pending" && (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                  )}
                </div>

                {/* Thumbnail for images */}
                {f.status === "done" &&
                  f.url &&
                  f.file.type.startsWith("image/") && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.url}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                {/* File name */}
                <p className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">
                  {f.file.name}
                </p>

                {/* Compression stats if image was compressed */}
                {f.status === "done" &&
                  f.originalSize &&
                  f.compressedSize &&
                  f.compressedSize < f.originalSize && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap flex-shrink-0">
                      {(f.originalSize / (1024 * 1024)).toFixed(1)}MB →{" "}
                      {(f.compressedSize / 1024).toFixed(0)}KB (-
                      {Math.round(
                        (1 - f.compressedSize / f.originalSize) * 100
                      )}
                      %)
                    </span>
                  )}

                {/* Error */}
                {f.error && (
                  <p className="text-xs text-red-500 flex-shrink-0">
                    {f.error}
                  </p>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-red-500 transition"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
