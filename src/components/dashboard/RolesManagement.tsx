"use client";

import { useState } from "react";
import { AuthUser } from "@/types";
import CustomInput from "../ui/shared/CustomInput";
import { Loader2, Search, UserIcon, UserCheck } from "lucide-react";
import { capitalizeFirstLetter, handleKeyDown } from "@/lib/utils";
import UserAvatarWithFallback from "../ui/shared/UserAvatarWithFallback";
import ProfileCard from "../ui/shared/ProfileCard";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import ToastNotification, { Toast } from "@/components/ui/shared/ToastNotification";
import ConfirmationModal from "../ui/shared/ConfirmModal";
import { Select } from "@/components/ui/Select";

type UserRole = "admin" | "moderator" | "alumni" | "member" | "guest" | "executive";

const RolesManagement = () => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [searchIdentifier, setSearchIdentifier] = useState("");
  const [searchedUser, setSearchedUser] = useState<AuthUser | null>(null);
  const [editedRole, setEditedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const roles: UserRole[] = ["admin", "moderator", "alumni", "member", "guest"];

  // --- Handlers for User Search & Role Modification ---
  const handleUserSearch = async () => {
    if (!searchIdentifier.trim()) return;
    try {
      setLoading(true);
      setSearchedUser(null);
      setEditedRole(null);
      setError(null);

      const res = await axios.get(
        `${API_BASE_URL}/api/users/profile/${encodeURIComponent(searchIdentifier.trim())}`,
        { withCredentials: true }
      );
      setSearchedUser(res.data.data);
    } catch (err: any) {
      console.error("User search error:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "User not found with this identifier.");
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (val: string) => {
    setEditedRole(val as UserRole);
  };

  const handleSaveRole = async () => {
    if (!searchedUser || editedRole === null) return;
    if (searchedUser.role === editedRole) {
      setToast({ message: "Role is already set to this value.", type: "warning" });
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!searchedUser || editedRole === null) return;

    setIsModalOpen(false);
    setLoading(true);

    try {
      await axios.patch(
        `${API_BASE_URL}/api/users/admin/update/${searchedUser._id}`,
        { role: editedRole },
        { withCredentials: true }
      );
      setSearchedUser((prev) => ({ ...prev!, role: editedRole }));
      setToast({
        message: `Role updated to ${editedRole} for ${searchedUser.fullName}`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating role: ", error);
      setToast({ message: "Error updating role", type: "error" });
    } finally {
      setLoading(false);
      setIsEditing(null);
    }
  };

  const handleDiscardRole = () => {
    if (searchedUser) {
      setEditedRole(searchedUser.role);
    }
    setIsEditing(null);
  };

  const handleEdit = (section: string) => {
    setIsEditing(section);
  };

  const clearToast = () => {
    setToast(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Existing Member Role Modification ── */}
      <div className="bg-surface-elevated p-6 rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] border border-border-default space-y-6">
        <div className="border-b pb-4 border-border-default">
          <h3 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-accent-primary" /> Member Role &amp; Clearance Modification
          </h3>
          <p className="text-text-secondary text-sm font-semibold mt-1">
            Search for an active member by Email, Student ID, or Registration Number to update their administrative role.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center bg-surface-secondary p-4 rounded-xl border border-border-default">
          <CustomInput
            type="text"
            value={searchIdentifier}
            onChange={(e) => setSearchIdentifier(e.target.value)}
            placeholder="Search by Email, Student ID, or Registration Number..."
            onKeyDown={(e) => handleKeyDown(e, handleUserSearch)}
            className="w-full border border-border-default p-3 rounded-lg bg-surface-elevated text-text-primary focus:ring-2 focus:ring-accent-primary focus:outline-none transition shadow-sm text-sm"
            disabled={loading}
          />
          <button
            onClick={handleUserSearch}
            disabled={loading || !searchIdentifier.trim()}
            className="bg-text-primary text-surface-primary border border-border-default py-3 px-6 rounded-lg hover:bg-surface-inverse font-semibold transition flex items-center justify-center shadow-[4px_4px_0px_0px_var(--border-default)] hover:shadow-md disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search User
          </button>
        </div>

        {error && <p className="text-accent-error font-semibold text-sm">{error}</p>}

        {/* User Profile Card Result */}
        {(searchedUser || loading) && (
          <div className="bg-surface-primary p-6 rounded-xl border border-border-default">
            <h4 className="text-lg font-semibold mb-4 border-b border-border-default pb-2 text-text-primary">
              {loading ? "Searching for member..." : "Member Profile Located"}
            </h4>

            {!searchedUser && loading ? (
              <p className="text-text-secondary font-semibold text-sm">Loading member clearance details...</p>
            ) : (
              searchedUser && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: Avatar & Quick Info */}
                  <div className="lg:col-span-1 bg-surface-elevated p-5 rounded-lg border border-border-default text-center">
                    <div className="mx-auto w-28 h-28 mb-3 relative rounded-full overflow-hidden border-4 border-accent-primary">
                      <UserAvatarWithFallback
                        initialImageUrl={searchedUser?.imageUrl}
                        fullName={searchedUser?.fullName || "profile image"}
                        w={112}
                        h={112}
                      />
                    </div>
                    <h4 className="text-lg font-semibold text-text-primary">{searchedUser?.fullName}</h4>
                    <p className="text-xs font-semibold text-accent-primary uppercase tracking-wide">
                      {capitalizeFirstLetter(searchedUser?.role)}
                    </p>

                    <div
                      className={`mt-2 py-0.5 px-2.5 inline-flex text-xs rounded-full font-semibold ${searchedUser?.profileStatus === "active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                    >
                      Status: {capitalizeFirstLetter(searchedUser?.profileStatus || "active")}
                    </div>
                  </div>

                  {/* Column 2: Role Modification Card */}
                  <div className="lg:col-span-2 space-y-4">
                    <ProfileCard
                      title="Role & Access Clearance"
                      icon={UserIcon}
                      sectionKey="roleEditingSection"
                      canEdit={true}
                      isEditing={isEditing}
                      onEdit={handleEdit}
                      onSave={handleSaveRole}
                      onCancel={handleDiscardRole}
                      loading={loading}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-text-secondary">Email Address</p>
                            <p className="text-text-primary font-mono">{searchedUser?.email}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-text-secondary">Student ID</p>
                            <p className="text-text-primary font-mono">{searchedUser?.studentId || "N/A"}</p>
                          </div>
                        </div>

                        {/* Current & New Role */}
                        <div className="pt-3 border-t border-border-default">
                          <p className="text-sm font-semibold text-text-primary mb-2">
                            Current Role:{" "}
                            <span className="px-2.5 py-0.5 bg-accent-primary text-accent-primary-text rounded-full text-xs font-semibold uppercase tracking-wide ml-1">
                              {capitalizeFirstLetter(searchedUser?.role)}
                            </span>
                          </p>

                          <div className="mt-3">
                            {isEditing === "roleEditingSection" ? (
                              <div className="flex flex-col space-y-1.5 max-w-xs">
                                <label htmlFor="user-role-select" className="font-semibold text-text-secondary text-xs">
                                  Select New Role:
                                </label>
                                <Select
                                  id="user-role-select"
                                  value={editedRole || searchedUser.role}
                                  onChange={(val) => handleRoleChange(val)}
                                  disabled={loading}
                                  options={roles.map((role) => ({
                                    value: role,
                                    label: capitalizeFirstLetter(role),
                                  }))}
                                />
                              </div>
                            ) : (
                              <p className="text-text-secondary text-xs italic font-medium">
                                Click the pencil icon on the top right to modify this member&apos;s role.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </ProfileCard>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRoleChange}
        title="Confirm Clearance Role Change"
        confirmText="Update Role"
        confirmColor="blue"
        loading={loading}
        message={
          <>
            You are about to modify the role of
            <span className="font-semibold text-text-primary mx-1">{searchedUser?.fullName}</span>
            from
            <span className="font-semibold text-accent-warning mx-1">{searchedUser?.role}</span>
            to
            <span className="font-semibold text-accent-primary mx-1">{editedRole}</span>.
            <p className="mt-2 text-xs text-accent-error font-semibold">
              This action modifies permission levels across the club management platform.
            </p>
          </>
        }
      />

      {toast && (
        <ToastNotification type={toast.type} message={toast.message} onClose={clearToast} />
      )}
    </div>
  );
};

export default RolesManagement;
