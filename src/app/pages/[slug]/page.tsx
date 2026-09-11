import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RawHtmlChromeHider } from "./RawHtmlChromeHider";
import { API_BASE_URL } from "@/lib/api";

interface CustomPage {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  isPublished: boolean;
  showOnlyHtmlContent?: boolean;
  coverImageUrl?: string;
  updatedAt: string;
}

const API_BASE = API_BASE_URL;

async function getPage(slug: string): Promise<CustomPage | null> {
  try {
    const res = await fetch(`${API_BASE}/api/custom-pages/slug/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.title,
    description: page.description,
    openGraph: page.coverImageUrl
      ? { images: [{ url: page.coverImageUrl }] }
      : undefined,
  };
}

function scopeCssRules(css: string): string {
  const cleaned = css.replace(/\.container\b/g, ".custom-page-inner-container");
  return cleaned
    .replace(/@media[^{]+\{([\s\S]+?\})\s*\}/g, (mediaMatch, innerRules) => {
      const mediaHeader = mediaMatch.slice(0, mediaMatch.indexOf("{") + 1);
      const scopedInner = scopeCssRules(innerRules);
      return `${mediaHeader}\n${scopedInner}\n}`;
    })
    .replace(/([^{}]+)\{([^}]+)\}/g, (match, selectors, declarations) => {
      const trimmed = selectors.trim();
      if (
        trimmed.startsWith("@keyframes") ||
        trimmed.startsWith("@font-face") ||
        trimmed.startsWith("@import") ||
        trimmed.startsWith("@media")
      ) {
        return match;
      }
      const scopedSelector = trimmed
        .split(",")
        .map((s: string) => {
          const sel = s.trim();
          if (!sel) return "";
          if (sel === ":root" || sel === "body" || sel === "html") {
            return ".custom-page-rendered";
          }
          if (sel.startsWith("body ") || sel.startsWith("html ")) {
            return sel.replace(/^(body|html)\s+/, ".custom-page-rendered ");
          }
          return `.custom-page-rendered ${sel}`;
        })
        .filter(Boolean)
        .join(", ");

      return `${scopedSelector} {${declarations}}`;
    });
}

/**
 * Safely isolates and scopes custom HTML & CSS so that:
 * 1. Global selectors (body, .container, :root, etc.) apply only to .custom-page-rendered and never leak to site Navbar/Footer.
 * 2. CSS variables and backgrounds declared inside :root / body in the custom page are attached directly to .custom-page-rendered.
 * 3. Links with www. are normalized.
 */
function processCustomPageHtml(rawHtml: string): {
  scopedHtml: string;
  scopedCss: string;
  bodyClass?: string;
  bodyStyle?: string;
} {
  if (!rawHtml) return { scopedHtml: "", scopedCss: "" };

  let html = rawHtml;
  const styleBlocks: string[] = [];

  // Extract all <style> blocks
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, cssContent) => {
    styleBlocks.push(cssContent);
    return "";
  });

  let bodyClass = "";
  let bodyStyle = "";

  // Extract body content and attributes if <body> tag exists
  const bodyMatch = html.match(/<body\b([^>]*)>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const attrs = bodyMatch[1] || "";
    html = bodyMatch[2];
    const styleMatch = attrs.match(/\bstyle=(["'])([\s\S]*?)\1/i);
    if (styleMatch) bodyStyle = styleMatch[2];
    const classMatch = attrs.match(/\bclass=(["'])([\s\S]*?)\1/i);
    if (classMatch) bodyClass = classMatch[2];
  } else {
    // Strip <!DOCTYPE...>, <html>, <head>...</head>, </html>, <body>
    html = html
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      .replace(/<html\b[^>]*>/gi, "")
      .replace(/<\/html>/gi, "")
      .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<body\b[^>]*>/gi, "")
      .replace(/<\/body>/gi, "");
  }

  // Replace "container" class in the custom HTML so it does not collide with main site's root .container
  html = html.replace(/\bclass=(["'])([^"']*?\b)container(\b[^"']*?)\1/gi, (_, quote, before, after) => {
    return `class=${quote}${before}custom-page-inner-container${after}${quote}`;
  });

  // Ensure plain domains in href (e.g. href="www.meccc.com/...") get https:// protocol
  html = html.replace(/\bhref=(["'])www\./gi, "href=$1https://www.");

  // Scope CSS rules to .custom-page-rendered
  let scopedCss = "";
  for (const rawCss of styleBlocks) {
    scopedCss += "\n" + scopeCssRules(rawCss);
  }

  return { scopedHtml: html, scopedCss, bodyClass, bodyStyle };
}

export default async function DynamicCustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page || !page.isPublished) {
    notFound();
  }

  const { scopedHtml, scopedCss, bodyClass, bodyStyle } = processCustomPageHtml(page.content);

  // ── Standalone Mode: Show ONLY HTML Content (No Navbar, No Footer, No Site Header) ──
  if (page.showOnlyHtmlContent) {
    return (
      <div className="w-full min-h-screen overflow-x-hidden">
        <RawHtmlChromeHider />

        {/* Scoped CSS for Standalone Mode (Hides Navbar, Footer, and Accent Indicator) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body.raw-html-page-active header.navbar,
              body.raw-html-page-active footer,
              body.raw-html-page-active .accent-indicator,
              header.navbar,
              footer,
              .accent-indicator {
                display: none !important;
              }
              #main-content {
                max-width: 100% !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                min-height: 100vh !important;
              }
              .custom-page-rendered {
                width: 100%;
                min-height: 100vh;
                word-break: break-word;
              }
              .custom-page-rendered img {
                max-width: 100%;
                height: auto;
              }
              ${bodyStyle ? `.custom-page-rendered { ${bodyStyle} }` : ""}
              ${scopedCss}
            `,
          }}
        />

        {/* Pure Standalone HTML Content */}
        <article
          className={`custom-page-rendered w-full min-h-screen ${bodyClass || ""}`}
          dangerouslySetInnerHTML={{ __html: scopedHtml }}
        />
      </div>
    );
  }

  // ── Standard Mode: Normal Embedded Page with Site Header / Footer ──
  return (
    <div className="w-full min-h-[calc(100vh-var(--nav-height))] overflow-x-hidden">
      {/* Scoped CSS for CMS content rendering */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-page-rendered {
              width: 100%;
              min-height: 100%;
              line-height: 1.7;
              word-break: break-word;
            }
            .custom-page-rendered .custom-page-inner-container {
              width: 100%;
              max-width: 1280px;
              margin: 0 auto;
              padding: 0 1.25rem;
            }
            .custom-page-rendered img {
              max-width: 100%;
              height: auto;
            }
            ${scopedCss}
          `,
        }}
      />

      {/* Full-width custom page content */}
      <article
        className="custom-page-rendered w-full"
        dangerouslySetInnerHTML={{ __html: scopedHtml }}
      />
    </div>
  );
}
