"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown, ShieldCheck } from "lucide-react";
import { formatDeptSession } from "@/lib/formatters";

/* ============================================================
   Type Definitions
   ============================================================ */

export type ProfileCategory = "member" | "executive" | "alumni" | "advisor";

export interface ProfileSocials {
  linkedin?: string;
  github?: string;
  email?: string;
  facebook?: string;
  codeforces?: string;
  discord?: string;
  codechef?: string;
}

export interface ProfileCardProps {
  /** Unique slug for the /profiles/[slug] route */
  slug: string;
  name: string;
  /** e.g. "General Member" / "President" / "SWE @ Google" / "Asst. Professor, CSE" */
  role: string;
  /** Department, e.g. "CSE", "EEE", "CE", "ME" */
  department?: string;
  sublabel?: string;
  batch?: string;
  session?: string;
  category: ProfileCategory;
  badgeLabel?: string;
  image?: string;
  socials?: ProfileSocials;
  systemRole?: "admin" | "moderator" | "member" | string;
  onCardClick?: (slug: string) => void;
  actionMenu?: React.ReactNode;
  isMenuOpen?: boolean;
}

const CATEGORY_LABEL: Record<ProfileCategory, string> = {
  member: "MEMBER",
  executive: "EXECUTIVE",
  alumni: "ALUMNI",
  advisor: "ADVISOR",
};

/* Social icon SVGs */
const IconGitHub = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconCodeforces = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <rect x="2" y="10" width="4" height="12" rx="1" />
    <rect x="10" y="4" width="4" height="18" rx="1" />
    <rect x="18" y="7" width="4" height="15" rx="1" />
  </svg>
);

