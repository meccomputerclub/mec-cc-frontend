"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FolderInput,
  Search,
  Check,
  Loader2,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { FormField, SavedForm } from "@/lib/types/form";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportFields: (importedFields: FormField[]) => void;
}

export default function ImportFormModal({ isOpen, onClose, onImportFields }: Props) {
  const [loading, setLoading] = useState(false);
  const [formsList, setFormsList] = useState<SavedForm[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFieldIndices, setSelectedFieldIndices] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchForms = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/forms`,
          { withCredentials: true }
        );
        if (res.data?.data) {
          setFormsList(res.data.data);
          if (res.data.data.length > 0) {
            const first = res.data.data[0];
            setSelectedFormId(first._id || first.id);
            setSelectedFieldIndices((first.fields || []).map((_: any, i: number) => i));
          }
        }
      } catch (err) {
        console.error("Failed to fetch forms for import:", err);
        toast.error("Failed to load existing forms list.");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedForm = formsList.find(
    (f) => (f._id || f.id) === selectedFormId
  );

  const filteredForms = formsList.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      f.title?.toLowerCase().includes(q) ||
      f.description?.toLowerCase().includes(q)
    );
  });

  const handleSelectAllFields = () => {
    if (!selectedForm?.fields) return;
    if (selectedFieldIndices.length === selectedForm.fields.length) {
      setSelectedFieldIndices([]);
    } else {
      setSelectedFieldIndices(selectedForm.fields.map((_, i) => i));
    }
  };

  const handleToggleFieldIndex = (idx: number) => {
    if (selectedFieldIndices.includes(idx)) {
      setSelectedFieldIndices(selectedFieldIndices.filter((i) => i !== idx));
    } else {
      setSelectedFieldIndices([...selectedFieldIndices, idx]);
    }
  };

  const handleConfirmImport = () => {
    if (!selectedForm || selectedFieldIndices.length === 0) {
      toast.error("Please select at least one field to import.");
      return;
    }

    const fieldsToImport: FormField[] = selectedFieldIndices
      .map((idx) => selectedForm.fields[idx])
      .filter(Boolean)
      .map((f) => ({
        ...f,
        name: "", // allow fresh names
      }));

    onImportFields(fieldsToImport);
    toast.success(`Imported ${fieldsToImport.length} fields from "${selectedForm.title}"!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-primary border-2 border-border-default rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_var(--border-default)] overflow-hidden">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-5 py-4 bg-surface-secondary border-b border-border-default">
          <div className="flex items-center gap-2">
            <FolderInput className="w-5 h-5 text-accent-primary" />
            <div>
              <h3 className="font-extrabold text-base text-text-primary">
                Import Fields from Existing Form
              </h3>
              <p className="text-xs text-text-secondary font-medium">
                Speed up creation by cloning fields from previous club questionnaires.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Modal Body Split ── */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border-default">
          {/* Left Column: Form Selector List */}
          <div className="md:col-span-5 flex flex-col p-4 space-y-3 bg-surface-secondary/50 overflow-hidden">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search previous forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-border-default rounded-lg bg-surface-elevated text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="p-8 text-center text-text-tertiary text-xs">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-accent-primary" />
                  Loading existing forms...
                </div>
              ) : filteredForms.length > 0 ? (
                filteredForms.map((f) => {
                  const formId = f._id || f.id || "";
                  const isSelected = selectedFormId === formId;

                  return (
                    <div
                      key={formId}
                      onClick={() => {
                        setSelectedFormId(formId);
                        setSelectedFieldIndices((f.fields || []).map((_, i) => i));
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition text-left space-y-1 ${isSelected
                          ? "bg-accent-primary-light border-accent-primary shadow-[3px_3px_0px_0px_var(--border-default)]"
                          : "bg-surface-elevated border-border-default hover:border-accent-primary"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-text-primary line-clamp-1">
                          {f.title || "Untitled Form"}
                        </h4>
                        <span className="text-[10px] font-mono font-semibold bg-surface-secondary px-1.5 py-0.5 rounded border border-border-default">
                          {f.fields?.length || 0} fields
                        </span>
                      </div>

                      {f.description && (
                        <p className="text-[11px] text-text-secondary line-clamp-2">
                          {f.description}
                        </p>
                      )}

                      <div className="text-[10px] text-text-tertiary flex items-center gap-1 pt-1">
                        <Calendar className="w-3 h-3" />
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "Recent Form"}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-text-tertiary text-xs">
                  No existing forms found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Question Fields Preview & Selector */}
          <div className="md:col-span-7 flex flex-col p-5 space-y-4 bg-surface-elevated overflow-hidden">
            {selectedForm ? (
              <>
                <div className="flex items-center justify-between border-b border-border-default pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-text-primary">
                      {selectedForm.title}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      Select which questions you want to import into your new form.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllFields}
                    className="text-xs font-semibold text-accent-primary hover:underline"
                  >
                    {selectedFieldIndices.length === (selectedForm.fields || []).length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {selectedForm.fields && selectedForm.fields.length > 0 ? (
                    selectedForm.fields.map((field, idx) => {
                      const isChecked = selectedFieldIndices.includes(idx);

                      return (
                        <label
                          key={idx}
                          onClick={() => handleToggleFieldIndex(idx)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${isChecked
                              ? "bg-accent-primary-light/40 border-accent-primary"
                              : "bg-surface-primary border-border-default hover:border-accent-primary"
                            }`}
                        >
                          <div
                            className={`mt-0.5 w-4 h-4 rounded-sm border-2 flex items-center justify-center transition ${isChecked
                                ? "border-accent-primary bg-accent-primary text-white"
                                : "border-border-default"
                              }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-text-primary">
                                {field.label || `Field #${idx + 1}`}
                              </span>
                              <span className="text-[10px] uppercase font-mono font-semibold text-text-tertiary bg-surface-secondary px-1.5 py-0.5 rounded border border-border-default">
                                {field.type}
                              </span>
                            </div>

                            {field.placeholder && (
                              <p className="text-[11px] text-text-secondary">
                                Hint: {field.placeholder}
                              </p>
                            )}

                            {field.options && field.options.length > 0 && (
                              <div className="text-[10px] text-text-tertiary pt-1 flex flex-wrap gap-1">
                                <span>Options:</span>
                                {field.options.slice(0, 3).map((o, oi) => (
                                  <span
                                    key={oi}
                                    className="bg-surface-secondary px-1.5 py-0.5 rounded border border-border-default"
                                  >
                                    {o.label}
                                  </span>
                                ))}
                                {field.options.length > 3 && (
                                  <span>+{field.options.length - 3} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-text-tertiary text-xs">
                      This form has no fields.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-tertiary text-xs">
                Select a form from the left to review and import its fields.
              </div>
            )}
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-5 py-3.5 bg-surface-secondary border-t border-border-default flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary">
            {selectedFieldIndices.length} field{selectedFieldIndices.length === 1 ? "" : "s"} selected for import
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border-default bg-surface-elevated text-text-primary hover:bg-surface-primary transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedForm || selectedFieldIndices.length === 0}
              onClick={handleConfirmImport}
              className="bg-text-primary text-surface-primary px-5 py-2 rounded-lg text-xs font-semibold hover:bg-surface-inverse transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_var(--border-default)] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" /> Import Selected Fields
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
