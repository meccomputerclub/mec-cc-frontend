"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import FormBuilder from "@/components/form-builder/FormBuilder";
import { Loader2, XCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const API_URL = API_BASE_URL;

export default function EditFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/forms/${id}`, { withCredentials: true })
      .then((res) => {
        setFormData(res.data.data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load form.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <Loader2 size={36} className="animate-spin text-accent-primary" />
        <p className="text-sm font-medium text-text-secondary">Loading form data...</p>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <XCircle size={40} className="text-accent-error" />
        <p className="font-semibold text-text-primary">{error ?? "Form not found."}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-border-default hover:bg-surface-secondary transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <FormBuilder initialData={formData} />
    </div>
  );
}
