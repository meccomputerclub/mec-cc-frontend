import type { Metadata } from "next";
import { BlogCard } from "@/components/ui/Card";
import { getBlogs } from "@/data/blog";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog | MEC Computer Club",
  description: "Articles, tutorials, and technical write-ups from MEC Computer Club members.",
};

export default async function BlogPage() {
  const posts = await getBlogs();

  return (
    <>
      <section className="section blog-hero">
        <div className="container">
          <span className="kicker">Resources</span>
          <h1>Blog</h1>
          <p className="blog-hero__subtitle">
            Articles, tutorials, and technical write-ups published by our club members and engineers.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            {posts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
