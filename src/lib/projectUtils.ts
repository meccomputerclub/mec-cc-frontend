/**
 * Utility functions for projects: cover image resolution and GitHub repository extraction.
 */

export interface RepositoryItem {
  label: string;
  url: string;
}

/**
 * Returns the best cover image for a project:
 * 1. Explicit uploaded image (Cloudinary or custom URL)
 * 2. Real-time live web screenshot if liveDemoLink is provided (Vercel-style preview)
 * 3. GitHub repository OpenGraph card if githubLink is provided
 * 4. Default fallback image
 */
export function getProjectCoverImage(project?: {
  imageUrl?: string;
  image?: string;
  coverImageUrl?: string;
  liveDemoLink?: string;
  liveUrl?: string;
  githubLink?: string;
  repoUrl?: string;
  githubRepositories?: Array<{ label?: string; url: string }>;
  githubLinks?: string[];
}): string {
  if (!project) return "/images/projects/cp-tracker.jpg";

  const explicit = (project.imageUrl || project.image || project.coverImageUrl || "").trim();
  if (explicit && !explicit.includes("default.jpg") && !explicit.includes("placeholder")) {
    return explicit;
  }

  const live = (project.liveDemoLink || project.liveUrl || "").trim();
  if (live && (live.startsWith("http://") || live.startsWith("https://"))) {
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(live)}?w=900`;
  }

  const repo = (
    project.githubLink ||
    project.repoUrl ||
    (project.githubRepositories && project.githubRepositories[0]?.url) ||
    (project.githubLinks && project.githubLinks[0]) ||
    ""
  ).trim();

  const ghMatch = repo.match(/github\.com\/([^\/]+)\/([^\/\#\?]+)/i);
  if (ghMatch) {
    const owner = ghMatch[1];
    const repoName = ghMatch[2].replace(/\.git$/i, "");
    return `https://opengraph.githubassets.com/1/${owner}/${repoName}`;
  }

  return "/images/projects/cp-tracker.jpg";
}

/**
 * Extracts and normalizes repositories from project data.
 */
export function extractProjectRepositories(project?: {
  githubRepositories?: Array<{ label?: string; url: string }>;
  githubLinks?: string[];
  githubLink?: string;
  repoUrl?: string;
}): RepositoryItem[] {
  if (!project) return [];

  if (Array.isArray(project.githubRepositories) && project.githubRepositories.length > 0) {
    return project.githubRepositories
      .filter((r) => r && typeof r.url === "string" && r.url.trim().length > 0)
      .map((r, i) => ({
        label: r.label?.trim() || (i === 0 ? "Frontend / Main" : `Repo #${i + 1}`),
        url: r.url.trim(),
      }));
  }

  if (Array.isArray(project.githubLinks) && project.githubLinks.length > 0) {
    return project.githubLinks
      .filter((u) => typeof u === "string" && u.trim().length > 0)
      .map((u, i) => ({
        label: i === 0 ? "Frontend / Main" : i === 1 ? "Backend" : `Repository #${i + 1}`,
        url: u.trim(),
      }));
  }

  const single = (project.githubLink || project.repoUrl || "").trim();
  if (single) {
    return [{ label: "Repository", url: single }];
  }

  return [];
}
