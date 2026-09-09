"use client";

import React, { useMemo } from "react";
import { X, Award, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { interpolateCertificateHtml } from "@/lib/utils/templateInterpolation";
import { TemplateItem } from "./CertificateTemplateCard";

interface CertificateTemplatePreviewModalProps {
  template: TemplateItem | null;
  onClose: () => void;
}

export const CertificateTemplatePreviewModal: React.FC<CertificateTemplatePreviewModalProps> = ({
  template,
  onClose,
}) => {
  const sampleInterpolatedHtml = useMemo(() => {
    if (!template?.htmlContent) return "";
    return interpolateCertificateHtml(template.htmlContent, {
      recipient_name: "Nafis Fuad",
      student_id: "2021331501",
      department: "Computer Science & Engineering",
      batch: "Batch 08",
      session: "2020-21",
      event_title: "MEC National Hackathon 2026",
      certificate_title: template.titleText || "Certificate of Excellence",
      certificate_id: "MCC-2026-PREVIEW",
      issue_date: "September 6, 2026",
      position: "Champion (1st Place)",
      description: "For outstanding performance, innovation, and leadership in software engineering.",
    });
  }, [template]);

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface-elevated rounded-2xl border-2 border-border-brutalist shadow-[10px_10px_0px_var(--accent-primary)] flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-border-brutalist bg-surface-secondary flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold text-accent-primary uppercase tracking-wider block">
              Template Preview &bull; {template.type === "html" ? "Custom HTML Mode" : "Visual Preset"}
            </span>
            <h2 className="text-lg font-black text-text-primary">{template.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border-default hover:bg-surface-elevated text-text-secondary hover:text-text-primary transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Rendering Box */}
        <div className="p-6 overflow-y-auto flex items-center justify-center bg-surface-secondary/40">
          {template.type === "html" ? (
            <div className="w-full max-w-3xl rounded-xl overflow-hidden border-2 border-border-default shadow-lg bg-white">
              <iframe
                title={template.name}
                srcDoc={sampleInterpolatedHtml}
                sandbox="allow-same-origin"
                className="w-full aspect-[1.414/1] border-none"
              />
            </div>
          ) : (
            <div
              className="w-full max-w-3xl aspect-[1.414/1] bg-white text-slate-900 rounded-xl p-8 sm:p-12 text-center relative flex flex-col justify-between overflow-hidden shadow-lg"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                borderColor: template.primaryColor || "#0F766E",
                borderStyle: template.borderStyle === "classic-ornate" ? "double" : "solid",
                borderWidth:
                  template.borderStyle === "none"
                    ? "0px"
                    : template.borderStyle === "classic-ornate"
                    ? "8px"
                    : "4px",
                boxShadow:
                  template.borderStyle === "neo-brutalist"
                    ? `8px 8px 0px ${template.primaryColor || "#0F766E"}`
                    : undefined,
                backgroundImage: template.backgroundUrl ? `url(${template.backgroundUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Top Header */}
              <div>
                <div
                  className="flex items-center justify-center gap-2 mb-2"
                  style={{ color: template.primaryColor || "#0F766E" }}
                >
                  <Award size={28} />
                  <span className="font-mono text-xs font-black tracking-widest uppercase">
                    {template.headerSubtitle || "MYMENSINGH ENGINEERING COLLEGE COMPUTER CLUB"}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase mb-1">
                  {template.titleText || "Certificate of Excellence"}
                </h3>
                <span className="inline-block text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                  ★ Champion (1st Place)
                </span>
              </div>

              {/* Recipient Info */}
              <div className="my-4 py-4 border-t-2 border-b-2 border-dashed border-slate-300">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  {template.presentationText || "PROUDLY PRESENTED TO"}
                </span>
                <h4 className="text-2xl sm:text-3xl font-black" style={{ color: template.primaryColor || "#0F766E" }}>
                  Nafis Fuad
                </h4>
                <p className="text-xs sm:text-sm font-mono text-slate-600 mt-1">
                  Student ID: <strong className="text-slate-900">2021331501</strong> &bull; Dept. of CSE
                </p>
                <p className="text-xs sm:text-sm text-slate-600 italic mt-2 max-w-lg mx-auto">
                  &ldquo;For exemplary problem solving, teamwork, and software innovation.&rdquo;
                </p>
              </div>

              {/* Event Pill */}
              <div className="text-xs font-mono text-slate-600">
                Event: <strong className="text-slate-900">MEC National Hackathon 2026</strong>
              </div>

              {/* Signatures & Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-end justify-between font-mono text-xs">
                {template.signatories?.map((sig, i) => (
                  <div key={i} className="text-center">
                    <div className="w-28 sm:w-36 border-t-2 border-slate-900 mx-auto pt-1 font-bold text-slate-900 line-clamp-1">
                      {sig.name}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{sig.title}</div>
                  </div>
                ))}

                <div className="text-right text-[10px] text-slate-400">
                  <span className="block font-bold text-slate-900">ID: MCC-2026-PREVIEW</span>
                  <span>{template.footerNote || "Verified Authentic"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-surface-secondary border-t-2 border-border-brutalist flex items-center justify-between">
          <span className="text-xs text-text-secondary font-mono">
            Template ID: {template._id}
          </span>
          <Button size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
};
