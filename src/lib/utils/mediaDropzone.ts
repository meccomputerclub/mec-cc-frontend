import { API_BASE_URL } from "@/lib/api";
import toast from "react-hot-toast";

/**
 * Checks if a DataTransfer object contains draggable file or web image types
 * safely across all browsers without crashing on DOMStringList.
 */
export function isDragTransferValid(dt: DataTransfer | null): boolean {
  if (!dt) return true;
  try {
    if (dt.types) {
      if (typeof (dt.types as any).contains === "function") {
        return (
          (dt.types as any).contains("Files") ||
          (dt.types as any).contains("text/uri-list") ||
          (dt.types as any).contains("text/html") ||
          (dt.types as any).contains("text/plain") ||
          dt.types.length > 0
        );
      }
      const arr = Array.from(dt.types);
      return arr.length > 0;
    }
  } catch {
    return true;
  }
  return true;
}

/**
 * Detects the real MIME type of a blob by inspecting its magic bytes.
 * Crucial when CDNs return generic 'application/octet-stream' or no Content-Type.
 */
async function detectMimeType(blob: Blob, fallbackUrl?: string): Promise<string> {
  try {
    const buffer = await blob.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "image/jpeg";
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return "image/png";
    }
    // GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return "image/gif";
    }
    // WEBP: 52 49 46 46 ... 57 45 42 50
    if (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return "image/webp";
    }
  } catch {}

  if (blob.type && blob.type.startsWith("image/")) {
    return blob.type;
  }

  if (fallbackUrl) {
    const lower = fallbackUrl.toLowerCase();
    if (lower.includes(".png")) return "image/png";
    if (lower.includes(".webp")) return "image/webp";
    if (lower.includes(".gif")) return "image/gif";
    if (lower.includes(".svg")) return "image/svg+xml";
  }

  return "image/jpeg";
}

/**
 * Downloads a remote image (e.g. from Facebook, Instagram, Google Images)
 * and returns it as a valid File object.
 * Bypasses CORS restrictions via the backend proxy endpoint when needed.
 */
