"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Crown,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Mail,
  Building2,
  Calendar,
  Layers,
  Award,
  ExternalLink,
  Copy,
  Code2,
} from "lucide-react";
import { formatDeptSession } from "@/lib/formatters";
import { staticExecutives } from "@/data/executives";
import { staticAdvisors } from "@/data/advisors";
import { activeMembers } from "@/data/members";
import { alumniBatches } from "@/data/alumni";
import "../profile.css";

/* ── Social SVGs ── */
const IconGH = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const IconLI = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const IconFB = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IconCF = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="2" y="10" width="4" height="12" rx="1"/><rect x="10" y="4" width="4" height="18" rx="1"/><rect x="18" y="7" width="4" height="15" rx="1"/>
  </svg>
);
const IconCC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.2574.0039c-.37.0101-.7353.041-1.1003.095C9.6164.153 9.0766.4236 8.482.694c-.757.3244-1.5147.6486-2.2176.7027-1.1896.3785-1.568.919-1.8925 1.3516 0 .054-.054.1079-.054.1079-.4325.865-.4873 1.73-.325 2.5952.1621.5407.3786 1.0282.5408 1.5148.3785 1.0274.7578 2.0007.92 3.1362.1622.3244.3235.7571.4316 1.1897.2704.8651.542 1.8383 1.353 2.5952l.0057-.0028c.0175.0183.0301.0387.0482.0568.0072-.0036.0141-.0063.0213-.0099l-.0213-.5849c.6489-.9733 1.5673-1.6221 2.865-1.8925.5195-.1093 1.081-.1497 1.6625-.1278a8.7733 8.7733 0 0 1 1.7988.2357c1.4599.3785 2.595 1.1358 2.6492 1.7846.0273.3549.0398.6952.0326 1.0364-.001.064-.0046.1285-.007.193l.1362.0682c.075-.0375.1424-.107.2059-.1902.0008-.001.002-.002.0028-.0028.0018-.0023.0039-.0061.0057-.0085.0396-.0536.0747-.1236.1107-.1931.0188-.0377.0372-.0866.0554-.1292.2048-.4622.362-1.1536.538-1.9635.0541-.2703.1092-.4864.1633-.7027.4326-.9733 1.0266-1.8382 1.6213-2.6492.9733-1.3518 1.8928-2.5962 1.7846-4.0561-1.784-3.4608-4.2718-4.0017-5.5695-4.272-.2163-.0541-.3233-.0539-.4856-.108-1.3382-.2433-2.4945-.3953-3.6046-.3648zm5.0428 14.3788a9.8602 9.8602 0 0 0-.0326-.9824c-.0541-.703-1.1892-1.46-2.7032-1.8386-.588-.1336-1.1764-.2142-1.7448-.2356-.539-.0137-1.0657.0248-1.5546.1277-1.2436.2704-2.2162.9193-2.811 1.8925l.0511 1.431c.6672-.3558 1.7326-.8747 3.139-.9994.0662-.0059.1368-.0059.2044-.0099.1177-.013.2667-.044.4444-.044 1.6075 0 3.2682.5336 4.8767 1.6483.039-.2744.0611-.549.071-.8234l.044.0227c.0028-.0622.0143-.1268.0156-.1888z"/>
  </svg>
);
const IconDiscord = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    const fetchMember = async () => {
      setLoading(true);
      setError(null);

      // 1. Try to fetch from backend API
      try {
        const res = await fetch(`${API_URL}/api/users/profile/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data && isMounted) {
            setMember(json.data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // Backend not reachable or error, fallback to static records
      }

      // 2. Check static collections
      const cleanId = id.toLowerCase().trim();

      // Check executives
      const foundExec = staticExecutives.find(
        (e: any) => e.id?.toLowerCase() === cleanId || e.name?.toLowerCase() === cleanId
      );
      if (foundExec && isMounted) {
        setMember({
          fullName: foundExec.name,
          designation: foundExec.role,
          role: "executive",
          clubRole: "executive",
          imageUrl: foundExec.image,
          department: "CSE",
          session: "2021-22",
          batch: "5th",
          bio: foundExec.bio || "Active Executive Panel Member of MEC Computer Club.",
          socialLinks: foundExec.socials,
        });
        setLoading(false);
        return;
      }

      // Check advisors
      const foundAdv = staticAdvisors.find(
        (a: any) => a.id?.toLowerCase() === cleanId || a.name?.toLowerCase() === cleanId
      );
      if (foundAdv && isMounted) {
        setMember({
          fullName: foundAdv.name,
          designation: foundAdv.role,
          role: "member",
          clubRole: "advisor",
          imageUrl: foundAdv.image,
          department: "Faculty",
          session: "Advisor",
          batch: "Faculty",
          bio: foundAdv.bio || "Distinguished Advisor for MEC Computer Club.",
          socialLinks: foundAdv.socials,
        });
        setLoading(false);
        return;
      }

      // Check active members
      const foundMember = activeMembers.find(
        (m: any) => m.id?.toLowerCase() === cleanId || m.name?.toLowerCase() === cleanId
      );
      if (foundMember && isMounted) {
        setMember({
          fullName: foundMember.name,
          designation: foundMember.role,
          role: (foundMember as any).systemRole || "member",
          clubRole: "member",
          imageUrl: foundMember.image,
          department: foundMember.department || "CSE",
          session: foundMember.session || "2021-22",
          batch: foundMember.batch || "5th",
          socialLinks: foundMember.socials,
        });
        setLoading(false);
        return;
      }

      // Check alumni batches
      for (const b of alumniBatches) {
        const foundAlumnus = b.members.find(
          (m: any) => m.id?.toLowerCase() === cleanId || m.name?.toLowerCase() === cleanId
        );
        if (foundAlumnus && isMounted) {
          setMember({
            fullName: foundAlumnus.name,
            designation: foundAlumnus.role,
            role: "alumni",
            clubRole: "alumni",
            imageUrl: foundAlumnus.image,
            department: "CSE",
            session: b.year,
            batch: b.batchNumber,
            isGraduated: true,
            bio: foundAlumnus.bio,
            socialLinks: foundAlumnus.socials,
          });
          setLoading(false);
          return;
        }
      }

      if (isMounted) {
        setError("Member profile not found.");
        setLoading(false);
      }
    };

    fetchMember();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  const copyText = (txt: string, label: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(txt);
      toast.success(`${label} copied!`);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-page__cover-wrap">
          <div className="profile-page__cover-pattern" />
        </div>
        <div className="profile-page__container">
          <div className="profile-page__loading">
            <Sparkles size={32} className="animate-spin text-emerald-500" />
            <p>Loading member profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="profile-page">
        <div className="profile-page__cover-wrap">
          <div className="profile-page__cover-pattern" />
          <div className="profile-page__cover-nav">
            <Link href="/members" className="profile-page__back-btn">
              <ArrowLeft size={14} /> Back to Directory
            </Link>
          </div>
        </div>
        <div className="profile-page__container">
          <div className="profile-page__hero-card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px" }}>Member Not Found</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              The requested member profile could not be located or may have been removed.
            </p>
            <Link href="/members" className="profile-page__back-btn" style={{ display: "inline-flex" }}>
              <ArrowLeft size={14} /> Return to Member Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* Compute Details */
  const name = member.fullName || "Unnamed Member";
  const initial = name.trim().charAt(0).toUpperCase();
  const sessionDisplay = formatDeptSession(member.department, member.session, member.batch);
  const designation = member.designation || member.customRole || (member.clubRole === "advisor" ? "Faculty Advisor" : member.clubRole === "executive" ? "Executive Member" : member.clubRole === "alumni" ? "Alumni" : "Club Member");
  const isAdv = member.clubRole === "advisor" || designation.toLowerCase().includes("advisor");
  const isExec = member.clubRole === "executive";
  const isAlumni = member.clubRole === "alumni" || member.isGraduated || member.role === "alumni";
  const isAdmin = member.role === "admin";
  const isMod = member.role === "moderator";

  const socials = member.socialLinks || {};

  return (
    <div className="profile-page">
      {/* ── 1. Cover Banner ── */}
      <div className="profile-page__cover-wrap">
        {member.coverUrl ? (
          <Image
            src={member.coverUrl}
            alt={`${name}'s cover`}
            fill
            sizes="100vw"
            className="profile-page__cover-img"
          />
        ) : (
          <div className="profile-page__cover-pattern" />
        )}

        <div className="profile-page__cover-nav">
          <button
            type="button"
            onClick={() => router.back()}
            className="profile-page__back-btn"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="profile-page__share-btn"
            title="Share profile link"
          >
            <Share2 size={14} /> Share Profile
          </button>
        </div>
      </div>

      <div className="profile-page__container">
        {/* ── 2. Hero Identity Card ── */}
        <div className="profile-page__hero-card">
          <div className="profile-page__hero-top">
            {/* Avatar Photo */}
            <div className="profile-page__avatar-wrap">
              {member.imageUrl ? (
                <Image
                  src={member.imageUrl}
                  alt={`${name}'s profile photo`}
                  fill
                  sizes="130px"
                  className="profile-page__avatar-img"
                />
              ) : (
                <div className="profile-page__avatar-placeholder">
                  {initial}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="profile-page__hero-info">
              {/* Role Badges */}
              <div className="profile-page__role-ribbon-row">
                {isAdmin && (
                  <span className="profile-page__pill profile-page__pill--admin" title="Platform Administrator">
                    <Crown size={12} /> ADMIN
                  </span>
                )}
                {isMod && !isAdmin && (
                  <span className="profile-page__pill profile-page__pill--moderator" title="Platform Moderator">
                    <ShieldCheck size={12} /> MOD
                  </span>
                )}
                {isExec && (
                  <span className="profile-page__pill profile-page__pill--executive">
                    <Sparkles size={12} /> ROOT USER / EXECUTIVE
                  </span>
                )}
                {isAdv && (
                  <span className="profile-page__pill profile-page__pill--advisor">
                    <GraduationCap size={12} /> SUDOER / ADVISOR
                  </span>
                )}
                {isAlumni && (
                  <span className="profile-page__pill profile-page__pill--alumni">
                    <Building2 size={12} /> ALUMNI NETWORK
                  </span>
                )}
                {!isExec && !isAdv && !isAlumni && (
                  <span className="profile-page__pill" style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={12} /> MEMBER
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="profile-page__name">{name}</h1>

              {/* Subtitle & Designation */}
              <div className="profile-page__subtitle">
                <span>{sessionDisplay}</span>
                {member.studentId && <span>• ID: {member.studentId}</span>}
              </div>
              <div className="profile-page__designation">{designation}</div>
            </div>
          </div>

          {/* Bio statement */}
          {member.bio && (
            <div className="profile-page__bio-box">
              &ldquo;{member.bio}&rdquo;
            </div>
          )}

          {/* Social Quick Bar */}
          <div className="profile-page__social-bar">
            {socials.github && (
              <a
                href={socials.github.startsWith("http") ? socials.github : `https://github.com/${socials.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-page__social-btn"
              >
                <IconGH /> GitHub
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-page__social-btn"
              >
                <IconLI /> LinkedIn
              </a>
            )}
            {socials.codeforces && (
              <a
                href={socials.codeforces.startsWith("http") ? socials.codeforces : `https://codeforces.com/profile/${socials.codeforces}`}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-page__social-btn"
              >
                <IconCF /> Codeforces
              </a>
            )}
            {socials.codechef && (
              <a
                href={socials.codechef.startsWith("http") ? socials.codechef : `https://www.codechef.com/users/${socials.codechef}`}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-page__social-btn"
              >
                <IconCC /> CodeChef
              </a>
            )}
            {socials.facebook && (
              <a
                href={socials.facebook.startsWith("http") ? socials.facebook : `https://facebook.com/${socials.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-page__social-btn"
              >
                <IconFB /> Facebook
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="profile-page__social-btn"
              >
                <Mail size={14} /> {member.email}
              </a>
            )}
          </div>
        </div>

        {/* ── 3. Bento Grid Section ── */}
        <div className="profile-page__grid">
          {/* Card 1: Academic & Club Standing */}
          <div className="profile-page__card">
            <h2 className="profile-page__card-title">
              <Layers size={16} /> Club & Academic Dossier
            </h2>
            <div className="profile-page__dossier-list">
              <div className="profile-page__dossier-row">
                <span className="profile-page__dossier-label">Department</span>
                <span className="profile-page__dossier-value">{member.department || "Computer Science & Eng."}</span>
              </div>
              <div className="profile-page__dossier-row">
                <span className="profile-page__dossier-label">Session</span>
                <span className="profile-page__dossier-value">{sessionDisplay}</span>
              </div>
              {member.studentId && (
                <div className="profile-page__dossier-row">
                  <span className="profile-page__dossier-label">Student ID</span>
                  <span className="profile-page__dossier-value">{member.studentId}</span>
                </div>
              )}
              <div className="profile-page__dossier-row">
                <span className="profile-page__dossier-label">Club Standing</span>
                <span className="profile-page__dossier-value">
                  {isAdv ? "Faculty Advisor" : isExec ? "Executive Committee" : isAlumni ? "Alumni Network" : "General Member"}
                </span>
              </div>
              <div className="profile-page__dossier-row">
                <span className="profile-page__dossier-label">Platform Privilege</span>
                <span className="profile-page__dossier-value">
                  {isAdmin ? "Administrator" : isMod ? "Moderator" : "Standard"}
                </span>
              </div>
              {member.address && (
                <div className="profile-page__dossier-row">
                  <span className="profile-page__dossier-label">Campus / City</span>
                  <span className="profile-page__dossier-value">{member.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Developer & CP Handles */}
          <div className="profile-page__card">
            <h2 className="profile-page__card-title">
              <Code2 size={16} /> Competitive & Dev Hub
            </h2>

            <div className="profile-page__handles-grid">
              {/* GitHub */}
              {socials.github ? (
                <a
                  href={socials.github.startsWith("http") ? socials.github : `https://github.com/${socials.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-page__handle-tile"
                >
                  <div className="profile-page__handle-icon">
                    <IconGH />
                  </div>
                  <div className="profile-page__handle-info">
                    <span className="profile-page__handle-platform">GitHub</span>
                    <span className="profile-page__handle-username">{socials.github.replace(/https?:\/\/(www\.)?github\.com\//, "")}</span>
                  </div>
                  <ExternalLink size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
                </a>
              ) : null}

              {/* Codeforces */}
              {socials.codeforces ? (
                <a
                  href={socials.codeforces.startsWith("http") ? socials.codeforces : `https://codeforces.com/profile/${socials.codeforces}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-page__handle-tile"
                >
                  <div className="profile-page__handle-icon">
                    <IconCF />
                  </div>
                  <div className="profile-page__handle-info">
                    <span className="profile-page__handle-platform">Codeforces</span>
                    <span className="profile-page__handle-username">{socials.codeforces.replace(/https?:\/\/(www\.)?codeforces\.com\/profile\//, "")}</span>
                  </div>
                  <ExternalLink size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
                </a>
              ) : null}

              {/* CodeChef */}
              {socials.codechef ? (
                <a
                  href={socials.codechef.startsWith("http") ? socials.codechef : `https://www.codechef.com/users/${socials.codechef}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-page__handle-tile"
                >
                  <div className="profile-page__handle-icon">
                    <IconCC />
                  </div>
                  <div className="profile-page__handle-info">
                    <span className="profile-page__handle-platform">CodeChef</span>
                    <span className="profile-page__handle-username">{socials.codechef.replace(/https?:\/\/(www\.)?codechef\.com\/users\//, "")}</span>
                  </div>
                  <ExternalLink size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
                </a>
              ) : null}

              {/* Discord */}
              {socials.discord ? (
                <button
                  type="button"
                  onClick={() => copyText(socials.discord, "Discord handle")}
                  className="profile-page__handle-tile"
                  style={{ textAlign: "left", width: "100%", cursor: "pointer", border: "1px solid var(--border-default)" }}
                >
                  <div className="profile-page__handle-icon">
                    <IconDiscord />
                  </div>
                  <div className="profile-page__handle-info">
                    <span className="profile-page__handle-platform">Discord</span>
                    <span className="profile-page__handle-username">{socials.discord}</span>
                  </div>
                  <Copy size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
                </button>
              ) : null}

              {/* LinkedIn */}
              {socials.linkedin ? (
                <a
                  href={socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-page__handle-tile"
                >
                  <div className="profile-page__handle-icon">
                    <IconLI />
                  </div>
                  <div className="profile-page__handle-info">
                    <span className="profile-page__handle-platform">LinkedIn</span>
                    <span className="profile-page__handle-username">Profile</span>
                  </div>
                  <ExternalLink size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />
                </a>
              ) : null}
            </div>

            {/* Fallback if no handles */}
            {!socials.github && !socials.codeforces && !socials.codechef && !socials.discord && !socials.linkedin && (
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
                No public handles connected yet.
              </p>
            )}
          </div>

          {/* Card 3: Club Activities & Badges */}
          <div className="profile-page__card" style={{ gridColumn: "span 2" }}>
            <h2 className="profile-page__card-title">
              <Award size={16} /> Club Engagements & Milestones
            </h2>
            <div className="profile-page__stat-badges">
              <div className="profile-page__stat-box">
                <div className="profile-page__stat-number">
                  {Array.isArray(member.eventsAttended) ? member.eventsAttended.length : 0}
                </div>
                <div className="profile-page__stat-text">Events Attended</div>
              </div>
              <div className="profile-page__stat-box">
                <div className="profile-page__stat-number">
                  {Array.isArray(member.certificates) ? member.certificates.length : 0}
                </div>
                <div className="profile-page__stat-text">Certificates</div>
              </div>
              <div className="profile-page__stat-box">
                <div className="profile-page__stat-number">
                  {Array.isArray(member.projectsContributed) ? member.projectsContributed.length : 0}
                </div>
                <div className="profile-page__stat-text">Projects</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
