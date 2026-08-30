/**
 * Multi-Accent Cycling Theme System
 * -----------------------------------
 * 7 named accent vibes × 2 modes (light / dark).
 * Every token — surfaces, text, borders, accents — is individually
 * tuned per vibe so the entire canvas shifts mood, not just the accent.
 */

export const VIBE_ORDER = [
  "lime",
  "mint",
  "sky",
  "amber",
  "rose",
  "violet",
  "slate",
] as const;

export type VibeName = (typeof VIBE_ORDER)[number];

export interface AccentTokens {
  /* ── Per-vibe neutrals ───────────────────────────────────── */
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  navBg: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  /* ── Accent tokens ───────────────────────────────────────── */
  logoColor: string;
  accentPrimary: string;
  accentPrimaryHover: string;
  accentPrimaryLight: string;
  accentPrimaryText: string;
  accentTextOnSurface: string;
  accentSecondary: string;
  accentSecondaryLight: string;
  borderDefault: string;
  borderHover: string;
  borderFocus: string;
  gridLines: string;
}

interface VibeDefinition {
  light: AccentTokens;
  dark: AccentTokens;
}

/* ------------------------------------------------------------------ */
/*  Helper: build border/grid tokens from an RGB triplet              */
/* ------------------------------------------------------------------ */
function borders(r: number, g: number, b: number, mode: "light" | "dark") {
  const gridOpacity = mode === "dark" ? 0.08 : 0.05;
  return {
    borderDefault: `rgba(${r}, ${g}, ${b}, 0.15)`,
    borderHover: `rgba(${r}, ${g}, ${b}, 0.3)`,
    gridLines: `rgba(${r}, ${g}, ${b}, ${gridOpacity})`,
  };
}

