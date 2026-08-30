"use client";

import React from "react";
import {
  Trash2,
  GripVertical,
  Type,
  Hash,
  Mail,
  AlignLeft,
  List,
  CheckSquare,
  CircleDot,
  UploadCloud,
  FileCheck,
  Asterisk,
} from "lucide-react";
import { FormField, FieldType } from "@/lib/types/form";
import OptionEditor from "./OptionEditor";
import { Select } from "@/components/ui/Select";

interface Props {
  field: FormField;
  index: number;
  onChange: (field: FormField) => void;
  onRemove: () => void;
}

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Paragraph" },
  { value: "email", label: "Email Address" },
  { value: "number", label: "Number Input" },
  { value: "select", label: "Dropdown Select" },
  { value: "radio", label: "Radio Buttons (Single Choice)" },
  { value: "checkbox", label: "Checkboxes (Multiple Choice)" },
  { value: "file", label: "File Upload (PDF, Image, Archive)" },
];

const FILE_ACCEPT_PRESETS = [
  { value: "image/*", label: "Images only (PNG, JPG, SVG)" },
  { value: ".pdf,.doc,.docx", label: "Documents (PDF, Word DOCX)" },
  { value: "image/*,.pdf", label: "Images & PDF Documents" },
  { value: ".zip,.rar,.tar.gz,.7z", label: "Compressed Archives (ZIP, RAR)" },
  { value: "*/*", label: "Any File Format" },
];

export default function FieldEditor({ field, index, onChange, onRemove }: Props) {
  const update = (key: keyof FormField, value: unknown) => {
    const updated = { ...field, [key]: value } as FormField;
    // Auto-populate default options when switching to a choice type if empty
    if (["select", "radio", "checkbox"].includes(updated.type) && (!updated.options || updated.options.length === 0)) {
      updated.options = [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ];
    }
    onChange(updated);
  };

  const needsOptions = ["select", "radio", "checkbox"].includes(field.type);
  const isFile = field.type === "file";

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case "text":
        return <Type className="w-4 h-4 text-blue-500" />;
      case "textarea":
        return <AlignLeft className="w-4 h-4 text-purple-500" />;
      case "email":
        return <Mail className="w-4 h-4 text-amber-500" />;
      case "number":
        return <Hash className="w-4 h-4 text-emerald-500" />;
      case "select":
        return <List className="w-4 h-4 text-indigo-500" />;
      case "radio":
        return <CircleDot className="w-4 h-4 text-teal-500" />;
      case "checkbox":
        return <CheckSquare className="w-4 h-4 text-cyan-500" />;
      case "file":
        return <UploadCloud className="w-4 h-4 text-rose-500" />;
      default:
        return <Type className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-surface-elevated rounded-xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] hover:border-accent-primary transition-all duration-200 overflow-hidden">
      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-secondary border-b border-border-default">
        <div className="flex items-center gap-2 text-text-secondary">
          <GripVertical size={16} className="text-text-tertiary cursor-grab" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
            {getFieldIcon(field.type)} Question #{index + 1}
          </span>
          {field.required && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              Required
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-text-tertiary hover:text-accent-error hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
          title="Delete this question"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* ── Question Label & Type Selector ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">
              Question Title / Label <span className="text-accent-error">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., What is your GitHub profile or MEC Student ID?"
              value={field.label}
              onChange={(e) => update("label", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary text-sm font-semibold focus:outline-none focus:border-accent-primary shadow-[2px_2px_0px_0px_var(--border-default)]"
            />
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">Input Field Type</label>
            <Select
              id={`field-type-${index}`}
              value={field.type}
              onChange={(val) => update("type", val as FieldType)}
              options={FIELD_TYPE_OPTIONS}
            />
          </div>
        </div>

        {/* ── Placeholder, Helper Text & Required Toggle ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-7 space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">
              Placeholder / Hint Text <span className="text-text-tertiary font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder={
                isFile
                  ? "e.g., Upload your payment screenshot or CV (PDF/PNG)"
                  : field.type === "email"
                    ? "e.g., yourname@mec.edu.bd"
                    : "e.g., Enter answer here..."
              }
              value={field.placeholder || ""}
              onChange={(e) => update("placeholder", e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-border-default bg-surface-primary text-text-primary text-xs font-medium focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-3 pt-4 md:pt-0">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-surface-secondary px-3 py-2 rounded-lg border border-border-default hover:bg-accent-primary-light transition">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => update("required", e.target.checked)}
                className="w-4 h-4 rounded border-border-default text-accent-primary focus:ring-accent-primary accent-accent-primary cursor-pointer"
              />
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
                <Asterisk className="w-3 h-3 text-accent-error" /> Mandatory Response
              </span>
            </label>
          </div>
        </div>

        {/* ── File Upload Configuration ── */}
        {isFile && (
          <div className="mt-3 p-4 rounded-xl bg-surface-secondary border border-border-default space-y-3">
            <div className="flex items-center gap-2 text-text-primary">
              <UploadCloud className="w-4 h-4 text-accent-primary" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">File Upload Specifications</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-text-secondary">Allowed File Formats</label>
                <Select
                  id={`file-accept-${index}`}
                  value={field.fileAccept || "image/*,.pdf"}
                  onChange={(val) => update("fileAccept", val)}
                  options={FILE_ACCEPT_PRESETS}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-text-secondary">Max File Size Limit</label>
                <Select
                  id={`file-maxsize-${index}`}
                  value={String(field.maxFileSizeMb || 10)}
                  onChange={(val) => update("maxFileSizeMb", parseInt(val) || 10)}
                  options={[
                    { value: "2", label: "2 MB Maximum" },
                    { value: "5", label: "5 MB Maximum" },
                    { value: "10", label: "10 MB Standard (Default)" },
                    { value: "25", label: "25 MB Large Files" },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Options Configuration for Choice Types ── */}
        {needsOptions && (
          <div className="mt-3 p-4 rounded-xl bg-surface-secondary border border-border-default">
            <OptionEditor
              options={field.options || []}
              fieldType={field.type}
              onChange={(opts) => update("options", opts)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
