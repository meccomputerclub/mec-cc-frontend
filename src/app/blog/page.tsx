import type { Metadata } from "next";
import { BlogCard } from "@/components/ui/Card";
import { getBlogs } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog | MEC Computer Club",
  description: "Articles, tutorials, and technical write-ups from MEC Computer Club members.",
};

export default async function BlogPage() {
  const posts = await getBlogs();

  return (
    <>
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">Resources</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            Blog
          </h1>
          <p className="text-xl text-text-secondary max-w-[600px]">
            Articles, tutorials, and technical write-ups published by our club members and engineers.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} {...post} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
