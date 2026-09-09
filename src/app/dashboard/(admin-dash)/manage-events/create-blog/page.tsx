"use client";
import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Eye, EyeOff, Tag, AlignLeft, Type } from "lucide-react";
import ImageUpload from "@/components/ui/shared/ImageUpload";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default function CreateBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "",
    coverImageUrl: "", category: "General", tags: "", isPublished: false,
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  // Auto-generate slug from title
  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!form.slug || form.slug === form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      set("slug", v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/blogs`, {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }, { withCredentials: true });
      router.push("/dashboard/manage-events");
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || "Failed." : "Error.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/manage-events" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Write Blog Post</h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="hidden sm:inline">Publish</span>
          </label>
          <button type="submit" form="blog-form" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60">
            <Save size={15} /> {saving ? "Saving…" : "Save Post"}
          </button>
        </div>
      </div>

      <form id="blog-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-5">
          <Field label="Title" required>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input required placeholder="Post title…" value={form.title} onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Slug" hint="Auto-generated from title">
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)}
                placeholder="post-slug"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono" />
            </Field>
            <Field label="Category">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input value={form.category} onChange={(e) => set("category", e.target.value)}
                  placeholder="e.g. Tech, Events, Announcements"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
            </Field>
          </div>

          <Field label="Excerpt" required hint="Short summary shown in blog cards">
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <textarea required rows={2} placeholder="Brief summary of the post…" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-y" />
            </div>
          </Field>

          <Field label="Tags" hint="Comma-separated">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)}
                placeholder="AI, programming, workshop"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            </div>
          </Field>

          {/* Cover image */}
          <Field label="Cover Image">
            <ImageUpload
              value={form.coverImageUrl}
              onChange={(url) => set("coverImageUrl", url)}
              folder="blogs"
              hint="Recommended: 16:9, min 1200×630px"
            />
          </Field>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Content (HTML)</h2>
            <button type="button" onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              {showPreview ? <><EyeOff size={13} /> Hide Preview</> : <><Eye size={13} /> Show Preview</>}
            </button>
          </div>
          <textarea required rows={16} placeholder="<h2>Introduction</h2><p>Write your blog post here…</p>"
            value={form.content} onChange={(e) => set("content", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-900 text-green-400 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
            spellCheck={false} />
          {showPreview && form.content && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800">
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Preview</p>
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: form.content }} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
