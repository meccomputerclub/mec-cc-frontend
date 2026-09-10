"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  Trophy,
  Compass,
  Code2,
  BookOpen,
  Award,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Download,
  UploadCloud,
  X,
  Eye,
  Loader2,
  CheckCircle2,
  FileDown,
  UserCheck,
  Search,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { LeaderboardEntry, CPResource, CPAchievement } from "@/types";
import LeaderboardTable from "../leaderboard/components/LeaderboardTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import ConfirmationModal from "@/components/ui/shared/ConfirmModal";
import { Select } from "@/components/ui/Select";

interface CPHubViewProps {
  initialLeaderboard: LeaderboardEntry[];
  initialAchievements: CPAchievement[];
  initialClubDocs: CPResource[];
  cpSections?: any;
  kicker: string;
  title: string;
  description: string;
}

const TABS = [
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "roadmaps", label: "Roadmaps", icon: Compass },
  { id: "problem-sets", label: "Problem Sets", icon: Code2 },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "achievements", label: "Achievements", icon: Award },
];

const roadmapLevels = [
  {
    level: "Newbie",
    rating: "< 1200",
    color: "#808080",
    description: "Build fundamentals: syntax fluency, time complexity, and brute force techniques.",
    topics: [
      "Language syntax & STL in C++ (vector, string, sort, pair, map, set)",
      "Time & Space Complexity analysis (Big-O)",
      "Basic Simulation, Arrays, Strings & Math",
      "Brute force enumeration & complete search",
      "Practice: Codeforces Div. 3 & Div. 4 Problems A, B",
    ],
  },
  {
    level: "Pupil",
    rating: "1200 - 1399",
    color: "#008000",
    description: "Standard algorithmic paradigms and efficient data processing.",
    topics: [
      "Binary Search & Two Pointers technique",
      "Prefix Sums & Difference Arrays",
      "Basic Number Theory (Sieve of Eratosthenes, GCD, LCM, Modular arithmetic)",
      "Greedy Algorithms & Constructive algorithms",
      "Practice: Codeforces Div. 2 Problems A, B & Div. 3 Problem C",
    ],
  },
  {
    level: "Specialist",
    rating: "1400 - 1599",
    color: "#03A89E",
    description: "Dynamic programming, graph theory, and intermediate data structures.",
    topics: [
      "Binary Search on Answer range",
      "Dynamic Programming (0/1 Knapsack, LIS, LCS, Grid DP)",
      "Bitmasking & Bitwise Operations",
      "Graph Traversals (BFS, DFS, Connected Components, Topological Sort)",
      "Disjoint Set Union (DSU / Union-Find)",
      "Practice: Codeforces Div. 2 Problem C & CSES DP Section",
    ],
  },
  {
    level: "Expert+",
    rating: "1600+",
    color: "#0000FF",
    description: "Advanced graph theory, range queries, and complex tree algorithms.",
    topics: [
      "Segment Trees, Fenwick Trees (Binary Indexed Tree), Sparse Table",
      "Shortest Paths (Dijkstra, Bellman-Ford, Floyd-Warshall)",
      "Trees (LCA, Tree DP, Binary Lifting)",
      "Combinatorics, Inverses, and Game Theory",
      "Practice: Codeforces Div. 2 Problem D, E & AtCoder ABC E, F",
    ],
  },
];

const problemSets = [
  { title: "Dynamic Programming", count: 50, tag: "CSES + CF", desc: "Classic memoization, tabulation, knapsack, and grid paths.", link: "https://cses.fi/problemset/list/#dynamic" },
  { title: "Graph Theory", count: 35, tag: "BFS/DFS", desc: "Traversal, shortest paths, topological sort, and cycles.", link: "https://cses.fi/problemset/list/#graph" },
  { title: "Range Queries & Trees", count: 40, tag: "SegTree", desc: "Segment trees, fenwick trees, and LCA operations.", link: "https://cses.fi/problemset/list/#range" },
  { title: "Mathematics & Number Theory", count: 25, tag: "Sieve & Mod", desc: "Primes, modular arithmetic, matrix exponentiation.", link: "https://cses.fi/problemset/list/#math" },
  { title: "Binary Search & Two Pointers", count: 30, tag: "Technique", desc: "Searching answer space, interval merging, prefix ranges.", link: "https://codeforces.com/problemset?tags=binary%20search" },
  { title: "Greedy & Constructive", count: 45, tag: "Invariants", desc: "Sorting strategies, interval scheduling, and constructive proofs.", link: "https://codeforces.com/problemset?tags=greedy" },
  { title: "String Algorithms", count: 20, tag: "Hashing & Trie", desc: "String hashing, KMP, Z-algorithm, and Tries.", link: "https://cses.fi/problemset/list/#string" },
  { title: "Tree Algorithms", count: 25, tag: "Subtree DP", desc: "Tree diameter, tree distance, and path queries.", link: "https://cses.fi/problemset/list/#tree" },
];

