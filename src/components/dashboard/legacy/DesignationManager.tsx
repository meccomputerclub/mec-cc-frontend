"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Edit2,
  Trash2,
  Users,
  Check,
  X,
  Shield,
  ShieldCheck,
  Crown,
  Search,
  RefreshCw,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DesignationItem } from "@/types";
import { api, ApiError } from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";

interface DesignationManagerProps {
  category: "executive" | "advisor";
  allMembers?: any[];
  onRefreshAllData?: () => void;
  isAdminUser: boolean;
}

const WING_SUGGESTIONS = {
  executive: [
    "Core Board",
    "Tech Wing",
    "Competitive Programming Wing",
    "Media & PR Wing",
    "Event & Logistics Wing",
    "General Panel",
  ],
  advisor: [
    "College Administration",
    "CSE Department",
    "Faculty Advisory",
    "Industry Advisory",
    "Research Mentorship",
  ],
};

export function DesignationManager({
  category,
  allMembers,
  onRefreshAllData,
  isAdminUser,
}: DesignationManagerProps) {
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create / Edit Modal State
  const [editingDesig, setEditingDesig] = useState<DesignationItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formWing, setFormWing] = useState("Core Board");
  const [formDefaultRole, setFormDefaultRole] = useState<"admin" | "moderator" | "member">("member");
  const [formMaxSeats, setFormMaxSeats] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Assign Members Modal State (Debounced Server-Side Search)
  const [assignTarget, setAssignTarget] = useState<DesignationItem | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [searchedMembers, setSearchedMembers] = useState<any[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch designations for this category
  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ status: string; data: DesignationItem[] }>(
        `/api/designations?category=${category}`
      );
      if (res && res.data) {
        setDesignations(res.data);
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to load designations";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, [category]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingDesig(null);
    setFormTitle("");
    setFormWing(category === "executive" ? "Core Board" : "Faculty Advisory");
    setFormDefaultRole("member");
    setFormMaxSeats("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (d: DesignationItem) => {
    setEditingDesig(d);
    setFormTitle(d.title);
    setFormWing(d.wing || (category === "executive" ? "Core Board" : "Faculty Advisory"));
    setFormDefaultRole(d.defaultRole || "member");
    setFormMaxSeats(d.maxSeats ? String(d.maxSeats) : "");
    setIsAddModalOpen(true);
  };

  // Save Create or Edit
  const handleSaveDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error("Please enter a designation title");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        title: formTitle.trim(),
        category,
        wing: formWing.trim(),
        defaultRole: formDefaultRole,
        maxSeats: formMaxSeats ? parseInt(formMaxSeats, 10) : null,
      };

      if (editingDesig) {
        await api.patch(`/api/designations/${editingDesig._id}`, payload);
        toast.success(`Designation "${formTitle}" updated!`);
      } else {
        await api.post("/api/designations", payload);
        toast.success(`New designation "${formTitle}" created!`);
      }

      setIsAddModalOpen(false);
      await fetchDesignations();
      onRefreshAllData?.();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to save designation";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Move Up / Move Down Precedence Reordering
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= designations.length) return;

    // Clone array and swap
    const updated = [...designations];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Assign new order integers
    const reorderedItems = updated.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    // Optimistic state update
    setDesignations(reorderedItems);

    try {
      await api.patch("/api/designations/reorder", {
        items: reorderedItems.map((item) => ({ id: item._id, order: item.order })),
      });
      toast.success(`Precedence updated: "${temp.title}" is now #${targetIndex + 1}!`);
      onRefreshAllData?.();
    } catch (err: any) {
      toast.error("Failed to save reorder. Reverting...");
      fetchDesignations();
    }
  };

  // Delete Designation
  const handleDeleteDesignation = async (d: DesignationItem) => {
    const count = d.assignedCount || 0;
    const confirmMsg =
      count > 0
        ? `Warning: ${count} member(s) currently hold the role "${d.title}". Deleting it will revert them to General Member. Proceed?`
        : `Are you sure you want to delete "${d.title}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/api/designations/${d._id}`);
      toast.success(`Designation "${d.title}" deleted.`);
      await fetchDesignations();
      onRefreshAllData?.();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to delete designation";
      toast.error(msg);
    }
  };

  // Open Assign Members Modal
  const handleOpenAssignModal = (d: DesignationItem) => {
    setAssignTarget(d);
    // Pre-select members who currently have this designation
    const currentIds = (d.assignedMembers || []).map((m: any) => m._id || m.id);
    setSelectedMemberIds(currentIds);
    setMemberSearch("");
    setSearchedMembers([]);
    setSearchingMembers(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Debounced server search for assignable members (triggers at >= 3 chars)
  const handleMemberSearchChange = (value: string) => {
    setMemberSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSearchingMembers(false);
      setSearchedMembers([]);
      return;
    }

    setSearchingMembers(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get<{ success: boolean; members: any[]; data: any[] }>(
          `/api/users/search-assignable?q=${encodeURIComponent(trimmed)}`
        );
        const results = res?.members || res?.data || [];
        setSearchedMembers(results);
      } catch (err) {
        console.error("Member search error:", err);
      } finally {
        setSearchingMembers(false);
      }
    }, 350);
  };

  // Toggle member selection in modal
  const toggleMemberSelection = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  // Save Member Assignments
  const handleSaveAssignments = async () => {
    if (!assignTarget) return;
    setSavingAssignments(true);

    try {
      await api.post(`/api/designations/${assignTarget._id}/assign-members`, {
        title: assignTarget.title,
        category: assignTarget.category,
        memberIds: selectedMemberIds,
        defaultRole: assignTarget.defaultRole,
      });

      toast.success(`Updated member assignments for "${assignTarget.title}"!`);
      setAssignTarget(null);
      await fetchDesignations();
      onRefreshAllData?.();
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to assign members";
      toast.error(msg);
    } finally {
      setSavingAssignments(false);
    }
  };

  // Quick Remove Single Member from Designation
  const handleQuickUnassignMember = async (d: DesignationItem, memberId: string, memberName: string) => {
    if (!window.confirm(`Remove ${memberName} from "${d.title}"?`)) return;

    const remainingIds = (d.assignedMembers || [])
      .map((m: any) => m._id || m.id)
      .filter((id: string) => id !== memberId);

    try {
      await api.post(`/api/designations/${d._id}/assign-members`, {
        title: d.title,
        category: d.category,
        memberIds: remainingIds,
      });
      toast.success(`${memberName} unassigned from ${d.title}`);
      await fetchDesignations();
      onRefreshAllData?.();
    } catch (err: any) {
      toast.error("Failed to unassign member");
    }
  };

  // Filtered designations for search (matches role title, wing, and assigned member names/IDs)
  const filteredDesignations = designations.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = d.title.toLowerCase().includes(q);
    const wingMatch = Boolean(d.wing && d.wing.toLowerCase().includes(q));
    const memberMatch = Boolean(
      d.assignedMembers?.some(
        (m: any) =>
          (m.fullName && m.fullName.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.studentId && m.studentId.toLowerCase().includes(q)) ||
          (m.department && m.department.toLowerCase().includes(q))
      )
    );
    return titleMatch || wingMatch || memberMatch;
  });

  const categoryLabel = category === "executive" ? "Executive Panel Roles" : "Advisor Panel Roles";

  return (
    <div className="desig-manager">
      <style dangerouslySetInnerHTML={{
        __html: `
          .desig-manager { display: flex; flex-direction: column; gap: var(--space-4); font-family: var(--font-body); }
          .desig-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; padding: var(--space-3) var(--space-4); background: var(--surface-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-md); }
          .desig-header__info { display: flex; align-items: center; gap: var(--space-3); }
          .desig-count-badge { font-family: var(--font-body); font-size: var(--text-xs); font-weight: 700; text-transform: uppercase; padding: 4px 10px; background: var(--surface-primary); border: 1px solid var(--border-brutalist); border-radius: var(--radius-sm); color: var(--text-primary); box-shadow: 2px 2px 0 var(--border-brutalist); }
          .desig-list { display: flex; flex-direction: column; gap: var(--space-3); }
          .desig-card { display: flex; flex-direction: column; background: var(--surface-elevated); border: 1px solid var(--border-brutalist); border-radius: var(--radius-md); box-shadow: 3px 3px 0 var(--border-brutalist); overflow: hidden; transition: transform var(--transition-fast), box-shadow var(--transition-fast); }
          .desig-card:hover { box-shadow: 4px 4px 0 var(--accent-primary); }
          .desig-card__main { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; gap: var(--space-3); flex-wrap: wrap; border-bottom: 1px solid var(--border-default); background: var(--surface-primary); }
          .desig-card__left { display: flex; align-items: center; gap: var(--space-3); flex: 1; min-width: 240px; }
          .desig-rank-badge { display: flex; align-items: center; justify-content: center; min-width: 36px; height: 32px; padding: 0 8px; font-family: var(--font-body); font-size: 13px; font-weight: 700; background: var(--accent-primary); color: #FFFFFF; border-radius: var(--radius-sm); border: 1px solid var(--border-brutalist); box-shadow: 1px 1px 0 var(--border-brutalist); flex-shrink: 0; }
          .desig-title-wrap { display: flex; flex-direction: column; gap: 2px; }
          .desig-title { font-family: var(--font-body); font-size: var(--text-base); font-weight: 700; color: var(--text-primary); line-height: 1.2; }
          .desig-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .desig-wing-tag { font-family: var(--font-body); font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 2px 6px; background: var(--surface-secondary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-secondary); }
          .desig-power-tag { font-family: var(--font-body); font-size: 11px; font-weight: 600; text-transform: uppercase; padding: 2px 6px; border-radius: var(--radius-sm); border: 1px solid currentColor; }
          .desig-power-tag--admin { color: var(--accent-error); background: color-mix(in srgb, var(--accent-error) 10%, transparent); }
          .desig-power-tag--moderator { color: var(--accent-warning); background: color-mix(in srgb, var(--accent-warning) 10%, transparent); }
          .desig-power-tag--member { color: var(--text-secondary); background: var(--surface-secondary); }
          .desig-card__controls { display: flex; align-items: center; gap: 6px; }
          .desig-btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; background: var(--surface-elevated); border: 1px solid var(--border-brutalist); border-radius: var(--radius-sm); color: var(--text-primary); box-shadow: 2px 2px 0 var(--border-brutalist); cursor: pointer; transition: all var(--transition-fast); }
          .desig-btn-icon:hover:not(:disabled) { background: var(--accent-primary-light); transform: translate(-1px, -1px); box-shadow: 3px 3px 0 var(--border-brutalist); }
          .dark .desig-btn-icon:hover:not(:disabled) { background: color-mix(in srgb, var(--accent-primary) 30%, var(--surface-primary)); color: #FFFFFF !important; }
          .desig-btn-icon:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
          .desig-btn-icon--danger:hover:not(:disabled) { background: var(--accent-error) !important; color: #FFFFFF !important; }
          .desig-card__members { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: var(--surface-secondary); gap: var(--space-3); flex-wrap: wrap; }
          .desig-members-list { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .desig-member-chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px 3px 4px; background: var(--surface-primary); border: 1px solid var(--border-default); border-radius: 9999px; font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); }
          .desig-member-chip__avatar { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; background: var(--accent-primary-light); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--accent-primary); }
          .desig-member-chip__remove { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border: none; background: transparent; color: var(--text-secondary); cursor: pointer; border-radius: 50%; padding: 0; }
          .desig-member-chip__remove:hover { color: var(--accent-error); background: rgba(255, 0, 0, 0.1); }
          .desig-no-members { font-size: var(--text-xs); color: var(--text-secondary); font-style: italic; }
          .assign-modal-list { max-height: 380px; overflow-y: auto; border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--surface-primary); display: flex; flex-direction: column; }
          .assign-modal-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-bottom: 1px solid var(--border-default); cursor: pointer; transition: background-color var(--transition-fast); }
          .assign-modal-item:last-child { border-bottom: none; }
          .assign-modal-item:hover { background: var(--surface-secondary); }
          .assign-modal-item.is-selected { background: var(--accent-primary-light); }
          .dark .assign-modal-item.is-selected { background: color-mix(in srgb, var(--accent-primary) 20%, var(--surface-primary)); }
          .assign-modal-item__info { display: flex; align-items: center; gap: 10px; }
          .assign-modal-item__text { display: flex; flex-direction: column; }
          .assign-modal-item__name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
          .assign-modal-item__sub { font-size: 11px; font-family: var(--font-body); color: var(--text-secondary); }
        `
      }} />
      {/* ── Top Header / Action Bar ── */}
      <div className="desig-header">
        <div className="desig-header__info">
          <span className="desig-count-badge">
            {designations.length} {categoryLabel}
          </span>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
            Ordered by Precedence rank (determines display order on public pages).
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
              }}
            />
            <input
              type="text"
              className="db-search-input"
              placeholder={`Search ${category} roles...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "30px", width: "200px" }}
            />
          </div>

          <Button variant="secondary" size="sm" onClick={fetchDesignations} title="Reload roles">
            <RefreshCw size={13} className={loading ? "spin-animation" : ""} />
          </Button>

          {isAdminUser && (
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              <Plus size={14} />
              <span>Add {category === "executive" ? "Executive" : "Advisor"} Role</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Precedence Ordered Role Cards List ── */}
      {loading && designations.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
          <RefreshCw size={24} className="spin-animation" style={{ margin: "0 auto 12px" }} />
          <p>Loading role hierarchy...</p>
        </div>
      ) : filteredDesignations.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "var(--surface-secondary)",
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <p style={{ fontWeight: 700, margin: "0 0 8px" }}>No designations found.</p>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 16px" }}>
            Click &quot;Add Role&quot; to create your first {category} leadership position.
          </p>
          {isAdminUser && (
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              <Plus size={14} /> Add Role
            </Button>
          )}
        </div>
      ) : (
        <div className="desig-list">
          {filteredDesignations.map((d, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredDesignations.length - 1;
            const assignedMembers = d.assignedMembers || [];

            return (
              <div key={d._id} className="desig-card">
                {/* 1. Main Header Row */}
                <div className="desig-card__main">
                  <div className="desig-card__left">
                    <div className="desig-rank-badge" title={`Precedence Rank #${d.order}`}>
                      #{d.order}
                    </div>

                    <div className="desig-title-wrap">
                      <div className="desig-title">{d.title}</div>
                      <div className="desig-meta">
                        {d.wing && <span className="desig-wing-tag">{d.wing}</span>}
                        {d.defaultRole && (
                          <span className={`desig-power-tag desig-power-tag--${d.defaultRole}`}>
                            {d.defaultRole === "admin" && <Shield size={10} style={{ marginRight: 3, verticalAlign: "middle" }} />}
                            {d.defaultRole === "moderator" && <ShieldCheck size={10} style={{ marginRight: 3, verticalAlign: "middle" }} />}
                            Site: {d.defaultRole.toUpperCase()}
                          </span>
                        )}
                        {d.maxSeats && (
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                            Quota: {assignedMembers.length}/{d.maxSeats}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Controls: Move Up, Move Down, Edit, Delete */}
                  {isAdminUser && (
                    <div className="desig-card__controls">
                      <button
                        type="button"
                        className="desig-btn-icon"
                        onClick={() => handleMoveOrder(index, "up")}
                        disabled={isFirst}
                        title="Move Up (Increase Priority)"
                        aria-label="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>

                      <button
                        type="button"
                        className="desig-btn-icon"
                        onClick={() => handleMoveOrder(index, "down")}
                        disabled={isLast}
                        title="Move Down (Decrease Priority)"
                        aria-label="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        type="button"
                        className="desig-btn-icon"
                        onClick={() => handleOpenEdit(d)}
                        title="Edit Designation"
                        aria-label="Edit Designation"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        className="desig-btn-icon desig-btn-icon--danger"
                        onClick={() => handleDeleteDesignation(d)}
                        title="Delete Designation"
                        aria-label="Delete Designation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Assigned Members Sub-Row */}
                <div className="desig-card__members">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 200 }}>
                    <Users size={14} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)" }}>
                      Assigned ({assignedMembers.length}):
                    </span>

                    {assignedMembers.length === 0 ? (
                      <span className="desig-no-members">No members currently holding this title</span>
                    ) : (
                      <div className="desig-members-list">
                        {assignedMembers.map((m: any) => {
                          const mId = m._id || m.id;
                          const initial = (m.fullName || "M").charAt(0).toUpperCase();
                          return (
                            <span key={mId} className="desig-member-chip" title={`${m.fullName} (${m.studentId || m.department})`}>
                              {m.imageUrl ? (
                                <Image
                                  src={m.imageUrl}
                                  alt={m.fullName}
                                  width={20}
                                  height={20}
                                  className="desig-member-chip__avatar"
                                />
                              ) : (
                                <span className="desig-member-chip__avatar">{initial}</span>
                              )}
                              <span>{m.fullName}</span>
                              {isAdminUser && (
                                <button
                                  type="button"
                                  className="desig-member-chip__remove"
                                  onClick={() => handleQuickUnassignMember(d, mId, m.fullName)}
                                  title={`Remove ${m.fullName}`}
                                >
                                  <X size={10} />
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {isAdminUser && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenAssignModal(d)}
                      style={{ fontSize: "11px", padding: "4px 10px", flexShrink: 0 }}
                    >
                      <Users size={12} />
                      <span>{assignedMembers.length > 0 ? "Manage Members" : "+ Assign Members"}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal 1: Create / Edit Designation ── */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => !submitting && setIsAddModalOpen(false)}
        >
          <div
            className="db-panel"
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-brutalist)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "6px 6px 0 var(--border-brutalist)",
              padding: "var(--space-5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)",
                borderBottom: "1px solid var(--border-default)",
                paddingBottom: "var(--space-3)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 800 }}>
                {editingDesig ? `Edit Role: ${editingDesig.title}` : `Add New ${categoryLabel}`}
              </h3>
              <button
                type="button"
                className="desig-btn-icon"
                onClick={() => setIsAddModalOpen(false)}
                disabled={submitting}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveDesignation}>
              {/* Designation Title */}
              <div style={{ marginBottom: "var(--space-4)" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Role Title / Designation:
                </label>
                <input
                  type="text"
                  className="db-search-input"
                  placeholder="e.g. President, Competitive Programming Lead, Chief Advisor..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", fontSize: "13px", fontWeight: 700 }}
                  required
                />
              </div>

              {/* Wing / Sub-Team */}
              <div style={{ marginBottom: "var(--space-4)" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Wing / Department Group:
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                  {WING_SUGGESTIONS[category].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setFormWing(w)}
                      style={{
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: formWing === w ? 700 : 500,
                        background: formWing === w ? "var(--accent-primary-light)" : "var(--surface-secondary)",
                        border: formWing === w ? "1.5px solid var(--border-brutalist)" : "1px solid var(--border-default)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        color: "var(--text-primary)",
                      }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="db-search-input"
                  placeholder="Or type custom wing..."
                  value={formWing}
                  onChange={(e) => setFormWing(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: "12px" }}
                />
              </div>

              {/* Default Website Power */}
              <div style={{ marginBottom: "var(--space-4)" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Default Website Access Privilege:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {[
                    { val: "member", label: "Standard Member", desc: "No admin power" },
                    { val: "moderator", label: "Moderator", desc: "Events & Roster" },
                    { val: "admin", label: "Administrator", desc: "Full Control" },
                  ].map(({ val, label, desc }) => {
                    const isSelected = formDefaultRole === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormDefaultRole(val as any)}
                        style={{
                          padding: "8px 6px",
                          borderRadius: "var(--radius-sm)",
                          border: isSelected ? "2px solid var(--border-brutalist)" : "1px solid var(--border-default)",
                          background: isSelected ? "var(--accent-primary-light)" : "var(--surface-secondary)",
                          color: "var(--text-primary)",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: isSelected ? 800 : 600 }}>{label}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Max Seat Quota */}
              <div style={{ marginBottom: "var(--space-5)" }}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Max Seat Quota (Optional):
                </label>
                <input
                  type="number"
                  min="1"
                  className="db-search-input"
                  placeholder="Leave empty for unlimited seats"
                  value={formMaxSeats}
                  onChange={(e) => setFormMaxSeats(e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: "12px" }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? "Saving..." : editingDesig ? "Save Changes" : "Create Designation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Assign Members to Designation ── */}
      {assignTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => !savingAssignments && setAssignTarget(null)}
        >
          <div
            className="db-panel"
            style={{
              width: "100%",
              maxWidth: "560px",
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-brutalist)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "6px 6px 0 var(--border-brutalist)",
              padding: "var(--space-5)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-3)",
                borderBottom: "1px solid var(--border-default)",
                paddingBottom: "var(--space-2)",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: 800 }}>
                  Assign Members to: <span style={{ color: "var(--accent-primary)" }}>{assignTarget.title}</span>
                </h3>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>
                  {selectedMemberIds.length} member(s) selected
                </p>
              </div>
              <button
                type="button"
                className="desig-btn-icon"
                onClick={() => setAssignTarget(null)}
                disabled={savingAssignments}
              >
                <X size={14} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", marginBottom: "var(--space-3)" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }}
              />
              <input
                type="text"
                className="db-search-input"
                placeholder="Type 3+ characters to search approved members..."
                value={memberSearch}
                onChange={(e) => handleMemberSearchChange(e.target.value)}
                style={{ width: "100%", paddingLeft: "32px", paddingRight: "32px", fontSize: "12px" }}
              />
              {searchingMembers && (
                <RefreshCw
                  size={13}
                  className="spin-animation"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-secondary)",
                  }}
                />
              )}
            </div>

            {/* Members Checklist */}
            <div className="assign-modal-list">
              {memberSearch.trim().length < 3 ? (
                <>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--surface-secondary)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px dashed var(--border-default)",
                      marginBottom: "10px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <p style={{ margin: "0 0 2px", fontWeight: 700, color: "var(--text-primary)" }}>
                      🔍 Type at least 3 characters to search
                    </p>
                    <span style={{ fontSize: "11px" }}>
                      Search across all approved club members by name, student ID, department, or email.
                    </span>
                  </div>

                  {(assignTarget.assignedMembers || []).length > 0 ? (
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: "var(--text-secondary)",
                          marginBottom: "6px",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Currently Assigned ({(assignTarget.assignedMembers || []).length}):
                      </div>
                      {(assignTarget.assignedMembers || []).map((m: any) => {
                        const mId = m._id || m.id;
                        const isSelected = selectedMemberIds.includes(mId);
                        const initial = (m.fullName || "M").charAt(0).toUpperCase();

                        return (
                          <div
                            key={mId}
                            className={`assign-modal-item ${isSelected ? "is-selected" : ""}`}
                            onClick={() => toggleMemberSelection(mId)}
                          >
                            <div className="assign-modal-item__info">
                              <div
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "var(--radius-sm)",
                                  border: isSelected ? "2px solid var(--accent-primary)" : "1px solid var(--border-default)",
                                  background: isSelected ? "var(--accent-primary)" : "transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#FFFFFF",
                                  flexShrink: 0,
                                }}
                              >
                                {isSelected && <Check size={12} />}
                              </div>

                              {m.imageUrl ? (
                                <Image
                                  src={m.imageUrl}
                                  alt={m.fullName}
                                  width={28}
                                  height={28}
                                  style={{ borderRadius: "50%", objectFit: "cover" }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: "var(--surface-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {initial}
                                </div>
                              )}

                              <div className="assign-modal-item__text">
                                <span className="assign-modal-item__name">{m.fullName}</span>
                                <span className="assign-modal-item__sub">
                                  {m.studentId ? `ID: ${m.studentId} · ` : ""}
                                  {m.department || "CSE"}
                                  {m.session ? ` (${m.session})` : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ padding: "24px", textAlign: "center", color: "var(--text-secondary)", fontSize: "12px" }}>
                      No members currently hold this role. Type at least 3 characters above to search and add members.
                    </div>
                  )}
                </>
              ) : searchingMembers ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", fontSize: "12px" }}>
                  <RefreshCw size={18} className="spin-animation" style={{ margin: "0 auto 8px" }} />
                  Searching approved members matching &quot;{memberSearch.trim()}&quot;...
                </div>
              ) : searchedMembers.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)", fontSize: "12px" }}>
                  No approved members found matching &quot;{memberSearch.trim()}&quot;
                </div>
              ) : (
                searchedMembers.map((m) => {
                  const mId = m._id || m.id;
                  const isSelected = selectedMemberIds.includes(mId);
                  const initial = (m.fullName || "M").charAt(0).toUpperCase();

                  return (
                    <div
                      key={mId}
                      className={`assign-modal-item ${isSelected ? "is-selected" : ""}`}
                      onClick={() => toggleMemberSelection(mId)}
                    >
                      <div className="assign-modal-item__info">
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "var(--radius-sm)",
                            border: isSelected ? "2px solid var(--accent-primary)" : "1px solid var(--border-default)",
                            background: isSelected ? "var(--accent-primary)" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFFFF",
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && <Check size={12} />}
                        </div>

                        {m.imageUrl ? (
                          <Image
                            src={m.imageUrl}
                            alt={m.fullName}
                            width={28}
                            height={28}
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "var(--surface-secondary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: 800,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {initial}
                          </div>
                        )}

                        <div className="assign-modal-item__text">
                          <span className="assign-modal-item__name">{m.fullName}</span>
                          <span className="assign-modal-item__sub">
                            {m.studentId ? `ID: ${m.studentId} · ` : ""}
                            {m.department || "CSE"}
                            {m.session ? ` (${m.session})` : ""}
                            {m.designation && m.designation !== assignTarget.title ? ` · Current: ${m.designation}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "var(--space-4)",
                paddingTop: "var(--space-3)",
                borderTop: "1px solid var(--border-default)",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                  onClick={() => setSelectedMemberIds([])}
                >
                  Clear Selection
                </Button>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAssignTarget(null)}
                  disabled={savingAssignments}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAssignments}
                  disabled={savingAssignments}
                >
                  {savingAssignments ? "Saving..." : `Assign (${selectedMemberIds.length})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
