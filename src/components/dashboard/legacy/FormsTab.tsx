"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import { FileText, CheckCircle2, AlertCircle, X, Send } from "lucide-react";

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
    <div className="db-panel">
      <div className="db-panel-header">
        <div>
          <h2>Club Questionnaires &amp; Registrations ({forms.length})</h2>
          <p>Active registration forms, feedback surveys, and contest sign-up sheets.</p>
        </div>
      </div>

      {forms.length > 0 ? (
        <div className="db-items-grid">
          {forms.map((f) => (
            <div key={f._id || f.id} className="db-item-card">
              <div className="db-item-header">
                <span className={`db-tag db-tag--${f.isActive !== false ? "approved" : "rejected"}`}>
                  {f.isActive !== false ? "Active" : "Closed"}
                </span>
                <span className="db-tag db-tag--role">
                  {f.fields?.length || 0} Questions
                </span>
              </div>

              <h3 className="db-item-title">{f.title}</h3>

              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-xs)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {f.description || "Official MEC Computer Club form."}
              </p>

              <div style={{ marginTop: "var(--space-2)" }}>
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
        <div style={{ textAlign: "center", padding: "var(--space-8) 0", color: "var(--text-secondary)" }}>
          <FileText size={48} style={{ margin: "0 auto var(--space-3)", opacity: 0.4 }} />
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-1)" }}>No Active Forms</h3>
          <p style={{ maxWidth: "480px", margin: "0 auto" }}>
            There are currently no active registrations or surveys open. Any upcoming club questionnaires will appear here.
          </p>
        </div>
      )}

      {/* Dynamic Form Fill Modal */}
      {activeFormModal && (
        <div className="db-modal-overlay" onClick={() => setActiveFormModal(null)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <div>
                <h2 style={{ fontSize: "var(--text-xl)", margin: 0 }}>{activeFormModal.title}</h2>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: "4px 0 0" }}>
                  {activeFormModal.description}
                </p>
              </div>
              <button type="button" className="db-modal-close-btn" onClick={() => setActiveFormModal(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="jc-form">
              {activeFormModal.fields && activeFormModal.fields.length > 0 ? (
                activeFormModal.fields.map((field: any, idx: number) => {
                  const fieldKey = field.name || field.label || `field_${idx}`;
                  return (
                    <div key={idx} className="jc-form-group">
                      <label htmlFor={`df_${idx}`}>
                        {field.label} {field.required && <span className="jc-required">*</span>}
                      </label>

                      {field.type === "textarea" ? (
                        <textarea
                          id={`df_${idx}`}
                          rows={3}
                          required={field.required}
                          placeholder={field.placeholder || ""}
                          value={formData[fieldKey] || ""}
                          onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                          style={{ width: "100%", padding: "var(--space-3)", borderRadius: "var(--radius-md)", background: "var(--surface-secondary)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
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
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                  Click submit to confirm your registration with your profile credentials.
                </p>
              )}

              <div className="db-form-actions">
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
