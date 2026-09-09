"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  Calendar,
  Send,
  UploadCloud,
  Check,
  FileCheck2,
  AlertCircle,
  Loader2,
  Clock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { FormField } from "@/lib/types/form";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";

interface FormData {
  _id: string;
  title: string;
  description?: string;
  eventId?: { _id: string; title: string } | string;
  coverImageUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  allowMultipleSubmissions?: boolean;
  fields: FormField[];
}

export default function PublicFormViewPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // User input states
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [fileAttachments, setFileAttachments] = useState<Record<string, File>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      setLoading(true);
      try {
        const apiUrl = API_BASE_URL;
        const res = await axios.get(`${apiUrl}/api/forms/${formId}`);
        if (res.data?.data) {
          setForm(res.data.data);
        } else {
          setForm(res.data);
        }
      } catch (err: any) {
        console.error("Error fetching form:", err);
        toast.error("Form not found or is no longer active.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleInputChange = (fieldName: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckboxToggle = (fieldName: string, optValue: string) => {
    setResponses((prev) => {
      const current = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      if (current.includes(optValue)) {
        return { ...prev, [fieldName]: current.filter((v) => v !== optValue) };
      } else {
        return { ...prev, [fieldName]: [...current, optValue] };
      }
    });
  };

  const handleFileSelect = (fieldName: string, file: File) => {
    setFileAttachments((prev) => ({ ...prev, [fieldName]: file }));
    setFilePreviews((prev) => ({ ...prev, [fieldName]: `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)` }));
  };

  const handleRemoveFile = (fieldName: string) => {
    setFileAttachments((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    setFilePreviews((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    for (const field of form.fields) {
      const key = field.name;
      const isFile = field.type === "file";

      if (field.required) {
        if (isFile) {
          if (!fileAttachments[key] && !responses[key]) {
            toast.error(`"${field.label}" is required. Please upload your file.`);
            return;
          }
        } else {
          const val = responses[key];
          if (val === undefined || val === null || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
            toast.error(`"${field.label}" is required.`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting response...");

    try {
      const apiUrl = API_BASE_URL;
      const finalResponses: Record<string, any> = { ...responses };

      // Upload any file attachments first to Cloudinary
      for (const [key, file] of Object.entries(fileAttachments)) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await axios.post(`${apiUrl}/api/upload/file?folder=form_submissions`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });

        const fileUrl = uploadRes.data?.url || uploadRes.data?.secure_url;
        finalResponses[key] = fileUrl || file.name;
      }

      // Submit responses to form submission endpoint
      const res = await axios.post(
        `${apiUrl}/api/forms/submit/${formId}`,
        { responses: finalResponses },
        { withCredentials: true }
      );

      if (res.data?.success || res.status === 201) {
        toast.success("Form submitted successfully!", { id: toastId });
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      toast.error(err.response?.data?.message || "Failed to submit response. Please try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary/50 flex items-center justify-center p-4">
        <div className="p-8 rounded-2xl bg-surface-elevated border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] flex items-center gap-3 text-sm font-semibold text-text-primary">
          <Loader2 className="w-5 h-5 animate-spin text-accent-primary" />
          <span>Loading form...</span>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-surface-secondary/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-surface-elevated border border-border-default shadow-[6px_6px_0px_0px_var(--border-default)] text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-accent-error" />
          <h2 className="text-xl font-black text-text-primary">Form Unavailable</h2>
          <p className="text-xs text-text-secondary">
            This form does not exist or has been closed by the administrators.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-xl bg-text-primary text-surface-primary text-xs font-semibold hover:bg-surface-inverse transition"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Event title helper
  const eventTitle = typeof form.eventId === "object" ? form.eventId?.title : undefined;

  return (
    <div className="min-h-screen bg-surface-secondary/40 py-8 px-4 sm:px-6 flex flex-col items-center">
      {/* ── Main Form Column ── */}
      <div className="w-full max-w-2xl space-y-5">
        {/* Navigation & Header Brand */}
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent-primary bg-accent-primary-light px-2.5 py-0.5 rounded border border-accent-primary/30">
            MEC Computer Club Official
          </span>
        </div>

        {submitted ? (
          /* ── Submission Confirmation Card ── */
          <div className="bg-surface-elevated rounded-2xl border border-border-default shadow-[6px_6px_0px_0px_var(--border-default)] p-8 sm:p-10 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-accent-success/15 border border-accent-success/40 flex items-center justify-center text-accent-success mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary">
                Response Recorded!
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                Thank you for your submission for <strong className="text-text-primary">{form.title}</strong>. Your response has been securely saved.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setResponses({});
                  setFileAttachments({});
                  setFilePreviews({});
                  setSubmitted(false);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border-default bg-surface-primary text-text-primary hover:bg-surface-secondary text-xs font-semibold transition shadow-sm"
              >
                Submit another response
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-text-primary text-surface-primary hover:bg-surface-inverse text-xs font-semibold transition shadow-sm"
              >
                Return to Club Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Form Google-Forms Header Card ── */}
            <div className="bg-surface-elevated rounded-2xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] overflow-hidden">
              {form.coverImageUrl ? (
                <div
                  className="w-full h-44 sm:h-60 bg-cover bg-center border-b border-border-default"
                  style={{ backgroundImage: `url(${form.coverImageUrl})` }}
                />
              ) : (
                <div className="w-full h-3.5 bg-accent-primary border-b border-border-default" />
              )}

              <div className="p-6 sm:p-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-accent-primary bg-accent-primary-light px-2.5 py-0.5 rounded border border-accent-primary/30">
                      Registration &amp; Questionnaire
                    </span>
                    {form.allowMultipleSubmissions === false && (
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                        1 Response Per Person
                      </span>
                    )}
                  </div>

                  {form.endDate && (
                    <span className="text-[11px] font-medium text-text-tertiary flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Closes: {form.endDate}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                  {form.title}
                </h1>

                {form.description ? (
                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line border-t border-border-default pt-3">
                    {form.description}
                  </p>
                ) : (
                  <p className="text-text-tertiary text-xs italic border-t border-border-default pt-3">
                    Please fill out the questions below to submit your details.
                  </p>
                )}

                {eventTitle && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary bg-surface-secondary px-3 py-1.5 rounded-lg border border-border-default mt-1">
                    <Calendar className="w-3.5 h-3.5 text-accent-primary" /> Associated Event: {eventTitle}
                  </div>
                )}
              </div>
            </div>

            {/* ── Question Cards ── */}
            <div className="space-y-4">
              {form.fields.map((field, idx) => {
                const key = field.name || `field_${idx}`;
                const isFile = field.type === "file";
                const isRadio = field.type === "radio";
                const isCheckbox = field.type === "checkbox";
                const isSelect = field.type === "select";

                return (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-surface-elevated border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] space-y-3.5 transition hover:border-accent-primary"
                  >
                    <label className="block text-sm font-semibold text-text-primary">
                      {field.label}{" "}
                      {field.required && <span className="text-accent-error">*</span>}
                    </label>

                    {/* Text / Email / Number */}
                    {["text", "email", "number"].includes(field.type) && (
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder || "Your answer..."}
                        value={responses[key] || ""}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary shadow-sm"
                      />
                    )}

                    {/* Textarea */}
                    {field.type === "textarea" && (
                      <textarea
                        rows={3}
                        required={field.required}
                        placeholder={field.placeholder || "Write your response..."}
                        value={responses[key] || ""}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-surface-primary text-text-primary text-sm focus:outline-none focus:border-accent-primary shadow-sm leading-relaxed"
                      />
                    )}

                    {/* Dropdown Select */}
                    {isSelect && (
                      <Select
                        id={`form-select-${idx}`}
                        value={responses[key] || ""}
                        onChange={(val) => handleInputChange(key, val)}
                        options={[
                          { value: "", label: "Choose an option..." },
                          ...(field.options || []).map((o) => ({
                            value: o.value,
                            label: o.label,
                          })),
                        ]}
                      />
                    )}

                    {/* Radio Choices */}
                    {isRadio && (
                      <div className="space-y-2 pt-1">
                        {(field.options || []).map((opt, oIdx) => {
                          const isSelected = responses[key] === opt.value;
                          return (
                            <div
                              key={oIdx}
                              onClick={() => handleInputChange(key, opt.value)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${isSelected
                                  ? "bg-accent-primary-light border-accent-primary text-text-primary font-semibold shadow-sm"
                                  : "bg-surface-primary border-border-default text-text-secondary hover:border-accent-primary"
                                }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected
                                    ? "border-accent-primary bg-accent-primary"
                                    : "border-border-default"
                                  }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="text-xs sm:text-sm">{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Checkbox Choices */}
                    {isCheckbox && (
                      <div className="space-y-2 pt-1">
                        {(field.options || []).map((opt, oIdx) => {
                          const selectedArray: string[] = Array.isArray(responses[key])
                            ? responses[key]
                            : [];
                          const isChecked = selectedArray.includes(opt.value);

                          return (
                            <div
                              key={oIdx}
                              onClick={() => handleCheckboxToggle(key, opt.value)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${isChecked
                                  ? "bg-accent-primary-light border-accent-primary text-text-primary font-semibold shadow-sm"
                                  : "bg-surface-primary border-border-default text-text-secondary hover:border-accent-primary"
                                }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${isChecked
                                    ? "border-accent-primary bg-accent-primary text-white"
                                    : "border-border-default"
                                  }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-xs sm:text-sm">{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* File Upload Dropzone */}
                    {isFile && (
                      <div className="space-y-2">
                        {filePreviews[key] ? (
                          <div className="flex items-center justify-between bg-surface-secondary p-3.5 rounded-xl border border-border-default">
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-text-primary">
                              <FileCheck2 className="w-5 h-5 text-accent-success" />
                              <span>{filePreviews[key]}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(key)}
                              className="text-xs font-semibold text-accent-error hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-border-default rounded-xl p-6 bg-surface-primary text-center block cursor-pointer hover:border-accent-primary transition group">
                            <input
                              type="file"
                              accept={field.fileAccept || "*"}
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileSelect(key, f);
                              }}
                            />
                            <UploadCloud className="w-8 h-8 mx-auto text-accent-primary group-hover:scale-110 transition mb-1" />
                            <div className="text-xs font-semibold text-text-primary">
                              <span className="text-accent-primary hover:underline">Click to browse file</span> or drag &amp; drop
                            </div>
                            <p className="text-[11px] text-text-tertiary mt-1">
                              Accepted: {field.fileAccept || "image/*,.pdf"} • Max: {field.maxFileSizeMb || 10}MB
                            </p>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Submit Action Card ── */}
            <div className="p-5 rounded-2xl bg-surface-elevated border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)] flex items-center justify-between">
              <span className="text-xs text-text-tertiary font-semibold">
                {form.fields.length} Question{form.fields.length === 1 ? "" : "s"}
              </span>

              <button
                type="submit"
                disabled={submitting}
                className="bg-text-primary text-surface-primary py-2.5 px-6 rounded-xl font-semibold hover:bg-surface-inverse transition flex items-center gap-2 shadow-[3px_3px_0px_0px_var(--border-default)] text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
