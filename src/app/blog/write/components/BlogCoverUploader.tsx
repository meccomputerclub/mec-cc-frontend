"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Move,
  Check,
  X,
  RefreshCw,
  Link as LinkIcon,
  ImageIcon,
  Sliders,
} from "lucide-react";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/imageCompressor";

interface BlogCoverUploaderProps {
  value: string;
  position: string;
  onImageSelected: (previewUrl: string, file: File | null) => void;
  onPositionChange: (position: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export default function BlogCoverUploader({
  value,
  position = "50% 50%",
  onImageSelected,
  onPositionChange,
  onRemove,
  disabled = false,
}: BlogCoverUploaderProps) {
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [tempPosition, setTempPosition] = useState(position || "50% 50%");
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartPosPercent = useRef<number>(50);

  // Sync position externally
  useEffect(() => {
    if (!isRepositioning) {
      setTempPosition(position || "50% 50%");
    }
  }, [position, isRepositioning]);

  // Extract Y percentage number (0-100) from position string like "50% 25%"
  const getPosY = useCallback((posStr: string): number => {
    const parts = posStr.split(" ");
    const yPart = parts[1] || parts[0] || "50%";
    const parsed = parseFloat(yPart);
    return isNaN(parsed) ? 50 : Math.min(100, Math.max(0, parsed));
  }, []);

  const handleFileProcess = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPEG, PNG, WEBP)");
        return;
      }

      setCompressing(true);
      const toastId = toast.loading("Compressing image locally...", {
        id: "cover-compress",
      });

      try {
        const result = await compressImage(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 2048,
        });

        onImageSelected(result.previewUrl, result.file);

