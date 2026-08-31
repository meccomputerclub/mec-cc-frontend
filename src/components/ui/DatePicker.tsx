import React from "react";
import ReactDatePicker, { DatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props extends Omit<DatePickerProps, "onChange" | "value"> {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholderText, className, ...props }: Props) {
  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{
        __html: `
          .react-datepicker-wrapper { width: 100%; }
          .react-datepicker { font-family: inherit !important; border: 1px solid var(--border-brutalist) !important; border-radius: var(--radius-md) !important; box-shadow: 4px 4px 0px var(--border-brutalist) !important; background-color: var(--surface-elevated) !important; color: var(--text-primary) !important; }
          .dark .react-datepicker { border-color: var(--border-default) !important; box-shadow: 4px 4px 0px var(--border-default) !important; }
          .react-datepicker__header { background-color: var(--surface-secondary) !important; border-bottom: 1px solid var(--border-brutalist) !important; border-radius: var(--radius-md) var(--radius-md) 0 0 !important; padding-top: 10px !important; }
          .dark .react-datepicker__header { border-bottom-color: var(--border-default) !important; }
          .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { color: var(--text-primary) !important; font-weight: 600 !important; }
          .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name { color: var(--text-primary) !important; }
          .react-datepicker__day:hover, .react-datepicker__month-text:hover, .react-datepicker__quarter-text:hover, .react-datepicker__year-text:hover { background-color: var(--accent-primary-light) !important; color: var(--text-primary) !important; }
          .dark .react-datepicker__day:hover { color: #FFFFFF !important; background-color: rgba(255,255,255,0.1) !important; }
          .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range { background-color: var(--accent-primary) !important; color: var(--accent-primary-text) !important; font-weight: bold !important; border-radius: 4px !important; }
          .react-datepicker__day--keyboard-selected { background-color: var(--accent-primary-hover) !important; color: var(--accent-primary-text) !important; }
          .react-datepicker__time-container { border-left: 1px solid var(--border-brutalist) !important; }
          .dark .react-datepicker__time-container { border-left-color: var(--border-default) !important; }
          .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list { padding: 0 !important; margin: 0 !important; list-style: none !important; }
          .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected { background-color: var(--accent-primary) !important; color: var(--accent-primary-text) !important; }
          .react-datepicker__navigation-icon::before { border-color: var(--text-primary) !important; }
        `
      }} />
      {/* @ts-ignore */}
      <ReactDatePicker
        selected={value}
        onChange={(date: any) => onChange(date as Date | null)}
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mm aa"
        placeholderText={placeholderText || "Select date and time"}
        className={`w-full p-2.5 border border-border-brutalist dark:border-border-default rounded-md bg-surface-primary font-inherit text-base text-text-primary shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] transition-all duration-200 focus:outline-none focus:border-border-brutalist focus:shadow-[4px_4px_0px_var(--accent-primary)] focus:-translate-x-0.5 focus:-translate-y-0.5 ${className || ""}`}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={15}
        {...props}
      />
    </div>
  );
}
