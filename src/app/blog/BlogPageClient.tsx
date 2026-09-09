"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BlogCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import ConfirmationModal from "@/components/ui/shared/ConfirmModal";
import {
  PenLine,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  FileText,
  Clock,
  Tag,
  Heart,
} from "lucide-react";

interface BackendBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  coverImagePosition?: string;
  author: { _id: string; fullName: string; imageUrl?: string } | string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likesCount?: number;
  likes?: string[];
}

// Static posts for fallback
const staticSlugs = [
  "getting-started-competitive-programming",
  "deploying-nextjs-production",
  "first-kaggle-competition",
];

export default function BlogPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "my">(
    tabParam === "my" ? "my" : "all"
  );
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [myBlogs, setMyBlogs] = useState<BackendBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [myLoading, setMyLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({ open: false, id: "", title: "" });
  const [deleting, setDeleting] = useState(false);

  // Sync tab with URL parameter
  useEffect(() => {
    if (tabParam === "my" || tabParam === "all") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (key: "all" | "my") => {
    setActiveTab(key);
    router.replace(`/blog?tab=${key}`, { scroll: false });
  };

  // Fetch all published blogs
  const fetchAllBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/blogs?published=true`
      );
      if (res.ok) {
        const data = await res.json();
        const backendBlogs = (data.data || []).map((b: any) => ({
          id: b._id || b.id,
          slug: b.slug || b._id,
          title: b.title,
          excerpt:
            b.excerpt ||
            (b.content
              ? b.content.replace(/<[^>]*>/g, "").slice(0, 140) + "..."
              : ""),
          content: b.content || "",
          author: b.author?.fullName || "Club Member",
          authorImage: b.author?.imageUrl || "",
          date: b.createdAt
            ? new Date(b.createdAt).toISOString().split("T")[0]
            : "2025-08-01",
          readTime:
            b.readTime ||
            Math.max(
              1,
              Math.ceil(
                (b.content || "").replace(/<[^>]*>/g, "").split(/\s+/).length /
                  200
              )
            ),
          tags: b.tags || [],
          image: b.coverImageUrl || "",
          featured: !!b.featured,
        }));

        // Merge with static blog posts
        const { blogPosts } = await import("@/data/blog");
        setAllBlogs([...backendBlogs, ...blogPosts]);
      } else {
        const { blogPosts } = await import("@/data/blog");
        setAllBlogs(blogPosts);
      }
    } catch {
      const { blogPosts } = await import("@/data/blog");
      setAllBlogs(blogPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch my blogs
  const fetchMyBlogs = useCallback(async () => {
    if (!isAuthenticated) return;
    setMyLoading(true);
    try {
      const data = await api.get<{ success: boolean; data: BackendBlog[] }>(
        "/api/blogs/my"
      );
      setMyBlogs(data.data || []);
    } catch {
      setMyBlogs([]);
    } finally {
      setMyLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAllBlogs();
  }, [fetchAllBlogs]);

  useEffect(() => {
    if (activeTab === "my" && isAuthenticated) {
      fetchMyBlogs();
    }
  }, [activeTab, isAuthenticated, fetchMyBlogs]);

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      await api.delete(`/api/blogs/${deleteModal.id}`);
      setMyBlogs((prev) => prev.filter((b) => b._id !== deleteModal.id));
      // Also remove from allBlogs
      setAllBlogs((prev) => prev.filter((b) => b.id !== deleteModal.id));
      setDeleteModal({ open: false, id: "", title: "" });
    } catch (err: any) {
      alert(err?.message || "Failed to delete blog");
    } finally {
      setDeleting(false);
    }
  };

  const getAuthorName = (author: BackendBlog["author"]) => {
    if (typeof author === "string") return author;
    return author?.fullName || "Unknown";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const tabs = [
    { key: "all" as const, label: "All Blogs" },
    { key: "my" as const, label: "My Blogs" },
  ];

  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="kicker">Resources</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
                Blog
              </h1>
              <p className="text-lg sm:text-xl text-text-secondary max-w-[600px]">
                Articles, tutorials, and technical write-ups published by our
                club members and engineers.
              </p>
            </div>

            <Button
              href={isAuthenticated ? "/blog/write" : "/login?redirect=/blog/write"}
              variant="primary"
              size="md"
              icon={<PenLine size={16} />}
            >
              Post a Blog
            </Button>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mt-6 p-1 bg-surface-secondary rounded-lg border border-border-default w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  px-4 py-2 text-sm font-bold rounded-md transition-all duration-150
                  ${
                    activeTab === tab.key
                      ? "bg-accent-primary text-accent-primary-text shadow-[2px_2px_0px_0px_var(--text-primary)] dark:shadow-[2px_2px_0px_0px_var(--accent-primary-hover)]"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                  }
                `}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="ml-1.5 text-xs opacity-80">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* ── All Blogs Tab ── */}
          {activeTab === "all" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2
                    size={32}
                    className="animate-spin text-accent-primary"
                  />
                </div>
              ) : allBlogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText
                    size={48}
                    className="text-text-tertiary mb-4 opacity-50"
                  />
                  <p className="text-lg font-semibold text-text-secondary">
                    No blog posts yet
                  </p>
                  <p className="text-sm text-text-tertiary mt-1">
                    Be the first to write one!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allBlogs.map((post) => (
                    <BlogCard key={post.id} {...post} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── My Blogs Tab ── */}
          {activeTab === "my" && (
            <>
              {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText
                    size={48}
                    className="text-text-tertiary mb-4 opacity-50"
                  />
                  <p className="text-lg font-semibold text-text-secondary mb-2">
                    Please log in to see your blogs
                  </p>
                  <p className="text-sm text-text-tertiary mb-6">
                    Log in to view, edit, and manage all articles you have written.
                  </p>
                  <Button
                    href="/login?redirect=/blog?tab=my"
                    variant="primary"
                    size="sm"
                  >
                    Log In
                  </Button>
                </div>
              ) : myLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2
                    size={32}
                    className="animate-spin text-accent-primary"
                  />
                </div>
              ) : myBlogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileText
                    size={48}
                    className="text-text-tertiary mb-4 opacity-50"
                  />
                  <p className="text-lg font-semibold text-text-secondary">
                    You haven&apos;t written any blogs yet
                  </p>
                  <p className="text-sm text-text-tertiary mt-1 mb-4">
                    Share your knowledge with the community!
                  </p>
                  <Button
                    href="/blog/write"
                    variant="primary"
                    size="sm"
                    icon={<PenLine size={14} />}
                  >
                    Write your first blog
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {myBlogs.map((blog) => (
                    <div
                      key={blog._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-surface-elevated border border-border-default rounded-xl transition-all hover:shadow-[4px_4px_0px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    >
                      {/* Cover thumbnail */}
                      {blog.coverImageUrl && (
                        <div className="w-full sm:w-24 h-32 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border-default">
                          <img
                            src={blog.coverImageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{ objectPosition: blog.coverImagePosition || "50% 50%" }}
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`font-mono text-[0.65rem] py-0.5 px-2 rounded font-bold uppercase tracking-wide ${
                              blog.isPublished
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {blog.isPublished ? "Published" : "Draft"}
                          </span>
                          <span className="font-mono text-xs text-text-tertiary flex items-center gap-1">
                            <Clock size={11} />
                            {formatDate(blog.createdAt)}
                          </span>
                          <span className="font-mono text-xs text-text-tertiary flex items-center gap-1">
                            <Eye size={11} />
                            {blog.views} views
                          </span>
                          <span className="font-mono text-xs text-text-tertiary flex items-center gap-1">
                            <Heart
                              size={11}
                              className={
                                (blog.likesCount || (blog.likes ? blog.likes.length : 0)) > 0
                                  ? "fill-red-500/80 text-red-500"
                                  : ""
                              }
                            />
                            {blog.likesCount ?? (blog.likes ? blog.likes.length : 0)} likes
                          </span>
                        </div>

                        <h3 className="font-bold text-base sm:text-lg text-text-primary line-clamp-1 mb-1">
                          {blog.title}
                        </h3>

                        {blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {blog.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="font-mono text-[0.6rem] py-0.5 px-1.5 bg-surface-secondary text-text-tertiary rounded flex items-center gap-0.5"
                              >
                                <Tag size={8} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="p-2 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-surface-secondary transition"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/blog/write?edit=${blog._id}`}
                          className="p-2 rounded-lg text-text-secondary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              open: true,
                              id: blog._id,
                              title: blog.title,
                            })
                          }
                          className="p-2 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: "", title: "" })}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong>&ldquo;{deleteModal.title}&rdquo;</strong>? This action
            cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        confirmColor="red"
      />
    </>
  );
}
