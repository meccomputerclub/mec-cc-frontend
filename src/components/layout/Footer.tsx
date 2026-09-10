"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAccent } from "@/components/AccentProvider";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { Compass, BookOpen, Link2, ExternalLink, Heart } from "lucide-react";

const footerLinks = {
  explore: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Alumni", href: "/alumni" },
    { label: "Events", href: "/events" },
    { label: "Projects", href: "/projects" },
  ],
  resources: [
    { label: "CP Hub", href: "/cp-hub" },
    { label: "Blog", href: "/blog" },
    { label: "Join Us", href: "/join" },
    { label: "Contact", href: "/contact" },
  ],
};

const IconGitHub = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={18} height={18}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={18} height={18}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={18} height={18}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconYouTube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={18} height={18}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const IconDiscord = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={18} height={18}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

export function Footer() {
  const pathname = usePathname();
  const { currentVibe } = useAccent();
  const { resolvedTheme } = useTheme();
  const { settings } = useSiteSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const githubUrl = settings.github_url || "https://github.com";
  const facebookUrl = settings.facebook_url || "https://www.facebook.com/mec.programmingclub";
  const linkedinUrl = settings.linkedin_url || "https://www.linkedin.com/in/mec-computer-club/";
  const youtubeUrl = settings.youtube_url || "https://www.youtube.com/@MECComputerClub";
  const clubName = settings.club_name || "MEC Computer Club";
  const clubTagline = settings.club_tagline || "Weekly CP practice, real projects, one club. Building the next generation of developers at MEC.";

  const connectLinks = [
    { label: "Facebook", href: facebookUrl, external: true },
    { label: "LinkedIn", href: linkedinUrl, external: true },
    { label: "YouTube", href: youtubeUrl, external: true },
    { label: "GitHub", href: githubUrl, external: true },
  ];

  const socialLinkClass =
    "flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] bg-surface-elevated border border-border-brutalist text-text-secondary no-underline transition-all duration-200 hover:shadow-[4px_4px_0px_var(--accent-primary)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-accent-primary-hover hover:text-white";

  const footerLinkClass =
    "text-sm text-text-tertiary no-underline transition-colors duration-150 hover:text-text-primary";

  const headingClass =
    "flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-text-primary mb-[var(--space-3)]";

  return (
    <footer className="bg-surface-secondary border-t border-border-default pt-[var(--space-7)] pb-[var(--space-5)] mt-[var(--space-8)] max-[640px]:pt-[var(--space-6)] max-[640px]:pb-[var(--space-4)] max-[640px]:mt-[var(--space-6)]" role="contentinfo">
      <div className="container">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-[var(--space-5)] lg:gap-[var(--space-6)] pb-[var(--space-5)] lg:pb-[var(--space-6)] border-b border-border-default">

          {/* Brand column — full-width on mobile & tablet, 2fr on desktop */}
          <div className="sm:col-span-2 lg:col-span-1 max-[640px]:text-center max-[640px]:flex max-[640px]:flex-col max-[640px]:items-center">
            <Link href="/" className="flex items-center no-underline mb-[var(--space-3)] h-12 max-[640px]:justify-center" aria-label={clubName}>
              {mounted ? (
                <Image
                  src={`/logo-${currentVibe}-${resolvedTheme === 'dark' ? 'dark' : 'light'}.png`}
                  alt={`${clubName} Logo`}
                  width={180}
                  height={45}
                  className="object-contain"
                />
              ) : (
                <Image
                  src="/logo-lime-light.png"
                  alt={`${clubName} Logo`}
                  width={180}
                  height={45}
                  className="object-contain"
                />
              )}
            </Link>
            <p className="text-sm text-text-tertiary leading-[var(--leading-relaxed)] max-w-[280px] mb-[var(--space-4)] max-[640px]:max-w-full max-[640px]:text-center">
              {clubTagline}
            </p>
            <div className="flex gap-[var(--space-2)] max-[640px]:justify-center">
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={socialLinkClass}>
                <IconGitHub />
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialLinkClass}>
                <IconFacebook />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={socialLinkClass}>
                <IconLinkedIn />
              </a>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={socialLinkClass}>
                <IconYouTube />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className={headingClass}>
              <Compass size={16} /> Explore
            </h4>
            <ul className="list-none p-0 m-0">
              {footerLinks.explore.map((link) => (
                <li key={link.href} className="mb-[var(--space-2)]">
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className={headingClass}>
              <BookOpen size={16} /> Resources
            </h4>
            <ul className="list-none p-0 m-0">
              {footerLinks.resources.map((link) => (
                <li key={link.href} className="mb-[var(--space-2)]">
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className={headingClass}>
              <Link2 size={16} /> Connect
            </h4>
            <ul className="list-none p-0 m-0">
              {connectLinks.map((link) => (
                <li key={link.label} className="mb-[var(--space-2)]">
                  <a
                    href={link.href}
                    className={`${footerLinkClass} inline-flex items-center gap-1`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label} <ExternalLink size={14} className="opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-[var(--space-4)] max-[480px]:flex-col max-[480px]:gap-[var(--space-2)] max-[480px]:items-center max-[480px]:text-center max-[480px]:pt-[var(--space-3)]">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} {clubName}. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary flex items-center justify-center gap-1">
            Built with <Heart size={14} className="text-accent-primary-hover inline-block align-middle mx-0.5" /> by the Web Dev panel.
          </p>
        </div>
      </div>
    </footer>
  );
}
