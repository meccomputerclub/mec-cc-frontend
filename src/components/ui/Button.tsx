import Link from "next/link";
import "./Button.css";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  id?: string;
  title?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  id,
  title,
  fullWidth = false,
  icon,
  style,
  target,
  rel,
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} id={id} title={title} style={style} target={target} rel={rel}>
        {icon && <span className="btn__icon">{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      id={id}
      title={title}
      style={style}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
