"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Save,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Megaphone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Home,
  Code2,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PageContentManagerPage() {
  const [activeTab, setActiveTab] = useState<"home" | "cp-hub" | "contact">("home");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Home Page Content State
  const [homeContent, setHomeContent] = useState({
    hero: {
      title: "Debug your limits. Build reality.",
      highlightText: "Welcome to the Club.",
      description:
        "MEC Computer Club is where students compete in ICPC, build production software, and grow as developers — not just attend meetings.",
      ctaText: "Become a Member",
      ctaLink: "/join",
    },
    contact: {
      email: "meccomputerclub@gmail.com",
      presidentPhone: "01773-758374",
      generalSecretaryPhone: "01568985672",
      location:
        "Department of CSE, Mymensingh Engineering College, Khagdahar, Mymensingh-2200",
    },
    announcement: {
      enabled: false,
      badge: "Notice",
      text: "Intra-MEC Programming Contest 2026 pre-registration is now open!",
      link: "/events",
    },
  });

  // CP Hub Content State
  const [cpContent, setCpContent] = useState({
    header: {
      kicker: "Competitive Programming",
      title: "CP Hub",
      description:
        "Leaderboard, curated roadmaps, problem sets, and resources — everything the CP team needs in one place.",
    },
  });

  // Contact Page Content State
  const [contactContent, setContactContent] = useState({
    info: {
      email: "meccomputerclub@gmail.com",
      presidentPhone: "01773-758374",
      generalSecretaryPhone: "01568985672",
      location:
        "Department of CSE, Mymensingh Engineering College, Khagdahar, Mymensingh-2200",
    },
  });

  // Fetch content for a page
  const fetchPageContent = async (pageKey: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/page-content/${pageKey}`);
      if (res.data?.success && res.data?.data?.sections) {
        const sections = res.data.data.sections;
        if (pageKey === "home") {
          setHomeContent((prev) => ({
            ...prev,
            ...sections,
            hero: { ...prev.hero, ...(sections.hero || {}) },
            contact: { ...prev.contact, ...(sections.contact || {}) },
            announcement: { ...prev.announcement, ...(sections.announcement || {}) },
          }));
        } else if (pageKey === "cp-hub") {
          setCpContent((prev) => ({
            ...prev,
            ...sections,
            header: { ...prev.header, ...(sections.header || {}) },
          }));
        } else if (pageKey === "contact") {
          setContactContent((prev) => ({
            ...prev,
            ...sections,
            info: { ...prev.info, ...(sections.info || {}) },
          }));
        }
      }
    } catch (err) {
      console.warn(`Could not load content for ${pageKey}, using defaults:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContent(activeTab);
  }, [activeTab]);

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      let sectionsToSave = {};
      if (activeTab === "home") sectionsToSave = homeContent;
      if (activeTab === "cp-hub") sectionsToSave = cpContent;
      if (activeTab === "contact") sectionsToSave = contactContent;

      await axios.put(
        `${API_BASE}/api/page-content/${activeTab}`,
        { sections: sectionsToSave },
        { withCredentials: true }
      );
      toast.success(
        `${activeTab.toUpperCase()} content saved successfully! Changes are live.`
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to save page content. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const getLivePageUrl = () => {
    if (activeTab === "home") return "/";
    if (activeTab === "cp-hub") return "/cp-hub";
    return "/contact";
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-5 shadow-[4px_4px_0px_var(--accent-primary)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent-primary-light text-accent-primary font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-text-primary">
              Page Content Manager
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-tertiary">
            Edit text, executive phone numbers, emails, and headlines without touching code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={getLivePageUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border-default bg-surface-secondary text-text-secondary hover:text-accent-primary hover:border-accent-primary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live Preview
          </a>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-accent-primary text-white hover:bg-accent-primary-hover shadow-[2px_2px_0px_var(--border-brutalist)] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default pb-2">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === "home"
              ? "bg-accent-primary text-white shadow-[2px_2px_0px_var(--border-brutalist)]"
              : "bg-surface-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Home className="w-4 h-4" />
          Home Page
        </button>

        <button
          onClick={() => setActiveTab("cp-hub")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === "cp-hub"
              ? "bg-accent-primary text-white shadow-[2px_2px_0px_var(--border-brutalist)]"
              : "bg-surface-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Code2 className="w-4 h-4" />
          CP Hub Page
        </button>

        <button
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors ${
            activeTab === "contact"
              ? "bg-accent-primary text-white shadow-[2px_2px_0px_var(--border-brutalist)]"
              : "bg-surface-secondary text-text-secondary hover:text-text-primary"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Contact Page
        </button>
      </div>

      {/* Main Content Form */}
      {loading ? (
        <div className="p-12 text-center text-text-tertiary flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-accent-primary" />
          <span>Loading page content...</span>
        </div>
      ) : activeTab === "home" ? (
        <div className="space-y-6">
          {/* 1. Contact & Executive Numbers */}
          <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-5 shadow-[4px_4px_0px_var(--accent-primary)] space-y-4">
            <div className="flex items-center gap-2 border-b border-border-default pb-3">
              <Phone className="w-4 h-4 text-accent-primary" />
              <h2 className="text-base font-bold text-text-primary">
                Contact Numbers &amp; Headquarters
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  President Contact Number
                </label>
                <input
                  type="text"
                  value={homeContent.contact.presidentPhone}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      contact: { ...homeContent.contact, presidentPhone: e.target.value },
                    })
                  }
                  placeholder="01773-758374"
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary font-mono text-text-primary"
                />
                <span className="text-[11px] text-text-tertiary">
                  Shown in the Homepage contact card as (President).
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  General Secretary Contact Number
                </label>
                <input
                  type="text"
                  value={homeContent.contact.generalSecretaryPhone}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      contact: {
                        ...homeContent.contact,
                        generalSecretaryPhone: e.target.value,
                      },
                    })
                  }
                  placeholder="01568985672"
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary font-mono text-text-primary"
                />
                <span className="text-[11px] text-text-tertiary">
                  Shown in the Homepage contact card as (General Secretary).
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Email Contact
                </label>
                <input
                  type="email"
                  value={homeContent.contact.email}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      contact: { ...homeContent.contact, email: e.target.value },
                    })
                  }
                  placeholder="meccomputerclub@gmail.com"
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Campus / Lab Location
                </label>
                <input
                  type="text"
                  value={homeContent.contact.location}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      contact: { ...homeContent.contact, location: e.target.value },
                    })
                  }
                  placeholder="Department of CSE..."
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* 2. Hero Section */}
          <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-5 shadow-[4px_4px_0px_var(--accent-primary)] space-y-4">
            <div className="flex items-center gap-2 border-b border-border-default pb-3">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <h2 className="text-base font-bold text-text-primary">
                Hero Section
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={homeContent.hero.title}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      hero: { ...homeContent.hero, title: e.target.value },
                    })
                  }
                  placeholder="Debug your limits. Build reality."
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Highlighted Sub-headline
                </label>
                <input
                  type="text"
                  value={homeContent.hero.highlightText}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      hero: { ...homeContent.hero, highlightText: e.target.value },
                    })
                  }
                  placeholder="Welcome to the Club."
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Description Paragraph
                </label>
                <textarea
                  rows={3}
                  value={homeContent.hero.description}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      hero: { ...homeContent.hero, description: e.target.value },
                    })
                  }
                  placeholder="MEC Computer Club is where students compete in ICPC..."
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={homeContent.hero.ctaText}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, ctaText: e.target.value },
                      })
                    }
                    placeholder="Become a Member"
                    className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                    Primary CTA Button Link
                  </label>
                  <input
                    type="text"
                    value={homeContent.hero.ctaLink}
                    onChange={(e) =>
                      setHomeContent({
                        ...homeContent,
                        hero: { ...homeContent.hero, ctaLink: e.target.value },
                      })
                    }
                    placeholder="/join"
                    className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Top Announcement Banner */}
          <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-5 shadow-[4px_4px_0px_var(--accent-primary)] space-y-4">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-accent-primary" />
                <h2 className="text-base font-bold text-text-primary">
                  Announcement Notice Banner
                </h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeContent.announcement.enabled}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      announcement: {
                        ...homeContent.announcement,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-surface-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-primary"></div>
                <span className="ml-2 text-xs font-bold text-text-primary">
                  {homeContent.announcement.enabled ? "ACTIVE" : "OFF"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={homeContent.announcement.badge}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      announcement: {
                        ...homeContent.announcement,
                        badge: e.target.value,
                      },
                    })
                  }
                  placeholder="Notice"
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Announcement Message
                </label>
                <input
                  type="text"
                  value={homeContent.announcement.text}
                  onChange={(e) =>
                    setHomeContent({
                      ...homeContent,
                      announcement: {
                        ...homeContent.announcement,
                        text: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Registration for Contest 2026 is now open!"
                  className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
                />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "cp-hub" ? (
        <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-5 shadow-[4px_4px_0px_var(--accent-primary)] space-y-4">
          <div className="flex items-center gap-2 border-b border-border-default pb-3">
            <Code2 className="w-4 h-4 text-accent-primary" />
            <h2 className="text-base font-bold text-text-primary">CP Hub Header</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                Kicker Tag
              </label>
              <input
                type="text"
                value={cpContent.header.kicker}
                onChange={(e) =>
                  setCpContent({
                    ...cpContent,
                    header: { ...cpContent.header, kicker: e.target.value },
                  })
                }
                placeholder="Competitive Programming"
                className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                Page Title
              </label>
              <input
                type="text"
                value={cpContent.header.title}
                onChange={(e) =>
                  setCpContent({
                    ...cpContent,
                    header: { ...cpContent.header, title: e.target.value },
                  })
                }
                placeholder="CP Hub"
                className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                Page Description
              </label>
              <textarea
                rows={3}
                value={cpContent.header.description}
                onChange={(e) =>
                  setCpContent({
                    ...cpContent,
                    header: { ...cpContent.header, description: e.target.value },
                  })
                }
                placeholder="Leaderboard, curated roadmaps..."
                className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-elevated border border-border-brutalist dark:border-border-default rounded-2xl p-5 shadow-[4px_4px_0px_var(--accent-primary)] space-y-4">
          <div className="flex items-center gap-2 border-b border-border-default pb-3">
            <MessageSquare className="w-4 h-4 text-accent-primary" />
            <h2 className="text-base font-bold text-text-primary">
              Contact Page Direct Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactContent.info.email}
                onChange={(e) =>
                  setContactContent({
                    ...contactContent,
                    info: { ...contactContent.info, email: e.target.value },
                  })
                }
                placeholder="meccomputerclub@gmail.com"
                className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                President Phone
              </label>
              <input
                type="text"
                value={contactContent.info.presidentPhone}
                onChange={(e) =>
                  setContactContent({
                    ...contactContent,
                    info: {
                      ...contactContent.info,
                      presidentPhone: e.target.value,
                    },
                  })
                }
                placeholder="01773-758374"
                className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary font-mono text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                General Secretary Phone
              </label>
              <input
                type="text"
                value={contactContent.info.generalSecretaryPhone}
                onChange={(e) =>
                  setContactContent({
                    ...contactContent,
                    info: {
                      ...contactContent.info,
                      generalSecretaryPhone: e.target.value,
                    },
                  })
                }
                placeholder="01568985672"
                className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary font-mono text-text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                Campus Location
              </label>
              <input
                type="text"
                value={contactContent.info.location}
                onChange={(e) =>
                  setContactContent({
                    ...contactContent,
                    info: { ...contactContent.info, location: e.target.value },
                  })
                }
                placeholder="Department of CSE..."
                className="w-full px-3 py-2 text-sm bg-surface-secondary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-text-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
