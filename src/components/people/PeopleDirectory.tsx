"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Users, RefreshCw } from "lucide-react";
import { ProfileCard, ProfileGrid } from "@/components/ui/ProfileCard";
import { groupPeopleByBatch, BatchGroup } from "@/lib/batchUtils";
import FilterSelect, { FilterOption } from "@/app/dashboard/components/FilterSelect";

export interface DirectoryPerson {
  id: string;
  name: string;
  role: string;
  department?: string;
  systemRole?: string;
  batch?: string;
  session?: string;
  image?: string;
  imagePosition?: string;
  bio?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    facebook?: string;
    codeforces?: string;
    email?: string;
  };
}

interface PeopleDirectoryProps<T extends DirectoryPerson> {
  initialPeople: T[];
  category: "member" | "alumni";
  emptyTitle?: string;
  emptySubtitle?: string;
}

type DepartmentKey = "CSE" | "EEE" | "CE";
const DEPARTMENTS: DepartmentKey[] = ["CSE", "EEE", "CE"];

export function getPersonDepartment(person: {
  department?: string;
  session?: string;
  batch?: string;
}): DepartmentKey {
  const d = (person.department || "").trim().toUpperCase();
  if (d === "CSE" || d.includes("COMPUTER")) return "CSE";
  if (d === "EEE" || d.includes("ELECTR")) return "EEE";
  if (d === "CE" || d.includes("CIVIL")) return "CE";

  const combined = `${person.batch || ""} ${person.session || ""}`.toUpperCase();
  if (/\bCSE\b/.test(combined)) return "CSE";
  if (/\bEEE\b/.test(combined)) return "EEE";
  if (/\bCE\b/.test(combined)) return "CE";

  return "CSE";
}

