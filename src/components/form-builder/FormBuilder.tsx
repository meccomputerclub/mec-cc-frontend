"use client";

import React, { useEffect, useState } from "react";
import {
  Save,
  FormInput,
  Calendar,
  XOctagonIcon,
  RotateCcw,
  Eye,
  FolderInput,
  Loader2,
  Layers,
  UploadCloud,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  List,
  Mail,
  Hash,
  Share2,
  Copy,
  ExternalLink,
  Check,
  CheckCircle2,
} from "lucide-react";
import { FormField, FieldType } from "@/lib/types/form";
import FieldEditor from "./FieldEditor";
import FormPreviewModal from "./FormPreviewModal";
import ImportFormModal from "./ImportFormModal";
import CoverImageUploader from "./CoverImageUploader";
import { Select } from "@/components/ui/Select";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const initialForm = {
  title: "",
  description: "",
  eventId: "",
  coverImageUrl: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
};

type InitialData = {
  _id: string;
  title: string;
  description?: string;
  eventId?: string;
  coverImageUrl?: string;
  startDate?: string;
  endDate?: string;
  allowMultipleSubmissions?: boolean;
  fields: FormField[];
};

const FIELD_TYPE_TOOLBAR: {
  type: FieldType;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
    { type: "select", label: "Dropdown Select", subtitle: "Single pick list", icon: List },
    { type: "radio", label: "Radio Buttons", subtitle: "Single choice", icon: CircleDot },
    { type: "checkbox", label: "Checkboxes", subtitle: "Multi choice", icon: CheckSquare },
    { type: "file", label: "File Upload", subtitle: "PDF, Image, Doc", icon: UploadCloud },
    { type: "text", label: "Short Text", subtitle: "Single line", icon: Type },
    { type: "textarea", label: "Paragraph", subtitle: "Long response", icon: AlignLeft },
    { type: "email", label: "Email Address", subtitle: "Valid email", icon: Mail },
    { type: "number", label: "Number Input", subtitle: "Numeric only", icon: Hash },
  ];

