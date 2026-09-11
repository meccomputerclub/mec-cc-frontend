"use client";

import { useEffect } from "react";

/**
 * Attaches 'raw-html-page-active' class to document.body when mounted,
 * and cleans it up when unmounting (e.g. navigating to another page).
 */
export function RawHtmlChromeHider() {
  useEffect(() => {
    document.body.classList.add("raw-html-page-active");
    return () => {
      document.body.classList.remove("raw-html-page-active");
    };
  }, []);

  return null;
}
