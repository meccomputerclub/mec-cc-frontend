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
} from "lucide-react";

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

const ALUMNI_BATCH_OPTIONS = [
  { value: "1st Batch", label: "1st Batch (2019-2023)" },
  { value: "2nd Batch", label: "2nd Batch (2020-2024)" },
  { value: "3rd Batch", label: "3rd Batch (2021-2025)" },
  { value: "4th Batch", label: "4th Batch (2022-2026)" },
];

const ALUMNI_YEAR_OPTIONS = [
  { value: "2023", label: "Class of 2023" },
  { value: "2024", label: "Class of 2024" },
  { value: "2025", label: "Class of 2025" },
  { value: "2026", label: "Class of 2026" },
];

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
}

function LiveCardPreview({ roleType, name, subTitle, designation, photoUrl, initial, socials }: LiveCardProps) {
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
      <div className="jc-preview-card__photo">
        {photoUrl ? (
          <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt="preview"
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                inset: 0,
              }}
            />
          </div>
        ) : (
          <span className="jc-preview-card__initial">{initial || "?"}</span>
        )}
      </div>

      {/* Details */}
      <div className="jc-preview-card__content">
        <p className="jc-preview-card__name">{name || "Your Full Name"}</p>
        <p className="jc-preview-card__batch" style={{ color: "var(--accent-primary)", fontWeight: 700 }}>
          {subTitle || (roleType === "advisor" ? "Faculty Advisor" : roleType === "alumni" ? "CSE, 1st Batch" : "CSE (5th Batch)")}
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

  const [stage, setStage] = useState<1 | 2 | 3>(isValidRoleParam ? 2 : 1);
  const [inviteCode, setInviteCode] = useState(initialUrlCode);
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeChecking, setCodeChecking] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

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
  const [batch, setBatch] = useState("");

  // Alumni Fields
  const [alumniDepartment, setAlumniDepartment] = useState("CSE");
  const [alumniBatch, setAlumniBatch] = useState("1st Batch");
  const [passingYear, setPassingYear] = useState("2023");
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
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [discord, setDiscord] = useState("");
  const [codeforces, setCodeforces] = useState("");
  const [codechef, setCodechef] = useState("");

  // Photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
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

  // Initialize role if provided in URL
  useEffect(() => {
    if (initialRoleParam && ["member", "alumni", "advisor"].includes(initialRoleParam.toLowerCase())) {
      setFormRole(initialRoleParam.toLowerCase() as any);
      setStage(2);
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
      return;
    }

    setGateError(null);
    setCodeChecking(true);

    try {
      const res = await api.post("/api/invite/verify", { code: targetCode });
      if (res.success) {
        setCodeVerified(true);
        if (res.data?.email) {
          setEmail(res.data.email);
        }
        if (res.data?.role && ["member", "alumni", "advisor"].includes(res.data.role.toLowerCase())) {
          setFormRole(res.data.role.toLowerCase() as any);
        }
        toast.success("Invitation key verified! Access granted.");
        setStage(2);
      } else {
        setGateError(res.message || "Invalid or expired invitation code.");
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Invalid or expired invitation code.";
      setGateError(msg);
      toast.error(msg);
    } finally {
      setCodeChecking(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo exceeds maximum 5MB size limit.");
      setSelectedFile(null);
      setPhotoUrl(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      if (Math.abs(img.naturalWidth - img.naturalHeight) > 1) {
        setPhotoError("Photo MUST be exactly squared (1:1 aspect ratio). Please crop your photo before uploading.");
        setSelectedFile(null);
        setPhotoUrl(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setPhotoError(null);
        setPhotoUrl(url);
        setSelectedFile(file);
      }
    };
    img.onerror = () => {
      setPhotoError("Invalid image file.");
      setSelectedFile(null);
      setPhotoUrl(null);
      if (fileRef.current) fileRef.current.value = "";
    };
    img.src = url;
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedFile) {
      setFormError("Profile photo is required (must be 1:1 square).");
      toast.error("Please upload a profile photo.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const hasHonorific = honorific && honorific !== "None" && honorific !== "";
      const payload: any = {
        fullName: formRole === "advisor" && hasHonorific ? `${honorific} ${fullName.trim()}` : fullName.trim(),
        email: email.trim(),
        password,
        contactNumber: contactNumber.trim() || "N/A",
        address: address.trim() || "MEC Campus",
        bio: bio.trim() || (formRole === "advisor" ? researchInterests : formRole === "alumni" ? `${currentJobTitle} at ${currentCompany}` : `MEC Computer Club Member (${batch})`),
        clubRole: formRole,
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
      } else if (formRole === "alumni") {
        payload.department = alumniDepartment;
        payload.formerStudentId = formerStudentId.trim() || `ALM-${Date.now().toString().slice(-6)}`;
        payload.studentId = payload.formerStudentId;
        payload.batch = alumniBatch;
        payload.passingYear = parseInt(passingYear) || 2023;
        payload.session = `${parseInt(passingYear) - 4}-${passingYear}`;
        payload.isGraduated = true;
        payload.designation = currentJobTitle ? `${currentJobTitle} at ${currentCompany || "Industry"}` : "Alumni";
        payload.customRole = payload.designation;
      } else {
        // Student member
        const detectedDept = (batch.match(/(CSE|EEE|CE|ME)/i)?.[1] || "CSE").toUpperCase();
        payload.department = detectedDept;
        payload.studentId = studentId.trim();
        payload.registrationNumber = registrationNumber.trim();
        payload.session = batch.trim();
        payload.batch = batch.trim();
        payload.isGraduated = false;
        payload.designation = "General Member";
      }

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
        setFormError(res.message || "Registration failed.");
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to submit registration.";
      setFormError(msg);
      toast.error(msg);
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

  const previewSocials = [
    email && { icon: <IconMail />, label: "Email", url: `mailto:${email}` },
    github && { icon: <IconGH />, label: "GitHub", url: toGithubUrl(github) },
    linkedin && { icon: <IconLI />, label: "LinkedIn", url: toLiUrl(linkedin) },
    discord && { icon: <IconDiscord />, label: `Discord: @${discord}`, url: `https://discord.com` },
    facebook && { icon: <IconFB />, label: "Facebook", url: toFbUrl(facebook) },
    codeforces && { icon: <IconCF />, label: "Codeforces", url: toCfUrl(codeforces) },
    codechef && { icon: <IconCC />, label: "CodeChef", url: toCodechefUrl(codechef) },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; url: string }[];

  const previewSubTitle =
    formRole === "advisor"
      ? institutionalPost || (advisorDepartment ? `Dept. of ${advisorDepartment}` : "Faculty Advisor")
      : formRole === "alumni"
      ? `${alumniDepartment}, ${alumniBatch}`
      : batch || "Batch: CSE 5th";

  const previewDesignation =
    formRole === "advisor"
      ? advisorStanding
      : formRole === "alumni"
      ? currentJobTitle ? `${currentJobTitle} at ${currentCompany || "Industry"}` : "Alumni Network Member"
      : "Club Member";

  const renderedFullName =
    formRole === "advisor" && honorific !== "None" && honorific !== ""
      ? `${honorific} ${fullName.trim() || "Full Name"}`
      : fullName || "Your Full Name";

  return (
    <section className="section reg-page">
      <style dangerouslySetInnerHTML={{
        __html: `
          .reg-page { padding-top: var(--space-7); padding-bottom: var(--space-9); min-height: 85vh; display: flex; flex-direction: column; justify-content: center; }
          .reg-header { text-align: center; margin-bottom: var(--space-7); }
          .reg-header h1 { font-size: clamp(2.2rem, 4.5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; margin: var(--space-2) 0 var(--space-3); background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent-primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .reg-header p { font-size: var(--text-lg); color: var(--text-secondary); max-width: 580px; margin: 0 auto; }
          .reg-gate-container { max-width: 600px; margin: 0 auto; width: 100%; }
          .reg-gate-card { background: var(--surface-elevated); border: 1px solid var(--border-brutalist); border-radius: var(--radius-xl); padding: var(--space-7); box-shadow: 6px 6px 0 var(--border-brutalist); position: relative; overflow: hidden; }
          .dark .reg-gate-card { box-shadow: 6px 6px 0 var(--accent-primary); border-color: rgba(255, 255, 255, 0.15); }
          .reg-gate-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600; background: rgba(239, 68, 68, 0.1); color: var(--accent-error); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-full); margin-bottom: var(--space-4); }
          .reg-gate-badge.verified { background: rgba(16, 185, 129, 0.1); color: var(--accent-success); border-color: rgba(16, 185, 129, 0.2); }
          .reg-gate-icon-wrap { width: 64px; height: 64px; border-radius: var(--radius-lg); background: var(--surface-secondary); border: 1px solid var(--border-default); display: flex; align-items: center; justify-content: center; color: var(--accent-primary); margin-bottom: var(--space-4); }
          .reg-gate-title { font-size: var(--text-2xl); font-weight: 800; margin-bottom: var(--space-2); }
          .reg-gate-desc { color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.6; margin-bottom: var(--space-6); }
          .reg-gate-input-group { display: flex; gap: var(--space-3); margin-bottom: var(--space-5); }
          .reg-gate-input { flex: 1; font-family: var(--font-mono); font-size: var(--text-lg); letter-spacing: 0.15em; text-transform: uppercase; text-align: center; font-weight: 700; padding: var(--space-3) var(--space-4); border: 2px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-primary); color: var(--text-primary); }
          .reg-gate-input:focus { outline: none; border-color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(132, 204, 22, 0.2); }
          .reg-gate-fallback { margin-top: var(--space-6); padding-top: var(--space-5); border-top: 1px dashed var(--border-default); display: flex; flex-direction: column; gap: var(--space-3); background: var(--surface-secondary); padding: var(--space-4); border-radius: var(--radius-lg); }
          .reg-gate-fallback-title { font-size: var(--text-sm); font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
          .reg-gate-fallback-desc { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin: 0; }
          .reg-gate-fallback-btn { align-self: flex-start; font-size: var(--text-xs); font-weight: 600; color: var(--accent-text-on-surface); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
          .dark .reg-gate-fallback-btn { color: var(--accent-primary-hover); }
          .reg-layout { display: grid; grid-template-columns: 1fr 360px; gap: var(--space-6); align-items: start; }
          @media (max-width: 990px) { .reg-layout { grid-template-columns: 1fr; } .reg-preview-panel { order: -1; } }
          .reg-form { display: flex; flex-direction: column; gap: var(--space-5); }
          .reg-form-section { background: var(--surface-elevated); border: 1px solid var(--border-brutalist); border-radius: var(--radius-lg); padding: var(--space-5); box-shadow: 4px 4px 0 var(--border-brutalist); display: flex; flex-direction: column; gap: var(--space-4); }
          .dark .reg-form-section { box-shadow: 4px 4px 0 var(--border-default); }
          .reg-section-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-default); padding-bottom: var(--space-3); margin-bottom: var(--space-2); }
          .reg-section-title { font-size: var(--text-lg); font-weight: 700; display: flex; align-items: center; gap: var(--space-2); margin: 0; }
          .reg-section-num { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--accent-primary); background: var(--surface-secondary); padding: 2px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-default); }
          .reg-verified-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.1); color: var(--accent-success); border: 1px solid rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: var(--radius-full); font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 600; }
          .reg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
          .reg-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); }
          @media (max-width: 640px) { .reg-grid-2, .reg-grid-3 { grid-template-columns: 1fr; } }
          .reg-form-group { display: flex; flex-direction: column; gap: 6px; }
          .reg-form-group label { font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; }
          .reg-required { color: var(--accent-error); }
          .reg-input, .reg-textarea, .reg-select { width: 100%; padding: 10px var(--space-3); font-size: var(--text-sm); border: 1px solid var(--border-brutalist); border-radius: var(--radius-md); background: var(--surface-primary); color: var(--text-primary); box-shadow: 2px 2px 0 var(--border-brutalist); transition: all var(--transition-base); }
          .dark .reg-input, .dark .reg-textarea, .dark .reg-select { box-shadow: 2px 2px 0 var(--border-default); }
          .reg-input:focus, .reg-textarea:focus, .reg-select:focus { outline: none; border-color: var(--accent-primary); box-shadow: 3px 3px 0 var(--accent-primary); }
          .reg-input[disabled] { background: var(--surface-secondary); color: var(--text-secondary); cursor: not-allowed; opacity: 0.8; }
          .reg-prefix-input { display: flex; align-items: stretch; border: 1px solid var(--border-brutalist); border-radius: var(--radius-md); background: var(--surface-primary); box-shadow: 2px 2px 0 var(--border-brutalist); overflow: hidden; transition: all var(--transition-base); }
          .dark .reg-prefix-input { box-shadow: 2px 2px 0 var(--border-default); }
          .reg-prefix-input:focus-within { box-shadow: 3px 3px 0 var(--accent-primary); border-color: var(--accent-primary); }
          .reg-prefix-base { padding: 8px var(--space-2) 8px var(--space-3); font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); background: var(--surface-secondary); border-right: 1px solid var(--border-default); white-space: nowrap; display: flex; align-items: center; user-select: none; }
          .reg-prefix-input input { flex: 1; min-width: 0; padding: 8px var(--space-3); border: none !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important; font-size: var(--text-sm); color: var(--text-primary); }
          .reg-prefix-input input:focus { outline: none; }
          .reg-photo-row { display: flex; align-items: center; gap: var(--space-4); }
          .reg-photo-btn { width: 96px; height: 96px; border-radius: 14px; border: 2px dashed var(--border-brutalist); background: var(--surface-secondary); position: relative; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all var(--transition-base); flex-shrink: 0; box-shadow: 2px 2px 0 var(--border-brutalist); }
          .dark .reg-photo-btn { border-color: var(--border-default); box-shadow: 2px 2px 0 var(--border-default); }
          .reg-photo-btn:hover { border-color: var(--accent-primary); box-shadow: 3px 3px 0 var(--accent-primary); transform: translateY(-2px); }
          .reg-photo-btn img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
          .reg-photo-hint { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; }
          .reg-preview-sticky { position: sticky; top: 100px; display: flex; flex-direction: column; gap: var(--space-4); }
          .reg-preview-title { font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; letter-spacing: var(--tracking-wider); color: var(--text-tertiary); display: flex; align-items: center; justify-content: space-between; }
          .reg-preview-card-wrap { width: 100%; max-width: 280px; margin: 0 auto; }
          .reg-preview-meta-panel { background: var(--surface-elevated); border: 1px solid var(--border-default); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--text-xs); box-shadow: 2px 2px 0 var(--border-brutalist); }
          .dark .reg-preview-meta-panel { box-shadow: 2px 2px 0 var(--border-default); }
          .reg-preview-meta-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--border-default); }
          .reg-preview-meta-item:last-child { border-bottom: none; }
          .reg-preview-meta-lbl { color: var(--text-secondary); }
          .reg-preview-meta-val { font-weight: 600; font-family: var(--font-mono); color: var(--text-primary); }
          .reg-status-container { max-width: 650px; margin: 0 auto; width: 100%; }
          .reg-status-card { background: var(--surface-elevated); border: 1px solid var(--border-brutalist); border-radius: var(--radius-xl); padding: var(--space-7); box-shadow: 6px 6px 0 var(--border-brutalist); }
          .dark .reg-status-card { box-shadow: 6px 6px 0 var(--accent-primary); }
          .reg-stepper { display: flex; flex-direction: column; gap: var(--space-5); margin: var(--space-6) 0; position: relative; }
          .reg-step-item { display: flex; align-items: flex-start; gap: var(--space-4); position: relative; }
          .reg-step-item:not(:last-child)::after { content: ""; position: absolute; left: 17px; top: 36px; bottom: -20px; width: 2px; background: var(--border-default); }
          .reg-step-item.completed:not(:last-child)::after { background: var(--accent-success); }
          .reg-step-icon { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-weight: 700; font-size: var(--text-xs); flex-shrink: 0; border: 2px solid var(--border-default); background: var(--surface-secondary); color: var(--text-secondary); z-index: 1; }
          .reg-step-item.completed .reg-step-icon { border-color: var(--accent-success); background: var(--accent-success); color: #fff; }
          .reg-step-item.active .reg-step-icon { border-color: var(--accent-primary); background: var(--surface-elevated); color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(132, 204, 22, 0.2); }
          .reg-step-content { flex: 1; }
          .reg-step-title { font-size: var(--text-sm); font-weight: 700; margin: 0 0 4px; }
          .reg-step-desc { font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; margin: 0; }
          .reg-otp-box { margin-top: var(--space-3); display: flex; gap: var(--space-2); }
          .reg-otp-input { max-width: 180px; font-family: var(--font-mono); font-size: var(--text-base); font-weight: 700; letter-spacing: 0.2em; text-align: center; padding: 8px var(--space-3); border: 2px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-primary); }
          .reg-otp-input:focus { outline: none; border-color: var(--accent-primary); }
          .reg-admin-notice { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; gap: var(--space-3); align-items: flex-start; color: var(--text-primary); font-size: var(--text-xs); line-height: 1.6; }
          .dark .reg-admin-notice { background: rgba(245, 158, 11, 0.12); }
          .jc-preview-card { background: var(--surface-elevated); border: 1px solid var(--border-brutalist); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 5px 5px 0 var(--accent-primary); position: relative; }
          .jc-preview-card__photo { width: 100%; aspect-ratio: 1 / 1; background: var(--surface-secondary); border-bottom: 1px solid var(--border-brutalist); overflow: hidden; position: relative; }
          .jc-preview-card__placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--font-heading); font-size: 5rem; font-weight: var(--weight-bold); color: var(--accent-primary); background-image: radial-gradient(var(--border-default) 1px, transparent 1px); background-size: 16px 16px; background-color: var(--surface-secondary); user-select: none; }
          .jc-preview-card__content { padding: var(--space-3); position: relative; text-align: center; background-color: var(--surface-elevated); }
          .jc-preview-card__name { font-family: var(--font-heading); font-size: var(--text-base); font-weight: var(--weight-bold); letter-spacing: var(--tracking-tight); line-height: var(--leading-tight); color: var(--text-primary); margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .jc-preview-card__batch { font-family: var(--font-body); font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--accent-text-on-surface); margin: 0 0 2px; }
          .dark .jc-preview-card__batch { color: var(--accent-primary-hover); }
          .jc-preview-card__role { font-family: var(--font-body); font-size: var(--text-sm); color: var(--text-secondary); margin: 0; }
          .jc-preview-card__social-footer { display: flex; align-items: stretch; border-top: 1px solid var(--border-brutalist); background: var(--surface-primary); }
          .dark .jc-preview-card__social-footer { border-top-color: var(--border-default); background: transparent; }
          .jc-preview-card__social-cell { flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px 0; color: var(--text-tertiary); text-decoration: none; position: relative; }
          .jc-preview-card__social-cell:hover { color: var(--accent-primary-hover); background: var(--accent-primary-light); }
          .jc-preview-card__social-sep { position: absolute; left: 0; top: 18%; height: 64%; width: 1px; background: var(--border-brutalist); opacity: 0.15; }
          .dark .jc-preview-card__social-sep { background: var(--border-default); opacity: 1; }
          .jc-photo-controls { background: var(--surface-elevated); border: 1px solid var(--border-brutalist); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); box-shadow: 3px 3px 0 var(--border-brutalist); }
          .dark .jc-photo-controls { box-shadow: 3px 3px 0 var(--border-default); }
          .jc-photo-controls__title { font-size: var(--text-xs); font-weight: var(--weight-bold); text-transform: uppercase; letter-spacing: var(--tracking-wider); color: var(--text-tertiary); margin: 0 0 var(--space-1); font-family: var(--font-mono); }
          .jc-photo-controls__row { display: grid; grid-template-columns: 70px 1fr 38px; align-items: center; gap: var(--space-2); }
          .jc-photo-controls__row label { font-size: var(--text-xs); color: var(--text-secondary); white-space: nowrap; }
          .jc-photo-controls__row > span { font-size: var(--text-xs); color: var(--text-tertiary); font-family: var(--font-mono); text-align: right; }
          .jc-slider-wrap { position: relative; display: flex; align-items: center; }
          .jc-slider-wrap .jc-slider { width: 100%; }
          .jc-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; background: var(--border-default); border-radius: 2px; outline: none; cursor: pointer; }
          .jc-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; background: var(--accent-primary); border: 2px solid var(--border-brutalist); border-radius: 50%; cursor: pointer; }
          .jc-slider-mark { position: absolute; bottom: -6px; width: 2px; height: 6px; background: var(--border-default); border-radius: 1px; transform: translateX(-50%); pointer-events: none; }
          .jc-slider-mark--active { background: var(--accent-primary); height: 8px; bottom: -7px; }
          .jc-photo-controls__reset { background: none; border: 1px solid var(--border-default); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--text-tertiary); cursor: pointer; padding: 4px 10px; font-family: inherit; align-self: flex-start; }
          .jc-photo-controls__reset:hover { border-color: var(--accent-primary-hover); color: var(--accent-primary-hover); }
          .jc-preview-hint { font-size: var(--text-xs); color: var(--text-tertiary); text-align: center; margin: 0; line-height: var(--leading-relaxed); }
          .jc-draft-indicator { font-size: 0.8rem; color: var(--color-success, #22c55e); opacity: 0; transition: opacity 0.3s ease; }
          .jc-draft-indicator--visible { opacity: 1; }
        `
      }} />
      <div className="container">
        {/* ══════════════════════════════════════════════════════════
            STAGE 1: INVITATION ACCESS KEY GATE
            ══════════════════════════════════════════════════════════ */}
        {stage === 1 && (
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
                  Please enter the clearance access key dispatched to your email to unlock your specific registration form.
                </p>

                {gateError && (
                  <div className="jc-error-msg" style={{ width: "100%", marginBottom: "var(--space-4)" }}>
                    <AlertCircle size={16} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} />
                    <span>{gateError}</span>
                  </div>
                )}

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
                      {codeChecking ? "Verifying Access Key..." : "Unlock Application Form"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STAGE 2: DEDICATED SPECIFIC FORM (NO 3-ROLE SWITCHER TABS)
            ══════════════════════════════════════════════════════════ */}
        {stage === 2 && (
          <div className="jc-page" style={{ paddingTop: 0 }}>
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

            <div className="jc-layout">
              {/* ── Left Column: Dedicated Form ── */}
              <form className="jc-form" onSubmit={handleSubmitRegistration} noValidate>
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
                          aria-label="Upload profile picture"
                        >
                          {photoUrl ? (
                            <Image src={photoUrl} alt="profile" fill style={{ objectFit: "cover" }} unoptimized />
                          ) : (
                            <div className="jc-photo-upload-btn__inner">
                              <Upload size={22} style={{ color: "var(--text-primary)" }} />
                              <span>Upload Photo</span>
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
                              <li>Photo MUST be exactly squared (1:1 aspect ratio).</li>
                              <li>Max size 5MB (PNG/JPG/WEBP).</li>
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
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@mec.edu.bd"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="contactNumber">Contact Phone Number</label>
                          <input
                            id="contactNumber"
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
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

                      <PrefixInput
                        id="linkedin"
                        name="linkedin"
                        icon={<IconLI />}
                        label="LinkedIn Profile"
                        required
                        prefix="linkedin.com/in/"
                        placeholder="username"
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
                        placeholder="username"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        generatedUrl={toGithubUrl(github)}
                      />

                      <div className="jc-form-group">
                        <label htmlFor="facebook">
                          <IconFB /> Facebook Profile
                        </label>
                        <input
                          id="facebook"
                          type="url"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="https://facebook.com/username"
                        />
                      </div>
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
                          aria-label="Upload profile picture"
                        >
                          {photoUrl ? (
                            <Image src={photoUrl} alt="profile" fill style={{ objectFit: "cover" }} unoptimized />
                          ) : (
                            <div className="jc-photo-upload-btn__inner">
                              <Upload size={22} style={{ color: "var(--text-primary)" }} />
                              <span>Upload Photo</span>
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
                              <li>Photo MUST be exactly squared (1:1 aspect ratio).</li>
                              <li>Max size 5MB (PNG/JPG/WEBP).</li>
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
                            onChange={setAlumniDepartment}
                            options={DEPARTMENT_OPTIONS}
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="alumniBatch">
                            Graduating Batch <span className="jc-required">*</span>
                          </label>
                          <Select
                            id="alumniBatch"
                            value={alumniBatch}
                            onChange={setAlumniBatch}
                            options={ALUMNI_BATCH_OPTIONS}
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="passingYear">
                            Passing Year <span className="jc-required">*</span>
                          </label>
                          <Select
                            id="passingYear"
                            value={passingYear}
                            onChange={setPassingYear}
                            options={ALUMNI_YEAR_OPTIONS}
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="formerStudentId">Former Student ID</label>
                          <input
                            id="formerStudentId"
                            type="text"
                            value={formerStudentId}
                            onChange={(e) => setFormerStudentId(e.target.value)}
                            placeholder="e.g. 190301"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="currentCompany">
                            Current Company / Organization <span className="jc-required">*</span>
                          </label>
                          <input
                            id="currentCompany"
                            type="text"
                            value={currentCompany}
                            onChange={(e) => setCurrentCompany(e.target.value)}
                            required
                            placeholder="e.g. Google, Brain Station 23, Therap"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="currentJobTitle">
                            Job Title / Designation <span className="jc-required">*</span>
                          </label>
                          <input
                            id="currentJobTitle"
                            type="text"
                            value={currentJobTitle}
                            onChange={(e) => setCurrentJobTitle(e.target.value)}
                            required
                            placeholder="e.g. Software Engineer / Tech Lead"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="email">
                            Contact Email <span className="jc-required">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com or personal"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="contactNumber">Contact Phone Number</label>
                          <input
                            id="contactNumber"
                            type="tel"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
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

                      <PrefixInput
                        id="linkedin"
                        name="linkedin"
                        icon={<IconLI />}
                        label="LinkedIn Profile"
                        required
                        prefix="linkedin.com/in/"
                        placeholder="username"
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
                        placeholder="username"
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
                        placeholder="handle"
                        value={codeforces}
                        onChange={(e) => setCodeforces(e.target.value)}
                        generatedUrl={toCfUrl(codeforces)}
                      />

                      <div className="jc-form-group">
                        <label htmlFor="facebook">
                          <IconFB /> Facebook Profile
                        </label>
                        <input
                          id="facebook"
                          type="url"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="https://facebook.com/username"
                        />
                      </div>
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
                          aria-label="Upload profile picture"
                        >
                          {photoUrl ? (
                            <Image src={photoUrl} alt="profile" fill style={{ objectFit: "cover" }} unoptimized />
                          ) : (
                            <div className="jc-photo-upload-btn__inner">
                              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                              <span>Upload Photo</span>
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
                              <li>Photo MUST be exactly squared (1:1 aspect ratio).</li>
                              <li>File size must be under 5MB.</li>
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
                          <label htmlFor="batch">
                            Batch <span className="jc-required">*</span>
                          </label>
                          <input
                            id="batch"
                            type="text"
                            value={batch}
                            onChange={(e) => setBatch(e.target.value)}
                            required
                            placeholder="e.g. CSE, 5th"
                          />
                        </div>
                        <div className="jc-form-group">
                          <label htmlFor="email">
                            Email <span className="jc-required">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@std.mec.edu.bd"
                          />
                        </div>
                      </div>

                      <div className="jc-form__row--2">
                        <div className="jc-form-group">
                          <label htmlFor="password">
                            Password <span className="jc-required">*</span>
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
                    </div>

                    <div className="jc-form__section">
                      <h2 className="jc-form__section-title">
                        <span className="jc-form__section-num">02</span> Social &amp; Competitive Profiles
                      </h2>

                      <div className="jc-form-group">
                        <label htmlFor="linkedin">
                          <IconLI /> LinkedIn <span className="jc-required">*</span>
                        </label>
                        <input
                          id="linkedin"
                          type="url"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          required
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <PrefixInput
                        id="github"
                        name="github"
                        icon={<IconGH />}
                        label="GitHub"
                        required
                        prefix="github.com/"
                        placeholder="username"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        generatedUrl={toGithubUrl(github)}
                      />

                      <div className="jc-form__row--2">
                        <PrefixInput
                          id="codeforces"
                          name="codeforces"
                          icon={<IconCF />}
                          label="Codeforces"
                          required
                          prefix="codeforces.com/"
                          placeholder="handle"
                          value={codeforces}
                          onChange={(e) => setCodeforces(e.target.value)}
                          generatedUrl={toCfUrl(codeforces)}
                        />
                        <PrefixInput
                          id="codechef"
                          name="codechef"
                          icon={<IconCC />}
                          label="CodeChef"
                          required
                          prefix="codechef.com/"
                          placeholder="username"
                          value={codechef}
                          onChange={(e) => setCodechef(e.target.value)}
                          generatedUrl={toCodechefUrl(codechef)}
                        />
                      </div>

                      <PrefixInput
                        id="discord"
                        name="discord"
                        icon={<IconDiscord />}
                        label="Discord"
                        required
                        prefix="@"
                        placeholder="username"
                        value={discord}
                        onChange={(e) => setDiscord(e.target.value)}
                      />

                      <div className="jc-form-group">
                        <label htmlFor="facebook">
                          <IconFB /> Facebook
                        </label>
                        <input
                          id="facebook"
                          type="url"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="https://facebook.com/username"
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
                      : formRole === "advisor"
                      ? "Complete Advisor Induction →"
                      : formRole === "alumni"
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
                    roleType={formRole}
                    name={renderedFullName}
                    subTitle={previewSubTitle}
                    designation={previewDesignation}
                    photoUrl={photoUrl}
                    initial={initial}
                    socials={previewSocials}
                  />

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
