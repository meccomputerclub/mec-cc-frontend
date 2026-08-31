import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { blogPosts, getBlogBySlug } from "@/data/blog";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="py-12 md:py-16">
      <div className="container max-w-[var(--max-width-narrow)] mx-auto px-4 md:px-8">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 font-mono [font-feature-settings:'liga'_0,'calt'_0] text-sm text-text-tertiary mb-4">
            <span className="text-accent-primary-hover font-bold">{post.author}</span>
            <span>·</span>
            <time className="text-text-secondary">{formattedDate}</time>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary max-w-[800px] mx-auto my-3">
            {post.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs py-1 px-3 bg-surface-secondary rounded-full text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="text-lg leading-relaxed text-text-primary max-w-[680px] mx-auto">
          {post.content.split("\n\n").map((paragraph, index) => {
            if (paragraph.startsWith("## ")) {
              return <h2 key={index} className="text-2xl font-bold text-text-primary mt-8 mb-3">{paragraph.replace("## ", "")}</h2>;
            }
            if (paragraph.startsWith("- ")) {
              const items = paragraph.split("\n").map(item => item.replace("- ", ""));
              return (
                <ul key={index} className="list-disc pl-6 mb-4 flex flex-col gap-1">
                  {items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              );
            }
            if (paragraph.startsWith("1. ")) {
              const items = paragraph.split("\n").map(item => item.replace(/^\d+\.\s/, ""));
              return (
                <ol key={index} className="list-decimal pl-6 mb-4 flex flex-col gap-1">
                  {items.map((item, i) => <li key={i}>{item}</li>)}
                </ol>
              );
            }
            return <p key={index} className="mb-4 text-text-primary">{paragraph.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
          })}
        </div>

        <div className="max-w-[680px] mx-auto mt-12 pt-6 border-t border-border-default flex flex-col gap-6 items-start">
          <div className="flex items-center gap-4 p-4 bg-surface-secondary rounded-xl border border-border-default w-full">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-primary to-accent-primary-light flex items-center justify-center text-accent-primary-text font-bold text-xl shrink-0">
              {post.author.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <strong className="block text-lg font-bold text-text-primary mb-0.5">Written by {post.author}</strong>
              <p className="text-sm text-text-tertiary m-0">MEC Computer Club Member</p>
            </div>
          </div>
          <Button href="/blog" variant="ghost">← Back to all posts</Button>
        </div>
      </div>
    </article>
  );
}