const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconDiscord = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const IconCodeChef = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M11.2574.0039c-.37.0101-.7353.041-1.1003.095C9.6164.153 9.0766.4236 8.482.694c-.757.3244-1.5147.6486-2.2176.7027-1.1896.3785-1.568.919-1.8925 1.3516 0 .054-.054.1079-.054.1079-.4325.865-.4873 1.73-.325 2.5952.1621.5407.3786 1.0282.5408 1.5148.3785 1.0274.7578 2.0007.92 3.1362.1622.3244.3235.7571.4316 1.1897.2704.8651.542 1.8383 1.353 2.5952l.0057-.0028c.0175.0183.0301.0387.0482.0568.0072-.0036.0141-.0063.0213-.0099l-.0213-.5849c.6489-.9733 1.5673-1.6221 2.865-1.8925.5195-.1093 1.081-.1497 1.6625-.1278a8.7733 8.7733 0 0 1 1.7988.2357c1.4599.3785 2.595 1.1358 2.6492 1.7846.0273.3549.0398.6952.0326 1.0364-.001.064-.0046.1285-.007.193l.1362.0682c.075-.0375.1424-.107.2059-.1902.0008-.001.002-.002.0028-.0028.0018-.0023.0039-.0061.0057-.0085.0396-.0536.0747-.1236.1107-.1931.0188-.0377.0372-.0866.0554-.1292.2048-.4622.362-1.1536.538-1.9635.0541-.2703.1092-.4864.1633-.7027.4326-.9733 1.0266-1.8382 1.6213-2.6492.9733-1.3518 1.8928-2.5962 1.7846-4.0561-1.784-3.4608-4.2718-4.0017-5.5695-4.272-.2163-.0541-.3233-.0539-.4856-.108-1.3382-.2433-2.4945-.3953-3.6046-.3648zm5.0428 14.3788a9.8602 9.8602 0 0 0-.0326-.9824c-.0541-.703-1.1892-1.46-2.7032-1.8386-.588-.1336-1.1764-.2142-1.7448-.2356-.539-.0137-1.0657.0248-1.5546.1277-1.2436.2704-2.2162.9193-2.811 1.8925l.0511 1.431c.6672-.3558 1.7326-.8747 3.139-.9994.0662-.0059.1368-.0059.2044-.0099.1177-.013.2667-.044.4444-.044 1.6075 0 3.2682.5336 4.8767 1.6483.039-.2744.0611-.549.071-.8234l.044.0227c.0028-.0622.0143-.1268.0156-.1888zM11.256.0578c.1239-.0034.2538.01.379.0114-.23-.0022-.4588.0026-.6871.0156.103-.0061.2046-.0242.308-.027zm.4983.0156c.6552.014 1.3255.0711 2.0387.1803-.6834-.0987-1.3646-.1671-2.0387-.1803zm-1.3147.0554c-.076.0087-.1527.0133-.2285.0241-.8168.1167-1.7742.7015-2.75 1.045.3545-.1323.7143-.2957 1.0747-.4501C9.0765.4774 9.6705.207 10.1571.1529c.0939-.0139.1886-.0133.2825-.0241zm-.2285.24c.1622 0 .3787-.0002.5409.0539-.1425-.0357-.2595-.026-.3706-.0142a1.174 1.174 0 0 1 .3166.0681c.5796 1.0012-.4264 5.2791-.6786 8.1492.1559 1.0276.3138 1.9963.4628 2.7201-.7029-1.7843-1.4067-4.921-1.5148-7.354-.054-.9733.001-1.8386.2172-2.4874C9.401.8557 9.7244.4228 10.2111.3687zm3.1361.271c-.811 2.1088-.9184 6.1092-.9725 7.3528-.054.5407-.0001 1.73.054 2.5952 0 .2163.054.4325.054.6488 0-.2163-.054-.3786-.054-.5948-.4326-3.2442-.974-7.1362.9185-10.002zm3.352.3777c-.2704 2.1628-1.4047 3.191-1.7832 5.2998-.1081 1.6762-.325 3.6222-.379 5.2984-.0541-1.6762-.0007-3.4601.2697-5.2444.2703-1.8384.8651-3.6776 1.8925-5.3538zm-10.381.433c-.3581.1194-.632.248-.8575.3805.2317-.1358.4996-.2666.8575-.3805zm.2101.1974c.2155.0025.4384.0734.6006.2357-.0067-.004-.0078-.0033-.0142-.0071.1331.0929.2666.2093.3932.3847-.2036.9673.2553 3.0317.0398 4.6694.0763 1.5485.0717 3.1804.849 4.4594-.9796-1.5107-1.176-3.4375-1.3218-5.236-.1128-1.0907-.2035-2.0969-.4642-2.9033-.144-.3047-.2684-.5745-.3833-.822-.0247-.0369-.0447-.0784-.071-.1135-.1082-.1082-.1619-.2696-.1619-.3777 0-.054.0539-.1618.108-.1618.054-.0541.1616-.0553.2157-.1094a1.013 1.013 0 0 1 .2101-.0184zm-1.3459.6133c-.0604.0201-.0923.041-.1405.061.1768-.034.3617.0339.5196.318-.1877.8916.4364 3.3685.4288 5.104.3124 1.8478.5496 3.8498 1.5716 5.1152C6.3723 11.5076 5.886 9.1286 5.5076 7.128 5.183 5.56 4.9125 4.2086 4.3718 3.776c-.054-.1081-.1079-.163-.1079-.2711 0-.1622-.0002-.3786.1079-.5949-.2772.6337-.4047 1.2673-.3706 1.901-.0445-.6487.0857-1.2905.3706-1.901 0-.054.054-.0538.054-.1079.012-.016.0314-.0349.044-.0511.0618-.0983.1308-.189.2257-.257.0557-.0615.0965-.1191.159-.1817-.0526.0555-.0872.1092-.1335.1647.0273-.018.0523-.0368.0838-.0525.1081-.1082.2154-.1633.3776-.1633zm-.3776.1633c-.0038.0075-.0076.0111-.0114.0184.0125-.0099.0242-.0208.037-.0298-.0074.0037-.0182.0077-.0256.0114zm14.7608 1.1343c-.0017.0052-.004.0104-.0057.0156.0378-.005.0751-.0173.1135-.0156-.0378-.0022-.0763.0103-.115.0199-.8634 2.6418-1.8874 5.2844-2.9118 7.9262a.0184.0184 0 0 1-.0015.0028c-.0874.4652-.234.8842-.5395 1.1898.4326-.4867.4854-1.1907.5395-2.0558.054-.811.0544-1.6761.487-2.5413 0-.0531.0012-.1058.0525-.159.0003-.0009.0012-.0019.0015-.0028.0973-.3524.202-.6885.3166-1.018.4183-1.2896 1.1396-3.1653 2.0131-3.3405.0163-.0052.034-.018.0497-.0213zM8.3726 16.2113l-.3238.1079c.1623.2163.2696.379.3777.433.1081.054.2168.108.379.108.0541 0 .1618 0 .2159-.054l.812-.2698c.0541 0 .1078-.054.1619-.054.1081 0 .1616 0 .2697.054l.2712.2698.2697-.054c-.1081-.1622-.2695-.3236-.3776-.3776-.1082-.0541-.2169-.1094-.379-.1094h-.108l-.866.3252h-.1618c-.1082 0-.2157 0-.2698-.054-.054-.054-.163-.1629-.2712-.3251zm-2.5953.541c-.2703.1621-.649.4324-1.1897.6487-.5407.2163-.9734.4325-1.1897.6488-.2163.2163-.3237.4326-.3237.6488 0 .1082.0537.1632.1618.2172.054.0541.1632.0539.2172.108.757.3244 1.5133.7019 2.2162 1.0803.1082.0541.2171.1632.2712.2173.054.054.1078.054.1618.054.1082 0 .2695-.0538.3777-.162.1081-.108.1632-.217.1632-.325 0-.1082-.055-.1618-.1632-.2158 0 0-.4328-.2165-1.1898-.541-.4866-.2162-.9179-.4326-1.1883-.5948.1623-.2704.486-.4865.9726-.7028.5407-.2163.9196-.4326 1.0818-.5948.054-.0541.054-.1078.054-.1619 0-.054-.0539-.1631-.108-.2172-.054-.054-.163-.1079-.2711-.1079zm11.247 0c-.054 0-.1618.0537-.2158.1078-.0541.1081-.1093.1632-.1093.2172v.054c.1622.1622.3797.2695.7041.3776.2704.054.5403.1632.8107.2172.3244.1082.5407.2693.6488.4856v.0553c0 .0541-.1088.1616-.3251.2698-.1082.054-.3245.2167-.5949.433-.2703.1622-.4326.3236-.5948.3776-.2163.1082-.3776.217-.4316.3252-.0541.054-.054.1077-.054.1618 0 .1081.0539.1077.108.2158.054.1081.1616.1093.2157.1093.054 0 .1078-.0554.1619-.0554.2703-.1622.6492-.3782 1.0818-.7567.4866-.3784.8655-.6484 1.0818-.8106.2163-.1082.3237-.2169.3237-.379 0-.0541.0002-.1618-.1079-.2159-.3785-.4325-.9185-.7022-1.5674-.9185-.1081-.0541-.2704-.1092-.5948-.1633-.1622-.054-.3249-.1079-.433-.1079zm-2.9743.8106c-.2704 0-.4866.055-.6488.2172-.2163.1622-.2699.4323-.2158.7567 0 .2703.1075.4865.2697.7027.1622.2163.3786.3252.5949.3252.1622 0 .2708-.0553.433-.1094.2703-.1622.379-.4319.379-.9185 0-.3785-.109-.6485-.2711-.8107-.1622-.1081-.3246-.1632-.541-.1632zm-4.4877.054c-.2704 0-.4866.055-.6488.2171-.2163.1622-.27.4323-.2158.7567 0 .2704.1075.4865.2697.7028s.3786.3251.5949.3251c.1622 0 .2708-.0552.433-.1093.2703-.1622.3776-.432.3776-.9186 0-.4325-.1075-.7025-.2697-.8106-.1622-.1082-.3247-.1633-.541-.1633zm0 .6501c.1622 0 .2711.1076.2711.2698 0 .1622-.163.2697-.2711.2697-.1622 0-.2698-.1075-.2698-.2697s.1076-.2698.2698-.2698zm4.3798.054c.1622 0 .2711.1075.2711.2697 0 .1082-.109.2698-.2711.2698-.1622 0-.2698-.1076-.2698-.2698 0-.1622.1076-.2697.2698-.2697zm-2.7032 2.1083l.1619.3237c.054.1081.1076.163.2158.2711.054.054.163.1619.2712.1619h.1078c.1082 0 .1618 0 .2158-.054.0541-.054.1632-.0538.2173-.1079l.1618-.1618c.054-.054.108-.1092.108-.1633.054-.054.0537-.1078.1078-.1618 0-.0541.054-.108.054-.108-.0541.1082-.1618.2156-.2158.3238-.1082.054-.1616.1632-.2698.1632-.1081.0541-.217.054-.3251.054s-.2157.0001-.2697-.054c-.1082 0-.1632-.0538-.2173-.1079l-.1618-.1632c-.054-.0541-.1078-.1618-.1619-.2158zm-.866 1.0278c-1.1355 0-1.8377 1.5136-3.4598.1619-.4326 2.6494 2.7583 2.866 4.11 1.7306.9192-.811.6475-1.9465-.6502-1.8925zm2.8664 0c-1.2977-.054-1.568 1.0815-.6488 1.8925 1.3518 1.1355 4.5412.9188 4.1087-1.7306-1.6221 1.3517-2.2703-.1619-3.4599-.1619z" />
  </svg>
);

interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function ensureUrl(base: string, value: string): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('www.')) return 'https://' + trimmed;
  const hostPart = base.replace(/^https?:\/\//, '').split('/')[0];
  if (trimmed.includes(hostPart)) return 'https://' + trimmed.replace(/^\/+/, '');
  return base + trimmed.replace(/^@/, '').replace(/^\/+/, '');
}

function buildSocialLinks(
  socials: ProfileSocials | undefined,
  name: string,
): SocialLink[] {
  if (!socials) return [];
  const links: SocialLink[] = [];

  if (socials.linkedin)
    links.push({ href: ensureUrl('https://linkedin.com/in/', socials.linkedin), label: `${name}'s LinkedIn`, icon: <IconLinkedIn /> });
  if (socials.github)
    links.push({ href: ensureUrl('https://github.com/', socials.github), label: `${name}'s GitHub`, icon: <IconGitHub /> });
  if (socials.email)
    links.push({ href: `mailto:${socials.email}`, label: `Email ${name}`, icon: <IconEmail /> });
  if (socials.discord)
    links.push({ href: `https://discord.com`, label: `${name}'s Discord`, icon: <IconDiscord /> });
  if (socials.facebook)
    links.push({ href: ensureUrl('https://facebook.com/', socials.facebook), label: `${name}'s Facebook`, icon: <IconFacebook /> });
  if (socials.codeforces)
    links.push({ href: ensureUrl('https://codeforces.com/profile/', socials.codeforces), label: `${name}'s Codeforces`, icon: <IconCodeforces /> });
  if (socials.codechef)
    links.push({ href: ensureUrl('https://www.codechef.com/users/', socials.codechef), label: `${name}'s CodeChef`, icon: <IconCodeChef /> });

  return links;
}

