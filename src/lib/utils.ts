import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isExternalUrl(url: string): boolean {
  if (!/^https?:\/\//.test(url)) {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== "localhost" || urlObj.port !== "3000";
  } catch {
    return true;
  }
}

export const capitalizeFirstLetter = (status: string): string => {
  if (!status) return "";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url) return true;
  const urlRegex = new RegExp(/^(?:(?:https?|ftp):\/\/)?(?:(?:\w|-)+\.)*\w[\w-]+\.[a-z]{2,}$/i);
  return urlRegex.test(url);
};

export const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, onSubmit: () => void) => {
  if (e.key === "Enter") {
    e.preventDefault();
    onSubmit();
  }
};
