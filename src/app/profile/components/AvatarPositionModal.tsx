"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Upload, Move, Check, RefreshCw, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/imageCompressor";
import { api, ApiError } from "@/lib/api";

interface AvatarPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  initialImageUrl?: string | null;
  initialPosition?: string;
  initialFile?: File | null;
  onSuccess: () => Promise<void>;
}

export function AvatarPositionModal({
  isOpen,
  onClose,
  userId,
  initialImageUrl,
  initialPosition = "50% 50%",
  initialFile = null,
  onSuccess,
}: AvatarPositionModalProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compressionStat, setCompressionStat] = useState<string | null>(null);

  // Parse initial X and Y
  const parsePos = useCallback((posStr?: string) => {
    if (!posStr) return { x: 50, y: 50 };
    const parts = posStr.split(" ");
    const x = parseFloat(parts[0]) || 50;
    const y = parseFloat(parts[1] || parts[0]) || 50;
    return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
  }, []);

  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [zoom, setZoom] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 50, posY: 50 });

  useEffect(() => {
    if (isOpen) {
      const { x, y } = parsePos(initialPosition);
      setPosX(x);
      setPosY(y);
      setZoom(100);
      setPhotoUrl(initialImageUrl || null);
      setSelectedFile(initialFile);
      setCompressionStat(null);
    }
  }, [isOpen, initialImageUrl, initialPosition, initialFile, parsePos]);

  // Handle local image processing with compressor
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    setCompressing(true);
    const toastId = toast.loading("Compressing image locally...", { id: "avatar-compress" });

    try {
      const result = await compressImage(file, {
        maxSizeMB: 1.0,
        maxWidthOrHeight: 1200,
      });

      setSelectedFile(result.file);
      setPhotoUrl(result.previewUrl);
      setPosX(50);
      setPosY(50);
      setZoom(100);

      const statMsg = result.savedPercentage > 0
        ? `Compressed: ${(result.originalSize / 1024).toFixed(0)} KB → ${(result.compressedSize / 1024).toFixed(0)} KB (-${result.savedPercentage}%)`
        : `Ready: ${(result.compressedSize / 1024).toFixed(0)} KB`;
      setCompressionStat(statMsg);

      toast.success(statMsg, { id: toastId });
    } catch (err: any) {
      console.error("Compression error:", err);
      // Fallback
      setSelectedFile(file);
      setPhotoUrl(URL.createObjectURL(file));
      toast.success("Image loaded", { id: toastId });
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag to reposition inside the preview circle
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoUrl) return;
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX,
      posY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !previewBoxRef.current) return;
      const rect = previewBoxRef.current.getBoundingClientRect();
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;

      // Invert delta: dragging right moves focal point left
      const nextX = Math.min(100, Math.max(0, dragStartRef.current.posX - (dx / rect.width) * 100));
      const nextY = Math.min(100, Math.max(0, dragStartRef.current.posY - (dy / rect.height) * 100));

      setPosX(Math.round(nextX));
      setPosY(Math.round(nextY));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleSave = async () => {
    if (!photoUrl && !selectedFile) {
      toast.error("Please select a photo first.");
      return;
    }

    setSaving(true);
    const posString = `${posX}% ${posY}%`;

    try {
      if (selectedFile) {
        // Upload new photo with imagePosition
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("imagePosition", posString);

        const targetId = userId || "";
        await api.upload(`/api/users/update/image/${targetId}`, formData, {
          method: "PATCH",
        });
      } else {
        // Only repositioning existing photo
        await api.patch("/api/users/update/profile", {
          imagePosition: posString,
        });
      }

      toast.success("Profile photo positioned and saved successfully!");
      await onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to save profile photo";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease_forwards]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[6px_6px_0px_0px_var(--accent-primary)] p-5 sm:p-6 relative animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b-[1.5px] border-border-default">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">
              Position Profile Photo
            </h2>
            <p className="font-body text-xs text-text-secondary mt-0.5">
              Drag to reposition or use controls to fit your portrait perfectly.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 bg-surface-secondary border border-border-default rounded-sm text-text-primary cursor-pointer font-extrabold transition-all duration-150 hover:bg-accent-primary-light hover:rotate-90 shrink-0"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Compression notice */}
        {compressionStat && (
          <div className="mb-3 px-3 py-1.5 bg-accent-primary/10 border border-accent-primary/30 rounded text-xs font-mono font-bold text-accent-primary flex items-center justify-between">
            <span>{compressionStat}</span>
            <span className="text-[10px] uppercase tracking-wider bg-accent-primary text-accent-primary-text px-1.5 py-0.5 rounded">
              Optimized
            </span>
          </div>
        )}

        {/* Interactive Preview Canvas */}
        <div className="flex flex-col items-center justify-center my-3">
          <div
            ref={previewBoxRef}
            onMouseDown={handleMouseDown}
            style={{ cursor: photoUrl ? "grab" : "default" }}
            className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl border-2 border-text-primary dark:border-border-default shadow-[4px_4px_0px_0px_var(--accent-primary)] overflow-hidden relative select-none bg-surface-secondary flex items-center justify-center group"
          >
            {photoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Avatar preview"
                  draggable={false}
                  className="pointer-events-none transition-transform duration-75"
                  style={{
                    width: `${zoom}%`,
                    height: `${zoom}%`,
                    objectFit: "cover",
                    objectPosition: `${posX}% ${posY}%`,
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />

                {/* Circular mask overlay for guide */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/60 pointer-events-none" />

                {/* Drag hint tooltip badge */}
                <div className="absolute bottom-2.5 px-2.5 py-1 bg-black/75 backdrop-blur-sm text-white text-[11px] font-mono font-bold rounded-full pointer-events-none flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                  <Move size={12} />
                  <span>Drag to reposition</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                <Upload size={32} />
                <span className="text-xs font-bold">No photo selected</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-text-tertiary font-mono mt-2">
            Position: {posX}% X, {posY}% Y • Zoom: {zoom}%
          </span>
        </div>

        {/* Sliders and adjustment controls */}
        {photoUrl && (
          <div className="space-y-2.5 mt-2 bg-surface-secondary/70 p-3 rounded-lg border border-border-default">
            {/* Vertical slider */}
            <div className="grid grid-cols-[70px_1fr_45px] items-center gap-2">
              <label className="text-xs font-bold text-text-secondary">Vertical</label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full h-1.5 bg-border-default rounded appearance-none cursor-pointer accent-accent-primary"
                />
              </div>
              <span className="text-xs font-mono font-bold text-text-primary text-right">{posY}%</span>
            </div>

            {/* Horizontal slider */}
            <div className="grid grid-cols-[70px_1fr_45px] items-center gap-2">
              <label className="text-xs font-bold text-text-secondary">Horizontal</label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full h-1.5 bg-border-default rounded appearance-none cursor-pointer accent-accent-primary"
                />
              </div>
              <span className="text-xs font-mono font-bold text-text-primary text-right">{posX}%</span>
            </div>

            {/* Zoom slider */}
            <div className="grid grid-cols-[70px_1fr_45px] items-center gap-2">
              <label className="text-xs font-bold text-text-secondary flex items-center gap-1">
                <ZoomIn size={12} /> Zoom
              </label>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={100}
                  max={200}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-border-default rounded appearance-none cursor-pointer accent-accent-primary"
                />
              </div>
              <span className="text-xs font-mono font-bold text-text-primary text-right">{zoom}%</span>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border-default/60">
              <button
                type="button"
                onClick={() => { setPosX(50); setPosY(50); setZoom(100); }}
                className="px-2.5 py-1 text-[11px] font-bold bg-surface-primary border border-border-default rounded hover:border-accent-primary hover:text-accent-primary transition-colors"
              >
                Reset Center
              </button>
              <button
                type="button"
                onClick={() => { setPosY(15); }}
                className="px-2.5 py-1 text-[11px] font-bold bg-surface-primary border border-border-default rounded hover:border-accent-primary hover:text-accent-primary transition-colors"
              >
                Focus Face (Top)
              </button>
              <button
                type="button"
                onClick={() => { setPosY(80); }}
                className="px-2.5 py-1 text-[11px] font-bold bg-surface-primary border border-border-default rounded hover:border-accent-primary hover:text-accent-primary transition-colors"
              >
                Bottom
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-border-default">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={compressing || saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-text-primary bg-surface-secondary border border-border-default rounded-md hover:bg-accent-primary-light transition-colors"
          >
            <Upload size={14} />
            <span>{photoUrl ? "Choose Different Photo" : "Upload Photo"}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || compressing || !photoUrl}
            >
              {saving ? "Saving Photo..." : "Save Photo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
