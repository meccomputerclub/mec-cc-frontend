"use client";

import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function Select({ id, name, value, onChange, options, placeholder = "Select...", required, disabled }: SelectProps) {
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

  return (
    <div
      className={`relative w-full ${isOpen ? "z-[500]" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      ref={containerRef}
      id={id}
      data-open={isOpen}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-select-opt {
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
          .custom-select-opt:first-child {
            border-top-left-radius: calc(var(--radius-md) - 2px);
            border-top-right-radius: calc(var(--radius-md) - 2px);
          }
          .custom-select-opt:last-child {
            border-bottom: none;
            border-bottom-left-radius: calc(var(--radius-md) - 2px);
            border-bottom-right-radius: calc(var(--radius-md) - 2px);
          }
          .custom-select-opt:hover, .custom-select-opt.is-selected {
            background-color: var(--accent-primary-light);
            color: var(--text-primary);
            font-weight: 700;
          }
          html.dark .custom-select-opt:hover,
          .dark .custom-select-opt:hover,
          html.dark .custom-select-opt.is-selected,
          .dark .custom-select-opt.is-selected {
            background-color: color-mix(in srgb, var(--accent-primary) 25%, var(--surface-primary));
            color: #FFFFFF !important;
            font-weight: 700 !important;
          }
        `
      }} />

      <button
        type="button"
        className={`w-full py-2 px-3.5 border rounded-md bg-surface-primary font-sans text-sm font-medium text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-150 flex justify-between items-center cursor-pointer text-left outline-none ${
          isOpen
            ? "border-accent-primary shadow-[3px_3px_0px_var(--accent-primary)] font-bold text-text-primary dark:text-white"
            : "border-border-brutalist dark:border-border-default focus:border-accent-primary focus:shadow-[3px_3px_0px_var(--accent-primary)]"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-150 shrink-0 ${isOpen ? "rotate-180 text-accent-primary" : "text-text-tertiary"}`}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-surface-primary border border-text-primary dark:border-border-default rounded-md shadow-[4px_4px_0px_0px_var(--accent-primary)] z-[500] max-h-[250px] overflow-y-auto overflow-x-hidden flex flex-col m-0 p-0 list-none animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`custom-select-opt ${value === opt.value ? "is-selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              <span>{opt.label}</span>
              {value === opt.value && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 ml-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hidden input to support native HTML5 form validation & form name */}
      <input 
        type="text" 
        name={name}
        value={value} 
        required={required} 
        disabled={disabled}
        onChange={() => {}} // Dummy handler to prevent react warnings
        style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', height: 0, width: 0 }} 
      />
    </div>
  );
}
