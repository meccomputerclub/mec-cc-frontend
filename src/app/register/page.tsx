"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { api, ApiError } from "@/lib/api";
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Mail,
  ArrowRight,
  Send,
  Upload,
  RefreshCw,
  Sparkles,
  GraduationCap,
  Building2,
  Users,
  Move,
  ZoomIn,
} from "lucide-react";
import { compressImage } from "@/lib/imageCompressor";
import "./register.css";

/* ── Auto-link builders ── */
export const toSocialUrl = (
  platform: "linkedin" | "github" | "facebook" | "codeforces" | "codechef" | "generic",
  value: string
): string => {
  if (!value) return "";
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;

  const clean = v.replace(/^@/, "").replace(/^\/+/, "");

  switch (platform) {
    case "linkedin":
      if (clean.startsWith("www.linkedin.com") || clean.startsWith("linkedin.com")) {
        return `https://${clean}`;
      }
      if (clean.startsWith("in/")) {
        return `https://linkedin.com/${clean}`;
      }
      return `https://linkedin.com/in/${clean}`;

    case "github":
      if (clean.startsWith("www.github.com") || clean.startsWith("github.com")) {
        return `https://${clean}`;
      }
      return `https://github.com/${clean}`;

    case "facebook":
      if (clean.startsWith("www.facebook.com") || clean.startsWith("facebook.com") || clean.startsWith("fb.com")) {
        return `https://${clean}`;
      }
      return `https://facebook.com/${clean}`;

    case "codeforces":
      if (clean.startsWith("www.codeforces.com") || clean.startsWith("codeforces.com")) {
        return `https://${clean}`;
      }
      return `https://codeforces.com/profile/${clean}`;

    case "codechef":
      if (clean.startsWith("www.codechef.com") || clean.startsWith("codechef.com")) {
        return `https://${clean}`;
      }
      return `https://codechef.com/users/${clean}`;

    default:
      if (clean.startsWith("www.") || clean.includes(".")) {
        return `https://${clean}`;
      }
      return clean;
  }
};

const toGithubUrl = (u: string) => toSocialUrl("github", u);
const toLiUrl = (u: string) => toSocialUrl("linkedin", u);
const toFbUrl = (u: string) => toSocialUrl("facebook", u);
const toCfUrl = (u: string) => toSocialUrl("codeforces", u);
const toCodechefUrl = (u: string) => toSocialUrl("codechef", u);

const DEPARTMENT_OPTIONS = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "EEE", label: "Electrical & Electronic (EEE)" },
  { value: "CE", label: "Civil Engineering (CE)" },
];

const ADVISOR_DEPT_OPTIONS = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "EEE", label: "Electrical & Electronic (EEE)" },
  { value: "CE", label: "Civil Engineering (CE)" },
  { value: "Administration", label: "Administration" },
  { value: "Basic Science", label: "Basic Science & Humanities" },
];

/** Returns ordinal suffix: 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", etc. */
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Builds batch select options for a department.
 * Shows the most recent `count` batches (default 10), from oldest up to juniorBatch.
 * e.g. CSE juniorBatch=6 → ["CSE-1st", "CSE-2nd", ..., "CSE-6th"]
 */
function getBatchOptions(dept: string, config: Record<string, number>, count = 10) {
  if (!dept) return [];
  const d = dept.toUpperCase();
  const juniorBatch = config[d] || (d === "EEE" ? 14 : d === "CE" ? 8 : 6);
  const oldest = Math.max(1, juniorBatch - count + 1);
  const options = [];
  for (let i = oldest; i <= juniorBatch; i++) {
    const batchLabel = `${d}-${ordinal(i)}`;
    options.push({ value: batchLabel, label: batchLabel });
  }
  return options;
}


const ADVISOR_HONORIFICS = [
  { value: "None", label: "None" },
  { value: "Dr.", label: "Dr." },
  { value: "Prof.", label: "Prof." },
  { value: "Prof. Dr.", label: "Prof. Dr." },
  { value: "Engr.", label: "Engr." },
  { value: "Mr.", label: "Mr." },
  { value: "Ms.", label: "Ms." },
];

const ADVISOR_STANDING_OPTIONS = [
  { value: "Chief Patron & Principal", label: "Chief Patron & Principal" },
  { value: "Chief Advisor", label: "Chief Advisor" },
  { value: "Faculty Advisor", label: "Faculty Advisor" },
  { value: "Technical Advisor", label: "Technical Advisor" },
  { value: "Research Mentor", label: "Research Mentor" },
];

/* ── Social Icon SVGs ── */
const IconGH = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
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
    <rect x="2" y="10" width="4" height="12" rx="1"/>
    <rect x="10" y="4" width="4" height="18" rx="1"/>
    <rect x="18" y="7" width="4" height="15" rx="1"/>
  </svg>
);

const IconCC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11.2574.0039c-.37.0101-.7353.041-1.1003.095C9.6164.153 9.0766.4236 8.482.694c-.757.3244-1.5147.6486-2.2176.7027-1.1896.3785-1.568.919-1.8925 1.3516 0 .054-.054.1079-.054.1079-.4325.865-.4873 1.73-.325 2.5952.1621.5407.3786 1.0282.5408 1.5148.3785 1.0274.7578 2.0007.92 3.1362.1622.3244.3235.7571.4316 1.1897.2704.8651.542 1.8383 1.353 2.5952l.0057-.0028c.0175.0183.0301.0387.0482.0568.0072-.0036.0141-.0063.0213-.0099l-.0213-.5849c.6489-.9733 1.5673-1.6221 2.865-1.8925.5195-.1093 1.081-.1497 1.6625-.1278a8.7733 8.7733 0 0 1 1.7988.2357c1.4599.3785 2.595 1.1358 2.6492 1.7846.0273.3549.0398.6952.0326 1.0364-.001.064-.0046.1285-.007.193l.1362.0682c.075-.0375.1424-.107.2059-.1902.0008-.001.002-.002.0028-.0028.0018-.0023.0039-.0061.0057-.0085.0396-.0536.0747-.1236.1107-.1931.0188-.0377.0372-.0866.0554-.1292.2048-.4622.362-1.1536.538-1.9635.0541-.2703.1092-.4864.1633-.7027.4326-.9733 1.0266-1.8382 1.6213-2.6492.9733-1.3518 1.8928-2.5962 1.7846-4.0561-1.784-3.4608-4.2718-4.0017-5.5695-4.272-.2163-.0541-.3233-.0539-.4856-.108-1.3382-.2433-2.4945-.3953-3.6046-.3648zm5.0428 14.3788a9.8602 9.8602 0 0 0-.0326-.9824c-.0541-.703-1.1892-1.46-2.7032-1.8386-.588-.1336-1.1764-.2142-1.7448-.2356-.539-.0137-1.0657.0248-1.5546.1277-1.2436.2704-2.2162.9193-2.811 1.8925l.0511 1.431c.6672-.3558 1.7326-.8747 3.139-.9994.0662-.0059.1368-.0059.2044-.0099.1177-.013.2667-.044.4444-.044 1.6075 0 3.2682.5336 4.8767 1.6483.039-.2744.0611-.549.071-.8234l.044.0227c.0028-.0622.0143-.1268.0156-.1888z"/></svg>
);

const IconDiscord = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

/* ── PrefixInput ── */
interface PrefixInputProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  label: string;
  prefix: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  generatedUrl?: string;
}

