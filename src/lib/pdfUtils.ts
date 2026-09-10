import { API_BASE_URL } from "./api";

/**
 * Generates a proxy URL for viewing or downloading PDFs via the backend.
 * Bypasses Cloudinary ACL / delivery restrictions by streaming through the authenticated API.
 */
export function getPdfProxyUrl(
  url: string,
  download: boolean = false,
  filename?: string
): string {
  if (!url) return "";

  // If already pointing to the pdf-view endpoint, adjust download param
  if (url.includes("/api/upload/pdf-view")) {
    const parsed = new URL(url, API_BASE_URL);
    if (download) {
      parsed.searchParams.set("download", "true");
    }
    if (filename) {
      parsed.searchParams.set("filename", filename);
    }
    return parsed.toString();
  }

  const query = new URLSearchParams();
  query.set("url", url);
  if (download) query.set("download", "true");
  if (filename) query.set("filename", filename);

  return `${API_BASE_URL}/api/upload/pdf-view?${query.toString()}`;
}

export function isPdfDocument(doc: { url?: string; pdfUrl?: string; linkType?: string }): boolean {
  if (doc.linkType === "pdf") return true;
  if (doc.pdfUrl) return true;
  const u = (doc.url || "").toLowerCase();
  return u.endsWith(".pdf") || u.includes(".pdf?") || u.includes("/raw/upload/");
}
