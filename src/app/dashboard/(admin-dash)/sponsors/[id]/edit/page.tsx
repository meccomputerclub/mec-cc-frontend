"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useParams } from "next/navigation";
import SponsorForm from "@/components/dashboard/SponsorForm";
import { RefreshCw } from "lucide-react";

export default function EditSponsorPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE_URL}/api/sponsors/${id}`, { withCredentials: true })
      .then((res: any) => setData({ ...res.data.data, _id: id }))
      .catch(() => setError("Failed to load sponsor details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error || "Sponsor not found."}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return <SponsorForm mode="edit" initialData={data} />;
}
