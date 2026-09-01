"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Upload, X } from "lucide-react";
import { coverPresets, CoverPreset } from "@/data/coverPresets";

interface CoverPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoverUrl?: string;
  onSelectPreset: (preset: CoverPreset) => void;
  onUploadCustomClick: () => void;
  isApplying?: boolean;
  applyingPresetId?: string | null;
}

export function CoverPresetModal({
  isOpen,
  onClose,
  currentCoverUrl,
  onSelectPreset,
  onUploadCustomClick,
  applyingPresetId,
}: CoverPresetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease_forwards]" onClick={onClose}>
      <div
        className="w-full max-w-[680px] max-h-[90vh] overflow-y-auto bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[6px_6px_0px_0px_var(--accent-primary)] p-4 sm:p-6 relative animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">Select Brutalist CSE Cover</h2>
            <p className="font-body text-xs text-text-secondary mt-0.5">Choose a handcrafted cyber-themed banner or upload your custom design.</p>
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

        {/* Custom Upload Trigger */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 p-3 bg-surface-secondary border border-border-default rounded-md">
          <div>
            <span className="font-bold text-sm text-text-primary">Custom Photo Upload</span>
            <p className="m-0 text-[11px] text-text-secondary">
              Upload your own PNG, JPG, or WebP banner (Max 5MB).
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onClose();
              onUploadCustomClick();
            }}
          >
            <Upload size={13} style={{ marginRight: "4px" }} /> Upload from PC
          </Button>
        </div>

        {/* Preset List */}
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
          {coverPresets.map((preset) => {
            const isSelected = currentCoverUrl === preset.url;
            return (
              <div
                key={preset.id}
                className={`rounded-md overflow-hidden bg-surface-primary flex flex-col transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "border-[1.5px] border-accent-primary shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                    : "border border-border-brutalist dark:border-border-default shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)]"
                }`}
                onClick={() => onSelectPreset(preset)}
              >
                <div className="w-full h-[110px] relative overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-accent-primary text-black px-2 py-0.5 rounded-sm text-[10px] font-extrabold font-mono">
                      ✓ CURRENT
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:px-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-text-primary">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-accent-primary bg-surface-secondary px-1.5 py-0.5 rounded-sm font-mono font-bold">
                        {preset.category}
                      </span>
                    </div>
                    <p className="mt-0.5 mb-0 text-[11px] text-text-secondary">
                      {preset.description}
                    </p>
                  </div>
                  <div className="self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant={isSelected ? "outline" : "secondary"}
                      disabled={applyingPresetId === preset.id}
                    >
                      {applyingPresetId === preset.id
                        ? "Applying..."
                        : isSelected
                        ? "Active"
                        : "Use Cover"}
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
