import { API_BASE_URL } from "@/lib/api";
import toast from "react-hot-toast";

/**
 * Checks if a DataTransfer object contains draggable file or web image types
 * safely across all browsers without crashing on DOMStringList.
 */
export function isDragTransferValid(dt: DataTransfer | null): boolean {
  if (!dt) return false;
  try {
    if (dt.types) {
      // DOMStringList in Chromium has contains()
      if (typeof (dt.types as any).contains === "function") {
        return (
          (dt.types as any).contains("Files") ||
          (dt.types as any).contains("text/uri-list") ||
          (dt.types as any).contains("text/html") ||
          (dt.types as any).contains("text/plain")
        );
      }
      // Array or Array-like
      const arr = Array.from(dt.types);
      return arr.some(
        (t) =>
          t === "Files" ||
          t === "text/uri-list" ||
          t === "text/html" ||
          t === "text/plain"
      );
    }
  } catch {
    return true;
  }
  return true;
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
      mimeType = blob.type || "image/jpeg";
    } else {
      // 1. Attempt direct fetch
      try {
        const res = await fetch(cleanUrl, { mode: "cors" });
        if (res.ok) {
          blob = await res.blob();
          mimeType = blob.type || "image/jpeg";
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
          mimeType =
            blob.type || res.headers.get("content-type") || "image/jpeg";
        }
      }
    }

    if (!blob || !mimeType.startsWith("image/")) {
      return null;
    }

    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("gif")) ext = "gif";

    return new File([blob], `imported-image-${Date.now()}.${ext}`, {
      type: mimeType,
    });
  } catch (err) {
    console.error("fetchRemoteImageAsFile error:", err);
    return null;
  }
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

  const matchesAccept = (file: File) => {
    if (!acceptFilter || acceptFilter === "*/*") return true;
    const parts = acceptFilter.split(",").map((p) => p.trim());
    return parts.some((p) => {
      if (p.endsWith("/*")) {
        const category = p.slice(0, -2);
        return file.type.startsWith(category + "/");
      }
      return file.type === p || file.name.endsWith(p);
    });
  };

  // 1. Check local files
  if (dataTransfer.files && dataTransfer.files.length > 0) {
    const rawFiles = Array.from(dataTransfer.files);
    for (const f of rawFiles) {
      if (matchesAccept(f)) {
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
        if (f && matchesAccept(f)) {
          results.push(f);
          if (results.length >= maxFiles) return results;
        }
      }
    }
    if (results.length > 0) return results;
  }

  // 3. Web Image extraction (HTML with <img> tag, uri-list, or plain URL)
  let candidateUrl: string | null = null;
  try {
    const html = dataTransfer.getData("text/html");
    if (html) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const img = doc.querySelector("img");
      if (img?.src) candidateUrl = img.src;
    }
  } catch (_) {}

  if (!candidateUrl) {
    const uriList = dataTransfer.getData("text/uri-list");
    if (uriList && uriList.trim()) candidateUrl = uriList.trim();
  }

  if (!candidateUrl) {
    const plainText = dataTransfer.getData("text/plain");
    if (
      plainText &&
      (plainText.startsWith("http://") ||
        plainText.startsWith("https://") ||
        plainText.startsWith("data:image/"))
    ) {
      candidateUrl = plainText.trim();
    }
  }

  if (candidateUrl) {
    const file = await fetchRemoteImageAsFile(candidateUrl);
    if (file && matchesAccept(file)) {
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
            results.push(
              new File([blob], `clipboard-image-${Date.now()}.${ext}`, { type })
            );
            return results;
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
        if (file) results.push(file);
        return results;
      }
    }
  } catch (err) {
    console.warn("Clipboard read permission denied or unavailable:", err);
  }

  return results;
}
