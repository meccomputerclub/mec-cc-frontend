"use client";
/**
 * MultiFileUpload — drag-drop / click / paste zone that uploads multiple files
 * to Cloudinary via POST /api/upload/image and returns each result.
 *
 * Props:
 *   onUploaded(items)  — called after ALL selected files finish uploading
 *   folder             — Cloudinary folder (default: "uploads")
 *   accept             — file accept string (default: "image/*,video/*")
 *   maxFiles           — max files per selection (default: 20)
 *   disabled
 */
import React, { useCallback, useRef, useState } from "react";
import axios from "axios";
import { Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export interface UploadedFile {
  url: string;
  public_id: string;
  mediaType: "image" | "video";
  originalName: string;
}

interface FileState {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
  public_id?: string;
  error?: string;
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
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadOne = useCallback(async (fs: FileState): Promise<FileState> => {
    setFiles((prev) => prev.map((f) => f.id === fs.id ? { ...f, status: "uploading" } : f));
    try {
      const fd = new FormData();
      fd.append("image", fs.file);
      fd.append("folder", folder);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
        fd,
        { withCredentials: true }
      );
      const url: string = res.data.url || res.data.secure_url;
      const public_id: string = res.data.public_id || "";
      const updated: FileState = { ...fs, status: "done", url, public_id };
      setFiles((prev) => prev.map((f) => f.id === fs.id ? updated : f));
      return updated;
    } catch {
      const updated: FileState = { ...fs, status: "error", error: "Upload failed" };
      setFiles((prev) => prev.map((f) => f.id === fs.id ? updated : f));
      return updated;
    }
  }, [folder]);

  const processFiles = useCallback(async (rawFiles: File[]) => {
    const limited = rawFiles.slice(0, maxFiles);
    const newStates: FileState[] = limited.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newStates]);

    // Upload all concurrently
    const results = await Promise.all(newStates.map(uploadOne));
    const succeeded = results.filter((r) => r.status === "done") as (FileState & { url: string; public_id: string })[];

    if (succeeded.length > 0) {
      onUploaded(succeeded.map((r) => ({
        url: r.url,
        public_id: r.public_id,
        mediaType: r.file.type.startsWith("video/") ? "video" : "image",
        originalName: r.file.name,
      })));
    }
  }, [maxFiles, uploadOne, onUploaded]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length) processFiles(picked);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) processFiles(dropped);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => setFiles([]);

  const uploading = files.some((f) => f.status === "uploading");
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={handleDrop}
        className={[
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all select-none",
          isDragOver
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {uploading ? (
          <Loader2 size={28} className="text-indigo-500 animate-spin" />
        ) : (
          <Upload size={28} className={isDragOver ? "text-indigo-500" : "text-slate-400"} />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {uploading ? "Uploading…" : isDragOver ? "Drop files here" : "Click or drag & drop files"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Images & videos · up to {maxFiles} files at once
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleInput}
          disabled={disabled}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {doneCount} uploaded{errorCount > 0 ? `, ${errorCount} failed` : ""}
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
              <div key={f.id} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {f.status === "uploading" && <Loader2 size={14} className="text-indigo-500 animate-spin" />}
                  {f.status === "done" && <CheckCircle size={14} className="text-green-500" />}
                  {f.status === "error" && <AlertCircle size={14} className="text-red-500" />}
                  {f.status === "pending" && <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />}
                </div>
                {/* Thumbnail for images */}
                {f.status === "done" && f.url && f.file.type.startsWith("image/") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                )}
                {/* File name */}
                <p className="flex-1 text-xs text-slate-700 dark:text-slate-300 truncate">{f.file.name}</p>
                {/* Error */}
                {f.error && <p className="text-xs text-red-500 flex-shrink-0">{f.error}</p>}
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
