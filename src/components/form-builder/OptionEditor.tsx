"use client";

import React from "react";
import { Plus, Trash2, GripVertical, Check, Circle, CheckSquare, ListOrdered } from "lucide-react";
import { FieldOption, FieldType } from "@/lib/types/form";

interface Props {
  options: FieldOption[];
  fieldType?: FieldType;
  onChange: (options: FieldOption[]) => void;
}

export default function OptionEditor({ options, fieldType = "select", onChange }: Props) {
  const addOption = () => {
    const nextNum = options.length + 1;
    const defaultLabel = `Option ${nextNum}`;
    const defaultValue = `option_${nextNum}`;
    onChange([...options, { label: defaultLabel, value: defaultValue }]);
  };

  const update = (index: number, key: keyof FieldOption, value: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [key]: value };
    // If updating label and value was auto-derived, auto-update value
    if (key === "label" && (!updated[index].value || updated[index].value.startsWith("option_"))) {
      updated[index].value = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    }
    onChange(updated);
  };

  const remove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const getOptionIcon = () => {
    switch (fieldType) {
      case "radio":
        return <Circle className="w-4 h-4 text-accent-primary" />;
      case "checkbox":
        return <CheckSquare className="w-4 h-4 text-accent-primary" />;
      default:
        return <ListOrdered className="w-4 h-4 text-accent-primary" />;
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          {getOptionIcon()}
          {fieldType === "radio"
            ? "Radio Choices (Single selection)"
            : fieldType === "checkbox"
              ? "Checkbox Options (Multiple selections)"
              : "Dropdown Choices"}
        </span>
        <span className="text-[11px] font-semibold text-text-tertiary">
          {options.length} {options.length === 1 ? "Option" : "Options"} Defined
        </span>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-surface-primary p-2 rounded-lg border border-border-default shadow-[2px_2px_0px_0px_var(--border-default)] transition hover:border-accent-primary group"
          >
            <div className="text-text-tertiary flex items-center justify-center pl-1">
              {fieldType === "radio" ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-border-default group-hover:border-accent-primary" />
              ) : fieldType === "checkbox" ? (
                <div className="w-3.5 h-3.5 rounded-sm border-2 border-border-default group-hover:border-accent-primary" />
              ) : (
                <span className="text-xs font-mono font-semibold text-text-tertiary w-4 text-center">{i + 1}.</span>
              )}
            </div>

            {/* Option Label */}
            <input
              type="text"
              placeholder={`Option ${i + 1} Label`}
              value={opt.label}
              onChange={(e) => update(i, "label", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
              className="flex-1 px-3 py-1.5 rounded-md border border-border-default bg-surface-elevated text-text-primary text-xs font-semibold focus:outline-none focus:border-accent-primary"
            />

            {/* Optional Custom Key / Value */}
            <input
              type="text"
              placeholder="Value / Key"
              value={opt.value}
              onChange={(e) => update(i, "value", e.target.value)}
              className="w-28 px-2 py-1.5 rounded-md border border-border-default bg-surface-secondary text-text-secondary text-[11px] font-mono focus:outline-none focus:border-accent-primary"
              title="System value sent on form submission"
            />

            {/* Delete button */}
            <button
              type="button"
              onClick={() => remove(i)}
              className="p-1.5 text-text-tertiary hover:text-accent-error hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
              title="Remove option"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="flex items-center gap-1.5 text-xs font-semibold text-accent-primary hover:text-accent-primary-hover py-1.5 px-3 rounded-md border border-dashed border-accent-primary/60 bg-accent-primary-light transition hover:shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" /> Add Another Option
      </button>
    </div>
  );
}
