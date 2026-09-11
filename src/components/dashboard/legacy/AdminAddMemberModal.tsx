"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api, ApiError, API_BASE_URL } from "@/lib/api";
import toast from "react-hot-toast";
import {
  UserPlus,
  GraduationCap,
  Building2,
  Users,
  Upload,
  X,
  Sparkles,
  Shield,
  Briefcase,
  CheckCircle2,
  Check,
  Lock,
  Phone,
  Mail,
  Award,
  Globe,
  Code2,
  FileText,
  KeyRound,
} from "lucide-react";

interface AdminAddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEPARTMENT_OPTIONS = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "EEE", label: "Electrical & Electronic Engineering (EEE)" },
  { value: "CE", label: "Civil Engineering (CE)" },
];

const ADVISOR_DEPT_OPTIONS = [
  { value: "CSE", label: "Computer Science & Engineering (CSE)" },
  { value: "EEE", label: "Electrical & Electronic Engineering (EEE)" },
  { value: "CE", label: "Civil Engineering (CE)" },
  { value: "Administration", label: "College Administration" },
  { value: "Basic Science", label: "Basic Science & Humanities" },
];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

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

const SESSION_OPTIONS = [
  { value: "2019-2020", label: "2019-2020" },
  { value: "2020-2021", label: "2020-2021" },
  { value: "2021-2022", label: "2021-2022" },
  { value: "2022-2023", label: "2022-2023" },
  { value: "2023-2024", label: "2023-2024" },
  { value: "2024-2025", label: "2024-2025" },
];

