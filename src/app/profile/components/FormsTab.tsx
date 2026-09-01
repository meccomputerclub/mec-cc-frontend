"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { FileText, X, Send } from "lucide-react";

interface FormsTabProps {
  user: AuthUser;
  forms: any[];
}

export function FormsTab({ user, forms }: FormsTabProps) {
  const [activeFormModal, setActiveFormModal] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleOpenForm = (form: any) => {
    setActiveFormModal(form);
    const initial: Record<string, any> = {};
    if (form.fields && Array.isArray(form.fields)) {
      form.fields.forEach((f: any) => {
        initial[f.name || f.label] = "";
      });
    }
    setFormData(initial);
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFormModal) return;

    setSubmitting(true);
    try {
      await api.post(`/api/forms/submit/${activeFormModal._id || activeFormModal.id}`, {
        userId: user.id || user._id,
        responses: formData,
        email: user.email,
        studentId: user.studentId,
      });
      toast.success("Form submitted successfully!");
      setActiveFormModal(null);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to submit form.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-elevated border-[1.5px] border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
        <div>
          <h2 className="font-heading text-lg sm:text-xl font-extrabold text-text-primary m-0">Club Questionnaires &amp; Registrations ({forms.length})</h2>
          <p className="font-body text-xs text-text-secondary mt-0.5">Active registration forms, feedback surveys, and contest sign-up sheets.</p>
        </div>
      </div>

      {forms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((f) => (
            <div
              key={f._id || f.id}
              className="bg-surface-secondary border-[1.5px] border-border-default rounded-md p-4 flex flex-col gap-2.5 transition-all duration-150 hover:border-accent-primary hover:shadow-[3px_3px_0px_0px_var(--accent-primary)] hover:-translate-x-px hover:-translate-y-px"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-sm font-mono text-[10px] font-extrabold uppercase tracking-wider ${
                    f.isActive !== false
                      ? "bg-accent-success-light text-accent-success border border-accent-success"
                      : "bg-red-500/10 text-accent-error border border-accent-error"
                  }`}
                >
                  {f.isActive !== false ? "Active" : "Closed"}
                </span>
                <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-sm font-mono text-[10px] font-extrabold uppercase tracking-wider bg-surface-elevated text-text-secondary border border-border-default">
                  {f.fields?.length || 0} Questions
                </span>
              </div>

              <h3 className="font-heading text-base font-extrabold text-text-primary m-0 leading-snug">{f.title}</h3>

              <p className="text-xs text-text-secondary line-clamp-2 m-0 leading-relaxed">
                {f.description || "Official MEC Computer Club form."}
              </p>

              <div className="mt-auto pt-2 border-t border-dashed border-border-default">
                <Button
                  size="sm"
                  disabled={f.isActive === false}
                  onClick={() => handleOpenForm(f)}
                >
                  Fill Out Form
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-text-secondary">
          <FileText size={48} className="mx-auto mb-3 opacity-40 text-accent-primary" />
          <h3 className="text-lg font-bold text-text-primary mb-1">No Active Forms</h3>
          <p className="max-w-md mx-auto text-sm">
            There are currently no active registrations or surveys open. Any upcoming club questionnaires will appear here.
          </p>
        </div>
      )}

      {/* Dynamic Form Fill Modal */}
      {activeFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease_forwards]" onClick={() => setActiveFormModal(null)}>
          <div className="w-full max-w-[580px] max-h-[90vh] overflow-y-auto bg-surface-elevated border-2 border-text-primary dark:border-border-default rounded-xl shadow-[6px_6px_0px_0px_var(--accent-primary)] p-5 sm:p-6 relative animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)_forwards]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-5 pb-3 border-b-[1.5px] border-border-default">
              <div>
                <h2 className="font-heading text-xl font-extrabold text-text-primary m-0">{activeFormModal.title}</h2>
                <p className="font-body text-xs text-text-secondary mt-1">
                  {activeFormModal.description}
                </p>
              </div>
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 bg-surface-secondary border border-border-default rounded-sm text-text-primary cursor-pointer font-extrabold transition-all duration-150 hover:bg-accent-primary-light hover:rotate-90 shrink-0"
                onClick={() => setActiveFormModal(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
              {activeFormModal.fields && activeFormModal.fields.length > 0 ? (
                activeFormModal.fields.map((field: any, idx: number) => {
                  const fieldKey = field.name || field.label || `field_${idx}`;
                  return (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <label htmlFor={`df_${idx}`} className="flex items-center gap-1.5 font-body text-xs font-bold text-text-primary">
                        {field.label} {field.required && <span className="text-accent-error">*</span>}
                      </label>

                      {field.type === "textarea" ? (
                        <textarea
                          id={`df_${idx}`}
                          rows={3}
                          required={field.required}
                          placeholder={field.placeholder || ""}
                          value={formData[fieldKey] || ""}
                          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                          className="w-full p-3 rounded-md bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default text-text-primary font-body text-sm shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                        />
                      ) : field.type === "select" && field.options ? (
                        <Select
                          id={`df_${idx}`}
                          required={field.required}
                          value={formData[fieldKey] || ""}
                          onChange={(val) => handleFieldChange(fieldKey, val)}
                          options={field.options.map((opt: any) => ({
                            value: typeof opt === "string" ? opt : opt.value,
                            label: typeof opt === "string" ? opt : opt.label,
                          }))}
                        />
                      ) : (
                        <input
                          id={`df_${idx}`}
                          type={field.type || "text"}
                          required={field.required}
                          placeholder={field.placeholder || ""}
                          value={formData[fieldKey] || ""}
                          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                          className="w-full py-2.5 px-3.5 font-body text-sm font-medium text-text-primary bg-surface-primary border-[1.5px] border-text-primary dark:border-border-default rounded-md shadow-[2px_2px_0px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_0px_var(--border-default)] outline-none transition-all duration-150 focus:border-accent-primary focus:shadow-[3px_3px_0px_0px_var(--accent-primary)]"
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-text-secondary text-sm">
                  Click submit to confirm your registration with your profile credentials.
                </p>
              )}

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-border-default">
                <Button type="button" variant="ghost" onClick={() => setActiveFormModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Send size={14} style={{ marginRight: "4px" }} />
                  {submitting ? "Submitting..." : "Submit Responses"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
