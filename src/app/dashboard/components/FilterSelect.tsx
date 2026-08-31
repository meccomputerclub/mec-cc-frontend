"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, Check, ChevronDown } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Filter by...",
  disabled = false,
  className = "",
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={containerRef}
      data-open={isOpen}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .filter-select-opt {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 7px 12px;
            margin: 0;
            border: none;
            border-bottom: 1px solid var(--border-default);
            font-family: var(--font-body);
            font-size: 13px;
            font-weight: 500;
            color: var(--text-secondary);
            cursor: pointer;
            background-color: transparent;
            transition: background-color var(--transition-fast), color var(--transition-fast), font-weight var(--transition-fast);
            white-space: nowrap;
          }
          .filter-select-opt:first-child {
            border-top-left-radius: calc(var(--radius-md) - 2px);
            border-top-right-radius: calc(var(--radius-md) - 2px);
          }
          .filter-select-opt:last-child {
            border-bottom: none;
            border-bottom-left-radius: calc(var(--radius-md) - 2px);
            border-bottom-right-radius: calc(var(--radius-md) - 2px);
          }
          .filter-select-opt:hover, .filter-select-opt.is-selected {
            background-color: var(--accent-primary-light);
            color: var(--text-primary);
            font-weight: 700;
          }
          html.dark .filter-select-opt:hover,
          .dark .filter-select-opt:hover,
          html.dark .filter-select-opt.is-selected,
          .dark .filter-select-opt.is-selected {
            background-color: color-mix(in srgb, var(--accent-primary) 25%, var(--surface-primary));
            color: #FFFFFF !important;
            font-weight: 700 !important;
          }
        `
      }} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-default bg-surface-elevated text-xs font-semibold transition shadow-[2px_2px_0px_0px_var(--border-default)] hover:shadow-[3px_3px_0px_0px_var(--accent-primary)] hover:border-accent-primary focus:outline-none ${isOpen ? "border-accent-primary shadow-[3px_3px_0px_0px_var(--accent-primary)] text-text-primary" : "text-text-secondary hover:text-text-primary"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <Filter size={13} className={isOpen || (value && value !== "all") ? "text-accent-primary" : "text-text-secondary"} />
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        {selectedOption?.count !== undefined && selectedOption.count > 0 && (
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-surface-secondary text-text-secondary font-semibold">
            {selectedOption.count}
          </span>
        )}
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-accent-primary" : "text-text-secondary"}`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 min-w-[170px] bg-surface-primary border border-text-primary dark:border-border-default rounded-md shadow-[4px_4px_0px_0px_var(--accent-primary)] z-[500] max-h-[250px] overflow-y-auto overflow-x-hidden flex flex-col m-0 p-0 list-none animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <div
                key={opt.value}
                className={`filter-select-opt ${isSelected ? "is-selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{opt.label}</span>
                  {opt.count !== undefined && opt.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-secondary text-text-secondary font-semibold">
                      {opt.count}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check
                    size={14}
                    className="text-text-primary dark:text-white shrink-0 ml-2"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
