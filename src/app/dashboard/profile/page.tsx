"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import ToastNotification, { Toast } from "@/components/ui/shared/ToastNotification";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";

interface ProfileFormData {
  fullName: string;
  contactNumber: string;
  address: string;
  bio: string;
  facebook: string;
  github: string;
  linkedin: string;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    contactNumber: "",
    address: "",
    bio: "",
    facebook: "",
    github: "",
    linkedin: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        contactNumber: user.contactNumber || "",
        address: user.address || "",
        bio: user.bio || "",
        facebook: user.socialLinks?.facebook || "",
        github: user.socialLinks?.github || "",
        linkedin: user.socialLinks?.linkedin || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          fullName: formData.fullName,
          contactNumber: formData.contactNumber,
          address: formData.address,
          bio: formData.bio,
          socialLinks: {
            facebook: formData.facebook,
            github: formData.github,
            linkedin: formData.linkedin,
          },
        },
        { withCredentials: true }
      );
      await refreshUser();
      setIsEditing(false);
      setToast({ type: "success", message: "Profile updated successfully!" });
    } catch {
      setToast({ type: "error", message: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
          Profile Settings
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Pencil size={16} /> Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition"
          >
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      {/* Avatar + Identity */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-blue-200 dark:border-blue-800">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-blue-500" />
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user.fullName}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 capitalize">
                {user.role}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${user.profileStatus === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
              >
                {user.profileStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Read-only Academic Info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-blue-500" /> Academic Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Student ID" value={user.studentId} />
          <InfoRow label="Department" value={user.department} />
          <InfoRow label="Batch" value={user.batch} />
          <InfoRow label="Session" value={user.session} />
          {user.isGraduated && <InfoRow label="Passing Year" value={String(user.passingYear)} />}
        </div>
      </div>

      {/* Editable Fields */}
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <User size={18} className="text-blue-500" /> Personal Details
        </h4>

        <Field label="Full Name" icon={<User size={16} />}>
          <EditableInput
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            isEditing={isEditing}
            placeholder="Your full name"
          />
        </Field>

        <Field label="Contact Number" icon={<Phone size={16} />}>
          <EditableInput
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            isEditing={isEditing}
            placeholder="+8801XXXXXXXXX"
          />
        </Field>

        <Field label="Address" icon={<MapPin size={16} />}>
          {isEditing ? (
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="Your address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">{formData.address || "—"}</p>
          )}
        </Field>

        <Field label="Bio" icon={<Mail size={16} />}>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Tell us about yourself"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">{formData.bio || "—"}</p>
          )}
        </Field>

        {/* Social Links */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Social Links
          </h4>
          <div className="space-y-3">
            <Field label="Facebook" icon={<FaFacebook size={16} />}>
              <EditableInput
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                isEditing={isEditing}
                placeholder="https://facebook.com/..."
              />
            </Field>
            <Field label="GitHub" icon={<FaGithub size={16} />}>
              <EditableInput
                name="github"
                value={formData.github}
                onChange={handleChange}
                isEditing={isEditing}
                placeholder="https://github.com/..."
              />
            </Field>
            <Field label="LinkedIn" icon={<FaLinkedin size={16} />}>
              <EditableInput
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                isEditing={isEditing}
                placeholder="https://linkedin.com/in/..."
              />
            </Field>
          </div>
        </div>

        {isEditing && (
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>

      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value || "—"}</p>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function EditableInput({
  name,
  value,
  onChange,
  isEditing,
  placeholder,
  required,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  if (!isEditing) {
    return <p className="text-sm text-gray-700 dark:text-gray-300">{value || "—"}</p>;
  }
  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    />
  );
}
