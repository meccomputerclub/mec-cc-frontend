"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BlogPost } from "@/types";
import { ArrowLeft, Calendar, Clock, Eye, Heart, Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface BlogViewClientProps {
  post: BlogPost;
  isHtml: boolean;
}

function cleanBlogHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  let html = rawHtml;

  // 1. Extract body content if it's a full HTML document
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1];
  } else {
    html = html
      .replace(/<!DOCTYPE[^>]*>/gi, "")
      .replace(/<html[^>]*>/gi, "")
      .replace(/<\/html>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<meta[^>]*>/gi, "")
      .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "");
  }

  // 2. Safely scope <style> tags so they NEVER leak globally to .container or navbar
  html = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, cssContent: string) => {
    const scoped = cssContent
      // Remove dangerous root/html/body redefinitions
      .replace(/(^|\})\s*(:root|html|body)\s*\{[^}]*\}/gi, "$1")
      // Remove unscoped .container and .header resets
      .replace(/(^|\})\s*\.container\s*\{[^}]*\}/gi, "$1")
      .replace(/(^|\})\s*\.header\s*\{[^}]*\}/gi, "$1")
      // Scope every other selector strictly to .blog-prose
      .replace(/([^{}]+)\{/g, (match, selector: string) => {
        if (selector.trim().startsWith("@")) return match;
        const scopedSelector = selector
          .split(",")
          .map((s) => {
            const trimmed = s.trim();
            if (!trimmed) return "";
            if (trimmed.startsWith(".blog-prose")) return trimmed;
            return `.blog-prose ${trimmed}`;
          })
          .filter(Boolean)
          .join(", ");
        return `${scopedSelector} {`;
      });

    return `<style>${scoped}</style>`;
  });

  return html;
}