const PASSING_YEAR_OPTIONS = [
  { value: "2022", label: "2022" },
  { value: "2023", label: "2023" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
];

const ADVISOR_STANDING_OPTIONS = [
  { value: "Chief Patron & Principal", label: "Chief Patron & Principal" },
  { value: "Chief Advisor", label: "Chief Advisor" },
  { value: "Faculty Advisor", label: "Faculty Advisor" },
  { value: "Technical Advisor", label: "Technical Advisor" },
  { value: "Research Mentor", label: "Research Mentor" },
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

export function AdminAddMemberModal({ isOpen, onClose, onSuccess }: AdminAddMemberModalProps) {
  const [targetType, setTargetType] = useState<"advisor" | "alumni" | "member">("member");
  const [submitting, setSubmitting] = useState(false);

  // Common Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [batch, setBatch] = useState("");
  const [batchConfig, setBatchConfig] = useState<Record<string, number>>({ CSE: 6, EEE: 14, CE: 8 });
  const [password, setPassword] = useState("mec12345");
  const [bio, setBio] = useState("");
  const [systemRole, setSystemRole] = useState<"member" | "moderator" | "admin">("member");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/site-settings/public`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setBatchConfig(d.data); })
      .catch(() => {});
  }, []);

  // Advisor Specific Fields
  const [honorific, setHonorific] = useState("None");
  const [advisorDesignation, setAdvisorDesignation] = useState("Faculty Advisor");
  const [institutionalPost, setInstitutionalPost] = useState("Assistant Professor");
  const [facultyId, setFacultyId] = useState("");

  // Alumni Specific Fields (matching /register form fields)
  const [passingYear, setPassingYear] = useState("2024");
  const [formerStudentId, setFormerStudentId] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");

  // Student / Member Specific Fields (matching /register form fields)
  const [studentId, setStudentId] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [session, setSession] = useState("2021-2022");
  const [memberCategory, setMemberCategory] = useState<"member" | "executive">("member");
  const [executiveDesignation, setExecutiveDesignation] = useState("Executive Member");
  const [isGraduated, setIsGraduated] = useState(false);

  // Social & Competitive Profiles (matching /register form fields)
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [discord, setDiscord] = useState("");
  const [codeforces, setCodeforces] = useState("");
  const [codechef, setCodechef] = useState("");

  // Photo state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo exceeds 5MB size limit.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      toast.error("Please provide Full Name and Email.");
      return;
    }

    if (targetType === "member" && !studentId.trim()) {
      toast.error("Student ID is required for student members.");
      return;
    }

    if (targetType === "member" && !registrationNumber.trim()) {
      toast.error("Registration Number is required for student members.");
      return;
    }

    if ((targetType === "member" || targetType === "alumni") && !facebook.trim()) {
      toast.error("Facebook profile is required (matches club registration standard).");
      return;
    }

    setSubmitting(true);

    try {
      const hasHonorific = honorific && honorific !== "None" && honorific !== "";
      const payload: any = {
        fullName: targetType === "advisor" && hasHonorific ? `${honorific} ${fullName.trim()}` : fullName.trim(),
        email: email.trim().toLowerCase(),
        contactNumber: contactNumber.trim() || "N/A",
        department,
        bio: bio.trim(),
        role: systemRole,
        password: password.trim() || "mec12345",
        socialLinks: {
          facebook: facebook.trim(),
          linkedin: linkedin.trim(),
          github: github.trim(),
          discord: discord.trim(),
          codeforces: codeforces.trim(),
          codechef: codechef.trim(),
        },
      };

      if (targetType === "advisor") {
        payload.clubRole = "advisor";
        payload.designation = advisorDesignation.trim() || institutionalPost.trim() || "Faculty Advisor";
        payload.session = institutionalPost.trim() || (department ? `Dept. of ${department}` : "Faculty");
        payload.batch = "Faculty";
        payload.studentId = facultyId.trim() || `FAC-${department}-${Date.now().toString().slice(-4)}`;
      } else if (targetType === "alumni") {
        payload.clubRole = "alumni";
        payload.isGraduated = true;
        payload.passingYear = parseInt(passingYear) || 2024;
        payload.session = session.trim();
        payload.batch = batch.trim() || `${department}-Alumni`;
        payload.studentId = formerStudentId.trim() || `ALM-${Date.now().toString().slice(-6)}`;
        payload.designation = currentJobTitle ? `${currentJobTitle} at ${currentCompany || "Industry"}` : "Alumni";
      } else {
        // General Member or Executive
        payload.clubRole = isGraduated ? "alumni" : memberCategory;
        payload.isGraduated = isGraduated;
        if (isGraduated) {
          payload.passingYear = parseInt(passingYear) || new Date().getFullYear();
        }
        payload.studentId = studentId.trim();
        payload.registrationNumber = registrationNumber.trim();
        payload.session = session.trim();
        payload.batch = batch.trim() || `${department}-Batch`;
        payload.designation = memberCategory === "executive" ? executiveDesignation : "General Member";
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await api.post("/api/users/admin/create-member", formData);

      if (res.success) {
        toast.success(
          `${targetType === "advisor" ? "Advisor" : targetType === "alumni" ? "Alumni" : "Member"} registered & approved successfully!`
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to register profile");
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to create profile";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-2xl shadow-[8px_8px_0px_0px_var(--text-primary)] dark:shadow-[8px_8px_0px_0px_var(--border-default)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scoped CSS Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .adm-tab-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 20px;
            background: var(--surface-secondary);
            padding: 6px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-default);
          }
          .adm-tab-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 12px;
            border-radius: var(--radius-md);
            border: 1.5px solid transparent;
            background: transparent;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 150ms ease;
            user-select: none;
          }
          .adm-tab-btn:hover {
            background: var(--surface-primary);
            color: var(--text-primary);
          }
          .adm-tab-btn--active {
            background-color: var(--accent-primary-light) !important;
            color: var(--text-primary) !important;
            font-weight: 700 !important;
            border-color: var(--text-primary) !important;
            box-shadow: 2px 2px 0px 0px var(--text-primary) !important;
          }
          .dark .adm-tab-btn--active {
            background-color: color-mix(in srgb, var(--accent-primary) 25%, var(--surface-primary)) !important;
            color: #FFFFFF !important;
            font-weight: 700 !important;
            border-color: var(--border-default) !important;
            box-shadow: 2px 2px 0px 0px var(--border-default) !important;
          }
          .adm-form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .adm-label {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .adm-required {
            color: var(--accent-error);
            font-weight: 700;
          }
          .adm-input,
          .adm-textarea {
            width: 100%;
            padding: 9px 12px;
            border: 1.5px solid var(--text-primary);
            border-radius: var(--radius-md);
            background: var(--surface-primary);
            font-family: inherit;
            font-size: 13px;
            color: var(--text-primary);
            box-shadow: 2px 2px 0px 0px var(--text-primary);
            transition: all 150ms ease;
            outline: none;
          }
          .dark .adm-input,
          .dark .adm-textarea {
            border-color: var(--border-default);
            box-shadow: 2px 2px 0px 0px var(--border-default);
          }
          .adm-input:focus,
          .adm-textarea:focus {
            border-color: var(--accent-primary) !important;
            box-shadow: 3px 3px 0px 0px var(--accent-primary) !important;
            transform: translate(-1px, -1px);
          }
          .adm-section-card {
            background: var(--surface-secondary);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-lg);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .adm-section-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
            border-bottom: 1px solid var(--border-default);
            padding-bottom: 8px;
            margin-bottom: 2px;
          }
        ` }} />

        {/* ── Modal Header ── */}
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-border-default">
          <div>
            <div className="inline-flex items-center gap-1.5 text-accent-primary text-xs font-black uppercase tracking-wider mb-1">
              <UserPlus size={14} /> Admin Direct Entry
            </div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Direct Register &amp; Approve Profile
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Instantly create a fully verified club profile without requiring an invitation key clearance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border-default hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Role Track Switcher (Tabs) ── */}
        <div className="adm-tab-grid">
          <button
            type="button"
            onClick={() => setTargetType("member")}
            className={`adm-tab-btn ${targetType === "member" ? "adm-tab-btn--active" : ""}`}
          >
            <Users size={16} />
            <span>Member / Exec</span>
            {targetType === "member" && <Check size={14} className="ml-1 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => setTargetType("alumni")}
            className={`adm-tab-btn ${targetType === "alumni" ? "adm-tab-btn--active" : ""}`}
          >
            <Building2 size={16} />
            <span>Alumni Network</span>
            {targetType === "alumni" && <Check size={14} className="ml-1 shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => setTargetType("advisor")}
            className={`adm-tab-btn ${targetType === "advisor" ? "adm-tab-btn--active" : ""}`}
          >
            <GraduationCap size={16} />
            <span>Advisor Panel</span>
            {targetType === "advisor" && <Check size={14} className="ml-1 shrink-0" />}
          </button>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo & Identity Header */}
          <div className="flex gap-4 items-center p-3.5 bg-surface-secondary border border-border-default rounded-xl">
            <div
              className="w-20 h-20 min-w-[80px] rounded-xl border-2 border-text-primary dark:border-border-default bg-surface-primary relative overflow-hidden cursor-pointer flex items-center justify-center shadow-[2px_2px_0px_0px_var(--text-primary)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] group hover:border-accent-primary transition"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload member portrait"
            >
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="text-center text-text-tertiary text-[11px] font-bold">
                  <Upload size={18} className="mx-auto mb-1 text-text-secondary group-hover:text-accent-primary transition" />
                  Portrait
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">Member Portrait Photo</span>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-text-secondary">
                Upload a square passport-style portrait (PNG, JPG, or WebP up to 5MB).
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs font-bold rounded border border-border-default bg-surface-primary hover:bg-surface-elevated text-text-primary transition shadow-xs"
              >
                {previewUrl ? "Change Photo" : "Upload Photo"}
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              TRACK 1: STUDENT MEMBER / EXECUTIVE (Matches /register)
              ══════════════════════════════════════════════════════════ */}
          {targetType === "member" && (
            <div className="space-y-4">
              <div className="adm-section-card">
                <div className="adm-section-title">
                  <Users size={14} /> 01. Academic &amp; Student Identity
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">
                    Full Name <span className="adm-required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tawhid Ahmmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="adm-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Student ID <span className="adm-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 210321"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Registration Number <span className="adm-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1356"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Department <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={department}
                      onChange={(val) => {
                        setDepartment(val);
                        setBatch("");
                      }}
                      options={DEPARTMENT_OPTIONS}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">
                      Batch <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={batch}
                      onChange={setBatch}
                      options={getBatchOptions(department, batchConfig)}
                      placeholder="Select batch…"
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">
                      Session <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={session}
                      onChange={setSession}
                      options={SESSION_OPTIONS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Contact Phone <span className="adm-required">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="adm-input"
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">
                      Institutional Email <span className="adm-required">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@std.mec.edu.bd"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                {/* Standing / Role Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Club Standing <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={memberCategory}
                      onChange={(v) => setMemberCategory(v as any)}
                      options={[
                        { value: "member", label: "General Member" },
                        { value: "executive", label: "Executive Panel" },
                      ]}
                    />
                  </div>

                  {memberCategory === "executive" ? (
                    <div className="adm-form-group">
                      <label className="adm-label">
                        Executive Designation <span className="adm-required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Joint Secretary / Assistant General Secretary"
                        value={executiveDesignation}
                        onChange={(e) => setExecutiveDesignation(e.target.value)}
                        className="adm-input"
                      />
                    </div>
                  ) : (
                    <div className="adm-form-group">
                      <label className="adm-label">Account Initial Password</label>
                      <input
                        type="text"
                        placeholder="Default: mec12345"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="adm-input"
                      />
                    </div>
                  )}
                </div>

                {/* Graduated Checkbox Card (matches /register) */}
                <div className="flex items-center justify-between p-3 bg-surface-primary border border-border-default rounded-xl shadow-xs">
                  <label htmlFor="adm-isGraduated" className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-text-primary select-none">
                    <input
                      id="adm-isGraduated"
                      type="checkbox"
                      checked={isGraduated}
                      onChange={(e) => setIsGraduated(e.target.checked)}
                      className="w-4 h-4 rounded border-border-default text-accent-primary focus:ring-accent-primary accent-accent-primary cursor-pointer"
                    />
                    <span>Has this student graduated? (Mark as Alumni)</span>
                  </label>
                  {isGraduated && (
                    <div className="w-28">
                      <Select
                        value={passingYear}
                        onChange={setPassingYear}
                        options={PASSING_YEAR_OPTIONS}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Social & Competitive Profiles */}
              <div className="adm-section-card">
                <div className="adm-section-title">
                  <Globe size={14} /> 02. Social &amp; Competitive Profiles
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">
                    Facebook Profile <span className="adm-required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://facebook.com/username or username"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="adm-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">LinkedIn Profile (optional)</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">GitHub Profile (optional)</label>
                    <input
                      type="text"
                      placeholder="github.com/username"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">Codeforces Handle (optional)</label>
                    <input
                      type="text"
                      placeholder="Codeforces handle"
                      value={codeforces}
                      onChange={(e) => setCodeforces(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Discord Handle (optional)</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={discord}
                      onChange={(e) => setDiscord(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TRACK 2: ALUMNI NETWORK (Matches /register)
              ══════════════════════════════════════════════════════════ */}
          {targetType === "alumni" && (
            <div className="space-y-4">
              <div className="adm-section-card">
                <div className="adm-section-title">
                  <Building2 size={14} /> 01. Alumni Academic &amp; Career Details
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">
                    Full Name <span className="adm-required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md. Nasir Ahmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="adm-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Department <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={department}
                      onChange={(val) => {
                        setDepartment(val);
                        setBatch("");
                      }}
                      options={DEPARTMENT_OPTIONS}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">
                      Batch <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={batch}
                      onChange={setBatch}
                      options={getBatchOptions(department, batchConfig)}
                      placeholder="Select batch…"
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">
                      Session <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={session}
                      onChange={setSession}
                      options={SESSION_OPTIONS}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">
                      Passing Year <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={passingYear}
                      onChange={setPassingYear}
                      options={PASSING_YEAR_OPTIONS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">Former Student ID (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 190301 (optional)"
                      value={formerStudentId}
                      onChange={(e) => setFormerStudentId(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Academic Session</label>
                    <Select
                      value={session}
                      onChange={setSession}
                      options={SESSION_OPTIONS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">Current Company / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Google, Brain Station 23, Therap"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Job Title / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer / Tech Lead"
                      value={currentJobTitle}
                      onChange={(e) => setCurrentJobTitle(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Contact Email <span className="adm-required">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com or personal"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Contact Phone <span className="adm-required">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Account Initial Password</label>
                  <input
                    type="text"
                    placeholder="Default: mec12345"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="adm-input"
                  />
                </div>
              </div>

              {/* Professional & Social Profiles */}
              <div className="adm-section-card">
                <div className="adm-section-title">
                  <Briefcase size={14} /> 02. Professional &amp; Social Profiles
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">
                    Facebook Profile <span className="adm-required">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://facebook.com/username or username"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="adm-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">LinkedIn Profile (optional)</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">GitHub Profile (optional)</label>
                    <input
                      type="text"
                      placeholder="github.com/username"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Career Summary / Advice for Juniors</label>
                  <textarea
                    rows={2}
                    placeholder="Brief background, tech stack, career journey, or advice..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="adm-textarea"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TRACK 3: ADVISOR PANEL (Preserved as requested)
              ══════════════════════════════════════════════════════════ */}
          {targetType === "advisor" && (
            <div className="space-y-4">
              <div className="adm-section-card">
                <div className="adm-section-title">
                  <GraduationCap size={14} /> 01. Faculty Advisor Designation &amp; Identity
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">Title / Honorific</label>
                    <Select
                      value={honorific}
                      onChange={setHonorific}
                      options={ADVISOR_HONORIFICS}
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Full Name <span className="adm-required">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abu Sayed"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Academic Department <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={department}
                      onChange={setDepartment}
                      options={ADVISOR_DEPT_OPTIONS}
                    />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">
                      Club Advisor Standing <span className="adm-required">*</span>
                    </label>
                    <Select
                      value={advisorDesignation}
                      onChange={setAdvisorDesignation}
                      options={ADVISOR_STANDING_OPTIONS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">Institutional Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Head of CSE Dept. / Associate Professor"
                      value={institutionalPost}
                      onChange={(e) => setInstitutionalPost(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Faculty / Employee ID (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. FAC-CSE-01"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">
                      Institutional Email <span className="adm-required">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="faculty@mec.edu.bd"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Account Initial Password</label>
                  <input
                    type="text"
                    placeholder="Default: mec12345"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="adm-input"
                  />
                </div>
              </div>

              <div className="adm-section-card">
                <div className="adm-section-title">
                  <Globe size={14} /> 02. Professional Links &amp; Welcome Message
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="adm-form-group">
                    <label className="adm-label">LinkedIn Profile</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Facebook Profile</label>
                    <input
                      type="text"
                      placeholder="facebook.com/username"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">Bio / Advisor Note (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Research interests, welcome message, or department note..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="adm-textarea"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Privilege Clearance ── */}
          <div className="adm-form-group p-3 bg-surface-secondary border border-border-default rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="adm-label">
                  <Shield size={14} className="text-accent-primary" /> Web Portal Role Clearance
                </label>
                <p className="text-[11px] text-text-secondary">
                  Determines permission level inside the administrative dashboard.
                </p>
              </div>
              <div className="w-48">
                <Select
                  value={systemRole}
                  onChange={(v) => setSystemRole(v as any)}
                  options={[
                    { value: "member", label: "Standard Member" },
                    { value: "moderator", label: "Platform Moderator" },
                    { value: "admin", label: "Administrator" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="md"
              disabled={submitting}
            >
              <Sparkles size={14} className="mr-1.5" />
              {submitting ? "Direct Creating Profile..." : "Direct Register & Approve"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