/* ================================================================== */
/*  THEMES lookup table                                               */
/*  Each vibe has its own full surface/text/accent profile so the     */
/*  entire canvas shifts undertone when the vibe rotates.             */
/* ================================================================== */
export const THEMES: Record<VibeName, VibeDefinition> = {

  /* ── Lime (H≈80° — warm olive undertone) ─────────────────── */
  lime: {
    light: {
      surfacePrimary: "#F8F8F8",
      surfaceSecondary: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      navBg: "#F8F8F8",
      textPrimary: "#1A1A1A",
      textSecondary: "#4B4B4A",
      textTertiary: "#727271",

      logoColor: "#1A1A1A",
      accentPrimary: "#84CC16",
      accentPrimaryHover: "#65A30D",
      accentPrimaryLight: "#D9F99D",
      accentPrimaryText: "#1A1A1A",
      accentTextOnSurface: "#3f6212",
      accentSecondary: "#84CC16",
      accentSecondaryLight: "#D9F99D",
      borderFocus: "#84CC16",
      ...borders(132, 204, 22, "light"),
      gridLines: "rgba(95, 94, 90, 0.05)",
    },
    dark: {
      surfacePrimary: "#0D0F0A",
      surfaceSecondary: "#1A1C15",
      surfaceElevated: "#151711",
      navBg: "#0D0F0A",
      textPrimary: "#F5F5EF",
      textSecondary: "#a8ad9a",
      textTertiary: "#787d6a",

      logoColor: "#D4F429",
      accentPrimary: "#D4F429",
      accentPrimaryHover: "#bde010",
      accentPrimaryLight: "#3A4013",
      accentPrimaryText: "#0D0F0A",
      accentTextOnSurface: "#D4F429",
      accentSecondary: "#D4F429",
      accentSecondaryLight: "#3A4013",
      borderFocus: "#D4F429",
      ...borders(212, 244, 41, "dark"),
    },
  },

  /* ── Mint (H≈160° — cool teal undertone) ─────────────────── */
  mint: {
    light: {
      surfacePrimary: "#F8F8F8",
      surfaceSecondary: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      navBg: "#F8F8F8",
      textPrimary: "#1A1A1A",
      textSecondary: "#4B4B4A",
      textTertiary: "#727271",

      logoColor: "#1A5C48",
      accentPrimary: "#2E8B6B",
      accentPrimaryHover: "#246E55",
      accentPrimaryLight: "#A7F3D0",
      accentPrimaryText: "#FFFFFF",
      accentTextOnSurface: "#2E8B6B",
      accentSecondary: "#2E8B6B",
      accentSecondaryLight: "#A7F3D0",
      borderFocus: "#2E8B6B",
      ...borders(46, 139, 107, "light"),
      gridLines: "rgba(95, 94, 90, 0.05)",
    },
    dark: {
      surfacePrimary: "#0A0F0D",
      surfaceSecondary: "#151C19",
      surfaceElevated: "#111715",
      navBg: "#0A0F0D",
      textPrimary: "#EFF5F3",
      textSecondary: "#9AADA6",
      textTertiary: "#6A7D77",

      logoColor: "#34D399",
      accentPrimary: "#34D399",
      accentPrimaryHover: "#2AB882",
      accentPrimaryLight: "#0F3D30",
      accentPrimaryText: "#0D0F0A",
      accentTextOnSurface: "#34D399",
      accentSecondary: "#34D399",
      accentSecondaryLight: "#0F3D30",
      borderFocus: "#34D399",
      ...borders(52, 211, 153, "dark"),
    },
  },

  /* ── Sky (H≈220° — cool blue undertone) ──────────────────── */
  sky: {
    light: {
      surfacePrimary: "#F8F8F8",
      surfaceSecondary: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      navBg: "#F8F8F8",
      textPrimary: "#1A1A1A",
      textSecondary: "#4B4B4A",
      textTertiary: "#727271",

      logoColor: "#1E3F8A",
      accentPrimary: "#2D5BC0",
      accentPrimaryHover: "#244A9D",
      accentPrimaryLight: "#BFDBFE",
      accentPrimaryText: "#FFFFFF",
      accentTextOnSurface: "#2D5BC0",
      accentSecondary: "#2D5BC0",
      accentSecondaryLight: "#BFDBFE",
      borderFocus: "#2D5BC0",
      ...borders(45, 91, 192, "light"),
      gridLines: "rgba(95, 94, 90, 0.05)",
    },
    dark: {
      surfacePrimary: "#0A0B0F",
      surfaceSecondary: "#15171C",
      surfaceElevated: "#111317",
      navBg: "#0A0B0F",
      textPrimary: "#EFF1F5",
      textSecondary: "#9AA0AD",
      textTertiary: "#6A707D",

      logoColor: "#5B8DEF",
      accentPrimary: "#5B8DEF",
      accentPrimaryHover: "#4A78D4",
      accentPrimaryLight: "#152A4D",
      accentPrimaryText: "#0D0F0A",
      accentTextOnSurface: "#5B8DEF",
      accentSecondary: "#5B8DEF",
      accentSecondaryLight: "#152A4D",
      borderFocus: "#5B8DEF",
      ...borders(91, 141, 239, "dark"),
    },
  },

  /* ── Amber (H≈30° — warm golden undertone) ───────────────── */
  amber: {
    light: {
      surfacePrimary: "#F8F8F8",
      surfaceSecondary: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      navBg: "#F8F8F8",
      textPrimary: "#1A1A1A",
      textSecondary: "#4B4B4A",
      textTertiary: "#727271",

      logoColor: "#8A4410",
      accentPrimary: "#B25A15",
      accentPrimaryHover: "#934A11",
      accentPrimaryLight: "#FDE68A",
      accentPrimaryText: "#FFFFFF",
      accentTextOnSurface: "#B25A15",
      accentSecondary: "#B25A15",
      accentSecondaryLight: "#FDE68A",
      borderFocus: "#B25A15",
      ...borders(178, 90, 21, "light"),
      gridLines: "rgba(95, 94, 90, 0.05)",
    },
    dark: {
      surfacePrimary: "#0F0D0A",
      surfaceSecondary: "#1C1915",
      surfaceElevated: "#171511",
      navBg: "#0F0D0A",
      textPrimary: "#F5F3EF",
      textSecondary: "#ADA69A",
      textTertiary: "#7D776A",

      logoColor: "#F2A65A",
      accentPrimary: "#F2A65A",
      accentPrimaryHover: "#D99248",
      accentPrimaryLight: "#402711",
      accentPrimaryText: "#0D0F0A",
      accentTextOnSurface: "#F2A65A",
      accentSecondary: "#F2A65A",
      accentSecondaryLight: "#402711",
      borderFocus: "#F2A65A",
      ...borders(242, 166, 90, "dark"),
    },
  },

  /* ── Rose (H≈350° — warm pink undertone) ─────────────────── */
  rose: {
    light: {
      surfacePrimary: "#F8F8F8",
      surfaceSecondary: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      navBg: "#F8F8F8",
      textPrimary: "#1A1A1A",
      textSecondary: "#4B4B4A",
      textTertiary: "#727271",

      logoColor: "#8A2637",
      accentPrimary: "#B23A4D",
      accentPrimaryHover: "#932F3F",
      accentPrimaryLight: "#FECDD3",
      accentPrimaryText: "#FFFFFF",
      accentTextOnSurface: "#B23A4D",
      accentSecondary: "#B23A4D",
      accentSecondaryLight: "#FECDD3",
      borderFocus: "#B23A4D",
      ...borders(178, 58, 77, "light"),
      gridLines: "rgba(95, 94, 90, 0.05)",
    },
    dark: {
      surfacePrimary: "#0F0A0C",
      surfaceSecondary: "#1C1517",
      surfaceElevated: "#171113",
      navBg: "#0F0A0C",
      textPrimary: "#F5EFF1",
      textSecondary: "#AD9A9E",
      textTertiary: "#7D6A6E",

      logoColor: "#F0687D",
      accentPrimary: "#F0687D",
      accentPrimaryHover: "#D45A6C",
      accentPrimaryLight: "#3D141B",
      accentPrimaryText: "#0D0F0A",
      accentTextOnSurface: "#F0687D",
      accentSecondary: "#F0687D",
      accentSecondaryLight: "#3D141B",
      borderFocus: "#F0687D",
      ...borders(240, 104, 125, "dark"),
    },
  },

  /* ── Violet (H≈260° — cool purple undertone) ─────────────── */
  violet: {
    light: {
      surfacePrimary: "#F8F8F8",
      surfaceSecondary: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      navBg: "#F8F8F8",
      textPrimary: "#1A1A1A",
      textSecondary: "#4B4B4A",
      textTertiary: "#727271",

      logoColor: "#3E3590",
      accentPrimary: "#5A4FBF",
      accentPrimaryHover: "#4A409E",
      accentPrimaryLight: "#DDD6FE",
      accentPrimaryText: "#FFFFFF",
      accentTextOnSurface: "#5A4FBF",
      accentSecondary: "#5A4FBF",
      accentSecondaryLight: "#DDD6FE",
      borderFocus: "#5A4FBF",
      ...borders(90, 79, 191, "light"),
      gridLines: "rgba(95, 94, 90, 0.05)",
    },
    dark: {
      surfacePrimary: "#0C0A0F",
      surfaceSecondary: "#17151C",
      surfaceElevated: "#131117",
      navBg: "#0C0A0F",
      textPrimary: "#F1EFF5",
      textSecondary: "#A09AAD",
      textTertiary: "#706A7D",

      logoColor: "#8B7FE8",
      accentPrimary: "#8B7FE8",
      accentPrimaryHover: "#7A6ED0",
      accentPrimaryLight: "#251F45",
      accentPrimaryText: "#0D0F0A",
      accentTextOnSurface: "#8B7FE8",
      accentSecondary: "#8B7FE8",
      accentSecondaryLight: "#251F45",
      borderFocus: "#8B7FE8",
      ...borders(139, 127, 232, "dark"),
    },
  },

  /* ── Slate (neutral — no hue, true gray) ─────────────────── */
  slate: {
    light: {
      surfacePrimary: "#F8F8F8",
      surfaceSecondary: "#F2F2F2",
      surfaceElevated: "#FFFFFF",
      navBg: "#F8F8F8",
      textPrimary: "#1A1A1A",
      textSecondary: "#4B4B4A",
      textTertiary: "#727271",

      logoColor: "#3D3D3A",
      accentPrimary: "#5F5E5A",
      accentPrimaryHover: "#4D4D49",
      accentPrimaryLight: "#E2E8F0",
      accentPrimaryText: "#FFFFFF",
      accentTextOnSurface: "#5F5E5A",
      accentSecondary: "#5F5E5A",
      accentSecondaryLight: "#E2E8F0",
      borderFocus: "#5F5E5A",
      ...borders(95, 94, 90, "light"),
    },
    dark: {
      surfacePrimary: "#0C0C0B",
      surfaceSecondary: "#191918",
      surfaceElevated: "#141413",
      navBg: "#0C0C0B",
      textPrimary: "#F2F2F0",
      textSecondary: "#A6A6A4",
      textTertiary: "#767674",

      logoColor: "#B8B6AC",
      accentPrimary: "#B8B6AC",
      accentPrimaryHover: "#A3A198",
      accentPrimaryLight: "#33322D",
      accentPrimaryText: "#0D0F0A",
      accentTextOnSurface: "#B8B6AC",
      accentSecondary: "#B8B6AC",
      accentSecondaryLight: "#33322D",
      borderFocus: "#B8B6AC",
      ...borders(184, 182, 172, "dark"),
    },
  },
};

/* ------------------------------------------------------------------ */
/*  camelCase → kebab-case CSS custom property                        */
/* ------------------------------------------------------------------ */
function toKebab(key: string): string {
  return "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/**
 * Apply all accent tokens for a given vibe + mode onto the root element.
 */
export function applyAccentTokens(
  vibe: VibeName,
  mode: "light" | "dark",
  root: HTMLElement = document.documentElement
): void {
  const tokens = THEMES[vibe][mode];
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(toKebab(key), value);
  }
}
