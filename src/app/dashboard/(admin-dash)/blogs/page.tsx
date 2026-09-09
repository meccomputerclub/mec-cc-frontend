"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import FilterSelect, { FilterOption } from "@/app/dashboard/components/FilterSelect";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Heart,
  Calendar,
  User,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  X,
  Sparkles,
  Tag,
  SlidersHorizontal,
  Star,
} from "lucide-react";

export interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  coverImagePosition?: string;
  author?: {
    _id?: string;
    fullName?: string;
    imageUrl?: string;
    email?: string;
  };
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  likes?: string[];
  likesCount: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Categories" },
  { value: "General", label: "General" },
  { value: "Programming", label: "Programming" },
  { value: "Competitive Programming", label: "CP Arena" },
  { value: "Web Development", label: "Web Development" },
  { value: "Machine Learning", label: "AI & ML" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Club News", label: "Club News" },
  { value: "Events", label: "Events" },
  { value: "Career", label: "Career & Industry" },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "published", label: "Published Only" },
  { value: "draft", label: "Drafts Only" },
  { value: "featured", label: "Featured (Home) Only" },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: "newest", label: "Newest First" },
  { value: "views", label: "Most Viewed" },
  { value: "likes", label: "Most Liked" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Title (A-Z)" },
];

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Modals & Action states
  const [previewBlog, setPreviewBlog] = useState<BlogItem | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<BlogItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);

  // Fetch all blogs (including unpublished/drafts)
  const fetchBlogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.get<{ data: BlogItem[] }>("/api/blogs?all=true");
      if (res && res.data) {
        setBlogs(res.data);
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to load blogs";
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Handle instant toggle published status
  const handleTogglePublish = async (blog: BlogItem) => {
    const nextStatus = !blog.isPublished;
    setTogglingId(blog._id);

    try {
      const res = await api.patch<{ data: BlogItem }>(`/api/blogs/${blog._id}`, {
        isPublished: nextStatus,
        publishedAt: nextStatus ? (blog.publishedAt || new Date().toISOString()) : blog.publishedAt,
      });

      if (res && res.data) {
        setBlogs((prev) =>
          prev.map((b) => (b._id === blog._id ? { ...b, ...res.data } : b))
        );
        toast.success(
          nextStatus
            ? `"${blog.title}" is now published!`
            : `"${blog.title}" moved to drafts.`
        );
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to update blog status";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle instant toggle featured status (Max 3 on Home)
  const handleToggleFeatured = async (blog: BlogItem) => {
    const nextFeatured = !blog.featured;

    // If attempting to feature, verify max 3 rule
    if (nextFeatured) {
      const currentFeaturedCount = blogs.filter((b) => b.featured).length;
      if (currentFeaturedCount >= 3) {
        toast.error("Maximum 3 blogs can be featured on the Home page. Please unfeature an existing one first.");
        return;
      }
    }

    setTogglingFeaturedId(blog._id);

    // Optimistic UI update
    setBlogs((prev) =>
      prev.map((b) => (b._id === blog._id ? { ...b, featured: nextFeatured } : b))
    );
    if (previewBlog && previewBlog._id === blog._id) {
      setPreviewBlog((prev) => (prev ? { ...prev, featured: nextFeatured } : null));
    }

    try {
      const res = await api.patch<{ data: BlogItem; message?: string }>(`/api/blogs/${blog._id}/featured`, {
        featured: nextFeatured,
      });

      if (res && res.data) {
        setBlogs((prev) =>
          prev.map((b) => (b._id === blog._id ? { ...b, ...res.data } : b))
        );
        if (previewBlog && previewBlog._id === blog._id) {
          setPreviewBlog((prev) => (prev ? { ...prev, ...res.data } : null));
        }
      }
      toast.success(
        nextFeatured
          ? `"${blog.title}" is now featured on the Home page!`
          : `"${blog.title}" removed from Home featured.`
      );
    } catch (err: any) {
      // Revert optimistic update
      setBlogs((prev) =>
        prev.map((b) => (b._id === blog._id ? { ...b, featured: blog.featured } : b))
      );
      if (previewBlog && previewBlog._id === blog._id) {
        setPreviewBlog((prev) => (prev ? { ...prev, featured: blog.featured } : null));
      }
      const msg = err instanceof ApiError ? err.message : "Failed to update featured status";
      toast.error(msg);
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    setDeleting(true);

    try {
      await api.delete(`/api/blogs/${blogToDelete._id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== blogToDelete._id));
      toast.success(`Deleted article "${blogToDelete.title}"`);
      setBlogToDelete(null);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete blog";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.isPublished).length;
    const drafts = total - published;
    const featured = blogs.filter((b) => b.featured).length;
    const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);
    const totalLikes = blogs.reduce((acc, b) => acc + (b.likesCount || b.likes?.length || 0), 0);

    return { total, published, drafts, featured, totalViews, totalLikes };
  }, [blogs]);

  // Filtered & Sorted blogs
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((blog) => {
        // Status filter
        if (statusFilter === "published" && !blog.isPublished) return false;
        if (statusFilter === "draft" && blog.isPublished) return false;
        if (statusFilter === "featured" && !blog.featured) return false;

        // Category filter
        if (categoryFilter !== "all" && blog.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }

        // Search Query filter (matches title, excerpt, author name, or tags)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const inTitle = blog.title.toLowerCase().includes(q);
          const inExcerpt = (blog.excerpt || "").toLowerCase().includes(q);
          const inAuthor = (blog.author?.fullName || "").toLowerCase().includes(q);
          const inTags = (blog.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!inTitle && !inExcerpt && !inAuthor && !inTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "views") return (b.views || 0) - (a.views || 0);
        if (sortOption === "likes") return (b.likesCount || 0) - (a.likesCount || 0);
        if (sortOption === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortOption === "title") return a.title.localeCompare(b.title);
        // Default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [blogs, statusFilter, categoryFilter, searchQuery, sortOption]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent-primary-light flex items-center justify-center text-text-primary border border-border-default">
              <BookOpen size={18} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Blog & Publications Hub
            </h1>
          </div>
          <p className="text-sm text-text-secondary">
            Manage, moderate, review, and publish technical articles, tutorials, and club announcements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => fetchBlogs(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border-2 border-border-brutalist dark:border-border-default bg-surface-elevated hover:bg-surface-secondary text-text-primary transition shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--border-default)] hover:-translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0 disabled:opacity-60"
            title="Refresh list"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-accent-primary" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Button href="/blog/write" size="sm" className="shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--accent-primary)]">
            <Plus size={16} className="mr-1" />
            Write New Article
          </Button>
        </div>
      </div>

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-surface-elevated border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--border-default)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Articles</span>
            <FileText size={16} className="text-accent-primary" />
          </div>
          <div className="text-2xl font-extrabold text-text-primary font-mono">{metrics.total}</div>
          <div className="text-[11px] text-text-secondary mt-1">All entries in archive</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--border-default)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Published</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{metrics.published}</div>
          <div className="text-[11px] text-text-secondary mt-1">Live on public website</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--border-default)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Drafts</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{metrics.drafts}</div>
          <div className="text-[11px] text-text-secondary mt-1">Pending review/draft</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--border-default)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Home Featured</span>
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {metrics.featured}{" "}
            <span className="text-xs font-sans text-text-secondary font-normal">/ 3 max</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Active on home page</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--border-default)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Views</span>
            <Eye size={16} className="text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-text-primary font-mono">{metrics.totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-text-secondary mt-1">Reader engagements</div>
        </div>

        <div className="p-4 rounded-xl bg-surface-elevated border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--border-default)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Likes</span>
            <Heart size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">{metrics.totalLikes.toLocaleString()}</div>
          <div className="text-[11px] text-text-secondary mt-1">Community reactions</div>
        </div>
      </div>

      {/* ── Filters & Search Toolbar (Using compliant FilterSelect) ── */}
      <div className="p-4 rounded-xl bg-surface-elevated border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--border-default)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search by title, excerpt, author, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-surface-primary border border-border-default rounded-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Custom FilterSelect Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs font-semibold text-text-secondary shrink-0 mr-1">
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filters:</span>
          </div>

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            placeholder="Status"
          />

          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={CATEGORY_OPTIONS}
            placeholder="Category"
          />

          <FilterSelect
            value={sortOption}
            onChange={setSortOption}
            options={SORT_OPTIONS}
            placeholder="Sort by"
          />
        </div>
      </div>

      {/* ── Articles List / Table ── */}
      <div className="rounded-xl border-2 border-border-brutalist dark:border-border-default bg-surface-elevated shadow-[4px_4px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_var(--border-default)] overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-secondary">
            <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-mono text-xs">Loading publications repository...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-secondary border border-border-default flex items-center justify-center text-text-tertiary mx-auto mb-3">
              <BookOpen size={24} />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-1">No articles found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mb-4">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                ? "No publications matched your current filter criteria. Try resetting your search or filters."
                : "No articles have been created yet. Be the first to draft a technical post!"}
            </p>
            {searchQuery || statusFilter !== "all" || categoryFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-surface-secondary text-text-primary border border-border-default hover:bg-surface-primary transition"
              >
                Clear all filters
              </button>
            ) : (
              <Button href="/blog/write" size="sm">
                <Plus size={14} className="mr-1" />
                Write First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-secondary/70 border-b-2 border-border-brutalist dark:border-border-default text-text-secondary font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Home Featured</th>
                  <th className="py-3 px-4 text-center">Stats</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filteredBlogs.map((blog) => {
                  const isToggling = togglingId === blog._id;
                  const isTogglingFeatured = togglingFeaturedId === blog._id;
                  return (
                    <tr
                      key={blog._id}
                      className="hover:bg-accent-primary-light/40 transition-colors group"
                    >
                      {/* Title & Cover */}
                      <td className="py-3.5 px-4 max-w-[320px]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-md overflow-hidden bg-surface-secondary border border-border-default shrink-0 relative">
                            {blog.coverImageUrl ? (
                              <Image
                                src={blog.coverImageUrl}
                                alt={blog.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                                style={{ objectPosition: blog.coverImagePosition || "50% 50%" }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                                <BookOpen size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => setPreviewBlog(blog)}
                              className="font-bold text-text-primary hover:text-accent-primary transition-colors text-left line-clamp-1 block text-sm group-hover:underline"
                              title={blog.title}
                            >
                              {blog.title}
                            </button>
                            <span className="text-[11px] text-text-secondary line-clamp-1 font-sans">
                              {blog.excerpt || "No excerpt provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-secondary border border-border-default shrink-0 flex items-center justify-center font-mono text-[10px] font-bold text-text-primary">
                            {blog.author?.imageUrl ? (
                              <Image
                                src={blog.author.imageUrl}
                                alt={blog.author?.fullName || "Author"}
                                width={24}
                                height={24}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              blog.author?.fullName?.[0]?.toUpperCase() || <User size={12} />
                            )}
                          </div>
                          <span className="font-semibold text-text-primary text-xs">
                            {blog.author?.fullName || "Club Member"}
                          </span>
                        </div>
                      </td>

                      {/* Category & Tags */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-surface-secondary text-text-primary border border-border-default">
                            {blog.category || "General"}
                          </span>
                          {blog.tags && blog.tags.length > 0 && (
                            <span className="text-[10px] text-text-secondary font-mono">
                              #{blog.tags[0]}
                              {blog.tags.length > 1 ? ` +${blog.tags.length - 1}` : ""}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(blog)}
                          disabled={isToggling}
                          className="group/btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer disabled:opacity-50"
                          title={`Click to ${blog.isPublished ? "unpublish" : "publish"} article`}
                        >
                          {blog.isPublished ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Draft
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Featured (Home) Toggle */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(blog)}
                          disabled={isTogglingFeatured}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border cursor-pointer disabled:opacity-50 ${
                            blog.featured
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25 shadow-sm"
                              : "bg-surface-secondary text-text-secondary border-border-default hover:border-amber-500/60 hover:text-amber-600 dark:hover:text-amber-400"
                          }`}
                          title={
                            blog.featured
                              ? "Click to remove from Home featured list"
                              : "Click to feature on Home page (max 3)"
                          }
                        >
                          <Star
                            size={12}
                            className={blog.featured ? "text-amber-500 fill-amber-500" : "text-text-tertiary"}
                          />
                          <span>{blog.featured ? "Featured" : "Regular"}</span>
                        </button>
                      </td>

                      {/* Performance Stats */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-3 font-mono text-[11px] text-text-secondary">
                          <span className="inline-flex items-center gap-1" title="Total Views">
                            <Eye size={13} className="text-sky-500" />
                            {blog.views || 0}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Total Likes">
                            <Heart size={13} className="text-rose-500" />
                            {blog.likesCount || blog.likes?.length || 0}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-text-secondary font-mono text-[11px]">
                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Quick Toggle Featured Star */}
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(blog)}
                            disabled={isTogglingFeatured}
                            className={`p-1.5 rounded-md transition ${
                              blog.featured
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 hover:bg-amber-500/25"
                                : "hover:bg-surface-secondary text-text-secondary hover:text-amber-500"
                            }`}
                            title={blog.featured ? "Remove from Home Highlights" : "Highlight on Home Page (Max 3)"}
                          >
                            <Star size={15} className={blog.featured ? "fill-amber-500 text-amber-500" : ""} />
                          </button>

                          {/* Quick Preview Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setPreviewBlog(blog)}
                            className="p-1.5 rounded-md hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition"
                            title="Quick View Article"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Public View Link */}
                          {blog.isPublished && (
                            <Link
                              href={`/blog/${blog.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-md hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition"
                              title="Open public page in new tab"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          )}

                          {/* Edit in Writer */}
                          <Link
                            href={`/blog/write?edit=${blog._id}`}
                            className="p-1.5 rounded-md hover:bg-accent-primary-light text-text-secondary hover:text-text-primary transition"
                            title="Edit Article in Writer"
                          >
                            <Edit size={15} />
                          </Link>

                          {/* Delete Prompt */}
                          <button
                            type="button"
                            onClick={() => setBlogToDelete(blog)}
                            className="p-1.5 rounded-md hover:bg-rose-500/10 text-text-secondary hover:text-accent-error transition"
                            title="Delete Article"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer / Counter */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="py-2.5 px-4 bg-surface-secondary/50 border-t border-border-default flex items-center justify-between text-xs text-text-secondary font-mono">
            <span>Showing {filteredBlogs.length} of {blogs.length} articles</span>
            <span>MEC Computer Club Publication Engine</span>
          </div>
        )}
      </div>

      {/* ── Quick Preview Modal ── */}
      {previewBlog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[6px_6px_0px_var(--border-brutalist)] dark:shadow-[6px_6px_0px_var(--accent-primary)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-border-default flex items-center justify-between bg-surface-secondary">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-primary text-text-primary border border-border-default">
                  {previewBlog.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${previewBlog.isPublished ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                  {previewBlog.isPublished ? "Published" : "Draft"}
                </span>

                {/* Home Featured Quick Toggle inside Modal */}
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(previewBlog)}
                  disabled={togglingFeaturedId === previewBlog._id}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                    previewBlog.featured
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50 hover:bg-amber-500/30"
                      : "bg-surface-primary text-text-secondary border-border-default hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400"
                  }`}
                  title={previewBlog.featured ? "Remove from Home Featured list" : "Feature on Home page (max 3)"}
                >
                  <Star size={11} className={previewBlog.featured ? "fill-amber-500 text-amber-500" : ""} />
                  {previewBlog.featured ? "★ Featured on Home" : "☆ Feature on Home"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/blog/write?edit=${previewBlog._id}`}
                  className="px-2.5 py-1 text-xs font-bold rounded-md bg-accent-primary text-black hover:opacity-90 flex items-center gap-1 transition"
                >
                  <Edit size={13} />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setPreviewBlog(null)}
                  className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-primary transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {previewBlog.coverImageUrl && (
                <div className="w-full h-52 sm:h-64 rounded-xl overflow-hidden relative border-2 border-border-brutalist dark:border-border-default shadow-[3px_3px_0px_var(--border-brutalist)] dark:shadow-[3px_3px_0px_var(--accent-primary)]">
                  <Image
                    src={previewBlog.coverImageUrl}
                    alt={previewBlog.title}
                    fill
                    className="object-cover"
                    style={{ objectPosition: previewBlog.coverImagePosition || "50% 50%" }}
                  />
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
                {previewBlog.title}
              </h2>

              <div className="flex items-center gap-4 text-xs text-text-secondary border-y border-border-default py-2.5 font-mono flex-wrap">
                <span className="flex items-center gap-1.5 font-bold text-text-primary">
                  <User size={13} /> {previewBlog.author?.fullName || "Club Member"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} /> {new Date(previewBlog.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={13} className="text-sky-500" /> {previewBlog.views} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart size={13} className="text-rose-500" /> {previewBlog.likesCount || 0} likes
                </span>
              </div>

              {previewBlog.tags && previewBlog.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {previewBlog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-surface-secondary text-text-secondary border border-border-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-surface-secondary/70 border border-border-default text-xs text-text-secondary italic">
                {previewBlog.excerpt}
              </div>

              {/* Content Render preview */}
              <div className="prose prose-sm dark:prose-invert max-w-none pt-2 text-text-primary font-sans leading-relaxed">
                {previewBlog.content.startsWith("<") ? (
                  <div dangerouslySetInnerHTML={{ __html: previewBlog.content }} />
                ) : (
                  <p className="whitespace-pre-line">{previewBlog.content}</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border-default bg-surface-secondary flex items-center justify-between">
              <div className="text-xs text-text-secondary font-mono">
                Slug: <code>/blog/{previewBlog.slug}</code>
              </div>
              <div className="flex items-center gap-2">
                {previewBlog.isPublished && (
                  <Button href={`/blog/${previewBlog.slug}`} size="sm" variant="outline">
                    <ExternalLink size={14} className="mr-1" />
                    Open Public Page
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewBlog(null)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-surface-primary border border-border-default text-text-primary hover:bg-surface-secondary transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {blogToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-2xl w-full max-w-md p-6 shadow-[6px_6px_0px_var(--border-brutalist)] dark:shadow-[6px_6px_0px_var(--accent-primary)] animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-accent-error mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-2">Delete Publication?</h3>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-text-primary">"{blogToDelete.title}"</strong>? This action will remove the article, readers' reactions, and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBlogToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-surface-secondary text-text-primary border border-border-default hover:bg-surface-primary transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBlog}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-accent-error text-white hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5 shadow-[2px_2px_0px_var(--border-brutalist)]"
              >
                {deleting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
