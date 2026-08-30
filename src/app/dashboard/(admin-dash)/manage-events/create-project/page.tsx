"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Globe, Calendar, Tag, Users, AlignLeft, Type } from "lucide-react";
import { FaGithub } from "react-icons/fa";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Input({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input {...props} className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm ${props.className || ""}`} />
    </div>
  );
}

const STATUSES = ["planning", "in_progress", "completed", "on_hold", "archived"];

export default function CreateProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", status: "planning",
    startDate: "", endDate: "",
    githubLink: "", liveDemoLink: "",
    requiredSkills: "", teamMemberIds: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        title: form.title,
        description: form.description,
        status: form.status,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        githubLink: form.githubLink || undefined,
        liveDemoLink: form.liveDemoLink || undefined,
        requiredSkills: form.requiredSkills ? form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        teamMembers: form.teamMemberIds ? form.teamMemberIds.split(",").map((s) => s.trim()).filter(Boolean) : [],
      }, { withCredentials: true });
      router.push("/dashboard/manage-events");
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || "Failed." : "Error.");
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/manage-events" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Add Project</h1>
        </div>
        <button type="submit" form="project-form" disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-60">
          <Save size={15} /> {saving ? "Saving…" : "Save Project"}
        </button>
      </div>

      <form id="project-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Project Details</h2>

          <Field label="Project Title" required>
            <Input icon={Type} required placeholder="e.g. Club Management System" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>

          <Field label="Description" required>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              <textarea required rows={4} placeholder="What does this project do? What problem does it solve?" value={form.description} onChange={(e) => set("description", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-y" />
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
              </select>
            </Field>
            <Field label="Start Date">
              <Input icon={Calendar} type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </Field>
            <Field label="End Date">
              <Input icon={Calendar} type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="GitHub Link">
              <Input icon={FaGithub} type="url" placeholder="https://github.com/..." value={form.githubLink} onChange={(e) => set("githubLink", e.target.value)} />
            </Field>
            <Field label="Live Demo Link">
              <Input icon={Globe} type="url" placeholder="https://..." value={form.liveDemoLink} onChange={(e) => set("liveDemoLink", e.target.value)} />
            </Field>
          </div>

          <Field label="Required Skills" hint="Comma-separated, e.g. React, Node.js, MongoDB">
            <Input icon={Tag} placeholder="React, Node.js, MongoDB" value={form.requiredSkills} onChange={(e) => set("requiredSkills", e.target.value)} />
          </Field>

          <Field label="Team Member IDs" hint="Comma-separated MongoDB ObjectIds of team members">
            <Input icon={Users} placeholder="6821c7d2e780b09d2c51d64e, ..." value={form.teamMemberIds} onChange={(e) => set("teamMemberIds", e.target.value)} />
          </Field>
        </div>
      </form>
    </div>
  );
}