        if (result.savedPercentage > 0) {
          toast.success(
            `Image ready! Compressed by ${result.savedPercentage}% (${(
              result.compressedSize / 1024
            ).toFixed(0)} KB)`,
            { id: toastId }
          );
        } else {
          toast.success("Image selected for upload!", { id: toastId });
        }
      } catch (err: any) {
        toast.error("Failed to process image", { id: toastId });
      } finally {
        setCompressing(false);
      }
    },
    [onImageSelected]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    e.target.value = "";
  };

  // Drag & drop into dropzone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || compressing) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Paste from clipboard
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (disabled || compressing) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleFileProcess(file);
            break;
          }
        }
      }
    },
    [disabled, compressing, handleFileProcess]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onPaste = (e: Event) => handlePaste(e as ClipboardEvent);
    container.addEventListener("paste", onPaste);
    return () => container.removeEventListener("paste", onPaste);
  }, [handlePaste]);

  // Facebook-style interactive reposition dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioning) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartPosPercent.current = getPosY(tempPosition);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      e.preventDefault();
      const containerHeight = containerRef.current.clientHeight || 340;
      const deltaY = e.clientY - dragStartY.current;

      // Inverted delta: dragging down shows top (lower Y%), dragging up shows bottom (higher Y%)
      const percentDelta = (deltaY / containerHeight) * 100;
      const newY = Math.min(
        100,
        Math.max(0, dragStartPosPercent.current - percentDelta)
      );

      setTempPosition(`50% ${newY.toFixed(1)}%`);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch repositioning support for mobile / tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isRepositioning) return;
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
    dragStartPosPercent.current = getPosY(tempPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight || 340;
    const deltaY = e.touches[0].clientY - dragStartY.current;
    const percentDelta = (deltaY / containerHeight) * 100;
    const newY = Math.min(
      100,
      Math.max(0, dragStartPosPercent.current - percentDelta)
    );
    setTempPosition(`50% ${newY.toFixed(1)}%`);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const saveReposition = () => {
    setIsRepositioning(false);
    onPositionChange(tempPosition);
    toast.success("Cover position updated!");
  };

  const cancelReposition = () => {
    setIsRepositioning(false);
    setTempPosition(position || "50% 50%");
  };

  const commitUrl = () => {
    if (!urlDraft.trim()) return;
    onImageSelected(urlDraft.trim(), null);
    setShowUrlInput(false);
    setUrlDraft("");
  };

  const currentY = getPosY(tempPosition);

  return (
    <div className="w-full">
      {/* Container: Matches exact shape of blog detail page */}
      <div
        ref={containerRef}
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
        className={`w-full h-[220px] sm:h-[340px] md:h-[400px] relative rounded-2xl overflow-hidden border-2 transition-all outline-none ${
          isRepositioning
            ? "border-accent-primary ring-4 ring-accent-primary/20 shadow-[6px_6px_0px_0px_var(--accent-primary)]"
            : "border-border-default shadow-[4px_4px_0px_0px_var(--accent-primary)]"
        } ${isDragOver ? "border-accent-primary bg-accent-primary-light/30" : "bg-surface-secondary"}`}
      >
        {compressing ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-surface-secondary">
            <div className="w-10 h-10 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-text-primary">
              Compressing image locally...
            </p>
            <p className="text-xs text-text-tertiary">
              Optimizing dimensions & quality before upload
            </p>
          </div>
        ) : value ? (
          /* Preview state with full aspect ratio */
          <div
            className={`relative w-full h-full select-none ${
              isRepositioning
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : ""
            }`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={value}
              alt="Cover photo preview"
              fill
              className="object-cover pointer-events-none transition-[object-position] duration-75"
              style={{ objectPosition: tempPosition }}
              priority
              unoptimized
            />

            {/* Repositioning Overlay Guides */}
            {isRepositioning && (
              <div className="absolute inset-0 bg-black/30 pointer-events-none flex flex-col justify-between p-4">
                <div className="self-center px-4 py-2 bg-surface-primary/95 border border-text-primary rounded-xl shadow-[3px_3px_0px_0px_var(--text-primary)] dark:shadow-[3px_3px_0px_0px_var(--accent-primary)]">
                  <p className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-2">
                    <Move size={14} className="text-accent-primary animate-pulse" />
                    Drag image vertically to reposition ({currentY.toFixed(0)}%)
                  </p>
                </div>

                {/* Subtle horizontal alignment guide lines */}
                <div className="w-full flex flex-col gap-12 opacity-30">
                  <div className="w-full border-t border-dashed border-white" />
                  <div className="w-full border-t border-dashed border-white" />
                </div>

                <div className="self-center text-center text-xs text-white/90 font-mono drop-shadow">
                  Release to preview position
                </div>
              </div>
            )}

            {/* Top right action bar */}
            {!isRepositioning ? (
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => setIsRepositioning(true)}
                  className="px-3 py-1.5 bg-surface-primary/95 hover:bg-surface-primary text-text-primary border border-border-default rounded-lg text-xs font-bold shadow-[2px_2px_0px_0px_var(--text-primary)] dark:shadow-[2px_2px_0px_0px_var(--accent-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
                  title="Reposition cover photo (like Facebook)"
                >
                  <Move size={13} />
                  Reposition
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-surface-primary/95 hover:bg-surface-primary text-text-primary border border-border-default rounded-lg text-xs font-bold shadow-[2px_2px_0px_0px_var(--text-primary)] dark:shadow-[2px_2px_0px_0px_var(--accent-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
                  title="Change image"
                >
                  <RefreshCw size={13} />
                  Change
                </button>
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white border border-red-700 rounded-lg text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] transition cursor-pointer"
                  title="Remove image"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              /* Reposition Save/Cancel buttons */
              <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                <button
                  type="button"
                  onClick={saveReposition}
                  className="px-4 py-1.5 bg-accent-primary text-accent-primary-text border border-text-primary rounded-lg text-xs font-bold shadow-[2px_2px_0px_0px_var(--text-primary)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  Save Position
                </button>
                <button
                  type="button"
                  onClick={cancelReposition}
                  className="px-3 py-1.5 bg-surface-primary text-text-primary border border-border-default rounded-lg text-xs font-bold shadow-[2px_2px_0px_0px_var(--text-primary)] transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Bottom Status pill showing deferred upload indicator */}
            {!isRepositioning && (
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-surface-primary/90 backdrop-blur-md rounded-full border border-border-default text-[0.7rem] font-mono font-medium text-text-secondary">
                Exact Detail-Page Preview · Uploads on Publish
              </div>
            )}
          </div>
        ) : (
          /* Empty Dropzone State */
          <div
            onClick={() => !disabled && fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer transition"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-primary border-2 border-border-default shadow-[3px_3px_0px_0px_var(--accent-primary)] flex items-center justify-center mb-3">
              <ImageIcon size={26} className="text-accent-primary" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">
              {isDragOver ? "Drop cover photo here" : "Upload Blog Cover Photo"}
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mb-3">
              Click to browse, drag & drop, or paste from clipboard. Shown in exact
              detail page proportions.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-primary-light/40 border border-accent-primary/30 text-[0.7rem] font-mono font-bold text-text-primary">
              <Upload size={12} /> Recommended 1200×630px · Auto-compressed locally
            </div>
          </div>
        )}
      </div>

      {/* Position Fine-Tuning Slider (visible when repositioning) */}
      {value && isRepositioning && (
        <div className="mt-3 p-3 bg-surface-secondary rounded-xl border border-border-default flex items-center gap-3">
          <Sliders size={16} className="text-accent-primary flex-shrink-0" />
          <span className="text-xs font-bold text-text-secondary whitespace-nowrap">
            Vertical Focus:
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={currentY}
            onChange={(e) => setTempPosition(`50% ${e.target.value}%`)}
            className="w-full accent-accent-primary cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-text-primary w-12 text-right">
            {currentY.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Manual URL input option if empty */}
      {!value && (
        <div className="mt-2 flex items-center justify-between">
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-xs font-bold text-text-tertiary hover:text-accent-primary transition flex items-center gap-1"
            >
              <LinkIcon size={12} /> Or enter image URL manually
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full mt-1">
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitUrl();
                  }
                  if (e.key === "Escape") setShowUrlInput(false);
                }}
                placeholder="https://example.com/cover.jpg"
                className="flex-1 px-3 py-1.5 text-xs bg-surface-elevated border border-border-default rounded-lg text-text-primary outline-none focus:border-accent-primary"
              />
              <button
                type="button"
                onClick={commitUrl}
                className="px-3 py-1.5 text-xs bg-accent-primary text-accent-primary-text font-bold rounded-lg"
              >
                Use
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-2 py-1.5 text-xs text-text-tertiary hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
