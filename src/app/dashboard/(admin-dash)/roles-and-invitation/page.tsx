"use client";

import React, { useState, useEffect } from "react";
import { Users, Mail, Award, Shield } from "lucide-react";
import InvitationCodeContent from "@/components/dashboard/InvitationCodeContent";
import RolesManagement from "@/components/dashboard/RolesManagement";
import { DesignationManager } from "@/components/dashboard/legacy/DesignationManager";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

// Reusable Tab Button
const TabButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = ({ isActive, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-base sm:text-lg font-medium rounded-t-lg transition-colors duration-200 ${isActive
        ? "text-blue-600 border-b-4 border-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold"
        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
  >
    <Icon className="w-5 h-5 mr-2" />
    {label}
  </button>
);

export default function RolesAndInvitationCodePage() {
  const [activeTab, setActiveTab] = useState<"roles" | "invitation" | "designations">("roles");
  const [designationCategory, setDesignationCategory] = useState<"executive" | "advisor">("executive");
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const { user } = useAuth();

  const fetchMembers = async () => {
    try {
      const res = await api.get("/api/users/all-members");
      if (res && res.members) {
        setAllMembers(res.members);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white border-b pb-4 border-gray-200 dark:border-gray-700">
        Administration: Roles, Invitations & Designations
      </h1>

      {/* --- Tabs --- */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 gap-2">
        <TabButton
          isActive={activeTab === "roles"}
          onClick={() => setActiveTab("roles")}
          icon={Users}
          label="Role Management"
        />
        <TabButton
          isActive={activeTab === "invitation"}
          onClick={() => setActiveTab("invitation")}
          icon={Mail}
          label="Invitation Codes"
        />
        <TabButton
          isActive={activeTab === "designations"}
          onClick={() => setActiveTab("designations")}
          icon={Award}
          label="Designations & Panels"
        />
      </div>

      {/* --- Content Area --- */}
      <div>
        {activeTab === "roles" && <RolesManagement />}
        {activeTab === "invitation" && <InvitationCodeContent />}
        {activeTab === "designations" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
              <button
                onClick={() => setDesignationCategory("executive")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${designationCategory === "executive"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                Executive Committee
              </button>
              <button
                onClick={() => setDesignationCategory("advisor")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${designationCategory === "advisor"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                Advisor Panel
              </button>
            </div>

            <DesignationManager
              category={designationCategory}
              allMembers={allMembers}
              onRefreshAllData={fetchMembers}
              isAdminUser={user?.role === "admin"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
