"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Eye, Globe, Lock,
  RefreshCw, FileCode, ExternalLink,
} from "lucide-react";
import ImageUpload from "@/components/ui/shared/ImageUpload";

// ── Types ──────────────────────────────────────────────────────────────────
interface CustomPage {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;          // raw HTML
  isPublished: boolean;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const API = () => `${process.env.NEXT_PUBLIC_API_URL}/api/custom-pages`;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Empty form ─────────────────────────────────────────────────────────────
const EMPTY = {
  title: "", slug: "", description: "",
  content: "", isPublished: false, coverImageUrl: "",
};

// ── Sub-components (module scope — no focus-loss) ──────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const INPUT = "w-full px-3 py-2.5 rounded-xl border border-border-default bg-surface-elevated text-text-primary focus:ring-2 focus:ring-accent-primary outline-none text-sm";

// ── Main component ─────────────────────────────────────────────────────────
export default function PageEditorPage() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null); // null = new
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Fetch all pages ──────────────────────────────────────────────────────
  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API(), { withCredentials: true });
      setPages(res.data.data || []);
    } catch {
      setError("Failed to load pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  // ── Open form for new page ───────────────────────────────────────────────
  const openNew = () => {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
    setShowPreview(false);
    setError(null);
  };

  // ── Open form to edit existing page ─────────────────────────────────────
  const openEdit = (page: CustomPage) => {
    setForm({
      title: page.title,
      slug: page.slug,
      description: page.description || "",
      content: page.content,
      isPublished: page.isPublished,
      coverImageUrl: page.coverImageUrl || "",
    });
    setEditingId(page._id);
    setShowForm(true);
    setShowPreview(false);
    setError(null);
  };

  // ── Save (create or update) ──────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await axios.patch(`${API()}/${editingId}`, form, { withCredentials: true });
      } else {
        await axios.post(API(), form, { withCredentials: true });
      }
      await fetchPages();
      setShowForm(false);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || "Save failed." : "Error.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API()}/${id}`, { withCredentials: true });
      setPages((prev) => prev.filter((p) => p._id !== id));
      setDeleteConfirm(null);
    } catch {
      alert("Delete failed.");
    }
  };

  // ── Toggle publish ───────────────────────────────────────────────────────
  const togglePublish = async (page: CustomPage) => {
    try {
      await axios.patch(`${API()}/${page._id}`, { isPublished: !page.isPublished }, { withCredentials: true });
      setPages((prev) => prev.map((p) => p._id === page._id ? { ...p, isPublished: !p.isPublished } : p));
    } catch { alert("Failed to update."); }
  };

  // ── Field setter ─────────────────────────────────────────────────────────
  const set = (k: keyof typeof EMPTY, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // ── Auto-slug from title ─────────────────────────────────────────────────
  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!form.slug || form.slug === slugify(form.title)) {
      set("slug", slugify(v));
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary flex items-center gap-2">
            <FileCode className="text-accent-primary" size={28} /> Page Editor
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Create and manage custom pages. Each page is served at <code className="bg-surface-secondary px-1 rounded">/pages/[slug]</code>
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-text-primary hover:bg-surface-inverse text-surface-primary border border-border-default rounded-xl font-semibold text-sm transition shadow-sm"
        >
          <Plus size={16} /> New Page
        </button>
      </div>

      {/* ── Editor form ── */}
      {showForm && (
        <div className="bg-surface-elevated rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] overflow-hidden">
          {/* Form header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-surface-secondary">
            <h3 className="font-semibold text-text-primary text-sm">
              {editingId ? "Edit Page" : "New Page"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-accent-primary hover:underline font-semibold"
              >
                <Eye size={13} /> {showPreview ? "Hide Preview" : "Preview HTML"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-surface-secondary transition"
              >
                Cancel
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-5">
            {error && (
              <div className="p-3 bg-accent-error text-surface-elevated rounded-xl font-semibold text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Page Title" hint="Shown in browser tab and page heading">
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. About Us"
                  className={INPUT}
                />
              </Field>
              <Field label="URL Slug" hint={`Page will be at /pages/${form.slug || "your-slug"}`}>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  placeholder="about-us"
                  className={INPUT + " font-mono"}
                />
              </Field>
            </div>

            <Field label="Description" hint="Optional — shown in meta tags and page subtitle">
              <input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief description of this page"
                className={INPUT}
              />
            </Field>

            <Field label="Cover Image">
              <ImageUpload
                value={form.coverImageUrl}
                onChange={(url) => set("coverImageUrl", url)}
                folder="pages"
                hint="Optional hero image shown at the top of the page"
              />
            </Field>

            <Field label="Page Content (HTML)" hint="Full HTML for the page body. Use any HTML, inline styles, or Tailwind classes.">
              <textarea
                required
                rows={16}
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                placeholder={`<section class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-semibold">Page Title</h1>
  <p class="mt-4 text-gray-600">Your content here...</p>
</section>`}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-900 text-green-400 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                spellCheck={false}
              />
            </Field>

            {showPreview && form.content && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 font-medium uppercase tracking-wide">
                  HTML Preview
                </div>
                <div
                  className="p-5 bg-white dark:bg-slate-900 prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border-default">
              <label className="flex items-center gap-2 text-sm text-text-secondary font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => set("isPublished", e.target.checked)}
                  className="rounded border-border-default text-accent-primary focus:ring-accent-primary"
                />
                Publish immediately
              </label>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent-success hover:bg-accent-success-light text-surface-elevated hover:text-accent-success rounded-xl font-semibold text-sm transition disabled:opacity-60"
              >
                {saving ? "Saving…" : editingId ? "Update Page" : "Create Page"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Pages list ── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : pages.length === 0 && !showForm ? (
        <div className="text-center py-20 bg-surface-elevated rounded-2xl border border-dashed border-border-default">
          <FileCode className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-primary font-semibold">No custom pages yet</p>
          <p className="text-sm text-text-secondary mt-1">Click "New Page" to create your first page</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page._id}
              className="bg-surface-elevated rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-text-primary truncate">{page.title}</h4>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${page.isPublished
                      ? "bg-accent-success text-surface-elevated"
                      : "bg-surface-secondary text-text-secondary"
                    }`}>
                    {page.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-text-secondary bg-surface-secondary px-2 py-0.5 rounded font-semibold">
                    /pages/{page.slug}
                  </code>
                  {page.description && (
                    <span className="text-xs text-text-secondary truncate hidden sm:inline">
                      — {page.description}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Updated {new Date(page.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* View live */}
                {page.isPublished && (
                  <Link
                    href={`/pages/${page.slug}`}
                    target="_blank"
                    className="p-2 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-surface-secondary transition"
                    title="View live page"
                  >
                    <ExternalLink size={16} />
                  </Link>
                )}
                {/* Toggle publish */}
                <button
                  onClick={() => togglePublish(page)}
                  className={`p-2 rounded-lg transition ${page.isPublished
                      ? "text-accent-success hover:bg-surface-secondary"
                      : "text-text-secondary hover:text-accent-success hover:bg-surface-secondary"
                    }`}
                  title={page.isPublished ? "Unpublish" : "Publish"}
                >
                  {page.isPublished ? <Globe size={16} /> : <Lock size={16} />}
                </button>
                {/* Edit */}
                <button
                  onClick={() => openEdit(page)}
                  className="p-2 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-surface-secondary transition"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                {/* Delete */}
                {deleteConfirm === page._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(page._id)}
                      className="px-2 py-1 text-xs bg-accent-error hover:bg-red-700 text-surface-elevated rounded-lg font-semibold transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(page._id)}
                    className="p-2 rounded-lg text-text-secondary hover:text-accent-error hover:bg-surface-secondary transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh */}
      {!loading && pages.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={fetchPages}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      )}
    </div>
  );
}
