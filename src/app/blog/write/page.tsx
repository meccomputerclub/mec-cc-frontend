"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, API_BASE_URL } from "@/lib/api";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import BlogCoverUploader from "./components/BlogCoverUploader";
import TagInput from "@/components/ui/shared/TagInput";
import toast from "react-hot-toast";
import { compressImage } from "@/lib/imageCompressor";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Code,
  Link as LinkIcon,
  ImageIcon,
  Quote,
  Loader2,
  ArrowLeft,
  Save,
  Send,
  Undo,
  Redo,
} from "lucide-react";

interface ToolbarAction {
  icon: React.ReactNode;
  command: string;
  arg?: string;
  title: string;
}

function BlogWriteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverImagePosition, setCoverImagePosition] = useState("50% 50%");
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(!!editId);
  const editorRef = useRef<HTMLDivElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const [insertingImage, setInsertingImage] = useState(false);
  const pendingContentImagesRef = useRef<Map<string, File>>(new Map());
  const [selectedImg, setSelectedImg] = useState<HTMLElement | null>(null);

  // Attach discard button to existing images loaded from database
  const attachDiscardButtonsToExistingImages = useCallback((container: HTMLElement) => {
    const images = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
    images.forEach((img) => {
      if (img.closest(".blog-editor-img-wrap")) return;

      const figure = document.createElement("figure");
      figure.className = "blog-editor-img-wrap";
      figure.setAttribute("contenteditable", "false");

      const discardBtn = document.createElement("button");
      discardBtn.type = "button";
      discardBtn.className = "blog-editor-img-delete-btn";
      discardBtn.title = "Discard image (or press Backspace)";
      discardBtn.setAttribute("aria-label", "Discard image");
      discardBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

      const parent = img.parentNode;
      if (parent) {
        parent.insertBefore(figure, img);
        figure.appendChild(img);
        figure.appendChild(discardBtn);
      }
    });
  }, []);

  // Load blog for editing
  useEffect(() => {
    if (!editId) return;
    setLoadingBlog(true);
    (async () => {
      try {
        const data = await api.get<{ success: boolean; data: any }>(
          `/api/blogs/${editId}`
        );
        if (data.success && data.data) {
          const blog = data.data;
          setTitle(blog.title || "");
          setCoverImage(blog.coverImageUrl || "");
          setCoverImagePosition(blog.coverImagePosition || "50% 50%");
          setTags(blog.tags || []);
          setExcerpt(blog.excerpt || "");
          // Set editor content after mount
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = blog.content || "";
              attachDiscardButtonsToExistingImages(editorRef.current);
            }
          }, 100);
        }
      } catch {
        toast.error("Failed to load blog for editing");
        router.push("/blog");
      } finally {
        setLoadingBlog(false);
      }
    })();
  }, [editId, router, attachDiscardButtonsToExistingImages]);

  // Redirect unauthenticated users with redirect query param
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const target =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/blog/write";
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [authLoading, isAuthenticated, router]);

  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    h2: boolean;
    blockquote: boolean;
    pre: boolean;
    insertUnorderedList: boolean;
    insertOrderedList: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    h2: false,
    blockquote: false,
    pre: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const isBold = document.queryCommandState("bold");
      const isItalic = document.queryCommandState("italic");
      const isUnderline = document.queryCommandState("underline");
      const isStrike = document.queryCommandState("strikeThrough");
      const isUl = document.queryCommandState("insertUnorderedList");
      const isOl = document.queryCommandState("insertOrderedList");

      let isH2 = false;
      let isQuote = false;
      let isPre = false;

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current && node !== document.body) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const tag = (node as HTMLElement).tagName?.toLowerCase();
            if (tag === "h2") isH2 = true;
            if (tag === "blockquote") isQuote = true;
            if (tag === "pre") isPre = true;
          }
          node = node.parentNode;
        }
      }

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strikeThrough: isStrike,
        h2: isH2,
        blockquote: isQuote,
        pre: isPre,
        insertUnorderedList: isUl,
        insertOrderedList: isOl,
      });
    } catch {
      // Ignore if document command state query fails
    }
  }, []);

  // Listen to selection changes to update toolbar active states in real time
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (
        sel &&
        editorRef.current &&
        sel.anchorNode &&
        editorRef.current.contains(sel.anchorNode)
      ) {
        updateActiveFormats();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateActiveFormats]);

  const execCommand = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      setTimeout(updateActiveFormats, 10);
    },
    [updateActiveFormats]
  );

  const handleToolbarClick = useCallback(
    (action: ToolbarAction) => {
      editorRef.current?.focus();

      if (action.command === "formatBlock") {
        const blockType = action.arg?.toLowerCase();
        // If clicking h2 when h2 is already active, toggle back to paragraph!
        if (blockType === "h2") {
          if (activeFormats.h2) {
            document.execCommand("formatBlock", false, "<p>");
          } else {
            document.execCommand("formatBlock", false, "<h2>");
          }
        } else if (blockType === "blockquote") {
          if (activeFormats.blockquote) {
            document.execCommand("formatBlock", false, "<p>");
          } else {
            document.execCommand("formatBlock", false, "<blockquote>");
          }
        } else if (blockType === "pre") {
          if (activeFormats.pre) {
            document.execCommand("formatBlock", false, "<p>");
          } else {
            document.execCommand("formatBlock", false, "<pre>");
          }
        }
      } else {
        document.execCommand(action.command, false, action.arg);
      }

      setTimeout(updateActiveFormats, 10);
    },
    [activeFormats, updateActiveFormats]
  );

  const isActionActive = (action: ToolbarAction): boolean => {
    if (action.command === "bold") return activeFormats.bold;
    if (action.command === "italic") return activeFormats.italic;
    if (action.command === "underline") return activeFormats.underline;
    if (action.command === "strikeThrough") return activeFormats.strikeThrough;
    if (action.command === "insertUnorderedList")
      return activeFormats.insertUnorderedList;
    if (action.command === "insertOrderedList")
      return activeFormats.insertOrderedList;
    if (action.command === "formatBlock") {
      if (action.arg === "h2") return activeFormats.h2;
      if (action.arg === "blockquote") return activeFormats.blockquote;
      if (action.arg === "pre") return activeFormats.pre;
    }
    return false;
  };

  const handleLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  }, [execCommand]);

  const discardImage = useCallback(
    (targetEl: HTMLElement) => {
      const figure =
        targetEl.closest<HTMLElement>(".blog-editor-img-wrap") ||
        (targetEl.tagName === "IMG" ? targetEl : null);
      if (!figure) return;

      const img =
        figure.tagName === "IMG"
          ? (figure as HTMLImageElement)
          : figure.querySelector<HTMLImageElement>("img");
      const pendingId =
        figure.getAttribute("data-pending-id") ||
        img?.getAttribute("data-pending-id");

      if (pendingId) {
        pendingContentImagesRef.current.delete(pendingId);
      }

      if (img?.src?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(img.src);
        } catch {
          // Ignore
        }
      }

      const parent = figure.parentElement;
      figure.remove();
      if (
        parent &&
        parent !== editorRef.current &&
        parent.innerHTML.trim() === ""
      ) {
        parent.remove();
      }

      setSelectedImg(null);
      toast.success("Image discarded");
      updateActiveFormats();
    },
    [updateActiveFormats]
  );

  const insertImageToEditor = useCallback(
    (previewUrl: string, trackingId: string, alt: string = "") => {
      editorRef.current?.focus();
      const cleanAlt = alt ? alt.replace(/"/g, "&quot;") : "Blog image";
      const imgHtml = `<figure class="blog-editor-img-wrap" contenteditable="false" data-pending-id="${trackingId}"><img src="${previewUrl}" alt="${cleanAlt}" /><button type="button" class="blog-editor-img-delete-btn" title="Discard image (or press Backspace)" aria-label="Discard image"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></figure><p><br></p>`;

      let inserted = false;
      const sel = window.getSelection();
      if (
        sel &&
        sel.rangeCount > 0 &&
        editorRef.current?.contains(sel.anchorNode)
      ) {
        try {
          inserted = document.execCommand("insertHTML", false, imgHtml);
        } catch {
          inserted = false;
        }
      }

      if (!inserted && editorRef.current) {
        editorRef.current.innerHTML += imgHtml;
      }
      setTimeout(updateActiveFormats, 10);
    },
    [updateActiveFormats]
  );

  const processAndInsertImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPEG, PNG, WebP, etc.)");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Image file size must be under 15MB");
        return;
      }

      setInsertingImage(true);
      const toastId = toast.loading("Compressing image locally...", {
        id: "blog-editor-compress",
      });

      try {
        // ALWAYS use compressor on any kind of uploading!
        const compressed = await compressImage(file, {
          maxSizeMB: 1.0,
          maxWidthOrHeight: 1600,
        });

        const trackingId = `pending-img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        pendingContentImagesRef.current.set(trackingId, compressed.file);

        insertImageToEditor(compressed.previewUrl, trackingId, file.name);

        if (compressed.savedPercentage > 0) {
          toast.success(
            `Image added (compressed by ${compressed.savedPercentage}%). Will upload when saved or published.`,
            { id: toastId }
          );
        } else {
          toast.success(
            "Image added to draft. Will upload when saved or published.",
            { id: toastId }
          );
        }
      } catch (err: any) {
        toast.error("Failed to process image", { id: toastId });
      } finally {
        setInsertingImage(false);
        if (contentImageInputRef.current) {
          contentImageInputRef.current.value = "";
        }
      }
    },
    [insertImageToEditor]
  );

  const handleInsertImageClick = useCallback(() => {
    editorRef.current?.focus();
    contentImageInputRef.current?.click();
  }, []);

  const handleEditorPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            processAndInsertImage(file);
          }
          return;
        }
      }
    },
    [processAndInsertImage]
  );

  const handleEditorDrop = useCallback(
    (e: React.DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          processAndInsertImage(file);
          return;
        }
      }
    },
    [processAndInsertImage]
  );

  const handleEditorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;

      // 1. Red cross discard button clicked
      const discardBtn = target.closest(".blog-editor-img-delete-btn");
      if (discardBtn) {
        e.preventDefault();
        e.stopPropagation();
        discardImage(discardBtn as HTMLElement);
        return;
      }

      // 2. Image or figure selected
      const figure = target.closest<HTMLElement>(".blog-editor-img-wrap");
      const img = target.closest<HTMLImageElement>("img");
      const imageTarget = figure || img;

      editorRef.current
        ?.querySelectorAll(".blog-editor-img-wrap.is-selected")
        .forEach((el) => el.classList.remove("is-selected"));

      if (imageTarget && editorRef.current?.contains(imageTarget)) {
        imageTarget.classList.add("is-selected");
        setSelectedImg(imageTarget);
      } else {
        setSelectedImg(null);
      }
    },
    [discardImage]
  );

  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedImg && editorRef.current?.contains(selectedImg)) {
          e.preventDefault();
          e.stopPropagation();
          discardImage(selectedImg);
          return;
        }

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const startNode = range.startContainer;
          const figure =
            startNode instanceof HTMLElement
              ? startNode.closest<HTMLElement>(".blog-editor-img-wrap")
              : startNode.parentElement?.closest<HTMLElement>(".blog-editor-img-wrap");
          if (figure && editorRef.current?.contains(figure)) {
            e.preventDefault();
            e.stopPropagation();
            discardImage(figure);
            return;
          }
        }
      }
    },
    [selectedImg, discardImage]
  );

  const toolbarActions: (ToolbarAction | "separator")[] = [
    { icon: <Bold size={16} />, command: "bold", title: "Bold (Ctrl+B)" },
    {
      icon: <Italic size={16} />,
      command: "italic",
      title: "Italic (Ctrl+I)",
    },
    {
      icon: <Underline size={16} />,
      command: "underline",
      title: "Underline (Ctrl+U)",
    },
    {
      icon: <Strikethrough size={16} />,
      command: "strikeThrough",
      title: "Strikethrough",
    },
    "separator",
    {
      icon: <Heading2 size={16} />,
      command: "formatBlock",
      arg: "h2",
      title: "Heading 2 (click again to toggle to paragraph)",
    },
    {
      icon: <Quote size={16} />,
      command: "formatBlock",
      arg: "blockquote",
      title: "Blockquote",
    },
    {
      icon: <Code size={16} />,
      command: "formatBlock",
      arg: "pre",
      title: "Code Block",
    },
    "separator",
    {
      icon: <List size={16} />,
      command: "insertUnorderedList",
      title: "Bullet List",
    },
    {
      icon: <ListOrdered size={16} />,
      command: "insertOrderedList",
      title: "Numbered List",
    },
    "separator",
    { icon: <Undo size={16} />, command: "undo", title: "Undo" },
    { icon: <Redo size={16} />, command: "redo", title: "Redo" },
  ];

  const handleSubmit = async (publish: boolean) => {
    if (!coverImage || !coverImage.trim()) {
      toast.error("Cover photo is required");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a blog title");
      return;
    }

    const content = editorRef.current?.innerHTML || "";
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (!textContent && (!content.trim() || content === "<br>")) {
      toast.error("Please write some content");
      return;
    }

    // Auto-generate excerpt from content if not provided
    const autoExcerpt =
      excerpt.trim() ||
      (textContent.length > 160 ? textContent.slice(0, 160).trim() + "..." : textContent) ||
      title.trim();

    setSaving(true);

    const base = API_BASE_URL;
    const uploadUrl = base.endsWith("/api")
      ? `${base}/upload/image`
      : `${base}/api/upload/image`;

    // 1. Upload Cover Image if pending (MUST use compressor!)
    let finalCoverUrl = coverImage.trim();
    if (pendingCoverFile) {
      const uploadToast = toast.loading("Compressing & uploading cover photo...", {
        id: "cover-upload-publish",
      });
      try {
        const compressedCover = await compressImage(pendingCoverFile, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 2048,
        });

        const fd = new FormData();
        fd.append("image", compressedCover.file);
        fd.append("folder", "blog-covers");

        const res = await axios.post(
          `${uploadUrl}?folder=blog-covers`,
          fd,
          { withCredentials: true }
        );
        finalCoverUrl = res.data.url || res.data.secure_url;
        setCoverImage(finalCoverUrl);
        setPendingCoverFile(null);
        toast.success("Cover photo uploaded!", { id: "cover-upload-publish" });
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "Failed to upload cover photo",
          { id: "cover-upload-publish" }
        );
        setSaving(false);
        return;
      }
    }

    // 2. Upload Content Images that are currently still in the editor
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editorRef.current?.innerHTML || "";

    // Remove all editor discard buttons
    tempDiv.querySelectorAll(".blog-editor-img-delete-btn").forEach((btn) => btn.remove());

    const contentImgs = Array.from(tempDiv.querySelectorAll<HTMLImageElement>("img"));
    const pendingImgs = contentImgs.filter(
      (img) =>
        img.hasAttribute("data-pending-id") ||
        img.src.startsWith("blob:") ||
        Boolean(img.closest("[data-pending-id]"))
    );

    if (pendingImgs.length > 0) {
      const uploadToastId = toast.loading(
        `Compressing & uploading ${pendingImgs.length} content image${pendingImgs.length > 1 ? "s" : ""} to Cloudinary...`,
        { id: "content-images-upload" }
      );

      try {
        for (let i = 0; i < pendingImgs.length; i++) {
          const img = pendingImgs[i];
          const figure = img.closest<HTMLElement>(".blog-editor-img-wrap");
          const pendingId =
            img.getAttribute("data-pending-id") ||
            figure?.getAttribute("data-pending-id") ||
            "";

          let fileToUpload = pendingId ? pendingContentImagesRef.current.get(pendingId) : null;

          if (!fileToUpload && img.src.startsWith("blob:")) {
            try {
              const blobRes = await fetch(img.src);
              const blob = await blobRes.blob();
              fileToUpload = new File([blob], `blog-image-${i + 1}.webp`, {
                type: blob.type || "image/webp",
              });
            } catch {
              // Ignore fetch error
            }
          }

          if (fileToUpload) {
            // ALWAYS use compressor on any kind of uploading!
            const compressed = await compressImage(fileToUpload, {
              maxSizeMB: 1.0,
              maxWidthOrHeight: 1600,
            });

            const fd = new FormData();
            fd.append("image", compressed.file);
            fd.append("folder", "blog-content");

            const uploadRes = await axios.post(
              `${uploadUrl}?folder=blog-content`,
              fd,
              { withCredentials: true }
            );

            const uploadedUrl = uploadRes.data.url || uploadRes.data.secure_url;
            if (uploadedUrl) {
              img.src = uploadedUrl;
            }
          }

          img.removeAttribute("data-pending-id");
          figure?.removeAttribute("data-pending-id");
        }

        toast.success("Content images uploaded successfully!", { id: "content-images-upload" });
      } catch (uploadErr: any) {
        toast.error(
          uploadErr?.response?.data?.message ||
            uploadErr?.message ||
            "Failed to upload content images",
          { id: "content-images-upload" }
        );
        setSaving(false);
        return;
      }
    }

    // 3. Clean up figures for final HTML storage
    tempDiv.querySelectorAll(".blog-editor-img-wrap").forEach((fig) => {
      fig.removeAttribute("contenteditable");
      fig.classList.remove("is-selected");
    });

    const finalContent = tempDiv.innerHTML;

    const payload = {
      title: title.trim(),
      content: finalContent,
      excerpt: autoExcerpt,
      coverImageUrl: finalCoverUrl,
      coverImagePosition,
      tags,
      isPublished: publish,
      ...(publish ? { publishedAt: new Date().toISOString() } : {}),
    };
    try {
      if (editId) {
        await api.patch(`/api/blogs/${editId}`, payload);
      } else {
        await api.post("/api/blogs", payload);
      }

      if (publish) {
        toast.success(editId ? "Blog updated & published!" : "Blog published successfully!");
        router.push("/blog");
      } else {
        toast.success(editId ? "Draft updated successfully!" : "Draft saved successfully!");
        router.push("/blog?tab=my");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingBlog) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="py-6 md:py-10">
      <div className="w-full max-w-[760px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/blog")}
            className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-text-primary transition"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            {editId ? "Edit Blog Post" : "Write a New Blog"}
          </h1>
        </div>

        {/* Cover Image */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-text-primary mb-2">
            Cover Photo <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <BlogCoverUploader
            value={coverImage}
            position={coverImagePosition}
            onImageSelected={(previewUrl, file) => {
              setCoverImage(previewUrl);
              setPendingCoverFile(file);
            }}
            onPositionChange={(pos) => setCoverImagePosition(pos)}
            onRemove={() => {
              setCoverImage("");
              setPendingCoverFile(null);
              setCoverImagePosition("50% 50%");
            }}
            disabled={saving}
          />
        </div>

        {/* Title */}
        <div className="mb-6">
          <label
            htmlFor="blog-title"
            className="block text-sm font-bold text-text-primary mb-2"
          >
            Title <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <input
            id="blog-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your blog title..."
            className="w-full px-4 py-3 text-xl sm:text-2xl font-bold bg-surface-elevated border-2 border-border-default rounded-xl text-text-primary placeholder:text-sm sm:placeholder:text-base placeholder:font-normal placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition"
          />
        </div>

        {/* Excerpt */}
        <div className="mb-6">
          <label
            htmlFor="blog-excerpt"
            className="block text-sm font-bold text-text-primary mb-2"
          >
            Excerpt{" "}
            <span className="font-normal text-text-tertiary">
              (optional — auto-generated if left blank)
            </span>
          </label>
          <input
            id="blog-excerpt"
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary of your blog post..."
            className="w-full px-4 py-2.5 text-sm bg-surface-elevated border-2 border-border-default rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition"
          />
        </div>

        {/* Rich Text Editor */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-text-primary mb-2">
            Content <span className="text-red-500 font-bold ml-0.5">*</span>
          </label>
          <div className="border-2 border-border-default rounded-xl overflow-hidden bg-surface-elevated focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/20 transition">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 px-2.5 py-2 bg-surface-secondary border-b border-border-default">
              {toolbarActions.map((action, i) => {
                if (action === "separator") {
                  return (
                    <div
                      key={`sep-${i}`}
                      className="w-px h-6 bg-border-default mx-1"
                    />
                  );
                }
                const active = isActionActive(action);
                return (
                  <button
                    key={action.command + (action.arg || "")}
                    type="button"
                    title={action.title}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleToolbarClick(action);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${
                      active
                        ? "bg-accent-primary !text-accent-primary-text font-bold border-text-primary dark:border-border-default shadow-[2px_2px_0px_0px_var(--text-primary)] dark:shadow-[2px_2px_0px_0px_var(--accent-primary-hover)]"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-default"
                    }`}
                  >
                    {action.icon}
                  </button>
                );
              })}
              {/* Link button (special) */}
              <button
                type="button"
                title="Insert Link"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleLink();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-default active:bg-accent-primary-light transition-colors"
              >
                <LinkIcon size={16} />
              </button>

              {/* Image button (special) */}
              <button
                type="button"
                title="Insert Image (Upload or Paste)"
                disabled={insertingImage}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleInsertImageClick();
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-elevated hover:border-border-default active:bg-accent-primary-light transition-colors ${
                  insertingImage ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {insertingImage ? (
                  <Loader2 size={16} className="animate-spin text-accent-primary" />
                ) : (
                  <ImageIcon size={16} />
                )}
              </button>
            </div>

            {/* Hidden image input for blog content editor */}
            <input
              ref={contentImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processAndInsertImage(file);
              }}
            />

            {/* Editable Area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="min-h-[350px] sm:min-h-[450px] px-4 sm:px-6 py-4 text-text-primary text-base leading-relaxed outline-none prose-editor"
              data-placeholder="Start writing your blog post... (drag & drop or paste images here)"
              onKeyUp={updateActiveFormats}
              onMouseUp={updateActiveFormats}
              onClick={handleEditorClick}
              onKeyDown={handleEditorKeyDown}
              onPaste={handleEditorPaste}
              onDrop={handleEditorDrop}
              onDragOver={(e) => e.preventDefault()}
              onFocus={(e) => {
                updateActiveFormats();
                const el = e.currentTarget;
                if (el.textContent === "") {
                  el.classList.remove("is-empty");
                }
              }}
              onInput={updateActiveFormats}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-text-primary mb-2">
            Tags
          </label>
          <TagInput
            value={tags}
            onChange={setTags}
            placeholder="Type a tag and press space or comma..."
            maxTags={10}
            tagsBelow={true}
          />
          <p className="text-xs text-text-tertiary mt-1.5">
            Separate tags with space or comma. Max 10 tags.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border-default">
          <Button
            onClick={() => handleSubmit(true)}
            variant="primary"
            size="lg"
            disabled={saving}
            icon={
              saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )
            }
          >
            {editId ? "Update & Publish" : "Publish"}
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            variant="secondary"
            size="lg"
            disabled={saving}
            icon={<Save size={16} />}
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => router.push("/blog")}
            variant="ghost"
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Editor styles */}
      <style jsx global>{`
        .prose-editor:empty::before {
          content: attr(data-placeholder);
          color: var(--text-tertiary);
          pointer-events: none;
        }
        .prose-editor h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        .prose-editor h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        .prose-editor p {
          margin-bottom: 0.75rem;
        }
        .prose-editor ul,
        .prose-editor ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        .prose-editor ul {
          list-style: disc;
        }
        .prose-editor ol {
          list-style: decimal;
        }
        .prose-editor li {
          margin-bottom: 0.25rem;
        }
        .prose-editor blockquote {
          border-left: 4px solid var(--accent-primary);
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          background: var(--surface-secondary);
          border-radius: 0 8px 8px 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        .prose-editor pre {
          background: var(--surface-inverse);
          color: var(--text-inverse);
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          overflow-x: auto;
          font-family: monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .prose-editor a {
          color: var(--accent-primary-hover);
          text-decoration: underline;
        }
        .prose-editor img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .prose-editor .blog-editor-img-wrap {
          position: relative;
          display: inline-block;
          max-width: 100%;
          margin: 1.25rem 0;
          user-select: none;
          vertical-align: top;
        }
        .prose-editor .blog-editor-img-wrap img {
          margin: 0 !important;
          display: block;
          max-width: 100%;
          max-height: 520px;
          object-fit: contain;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .prose-editor .blog-editor-img-wrap:hover img,
        .prose-editor .blog-editor-img-wrap.is-selected img {
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 0 2px var(--accent-primary);
        }
        .prose-editor .blog-editor-img-delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background-color: #ef4444;
          color: #ffffff;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
          transition: transform 0.15s ease, background-color 0.15s ease;
          z-index: 20;
          outline: none;
          padding: 0;
        }
        .prose-editor .blog-editor-img-delete-btn:hover {
          background-color: #dc2626;
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
}

export default function BlogWritePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-accent-primary" />
        </div>
      }
    >
      <BlogWriteContent />
    </Suspense>
  );
}

