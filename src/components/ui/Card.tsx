import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";
import "./Card.css";

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
    <Link href={`/events/${slug}`} className="card card--event" id={`event-${slug}`}>
      <div className="card__body">
        <div className="card__accent-column">
          <span className="card__accent-top">{month}</span>
          <span className="card__accent-bottom">{day}</span>
        </div>
        
        <div className="card__divider" />
        
        <div className="card__content-column">
          <div className="card__header-flex">
            <div className="card__badge-inline">
              <span style={{ opacity: 0.7 }}>TYPE:</span> {type.toUpperCase()}
            </div>
            <Badge variant={status === "upcoming" ? "upcoming" : "past"}>
              {status}
            </Badge>
          </div>
          
          <h3 className="card__title card__title--large">{title}</h3>
          
          <div className="card__meta-line" style={{ marginTop: '4px', marginBottom: '4px' }}>
            <span className="card__meta-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </span>
            {location}
          </div>
          
          <p className="card__description">{description}</p>
          
          <div className="card__footer card__footer--spaced">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              DETAILS →
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontWeight: 'bold', fontFeatureSettings: '"liga" 0, "calt" 0' }}>
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
    <Link href={`/projects/${slug}`} className="card card--project" id={`project-${slug}`}>
      <div className="card__content">
        <div className="card__header-flex">
          <div className="card__badge-inline">
            <span style={{ opacity: 0.7 }}>DEPT:</span> {formatDeptShort(department)}
          </div>
          <Badge variant={status === "completed" ? "completed" : "pending"}>
            {status === "in-progress" ? "In Progress" : status}
          </Badge>
        </div>
        
        <h3 className="card__title card__title--large">{title}</h3>
        <p className="card__description">{description}</p>
        
        <div className="card__tags">
          {safeTechStack.slice(0, 4).map((tech) => (
            <span key={tech} className="card__tag">
              {tech}
            </span>
          ))}
          {safeTechStack.length > 4 && (
            <span className="card__tag card__tag--more">+{safeTechStack.length - 4}</span>
          )}
        </div>

        <div className="card__footer card__footer--spaced">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {liveUrl ? "View Project ↗" : "Built By →"}
          </div>
          <div className="avatar-group" title={`Built by ${safeTeam.join(', ')}`}>
            {displayTeam.map((member, i) => {
              const initials = member.split(" ").map(n => n[0]).join("").slice(0, 2);
              return (
                <div key={i} className="avatar" style={{ zIndex: 10 - i }}>
                  {initials}
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div className="avatar avatar--more" style={{ zIndex: 1 }}>
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
    <Link href={`/blog/${slug}`} className="card card--blog" id={`blog-${slug}`}>
      <div className="card__content">
        <div className="card__header-flex">
          <div className="card__badge-inline">
            <span style={{ opacity: 0.7 }}>READ:</span> {readTime} MIN
          </div>
          <time className="card__meta-date">{formattedDate}</time>
        </div>
        
        <h3 className="card__title card__title--large">{title}</h3>
        <p className="card__description">{excerpt}</p>
        
        <div className="card__tags">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="card__tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="card__footer card__footer--spaced">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            WRITTEN BY →
          </div>
          <div className="avatar-group" title={`Written by ${author}`}>
            <div className="avatar">
              {authorImage ? (
                <Image src={authorImage} alt={author} fill style={{ objectFit: "cover", borderRadius: "8px" }} />
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
  // Use a generated avatar based on the name for a fun, dynamic look
  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`;

  return (
    <div className="card card--team">
      <div className="card__avatar" style={{ padding: '10px', background: 'var(--surface-secondary)' }}>
        <Image src={avatarUrl} alt={name} fill style={{ objectFit: 'contain' }} unoptimized />
      </div>
      <div className="card__content">
        <h4 className="card__name">{name}</h4>
        <p className="card__role">{role}</p>
        {bio && <p className="card__bio">{bio}</p>}
        {socials && (
          <div className="card__socials">
            {socials.github && (
              <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s GitHub`}>
                GH
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s LinkedIn`}>
                LI
              </a>
            )}
            {socials.codeforces && (
              <a href={socials.codeforces} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s Codeforces`}>
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
function getEventGradient(type: string): string {
  const gradients: Record<string, string> = {
    workshop: "linear-gradient(135deg, var(--accent-primary-light) 0%, var(--surface-primary) 100%)",
    contest: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-light) 100%)",
    seminar: "linear-gradient(135deg, var(--surface-elevated) 0%, var(--surface-secondary) 100%)",
    social: "linear-gradient(135deg, var(--surface-elevated) 0%, var(--surface-primary) 100%)",
    hackathon: "linear-gradient(135deg, var(--accent-primary-hover) 0%, var(--accent-primary-light) 100%)",
  };
  return gradients[type] || gradients.workshop;
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    workshop: "[W]",
    contest: "[C]",
    seminar: "[S]",
    social: "[P]",
    hackathon: "[H]",
  };
  return icons[type] || "[E]";
}

function getDeptSolidColor(dept: string): string {
  const colors: Record<string, string> = {
    cp: "var(--accent-primary)",
    webdev: "var(--accent-secondary)",
    ml: "var(--surface-elevated)",
    cybersec: "var(--text-secondary)",
  };
  return colors[dept] || "var(--accent-primary)";
}

function getDeptGradient(dept: string): string {
  const gradients: Record<string, string> = {
    cp: "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-light) 100%)",
    webdev: "linear-gradient(135deg, var(--accent-primary-light) 0%, var(--surface-primary) 100%)",
    ml: "linear-gradient(135deg, var(--surface-elevated) 0%, var(--surface-secondary) 100%)",
    cybersec: "linear-gradient(135deg, var(--surface-secondary) 0%, var(--surface-primary) 100%)",
  };
  return gradients[dept] || gradients.webdev;
}

function getDeptIcon(dept: string): string {
  const icons: Record<string, string> = {
    cp: "[CP]",
    webdev: "[WEB]",
    ml: "[ML]",
    cybersec: "[SEC]",
  };
  return icons[dept] || "[CODE]";
}

function formatDept(dept: string): string {
  const names: Record<string, string> = {
    cp: "Competitive Programming",
    webdev: "Web Development",
    ml: "Machine Learning",
    cybersec: "Cybersecurity",
  };
  return names[dept] || dept;
}

function formatDeptShort(dept: string): string {
  const short: Record<string, string> = {
    cp: "CP",
    webdev: "WEB",
    ml: "AI",
    cybersec: "CYBER",
  };
  return short[dept] || dept.toUpperCase().slice(0, 4);
}

function getEventAccentColor(type: string): string {
  if (type === "contest") return "var(--accent-primary)";
  if (type === "workshop") return "var(--accent-primary-hover)";
  if (type === "hackathon") return "#F59E0B"; // Warm unique hue
  return "var(--text-primary)";
}
