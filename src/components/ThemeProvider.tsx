"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AccentProvider } from "./AccentProvider";

// Suppress the React 19 false positive warning from next-themes
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return;
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="mec-cc-theme"
    >
      <AccentProvider>{children}</AccentProvider>
    </NextThemesProvider>
  );
}