export default function BlogViewClient({ post, isHtml }: BlogViewClientProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();

  const currentUserId = user?.id || (user as any)?._id;
  const [likesCount, setLikesCount] = useState(
    post.likesCount ?? (post.likes ? post.likes.length : 0)
  );
  const [isLiked, setIsLiked] = useState(
    Boolean(currentUserId && post.likes && post.likes.includes(currentUserId))
  );
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (currentUserId && post.likes) {
      setIsLiked(post.likes.includes(currentUserId));
    }
  }, [currentUserId, post.likes]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to react");
      return;
    }

    if (liking) return;
    setLiking(true);

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.post<{
        success: boolean;
        isLiked: boolean;
        likesCount: number;
      }>(`/api/blogs/${post.id}/like`);
      if (res.success) {
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
      }
    } catch (err: any) {
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
      toast.error(err?.message || "Failed to update reaction");
    } finally {
      setLiking(false);
    }
  };

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Automatically wrap tables in responsive scroll containers
  useEffect(() => {
    if (!contentRef.current) return;
    const tables = contentRef.current.querySelectorAll("table");
    tables.forEach((table) => {
      if (table.parentElement?.classList.contains("table-wrapper")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "table-wrapper";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }, [post.content, isHtml]);

  const authorProfileUrl = `/profile/${post.authorId || encodeURIComponent(post.author)}`;

  return (
    <article className="py-8 sm:py-12 md:py-16 overflow-x-clip">
      {/* Both Header/Cover Image (red section) and Description (green section) share this exact same width */}
      <div className="w-full max-w-[760px] mx-auto px-4 sm:px-6">
        {/* Top Back Navigation */}
        <div className="mb-6">
          <Button href="/blog" variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Back to all blogs
          </Button>
        </div>

        {/* Header */}
        <header className="mb-6">
          {/* Meta line with clickable author link */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-text-tertiary mb-3">
            <Link
              href={authorProfileUrl}
              className="text-accent-primary-hover font-bold hover:underline transition-colors cursor-pointer"
              title={`View ${post.author}'s profile`}
            >
              {post.author}
            </Link>
            <span className="opacity-50">·</span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              <time>{formattedDate}</time>
            </span>
            <span className="opacity-50">·</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} min read
            </span>
            <span className="opacity-50">·</span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {post.views ?? 0} views
            </span>
            <span className="opacity-50">·</span>
            <span className="flex items-center gap-1">
              <Heart
                size={12}
                className={isLiked ? "fill-red-500 text-red-500" : ""}
              />
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-text-primary leading-tight mb-4 break-words">
            {post.title}
          </h1>

          {/* Tags & Reaction Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {post.tags && post.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 font-mono text-xs py-1 px-3 bg-surface-secondary rounded-full text-text-secondary border border-border-default hover:bg-accent-primary-light hover:text-text-primary transition cursor-default"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div />
            )}

            {/* Interactive Reaction Button (Only on Details Page) */}
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs border-2 transition-all cursor-pointer select-none active:scale-95 ${
                isLiked
                  ? "bg-red-50 text-red-600 border-red-500 shadow-[3px_3px_0px_0px_#ef4444] dark:bg-red-950/40 dark:text-red-400"
                  : "bg-surface-elevated text-text-primary border-border-default shadow-[3px_3px_0px_0px_var(--accent-primary)] hover:border-accent-primary"
              }`}
              title={
                isAuthenticated
                  ? isLiked
                    ? "Unlike post"
                    : "Like post"
                  : "Please login to react"
              }
            >
              <Heart
                size={15}
                className={`transition-transform duration-200 ${
                  isLiked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-text-secondary"
                }`}
              />
              <span>{likesCount}</span>
              <span className="font-normal opacity-80">
                {isLiked ? "Liked" : "Like"}
              </span>
            </button>
          </div>
        </header>

        {/* Cover Image inside container - 100% aligned with description below */}
        {post.image && (
          <div className="mb-8 w-full h-[220px] sm:h-[340px] md:h-[400px] relative rounded-2xl overflow-hidden border-2 border-border-default shadow-[4px_4px_0px_0px_var(--accent-primary)] bg-surface-secondary">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              style={{ objectPosition: post.coverImagePosition || "50% 50%" }}
              priority
              unoptimized
            />
          </div>
        )}

        {/* Content - shares full width of 760px container */}
        <div className="w-full min-w-0">
          {isHtml ? (
            <div
              ref={contentRef}
              className="blog-prose w-full min-w-0"
              dangerouslySetInnerHTML={{ __html: cleanBlogHtml(post.content) }}
            />
          ) : (
            <div ref={contentRef} className="blog-prose w-full min-w-0">
              {post.content.split("\n\n").map((paragraph, index) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index}>
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("- ")) {
                  const items = paragraph
                    .split("\n")
                    .map((item) => item.replace("- ", ""));
                  return (
                    <ul key={index}>
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                if (paragraph.startsWith("1. ")) {
                  const items = paragraph
                    .split("\n")
                    .map((item) => item.replace(/^\d+\.\s/, ""));
                  return (
                    <ol key={index}>
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  );
                }
                // Handle bold **text**
                const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={index}>
                    {parts.map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <strong key={i}>
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          )}

          {/* Author Card */}
          <div className="mt-12 pt-8 border-t-2 border-border-default">
            <div className="flex items-center gap-4 p-4 sm:p-5 bg-surface-elevated rounded-xl border-2 border-border-default shadow-[3px_3px_0px_0px_var(--accent-primary)] max-w-full">
              <Link
                href={authorProfileUrl}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-accent-primary to-accent-primary-light flex items-center justify-center text-accent-primary-text font-bold text-lg sm:text-xl shrink-0 border-2 border-text-primary dark:border-border-default overflow-hidden relative hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
                title={`Visit ${post.author}'s profile`}
              >
                {post.authorImage ? (
                  <Image
                    src={post.authorImage}
                    alt={post.author}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  post.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={authorProfileUrl}
                  className="block text-base sm:text-lg font-bold text-text-primary mb-0.5 break-words hover:text-accent-primary-hover hover:underline transition-colors cursor-pointer"
                  title={`Visit ${post.author}'s profile`}
                >
                  Written by {post.author} ↗
                </Link>
                <p className="text-sm text-text-tertiary m-0">
                  MEC Computer Club Member
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Button href="/blog" variant="ghost" icon={<ArrowLeft size={16} />}>
                Back to all posts
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Blog prose styles */}
      <style jsx global>{`
        .blog-prose {
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--text-primary);
          overflow-wrap: break-word;
          word-break: break-word;
          max-width: 100%;
        }
        .blog-prose h1,
        .blog-prose h2,
        .blog-prose h3,
        .blog-prose h4 {
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .blog-prose h2 {
          font-size: 1.65rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--border-default);
        }
        .blog-prose h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 2rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .blog-prose p {
          margin-bottom: 1.25rem;
          color: var(--text-primary);
          overflow-wrap: break-word;
        }
        .blog-prose strong {
          font-weight: 700;
          color: var(--text-primary);
        }
        .blog-prose ul,
        .blog-prose ol {
          margin: 1rem 0;
          padding-left: 1.75rem;
          overflow-wrap: break-word;
        }
        .blog-prose ul {
          list-style: disc;
        }
        .blog-prose ol {
          list-style: decimal;
        }
        .blog-prose li {
          margin-bottom: 0.4rem;
          color: var(--text-primary);
          overflow-wrap: break-word;
        }
        .blog-prose blockquote {
          border-left: 4px solid var(--accent-primary);
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
          background: var(--surface-secondary);
          border-radius: 0 12px 12px 0;
          color: var(--text-secondary);
          font-style: italic;
          overflow-wrap: break-word;
        }

        /* Preformatted code & code blocks */
        .blog-prose pre {
          background: var(--surface-inverse);
          color: var(--text-inverse);
          padding: 1.25rem;
          border-radius: 12px;
          margin: 1.5rem 0;
          overflow-x: auto;
          max-width: 100%;
          font-family: monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          border: 2px solid var(--border-default);
          -webkit-overflow-scrolling: touch;
        }
        .blog-prose .code-block {
          max-width: 100%;
          overflow-x: auto;
          margin: 1.5rem 0;
          border-radius: 12px;
          -webkit-overflow-scrolling: touch;
        }
        .blog-prose .code-block pre {
          margin: 0;
        }

        /* Inline code */
        .blog-prose code {
          background: var(--surface-secondary);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: monospace;
          color: var(--accent-primary-hover);
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .blog-prose pre code {
          background: none;
          padding: 0;
          color: inherit;
          word-break: normal;
          overflow-wrap: normal;
          white-space: pre;
        }

        .blog-prose article,
        .blog-prose section,
        .blog-prose div {
          max-width: 100%;
        }
        .blog-prose .container {
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
        }
        .blog-prose .cover-image {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .blog-prose .content {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .blog-prose .header {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Tables & responsive table wrapper */
        .blog-prose table {
          display: block;
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 1.5rem 0;
          border-radius: 12px;
          border: 1px solid var(--border-default);
        }
        .blog-prose .table-wrapper {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 1.5rem 0;
          border-radius: 12px;
          border: 1px solid var(--border-default);
        }
        .blog-prose .table-wrapper table {
          display: table;
          width: 100%;
          min-width: 100%;
          margin: 0;
          border: none;
          border-radius: 0;
        }
        .blog-prose thead {
          background: var(--surface-secondary);
        }
        .blog-prose th {
          background: var(--surface-secondary);
          padding: 0.75rem 1rem;
          font-weight: 700;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border-default);
          white-space: nowrap;
        }
        .blog-prose td {
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-default);
          vertical-align: top;
        }
        .blog-prose tr:last-child td {
          border-bottom: none;
        }
        .blog-prose tbody tr:nth-child(even) td {
          background: color-mix(in srgb, var(--surface-secondary) 40%, transparent);
        }

        .blog-prose a {
          color: var(--accent-primary-hover);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .blog-prose a:hover {
          color: var(--accent-primary);
        }
        .blog-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
          border: 2px solid var(--border-default);
          display: block;
        }
        .blog-prose hr {
          border: none;
          border-top: 2px solid var(--border-default);
          margin: 2rem 0;
        }

        @media (max-width: 640px) {
          .blog-prose {
            font-size: 1rem;
            line-height: 1.7;
          }
          .blog-prose h2 {
            font-size: 1.35rem;
          }
          .blog-prose h3 {
            font-size: 1.15rem;
          }
          .blog-prose th,
          .blog-prose td {
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </article>
  );
}
