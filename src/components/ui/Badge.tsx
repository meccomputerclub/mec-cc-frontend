interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "upcoming" | "past" | "pending" | "active" | "completed" | "info";
  size?: "sm" | "md";
  className?: string;
}

const BADGE_VARIANTS: Record<string, string> = {
  default: "bg-surface-secondary text-text-secondary",
  upcoming: "bg-accent-primary text-accent-primary-text",
  past: "bg-surface-secondary text-text-tertiary",
  pending: "bg-accent-primary text-accent-primary-text",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-accent-primary text-accent-primary-text",
  info: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

const BADGE_SIZES: Record<string, string> = {
  sm: "text-[0.65rem] py-1 px-2.5",
  md: "text-xs py-1.5 px-3.5",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;
  const sizeClass = BADGE_SIZES[size] || BADGE_SIZES.sm;

  return (
    <span
      className={`inline-flex items-center font-mono [font-feature-settings:'liga'_0,'calt'_0] font-medium uppercase tracking-wider rounded-full whitespace-nowrap leading-none ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}
