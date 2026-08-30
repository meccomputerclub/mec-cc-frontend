"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api, ApiError } from "@/lib/api";
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
} from "lucide-react";

interface AdminAddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminAddMemberModal({ isOpen, onClose, onSuccess }: AdminAddMemberModalProps) {
  const [targetType, setTargetType] = useState<"advisor" | "alumni" | "member">("advisor");
  const [submitting, setSubmitting] = useState(false);

  // Common Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [bio, setBio] = useState("");
  const [systemRole, setSystemRole] = useState<"member" | "moderator" | "admin">("member");

  // Advisor Specific Fields
  const [honorific, setHonorific] = useState("None");
  const [advisorDesignation, setAdvisorDesignation] = useState("Faculty Advisor");
  const [institutionalPost, setInstitutionalPost] = useState("Assistant Professor");
  const [facultyId, setFacultyId] = useState("");

  // Alumni Specific Fields
  const [alumniBatch, setAlumniBatch] = useState("1st Batch");
  const [passingYear, setPassingYear] = useState("2023");
  const [formerStudentId, setFormerStudentId] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentJobTitle, setCurrentJobTitle] = useState("");

  // Student / Member Specific Fields
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState("2022-2023");
  const [batch, setBatch] = useState("6th Batch");
  const [memberCategory, setMemberCategory] = useState<"member" | "executive">("member");
  const [executiveDesignation, setExecutiveDesignation] = useState("Executive Member");

  // Social Links
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [facebook, setFacebook] = useState("");

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

    setSubmitting(true);

    try {
      const hasHonorific = honorific && honorific !== "None" && honorific !== "";
      const payload: any = {
        fullName: targetType === "advisor" && hasHonorific ? `${honorific} ${fullName.trim()}` : fullName.trim(),
        email: email.trim(),
        contactNumber: contactNumber.trim() || "N/A",
        department,
        bio: bio.trim(),
        role: systemRole,
        socialLinks: {
          linkedin: linkedin.trim(),
          github: github.trim(),
          facebook: facebook.trim(),
        },
      };

      if (targetType === "advisor") {
        payload.clubRole = "advisor";
        payload.designation = advisorDesignation.trim() || institutionalPost.trim() || "Faculty Advisor";
        payload.customRole = advisorDesignation.trim() || institutionalPost.trim() || "Faculty Advisor";
        payload.session = institutionalPost.trim() || (department ? `Dept. of ${department}` : "Faculty");
        payload.batch = "Faculty";
        payload.studentId = facultyId.trim() || `FAC-${department}-${Date.now().toString().slice(-4)}`;
      } else if (targetType === "alumni") {
        payload.clubRole = "alumni";
        payload.isGraduated = true;
        payload.passingYear = parseInt(passingYear) || 2023;
        payload.batch = alumniBatch;
        payload.session = `${parseInt(passingYear) - 4}-${passingYear}`;
        payload.studentId = formerStudentId.trim() || `ALM-${Date.now().toString().slice(-6)}`;
        payload.designation = currentJobTitle ? `${currentJobTitle} at ${currentCompany || "Industry"}` : "Alumni";
        payload.customRole = payload.designation;
      } else {
        // General Member or Executive
        payload.clubRole = memberCategory;
        payload.studentId = studentId.trim();
        payload.session = session;
        payload.batch = batch;
        payload.designation = memberCategory === "executive" ? executiveDesignation : "General Member";
        payload.customRole = payload.designation;
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await api.post("/api/users/admin/create-member", formData);

      if (res.success) {
        toast.success(
          `${targetType === "advisor" ? "Advisor" : targetType === "alumni" ? "Alumni" : "Member"} registered & verified successfully!`
        );
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to create member");
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
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--surface-elevated)",
          border: "2px solid var(--border-brutalist)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "8px 8px 0px var(--border-brutalist)",
          maxWidth: "680px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "var(--space-6)",
          position: "relative",
          fontFamily: "var(--font-body)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-5)" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              <UserPlus size={14} /> Admin Direct Entry
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 800, margin: 0 }}>
              Direct Register &amp; Approve Profile
            </h2>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Create an official profile immediately without requiring an invitation key or candidate verification gate.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              padding: "4px",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Role Track Switcher ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "var(--space-5)" }}>
          <button
            type="button"
            onClick={() => setTargetType("advisor")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 8px",
              borderRadius: "var(--radius-md)",
              border: targetType === "advisor" ? "2px solid var(--border-brutalist)" : "1px solid var(--border-default)",
              background: targetType === "advisor" ? "var(--accent-primary-light)" : "var(--surface-secondary)",
              color: targetType === "advisor" ? "var(--text-primary)" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: targetType === "advisor" ? "2px 2px 0 var(--border-brutalist)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <GraduationCap size={15} /> Advisor Panel
          </button>

          <button
            type="button"
            onClick={() => setTargetType("alumni")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 8px",
              borderRadius: "var(--radius-md)",
              border: targetType === "alumni" ? "2px solid var(--border-brutalist)" : "1px solid var(--border-default)",
              background: targetType === "alumni" ? "var(--accent-primary-light)" : "var(--surface-secondary)",
              color: targetType === "alumni" ? "var(--text-primary)" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: targetType === "alumni" ? "2px 2px 0 var(--border-brutalist)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <Building2 size={15} /> Alumni Network
          </button>

          <button
            type="button"
            onClick={() => setTargetType("member")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 8px",
              borderRadius: "var(--radius-md)",
              border: targetType === "member" ? "2px solid var(--border-brutalist)" : "1px solid var(--border-default)",
              background: targetType === "member" ? "var(--accent-primary-light)" : "var(--surface-secondary)",
              color: targetType === "member" ? "var(--text-primary)" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: targetType === "member" ? "2px 2px 0 var(--border-brutalist)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <Users size={15} /> Member / Exec
          </button>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Photo & Main Identification */}
          <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
            {/* Photo Avatar Preview */}
            <div
              style={{
                width: "80px",
                height: "80px",
                minWidth: "80px",
                borderRadius: "var(--radius-md)",
                border: "2px solid var(--border-brutalist)",
                background: "var(--surface-secondary)",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload portrait"
            >
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-body)" }}>
                  <Upload size={18} style={{ margin: "0 auto 2px", display: "block" }} />
                  Photo
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoSelect}
            />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {targetType === "advisor" ? (
                <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "8px" }}>
                  <div className="jc-form-group">
                    <label>Title</label>
                    <Select
                      value={honorific}
                      onChange={setHonorific}
                      options={[
                        { value: "None", label: "None" },
                        { value: "Dr.", label: "Dr." },
                        { value: "Prof.", label: "Prof." },
                        { value: "Prof. Dr.", label: "Prof. Dr." },
                        { value: "Engr.", label: "Engr." },
                        { value: "Mr.", label: "Mr." },
                        { value: "Ms.", label: "Ms." },
                      ]}
                    />
                  </div>
                  <div className="jc-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abu Sayed"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="jc-form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder={targetType === "alumni" ? "e.g. Sabbir Hossain" : "e.g. Faisal Ahmed"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div className="jc-form-group">
                <label>Institutional Email *</label>
                <input
                  type="email"
                  required
                  placeholder={targetType === "advisor" ? "faculty@mec.edu.bd" : "member@student.mec.edu.bd"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Advisor Specific Track ── */}
          {targetType === "advisor" && (
            <div style={{ background: "var(--surface-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div className="jc-form-group">
                  <label>Club Advisor Standing *</label>
                  <Select
                    value={advisorDesignation}
                    onChange={setAdvisorDesignation}
                    options={[
                      { value: "Chief Patron & Principal", label: "Chief Patron & Principal" },
                      { value: "Chief Advisor", label: "Chief Advisor" },
                      { value: "Faculty Advisor", label: "Faculty Advisor" },
                      { value: "Technical Advisor", label: "Technical Advisor" },
                      { value: "Research Mentor", label: "Research Mentor" },
                    ]}
                  />
                </div>

                <div className="jc-form-group">
                  <label>Academic Department *</label>
                  <Select
                    value={department}
                    onChange={setDepartment}
                    options={[
                      { value: "CSE", label: "Computer Science & Eng. (CSE)" },
                      { value: "EEE", label: "Electrical & Electronic (EEE)" },
                      { value: "CE", label: "Civil Engineering (CE)" },
                      { value: "Administration", label: "Administration" },
                      { value: "Basic Science", label: "Basic Science & Humanities" },
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div className="jc-form-group">
                  <label>Official Institutional Post</label>
                  <input
                    type="text"
                    placeholder="e.g. Head of CSE Dept."
                    value={institutionalPost}
                    onChange={(e) => setInstitutionalPost(e.target.value)}
                  />
                </div>

                <div className="jc-form-group">
                  <label>Faculty / Employee ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. FAC-CSE-01"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Alumni Specific Track ── */}
          {targetType === "alumni" && (
            <div style={{ background: "var(--surface-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
                <div className="jc-form-group">
                  <label>Department *</label>
                  <Select
                    value={department}
                    onChange={setDepartment}
                    options={[
                      { value: "CSE", label: "CSE" },
                      { value: "EEE", label: "EEE" },
                      { value: "CE", label: "CE" },
                    ]}
                  />
                </div>

                <div className="jc-form-group">
                  <label>Graduation Batch *</label>
                  <Select
                    value={alumniBatch}
                    onChange={setAlumniBatch}
                    options={[
                      { value: "1st Batch", label: "1st Batch (2019-23)" },
                      { value: "2nd Batch", label: "2nd Batch (2020-24)" },
                      { value: "3rd Batch", label: "3rd Batch (2021-25)" },
                      { value: "4th Batch", label: "4th Batch (2022-26)" },
                    ]}
                  />
                </div>

                <div className="jc-form-group">
                  <label>Graduation Year *</label>
                  <Select
                    value={passingYear}
                    onChange={setPassingYear}
                    options={[
                      { value: "2023", label: "2023" },
                      { value: "2024", label: "2024" },
                      { value: "2025", label: "2025" },
                      { value: "2026", label: "2026" },
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div className="jc-form-group">
                  <label>Current Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Google / TechCorp"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                  />
                </div>

                <div className="jc-form-group">
                  <label>Current Job Title / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={currentJobTitle}
                    onChange={(e) => setCurrentJobTitle(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Student / Member Specific Track ── */}
          {targetType === "member" && (
            <div style={{ background: "var(--surface-secondary)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div className="jc-form-group">
                  <label>Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 210344"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>

                <div className="jc-form-group">
                  <label>Department *</label>
                  <Select
                    value={department}
                    onChange={setDepartment}
                    options={[
                      { value: "CSE", label: "Computer Science & Eng. (CSE)" },
                      { value: "EEE", label: "Electrical & Electronic (EEE)" },
                      { value: "CE", label: "Civil Engineering (CE)" },
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
                <div className="jc-form-group">
                  <label>Session *</label>
                  <Select
                    value={session}
                    onChange={setSession}
                    options={[
                      { value: "2020-2021", label: "2020-2021" },
                      { value: "2021-2022", label: "2021-2022" },
                      { value: "2022-2023", label: "2022-2023" },
                      { value: "2023-2024", label: "2023-2024" },
                      { value: "2024-2025", label: "2024-2025" },
                    ]}
                  />
                </div>

                <div className="jc-form-group">
                  <label>Batch *</label>
                  <Select
                    value={batch}
                    onChange={setBatch}
                    options={[
                      { value: "5th Batch", label: "5th Batch" },
                      { value: "6th Batch", label: "6th Batch" },
                      { value: "7th Batch", label: "7th Batch" },
                      { value: "8th Batch", label: "8th Batch" },
                    ]}
                  />
                </div>

                <div className="jc-form-group">
                  <label>Standing *</label>
                  <Select
                    value={memberCategory}
                    onChange={(v) => setMemberCategory(v as any)}
                    options={[
                      { value: "member", label: "General Member" },
                      { value: "executive", label: "Executive Panel" },
                    ]}
                  />
                </div>
              </div>

              {memberCategory === "executive" && (
                <div className="jc-form-group">
                  <label>Executive Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assistant General Secretary"
                    value={executiveDesignation}
                    onChange={(e) => setExecutiveDesignation(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Social Links & Bio */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div className="jc-form-group">
              <label>LinkedIn URL / Username</label>
              <input
                type="text"
                placeholder="linkedin.com/in/username"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>

            <div className="jc-form-group">
              <label>Website Privilege Clearance</label>
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

          <div className="jc-form-group">
            <label>Bio / Profile Note (Optional)</label>
            <textarea
              rows={2}
              placeholder="Short bio, research interests, or welcome message..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-3)", paddingTop: "var(--space-3)", borderTop: "1px solid var(--border-default)" }}>
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" size="md" disabled={submitting}>
              <Sparkles size={14} style={{ marginRight: "6px" }} />
              {submitting ? "Registering & Approving..." : "Direct Create & Approve Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
