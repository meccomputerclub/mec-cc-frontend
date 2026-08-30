"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { AuthUser } from "@/types";
import { UserIcon, LinkIcon, MapPinIcon, CameraIcon } from "lucide-react";
import axios from "axios";
import { capitalizeFirstLetter, isValidUrl } from "@/lib/utils";
import { useParams } from "next/navigation";
import UserAvatarWithFallback from "@/components/ui/shared/UserAvatarWithFallback";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import ProfileCard from "@/components/ui/shared/ProfileCard";

// --- Dummy Data for Initial Development ---
const initialUserData: AuthUser = {
  _id: "6921c7d2e780b09d2c51d64e",
  email: "test.member@club.com",
  fullName: "Alice Johnson",
  imageUrl: process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL,
  role: "member",
  applicationStatus: "approved",
  profileStatus: "active",
  isApproved: true,
  isVerified: true,
  studentId: "19101001",
  department: "CSE",
  batch: "19th",
  session: "2018-2019",
  isGraduated: false,
  contactNumber: "01700-123456",
  bio: "Passionate coder and event organizer. Dedicated to contributing to the club's growth and mentoring juniors.",
  socialLinks: {
    linkedin: "https://linkedin.com/in/alice",
    github: "https://github.com/alicecode",
  },
  // professionalCareer: {
  //   currentCompany: "Tech Corp",
  //   designation: "Software Engineer",
  //   experience: "3 years",
  // },
};

// Define the shape of the data being edited
type EditableUserData = Pick<
  AuthUser,
  | "fullName"
  | "studentId"
  | "department"
  | "batch"
  | "session"
  | "contactNumber"
  | "address"
  | "bio"
> & {
  socialLinks?: {
    linkedin?: string;
    github?: string;
    facebook?: string;
  };
  professionalCareer?: {
    currentCompany?: string;
    designation?: string;
    experience?: string;
  };
};

const DetailField: React.FC<{
  label: string;
  name: string;
  value: string | number | null | undefined;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  inlineError?: string;
}> = ({ label, name, value, isEditing, onChange, inlineError }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
    {isEditing ? (
      <>
        <input
          type="text"
          name={name}
          value={(value as string) || ""}
          onChange={onChange}
          className={`mt-1 border rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition focus:ring-blue-500 focus:border-blue-500 ${inlineError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600"
            }`}
        />
        {inlineError && <p className="text-sm text-red-500 mt-1">{inlineError}</p>}
      </>
    ) : (
      <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-1">{value || "N/A"}</p>
    )}
  </div>
);

const SocialLink: React.FC<{ url?: string; label: string }> = ({ url, label }) => (
  <div className="flex items-center space-x-2">
    <LinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`transition ${url
          ? "text-blue-600 hover:underline dark:text-blue-400"
          : "text-gray-500 dark:text-gray-600 pointer-events-none"
        }`}
    >
      {label}
    </a>
  </div>
);