const resourceCategories = [
  {
    name: "Websites & Problem Archives",
    items: [
      { name: "Codeforces", desc: "The premier competitive programming platform with bi-weekly rated rounds.", url: "https://codeforces.com" },
      { name: "CSES Problem Set", desc: "Curated collection of 300 classic algorithmic problems covering all core topics.", url: "https://cses.fi/problemset/" },
      { name: "AtCoder", desc: "High-quality, elegant educational problems (AtCoder Beginner & Regular Contests).", url: "https://atcoder.jp" },
      { name: "CP-Algorithms", desc: "Comprehensive tutorials and implementations on data structures and algorithms.", url: "https://cp-algorithms.com" },
      { name: "USACO Guide", desc: "Free, curated roadmap and practice curriculum maintained by top competitive programmers.", url: "https://usaco.guide" },
    ],
  },
  {
    name: "Standard Literature & Books",
    items: [
      { name: "Competitive Programming 4 (CP4)", desc: "By Steven & Felix Halim — the definitive ICPC handbook covering all algorithmic archetypes.", url: "https://cpbook.net" },
      { name: "Guide to Competitive Programming", desc: "By Antti Laaksonen — rigorous, concise computer science foundations for contest coders.", url: "https://link.springer.com/book/10.1007/978-3-319-72547-5" },
    ],
  },
  {
    name: "Productivity Tools & Visualizers",
    items: [
      { name: "CF-Predictor", desc: "Browser extension to see live rating changes during and immediately after contests.", url: "https://cf-predictor.wasyl.net" },
      { name: "Codeforces Visualizer", desc: "Track solved problems, tag distribution, and rating history with rich charts.", url: "https://cfviz.netlify.app" },
      { name: "Virtual Judge (VJudge)", desc: "Unified practice platform aggregating POJ, SPOJ, Codeforces, and UVa problems.", url: "https://vjudge.net" },
    ],
  },
];

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TYPE_OPTIONS = [
  { value: "editorial", label: "Editorial" },
  { value: "tutorial", label: "Tutorial" },
  { value: "algorithm", label: "Algorithm Guide" },
  { value: "sheet", label: "Practice Sheet" },
  { value: "doc", label: "Club Doc" },
  { value: "problem-set", label: "Problem Set" },
];