function PrefixInput({ id, name, icon, label, prefix, placeholder, value, onChange, required, generatedUrl }: PrefixInputProps) {
  return (
    <div className="jc-form-group">
      <label htmlFor={id}>
        {icon} {label}
        {required && <span className="jc-required"> *</span>}
      </label>
      <div className="jc-prefix-input">
        <span className="jc-prefix-input__base" aria-hidden="true">{prefix}</span>
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-label={label}
        />
      </div>
      {generatedUrl && (
        <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="jc-generated-url">
          ↗ {generatedUrl}
        </a>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LIVE CARD PREVIEW COMPONENT
   ════════════════════════════════════════════════════════════ */
interface LiveCardProps {
  roleType: "member" | "alumni" | "advisor";
  name: string;
  subTitle: string;
  designation: string;
  photoUrl: string | null;
  initial: string;
  socials: { icon: React.ReactNode; label: string; url: string }[];
  photoPosX?: number;
  photoPosY?: number;
  photoZoom?: number;
  onPositionChange?: (x: number, y: number) => void;
}

function LiveCardPreview({
  roleType,
  name,
  subTitle,
  designation,
  photoUrl,
  initial,
  socials,
  photoPosX = 50,
  photoPosY = 50,
  photoZoom = 100,
  onPositionChange,
}: LiveCardProps) {
  const photoBoxRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 50, posY: 50 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoUrl || !onPositionChange) return;
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: photoPosX,
      posY: photoPosY,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !photoBoxRef.current) return;
      const rect = photoBoxRef.current.getBoundingClientRect();
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;

      const nextX = Math.min(100, Math.max(0, dragStartRef.current.posX - (dx / rect.width) * 100));
      const nextY = Math.min(100, Math.max(0, dragStartRef.current.posY - (dy / rect.height) * 100));

      onPositionChange(Math.round(nextX), Math.round(nextY));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="jc-preview-card">
      {/* Top Corner Ribbon */}
      {roleType === "advisor" && (
        <div className="jc-preview-card__badge" style={{ background: "var(--accent-primary)", color: "var(--accent-primary-text)" }}>
          ADVISOR
        </div>
      )}
      {roleType === "alumni" && (
        <div className="jc-preview-card__badge" style={{ background: "var(--accent-primary)", color: "var(--accent-primary-text)" }}>
          ALUMNI
        </div>
      )}
      {roleType === "member" && (
        <div className="jc-preview-card__badge">
          MEC CC
        </div>
      )}

      {/* Photo */}
      <div
        ref={photoBoxRef}
        onMouseDown={handleMouseDown}
        className="jc-preview-card__photo"
        style={{ cursor: photoUrl && onPositionChange ? "grab" : "default", userSelect: "none" }}
      >
        {photoUrl ? (
          <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt="preview"
              draggable={false}
              style={{
                width: `${photoZoom}%`,
                height: `${photoZoom}%`,
                objectFit: "cover",
                objectPosition: `${photoPosX}% ${photoPosY}%`,
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
            {onPositionChange && (
              <div
                style={{
                  position: "absolute",
                  bottom: "6px",
                  right: "6px",
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Move size={10} />
                <span>Drag to align</span>
              </div>
            )}
          </div>
        ) : (
          <span className="jc-preview-card__initial">{initial || "?"}</span>
        )}
      </div>

      {/* Details */}
      <div className="jc-preview-card__content">
        <p className="jc-preview-card__name">{name || "Your Full Name"}</p>
        <p className="jc-preview-card__batch" style={{ color: "var(--accent-primary)", fontWeight: 700 }}>
          {subTitle || (roleType === "advisor" ? "Faculty Advisor" : roleType === "alumni" ? "Alumni Network Member" : "CSE (5th Batch)")}
        </p>
        <p className="jc-preview-card__role">
          {designation || (roleType === "advisor" ? "Distinguished Advisor" : roleType === "alumni" ? "Alumni Network Member" : "Club Member")}
        </p>
      </div>

      {/* Social Bar */}
      {socials.length > 0 && (
        <div className="jc-preview-card__social-footer">
          {socials.map((s, i) => (
            <span key={i} className="jc-preview-card__social-cell" title={s.label}>
              {i > 0 && <span className="jc-preview-card__social-sep" aria-hidden="true" />}
              {s.icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN REGISTRATION COMPONENT
   ════════════════════════════════════════════════════════════ */
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrlCode = searchParams.get("code") || "";
  const initialRoleParam = searchParams.get("role") || "";

  const isValidRoleParam = Boolean(
    initialRoleParam && ["member", "alumni", "advisor"].includes(initialRoleParam.toLowerCase())
  );

  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [inviteCode, setInviteCode] = useState(initialUrlCode);
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeChecking, setCodeChecking] = useState(Boolean(initialUrlCode));
  const [gateError, setGateError] = useState<string | null>(null);
  const [emailLocked, setEmailLocked] = useState(false);

  // Role Type is locked to the specific invited role
  const [formRole, setFormRole] = useState<"member" | "alumni" | "advisor">(
    (isValidRoleParam ? initialRoleParam.toLowerCase() : "member") as any
  );

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");

  // Member Fields
  const [studentId, setStudentId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [session, setSession] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [batch, setBatch] = useState("");
  const [batchConfig, setBatchConfig] = useState<Record<string, number>>({ CSE: 6, EEE: 14, CE: 8 });
  const [isGraduated, setIsGraduated] = useState<boolean>(
    Boolean(isValidRoleParam && initialRoleParam.toLowerCase() === "alumni")
  );

  // Alumni Fields
  const [alumniDepartment, setAlumniDepartment] = useState("CSE");
  const [alumniBatch, setAlumniBatch] = useState("");
  const [passingYear, setPassingYear] = useState("");
  const [formerStudentId, setFormerStudentId] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");

  // Advisor Fields
  const [honorific, setHonorific] = useState("None");
  const [advisorStanding, setAdvisorStanding] = useState("Faculty Advisor");
  const [advisorDepartment, setAdvisorDepartment] = useState("CSE");
  const [institutionalPost, setInstitutionalPost] = useState("Head of CSE Department");
  const [facultyId, setFacultyId] = useState("");
  const [researchInterests, setResearchInterests] = useState("");

  // Socials
  const [facebook, setFacebook] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [discord, setDiscord] = useState("");
  const [codeforces, setCodeforces] = useState("");
  const [codechef, setCodechef] = useState("");

  // Photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoPosX, setPhotoPosX] = useState<number>(50);
  const [photoPosY, setPhotoPosY] = useState<number>(50);
  const [photoZoom, setPhotoZoom] = useState<number>(100);
  const [compressingPhoto, setCompressingPhoto] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Status & submission
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Email verification stage (Stage 3)
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Fetch batch config from public API on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/site-settings/public`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setBatchConfig(d.data); })
      .catch(() => {/* use defaults */});
  }, []);

  // Initialize role if provided in URL (DO NOT advance stage without clearance verification)
  useEffect(() => {
    if (initialRoleParam && ["member", "alumni", "advisor"].includes(initialRoleParam.toLowerCase())) {
      const role = initialRoleParam.toLowerCase() as any;
      setFormRole(role);
      if (role === "alumni") setIsGraduated(true);
    }
  }, [initialRoleParam]);

  // Auto-verify if code exists in URL
  useEffect(() => {
    if (initialUrlCode && !codeVerified) {
      handleVerifyInvite(initialUrlCode);
    }
  }, [initialUrlCode]);

  const handleVerifyInvite = async (codeToTest?: string) => {
    const targetCode = (codeToTest || inviteCode).trim();
    if (!targetCode) {
      setGateError("Please enter your invitation access key.");
      setCodeChecking(false);
      return;
    }

    setGateError(null);
    setCodeChecking(true);

    try {
      const res = await api.post("/api/invite/verify", { code: targetCode });
      if (res.success) {
        setCodeVerified(true);
        setInviteCode(targetCode);
        if (res.data?.email) {
          setEmail(res.data.email);
          setEmailLocked(true);
        }
        if (res.data?.role && ["member", "alumni", "advisor"].includes(res.data.role.toLowerCase())) {
          const role = res.data.role.toLowerCase() as any;
          setFormRole(role);
          if (role === "alumni") setIsGraduated(true);
        }
        toast.success("Invitation clearance verified! Form unlocked.");
        setStage(2);
      } else {
        setCodeVerified(false);
        setStage(1);
        setGateError(res.message || "Invalid or expired invitation code.");
      }
    } catch (err: any) {
      setCodeVerified(false);
      setStage(1);
      const msg = err instanceof ApiError ? err.message : err?.message || "Invalid or expired invitation code.";
      setGateError(msg);
      toast.error(msg);
    } finally {
      setCodeChecking(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    setCompressingPhoto(true);

    try {
      // Silent compression - no popup toast
      const result = await compressImage(file, {
        maxSizeMB: 1.0,
        maxWidthOrHeight: 1200,
      });

      setPhotoError(null);
      setSelectedFile(result.file);
      setPhotoUrl(result.previewUrl);
      setPhotoPosX(50);
      setPhotoPosY(50);
      setPhotoZoom(100);
    } catch (err: any) {
      console.error("Compression error:", err);
      // Fallback
      setPhotoError(null);
      setSelectedFile(file);
      setPhotoUrl(URL.createObjectURL(file));
      setPhotoPosX(50);
      setPhotoPosY(50);
      setPhotoZoom(100);
    } finally {
      setCompressingPhoto(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedFile) {
      setFormError("Profile photo is required.");
      toast.error("Please upload a profile photo.");
      return;
    }

    if (!facebook.trim()) {
      setFormError("Facebook profile is required.");
      toast.error("Please enter your Facebook profile.");
      return;
    }

    if (!contactNumber.trim()) {
      setFormError("Contact phone number is required.");
      toast.error("Please enter your contact phone number.");
      return;
    }

    if ((formRole === "member" || formRole === "alumni" || isGraduated) && !session.trim()) {
      setFormError("Academic session is required.");
      toast.error("Please enter your academic session.");
      return;
    }

    if (formRole === "member" && !batch.trim()) {
      setFormError("Batch is required.");
      toast.error("Please select your batch.");
      return;
    }

    if (formRole === "alumni" && !alumniBatch.trim()) {
      setFormError("Batch is required.");
      toast.error("Please select your batch.");
      return;
    }

    if ((isGraduated || formRole === "alumni") && !passingYear.toString().trim()) {
      setFormError("Passing year is required for graduates.");
      toast.error("Please enter your passing year.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      toast.error("Passwords do not match. Please recheck.");
      return;
    }

    setSubmitting(true);

    try {
      const hasHonorific = honorific && honorific !== "None" && honorific !== "";
      const effectiveRole =
        formRole === "advisor"
          ? "advisor"
          : isGraduated || formRole === "alumni"
          ? "alumni"
          : "member";

      const companyTitleText = [currentJobTitle.trim(), currentCompany.trim()].filter(Boolean).join(" at ");

      const payload: any = {
        fullName: formRole === "advisor" && hasHonorific ? `${honorific} ${fullName.trim()}` : fullName.trim(),
        email: email.trim(),
        password,
        contactNumber: contactNumber.trim(),
        address: address.trim() || "MEC Campus",
        bio: bio.trim() || (
          formRole === "advisor"
            ? researchInterests
            : effectiveRole === "alumni"
            ? companyTitleText || "MEC Alumni"
            : `MEC Computer Club Member (${session})`
        ),
        clubRole: effectiveRole,
        facebook: facebook.trim() ? toFbUrl(facebook) : "",
        github: github.trim() ? toGithubUrl(github) : "",
        linkedin: linkedin.trim() ? toLiUrl(linkedin) : "",
        codeforces: codeforces.trim() ? toCfUrl(codeforces) : "",
        codechef: codechef.trim() ? toCodechefUrl(codechef) : "",
        discord: discord.trim(),
      };

      if (formRole === "advisor") {
        payload.department = advisorDepartment;
        payload.facultyId = facultyId.trim() || `FAC-${advisorDepartment}-${Date.now().toString().slice(-4)}`;
        payload.studentId = payload.facultyId;
        payload.designation = advisorStanding.trim() || institutionalPost.trim() || "Faculty Advisor";
        payload.customRole = advisorStanding.trim() || institutionalPost.trim() || "Faculty Advisor";
        payload.session = institutionalPost.trim() || (advisorDepartment ? `Dept. of ${advisorDepartment}` : "Faculty");
        payload.batch = "Faculty";
      } else if (effectiveRole === "alumni") {
        const effectiveDept = (formRole === "alumni" ? alumniDepartment : department) || "CSE";
        const chosenBatch = (formRole === "alumni" ? alumniBatch : batch) || `${effectiveDept}-Alumni`;
        payload.department = effectiveDept;
        // Ignore accidental email autofill by password managers in studentId
        const cleanFormerId = formerStudentId.trim().includes("@") ? "" : formerStudentId.trim();
        payload.studentId = cleanFormerId || `ALM-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
        payload.formerStudentId = payload.studentId;
        payload.registrationNumber = registrationNumber.trim() || "";
        payload.session = session.trim();
        payload.batch = chosenBatch;
        payload.passingYear = parseInt(passingYear) || new Date().getFullYear();
        payload.isGraduated = true;
        payload.designation = companyTitleText || "Alumni";
        payload.customRole = payload.designation;
      } else {
        // Student member
        payload.department = department || "CSE";
        payload.studentId = studentId.trim();
        payload.registrationNumber = registrationNumber.trim();
        payload.session = session.trim();
        payload.batch = batch.trim();
        payload.isGraduated = false;
        payload.designation = "General Member";
      }

      payload.imagePosition = `${photoPosX}% ${photoPosY}%`;
      payload.inviteCode = inviteCode.trim();

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      formData.append("image", selectedFile);

      const res = await api.upload("/api/users/register", formData, {
        headers: {
          "x-invitation-validated": "358",
          "x-invite-code": inviteCode.trim(),
        },
      });

      if (res.success) {
        setRegisteredEmail(email.trim());
        setRegisteredName(payload.fullName);
        setStage(3);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#a855f7", "#ec4899", "#3b82f6"],
        });
        toast.success("Application submitted successfully!");
      } else {
        const errorMsg = res.message || "Registration failed. Please review your information.";
        setFormError(errorMsg);
        toast.error(errorMsg, { duration: 5000 });
      }
    } catch (err: any) {
      let msg = "Failed to submit registration.";
      if (err instanceof ApiError) {
        if (err.data?.errors && typeof err.data.errors === "object") {
          const detailList = Object.entries(err.data.errors)
            .map(([field, error]) => `${field}: ${error}`)
            .join("; ");
          msg = `${err.data.message || err.message}: ${detailList}`;
        } else if (err.data?.message) {
          msg = err.data.message;
        } else {
          msg = err.message;
        }
      } else if (err?.message === "Failed to fetch" || err?.name === "TypeError") {
        msg = "Unable to reach server. Please check that the server is running and your connection is active.";
      } else if (err?.message) {
        msg = err.message;
      }

      setFormError(msg);
      toast.error(msg, { duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !registeredEmail) return;

    setEmailVerifying(true);
    try {
      await api.post("/api/users/verify/code", {
        email: registeredEmail,
        code: otpCode.trim(),
      });
      setEmailVerified(true);
      toast.success("Email verified successfully!");
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Invalid or expired verification code.";
      toast.error(msg);
    } finally {
      setEmailVerifying(false);
    }
  };

  const initial = fullName.trim().charAt(0).toUpperCase();

  const effectiveRole =
    formRole === "advisor"
      ? "advisor"
      : isGraduated || formRole === "alumni"
      ? "alumni"
      : "member";

  const previewSocials = [
    facebook && { icon: <IconFB />, label: "Facebook", url: toFbUrl(facebook) },
    email && { icon: <IconMail />, label: "Email", url: `mailto:${email}` },
    github && { icon: <IconGH />, label: "GitHub", url: toGithubUrl(github) },
    linkedin && { icon: <IconLI />, label: "LinkedIn", url: toLiUrl(linkedin) },
    discord && { icon: <IconDiscord />, label: `Discord: @${discord}`, url: `https://discord.com` },
    codeforces && { icon: <IconCF />, label: "Codeforces", url: toCfUrl(codeforces) },
    codechef && { icon: <IconCC />, label: "CodeChef", url: toCodechefUrl(codechef) },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; url: string }[];

  const regSnippet = registrationNumber.trim() ? `Reg: ${registrationNumber.trim()}` : "";
  const sessionSnippet = session.trim() ? `Session: ${session.trim()}` : "";
  const companyTitleText = [currentJobTitle.trim(), currentCompany.trim()].filter(Boolean).join(" at ");

  const previewSubTitle =
    effectiveRole === "advisor"
      ? institutionalPost || (advisorDepartment ? `Dept. of ${advisorDepartment}` : "Faculty Advisor")
      : effectiveRole === "alumni"
      ? [
          alumniDepartment ? `${alumniDepartment}` : "",
          session.trim() ? `Session: ${session.trim()}` : "",
          passingYear.trim() ? `Class of ${passingYear.trim()}` : "",
        ]
          .filter(Boolean)
          .join(" • ") || "Alumni Network Member"
      : [sessionSnippet || "Student Member", regSnippet]
          .filter(Boolean)
          .join(" • ");

  const previewDesignation =
    effectiveRole === "advisor"
      ? advisorStanding
      : effectiveRole === "alumni"
      ? companyTitleText || "Alumni Network Member"
      : "Club Member";

  const renderedFullName =
    formRole === "advisor" && honorific !== "None" && honorific !== ""
      ? `${honorific} ${fullName.trim() || "Full Name"}`
      : fullName || "Your Full Name";

  return (
    <section className={`section reg-page ${!codeVerified || stage !== 2 ? "stage-gate" : ""}`} style={{ paddingBottom: stage === 2 && codeVerified ? "var(--space-3)" : undefined }}>
      <div className="container">
        {/* ══════════════════════════════════════════════════════════
            STAGE 1: INVITATION ACCESS KEY GATE
            ══════════════════════════════════════════════════════════ */}
        {(!codeVerified || stage === 1) && stage !== 3 && (
          <div className="reg-gate-container">
            <div className="reg-gate-card">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div className="reg-gate-icon-wrap">
                  <KeyRound size={28} />
                </div>
                <div className="reg-gate-badge">
                  <KeyRound size={12} /> INVITATION KEY REQUIRED
                </div>
                <h1 className="reg-gate-title">Enter Invitation Access Key</h1>
                <p className="reg-gate-desc" style={{ marginBottom: "var(--space-5)" }}>
                  Please enter the clearance access key dispatched to your email or issued by MEC Computer Club to unlock registration.
                </p>

                {gateError && (
                  <div className="jc-error-msg" style={{ width: "100%", marginBottom: "var(--space-4)" }}>
                    <AlertCircle size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} />
                    <span>{gateError}</span>
                  </div>
                )}

                {codeChecking ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--space-6) 0" }}>
                    <div style={{ width: 32, height: 32, border: "3px solid var(--accent-primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "var(--space-3)" }} />
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                      Verifying invitation access key clearance...
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleVerifyInvite();
                    }}
                    style={{ width: "100%" }}
                  >
                    <div style={{ display: "flex", gap: "var(--space-3)", width: "100%", flexDirection: "column" }}>
                      <input
                        type="text"
                        placeholder="e.g. 6-digit code or access key"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                        autoFocus
                        style={{
                          width: "100%",
                          padding: "14px var(--space-4)",
                          border: "1px solid var(--border-brutalist)",
                          borderRadius: "var(--radius-md)",
                          background: "var(--surface-primary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--text-md)",
                          letterSpacing: "0.1em",
                          textAlign: "center",
                          color: "var(--text-primary)",
                          boxShadow: "3px 3px 0 var(--border-brutalist)",
                        }}
                      />
                      <Button
                        type="submit"
                        size="lg"
                        disabled={codeChecking || !inviteCode.trim()}
                        style={{ width: "100%", marginTop: "var(--space-2)" }}
                      >
                        <KeyRound size={16} style={{ marginRight: "6px" }} />
                        Unlock Application Form
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STAGE 2: DEDICATED SPECIFIC FORM (NO 3-ROLE SWITCHER TABS)
            ══════════════════════════════════════════════════════════ */}
        {codeVerified && stage === 2 && (
          <div className="jc-page" style={{ paddingTop: 0, paddingBottom: 0 }}>
            {/* Header tailored specifically to the locked role */}
            <div className="jc-header">
              <span className="kicker">
                {formRole === "advisor"
                  ? "Guidance & Mentorship"
                  : formRole === "alumni"
                  ? "Hall of Fame & Legacy"
                  : "Join the Club"}
              </span>
              <h1>
                {formRole === "advisor"
                  ? "sudo induct advisor"
                  : formRole === "alumni"
                  ? "sudo register alumni"
                  : "sudo adduser"}
              </h1>
              <p>
                {formRole === "advisor"
                  ? "Official onboarding for Faculty Advisors, Patrons, and Research Mentors of MEC Computer Club."
                  : formRole === "alumni"
                  ? "Connect with fellow MECians, mentor current students, and share career opportunities."
                  : "Fill in your details and watch your member card come to life — live preview on the right."}
              </p>
            </div>

            <div className="jc-layout" style={{ marginBottom: 0 }}>
              {/* ── Left Column: Dedicated Form ── */}
              <form className="jc-form" onSubmit={handleSubmitRegistration} noValidate autoComplete="off">
                {formError && (
                  <div className="jc-error-msg">
                    <AlertCircle size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* ════════════════════════════════════════════════
                    A. ADVISOR FORM
                    ════════════════════════════════════════════════ */}
                {formRole === "advisor" && (
                  <>
                    <div className="jc-form__section">
                      <div className="jc-form__section-header">
                        <h2 className="jc-form__section-title">
                          <span className="jc-form__section-num">01</span> Identity &amp; Academic Title
                        </h2>
                      </div>

                      {/* Photo Upload */}
                      <div className="jc-form__photo-row">
                        <button
                          type="button"
                          className="jc-photo-upload-btn"
                          onClick={() => fileRef.current?.click()}
                          disabled={compressingPhoto}
                          aria-label="Upload profile picture"
                        >
                          {photoUrl ? (
                            <Image
                              src={photoUrl}
                              alt="profile"
                              fill
                              style={{ objectFit: "cover", objectPosition: `${photoPosX}% ${photoPosY}%` }}
                              unoptimized
                            />
                          ) : (
                            <div className="jc-photo-upload-btn__inner">
                              {compressingPhoto ? (
                                <>
                                  <RefreshCw size={22} className="animate-spin" style={{ color: "var(--accent-primary)" }} />
                                  <span>Compressing...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={22} style={{ color: "var(--text-primary)" }} />
                                  <span>Upload Photo</span>
                                </>
                              )}
                            </div>
                          )}
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handlePhotoSelect}
                          style={{ display: "none" }}
                        />
                        <div className="jc-photo-upload-hint">
                          <p>
                            Portrait Photo <span className="jc-required">*</span>
                          </p>
                          <div style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 700 }}>
                            <p>Requirements:</p>
                            <ul style={{ paddingLeft: "1.2rem", marginTop: "0.2rem", listStyleType: "disc" }}>
                              <li>PNG, JPG, or WEBP (automatically compressed).</li>
                              <li>Drag on the live card to position your portrait.</li>
                            </ul>
                          </div>
                          {photoError && (
                            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", fontWeight: 700 }}>
                              {photoError}
                            </p>
                          )}
                          {photoUrl && (
                            <button
                              type="button"
                              className="jc-photo-remove"
                              onClick={() => {
                                setPhotoUrl(null);
                                setSelectedFile(null);
                                if (fileRef.current) fileRef.current.value = "";
                              }}
                            >
                              Remove photo
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="honorific">Honorific / Title</label>
                          <Select
                            id="honorific"
                            value={honorific}
                            onChange={setHonorific}
                            options={ADVISOR_HONORIFICS}
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="fullName">
                            Full Name <span className="jc-required">*</span>
                          </label>
                          <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="e.g. Abu Sayed"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="advisorStanding">
                            Advisory Standing <span className="jc-required">*</span>
                          </label>
                          <Select
                            id="advisorStanding"
                            value={advisorStanding}
                            onChange={setAdvisorStanding}
                            options={ADVISOR_STANDING_OPTIONS}
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="advisorDepartment">
                            Academic Department <span className="jc-required">*</span>
                          </label>
                          <Select
                            id="advisorDepartment"
                            value={advisorDepartment}
                            onChange={setAdvisorDepartment}
                            options={ADVISOR_DEPT_OPTIONS}
                          />
                        </div>
                      </div>

                      <div className="jc-form-group">
                        <label htmlFor="institutionalPost">
                          Institutional Designation <span className="jc-required">*</span>
                        </label>
                        <input
                          id="institutionalPost"
                          type="text"
                          value={institutionalPost}
                          onChange={(e) => setInstitutionalPost(e.target.value)}
                          required
                          placeholder="e.g. Head of CSE Department / Associate Professor"
                        />
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="email">
                            Institutional Email Address <span className="jc-required">*</span>
                            {emailLocked && <span style={{ fontSize: "11px", color: "var(--accent-primary)", marginLeft: "6px" }}>🔒 Assigned by invitation</span>}
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            readOnly={emailLocked}
                            title={emailLocked ? "Assigned by your invitation clearance key" : undefined}
                            style={emailLocked ? { backgroundColor: "var(--surface-secondary)", cursor: "not-allowed", opacity: 0.9 } : undefined}
                            placeholder="name@mec.edu.bd"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="contactNumber">
                            Contact Phone Number <span className="jc-required">*</span>
                          </label>
                          <input
                            id="contactNumber"
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            required
                            placeholder="01XXXXXXXXX"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="password">
                            Account Password <span className="jc-required">*</span>
                          </label>
                          <div style={{ position: "relative" }}>
                            <input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              placeholder="At least 6 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                color: "var(--text-tertiary)",
                                cursor: "pointer",
                              }}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="confirmPassword">
                            Confirm Password <span className="jc-required">*</span>
                          </label>
                          <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Re-enter password"
                          />
                        </div>
                      </div>

                      <div className="jc-form-group">
                        <label htmlFor="researchInterests">Research Interests &amp; Bio</label>
                        <textarea
                          id="researchInterests"
                          rows={3}
                          value={researchInterests}
                          onChange={(e) => setResearchInterests(e.target.value)}
                          placeholder="Key research fields, algorithms, AI/ML, mentoring background..."
                        />
                      </div>
                    </div>

                    <div className="jc-form__section">
                      <h2 className="jc-form__section-title">
                        <span className="jc-form__section-num">02</span> Professional &amp; Connect Profiles
                      </h2>

                      {/* Facebook is first and mandatory */}
                      <div className="jc-form-group">
                        <label htmlFor="facebook">
                          <IconFB /> Facebook Profile <span className="jc-required">*</span>
                        </label>
                        <input
                          id="facebook"
                          type="text"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          required
                          placeholder="https://facebook.com/username or username"
                        />
                      </div>

                      <PrefixInput
                        id="linkedin"
                        name="linkedin"
                        icon={<IconLI />}
                        label="LinkedIn Profile"
                        prefix="linkedin.com/in/"
                        placeholder="username (optional)"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        generatedUrl={toLiUrl(linkedin)}
                      />

                      <PrefixInput
                        id="github"
                        name="github"
                        icon={<IconGH />}
                        label="GitHub Profile"
                        prefix="github.com/"
                        placeholder="username (optional)"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        generatedUrl={toGithubUrl(github)}
                      />
                    </div>
                  </>
                )}

                {/* ════════════════════════════════════════════════
                    B. ALUMNI FORM
                    ════════════════════════════════════════════════ */}
                {formRole === "alumni" && (
                  <>
                    <div className="jc-form__section">
                      <div className="jc-form__section-header">
                        <h2 className="jc-form__section-title">
                          <span className="jc-form__section-num">01</span> Identity &amp; Graduation History
                        </h2>
                      </div>

                      {/* Photo Upload */}
                      <div className="jc-form__photo-row">
                        <button
                          type="button"
                          className="jc-photo-upload-btn"
                          onClick={() => fileRef.current?.click()}
                          disabled={compressingPhoto}
                          aria-label="Upload profile picture"
                        >
                          {photoUrl ? (
                            <Image
                              src={photoUrl}
                              alt="profile"
                              fill
                              style={{ objectFit: "cover", objectPosition: `${photoPosX}% ${photoPosY}%` }}
                              unoptimized
                            />
                          ) : (
                            <div className="jc-photo-upload-btn__inner">
                              {compressingPhoto ? (
                                <>
                                  <RefreshCw size={22} className="animate-spin" style={{ color: "var(--accent-primary)" }} />
                                  <span>Compressing...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={22} style={{ color: "var(--text-primary)" }} />
                                  <span>Upload Photo</span>
                                </>
                              )}
                            </div>
                          )}
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handlePhotoSelect}
                          style={{ display: "none" }}
                        />
                        <div className="jc-photo-upload-hint">
                          <p>
                            Portrait Photo <span className="jc-required">*</span>
                          </p>
                          <div style={{ fontSize: "12px", color: "var(--accent-primary)", fontWeight: 700 }}>
                            <p>Requirements:</p>
                            <ul style={{ paddingLeft: "1.2rem", marginTop: "0.2rem", listStyleType: "disc" }}>
                              <li>PNG, JPG, or WEBP (automatically compressed).</li>
                              <li>Drag on the live card to position your portrait.</li>
                            </ul>
                          </div>
                          {photoError && (
                            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", fontWeight: 700 }}>
                              {photoError}
                            </p>
                          )}
                          {photoUrl && (
                            <button
                              type="button"
                              className="jc-photo-remove"
                              onClick={() => {
                                setPhotoUrl(null);
                                setSelectedFile(null);
                                if (fileRef.current) fileRef.current.value = "";
                              }}
                            >
                              Remove photo
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="jc-form-group">
                        <label htmlFor="fullName">
                          Full Name <span className="jc-required">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="e.g. Md. Nasir Ahmed"
                        />
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="alumniDepartment">
                            Department <span className="jc-required">*</span>
                          </label>
                          <Select
                            id="alumniDepartment"
                            value={alumniDepartment}
                            onChange={(val) => {
                              setAlumniDepartment(val);
                              setAlumniBatch("");
                            }}
                            options={DEPARTMENT_OPTIONS}
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="alumniBatch">
                            Batch <span className="jc-required">*</span>
                          </label>
                          <Select
                            id="alumniBatch"
                            value={alumniBatch}
                            onChange={setAlumniBatch}
                            options={getBatchOptions(alumniDepartment, batchConfig)}
                            placeholder="Select batch…"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="session">
                            Session <span className="jc-required">*</span>
                          </label>
                          <input
                            id="session"
                            name="session"
                            autoComplete="off"
                            data-lpignore="true"
                            type="text"
                            value={session}
                            onChange={(e) => setSession(e.target.value)}
                            required
                            placeholder="e.g. 2019-2020"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="passingYear">
                            Passing Year <span className="jc-required">*</span>
                          </label>
                          <input
                            id="passingYear"
                            name="passingYear"
                            type="number"
                            min="1990"
                            max={new Date().getFullYear() + 2}
                            value={passingYear}
                            onChange={(e) => setPassingYear(e.target.value)}
                            required
                            placeholder="e.g. 2024"
                          />
                        </div>
                      </div>

                      <div className="jc-form-group">
                        <label htmlFor="formerStudentId">Former Student ID (optional)</label>
                        <input
                          id="formerStudentId"
                          name="alumniFormerStudentId"
                          autoComplete="new-password"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          data-form-type="other"
                          type="text"
                          value={formerStudentId}
                          onChange={(e) => setFormerStudentId(e.target.value)}
                          placeholder="e.g. 190301 (leave blank to auto-generate)"
                        />
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="currentCompany">
                            Current Company / Organization
                          </label>
                          <input
                            id="currentCompany"
                            type="text"
                            value={currentCompany}
                            onChange={(e) => setCurrentCompany(e.target.value)}
                            placeholder="e.g. Google, Brain Station 23, Therap (optional)"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="currentJobTitle">
                            Job Title / Designation
                          </label>
                          <input
                            id="currentJobTitle"
                            type="text"
                            value={currentJobTitle}
                            onChange={(e) => setCurrentJobTitle(e.target.value)}
                            placeholder="e.g. Software Engineer / Tech Lead (optional)"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="email">
                            Contact Email <span className="jc-required">*</span>
                            {emailLocked && <span style={{ fontSize: "11px", color: "var(--accent-primary)", marginLeft: "6px" }}>🔒 Assigned by invitation</span>}
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            readOnly={emailLocked}
                            title={emailLocked ? "Assigned by your invitation clearance key" : undefined}
                            style={emailLocked ? { backgroundColor: "var(--surface-secondary)", cursor: "not-allowed", opacity: 0.9 } : undefined}
                            placeholder="name@company.com or personal"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="contactNumber">
                            Contact Phone Number <span className="jc-required">*</span>
                          </label>
                          <input
                            id="contactNumber"
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            required
                            placeholder="01XXXXXXXXX"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="password">
                            Account Password <span className="jc-required">*</span>
                          </label>
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="At least 6 characters"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="confirmPassword">
                            Confirm Password <span className="jc-required">*</span>
                          </label>
                          <input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Re-enter password"
                          />
                        </div>
                      </div>

                      <div className="jc-form-group">
                        <label htmlFor="bio">Career Summary / Advice for Juniors</label>
                        <textarea
                          id="bio"
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Brief background, tech stack, career journey..."
                        />
                      </div>
                    </div>

                    <div className="jc-form__section">
                      <h2 className="jc-form__section-title">
                        <span className="jc-form__section-num">02</span> Professional &amp; Social Profiles
                      </h2>

                      {/* Facebook is first and mandatory */}
                      <div className="jc-form-group">
                        <label htmlFor="facebook">
                          <IconFB /> Facebook Profile <span className="jc-required">*</span>
                        </label>
                        <input
                          id="facebook"
                          type="text"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          required
                          placeholder="https://facebook.com/username or username"
                        />
                      </div>

                      <PrefixInput
                        id="linkedin"
                        name="linkedin"
                        icon={<IconLI />}
                        label="LinkedIn Profile"
                        prefix="linkedin.com/in/"
                        placeholder="username (optional)"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        generatedUrl={toLiUrl(linkedin)}
                      />

                      <PrefixInput
                        id="github"
                        name="github"
                        icon={<IconGH />}
                        label="GitHub Profile"
                        prefix="github.com/"
                        placeholder="username (optional)"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        generatedUrl={toGithubUrl(github)}
                      />

                      <PrefixInput
                        id="codeforces"
                        name="codeforces"
                        icon={<IconCF />}
                        label="Codeforces Handle"
                        prefix="codeforces.com/"
                        placeholder="handle (optional)"
                        value={codeforces}
                        onChange={(e) => setCodeforces(e.target.value)}
                        generatedUrl={toCfUrl(codeforces)}
                      />
                    </div>
                  </>
                )}

                {/* ════════════════════════════════════════════════
                    C. STUDENT MEMBER FORM (EXACT STRUCTURE)
                    ════════════════════════════════════════════════ */}
                {formRole === "member" && (
                  <>
                    <div className="jc-form__section">
                      <div className="jc-form__section-header">
                        <h2 className="jc-form__section-title">
                          <span className="jc-form__section-num">01</span> Identity
                        </h2>
                      </div>

                      {/* Photo upload */}
                      <div className="jc-form__photo-row">
                        <button
                          type="button"
                          className="jc-photo-upload-btn"
                          onClick={() => fileRef.current?.click()}
                          disabled={compressingPhoto}
                          aria-label="Upload profile picture"
                        >
                          {photoUrl ? (
                            <Image
                              src={photoUrl}
                              alt="profile"
                              fill
                              style={{ objectFit: "cover", objectPosition: `${photoPosX}% ${photoPosY}%` }}
                              unoptimized
                            />
                          ) : (
                            <div className="jc-photo-upload-btn__inner">
                              {compressingPhoto ? (
                                <>
                                  <RefreshCw size={22} className="animate-spin" style={{ color: "var(--accent-primary)" }} />
                                  <span>Compressing...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={22} style={{ color: "var(--text-primary)" }} />
                                  <span>Upload Photo</span>
                                </>
                              )}
                            </div>
                          )}
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          style={{ display: "none" }}
                        />
                        <div className="jc-photo-upload-hint">
                          <p>
                            Profile Photo <span className="jc-required">*</span>
                          </p>
                          <div style={{ fontWeight: "bold", fontSize: "0.85rem", color: "var(--accent-primary)" }}>
                            <p>Important requirements:</p>
                            <ul style={{ paddingLeft: "1.2rem", marginTop: "0.2rem", listStyleType: "disc" }}>
                              <li>PNG, JPG, or WEBP (automatically compressed).</li>
                              <li>Drag on the live card to position your portrait.</li>
                            </ul>
                          </div>
                          {photoError && (
                            <p style={{ fontSize: "0.85rem", color: "#ef4444" }}>{photoError}</p>
                          )}
                          {photoUrl && (
                            <button
                              type="button"
                              className="jc-photo-remove"
                              onClick={() => {
                                setPhotoUrl(null);
                                setSelectedFile(null);
                                if (fileRef.current) fileRef.current.value = "";
                              }}
                            >
                              Remove photo
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="jc-form-group">
                        <label htmlFor="fullName">
                          Full Name <span className="jc-required">*</span>
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          autoComplete="name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="e.g. Tawhid Ahmmed"
                        />
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="studentId">
                            Student ID <span className="jc-required">*</span>
                          </label>
                          <input
                            id="studentId"
                            name="studentId"
                            autoComplete="off"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            data-form-type="other"
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                            placeholder="e.g. 210321"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="registrationNumber">
                            Registration No. <span className="jc-required">*</span>
                          </label>
                          <input
                            id="registrationNumber"
                            name="registrationNumber"
                            autoComplete="off"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            data-form-type="other"
                            type="text"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            required
                            placeholder="e.g. 1356"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="memberDepartment">
                            Department <span className="jc-required">*</span>
                          </label>
                          <Select
                            id="memberDepartment"
                            value={department}
                            onChange={(val) => {
                              setDepartment(val);
                              setBatch(""); // reset batch when department changes
                            }}
                            options={DEPARTMENT_OPTIONS}
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="memberBatch">
                            Batch <span className="jc-required">*</span>
                          </label>
                          <Select
                            id="memberBatch"
                            value={batch}
                            onChange={setBatch}
                            options={getBatchOptions(department, batchConfig)}
                            placeholder="Select batch…"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="session">
                            Academic Session <span className="jc-required">*</span>
                          </label>
                          <input
                            id="session"
                            name="session"
                            autoComplete="off"
                            data-lpignore="true"
                            type="text"
                            value={session}
                            onChange={(e) => setSession(e.target.value)}
                            required
                            placeholder="e.g. 2021-2022"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="contactNumber">
                            Contact Number <span className="jc-required">*</span>
                          </label>
                          <input
                            id="contactNumber"
                            name="contactNumber"
                            autoComplete="tel"
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            required
                            placeholder="01XXXXXXXXX"
                          />
                        </div>
                      </div>

                      {/* Graduated Checkbox Card */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "var(--space-2)",
                          padding: "14px 16px",
                          border: "1px solid var(--border-brutalist)",
                          borderRadius: "var(--radius-md)",
                          background: isGraduated ? "var(--surface-secondary)" : "var(--surface-primary)",
                          boxShadow: isGraduated ? "3px 3px 0 var(--border-brutalist)" : "2px 2px 0 var(--border-brutalist)",
                          marginBottom: "var(--space-4)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <label
                          htmlFor="isGraduatedMember"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "var(--text-primary)",
                            margin: 0,
                            userSelect: "none",
                          }}
                        >
                          <input
                            id="isGraduatedMember"
                            type="checkbox"
                            checked={isGraduated}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setIsGraduated(checked);
                              if (checked && !passingYear) {
                                setPassingYear(new Date().getFullYear().toString());
                              }
                            }}
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "var(--accent-primary)",
                              cursor: "pointer",
                            }}
                          />
                          <span>Are you graduated?</span>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              background: isGraduated ? "var(--accent-primary)" : "var(--surface-tertiary)",
                              color: isGraduated ? "#ffffff" : "var(--text-secondary)",
                              borderRadius: "var(--radius-sm)",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {isGraduated ? "Role: Alumni" : "Role: Member"}
                          </span>
                        </label>

                        {isGraduated && (
                          <div className="jc-form-group" style={{ marginTop: "12px" }}>
                            <label htmlFor="passingYear" style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                              Passing Year <span className="jc-required">*</span>
                            </label>
                            <input
                              id="passingYear"
                              name="passingYear"
                              type="number"
                              min="1990"
                              max={new Date().getFullYear() + 2}
                              value={passingYear}
                              onChange={(e) => setPassingYear(e.target.value)}
                              required={isGraduated}
                              placeholder="e.g. 2023"
                              style={{
                                width: "100%",
                                padding: "10px 14px",
                                border: "1px solid var(--border-brutalist)",
                                borderRadius: "var(--radius-md)",
                                background: "var(--surface-primary)",
                                color: "var(--text-primary)",
                                fontSize: "var(--text-sm)",
                                fontWeight: 600,
                                boxShadow: "2px 2px 0 var(--border-brutalist)",
                                display: "block",
                              }}
                            />
                            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                              Your profile will be designated as Alumni in the club directory.
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="jc-form-group">
                        <label htmlFor="email">
                          Email <span className="jc-required">*</span>
                          {emailLocked && <span style={{ fontSize: "11px", color: "var(--accent-primary)", marginLeft: "6px" }}>🔒 Assigned by invitation</span>}
                        </label>
                        <input
                          id="email"
                          name="email"
                          autoComplete="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          readOnly={emailLocked}
                          title={emailLocked ? "Assigned by your invitation clearance key" : undefined}
                          style={emailLocked ? { backgroundColor: "var(--surface-secondary)", cursor: "not-allowed", opacity: 0.9 } : undefined}
                          placeholder="name@std.mec.edu.bd"
                        />
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="password">
                            Password <span className="jc-required">*</span>
                          </label>
                          <input
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="At least 6 characters"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="confirmPassword">
                            Confirm Password <span className="jc-required">*</span>
                          </label>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Re-enter password"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="jc-form__section">
                      <h2 className="jc-form__section-title">
                        <span className="jc-form__section-num">02</span> Social &amp; Competitive Profiles
                      </h2>

                      {/* Facebook is first and mandatory */}
                      <div className="jc-form-group">
                        <label htmlFor="facebook">
                          <IconFB /> Facebook Profile <span className="jc-required">*</span>
                        </label>
                        <input
                          id="facebook"
                          name="facebook"
                          autoComplete="off"
                          type="text"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          required
                          placeholder="https://facebook.com/username or username"
                        />
                      </div>

                      {/* Other profiles are optional */}
                      <PrefixInput
                        id="linkedin"
                        name="linkedin"
                        icon={<IconLI />}
                        label="LinkedIn Profile"
                        prefix="linkedin.com/in/"
                        placeholder="username (optional)"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        generatedUrl={toLiUrl(linkedin)}
                      />

                      {/* Merged GitHub and Discord in one line on desktop */}
                      <div className="jc-form__row--2">
                        <PrefixInput
                          id="github"
                          name="github"
                          icon={<IconGH />}
                          label="GitHub Profile"
                          prefix="github.com/"
                          placeholder="username (optional)"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          generatedUrl={toGithubUrl(github)}
                        />

                        <PrefixInput
                          id="discord"
                          name="discord"
                          icon={<IconDiscord />}
                          label="Discord Handle"
                          prefix="@"
                          placeholder="username (optional)"
                          value={discord}
                          onChange={(e) => setDiscord(e.target.value)}
                        />
                      </div>

                      {/* Codeforces and CodeChef in one line */}
                      <div className="jc-form__row--2">
                        <PrefixInput
                          id="codeforces"
                          name="codeforces"
                          icon={<IconCF />}
                          label="Codeforces Handle"
                          prefix="codeforces.com/"
                          placeholder="handle (optional)"
                          value={codeforces}
                          onChange={(e) => setCodeforces(e.target.value)}
                          generatedUrl={toCfUrl(codeforces)}
                        />
                        <PrefixInput
                          id="codechef"
                          name="codechef"
                          icon={<IconCC />}
                          label="CodeChef Handle"
                          prefix="codechef.com/"
                          placeholder="handle (optional)"
                          value={codechef}
                          onChange={(e) => setCodechef(e.target.value)}
                          generatedUrl={toCodechefUrl(codechef)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit button */}
                <div className="jc-form__actions">
                  <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting}>
                    {submitting
                      ? "Submitting Application…"
                      : effectiveRole === "advisor"
                      ? "Complete Advisor Induction →"
                      : effectiveRole === "alumni"
                      ? "Register to Alumni Network →"
                      : "Submit Application →"}
                  </Button>
                </div>
              </form>

              {/* ── Right Column: Sticky Live Preview ── */}
              <div className="jc-preview-panel">
                <div className="jc-preview-panel__sticky">
                  <div className="jc-preview-label">
                    <span className="jc-preview-label__dot" />
                    Live Preview
                  </div>

                  <LiveCardPreview
                    roleType={effectiveRole}
                    name={renderedFullName}
                    subTitle={previewSubTitle}
                    designation={previewDesignation}
                    photoUrl={photoUrl}
                    initial={initial}
                    socials={previewSocials}
                    photoPosX={photoPosX}
                    photoPosY={photoPosY}
                    photoZoom={photoZoom}
                    onPositionChange={(x, y) => {
                      setPhotoPosX(x);
                      setPhotoPosY(y);
                    }}
                  />

                  {photoUrl && (
                    <div className="jc-photo-controls">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p className="jc-photo-controls__title" style={{ margin: 0 }}>Adjust Photo</p>
                        <span style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                          {photoPosX}% X, {photoPosY}% Y
                        </span>
                      </div>

                      <div className="jc-photo-controls__row">
                        <label>Vertical</label>
                        <div className="jc-slider-wrap">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={photoPosY}
                            onChange={(e) => setPhotoPosY(Number(e.target.value))}
                            className="jc-slider"
                            aria-label="Vertical position"
                          />
                          <div
                            className={`jc-slider-mark ${photoPosY === 50 ? "jc-slider-mark--active" : ""}`}
                            style={{ left: "50%" }}
                          />
                        </div>
                        <span>{photoPosY}%</span>
                      </div>

                      <div className="jc-photo-controls__row">
                        <label>Horizontal</label>
                        <div className="jc-slider-wrap">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={photoPosX}
                            onChange={(e) => setPhotoPosX(Number(e.target.value))}
                            className="jc-slider"
                            aria-label="Horizontal position"
                          />
                          <div
                            className={`jc-slider-mark ${photoPosX === 50 ? "jc-slider-mark--active" : ""}`}
                            style={{ left: "50%" }}
                          />
                        </div>
                        <span>{photoPosX}%</span>
                      </div>

                      <div className="jc-photo-controls__row">
                        <label>Zoom</label>
                        <div className="jc-slider-wrap">
                          <input
                            type="range"
                            min={100}
                            max={200}
                            value={photoZoom}
                            onChange={(e) => setPhotoZoom(Number(e.target.value))}
                            className="jc-slider"
                            aria-label="Zoom photo"
                          />
                          <div
                            className={`jc-slider-mark ${photoZoom === 100 ? "jc-slider-mark--active" : ""}`}
                            style={{ left: "0%" }}
                          />
                        </div>
                        <span>{photoZoom}%</span>
                      </div>

                      <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                        <button
                          type="button"
                          className="jc-photo-controls__reset"
                          onClick={() => { setPhotoPosX(50); setPhotoPosY(50); setPhotoZoom(100); }}
                        >
                          Reset Center
                        </button>
                        <button
                          type="button"
                          className="jc-photo-controls__reset"
                          onClick={() => { setPhotoPosY(15); }}
                        >
                          Focus Top
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="jc-preview-hint">
                    This is how your profile card will be rendered across the club network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STAGE 3: EMAIL VERIFICATION STEP
            ══════════════════════════════════════════════════════════ */}
        {stage === 3 && (
          <div className="reg-gate-container">
            <div className="reg-gate-card">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div
                  className="reg-gate-icon-wrap"
                  style={{ background: emailVerified ? "rgba(16, 185, 129, 0.1)" : "rgba(99, 102, 241, 0.1)", color: emailVerified ? "#10b981" : "var(--accent-primary)" }}
                >
                  {emailVerified ? <CheckCircle2 size={32} /> : <Mail size={32} />}
                </div>

                <div className={`reg-gate-badge ${emailVerified ? "verified" : ""}`}>
                  {emailVerified ? "IDENTITY VERIFIED" : "VERIFICATION DISPATCHED"}
                </div>

                <h1 className="reg-gate-title">
                  {emailVerified ? "Email Confirmed Successfully!" : "Confirm Your Email Address"}
                </h1>

                <p className="reg-gate-desc" style={{ marginBottom: "var(--space-5)" }}>
                  {emailVerified ? (
                    <>
                      Thank you <strong>{registeredName}</strong>. Your account has been registered and is pending administrator activation.
                    </>
                  ) : (
                    <>
                      We sent a 6-digit verification code to <strong>{registeredEmail}</strong>. Enter it below to activate your account.
                    </>
                  )}
                </p>

                {!emailVerified ? (
                  <form onSubmit={handleVerifyEmailCode} style={{ width: "100%" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "14px var(--space-4)",
                          border: "1px solid var(--border-brutalist)",
                          borderRadius: "var(--radius-md)",
                          background: "var(--surface-primary)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--text-xl)",
                          letterSpacing: "0.2em",
                          textAlign: "center",
                          color: "var(--text-primary)",
                          boxShadow: "3px 3px 0 var(--border-brutalist)",
                        }}
                      />
                      <Button type="submit" size="lg" disabled={emailVerifying || !otpCode.trim()} style={{ width: "100%" }}>
                        {emailVerifying ? "Verifying Code..." : "Confirm & Verify Email"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
                    <Button href="/login" size="lg">
                      Proceed to Login →
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="section container text-center" style={{ padding: "var(--space-9) 0" }}>
          <p style={{ color: "var(--text-secondary)" }}>Loading application portal...</p>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
