import { BlogPost } from "@/types";
import { BlogCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface HomeBlogsProps {
  blogs: BlogPost[];
}

export function HomeBlogs({ blogs }: HomeBlogsProps) {
  const displayBlogs = blogs.slice(0, 3);

  if (displayBlogs.length === 0) {
    return null;
  }

  return (
    <section className="section" id="featured-blogs">
      <div className="container">
        <div className="text-center max-w-[640px] mx-auto mb-[var(--space-6)] max-[768px]:mb-[var(--space-4)]">
          <span className="kicker">Club Publications</span>
          <h2>Featured Articles &amp; Insights</h2>
          <p className="text-lg text-text-tertiary max-[768px]:text-base">
            Tutorials, competitive programming roadmaps, and software engineering deep dives written by club members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--gutter)]">
          {displayBlogs.map((blog) => (
            <div key={blog.id} className="flex">
              <BlogCard {...blog} />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-[var(--space-6)]">
          <Button href="/blog" variant="secondary" id="home-all-blogs">
            View all articles →
          </Button>
        </div>
      </div>
    </section>
  );
}
