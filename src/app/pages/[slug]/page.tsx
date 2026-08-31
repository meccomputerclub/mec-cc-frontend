import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Sparkles, Calendar } from "lucide-react";

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
        trimmed.startsWith("@media") ||
        trimmed.startsWith("@keyframes") ||
        trimmed.startsWith("@font-face") ||
        trimmed.startsWith("@import")
      ) {
        return match;
      }

      // If selector is :root or body, map its variables/styles directly to .custom-page-rendered
      const scopedSelector = trimmed
        .split(",")
        .map((s: string) => {
          const sel = s.trim();
          if (sel === ":root" || sel === "body" || sel === "html") {
            return ".custom-page-rendered";
          }
          if (sel.startsWith("body ") || sel.startsWith("html ")) {
            return sel.replace(/^(body|html)\s+/, ".custom-page-rendered ");
          }
          return `.custom-page-rendered ${sel}`;
        })
        .join(", ");

      // Strip hardcoded dark background-colors from the body/root rules
      let cleanDeclarations = declarations;
      if (trimmed === ":root" || trimmed === "body" || trimmed === "html") {
        cleanDeclarations = cleanDeclarations
          .replace(/background(-color)?\s*:\s*[^;]+;/gi, "background-color: transparent !important;")
          .replace(/color\s*:\s*(#fff|#ffffff|white|#eee|#f8f8f6)\s*;/gi, "");
      }

      return `${scopedSelector} {${cleanDeclarations}}`;
    });

    scopedCss += "\n" + cleaned;
  }

  return { scopedHtml: html, scopedCss };
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

  const { scopedHtml, scopedCss } = processCustomPageHtml(page.content);

  const formattedDate = new Date(page.updatedAt || page.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="py-8 md:py-12 min-h-[75vh] w-full overflow-x-hidden">
      <div className="container mx-auto px-4 md:px-8">
        {/* Built-in scoped CSS for CMS content rendering */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .custom-page-rendered { width: 100%; max-width: 100%; color: var(--text-primary); line-height: 1.75; font-size: 1rem; word-break: break-word; background-color: transparent !important; }
            .custom-page-rendered .custom-page-inner-container { width: 100%; max-width: 900px; margin: 0 auto; padding: 1rem 0; }
            .custom-page-rendered h1, .custom-page-rendered h2, .custom-page-rendered h3, .custom-page-rendered h4, .custom-page-rendered h5, .custom-page-rendered h6 { color: var(--text-primary) !important; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.6em; line-height: 1.3; }
            .custom-page-rendered h1 { font-size: clamp(1.6rem, 3vw, 2.2rem); }
            .custom-page-rendered h2 { font-size: clamp(1.4rem, 2.5vw, 1.8rem); }
            .custom-page-rendered h3 { font-size: clamp(1.2rem, 2vw, 1.4rem); }
            .custom-page-rendered p, .custom-page-rendered .intro-text { margin-bottom: 1.25em; color: var(--text-secondary) !important; }
            .custom-page-rendered a:not(.apply-btn):not([class*="btn"]) { color: var(--accent-text-on-surface); text-decoration: underline; text-underline-offset: 3px; font-weight: 600; }
            .dark .custom-page-rendered a:not(.apply-btn):not([class*="btn"]) { color: var(--accent-primary-hover); }
            .custom-page-rendered .apply-btn, .custom-page-rendered a[class*="btn"], .custom-page-rendered button[class*="btn"] { display: inline-block; background-color: var(--accent-primary) !important; color: var(--accent-primary-text) !important; padding: 12px 28px; border-radius: var(--radius-lg); text-decoration: none !important; font-weight: 700; font-size: 1rem; border: 1px solid var(--border-default); box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.4); cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease; }
            .custom-page-rendered .apply-btn:hover, .custom-page-rendered a[class*="btn"]:hover, .custom-page-rendered button[class*="btn"]:hover { transform: translateY(-2px); opacity: 0.95; }
            .custom-page-rendered .benefit-card, .custom-page-rendered .cta-section, .custom-page-rendered div[class*="card"] { background-color: var(--surface-secondary) !important; border: 1px solid var(--border-default) !important; color: var(--text-primary) !important; box-shadow: 3px 3px 0px 0px var(--border-default) !important; border-radius: var(--radius-lg); padding: 1.25rem; }
            .custom-page-rendered ul, .custom-page-rendered ol { margin: 1em 0 1.5em; padding-left: 1.5em; color: var(--text-secondary); }
            .custom-page-rendered li { margin-bottom: 0.5em; }
            .custom-page-rendered img { max-width: 100%; height: auto; border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin: 1.5em auto; display: block; }
            .custom-page-rendered blockquote { border-left: 4px solid var(--accent-primary); padding: 0.75rem 1rem; margin: 1.5em 0; background: var(--surface-secondary); border-radius: 0 var(--radius-md) var(--radius-md) 0; font-style: italic; color: var(--text-secondary); }
            .custom-page-rendered table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.875rem; }
            .custom-page-rendered th, .custom-page-rendered td { padding: 10px 14px; border: 1px solid var(--border-default); text-align: left; }
            .custom-page-rendered th { background: var(--surface-secondary); font-weight: 700; color: var(--text-primary); }
            .custom-page-rendered pre, .custom-page-rendered code { font-family: var(--font-mono); }
            .custom-page-rendered code:not(pre code) { background: var(--surface-secondary); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.9em; border: 1px solid var(--border-default); }
            .custom-page-rendered pre { background: var(--surface-inverse); color: var(--text-inverse); padding: 1rem; border-radius: var(--radius-lg); overflow-x: auto; margin: 1.5em 0; font-size: 0.875rem; }
            ${scopedCss}
          `
        }} />

        {/* Page Header Card */}
        <div className="bg-surface-elevated border border-border-default rounded-2xl shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] overflow-hidden mb-6">
          {page.coverImageUrl && (
            <div
              className="w-full h-[280px] md:h-[380px] bg-cover bg-center bg-surface-secondary border-b border-border-default relative"
              style={{ backgroundImage: `url(${page.coverImageUrl})` }}
              aria-hidden="true"
            />
          )}

          <div className="p-6 md:p-8">
            <span className="kicker">
              <Sparkles size={14} className="inline align-middle mr-1" />
              MEC Computer Club Page
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary my-2">
              {page.title}
            </h1>

            {page.description && (
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-[800px] mb-4">
                {page.description}
              </p>
            )}

            <div className="text-xs font-mono text-text-tertiary font-semibold flex items-center gap-1.5">
              <Calendar size={13} />
              <span>Last updated: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Scoped Content Card */}
        <div className="bg-surface-elevated border border-border-default rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] overflow-x-auto">
          <div
            className="custom-page-rendered"
            dangerouslySetInnerHTML={{ __html: scopedHtml }}
          />
        </div>
      </div>
    </section>
  );
}