export default function PeopleDirectory<T extends DirectoryPerson>({
  initialPeople,
  category,
  emptyTitle = "No records found",
  emptySubtitle = "Try adjusting your department, batch, or search query.",
}: PeopleDirectoryProps<T>) {
  // ── States ─────────────────────────────────────────────────────────────────
  const [selectedDept, setSelectedDept] = useState<DepartmentKey>("CSE");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Debounce Search Input ──────────────────────────────────────────────────
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setIsSearching(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(val.trim());
      setIsSearching(false);
    }, 250);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setIsSearching(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };

  // ── Total Department Counts ────────────────────────────────────────────────
  const deptCounts = useMemo(() => {
    const counts: Record<DepartmentKey, number> = { CSE: 0, EEE: 0, CE: 0 };
    for (const person of initialPeople) {
      const dept = getPersonDepartment(person);
      counts[dept] = (counts[dept] || 0) + 1;
    }
    return counts;
  }, [initialPeople]);

  // ── Filter by Selected Department ──────────────────────────────────────────
  const deptPeople = useMemo(() => {
    return initialPeople.filter((p) => getPersonDepartment(p) === selectedDept);
  }, [initialPeople, selectedDept]);

  // ── Available Batches (Only batches that HAVE users in selectedDept) ────────
  const availableBatches = useMemo(() => {
    const groups = groupPeopleByBatch(deptPeople);
    return groups.map((g) => ({
      value: g.batchNumber,
      label: g.batchNumber,
      count: g.members.length,
    }));
  }, [deptPeople]);

  // Dropdown options: "All Batches" + active batches for this department
  const batchOptions: FilterOption[] = useMemo(() => {
    return [
      { value: "all", label: "All Batches", count: deptPeople.length },
      ...availableBatches,
    ];
  }, [availableBatches, deptPeople.length]);

  // ── Reset batch if current selection is not available in new department ─────
  useEffect(() => {
    if (selectedBatch !== "all") {
      const exists = availableBatches.some((b) => b.value === selectedBatch);
      if (!exists) {
        setSelectedBatch("all");
      }
    }
  }, [selectedDept, availableBatches, selectedBatch]);

  // ── Final Filtered People (Dept + Batch + Search) ──────────────────────────
  const filteredPeople = useMemo(() => {
    let result = deptPeople;

    // Filter by Batch
    if (selectedBatch !== "all") {
      result = result.filter((p) => {
        const groups = groupPeopleByBatch([p]);
        return groups.length > 0 && groups[0].batchNumber === selectedBatch;
      });
    }

    // Filter by Search Query
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const roleMatch = p.role?.toLowerCase().includes(q);
        const batchMatch = p.batch?.toLowerCase().includes(q);
        const sessionMatch = p.session?.toLowerCase().includes(q);
        return nameMatch || roleMatch || batchMatch || sessionMatch;
      });
    }

    return result;
  }, [deptPeople, selectedBatch, debouncedQuery]);

  // Group filtered results by batch for display
  const displayBatches = useMemo(() => {
    return groupPeopleByBatch(filteredPeople);
  }, [filteredPeople]);

  return (
    <div>
      {/* ── Scoped Neo-Brutalist Styles ── */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .dept-filter-bar {
              display: flex;
              flex-direction: column;
              gap: 16px;
              margin-bottom: 32px;
            }
            @media (min-width: 768px) {
              .dept-filter-bar {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
              }
            }
            .dept-btn-group {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              flex-wrap: wrap;
            }
            .dept-btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 7px 14px;
              font-family: var(--font-heading);
              font-size: 13px;
              font-weight: 800;
              border-radius: var(--radius-sm);
              border: 1px solid var(--border-default);
              background: var(--surface-primary);
              color: var(--text-secondary);
              cursor: pointer;
              transition: all var(--transition-fast);
              box-shadow: 2px 2px 0 var(--border-brutalist);
            }
            .dept-btn:hover {
              background: var(--surface-secondary);
              color: var(--text-primary);
              transform: translate(-1px, -1px);
              box-shadow: 3px 3px 0 var(--border-brutalist);
            }
            .dept-btn.is-active {
              background: var(--accent-primary);
              color: #FFFFFF !important;
              border-color: var(--text-primary);
              box-shadow: 3px 3px 0 var(--border-brutalist);
            }
            .dept-btn-count {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 20px;
              height: 20px;
              padding: 0 6px;
              font-size: 11px;
              font-weight: 700;
              border-radius: 9999px;
              background: var(--surface-secondary);
              color: var(--text-secondary);
            }
            .dept-btn.is-active .dept-btn-count {
              background: rgba(255, 255, 255, 0.25);
              color: #FFFFFF;
            }
            .dept-tools-group {
              display: flex;
              align-items: center;
              gap: 12px;
              flex-wrap: wrap;
            }
            .directory-search-box {
              position: relative;
              display: flex;
              align-items: center;
              min-width: 200px;
              flex: 1;
            }
            @media (min-width: 640px) {
              .directory-search-box {
                min-width: 260px;
                flex: initial;
              }
            }
            .directory-search-input {
              width: 100%;
              padding: 7px 32px 7px 34px;
              font-family: var(--font-body);
              font-size: 13px;
              background: var(--surface-primary);
              color: var(--text-primary);
              border: 1px solid var(--border-default);
              border-radius: var(--radius-sm);
              outline: none;
              box-shadow: 2px 2px 0 var(--border-brutalist);
              transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
            }
            .directory-search-input:focus {
              border-color: var(--accent-primary);
              box-shadow: 3px 3px 0 var(--accent-primary);
            }
          `,
        }}
      />

      {/* ── Top Controls Bar ── */}
      <div className="dept-filter-bar">
        {/* Left: Department Buttons (CSE, EEE, CE with counts) */}
        <div className="dept-btn-group" role="tablist" aria-label="Department filter">
          {DEPARTMENTS.map((dept) => {
            const isActive = selectedDept === dept;
            const count = deptCounts[dept];
            return (
              <button
                key={dept}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedDept(dept)}
                className={`dept-btn ${isActive ? "is-active" : ""}`}
              >
                <span>{dept}</span>
                <span className="dept-btn-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Debounced Searchbar + Batch FilterSelect */}
        <div className="dept-tools-group">
          {/* Debounced Search */}
          <div className="directory-search-box">
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "11px",
                color: "var(--text-secondary)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              className="directory-search-input"
              placeholder={`Search ${category === "alumni" ? "alumni" : "members"}...`}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {isSearching ? (
              <RefreshCw
                size={13}
                className="spin-animation"
                style={{
                  position: "absolute",
                  right: "10px",
                  color: "var(--accent-primary)",
                  pointerEvents: "none",
                }}
              />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: "absolute",
                  right: "8px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          {/* Dynamic Batch Dropdown (Only shows batches that have users in selected department) */}
          <FilterSelect
            value={selectedBatch}
            onChange={(val) => setSelectedBatch(val)}
            options={batchOptions}
            placeholder="Select Batch"
            className="min-w-[170px]"
          />
        </div>
      </div>

      {/* ── Active Filter Summary & Count ── */}
      <div className="flex items-center justify-between mb-6 pb-2 text-xs font-semibold text-text-secondary border-b border-border-default/50">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-text-primary">{filteredPeople.length}</strong> {category === "alumni" ? "alumni" : "members"} in{" "}
            <span className="text-accent-primary font-bold">{selectedDept}</span>
            {selectedBatch !== "all" && (
              <>
                {" "}· <span className="font-bold text-text-primary">{selectedBatch}</span>
              </>
            )}
            {debouncedQuery && (
              <>
                {" "}matching &quot;<span className="text-text-primary">{debouncedQuery}</span>&quot;
              </>
            )}
          </span>
        </div>

        {(selectedBatch !== "all" || debouncedQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedBatch("all");
              handleClearSearch();
            }}
            className="text-accent-primary hover:underline font-bold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ── Member Batches List ── */}
      {filteredPeople.length === 0 ? (
        <div className="text-center py-16 px-4 bg-surface-primary rounded-xl border border-dashed border-border-default shadow-sm my-6">
          <Users size={32} className="mx-auto mb-3 text-text-secondary opacity-60" />
          <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1">{emptyTitle}</h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-[460px] mx-auto mb-4">
            {debouncedQuery
              ? `No ${category === "alumni" ? "alumni" : "members"} found in ${selectedDept} matching "${debouncedQuery}".`
              : selectedBatch !== "all"
              ? `No members found in ${selectedDept} for ${selectedBatch}.`
              : emptySubtitle}
          </p>
          {(selectedBatch !== "all" || debouncedQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedBatch("all");
                handleClearSearch();
              }}
              className="px-4 py-2 bg-surface-secondary hover:bg-accent-primary-light text-text-primary border border-border-default rounded-lg text-xs font-bold transition shadow-sm"
            >
              Clear Search & Batch Filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {displayBatches.map((batch) => (
            <div key={batch.batchNumber} className="flex flex-col">
              <div className="flex items-baseline gap-4 mb-6 pb-3 border-b border-border-default">
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary m-0">
                  {batch.batchNumber}
                </h2>
                {batch.year && (
                  <span className="font-mono [font-feature-settings:'liga'_0,'calt'_0] text-accent-primary-hover text-base font-bold">
                    {batch.year}
                  </span>
                )}
                <span className="text-xs font-bold text-text-secondary bg-surface-secondary px-2.5 py-0.5 rounded-full border border-border-default">
                  {batch.members.length} {batch.members.length === 1 ? "person" : "people"}
                </span>
              </div>

              <ProfileGrid className="stagger-children">
                {batch.members.map((person) => (
                  <ProfileCard
                    key={person.id}
                    slug={person.id}
                    name={person.name}
                    role={person.role}
                    systemRole={person.systemRole}
                    department={person.department}
                    session={person.session}
                    batch={person.batch}
                    sublabel={batch.batchNumber}
                    category={category}
                    image={person.image}
                    imagePosition={person.imagePosition}
                    socials={person.socials}
                  />
                ))}
              </ProfileGrid>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
