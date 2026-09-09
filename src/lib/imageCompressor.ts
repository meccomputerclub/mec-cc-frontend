import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
  onProgress?: (progress: number) => void;
}

export interface CompressedImageResult {
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
}

/**
 * Centrally compress any image File before upload.
 * - Runs in a Web Worker (smooth UI, no thread lock)
 * - Auto-corrects EXIF mobile orientation
 * - Scales down oversized dimensions (default max 1920px)
 * - Compresses file size (default max 1.5MB)
 * - Skips non-compressible formats like SVG and GIF
 */
export async function compressImage(
  file: File,
  customOptions?: CompressionOptions
): Promise<CompressedImageResult> {
  const originalSize = file.size;

  // Don't compress SVGs, GIFs (preserve animation/vector), or already tiny files (< 50KB)
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif" ||
    originalSize < 50 * 1024
  ) {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      previewUrl,
      originalSize,
      compressedSize: originalSize,
      savedPercentage: 0,
    };
  }

  const defaultOptions: CompressionOptions = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType:
      file.type === "image/png" && originalSize < 500 * 1024
        ? "image/png"
        : "image/webp",
  };

  const options = { ...defaultOptions, ...customOptions };

  try {
    const compressedBlob = await imageCompression(file, options);

    // Ensure file retains a meaningful name and extension
    let targetName = file.name;
    if (
      options.fileType === "image/webp" &&
      !targetName.toLowerCase().endsWith(".webp")
    ) {
      targetName = targetName.replace(/\.[^/.]+$/, "") + ".webp";
    }

    const compressedFile = new File([compressedBlob], targetName, {
      type: compressedBlob.type || options.fileType || file.type,
      lastModified: Date.now(),
    });

    const compressedSize = compressedFile.size;
    const savedPercentage = Math.max(
      0,
      Math.round(((originalSize - compressedSize) / originalSize) * 100)
    );

    const previewUrl = URL.createObjectURL(compressedFile);

    console.log(
      `[ImageCompressor] ${file.name}: ${(originalSize / 1024).toFixed(0)}KB -> ${(
        compressedSize / 1024
      ).toFixed(0)}KB (${savedPercentage}% saved)`
    );

    return {
      file: compressedFile,
      previewUrl,
      originalSize,
      compressedSize,
      savedPercentage,
    };
  } catch (error) {
    console.warn(
      "[ImageCompressor] Compression failed, falling back to original file:",
      error
    );
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      previewUrl,
      originalSize,
      compressedSize: originalSize,
      savedPercentage: 0,
    };
  }
}

export default compressImage;