export default function MemberDetailsPage() {
  const [user, setUser] = useState<AuthUser | null>(initialUserData);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditableUserData>({} as EditableUserData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const params = useParams();
  const userId = params.id;
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile/${userId}`,
          {
            withCredentials: true,
          }
        );
        setUser(response.data.data);
      } catch (error) {
        console.log("Error fetching user data.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        studentId: user.studentId || "",
        department: user.department || "",
        batch: user.batch || "",
        session: user.session || "",
        contactNumber: user.contactNumber || "",
        address: user.address || "",
        bio: user.bio || "",
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          facebook: user.socialLinks?.facebook || "",
        },
        // professionalCareer: {
        //   currentCompany: user.professionalCareer?.currentCompany || "",
        //   designation: user.professionalCareer?.designation || "",
        //   experience: user.professionalCareer?.experience || "",
        // },
      });
    }
  }, [user]);

  const canEdit = useMemo(() => {
    if (!currentUser?._id || !user?._id) return false;
    return currentUser.role === "admin" || currentUser._id === user._id;
  }, [currentUser, user]);

  // const hasProfessionalInfo = useMemo(() => {
  //   return (
  //     user?.professionalCareer &&
  //     (user.professionalCareer.currentCompany ||
  //       user.professionalCareer.designation ||
  //       user.professionalCareer.experience)
  //   );
  // }, [user]);

  // Handlers
  const handleEdit = (section: string) => {
    setIsEditing(section);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setImagePreview(null);
    setSelectedImageFile(null);
    if (user) {
      setFormData({
        fullName: user.fullName,
        studentId: user.studentId || "",
        department: user.department || "",
        batch: user.batch || "",
        session: user.session || "",
        contactNumber: user.contactNumber || "",
        address: user.address || "",
        bio: user.bio || "",
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          facebook: user.socialLinks?.facebook || "",
        },
        // professionalCareer: {
        //   currentCompany: user.professionalCareer?.currentCompany || "",
        //   designation: user.professionalCareer?.designation || "",
        //   experience: user.professionalCareer?.experience || "",
        // },
      });
    }
  };

  const handleImageUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      // Upload image first if selected
      if (selectedImageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", selectedImageFile);

        const res = await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/update/image/${user?._id}`,
          imageFormData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setUser((prev: any) => ({ ...prev!, ...res.data.data.user }));
      }
      setIsEditing(null);
      setImagePreview(null);
      setSelectedImageFile(null);
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update user details. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    // console.log("formData:", formData);
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/update/${user?._id}`,
        formData,
        { withCredentials: true }
      );
      setUser((prev: any) => ({ ...prev!, ...res.data.data.user }));
      setIsEditing(null);
      setImagePreview(null);
      setSelectedImageFile(null);
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update user details. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.startsWith("socialLinks.")) {
      if (value && !isValidUrl(value)) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: `${capitalizeFirstLetter(name.split(".")[1])} must be a valid URL.`,
        }));
      } else {
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[name];
          return newErrors;
        });
      }
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: value,
        },
      }));
    } else if (name.startsWith("professionalCareer.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        professionalCareer: {
          ...prev.professionalCareer,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store the file for later upload
    setSelectedImageFile(file);
    setError(null);
  };

  const handleDiscardImageChange = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading && !user) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Loading user profile...
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-10 text-red-500">User not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white border-b pb-4 border-gray-200 dark:border-gray-700">
        {user.fullName}
        <span className="text-xl font-medium text-gray-500 dark:text-gray-400 ml-4">
          ({capitalizeFirstLetter(user.role)})
        </span>
      </h1>

      {error && (
        <div className="p-4 text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar and Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
            {/* Image with upload overlay */}
            <div className="mx-auto w-32 h-32 mb-4 relative rounded-full overflow-hidden border-4 border-blue-500 dark:border-blue-400 group">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserAvatarWithFallback
                  initialImageUrl={user.imageUrl}
                  fullName={user.fullName}
                  w={128}
                  h={128}
                />
              )}

              {canEdit && !imagePreview && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
                  >
                    <CameraIcon className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{user.fullName}</h2>
            <p className="text-blue-600 dark:text-blue-400">{capitalizeFirstLetter(user.role)}</p>

            <div
              className={`mt-3 py-1 px-3 inline-flex text-sm rounded-full font-semibold 
                ${user.profileStatus === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }
            `}
            >
              {capitalizeFirstLetter(user.profileStatus || "")}
            </div>
            {/* Image change actions */}
            {imagePreview && canEdit && (
              <div className="flex gap-1 mt-4">
                <button
                  onClick={handleImageUpdate}
                  disabled={loading}
                  className="w-full py-2 rounded-md text-sm text-white transition disabled:opacity-50 bg-blue-600 dark:bg-blue-400"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleDiscardImageChange}
                  className="w-full py-2 rounded-md text-sm bg-red-600 dark:bg-red-400 text-white transition disabled:opacity-50"
                >
                  Discard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details & Editing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic & Personal Details */}
          <ProfileCard
            title="Academic & Personal Details"
            icon={UserIcon}
            sectionKey="profile"
            canEdit={canEdit}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={loading}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <DetailField
                label="Full Name"
                name="fullName"
                value={isEditing === "profile" ? formData.fullName : user.fullName || ""}
                isEditing={isEditing === "profile"}
                onChange={handleInputChange}
              />
              <DetailField
                label="Student ID"
                name="studentId"
                value={isEditing === "profile" ? formData.studentId : user.studentId}
                isEditing={isEditing === "profile"}
                onChange={handleInputChange}
              />
              <DetailField
                label="Department"
                name="department"
                value={isEditing === "profile" ? formData.department : user.department}
                isEditing={isEditing === "profile"}
                onChange={handleInputChange}
              />
              <DetailField
                label="Batch"
                name="batch"
                value={isEditing === "profile" ? formData.batch : user.batch}
                isEditing={isEditing === "profile"}
                onChange={handleInputChange}
              />
              <DetailField
                label="Session"
                name="session"
                value={isEditing === "profile" ? formData.session : user.session}
                isEditing={isEditing === "profile"}
                onChange={handleInputChange}
              />
            </div>
          </ProfileCard>

          {/* Contact & Bio */}
          <ProfileCard
            title="Contact & Bio"
            icon={MapPinIcon}
            sectionKey="contact"
            canEdit={canEdit}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={loading}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailField
                  label="Contact Number"
                  name="contactNumber"
                  value={isEditing === "contact" ? formData.contactNumber : user.contactNumber}
                  isEditing={isEditing === "contact"}
                  onChange={handleInputChange}
                />
                <DetailField
                  label="Email"
                  name="email"
                  value={user.email}
                  isEditing={false}
                  onChange={handleInputChange}
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Address
                </label>
                {isEditing === "contact" ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">
                    {user.address || "N/A"}
                  </p>
                )}
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Bio
                </label>
                {isEditing === "contact" ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">
                    {user.bio || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </ProfileCard>

          {/* Professional Information
          {(hasProfessionalInfo || canEdit) && (
            <ProfileCard
              title="Professional Information"
              icon={BriefcaseIcon}
              sectionKey="professional"
              canEdit={canEdit}
              isEditing={isEditing}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              loading={loading}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailField
                  label="Current Company"
                  name="professionalCareer.currentCompany"
                  value={
                    isEditing === "professional"
                      ? formData.professionalCareer?.currentCompany
                      : user.professionalCareer?.currentCompany
                  }
                  isEditing={isEditing === "professional"}
                  onChange={handleInputChange}
                />
                <DetailField
                  label="Designation"
                  name="professionalCareer.designation"
                  value={
                    isEditing === "professional"
                      ? formData.professionalCareer?.designation
                      : user.professionalCareer?.designation
                  }
                  isEditing={isEditing === "professional"}
                  onChange={handleInputChange}
                />
                <DetailField
                  label="Experience"
                  name="professionalCareer.experience"
                  value={
                    isEditing === "professional"
                      ? formData.professionalCareer?.experience
                      : user.professionalCareer?.experience
                  }
                  isEditing={isEditing === "professional"}
                  onChange={handleInputChange}
                />
              </div>
            </ProfileCard>
          )} */}

          {/* Social Links */}
          <ProfileCard
            title="Social Links"
            icon={LinkIcon}
            sectionKey="social"
            canEdit={canEdit}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={loading}
          >
            {isEditing === "social" ? (
              <div className="space-y-4">
                <DetailField
                  label="LinkedIn"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks?.linkedin}
                  isEditing={true}
                  onChange={handleInputChange}
                  inlineError={validationErrors["socialLinks.linkedin"]}
                />
                <DetailField
                  label="GitHub"
                  name="socialLinks.github"
                  value={formData.socialLinks?.github}
                  isEditing={true}
                  onChange={handleInputChange}
                  inlineError={validationErrors["socialLinks.github"]}
                />
                <DetailField
                  label="Facebook"
                  name="socialLinks.facebook"
                  value={formData.socialLinks?.facebook}
                  isEditing={true}
                  onChange={handleInputChange}
                  inlineError={validationErrors["socialLinks.facebook"]}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <SocialLink url={user.socialLinks?.linkedin} label="LinkedIn" />
                <SocialLink url={user.socialLinks?.github} label="GitHub" />
                <SocialLink url={user.socialLinks?.facebook} label="Facebook" />
              </div>
            )}
          </ProfileCard>
        </div>
      </div>
    </div>
  );
}