export function ProfileCard({
  slug,
  name,
  role,
  department,
  sublabel,
  batch,
  session,
  category,
  badgeLabel,
  systemRole,
  image,
  socials,
  onCardClick,
  actionMenu,
  isMenuOpen,
}: ProfileCardProps) {
  const [imgError, setImgError] = useState(false);

  const initial = name.trim().charAt(0).toUpperCase();

  const displaySession =
    category === "advisor"
      ? session && session !== "Faculty"
        ? session
        : department
        ? `Dept. of ${department}`
        : "Faculty"
      : category === "alumni"
      ? batch || (session ? `Batch: ${session}` : "")
      : formatDeptSession(department, session, batch);

  const socialLinks = buildSocialLinks(socials, name);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(
        ".profile-card-action-wrap, .event-more-dropdown, .event-more-btn, .event-more-item, .profile-card-social-footer, .profile-card-social-cell"
      )
    ) {
      return;
    }
    if (onCardClick) {
      onCardClick(slug);
    }
  };

  const hasPhoto = Boolean(image && image.trim() && !imgError);

  const cardMainContent = (
    <>
      {/* 1. Photo block */}
      <div className="w-full aspect-square relative border-b border-border-brutalist dark:border-border-default shrink-0 bg-surface-secondary overflow-hidden">
        {hasPhoto ? (
          <Image
            src={image!}
            alt={`${name}'s photo`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized={image?.startsWith("data:") || image?.startsWith("blob:")}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-bold text-5xl text-accent-primary bg-surface-secondary select-none [background-image:radial-gradient(var(--border-default)_1px,transparent_1px)] [background-size:16px_16px] dark:[background-image:radial-gradient(var(--grid-lines)_1px,transparent_1px)]"
            aria-hidden="true"
          >
            {initial}
          </div>
        )}

        {/* Corner Bookmark Ribbon */}
        {systemRole && systemRole !== "member" && (
          <div
            className={`absolute top-0 left-0 z-10 inline-flex items-center gap-1 py-1 px-2 font-sans text-[9.5px] font-extrabold tracking-wider uppercase leading-none border-b-2 border-r-2 border-black rounded-br-md shadow-[2px_2px_0px_rgba(0,0,0,0.4)] select-none ${
              systemRole === "admin"
                ? "bg-gradient-to-br from-[#FDE047] to-[#F59E0B] text-black"
                : "bg-gradient-to-br from-[#FED7AA] to-[#EA580C] text-black"
            }`}
            title={systemRole === "admin" ? "Platform Administrator" : "Platform Moderator"}
          >
            {systemRole === "admin" ? (
              <>
                <Crown size={11} className="shrink-0" />
                <span>ADMIN</span>
              </>
            ) : systemRole === "moderator" ? (
              <>
                <ShieldCheck size={11} className="shrink-0" />
                <span>MOD</span>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* 2. Content block */}
      <div className="flex flex-col p-3 flex-1 min-w-0 text-center">
        <p className="font-bold text-base tracking-tight leading-tight text-text-primary mb-1 truncate group-hover:text-accent-primary-hover transition-colors" title={name}>{name}</p>
        {displaySession ? (
          <p className="font-semibold text-xs tracking-wide text-accent-text-on-surface dark:text-accent-primary-hover mb-0.5 truncate" title={displaySession}>
            {displaySession}
          </p>
        ) : null}
        <p className="text-sm text-text-secondary truncate" title={role}>{role}</p>
      </div>
    </>
  );

  return (
    <div
      className={`flex flex-col bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-xl no-underline text-inherit cursor-pointer relative transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none group ${
        isMenuOpen ? "overflow-visible z-[200]" : "overflow-hidden"
      }`}
      id={`profile-${slug}`}
    >
      {/* 3-Dot Action Menu */}
      {actionMenu && (
        <div
          className="profile-card-action-wrap absolute top-2.5 right-2.5 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {actionMenu}
        </div>
      )}

      {/* Main Clickable Area */}
      {onCardClick ? (
        <div
          className="flex flex-col flex-1 text-inherit no-underline cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) => e.key === "Enter" && onCardClick(slug)}
          aria-label={`View profile: ${name}`}
        >
          {cardMainContent}
        </div>
      ) : (
        <Link
          href={`/profile/${slug}`}
          className="flex flex-col flex-1 text-inherit no-underline cursor-pointer"
          aria-label={`View profile: ${name}`}
        >
          {cardMainContent}
        </Link>
      )}

      {/* 3. Social footer */}
      {socialLinks.length > 0 && (
        <div className="profile-card-social-footer flex items-stretch border-t border-border-brutalist dark:border-border-default bg-surface-primary dark:bg-transparent" role="group" aria-label="Social links">
          {socialLinks.map(({ href, label, icon }, i) => (
            <a
              key={label}
              href={href}
              className="profile-card-social-cell flex-1 flex items-center justify-center py-2.5 text-text-tertiary no-underline relative transition-colors hover:text-accent-primary-hover hover:bg-accent-primary-light"
              aria-label={label}
              title={label}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              onClick={(e) => e.stopPropagation()}
            >
              {i > 0 && <span className="absolute left-0 top-[18%] h-[64%] w-[1px] bg-border-brutalist dark:bg-border-default opacity-15 dark:opacity-100 pointer-events-none" aria-hidden="true" />}
              {icon}
            </a>
          ))}
        </div>
      )}

      {/* 4. Corner badge */}
      {!actionMenu && (
        <div className="absolute top-2 right-2 font-bold text-[9px] tracking-wide bg-accent-primary text-accent-primary-text py-0.5 px-1.5 rounded pointer-events-none select-none z-[5] shadow-[1px_1px_0_var(--border-brutalist)]">
          {badgeLabel || CATEGORY_LABEL[category]}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ProfileGrid — responsive grid wrapper
   ============================================================ */

interface ProfileGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ProfileGrid({ children, className = "" }: ProfileGridProps) {
  return (
    <div className={`grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-5 ${className}`.trim()}>
      {children}
    </div>
  );
}