export async function fetchRemoteImageAsFile(rawUrl: string): Promise<File | null> {
  let cleanUrl = rawUrl.trim();
  if (!cleanUrl) return null;
  if (cleanUrl.includes("\n")) cleanUrl = cleanUrl.split("\n")[0].trim();
  cleanUrl = cleanUrl.replace(/&amp;/g, "&");

  if (
    !cleanUrl.startsWith("http://") &&
    !cleanUrl.startsWith("https://") &&
    !cleanUrl.startsWith("data:image/")
  ) {
    return null;
  }

  try {
    let blob: Blob | null = null;
    let mimeType = "image/jpeg";

    if (cleanUrl.startsWith("data:image/")) {
      const res = await fetch(cleanUrl);
      blob = await res.blob();
      mimeType = await detectMimeType(blob, cleanUrl);
    } else {
      // 1. Attempt direct fetch
      try {
        const res = await fetch(cleanUrl, { mode: "cors" });
        if (res.ok) {
          blob = await res.blob();
          mimeType = await detectMimeType(blob, cleanUrl);
        }
      } catch {
        blob = null;
      }

      // 2. Fallback to backend CORS proxy (for Facebook CDN, etc.)
      if (!blob) {
        const base = API_BASE_URL;
        const proxyEndpoint = base.endsWith("/api")
          ? `${base}/upload/proxy-image`
          : `${base}/api/upload/proxy-image`;
        const proxyUrl = `${proxyEndpoint}?url=${encodeURIComponent(cleanUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          blob = await res.blob();
          mimeType = await detectMimeType(blob, cleanUrl);
        }
      }
    }

    if (!blob) return null;

    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("gif")) ext = "gif";
    else if (mimeType.includes("svg")) ext = "svg";

    return new File([blob], `imported-image-${Date.now()}.${ext}`, {
      type: mimeType,
    });
  } catch (err) {
    console.error("fetchRemoteImageAsFile error:", err);
    return null;
  }
}

/**
 * Checks if a File matches an accept filter (e.g. "image/*,video/*").
 * Gracefully handles Windows files with empty file.type by checking extension.
 */
export function matchesAcceptFilter(file: File, acceptFilter?: string): boolean {
  if (!acceptFilter || acceptFilter === "*/*") return true;
  const parts = acceptFilter.split(",").map((p) => p.trim().toLowerCase());
  const fileType = (file.type || "").toLowerCase();
  const fileName = (file.name || "").toLowerCase();
  const ext = fileName.includes(".") ? "." + fileName.split(".").pop() : "";

  const isImageExt = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".svg",
    ".avif",
    ".bmp",
    ".ico",
  ].includes(ext);

  const isVideoExt = [".mp4", ".webm", ".ogg", ".mov", ".m4v"].includes(ext);

  return parts.some((p) => {
    if (p === "image/*") {
      return fileType.startsWith("image/") || isImageExt;
    }
    if (p === "video/*") {
      return fileType.startsWith("video/") || isVideoExt;
    }
    if (p.endsWith("/*")) {
      const category = p.slice(0, -2);
      return fileType.startsWith(category + "/");
    }
    return fileType === p || fileName.endsWith(p) || ext === p;
  });
}

/**
 * Central parser for drag & drop or paste events.
 * Extracts:
 *  1. Local disk files (e.g. from Explorer / Finder)
 *  2. DataTransfer items (e.g. screenshots from clipboard)
 *  3. Dragged/pasted web images from Facebook, Google, other sites via HTML / URL
 */
export async function parseDroppedOrPastedFiles(
  dataTransfer: DataTransfer | null,
  options: {
    accept?: string;
    maxFiles?: number;
  } = {}
): Promise<File[]> {
  if (!dataTransfer) return [];
  const maxFiles = options.maxFiles || 20;
  const acceptFilter = options.accept || "image/*,video/*";
  const results: File[] = [];

  // 1. Check local files
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    const rawFiles = Array.from(dataTransfer.files);
    for (const f of rawFiles) {
      if (matchesAcceptFilter(f, acceptFilter)) {
        results.push(f);
        if (results.length >= maxFiles) return results;
      }
    }
    if (results.length > 0) return results;
  }

  // 2. Check DataTransfer items
  if (dataTransfer.items && dataTransfer.items.length > 0) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i];
      if (item.kind === "file") {
        const f = item.getAsFile();
        if (f && matchesAcceptFilter(f, acceptFilter)) {
          results.push(f);
          if (results.length >= maxFiles) return results;
        }
      }
    }
    if (results.length > 0) return results;
  }

  // 3. Web Image extraction (HTML with <img> tag, uri-list, background-images, or plain URL)
  const candidateUrls: string[] = [];

  try {
    const html = dataTransfer.getData("text/html");
    if (html) {
      const cleanHtml = html.replace(/&amp;/g, "&");
      const doc = new DOMParser().parseFromString(cleanHtml, "text/html");

      // Check all <img> tags
      const imgElements = doc.querySelectorAll("img");
      imgElements.forEach((img) => {
        const src = img.getAttribute("src") || img.src;
        if (
          src &&
          !src.startsWith("data:image/svg") &&
          !candidateUrls.includes(src)
        ) {
          candidateUrls.push(src);
        }
        // Check srcset
        const srcset = img.getAttribute("srcset");
        if (srcset) {
          const firstSrc = srcset.split(",")[0].trim().split(" ")[0];
          if (firstSrc && !candidateUrls.includes(firstSrc)) {
            candidateUrls.push(firstSrc);
          }
        }
      });

      // Check SVG <image> tags
      const svgImages = doc.querySelectorAll("image");
      svgImages.forEach((svgImg) => {
        const href =
          svgImg.getAttribute("href") || svgImg.getAttribute("xlink:href");
        if (href && !candidateUrls.includes(href)) {
          candidateUrls.push(href);
        }
      });

      // Check elements with inline background-image style
      const allEls = doc.querySelectorAll("*");
      allEls.forEach((el) => {
        const style = el.getAttribute("style") || "";
        const bgMatch = style.match(
          /background-image:\s*url\(['"]?([^'"]+)['"]?\)/i
        );
        if (bgMatch && bgMatch[1] && !candidateUrls.includes(bgMatch[1])) {
          candidateUrls.push(bgMatch[1]);
        }
      });

      // Regex scan raw HTML for known image CDN domains and extensions
      const urlRegex =
        /(https?:\/\/[^\s"'<>]*(?:fbcdn\.net|cloudinary\.com|googleusercontent\.com|imgur\.com|pinimg\.com|twimg\.com|\.(?:jpe?g|png|webp|gif|avif))[^\s"'<>]*)/gi;
      let m;
      while ((m = urlRegex.exec(cleanHtml)) !== null) {
        const found = m[1].replace(/[)"';]+$/, "");
        if (!candidateUrls.includes(found)) candidateUrls.push(found);
      }
    }
  } catch (_) {}

  const uriList = dataTransfer.getData("text/uri-list");
  if (uriList) {
    const uris = uriList
      .split("\n")
      .map((u) => u.trim().replace(/&amp;/g, "&"))
      .filter(Boolean);
    for (const u of uris) {
      if (!candidateUrls.includes(u)) candidateUrls.push(u);
    }
  }

  const plainText = dataTransfer.getData("text/plain");
  if (plainText) {
    const text = plainText.trim().replace(/&amp;/g, "&");
    if (
      (text.startsWith("http://") ||
        text.startsWith("https://") ||
        text.startsWith("data:image/")) &&
      !candidateUrls.includes(text)
    ) {
      candidateUrls.push(text);
    }
  }

  // Fetch candidate URLs sequentially or concurrently
  for (const url of candidateUrls) {
    if (results.length >= maxFiles) break;
    const file = await fetchRemoteImageAsFile(url);
    if (file && matchesAcceptFilter(file, acceptFilter)) {
      results.push(file);
    }
  }

  return results;
}

/**
 * One-click helper to read and parse the user's system clipboard directly.
 */
export async function readClipboardMedia(
  options: { accept?: string } = {}
): Promise<File[]> {
  const acceptFilter = options.accept || "image/*,video/*";
  const results: File[] = [];

  try {
    if (navigator.clipboard && navigator.clipboard.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/") || type.startsWith("video/")) {
            const blob = await item.getType(type);
            const ext = type.includes("png")
              ? "png"
              : type.includes("webp")
              ? "webp"
              : type.includes("gif")
              ? "gif"
              : "jpg";
            const file = new File(
              [blob],
              `clipboard-image-${Date.now()}.${ext}`,
              { type }
            );
            if (matchesAcceptFilter(file, acceptFilter)) {
              results.push(file);
              return results;
            }
          }
        }
      }
    }

    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (
        text &&
        (text.startsWith("http://") ||
          text.startsWith("https://") ||
          text.startsWith("data:image/"))
      ) {
        const file = await fetchRemoteImageAsFile(text);
        if (file && matchesAcceptFilter(file, acceptFilter)) {
          results.push(file);
          return results;
        }
      }
    }
  } catch (err) {
    console.warn("Clipboard read permission denied or unavailable:", err);
  }

  return results;
}
