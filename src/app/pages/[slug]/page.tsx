import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Calendar } from "lucide-react";
import "./page.css";

interface CustomPage {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  isPublished: boolean;
  coverImageUrl?: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

/**
 * Safely isolates and scopes custom HTML & CSS so that:
 * 1. Global selectors (body, .container, :root, etc.) apply only to .custom-page-rendered and never override site Navbar/Footer.
 * 2. CSS variables declared inside :root / body in the custom page are attached directly to .custom-page-rendered.
 * 3. Hardcoded body backgrounds are removed so the page seamlessly inherits Light/Dark mode themes.
 * 4. Links with www. are normalized.
 */
function processCustomPageHtml(rawHtml: string): { scopedHtml: string; scopedCss: string } {
  if (!rawHtml) return { scopedHtml: "", scopedCss: "" };

  let html = rawHtml;
  const styleBlocks: string[] = [];

  // Extract all <style> blocks
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, cssContent) => {
    styleBlocks.push(cssContent);
    return "";
  });

  // Extract body content if <body> tag exists
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1];
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
    let cleaned = rawCss.replace(/\.container\b/g, ".custom-page-inner-container");

    // Scope rules by prefixing selectors with .custom-page-rendered
    cleaned = cleaned.replace(/([^{}]+)\{([^}]+)\}/g, (match, selectors, declarations) => {
      const trimmed = selectors.trim();
      if (
        trimmed.startsWith("@keyframes") ||
        trimmed.startsWith("@media") ||
        trimmed.startsWith("@font-face") ||
        trimmed.startsWith("@import")
      ) {
        return match;
      }

      // If declarations belong to body or html, strip hardcoded background-color so theme isn't ruined
      let sanitizedDeclarations = declarations;
      if (/^(:root|html|body)$/i.test(trimmed)) {
        sanitizedDeclarations = sanitizedDeclarations.replace(/background(-color)?\s*:[^;]+;?/gi, "");
      }

      const scopedSelectors = selectors
        .split(",")
        .map((sel: string) => {
          let s = sel.trim();
          if (!s) return "";
          // If selector is :root, html, or body -> map directly to .custom-page-rendered so CSS variables work!
          if (/^(:root|html|body)$/i.test(s)) {
            return ".custom-page-rendered";
          }
          // If selector starts with body/html/root followed by a descendant
          s = s.replace(/^(body|html|:root)\s+/i, "");
          if (s.startsWith(".custom-page-rendered")) return s;
          return `.custom-page-rendered ${s}`;
        })
        .filter(Boolean)
        .join(", ");
      return `${scopedSelectors} { ${sanitizedDeclarations} }`;
    });

    scopedCss += cleaned + "\n";
  }

  return { scopedHtml: html.trim(), scopedCss };
}

export default async function CustomPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page || !page.isPublished) {
    notFound();
  }

  const { scopedHtml, scopedCss } = processCustomPageHtml(page.content);

  const formattedDate = new Date(page.updatedAt || page.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="section custom-page-section">
      <div className="container">
        {/* Scoped Dynamic Styles from Admin Content */}
        {scopedCss && (
          <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
        )}

        {/* Page Header Card */}
        <div className="custom-page-header-card">
          {page.coverImageUrl && (
            <div
              className="custom-page-cover"
              style={{ backgroundImage: `url(${page.coverImageUrl})` }}
              aria-hidden="true"
            />
          )}

          <div className="custom-page-meta-wrap">
            <span className="kicker">
              <Sparkles size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              MEC Computer Club Page
            </span>

            <h1>{page.title}</h1>

            {page.description && (
              <p className="custom-page-description">{page.description}</p>
            )}

            <div className="custom-page-date">
              <Calendar size={13} />
              <span>Last updated: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Scoped Content Card */}
        <div className="custom-page-content-card">
          <div
            className="custom-page-rendered"
            dangerouslySetInnerHTML={{ __html: scopedHtml }}
          />
        </div>
      </div>
    </section>
  );
}
