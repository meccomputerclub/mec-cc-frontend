"use client";

import React, { useState } from "react";
import {
  X,
  Eye,
  Smartphone,
  Monitor,
  Calendar,
  Send,
  UploadCloud,
  Check,
  FileCheck2,
  Layers,
  Clock,
} from "lucide-react";
import { FormField } from "@/lib/types/form";
import { Select } from "@/components/ui/Select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formInfo: {
    title: string;
    description?: string;
    eventId?: string;
    coverImageUrl?: string;
    startDate?: string;
    endDate?: string;
  };
  fields: FormField[];
  eventName?: string;
}

export default function FormPreviewModal({
  isOpen,
  onClose,
  formInfo,
  fields,
  eventName,
}: Props) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [fileSimulations, setFileSimulations] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleInputChange = (fieldName: string, val: any) => {
    setPreviewData((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleCheckboxToggle = (fieldName: string, optionValue: string) => {
    setPreviewData((prev) => {
      const currentList: string[] = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      if (currentList.includes(optionValue)) {
        return { ...prev, [fieldName]: currentList.filter((item) => item !== optionValue) };
      } else {
        return { ...prev, [fieldName]: [...currentList, optionValue] };
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-primary border-2 border-border-default rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[8px_8px_0px_0px_var(--border-default)] overflow-hidden">
        {/* ── Modal Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-surface-secondary border-b border-border-default">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent-primary" />
            <h3 className="font-extrabold text-sm sm:text-base text-text-primary">
              Live Form Preview
            </h3>
            <span className="text-xs bg-accent-primary-light text-accent-primary font-semibold px-2 py-0.5 rounded-full border border-accent-primary/40 hidden sm:inline">
              Interactive Test Mode
            </span>
          </div>

          {/* Device Switcher & Close */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-surface-elevated p-1 rounded-lg border border-border-default">
              <button
                type="button"
                onClick={() => setDeviceView("desktop")}
                className={`p-1.5 rounded-md transition text-xs font-semibold flex items-center gap-1 ${deviceView === "desktop"
                    ? "bg-accent-primary text-accent-primary-text"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" /> <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView("mobile")}
                className={`p-1.5 rounded-md transition text-xs font-semibold flex items-center gap-1 ${deviceView === "mobile"
                    ? "bg-accent-primary text-accent-primary-text"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" /> <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-elevated rounded-lg border border-transparent hover:border-border-default transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Preview Canvas ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-surface-secondary/60 flex justify-center">
          <div
            className={`w-full transition-all duration-300 space-y-4 ${deviceView === "mobile" ? "max-w-sm" : "max-w-2xl"
              }`}
          >
            {/* ── Google Forms Style Primary Header Card ── */}
            <div className="bg-surface-elevated rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] overflow-hidden">
              {/* Cover Banner or Accent Top Bar (Spans 100% of card width) */}
              {formInfo.coverImageUrl ? (
                <div
                  className="w-full h-44 sm:h-56 bg-cover bg-center border-b border-border-default"
                  style={{ backgroundImage: `url(${formInfo.coverImageUrl})` }}
                />
              ) : (
                <div className="w-full h-3.5 bg-accent-primary border-b border-border-default" />
              )}

              {/* Form Title & Details */}
              <div className="p-6 sm:p-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent-primary bg-accent-primary-light px-2.5 py-0.5 rounded border border-accent-primary/30">
                    MEC Computer Club Official Form
                  </span>

                  {formInfo.endDate && (
                    <span className="text-[11px] font-medium text-text-tertiary flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Closes: {formInfo.endDate}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                  {formInfo.title || "Untitled Registration Form"}
                </h1>

                {formInfo.description ? (
                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line border-t border-border-default pt-3">
                    {formInfo.description}
                  </p>
                ) : (
                  <p className="text-text-tertiary text-xs italic border-t border-border-default pt-3">
                    Fill in your details below to register.
                  </p>
                )}

                {eventName && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-default mt-1">
                    <Calendar className="w-3.5 h-3.5 text-accent-primary" /> Associated Event: {eventName}
                  </div>
                )}
              </div>
            </div>

            {/* ── Question Cards (Each as standalone Google Forms style card) ── */}
            {fields.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-border-default rounded-2xl bg-surface-elevated shadow-[2px_2px_0px_0px_var(--border-default)]">
                <Layers className="w-8 h-8 mx-auto text-text-tertiary mb-2" />
                <p className="text-text-secondary text-sm font-semibold">
                  No questions configured in this form yet.
                </p>
              </div>
            ) : (
              fields.map((field, idx) => {
                const key = field.name || `field_${idx}`;
                const isFile = field.type === "file";
                const isRadio = field.type === "radio";
                const isCheckbox = field.type === "checkbox";
                const isSelect = field.type === "select";

                return (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-surface-elevated border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] space-y-3.5 transition hover:border-accent-primary"
                  >
                    <label className="block text-sm font-semibold text-text-primary">
                      {field.label || `Question #${idx + 1}`}{" "}
                      {field.required && <span className="text-accent-error">*</span>}
                    </label>

                    {/* Text / Email / Number */}
                    {["text", "email", "number"].includes(field.type) && (
                      <input
                        type={field.type}
                        placeholder={field.placeholder || "Your answer..."}
                        value={previewData[key] || ""}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary shadow-sm"
                      />
                    )}

                    {/* Textarea */}
                    {field.type === "textarea" && (
                      <textarea
                        rows={3}
                        placeholder={field.placeholder || "Write your response..."}
                        value={previewData[key] || ""}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary shadow-sm leading-relaxed"
                      />
                    )}

                    {/* Dropdown Select */}
                    {isSelect && (
                      <Select
                        id={`preview-select-${idx}`}
                        value={previewData[key] || ""}
                        onChange={(val) => handleInputChange(key, val)}
                        options={[
                          { value: "", label: "Choose an option..." },
                          ...(field.options || []).map((o) => ({
                            value: o.value,
                            label: o.label,
                          })),
                        ]}
                      />
                    )}

                    {/* Radio Choices */}
                    {isRadio && (
                      <div className="space-y-2 pt-1">
                        {(field.options || []).map((opt, oIdx) => {
                          const isSelected = previewData[key] === opt.value;
                          return (
                            <div
                              key={oIdx}
                              onClick={() => handleInputChange(key, opt.value)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${isSelected
                                  ? "bg-accent-primary-light border-accent-primary text-text-primary font-semibold shadow-sm"
                                  : "bg-surface-primary border-border-default text-text-secondary hover:border-accent-primary"
                                }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected
                                    ? "border-accent-primary bg-accent-primary"
                                    : "border-border-default"
                                  }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="text-xs sm:text-sm">{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Checkbox Choices */}
                    {isCheckbox && (
                      <div className="space-y-2 pt-1">
                        {(field.options || []).map((opt, oIdx) => {
                          const selectedArray: string[] = Array.isArray(previewData[key])
                            ? previewData[key]
                            : [];
                          const isChecked = selectedArray.includes(opt.value);

                          return (
                            <div
                              key={oIdx}
                              onClick={() => handleCheckboxToggle(key, opt.value)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${isChecked
                                  ? "bg-accent-primary-light border-accent-primary text-text-primary font-semibold shadow-sm"
                                  : "bg-surface-primary border-border-default text-text-secondary hover:border-accent-primary"
                                }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${isChecked
                                    ? "border-accent-primary bg-accent-primary text-white"
                                    : "border-border-default"
                                  }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs sm:text-sm">{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* File Upload Dropzone Simulation */}
                    {isFile && (
                      <div className="border-2 border-dashed border-border-default rounded-xl p-5 bg-surface-primary text-center space-y-2 hover:border-accent-primary transition group">
                        {fileSimulations[key] ? (
                          <div className="flex items-center justify-between bg-surface-secondary p-3 rounded-lg border border-border-default">
                            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                              <FileCheck2 className="w-4 h-4 text-accent-success" />
                              <span>{fileSimulations[key]}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setFileSimulations((prev) => {
                                  const next = { ...prev };
                                  delete next[key];
                                  return next;
                                })
                              }
                              className="text-xs font-semibold text-accent-error hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 mx-auto text-accent-primary group-hover:scale-110 transition" />
                            <div className="text-xs font-semibold text-text-primary">
                              Drag &amp; drop file or{" "}
                              <button
                                type="button"
                                onClick={() =>
                                  setFileSimulations((prev) => ({
                                    ...prev,
                                    [key]: `applicant_submission_sample.pdf (${field.maxFileSizeMb || 10} MB)`,
                                  }))
                                }
                                className="text-accent-primary hover:underline font-semibold"
                              >
                                browse
                              </button>
                            </div>
                            <p className="text-[11px] text-text-tertiary">
                              Formats: {field.fileAccept || "image/*,.pdf"} • Max:{" "}
                              {field.maxFileSizeMb || 10}MB
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* ── Submit Action Card ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] flex items-center justify-between">
              <span className="text-xs text-text-tertiary font-semibold">
                {fields.length} Question{fields.length === 1 ? "" : "s"}
              </span>

              <button
                type="button"
                onClick={() => alert("This is an interactive preview mode.")}
                className="bg-text-primary text-surface-primary py-2.5 px-6 rounded-xl font-semibold hover:bg-surface-inverse transition flex items-center gap-2 shadow-[3px_3px_0px_0px_var(--border-default)] text-sm"
              >
                <Send className="w-4 h-4" /> Submit Application
              </button>
            </div>
          </div>
        </div>

        {/* ── Modal Footer Bar ── */}
        <div className="px-5 py-3 bg-surface-secondary border-t border-border-default flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-border-default bg-surface-elevated text-text-primary hover:bg-surface-primary transition shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
