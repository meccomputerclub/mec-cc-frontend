"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
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
  }, [editId, router]);

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

  const insertImageToEditor = useCallback(
    (url: string, alt: string = "") => {
      editorRef.current?.focus();
      const cleanAlt = alt ? alt.replace(/"/g, "&quot;") : "Blog image";
      const imgHtml = `<p><img src="${url}" alt="${cleanAlt}" style="max-width: 100%; border-radius: 8px; margin: 1rem 0;" /></p><p><br></p>`;

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

  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Image file size must be under 15MB");
        return;
      }

      setInsertingImage(true);
      const toastId = toast.loading("Uploading image to Cloudinary...", {
        id: "blog-editor-upload",
      });
      try {
        const base = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        ).replace(/\/+$/, "");
        const uploadUrl = base.endsWith("/api")
          ? `${base}/upload/image`
          : `${base}/api/upload/image`;
        const compressed = await compressImage(file, {
          maxSizeMB: 1.0,
          maxWidthOrHeight: 1600,
        });

        const fd = new FormData();
        fd.append("image", compressed.file);
        fd.append("folder", "blog-content");

        const res = await axios.post(
          `${uploadUrl}?folder=blog-content`,
          fd,
          { withCredentials: true }
        );
        const url = res.data.url || res.data.secure_url;
        if (url) {
          insertImageToEditor(url, file.name);
          toast.success("Image inserted into blog post!", { id: toastId });
        } else {
          throw new Error("No image URL returned from server");
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to upload image";
        toast.error(msg, { id: toastId });
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
            uploadAndInsertImage(file);
          }
          return;
        }
      }
    },
    [uploadAndInsertImage]
  );

  const handleEditorDrop = useCallback(
    (e: React.DragEvent) => {
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          uploadAndInsertImage(file);
          return;
        }
      }
    },
    [uploadAndInsertImage]
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

    // If user has a pending local file, upload to Cloudinary now
    let finalCoverUrl = coverImage.trim();
    if (pendingCoverFile) {
      const uploadToast = toast.loading("Uploading cover photo to Cloudinary...", {
        id: "cover-upload-publish",
      });
      try {
        const base = (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        ).replace(/\/+$/, "");
        const uploadUrl = base.endsWith("/api")
          ? `${base}/upload/image`
          : `${base}/api/upload/image`;
        const fd = new FormData();
        fd.append("image", pendingCoverFile);
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

    const payload = {
      title: title.trim(),
      content,
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
                if (file) uploadAndInsertImage(file);
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

