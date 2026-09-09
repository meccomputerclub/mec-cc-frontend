"use client";

import React from "react";
import { Award, Code, CheckCircle, Star, Edit3, Trash2, Eye, Shield, Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TemplateItem {
  _id: string;
  name: string;
  description?: string;
  type: "visual" | "html";
  htmlContent?: string;
  theme: "classic-gold" | "tech-cyan" | "emerald-clean" | "crimson-bold" | "midnight-dark" | "custom-bg";
  backgroundUrl?: string;
  badgeIcon: "award" | "trophy" | "star" | "shield" | "medal" | "code";
  primaryColor: string;
  accentColor: string;
  borderStyle: "neo-brutalist" | "classic-ornate" | "modern-double" | "minimal-clean" | "none";
  headerSubtitle?: string;
  titleText?: string;
  presentationText?: string;
  signatories?: Array<{ name: string; title: string; signatureImageUrl?: string }>;
  footerNote?: string;
  isDefault: boolean;
  associatedEvent?: { _id: string; title: string };
  createdAt?: string;
}

interface CertificateTemplateCardProps {
  template: TemplateItem;
  onPreview: (template: TemplateItem) => void;
  onEdit: (template: TemplateItem) => void;
  onDelete: (template: TemplateItem) => void;
  onSetDefault: (template: TemplateItem) => void;
}

export const CertificateTemplateCard: React.FC<CertificateTemplateCardProps> = ({
  template,
  onPreview,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy size={16} />;
      case "star":
        return <Star size={16} />;
      case "shield":
        return <Shield size={16} />;
      case "medal":
        return <Medal size={16} />;
      case "code":
        return <Code size={16} />;
      default:
        return <Award size={16} />;
    }
  };

  return (
    <div
      className={`relative bg-surface-elevated rounded-xl border-2 transition-all flex flex-col justify-between overflow-hidden group ${
        template.isDefault
          ? "border-accent-primary shadow-[4px_4px_0px_var(--accent-primary)]"
          : "border-border-brutalist shadow-[4px_4px_0px_var(--border-brutalist)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--border-brutalist)]"
      }`}
    >
      {/* Top Banner / Color Accent */}
      <div
        className="h-2 w-full"
        style={{
          background:
            template.type === "html"
              ? "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)"
              : `linear-gradient(90deg, ${template.primaryColor || "#0D9488"} 0%, ${
                  template.accentColor || "#F59E0B"
                } 100%)`,
        }}
      />

      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider ${
                template.type === "html"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                  : "bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
              }`}
            >
              {template.type === "html" ? <Code size={12} /> : getBadgeIcon(template.badgeIcon)}
              {template.type === "html" ? "Custom HTML" : "Visual Preset"}
            </span>

            {template.isDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-mono font-bold">
                <Star size={11} className="fill-amber-500" /> Default
              </span>
            )}
          </div>

          {/* Theme badge for visual */}
          {template.type === "visual" && (
            <span className="text-[10px] font-mono font-semibold text-text-tertiary bg-surface-secondary px-2 py-0.5 rounded border border-border-default uppercase">
              {template.theme}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight line-clamp-1 mb-1.5">
          {template.name}
        </h3>

        <p className="text-xs text-text-secondary line-clamp-2 min-h-[32px] mb-4">
          {template.description || "Official certificate template layout for MEC Computer Club."}
        </p>

        {/* Mini Preview Box */}
        <div
          onClick={() => onPreview(template)}
          className="relative h-24 rounded-lg bg-surface-secondary border border-border-default p-2 flex flex-col justify-between items-center cursor-pointer overflow-hidden transition-all group-hover:border-accent-primary"
        >
          {template.type === "html" ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <Code size={20} className="text-blue-500 mb-1" />
              <span className="text-[11px] font-mono font-bold text-text-primary">HTML / CSS Canvas</span>
              <span className="text-[10px] text-text-tertiary">Click to inspect live preview</span>
            </div>
          ) : (
            <div
              className="w-full h-full rounded border p-2 flex flex-col justify-between items-center text-center"
              style={{
                borderColor: template.primaryColor || "#0D9488",
                borderStyle: template.borderStyle === "classic-ornate" ? "double" : "solid",
                borderWidth: template.borderStyle === "neo-brutalist" ? "2px" : "1px",
              }}
            >
              <div className="flex items-center gap-1">
                <span style={{ color: template.primaryColor }}>{getBadgeIcon(template.badgeIcon)}</span>
                <span className="text-[10px] font-bold text-text-primary line-clamp-1 uppercase">
                  {template.titleText || "Certificate of Excellence"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-accent-primary font-bold">
                Student Name Placeholder
              </span>
              <span className="text-[8px] text-text-tertiary font-mono">
                {template.signatories?.length || 2} Signatories &bull; {template.borderStyle}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-accent-primary/0 hover:bg-accent-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-surface-elevated/90 px-2 py-1 rounded text-[11px] font-bold text-text-primary flex items-center gap-1 shadow">
              <Eye size={12} /> Preview
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-5 py-3 bg-surface-secondary border-t border-border-default flex items-center justify-between gap-2">
        <div>
          {!template.isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(template)}
              className="text-[11px] font-bold text-text-secondary hover:text-accent-primary flex items-center gap-1 transition cursor-pointer bg-transparent border-none p-0"
            >
              <Star size={12} /> Set Default
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onPreview(template)} title="Preview Template">
            <Eye size={13} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onEdit(template)} title="Edit Template">
            <Edit3 size={13} />
          </Button>
          {!template.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(template)}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/30"
              title="Delete Template"
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
