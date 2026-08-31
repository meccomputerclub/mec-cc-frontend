"use client";

import React, { useState } from "react";
import { Event } from "@/types";

interface HeroCalendarProps {
  events: Event[];
}

export function HeroCalendar({ events }: HeroCalendarProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentDay = today.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Map events to their specific day in the current month
  const eventsByDay: Record<number, Event[]> = {};
  events.forEach((event) => {
    const eDate = new Date(event.date);
    if (eDate.getFullYear() === year && eDate.getMonth() === month) {
      const day = eDate.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    }
  });

  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  // Generate blank cells for padding
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => (
    <div key={`blank-${i}`} className="aspect-square opacity-0 pointer-events-none" />
  ));

  // Generate day cells
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayEvents = eventsByDay[day];
    const hasEvent = dayEvents && dayEvents.length > 0;
    const isToday = day === currentDay;

    return (
      <div 
        key={`day-${day}`} 
        className={`aspect-square flex items-center justify-center relative cursor-default rounded-md transition-all duration-150 text-text-primary hover:bg-white/40 dark:hover:bg-white/5 ${
          isToday ? "font-bold before:content-[''] before:absolute before:inset-[2px] before:border-2 before:border-accent-primary before:rounded-md before:z-10" : ""
        } ${
          hasEvent ? "bg-accent-primary-light text-accent-primary-text dark:bg-accent-primary/20 dark:text-accent-primary cursor-pointer hover:!bg-accent-primary hover:!text-accent-primary-text hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(132,204,22,0.3)]" : ""
        }`}
        onMouseEnter={() => hasEvent && setHoveredEvent(dayEvents[0].title)}
        onMouseLeave={() => setHoveredEvent(null)}
      >
        <span className="text-base font-medium">{day}</span>
        {hasEvent && <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full opacity-80" />}
      </div>
    );
  });

  return (
    <div className="w-full max-w-[420px] bg-white/35 dark:bg-[#0a0a0a]/40 backdrop-blur-[20px] backdrop-saturate-[180%] border border-white/50 dark:border-white/10 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
      <div className="p-4 pb-2 flex flex-col border-b border-white/20 dark:border-white/5">
        <h3 className="font-bold text-2xl tracking-tight m-0 text-text-primary">{monthNames[month]} {year}</h3>
        <div className="min-h-[24px] flex items-center mt-1">
          {hoveredEvent ? (
            <span className="text-sm font-semibold text-accent-primary-hover animate-pulse">{hoveredEvent}</span>
          ) : (
            <span className="text-sm font-medium text-text-tertiary">HOVER OVER HIGHLIGHTED DATES</span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-7 p-3 gap-1">
        {days.map(d => (
          <div key={d} className="text-center font-mono [font-feature-settings:'liga'_0,'calt'_0] text-[11px] font-bold text-text-secondary uppercase pb-2">{d}</div>
        ))}
        {blanks}
        {dayCells}
      </div>
    </div>
  );
}
