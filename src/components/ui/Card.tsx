import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";

/* ===== Event Card ===== */
interface EventCardProps {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "upcoming" | "ongoing" | "past";
  image: string;
  slug: string;
  attendeeCount?: number;
}

export function EventCard({
  title,
  description,
  date,
  time,
  location,
  type,
  status,
  image,
  slug,
  attendeeCount,
}: EventCardProps) {
  const eventDate = new Date(date);
  const month = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = eventDate.getDate();

  return (
    <Link
      href={`/events/${slug}`}
      className="flex flex-col w-full h-full min-h-[230px] bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 no-underline text-inherit group"
      id={`event-${slug}`}
    >
      <div className="flex flex-row items-stretch flex-1">
        <div className="flex flex-col items-center py-4 px-3 min-w-[64px] text-text-primary group-hover:text-accent-primary-hover transition-colors">
          <span className="font-bold text-xs tracking-wider leading-tight">{month}</span>
          <span className="font-bold text-2xl leading-none">{day}</span>
        </div>
        
        <div className="w-[1px] bg-text-primary/15 dark:bg-border-default my-3" />
        
        <div className="flex flex-col p-4 flex-1 gap-2">
          <div className="flex items-start justify-between mb-1">
            <div className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold text-text-primary bg-surface-secondary py-0.5 px-2 border border-border-brutalist dark:border-border-default rounded inline-flex items-center gap-1">
              <span className="opacity-70">TYPE:</span> {type.toUpperCase()}
            </div>
            <Badge variant={status === "upcoming" ? "upcoming" : "past"}>
              {status}
            </Badge>
          </div>
          
          <h3 className="font-bold text-xl leading-snug line-clamp-2 overflow-hidden text-text-primary group-hover:text-accent-primary-hover transition-colors min-h-[2.8em] mt-1">{title}</h3>
          
          <div className="flex items-center gap-1 font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-tertiary uppercase tracking-wide my-1">
            <span className="inline-flex items-center justify-center opacity-60">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </span>
            {location}
          </div>
          
          <p className="text-sm text-text-secondary leading-normal line-clamp-2 overflow-hidden min-h-[2.6em]">{description}</p>
          
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-text-primary/15 dark:border-border-default bg-surface-primary dark:bg-transparent">
            <div className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold uppercase text-text-secondary">
              DETAILS →
            </div>
            <div className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-primary font-bold">
              {time} {attendeeCount ? `· ${attendeeCount} ATTENDING` : ""}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ===== Project Card ===== */
interface ProjectCardProps {
  title: string;
  description: string;
  department: string;
  techStack: string[];
  team: string[];
  status: "in-progress" | "completed" | "archived";
  slug: string;
  image: string;
  liveUrl?: string;
}

export function ProjectCard({
  title,
  description,
  department = "webdev",
  techStack = [],
  team = [],
  status = "in-progress",
  slug,
  liveUrl,
}: ProjectCardProps) {
  const safeTeam = Array.isArray(team) ? team : [];
  const safeTechStack = Array.isArray(techStack) ? techStack : [];
  const displayTeam = safeTeam.slice(0, 3);
  const remainingCount = safeTeam.length > 3 ? safeTeam.length - 3 : 0;

  return (
    <Link
      href={`/projects/${slug}`}
      className="flex flex-col w-full h-full min-h-[230px] bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 no-underline text-inherit group"
      id={`project-${slug}`}
    >
      <div className="p-4 flex flex-col gap-2 flex-1 h-full">
        <div className="flex items-start justify-between mb-1">
          <div className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold text-text-primary bg-surface-secondary py-0.5 px-2 border border-border-brutalist dark:border-border-default rounded inline-flex items-center gap-1">
            <span className="opacity-70">DEPT:</span> {formatDeptShort(department)}
          </div>
          <Badge variant={status === "completed" ? "completed" : "pending"}>
            {status === "in-progress" ? "In Progress" : status}
          </Badge>
        </div>
        
        <h3 className="font-bold text-xl leading-snug line-clamp-2 overflow-hidden text-text-primary group-hover:text-accent-primary-hover transition-colors mt-1">{title}</h3>
        <p className="text-sm text-text-secondary leading-normal line-clamp-2 overflow-hidden">{description}</p>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {safeTechStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-[0.65rem] py-0.5 px-2 bg-surface-secondary text-text-secondary rounded tracking-wide border border-border-default"
            >
              {tech}
            </span>
          ))}
          {safeTechStack.length > 4 && (
            <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-[0.65rem] py-0.5 px-2 bg-accent-primary-light text-accent-primary-text rounded tracking-wide">
              +{safeTechStack.length - 4}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-text-primary/15 dark:border-border-default bg-surface-primary dark:bg-transparent">
          <div className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold uppercase text-text-secondary">
            {liveUrl ? "View Project ↗" : "Built By →"}
          </div>
          <div className="flex items-center" title={`Built by ${safeTeam.join(', ')}`}>
            {displayTeam.map((member, i) => {
              const initials = member.split(" ").map(n => n[0]).join("").slice(0, 2);
              return (
                <div
                  key={i}
                  className="w-9 h-9 rounded-md bg-surface-secondary border-2 border-surface-elevated flex items-center justify-center text-xs font-mono font-bold text-text-primary -ml-3 first:ml-0 relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:z-20 shadow-sm"
                  style={{ zIndex: 10 - i }}
                >
                  {initials}
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div
                className="w-9 h-9 rounded-md bg-surface-secondary border-2 border-surface-elevated flex items-center justify-center text-xs font-mono font-bold text-text-secondary -ml-3 relative overflow-hidden"
                style={{ zIndex: 1 }}
              >
                +{remainingCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ===== Blog Card ===== */
interface BlogCardProps {
  title: string;
  excerpt: string;
  author: string;
  authorImage?: string;
  date: string;
  readTime: number;
  tags: string[];
  slug: string;
}

export function BlogCard({
  title,
  excerpt,
  author,
  authorImage,
  date,
  readTime,
  tags,
  slug,
}: BlogCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${slug}`}
      className="flex flex-col w-full h-full min-h-[230px] bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 no-underline text-inherit group"
      id={`blog-${slug}`}
    >
      <div className="p-4 flex flex-col gap-2 flex-1 h-full">
        <div className="flex items-start justify-between mb-1">
          <div className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold text-text-primary bg-surface-secondary py-0.5 px-2 border border-border-brutalist dark:border-border-default rounded inline-flex items-center gap-1">
            <span className="opacity-70">READ:</span> {readTime} MIN
          </div>
          <time className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-text-tertiary font-bold">{formattedDate}</time>
        </div>
        
        <h3 className="font-bold text-xl leading-snug line-clamp-2 overflow-hidden text-text-primary group-hover:text-accent-primary-hover transition-colors mt-1">{title}</h3>
        <p className="text-sm text-text-secondary leading-normal line-clamp-2 overflow-hidden">{excerpt}</p>
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-[0.65rem] py-0.5 px-2 bg-surface-secondary text-text-secondary rounded tracking-wide border border-border-default"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-text-primary/15 dark:border-border-default bg-surface-primary dark:bg-transparent">
          <div className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs font-bold uppercase text-text-secondary">
            WRITTEN BY →
          </div>
          <div className="flex items-center" title={`Written by ${author}`}>
            <div className="w-8 h-8 rounded-md bg-surface-secondary border border-border-default flex items-center justify-center font-mono font-bold text-xs text-text-primary overflow-hidden relative shadow-sm">
              {authorImage ? (
                <Image src={authorImage} alt={author} fill className="object-cover rounded-md" />
              ) : (
                author.split(" ").map(n => n[0]).join("").slice(0, 2)
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ===== Team Member Card ===== */
interface TeamCardProps {
  name: string;
  role: string;
  image: string;
  bio?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    codeforces?: string;
  };
}

export function TeamCard({ name, role, bio, socials }: TeamCardProps) {
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`;

  return (
    <div className="flex flex-col items-center text-center p-5 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5">
      <div className="w-20 h-20 rounded-full mb-3 relative overflow-hidden border border-border-default bg-surface-secondary p-2.5">
        <Image src={avatarUrl} alt={name} fill className="object-contain" unoptimized />
      </div>
      <div className="w-full">
        <h4 className="font-bold text-lg text-text-primary mb-0.5">{name}</h4>
        <p className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-xs text-accent-primary-hover uppercase tracking-wider mb-2 font-semibold">{role}</p>
        {bio && <p className="text-sm text-text-secondary leading-normal">{bio}</p>}
        {socials && (
          <div className="flex gap-2 justify-center mt-3">
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name}'s GitHub`}
                className="w-8 h-8 rounded bg-surface-secondary text-text-secondary hover:bg-accent-primary hover:text-white font-mono text-xs font-bold flex items-center justify-center transition-colors border border-border-default"
              >
                GH
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name}'s LinkedIn`}
                className="w-8 h-8 rounded bg-surface-secondary text-text-secondary hover:bg-accent-primary hover:text-white font-mono text-xs font-bold flex items-center justify-center transition-colors border border-border-default"
              >
                LI
              </a>
            )}
            {socials.codeforces && (
              <a
                href={socials.codeforces}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name}'s Codeforces`}
                className="w-8 h-8 rounded bg-surface-secondary text-text-secondary hover:bg-accent-primary hover:text-white font-mono text-xs font-bold flex items-center justify-center transition-colors border border-border-default"
              >
                CF
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Helpers */
function formatDeptShort(dept: string): string {
  const short: Record<string, string> = {
    cp: "CP",
    webdev: "WEB",
    ml: "AI",
    cybersec: "CYBER",
  };
  return short[dept] || dept.toUpperCase().slice(0, 4);
}