export default function FormBuilder({ initialData }: { initialData?: InitialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = !!initialData;

  const queryEventId = searchParams.get("eventId") || "";
  const queryEventTitle = searchParams.get("eventTitle") || "";

  const [formInfo, setFormInfo] = useState({
    title: initialData?.title ?? (queryEventTitle ? `${queryEventTitle} Registration Form` : ""),
    description: initialData?.description ?? "",
    eventId: (initialData?.eventId as string) ?? queryEventId,
    coverImageUrl: initialData?.coverImageUrl ?? "",
    startDate: initialData?.startDate ?? new Date().toISOString().split("T")[0],
    endDate: initialData?.endDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [allowMultipleSubmissions, setAllowMultipleSubmissions] = useState(
    initialData?.allowMultipleSubmissions ?? true
  );
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FormField[]>(
    initialData?.fields ?? [
      { label: "Full Name", name: "full_name", type: "text", required: true, placeholder: "Enter your full name" },
      { label: "Email Address", name: "email_address", type: "email", required: true, placeholder: "student@mec.edu.bd" },
    ]
  );
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [saving, setSaving] = useState(false);

  // Modals state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [createdFormModal, setCreatedFormModal] = useState<{ isOpen: boolean; formId: string; title: string }>({
    isOpen: false,
    formId: "",
    title: "",
  });
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/events`,
          { withCredentials: true }
        );
        if (res.data?.data) {
          setEvents(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const addField = (type: FieldType = "text") => {
    const isChoice = ["select", "radio", "checkbox"].includes(type);
    const isFile = type === "file";

    const defaultLabels: Record<FieldType, string> = {
      select: "Choose an Option",
      radio: "Select One Choice",
      checkbox: "Select All That Apply",
      file: "Upload Document / File",
      text: "Short Answer Question",
      textarea: "Detailed Description / Feedback",
      email: "Contact Email Address",
      number: "Numerical Value",
    };

    const newField: FormField = {
      label: defaultLabels[type] || "",
      name: "",
      placeholder: isFile
        ? "Upload your file (PDF, Image, Archive)"
        : type === "email"
          ? "student@mec.edu.bd"
          : "",
      type,
      required: false,
      options: isChoice
        ? [
          { label: "Option 1", value: "option_1" },
          { label: "Option 2", value: "option_2" },
          { label: "Option 3", value: "option_3" },
        ]
        : undefined,
      fileAccept: isFile ? "image/*,.pdf" : undefined,
      maxFileSizeMb: isFile ? 10 : undefined,
    };

    setFields((prev) => [...prev, newField]);
    toast.success(`Added new ${type} question.`);
  };

  const handleFieldChange = (updated: FormField, i: number) => {
    setFields(fields.map((x, idx) => (idx === i ? updated : x)));
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, idx) => idx !== index));
    toast.success("Question removed.");
  };

  const handleDiscard = () => {
    if (confirm("Discard all current changes and reset form builder?")) {
      setFormInfo(initialForm);
      setPendingCoverFile(null);
      setFields([]);
      toast.success("Form reset to blank state.");
    }
  };

  const handleCancelFormCreation = () => {
    router.push("/dashboard/manage-events");
  };

  const handleImportFields = (importedFields: FormField[]) => {
    setFields((prev) => [...prev, ...importedFields]);
  };

  const handleImageSelected = (url: string, file: File | null) => {
    setFormInfo((prev) => ({ ...prev, coverImageUrl: url }));
    setPendingCoverFile(file);
  };

  const submit = async () => {
    if (!formInfo.title.trim()) {
      toast.error("Please provide a title for your form.");
      return;
    }
    if (fields.length === 0) {
      toast.error("Please add at least one question field.");
      return;
    }

    setSaving(true);
    let finalCoverUrl = formInfo.coverImageUrl;

    try {
      // 1. Upload Cover Image to Cloudinary ONLY NOW upon clicking Save & Deploy
      if (pendingCoverFile) {
        const uploadToast = toast.loading("Uploading cover image to Cloudinary...");
        try {
          const formData = new FormData();
          formData.append("image", pendingCoverFile);

          const apiUrl = API_BASE_URL;
          const uploadRes = await axios.post(`${apiUrl}/api/upload/image?folder=forms`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });

          finalCoverUrl = uploadRes.data?.url || uploadRes.data?.secure_url;
          toast.success("Cover image uploaded to Cloudinary!", { id: uploadToast });
        } catch (uploadErr: any) {
          toast.error("Failed to upload cover image. Saving form with standard banner.", { id: uploadToast });
          console.error("Cloudinary upload error:", uploadErr);
        }
      }

      // 2. Format field keys
      const nameCount: Record<string, number> = {};
      const updatedFields = fields.map((field, idx) => {
        const rawLabel = field.label.trim() || `field_${idx + 1}`;
        const count = nameCount[rawLabel] || 0;
        nameCount[rawLabel] = count + 1;

        const cleanKey = rawLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
        const fieldName = count === 0 ? cleanKey : `${cleanKey}_${count + 1}`;

        return { ...field, label: rawLabel, name: field.name || fieldName };
      });

      const payload = {
        ...formInfo,
        eventId: formInfo.eventId && formInfo.eventId !== "111111111111111111111111" ? formInfo.eventId : null,
        coverImageUrl: finalCoverUrl,
        fields: updatedFields,
        allowMultipleSubmissions,
      };

      let res;
      if (isEditMode && initialData?._id) {
        res = await axios.put(
          `${API_BASE_URL}/api/forms/${initialData._id}`,
          payload,
          { withCredentials: true }
        );
      } else {
        res = await axios.post(
          `${API_BASE_URL}/api/forms`,
          payload,
          { withCredentials: true }
        );
      }

      const createdId = res.data?.data?._id || res.data?.data?.id || initialData?._id;

      if (res.data?.success || res.status === 201 || res.status === 200) {
        toast.success(isEditMode ? "Form updated successfully!" : "Form created and published successfully!");
        setPendingCoverFile(null);

        if (isEditMode) {
          // After editing, go back to responses page
          router.push(`/dashboard/manage-events/forms/${initialData!._id}`);
        } else if (createdId) {
          setCreatedFormModal({
            isOpen: true,
            formId: createdId,
            title: formInfo.title,
          });
        } else {
          router.push("/dashboard/manage-events");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "Failed to create form.");
    } finally {
      setSaving(false);
    }
  };

  // Build event options for custom Select
  const eventOptions = [
    { value: "", label: "Independent Club Form (No Event Attached)" },
    ...events.map((e) => ({
      value: e.id || (e as any)._id,
      label: e.title,
    })),
  ];

  const selectedEventObj = events.find(
    (e) => (e.id || (e as any)._id) === formInfo.eventId
  );

  const getPublicFormUrl = (formId: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/forms/${formId}`;
    }
    return `http://localhost:3000/forms/${formId}`;
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Public Form Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto pb-16">
      {/* ── 1. Top Action Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2.5">
            <FormInput className="w-7 h-7 text-accent-primary" />
            {isEditMode ? "Edit Form" : "Custom Form Builder"}
          </h1>
          <p className="text-text-secondary text-sm font-semibold mt-1">
            {isEditMode
              ? `Editing: ${initialData?.title ?? "Untitled Form"}`
              : "Build Google Forms–style registration forms, questionnaires, and contest surveys."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Import Previous Form Fields */}
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-border-default bg-surface-secondary text-text-primary hover:bg-surface-elevated transition shadow-sm"
          >
            <FolderInput className="w-4 h-4 text-accent-primary" /> Import Fields
          </button>

          {/* Live Preview Modal Button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-border-default bg-surface-elevated text-text-primary hover:bg-accent-primary-light transition shadow-sm"
          >
            <Eye className="w-4 h-4 text-accent-primary" /> Preview Form
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="flex items-center gap-2 bg-text-primary text-surface-primary px-5 py-2 rounded-lg text-xs font-semibold hover:bg-surface-inverse transition shadow-[3px_3px_0px_0px_var(--border-default)] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? "Save Changes" : "Save & Deploy"}
          </button>
        </div>
      </div>

      {/* ── 2. Google Forms Style Header Banner & Form Settings ── */}
      <div className="bg-surface-elevated rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] overflow-hidden">
        {/* Cover Uploader with Deferred Cloudinary Upload on Save */}
        <CoverImageUploader
          coverImageUrl={formInfo.coverImageUrl}
          pendingFile={pendingCoverFile}
          onImageSelected={handleImageSelected}
        />

        {/* Form Settings Fields */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                Form Title <span className="text-accent-error">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Intra-MEC Coding Contest Registration"
                value={formInfo.title}
                onChange={(e) => setFormInfo({ ...formInfo, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary text-sm font-semibold focus:outline-none focus:border-accent-primary shadow-[2px_2px_0px_0px_var(--border-default)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                Associated Event <span className="text-accent-error">*</span>
              </label>
              <Select
                id="form-associated-event"
                value={formInfo.eventId}
                onChange={(val) => setFormInfo({ ...formInfo, eventId: val })}
                options={eventOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-accent-primary" /> Opening Date
              </label>
              <input
                type="date"
                value={formInfo.startDate}
                onChange={(e) => setFormInfo({ ...formInfo, startDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-border-default bg-surface-primary text-text-primary text-xs font-semibold focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-primary">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-accent-primary" /> Closing Date
              </label>
              <input
                type="date"
                value={formInfo.endDate}
                onChange={(e) => setFormInfo({ ...formInfo, endDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-border-default bg-surface-primary text-text-primary text-xs font-semibold focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">
              Instructions &amp; Form Description
            </label>
            <textarea
              rows={3}
              placeholder="Tell applicants what this form is for, rules, requirements, and deadlines..."
              value={formInfo.description}
              onChange={(e) => setFormInfo({ ...formInfo, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary text-xs font-medium focus:outline-none focus:border-accent-primary leading-relaxed"
            />
          </div>

          {/* ── Submission Restriction Toggle ── */}
          <div
            onClick={() => setAllowMultipleSubmissions((v) => !v)}
            className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition select-none"
            style={{
              borderColor: !allowMultipleSubmissions ? "var(--accent-primary)" : "var(--border-default)",
              background: !allowMultipleSubmissions
                ? "color-mix(in srgb, var(--accent-primary) 6%, var(--surface-secondary))"
                : "var(--surface-secondary)",
              boxShadow: !allowMultipleSubmissions ? "2px 2px 0px 0px var(--accent-primary)" : "none",
            }}
          >
            {/* Custom checkbox */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `2px solid ${!allowMultipleSubmissions ? "var(--accent-primary)" : "var(--border-default)"}`,
                background: !allowMultipleSubmissions ? "var(--accent-primary)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
                transition: "all 0.15s",
              }}
            >
              {!allowMultipleSubmissions && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">
                Restrict to one response per person
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                When enabled, each account (or email address for anonymous submissions) can only submit once. Duplicate attempts will be blocked with an error message.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Questions List Section ── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-primary" />
            Configured Questions ({fields.length})
          </h3>
          <span className="text-xs text-text-secondary font-semibold">
            Change field type anytime inside question cards
          </span>
        </div>

        {fields.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-border-default rounded-2xl bg-surface-elevated space-y-3">
            <Layers className="w-10 h-10 mx-auto text-text-tertiary" />
            <h4 className="text-base font-semibold text-text-primary">No Questions in This Form Yet</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Click any field type below to add your first question.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <FieldEditor
                key={idx}
                field={field}
                index={idx}
                onChange={(updated) => handleFieldChange(updated, idx)}
                onRemove={() => handleRemoveField(idx)}
              />
            ))}
          </div>
        )}

        {/* ── 4. Bottom-Aligned 8-Pill "ADD QUESTIONS BY FIELD TYPE" Card ── */}
        <div className="bg-surface-elevated p-6 rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-default pb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-primary" /> ADD QUESTIONS BY FIELD TYPE
            </span>
            <span className="text-xs font-semibold text-text-secondary">
              Click any type to append directly below
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {FIELD_TYPE_TOOLBAR.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addField(item.type)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-border-default bg-surface-secondary hover:bg-accent-primary-light hover:border-accent-primary text-left transition shadow-[2px_2px_0px_0px_var(--border-default)] hover:shadow-md group active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-full border border-border-default bg-surface-elevated flex items-center justify-center text-accent-primary group-hover:scale-105 transition shadow-sm shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-text-primary leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-text-secondary font-medium mt-0.5 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. Bottom Action Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border-default">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-default bg-surface-secondary text-text-primary hover:bg-surface-elevated transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-accent-warning" /> Discard
          </button>
          <button
            type="button"
            onClick={handleCancelFormCreation}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-default bg-surface-secondary text-text-secondary hover:text-accent-error hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <XOctagonIcon className="w-4 h-4" /> Cancel
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border border-border-default bg-surface-elevated text-text-primary hover:bg-accent-primary-light transition shadow-sm"
          >
            <Eye className="w-4 h-4 text-accent-primary" /> Preview Form
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="flex items-center gap-2 bg-text-primary text-surface-primary px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-surface-inverse transition shadow-[3px_3px_0px_0px_var(--border-default)] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save &amp; Deploy Form
          </button>
        </div>
      </div>

      {/* ── 6. Preview & Import Modals ── */}
      <FormPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formInfo={formInfo}
        fields={fields}
        eventName={selectedEventObj?.title}
      />

      <ImportFormModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportFields={handleImportFields}
      />

      {/* ── 7. Share & Distribution Success Modal ── */}
      {createdFormModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-primary border-2 border-border-default rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-[8px_8px_0px_0px_var(--border-default)] space-y-6">
            <div className="flex items-center gap-3 text-accent-success">
              <div className="w-12 h-12 rounded-2xl bg-accent-success/15 border border-accent-success/40 flex items-center justify-center text-accent-success">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-text-primary">
                  Form Successfully Deployed!
                </h3>
                <p className="text-xs text-text-secondary">
                  Ready to distribute and accept member responses.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-secondary border border-border-default space-y-2">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-accent-primary" /> Public Shareable Form Link
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getPublicFormUrl(createdFormModal.formId)}
                  className="flex-1 px-3 py-2 rounded-xl border border-border-default bg-surface-elevated text-text-primary text-xs font-mono font-semibold select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(getPublicFormUrl(createdFormModal.formId))}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${copiedLink
                      ? "bg-accent-success text-white border-accent-success"
                      : "bg-accent-primary text-accent-primary-text border-accent-primary hover:opacity-90 shadow-sm"
                    }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`/forms/${createdFormModal.formId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-default bg-surface-elevated text-text-primary hover:bg-surface-primary transition shadow-sm text-center"
              >
                <ExternalLink className="w-4 h-4 text-accent-primary" /> Open Public Form
              </a>

              <button
                type="button"
                onClick={() => router.push("/dashboard/manage-events")}
                className="flex-1 bg-text-primary text-surface-primary px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-surface-inverse transition shadow-sm"
              >
                Done &amp; Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
