"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { MembersData } from "@/types";
import axios from "axios";
import Link from "next/link";
import UserAvatarWithFallback from "@/components/ui/shared/UserAvatarWithFallback";
import { capitalizeFirstLetter } from "@/lib/utils";
import {
  UserPlus,
  Search,
  X,
  Users,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  GraduationCap,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { AdminAddMemberModal } from "@/components/dashboard/legacy/AdminAddMemberModal";
import FilterSelect, { FilterOption } from "@/app/dashboard/components/FilterSelect";

type MainTab = "pending" | "all";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CountsData {
  pending: number;
  all: number;
  rejected: number;
  member: number;
  executive: number;
  alumni: number;
  advisor: number;
  banned: number;
}

export default function MemberManagementPage() {
  const [members, setMembers] = useState<MembersData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [counts, setCounts] = useState<CountsData>({
    pending: 0,
    all: 0,
    rejected: 0,
    member: 0,
    executive: 0,
    alumni: 0,
    advisor: 0,
    banned: 0,
  });

  const [activeTab, setActiveTab] = useState<MainTab>("pending");
  const [pendingFilter, setPendingFilter] = useState("pending");
  const [allFilter, setAllFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { user: currentUser } = useAuth();
  const [userToDelete, setUserToDelete] = useState<MembersData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    if (!userToDelete?._id) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/admin/${userToDelete._id}`,
        { withCredentials: true }
      );
      toast.success(res.data?.message || "Member permanently deleted.");
      setUserToDelete(null);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete member.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Debounce search query
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const currentFilter = activeTab === "pending" ? pendingFilter : allFilter;
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/members`,
        {
          params: {
            tab: activeTab,
            filter: currentFilter,
            search: debouncedSearch,
            page: pagination.page,
            limit: pagination.limit,
          },
          withCredentials: true,
        }
      );

      const responseData = res.data.data;
      if (responseData) {
        setMembers(responseData.members || []);
        if (responseData.pagination) {
          setPagination(responseData.pagination);
        }
        if (responseData.counts) {
          setCounts(responseData.counts);
        }
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pendingFilter, allFilter, debouncedSearch, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleTabChange = (tab: MainTab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handleFilterChange = (filterVal: string) => {
    if (activeTab === "pending") {
      setPendingFilter(filterVal);
    } else {
      setAllFilter(filterVal);
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    setRowLoading((prev) => ({ ...prev, [id]: true }));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/application-status/${id}`,
        { status },
        { withCredentials: true }
      );
      // Refetch to refresh list and counts accurately
      await fetchMembers();
    } catch {
      setRowErrors((prev) => ({
        ...prev,
        [id]: "Failed to update status. Please try again.",
      }));
    } finally {
      setRowLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Filter options for Pending tab
  const pendingOptions: FilterOption[] = [
    { value: "pending", label: "Pending Review", count: counts.pending },
    { value: "rejected", label: "Rejected", count: counts.rejected },
    { value: "all_applications", label: "All Applications" },
  ];

  // Filter options for All tab (classified by clubRole)
  const allOptions: FilterOption[] = [
    { value: "all", label: "All Roles", count: counts.all },
    { value: "member", label: "General Members", count: counts.member },
    { value: "executive", label: "Executives", count: counts.executive },
    { value: "alumni", label: "Alumni", count: counts.alumni },
    { value: "advisor", label: "Advisors", count: counts.advisor },
    { value: "banned", label: "Banned Users", count: counts.banned },
    { value: "incomplete", label: "Incomplete Profiles" },
  ];

  return (
    <div className="space-y-4">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border-default">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary">
            Member Applications &amp; Data
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Manage student registrations, approval pipelines, and club roles.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-text-primary hover:bg-surface-inverse text-white rounded-lg text-sm font-semibold transition shadow-[3px_3px_0px_0px_var(--border-default)] hover:shadow-md whitespace-nowrap"
          style={{ color: "#fff" }}
        >
          <UserPlus size={16} />
          <span>Add Member / Advisor</span>
        </button>
      </div>

      {/* ── Sticky Filter & Search Control Bar ── */}
      <div className="sticky top-16 z-30 bg-surface-primary/95 backdrop-blur-md border-b border-border-default pt-2 pb-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Tab Buttons + Filter Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Tab Pills */}
            <div className="flex p-1 bg-surface-secondary border border-border-default rounded-xl shadow-[2px_2px_0px_0px_var(--border-default)]">
              {/* Pending Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("pending")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "pending"
                    ? "bg-surface-elevated text-text-primary border border-border-default shadow-[2px_2px_0px_0px_var(--accent-primary)]"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                <Clock size={14} className={activeTab === "pending" ? "text-accent-primary" : ""} />
                <span>Pending</span>
                {counts.pending > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${activeTab === "pending"
                        ? "bg-accent-primary text-accent-primary-text"
                        : "bg-surface-elevated text-text-secondary border border-border-default"
                      }`}
                  >
                    {counts.pending}
                  </span>
                )}
              </button>

              {/* All Tab */}
              <button
                type="button"
                onClick={() => handleTabChange("all")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "all"
                    ? "bg-surface-elevated text-text-primary border border-border-default shadow-[2px_2px_0px_0px_var(--accent-primary)]"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                <Users size={14} className={activeTab === "all" ? "text-accent-primary" : ""} />
                <span>All</span>
                {counts.all > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${activeTab === "all"
                        ? "bg-accent-primary text-accent-primary-text"
                        : "bg-surface-elevated text-text-secondary border border-border-default"
                      }`}
                  >
                    {counts.all}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Dropdown alongside the selected tab */}
            {activeTab === "pending" ? (
              <FilterSelect
                value={pendingFilter}
                onChange={handleFilterChange}
                options={pendingOptions}
                placeholder="Filter Applications"
              />
            ) : (
              <FilterSelect
                value={allFilter}
                onChange={handleFilterChange}
                options={allOptions}
                placeholder="Filter by Club Role"
              />
            )}
          </div>

          {/* Right: Search Bar */}
          <div className="relative w-full lg:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by ID, name, email…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs font-semibold rounded-lg border border-border-default bg-surface-elevated text-text-primary placeholder:font-normal placeholder:text-text-secondary focus:outline-none focus:border-accent-primary focus:shadow-[2px_2px_0px_0px_var(--accent-primary)] transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Member Modal ── */}
      <AdminAddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchMembers}
      />

      {/* ── Table & Cards ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-elevated rounded-xl border border-border-default shadow-[4px_4px_0px_0px_var(--border-default)]">
          <Loader2 size={32} className="animate-spin text-accent-primary mb-3" />
          <p className="text-xs font-semibold text-text-secondary">Loading members data…</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 bg-surface-elevated rounded-xl border border-dashed border-border-default shadow-[4px_4px_0px_0px_var(--border-default)]">
          <Users size={36} className="mx-auto mb-3 text-text-secondary" />
          <p className="font-semibold text-text-primary text-base">No members found</p>
          <p className="text-xs text-text-secondary mt-1">
            {debouncedSearch
              ? `No users match "${debouncedSearch}". Try a different search term.`
              : activeTab === "pending"
                ? "No pending applications waiting for review."
                : "No members match the selected filter."}
          </p>
          {debouncedSearch && (
            <button
              onClick={clearSearch}
              className="mt-3 text-xs font-semibold text-accent-primary hover:underline"
            >
              Clear Search Query
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table (md+) */}
          <div className="hidden md:block overflow-x-auto bg-surface-elevated rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] border border-border-default">
            <table className="min-w-full divide-y divide-border-default">
              <thead className="bg-surface-secondary">
                <tr>
                  {["Image", "Name & ID", "Email", "Club Role", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {members.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-secondary/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <UserAvatarWithFallback initialImageUrl={u.imageUrl} fullName={u.fullName} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-primary">{u.fullName}</span>
                        {(u as any).studentId && (
                          <span className="text-xs font-mono text-text-secondary font-semibold">
                            ID: {(u as any).studentId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-text-secondary whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <ClubRoleBadge role={(u as any).clubRole || u.role} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge
                        status={u.profileStatus}
                        applicationStatus={u.applicationStatus}
                      />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <ActionCell
                        user={u}
                        rowLoading={rowLoading}
                        rowErrors={rowErrors}
                        onStatusChange={handleStatusChange}
                        isAdmin={currentUser?.role === "admin"}
                        onDeleteClick={(target) => setUserToDelete(target)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (below md) */}
          <div className="md:hidden space-y-3">
            {members.map((u) => (
              <div
                key={u._id}
                className="bg-surface-elevated rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] border border-border-default p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatarWithFallback initialImageUrl={u.imageUrl} fullName={u.fullName} />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">{u.fullName}</p>
                    <p className="text-xs text-text-secondary truncate">{u.email}</p>
                    {(u as any).studentId && (
                      <p className="text-[11px] font-mono text-text-secondary font-semibold">
                        ID: {(u as any).studentId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <ClubRoleBadge role={(u as any).clubRole || u.role} />
                  <StatusBadge
                    status={u.profileStatus}
                    applicationStatus={u.applicationStatus}
                  />
                </div>
                <ActionCell
                  user={u}
                  rowLoading={rowLoading}
                  rowErrors={rowErrors}
                  onStatusChange={handleStatusChange}
                  isAdmin={currentUser?.role === "admin"}
                  onDeleteClick={(target) => setUserToDelete(target)}
                />
              </div>
            ))}
          </div>

          {/* ── Pagination Bar ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 bg-surface-elevated rounded-xl border border-border-default shadow-[3px_3px_0px_0px_var(--border-default)]">
            <div className="text-xs font-semibold text-text-secondary">
              Showing{" "}
              <span className="text-text-primary">
                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="text-text-primary">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="text-text-primary">{pagination.total}</span> users
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-default bg-surface-secondary text-text-primary transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent-primary"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-1 text-xs text-text-secondary font-semibold">…</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                          className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-lg border transition ${pagination.page === p
                              ? "border-text-primary bg-text-primary text-surface-primary dark:text-white shadow-[2px_2px_0px_0px_var(--accent-primary)]"
                              : "border-border-default bg-surface-secondary text-text-secondary hover:text-text-primary hover:border-accent-primary"
                            }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.totalPages, prev.page + 1),
                  }))
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-default bg-surface-secondary text-text-primary transition disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent-primary"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {userToDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[8px_8px_0px_var(--border-brutalist)] dark:shadow-[8px_8px_0px_#ef4444] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-text-primary">Delete Member Permanently?</h3>
                <p className="text-xs text-text-secondary">This operation cannot be reversed.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-text-primary font-bold">{userToDelete.fullName}</strong> ({userToDelete.email})? All profile data and club records for this user will be removed immediately.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="py-1.5 px-4 rounded-md border border-border-default bg-surface-secondary text-text-primary text-xs font-bold hover:bg-surface-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteUser}
                className="py-1.5 px-4 rounded-md border-2 border-border-brutalist bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-[2px_2px_0px_#000] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isDeleting ? "Deleting..." : "Confirm & Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClubRoleBadge({ role }: { role: string }) {
  const roleLower = (role || "").toLowerCase();
  if (roleLower === "executive") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-accent-primary-light text-text-primary border border-border-default shadow-[1px_1px_0px_0px_var(--border-default)]">
        <Sparkles size={11} className="text-accent-primary" />
        Executive
      </span>
    );
  }
  if (roleLower === "advisor") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-surface-secondary text-text-primary border border-border-default">
        <Shield size={11} className="text-accent-warning" />
        Advisor
      </span>
    );
  }
  if (roleLower === "alumni") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-surface-secondary text-text-secondary border border-border-default">
        <GraduationCap size={11} />
        Alumni
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-surface-secondary text-text-secondary border border-border-default capitalize">
      {role || "Member"}
    </span>
  );
}

function StatusBadge({
  status,
  applicationStatus,
}: {
  status: string;
  applicationStatus?: string;
}) {
  if (applicationStatus === "pending") {
    return (
      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-warning text-surface-elevated">
        Pending
      </span>
    );
  }
  if (applicationStatus === "rejected") {
    return (
      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-error text-surface-elevated">
        Rejected
      </span>
    );
  }

  const colorMap: Record<string, string> = {
    active: "bg-accent-success text-surface-elevated",
    incomplete: "bg-accent-warning text-surface-elevated",
    deleted: "bg-accent-error text-surface-elevated",
    banned: "bg-accent-error text-surface-elevated",
  };

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[status] || "bg-surface-secondary text-text-primary"
        }`}
    >
      {capitalizeFirstLetter(status || "active")}
    </span>
  );
}

function ActionCell({
  user,
  rowLoading,
  rowErrors,
  onStatusChange,
  isAdmin,
  onDeleteClick,
}: {
  user: MembersData;
  rowLoading: Record<string, boolean>;
  rowErrors: Record<string, string>;
  onStatusChange: (id: string, status: "approved" | "rejected") => void;
  isAdmin?: boolean;
  onDeleteClick?: (user: MembersData) => void;
}) {
  const isLoading = rowLoading[user._id];
  return (
    <div>
      {user.applicationStatus === "pending" ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            disabled={isLoading}
            onClick={() => onStatusChange(user._id, "approved")}
            className="text-xs px-3 py-1 rounded-lg bg-accent-success text-surface-elevated font-semibold transition disabled:opacity-50 hover:opacity-90 shadow-[1px_1px_0px_0px_var(--border-default)] cursor-pointer"
          >
            {isLoading ? "…" : "Approve"}
          </button>
          <button
            disabled={isLoading}
            onClick={() => onStatusChange(user._id, "rejected")}
            className="text-xs px-3 py-1 rounded-lg bg-accent-error text-surface-elevated font-semibold transition disabled:opacity-50 hover:opacity-90 shadow-[1px_1px_0px_0px_var(--border-default)] cursor-pointer"
          >
            {isLoading ? "…" : "Reject"}
          </button>
          {isAdmin && onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(user)}
              className="p-1 rounded text-text-tertiary hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer"
              title="Permanently delete member"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/members/${user._id}`}
            className="text-xs font-semibold text-text-primary underline hover:text-accent-primary transition"
          >
            View Profile
          </Link>
          {isAdmin && onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(user)}
              className="p-1 rounded text-text-tertiary hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer"
              title="Permanently delete member"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}
      {rowErrors[user._id] && (
        <p className="mt-1 text-xs text-accent-error font-semibold">{rowErrors[user._id]}</p>
      )}
    </div>
  );
}