function CPHubViewContent({
  initialLeaderboard,
  initialAchievements,
  initialClubDocs,
  cpSections,
  kicker,
  title,
  description,
}: CPHubViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const canManage = Boolean(
    user && (user.role === "admin" || user.role === "moderator" || user.role === "executive")
  );

  const tabParam = searchParams.get("tab") || "leaderboard";
  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "mentor-sessions" ? "leaderboard" : tabParam
  );

  // Dynamic state for achievements and clubDocs
  const [achievements, setAchievements] = useState<CPAchievement[]>(initialAchievements || []);
  const [clubDocs, setClubDocs] = useState<CPResource[]>(initialClubDocs || []);

  // Custom pages list for quick dropdown selection
  const [customPageOptions, setCustomPageOptions] = useState<{ value: string; label: string }[]>([]);

  // Club Members list for author selection
  const [clubMembers, setClubMembers] = useState<any[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const authorDropdownRef = useRef<HTMLDivElement>(null);

  // Achievement Modal State
  const [achievementModal, setAchievementModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data: CPAchievement;
    saving: boolean;
  }>({
    open: false,
    mode: "add",
    data: { year: `${new Date().getFullYear()}`, highlight: "", title: "", desc: "" },
    saving: false,
  });

  // Club Doc Modal State
  const [docModal, setDocModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    linkType: "custom-page" | "pdf" | "external";
    data: CPResource;
    tagsInput: string;
    saving: boolean;
  }>({
    open: false,
    mode: "add",
    linkType: "custom-page",
    data: {
      id: "",
      title: "",
      author: "",
      difficulty: "beginner",
      type: "tutorial",
      url: "",
      pdfUrl: "",
      tags: [],
    },
    tagsInput: "",
    saving: false,
  });

  const [uploadingPdf, setUploadingPdf] = useState(false);

  // PDF Viewer Modal State
  const [viewingPdfDoc, setViewingPdfDoc] = useState<CPResource | null>(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: "achievement" | "doc";
    id: string;
    title: string;
    loading: boolean;
  }>({
    open: false,
    type: "achievement",
    id: "",
    title: "",
    loading: false,
  });

  // Sync tab with URL
  useEffect(() => {
    const p = searchParams.get("tab") || "leaderboard";
    if (p === "mentor-sessions") {
      setActiveTab("leaderboard");
      router.replace("/cp-hub", { scroll: false });
    } else if (TABS.some((t) => t.id === p)) {
      setActiveTab(p);
    }
  }, [searchParams, router]);

  // Load published custom pages for link selection
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/custom-pages`)
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const options = res.data.data.map((p: any) => ({
            value: `/pages/${p.slug}`,
            label: `${p.title} (/pages/${p.slug})`,
          }));
          setCustomPageOptions(options);
        }
      })
      .catch(() => {});
  }, []);

  // Load club members for author picker
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/users/all-members`)
      .then((res) => {
        const list = res.data?.members || res.data?.data || [];
        if (Array.isArray(list)) {
          setClubMembers(list);
        }
      })
      .catch(() => {});
  }, []);

  // Close member dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        authorDropdownRef.current &&
        !authorDropdownRef.current.contains(e.target as Node)
      ) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "leaderboard") {
      router.replace("/cp-hub", { scroll: false });
    } else {
      router.replace(`/cp-hub?tab=${tabId}`, { scroll: false });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Persistence Helper
  // ─────────────────────────────────────────────────────────────────────────────
  const saveSections = async (
    updatedAchievements?: CPAchievement[],
    updatedClubDocs?: CPResource[]
  ) => {
    const newAchievements = updatedAchievements !== undefined ? updatedAchievements : achievements;
    const newClubDocs = updatedClubDocs !== undefined ? updatedClubDocs : clubDocs;

    const currentSections = cpSections || {};
    const payload = {
      sections: {
        ...currentSections,
        achievements: newAchievements,
        clubDocs: newClubDocs,
      },
    };

    await axios.put(`${API_BASE_URL}/api/page-content/cp-hub`, payload, {
      withCredentials: true,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Achievements CRUD
  // ─────────────────────────────────────────────────────────────────────────────
  const openAddAchievement = () => {
    setAchievementModal({
      open: true,
      mode: "add",
      data: {
        id: `ach-${Date.now()}`,
        year: `${new Date().getFullYear()}`,
        highlight: "",
        title: "",
        desc: "",
      },
      saving: false,
    });
  };

  const openEditAchievement = (ach: CPAchievement, e: React.MouseEvent) => {
    e.stopPropagation();
    setAchievementModal({
      open: true,
      mode: "edit",
      data: { ...ach },
      saving: false,
    });
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementModal.data.title.trim()) {
      toast.error("Please enter an achievement title");
      return;
    }

    setAchievementModal((prev) => ({ ...prev, saving: true }));
    try {
      let updated: CPAchievement[];
      if (achievementModal.mode === "add") {
        const newItem: CPAchievement = {
          ...achievementModal.data,
          id: achievementModal.data.id || `ach-${Date.now()}`,
        };
        updated = [newItem, ...achievements];
      } else {
        updated = achievements.map((a) =>
          (a.id || a._id) === (achievementModal.data.id || achievementModal.data._id)
            ? achievementModal.data
            : a
        );
      }

      await saveSections(updated, undefined);
      setAchievements(updated);
      setAchievementModal({ ...achievementModal, open: false, saving: false });
      toast.success(
        achievementModal.mode === "add"
          ? "Achievement added successfully!"
          : "Achievement updated successfully!"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save achievement");
      setAchievementModal((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleDeleteAchievement = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const updated = achievements.filter(
        (a) => (a.id || a._id) !== deleteModal.id
      );
      await saveSections(updated, undefined);
      setAchievements(updated);
      setDeleteModal({ open: false, type: "achievement", id: "", title: "", loading: false });
      toast.success("Achievement deleted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete achievement");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Club Docs CRUD & PDF Upload
  // ─────────────────────────────────────────────────────────────────────────────
  const openAddDoc = () => {
    setSelectedMember(null);
    setDocModal({
      open: true,
      mode: "add",
      linkType: "custom-page",
      data: {
        id: `doc-${Date.now()}`,
        title: "",
        author: "",
        difficulty: "beginner",
        type: "tutorial",
        url: customPageOptions.length > 0 ? customPageOptions[0].value : "",
        pdfUrl: "",
        tags: [],
      },
      tagsInput: "",
      saving: false,
    });
  };

  const openEditDoc = (doc: CPResource, e: React.MouseEvent) => {
    e.stopPropagation();
    const isPdf = Boolean(
      doc.pdfUrl ||
        doc.linkType === "pdf" ||
        doc.url?.toLowerCase().endsWith(".pdf") ||
        doc.url?.includes("/raw/upload/")
    );
    const isCustomPage =
      doc.linkType === "custom-page" ||
      (doc.url?.startsWith("/pages/") && !isPdf);
    const detectedType = isPdf ? "pdf" : isCustomPage ? "custom-page" : "external";

    // Match member if found
    const matchingMember = clubMembers.find(
      (m) => m.fullName?.toLowerCase() === doc.author?.toLowerCase()
    );
    setSelectedMember(matchingMember || null);

    setDocModal({
      open: true,
      mode: "edit",
      linkType: detectedType,
      data: {
        ...doc,
        linkType: detectedType,
      },
      tagsInput: (doc.tags || []).join(", "),
      saving: false,
    });
  };

  const handleSelectMemberAuthor = (member: any) => {
    setSelectedMember(member);
    setDocModal((prev) => ({
      ...prev,
      data: { ...prev.data, author: member.fullName },
    }));
    setShowMemberDropdown(false);
  };

  const handleClearMemberAuthor = () => {
    setSelectedMember(null);
    setDocModal((prev) => ({
      ...prev,
      data: { ...prev.data, author: "" },
    }));
  };

  const handleSetSelfAsAuthor = () => {
    if (!user) return;
    const authorName = user.fullName || "Club Member";
    const selfMember = clubMembers.find(
      (m) => m._id === user.id || m.id === user.id || m.studentId === user.studentId
    );
    setSelectedMember(
      selfMember || {
        fullName: authorName,
        studentId: user.studentId,
        imageUrl: user.imageUrl,
      }
    );
    setDocModal((prev) => ({
      ...prev,
      data: { ...prev.data, author: authorName },
    }));
    setShowMemberDropdown(false);
  };

  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document (.pdf)");
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "club_docs");

      const res = await axios.post(`${API_BASE_URL}/api/upload/file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        setDocModal((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            pdfUrl: uploadedUrl,
            url: uploadedUrl,
          },
        }));
        toast.success("PDF uploaded successfully!");
      } else {
        toast.error("Upload failed: No file URL returned");
      }
    } catch (err: any) {
      console.error("PDF upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload PDF");
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docModal.data.title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    let finalUrl = docModal.data.url.trim();
    if (docModal.linkType === "pdf") {
      finalUrl = docModal.data.pdfUrl || finalUrl;
      if (!finalUrl) {
        toast.error("Please upload a PDF or enter a PDF document URL");
        return;
      }
    } else if (docModal.linkType === "custom-page") {
      if (!finalUrl) {
        toast.error("Please select or enter the custom page path (/pages/[slug])");
        return;
      }
      if (!finalUrl.startsWith("/")) {
        finalUrl = `/${finalUrl}`;
      }
    } else {
      if (!finalUrl) {
        toast.error("Please enter a destination URL");
        return;
      }
    }

    const tags = docModal.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setDocModal((prev) => ({ ...prev, saving: true }));
    try {
      const formattedDoc: CPResource = {
        ...docModal.data,
        id: docModal.data.id || `doc-${Date.now()}`,
        url: finalUrl,
        pdfUrl: docModal.linkType === "pdf" ? finalUrl : docModal.data.pdfUrl,
        linkType: docModal.linkType,
        tags,
        date: docModal.data.date || new Date().toISOString().split("T")[0],
      };

      let updated: CPResource[];
      if (docModal.mode === "add") {
        updated = [formattedDoc, ...clubDocs];
      } else {
        updated = clubDocs.map((d) => (d.id === formattedDoc.id ? formattedDoc : d));
      }

      await saveSections(undefined, updated);
      setClubDocs(updated);
      setDocModal((prev) => ({ ...prev, open: false, saving: false }));
      toast.success(
        docModal.mode === "add"
          ? "Club document added successfully!"
          : "Club document updated successfully!"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save document");
      setDocModal((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleDeleteDoc = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const updated = clubDocs.filter((d) => d.id !== deleteModal.id);
      await saveSections(undefined, updated);
      setClubDocs(updated);
      setDeleteModal({ open: false, type: "doc", id: "", title: "", loading: false });
      toast.success("Document deleted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete document");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle card redirection or viewer
  const handleDocClick = (doc: CPResource) => {
    const isPdf = Boolean(
      doc.pdfUrl ||
        doc.linkType === "pdf" ||
        doc.url?.toLowerCase().endsWith(".pdf") ||
        doc.url?.includes("/raw/upload/")
    );

    if (isPdf) {
      setViewingPdfDoc(doc);
    } else if (doc.url?.startsWith("/")) {
      router.push(doc.url);
    } else if (doc.url && doc.url !== "#") {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    } else {
      toast("No redirection link specified for this card yet.");
    }
  };

  // Filtered members for search
  const filteredMembers = clubMembers.filter((m) => {
    const term = (docModal.data.author || "").toLowerCase();
    if (!term) return true;
    return (
      m.fullName?.toLowerCase().includes(term) ||
      m.studentId?.toLowerCase().includes(term) ||
      m.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <section className="pt-8 pb-2">
        <div className="container mx-auto px-4 md:px-8">
          <span className="kicker">{kicker}</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary mb-3">
            {title}
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-[680px]">
            {description}
          </p>
        </div>
      </section>

      {/* Main Tab Switcher */}
      <section className="border-b border-border-default sticky top-[var(--nav-height)] z-20 bg-surface-primary/95 backdrop-blur-sm py-2">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-accent-primary !text-accent-primary-text shadow-[3px_3px_0px_var(--border-brutalist)] border-2 border-text-primary dark:border-border-default"
                      : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-default hover:bg-surface-secondary"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab 1: Leaderboard */}
      {activeTab === "leaderboard" && (
        <section className="container mx-auto px-4 md:px-8 max-w-6xl">
          <LeaderboardTable initialEntries={initialLeaderboard} />
        </section>
      )}

      {/* Tab 2: Roadmaps */}
      {activeTab === "roadmaps" && (
        <section className="container mx-auto px-4 md:px-8 max-w-4xl space-y-6">
          <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)]">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Compass className="text-accent-primary" /> Codeforces Rating Milestone Roadmaps
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Step-by-step topics and training drills crafted by club seniors to advance through Codeforces divisions systematically.
            </p>
          </div>

          <div className="space-y-6">
            {roadmapLevels.map((lvl) => (
              <div
                key={lvl.level}
                className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-6 shadow-[4px_4px_0px_0px_var(--border-default)] transition-all hover:shadow-[6px_6px_0px_var(--accent-primary)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-border-default">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: lvl.color }}
                    />
                    <h3 className="text-xl font-bold text-text-primary" style={{ color: lvl.color }}>
                      {lvl.level}
                    </h3>
                  </div>
                  <span
                    className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-surface-secondary border border-border-default"
                    style={{ color: lvl.color }}
                  >
                    Rating: {lvl.rating}
                  </span>
                </div>

                <p className="text-sm text-text-secondary mb-4 italic">
                  {lvl.description}
                </p>

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-text-tertiary tracking-wider">
                    Core Curriculum &amp; Practice Drills:
                  </h4>
                  <ul className="space-y-2">
                    {lvl.topics.map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary">
                        <span className="text-accent-primary font-mono font-bold">→</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab 3: Problem Sets */}
      {activeTab === "problem-sets" && (
        <section className="container mx-auto px-4 md:px-8 max-w-6xl space-y-6">
          <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)]">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Code2 className="text-accent-primary" /> Topic-Wise Problem Sets
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Target your algorithmic weaknesses with curated problem collections from CSES, Codeforces, and AtCoder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {problemSets.map((ps) => (
              <a
                key={ps.title}
                href={ps.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-5 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5 no-underline text-inherit"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-accent-primary-light text-text-primary">
                      {ps.tag}
                    </span>
                    <span className="font-mono text-xs text-text-tertiary font-bold">
                      {ps.count} Problems
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                    {ps.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed mb-4">
                    {ps.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-border-default flex items-center justify-between text-xs font-bold text-accent-primary">
                  <span>Start Practicing</span>
                  <ExternalLink size={13} />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Tab 4: Resources & Club Docs */}
      {activeTab === "resources" && (
        <section className="container mx-auto px-4 md:px-8 max-w-6xl space-y-10">
          {/* Main Resource Categories */}
          <div className="space-y-6">
            <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)]">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
                <BookOpen className="text-accent-primary" /> Curated Tools, Books &amp; Judges
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Essential reference libraries, coding portals, and practice platforms recommended for all competitive coders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resourceCategories.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-5 shadow-[4px_4px_0px_0px_var(--border-default)] flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-bold text-text-primary pb-3 border-b border-border-default mb-4">
                      {cat.name}
                    </h3>
                    <ul className="space-y-3">
                      {cat.items.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-2.5 rounded-xl border border-border-default bg-surface-secondary hover:border-accent-primary transition-all no-underline"
                          >
                            <div className="flex items-center justify-between text-sm font-bold text-text-primary group-hover:text-accent-primary">
                              <span>{item.name}</span>
                              <ExternalLink size={13} />
                            </div>
                            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                              {item.desc}
                            </p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Club Editorials, Algorithms & Docs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Club Docs, Algorithms &amp; Editorials
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  Internal learning resources, contest editorials, and algorithm breakdowns published by club members.
                </p>
              </div>

              {canManage && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={openAddDoc}
                  icon={<Plus size={16} />}
                >
                  Add Club Doc
                </Button>
              )}
            </div>

            {clubDocs.length === 0 ? (
              <div className="p-12 text-center bg-surface-elevated border border-dashed border-border-default rounded-2xl text-text-secondary">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-text-primary">No club docs published yet.</p>
                {canManage && (
                  <p className="text-xs mt-1">Click &quot;Add Club Doc&quot; above to create the first editorial or tutorial.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubDocs.map((r) => {
                  const isPdf = Boolean(
                    r.pdfUrl ||
                      r.linkType === "pdf" ||
                      r.url?.toLowerCase().endsWith(".pdf") ||
                      r.url?.includes("/raw/upload/")
                  );
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleDocClick(r)}
                      className="group relative cursor-pointer flex flex-col justify-between p-5 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl transition-all duration-200 hover:shadow-[6px_6px_0px_var(--accent-primary)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant={
                                r.difficulty === "beginner"
                                  ? "active"
                                  : r.difficulty === "intermediate"
                                  ? "info"
                                  : "pending"
                              }
                              size="sm"
                            >
                              {r.difficulty}
                            </Badge>
                            <span className="font-mono text-xs text-text-tertiary uppercase font-bold">
                              {r.type}
                            </span>
                            {isPdf && (
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                                <FileDown size={10} /> PDF
                              </span>
                            )}
                          </div>

                          {/* Admin Edit/Delete buttons */}
                          {canManage && (
                            <div
                              className="flex items-center gap-1 opacity-90 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => openEditDoc(r, e)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-surface-secondary transition"
                                title="Edit Doc"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModal({
                                    open: true,
                                    type: "doc",
                                    id: r.id,
                                    title: r.title,
                                    loading: false,
                                  });
                                }}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                                title="Delete Doc"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 mb-1">
                          {r.title}
                        </h4>
                        {r.author && (
                          <span className="text-xs text-text-tertiary block mb-3 font-medium">
                            By {r.author}
                          </span>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border-default mt-2">
                        {r.tags && r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {r.tags.map((t) => (
                              <span
                                key={t}
                                className="font-mono text-[0.65rem] py-0.5 px-2 bg-surface-secondary rounded border border-border-default text-text-tertiary"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs font-bold text-accent-primary">
                          <span>{isPdf ? "View & Download PDF" : "Open Document"}</span>
                          {isPdf ? <Eye size={13} /> : <ExternalLink size={13} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 5: Achievements */}
      {activeTab === "achievements" && (
        <section className="container mx-auto px-4 md:px-8 max-w-4xl space-y-6">
          <div className="p-6 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl shadow-[4px_4px_0px_var(--accent-primary)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-1 flex items-center gap-2">
                <Award className="text-accent-primary" /> Contest Milestones &amp; Accolades
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Official records of our club teams competing in national hackathons, ICPC regionals, and collegiate contests.
              </p>
            </div>

            {canManage && (
              <Button
                variant="primary"
                size="md"
                onClick={openAddAchievement}
                icon={<Plus size={16} />}
              >
                Add Achievement
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {achievements.length === 0 ? (
              <div className="p-12 text-center bg-surface-elevated border border-dashed border-border-default rounded-2xl text-text-secondary">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-text-primary">No achievements recorded yet.</p>
                {canManage && (
                  <p className="text-xs mt-1">Click &quot;Add Achievement&quot; to record your team&apos;s victory.</p>
                )}
              </div>
            ) : (
              achievements.map((ach) => (
                <div
                  key={ach.id || ach._id || ach.title}
                  className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-6 shadow-[4px_4px_0px_0px_var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-[5px_5px_0px_var(--accent-primary)]"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-accent-primary !text-accent-primary-text">
                        {ach.year}
                      </span>
                      <span className="font-bold text-accent-primary-hover text-sm">
                        {ach.highlight}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">{ach.title}</h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {ach.desc}
                    </p>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-default">
                      <button
                        onClick={(e) => openEditAchievement(ach, e)}
                        className="p-2 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-surface-secondary transition"
                        title="Edit Achievement"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            type: "achievement",
                            id: (ach.id || ach._id)!,
                            title: ach.title,
                            loading: false,
                          })
                        }
                        className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        title="Delete Achievement"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 1. ACHIEVEMENT ADD / EDIT MODAL */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {achievementModal.open && (
        <div className="fixed inset-0 z-[1200] flex items-start sm:items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-12 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-surface-primary border border-border-brutalist dark:border-border-default rounded-2xl w-full max-w-lg shadow-[8px_8px_0px_var(--accent-primary)] overflow-hidden my-auto flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-surface-secondary shrink-0">
              <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <Award className="text-accent-primary" size={20} />
                {achievementModal.mode === "add" ? "Add Milestone / Accolade" : "Edit Milestone"}
              </h3>
              <button
                type="button"
                onClick={() => setAchievementModal({ ...achievementModal, open: false })}
                className="text-text-tertiary hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-elevated transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-5 space-y-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1 font-bold">
                      Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={achievementModal.data.year}
                      onChange={(e) =>
                        setAchievementModal({
                          ...achievementModal,
                          data: { ...achievementModal.data, year: e.target.value },
                        })
                      }
                      placeholder="e.g. 2025"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-secondary border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1 font-bold">
                      Highlight / Rank *
                    </label>
                    <input
                      type="text"
                      required
                      value={achievementModal.data.highlight}
                      onChange={(e) =>
                        setAchievementModal({
                          ...achievementModal,
                          data: { ...achievementModal.data, highlight: e.target.value },
                        })
                      }
                      placeholder="e.g. Top 25 Finish, Champion"
                      className="w-full px-3.5 py-2.5 text-sm bg-surface-secondary border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1 font-bold">
                    Contest / Milestone Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={achievementModal.data.title}
                    onChange={(e) =>
                      setAchievementModal({
                        ...achievementModal,
                        data: { ...achievementModal.data, title: e.target.value },
                      })
                    }
                    placeholder="e.g. ICPC Asia Dhaka Regional Contest"
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-secondary border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1 font-bold">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={achievementModal.data.desc}
                    onChange={(e) =>
                      setAchievementModal({
                        ...achievementModal,
                        data: { ...achievementModal.data, desc: e.target.value },
                      })
                    }
                    placeholder="Official details, team members, or record summary..."
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-secondary border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t border-border-default bg-surface-secondary/60 shrink-0">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setAchievementModal({ ...achievementModal, open: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={achievementModal.saving}
                  icon={achievementModal.saving ? <Loader2 size={15} className="animate-spin" /> : undefined}
                >
                  {achievementModal.saving
                    ? "Saving..."
                    : achievementModal.mode === "add"
                    ? "Add Achievement"
                    : "Update Achievement"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 2. CLUB DOC / EDITORIAL ADD & EDIT MODAL */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {docModal.open && (
        <div className="fixed inset-0 z-[1200] flex items-start sm:items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-12 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-surface-primary border border-border-brutalist dark:border-border-default rounded-2xl w-full max-w-xl shadow-[8px_8px_0px_var(--accent-primary)] overflow-hidden my-auto flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-surface-secondary shrink-0">
              <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <FileText className="text-accent-primary" size={20} />
                {docModal.mode === "add" ? "Add Club Document / Editorial" : "Edit Club Document"}
              </h3>
              <button
                type="button"
                onClick={() => setDocModal({ ...docModal, open: false })}
                className="text-text-tertiary hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-elevated transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveDoc} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-4 flex-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1 font-bold">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={docModal.data.title}
                    onChange={(e) =>
                      setDocModal({
                        ...docModal,
                        data: { ...docModal.data, title: e.target.value },
                      })
                    }
                    placeholder="e.g. Segment Trees Crash Course &amp; Point Updates"
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-secondary border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-bold"
                  />
                </div>

                {/* Author Field with Club Member Support */}
                <div className="relative" ref={authorDropdownRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary font-bold">
                      Author (Club Member or Custom)
                    </label>
                    {user && (
                      <button
                        type="button"
                        onClick={handleSetSelfAsAuthor}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-primary hover:underline"
                      >
                        <UserCheck size={12} /> Set Me as Author
                      </button>
                    )}
                  </div>

                  {selectedMember ? (
                    <div className="flex items-center justify-between p-2.5 bg-surface-secondary border border-border-default rounded-xl">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-7 h-7 rounded-full bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center text-xs font-bold text-text-primary shrink-0 overflow-hidden">
                          {selectedMember.imageUrl ? (
                            <img
                              src={selectedMember.imageUrl}
                              alt={selectedMember.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            selectedMember.fullName?.charAt(0) || "M"
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-text-primary truncate">
                            {selectedMember.fullName}
                          </p>
                          <p className="text-[10px] text-text-secondary font-mono truncate">
                            Verified Club Member {selectedMember.studentId ? `· ${selectedMember.studentId}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearMemberAuthor}
                        className="p-1 rounded-lg text-text-secondary hover:text-accent-error hover:bg-surface-elevated transition"
                        title="Remove member selection and enter custom name"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={docModal.data.author || ""}
                        onFocus={() => setShowMemberDropdown(true)}
                        onChange={(e) => {
                          setDocModal({
                            ...docModal,
                            data: { ...docModal.data, author: e.target.value },
                          });
                          setShowMemberDropdown(true);
                        }}
                        placeholder="Type author name or select from club members..."
                        className="w-full px-3.5 py-2.5 text-sm bg-surface-secondary border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
                      />

                      {/* Club member suggestions dropdown */}
                      {showMemberDropdown && (
                        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-surface-elevated border border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] z-50 max-h-48 overflow-y-auto">
                          {clubMembers.length > 0 && (
                            <div className="p-2 border-b border-border-default bg-surface-secondary/50 text-[10px] font-mono text-text-tertiary uppercase font-bold">
                              Verified Club Members
                            </div>
                          )}
                          {filteredMembers.length > 0 ? (
                            filteredMembers.slice(0, 8).map((m) => (
                              <button
                                key={m._id || m.id || m.studentId}
                                type="button"
                                onClick={() => handleSelectMemberAuthor(m)}
                                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-surface-secondary border-b border-border-default last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="w-6 h-6 rounded-full bg-surface-secondary flex items-center justify-center font-bold text-[10px] text-text-primary overflow-hidden border border-border-default shrink-0">
                                    {m.imageUrl ? (
                                      <img src={m.imageUrl} alt={m.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                      m.fullName?.charAt(0) || "U"
                                    )}
                                  </div>
                                  <div className="truncate">
                                    <p className="text-xs font-bold text-text-primary truncate">{m.fullName}</p>
                                    <p className="text-[10px] text-text-secondary font-mono truncate">
                                      {m.studentId ? `ID: ${m.studentId}` : m.department || "MEC CSE"}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-accent-primary shrink-0 ml-2">
                                  Select
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2.5 text-center text-xs text-text-secondary">
                              No member match found. Custom name &quot;{docModal.data.author}&quot; will be used.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Difficulty & Type Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1 font-bold">
                      Difficulty *
                    </label>
                    <Select
                      value={docModal.data.difficulty}
                      onChange={(val) =>
                        setDocModal({
                          ...docModal,
                          data: {
                            ...docModal.data,
                            difficulty: val as "beginner" | "intermediate" | "advanced",
                          },
                        })
                      }
                      options={DIFFICULTY_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1 font-bold">
                      Resource Type *
                    </label>
                    <Select
                      value={docModal.data.type}
                      onChange={(val) =>
                        setDocModal({
                          ...docModal,
                          data: { ...docModal.data, type: val },
                        })
                      }
                      options={TYPE_OPTIONS}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1 font-bold">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={docModal.tagsInput}
                    onChange={(e) => setDocModal({ ...docModal, tagsInput: e.target.value })}
                    placeholder="e.g. segment-tree, range-query, binary-search"
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-secondary border border-border-default rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-mono"
                  />
                </div>

                {/* Redirection Destination Selector */}
                <div className="p-4 bg-surface-secondary/70 border border-border-default rounded-xl space-y-3">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                    Redirection Link / Document Source:
                  </label>

                  {/* Link Type Segmented Switcher with Theme-Safe Colors */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "custom-page" as const, label: "Custom Page" },
                      { id: "pdf" as const, label: "Upload PDF" },
                      { id: "external" as const, label: "Web Link" },
                    ].map((tab) => {
                      const isActive = docModal.linkType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            if (tab.id === "custom-page") {
                              setDocModal({
                                ...docModal,
                                linkType: "custom-page",
                                data: {
                                  ...docModal.data,
                                  url: customPageOptions.length > 0 ? customPageOptions[0].value : "",
                                },
                              });
                            } else if (tab.id === "pdf") {
                              setDocModal({
                                ...docModal,
                                linkType: "pdf",
                                data: {
                                  ...docModal.data,
                                  url: docModal.data.pdfUrl || docModal.data.url || "",
                                },
                              });
                            } else {
                              setDocModal({
                                ...docModal,
                                linkType: "external",
                              });
                            }
                          }}
                          className={`py-2 px-2 text-xs font-bold rounded-lg border-2 transition-all duration-150 ${
                            isActive
                              ? "bg-accent-primary !text-accent-primary-text border-text-primary dark:border-border-default shadow-[2px_2px_0px_var(--border-brutalist)] dark:shadow-[2px_2px_0px_var(--accent-primary)]"
                              : "bg-surface-elevated text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-border-default font-semibold"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mode 1: Custom Page Redirection */}
                  {docModal.linkType === "custom-page" && (
                    <div className="space-y-2 pt-1">
                      {customPageOptions.length > 0 && (
                        <div>
                          <label className="block text-[11px] text-text-tertiary mb-1 font-semibold">
                            Select from pages created via Page Editor:
                          </label>
                          <Select
                            value={docModal.data.url}
                            onChange={(val) =>
                              setDocModal({
                                ...docModal,
                                data: { ...docModal.data, url: val },
                              })
                            }
                            options={customPageOptions}
                            placeholder="Select custom page..."
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-[11px] text-text-tertiary mb-1 font-semibold">
                          Page Path:
                        </label>
                        <input
                          type="text"
                          value={docModal.data.url}
                          onChange={(e) =>
                            setDocModal({
                              ...docModal,
                              data: { ...docModal.data, url: e.target.value },
                            })
                          }
                          placeholder="/pages/segment-tree-guide"
                          className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border-default rounded-xl font-mono text-text-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mode 2: PDF Upload */}
                  {docModal.linkType === "pdf" && (
                    <div className="space-y-3 pt-1">
                      <label className="block text-[11px] text-text-tertiary font-semibold">
                        Upload PDF Document (opens with full reader and download capabilities):
                      </label>

                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated border-2 border-dashed border-accent-primary hover:bg-accent-primary-light text-text-primary text-xs font-bold transition">
                          <UploadCloud size={16} className="text-accent-primary" />
                          <span>{uploadingPdf ? "Uploading..." : "Choose PDF Document"}</span>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handlePdfFileSelect}
                            disabled={uploadingPdf}
                            className="hidden"
                          />
                        </label>

                        {uploadingPdf && <Loader2 size={18} className="animate-spin text-accent-primary" />}
                      </div>

                      {docModal.data.pdfUrl ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                            <span className="font-mono truncate text-green-700 dark:text-green-300 font-semibold">
                              {docModal.data.pdfUrl}
                            </span>
                          </div>
                          <a
                            href={docModal.data.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-primary hover:underline font-bold shrink-0 ml-2"
                          >
                            Preview
                          </a>
                        </div>
                      ) : (
                        <p className="text-[11px] text-text-tertiary">
                          No PDF uploaded yet. Click &quot;Choose PDF Document&quot; above.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mode 3: External URL */}
                  {docModal.linkType === "external" && (
                    <div className="space-y-1 pt-1">
                      <label className="block text-[11px] text-text-tertiary font-semibold">
                        External URL (e.g. GitHub repository, Codeforces article, or website):
                      </label>
                      <input
                        type="url"
                        value={docModal.data.url}
                        onChange={(e) =>
                          setDocModal({
                            ...docModal,
                            data: { ...docModal.data, url: e.target.value },
                          })
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-xs bg-surface-elevated border border-border-default rounded-xl font-mono text-text-primary"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-border-default bg-surface-secondary/60 shrink-0">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => setDocModal({ ...docModal, open: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={docModal.saving || uploadingPdf}
                  icon={docModal.saving ? <Loader2 size={15} className="animate-spin" /> : undefined}
                >
                  {docModal.saving
                    ? "Saving..."
                    : docModal.mode === "add"
                    ? "Add Document"
                    : "Update Document"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 3. PDF VIEWER & DOWNLOAD MODAL */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {viewingPdfDoc && (
        <div className="fixed inset-0 z-[1200] flex items-start sm:items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-12 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-surface-primary border border-border-brutalist dark:border-border-default rounded-2xl w-full max-w-5xl shadow-[8px_8px_0px_var(--accent-primary)] overflow-hidden my-auto flex flex-col max-h-[88vh]">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-border-default bg-surface-secondary shrink-0 gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="active" size="sm">
                    {viewingPdfDoc.difficulty}
                  </Badge>
                  <span className="font-mono text-xs text-text-tertiary uppercase font-bold">
                    {viewingPdfDoc.type}
                  </span>
                  {viewingPdfDoc.author && (
                    <span className="text-xs text-text-tertiary font-semibold">
                      • By {viewingPdfDoc.author}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-text-primary">
                  {viewingPdfDoc.title}
                </h3>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  href={viewingPdfDoc.pdfUrl || viewingPdfDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<Download size={14} />}
                >
                  Download PDF
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  href={viewingPdfDoc.pdfUrl || viewingPdfDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<ExternalLink size={14} />}
                >
                  New Tab
                </Button>

                <button
                  type="button"
                  onClick={() => setViewingPdfDoc(null)}
                  className="p-2 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-elevated transition ml-1"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF viewer */}
            <div className="flex-1 p-2 sm:p-4 bg-surface-secondary/40 overflow-hidden flex flex-col">
              <iframe
                src={viewingPdfDoc.pdfUrl || viewingPdfDoc.url}
                className="w-full flex-1 min-h-[55vh] border border-border-default rounded-xl bg-white dark:bg-slate-900 shadow-inner"
                title={viewingPdfDoc.title}
              />
              <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-text-tertiary">
                <span>Rendering club document</span>
                <span>
                  Having trouble previewing? Click &quot;Download PDF&quot; or &quot;New Tab&quot; above.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 4. CONFIRMATION MODAL FOR DELETION */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={
          deleteModal.type === "achievement"
            ? handleDeleteAchievement
            : handleDeleteDoc
        }
        title={
          deleteModal.type === "achievement"
            ? "Delete Achievement Milestone"
            : "Delete Club Document"
        }
        message={
          <>
            Are you sure you want to delete{" "}
            <strong>&ldquo;{deleteModal.title}&rdquo;</strong>? This change will
            take effect immediately.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleteModal.loading}
        confirmColor="red"
      />
    </div>
  );
}

export default function CPHubView(props: CPHubViewProps) {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-text-tertiary">Loading CP Hub...</div>
      }
    >
      <CPHubViewContent {...props} />
    </Suspense>
  );
}
