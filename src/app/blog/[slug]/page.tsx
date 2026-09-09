import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { blogPosts, getBlogBySlug, getBlogBySlugFromApi } from "@/data/blog";
import BlogViewClient from "./BlogViewClient";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Try backend first, then static
  const apiPost = await getBlogBySlugFromApi(slug);
  const post = apiPost || getBlogBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return { title: `${post.title} | MEC Blog`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try backend first, then static
  const apiPost = await getBlogBySlugFromApi(slug);
  const post = apiPost || getBlogBySlug(slug);
  if (!post) notFound();

  const isHtml = post.content.includes("<") && post.content.includes(">");

  return <BlogViewClient post={post} isHtml={isHtml} />;
}
