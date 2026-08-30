"use client";
import React from "react";
import { LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface DashboardCardProps {
  title: string;
  value: string | number | undefined;
  icon: LucideIcon;
  colorClass: string;
  /** Absolute path (starts with /) or relative path (appended to current path) */
  link?: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  colorClass,
  link,
  onClick,
}) => {
  const router = useRouter();
  const path = usePathname();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      // Absolute path starts with /
      if (link.startsWith("/")) {
        router.push(link);
      } else {
        // Relative: append to current path
        router.push(`${path}/${link}`);
      }
    }
  };

  return (
    <div
      className="bg-surface-elevated rounded-2xl p-6 shadow-sm border border-border-default hover:shadow-md transition-shadow cursor-pointer flex flex-col"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <p className="text-3xl font-semibold text-text-primary mt-1">
        {value ?? "—"}
      </p>
    </div>
  );
};
