"use client";

import ActivityOverview from "@/components/dashboard/ActivityOverview";
import AdminOverview from "@/components/dashboard/AdminOverview";
import { useAuth } from "@/context/AuthContext";
import React, { useMemo } from "react";
import { FaSpinner } from "react-icons/fa"; // Added spinner for loading
// ----------------------------------------------------------------

export default function DashboardPage() {
  const { user, isLoading, customRole } = useAuth(); // Simplified check: user is authenticated if not loading AND user object exists
  const userRole = customRole || user?.role; // Use useMemo to decide which component to render based on the role and status

  const DashboardComponent = useMemo(() => {
    console.log("entered on usememo"); // 1. Loading State
    if (isLoading) {
      return (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin w-8 h-8 text-indigo-500 mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading user data...</p>
        </div>
      );
    }

    switch (userRole) {
      case "admin":
      case "moderator":
        return <AdminOverview />;

      case "member":
      case "alumni":
      case "guest":
      default:
        return <ActivityOverview />;
    }
  }, [isLoading, userRole]);

  return <div className="space-y-8">{DashboardComponent}</div>;
}
