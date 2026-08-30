"use client";
/**
 * TagInput — visual tag pill input
 * - Type and press Enter or comma to add a tag
 * - Click ✕ on a tag to remove it
 * - Paste comma-separated values to add multiple at once
 * - Fully controlled via value/onChange
 */
import React, { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
}

export default function TagInput({
  value = [],
  onChange,
  placeholder = "Add tag…",
  maxTags,
  disabled = false,
  className = "",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTags = (raw: string) => {
    const newTags = raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && !value.includes(t));

    if (newTags.length === 0) return;
    const next = maxTags ? [...value, ...newTags].slice(0, maxTags) : [...value, ...newTags];
    onChange(next);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTags(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(",")) {
      e.preventDefault();
      addTags(pasted);
    }
  };

  const handleBlur = () => {
    if (input.trim()) addTags(input);
  };

  const TAG_COLORS = [
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  ];

  const getColor = (tag: string) => {
    const idx = tag.charCodeAt(0) % TAG_COLORS.length;
    return TAG_COLORS[idx];
  };

  return (
    <div
      className={`flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition cursor-text min-h-[44px] ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getColor(tag)}`}
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="hover:opacity-70 transition ml-0.5"
              aria-label={`Remove ${tag}`}
            >
              <X size={10} />
            </button>
          )}
        </span>
      ))}
      {!disabled && (!maxTags || value.length < maxTags) && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      )}
    </div>
  );
}
