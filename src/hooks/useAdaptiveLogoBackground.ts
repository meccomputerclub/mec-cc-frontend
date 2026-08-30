"use client";
import { useState, useEffect } from "react";

/**
 * Calculates relative luminance per WCAG 2.0
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Analyzes a logo image URL and returns the best background color.
 *
 * Algorithm:
 * 1. Draw the image onto an offscreen 32×32 canvas
 * 2. Sample all non-transparent pixels
 * 3. Compute average luminance and ratio of "very bright" pixels
 * 4. If the logo is predominantly light/white → use a dark charcoal bg (#2E2E2E)
 *    If the logo is predominantly dark → use a light off-white bg (#F5F5F5)
 *    Otherwise (colorful) → use clean white (#FFFFFF)
 */
export function useAdaptiveLogoBackground(
  imageUrl: string | undefined | null
): string {
  const [bgColor, setBgColor] = useState<string>("#F5F5F5");

  useEffect(() => {
    if (!imageUrl) {
      setBgColor("#F5F5F5");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const SAMPLE_SIZE = 32;
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        let totalLuminance = 0;
        let opaqueCount = 0;
        let veryBrightCount = 0; // luminance > 0.80 (near-white)
        let veryDarkCount = 0;   // luminance < 0.10 (near-black)

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent/semi-transparent pixels
          if (a < 40) continue;

          const lum = getLuminance(r, g, b);
          totalLuminance += lum;
          opaqueCount++;

          if (lum > 0.80) veryBrightCount++;
          if (lum < 0.10) veryDarkCount++;
        }

        if (opaqueCount === 0) {
          setBgColor("#F5F5F5");
          return;
        }

        const avgLuminance = totalLuminance / opaqueCount;
        const brightRatio = veryBrightCount / opaqueCount;
        const darkRatio = veryDarkCount / opaqueCount;

        if (brightRatio > 0.55 || avgLuminance > 0.72) {
          // Predominantly white/light logo → dark charcoal background
          setBgColor("#2E2E2E");
        } else if (darkRatio > 0.55 || avgLuminance < 0.12) {
          // Predominantly dark/black logo → light off-white background
          setBgColor("#F5F5F5");
        } else {
          // Colorful logo → clean white
          setBgColor("#FFFFFF");
        }
      } catch {
        // Canvas tainted by CORS — fallback to neutral
        setBgColor("#F0F0F0");
      }
    };

    img.onerror = () => {
      setBgColor("#F5F5F5");
    };

    // Append cache-busting only if needed (avoids CORS issues with cached images)
    img.src = imageUrl;
  }, [imageUrl]);

  return bgColor;
}
