"use client";
import React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ContentItemCard } from "@/components/dashboard/ContentItemCard";
import { Calendar, ClipboardCheck, Monitor, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ActivityOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
        Hello, {user?.fullName.split(" ")[0]} {user?.fullName.split(" ")[1]}! Your Club Activity
      </h2>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Events Attended"
          value={user?.eventsAttended?.toString() || "0"}
          icon={Calendar}
          colorClass="text-blue-500"
        />
        <DashboardCard
          title="Certificates Earned"
          value="3"
          icon={ClipboardCheck}
          colorClass="text-green-500"
        />
        <DashboardCard
          title="Tutorials Completed"
          value="18"
          icon={Monitor}
          colorClass="text-yellow-500"
        />
        <DashboardCard
          title="Profile Status"
          value={user?.profileStatus}
          icon={user?.profileStatus === "active" ? CheckCircle : CheckCircle}
          colorClass={user?.profileStatus === "active" ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Recent Events & Tutorials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Event Participation
          </h3>
          <ContentItemCard
            title="Annual Robotics Competition"
            date="2025-11-01"
            detail="Participation in the hardware design team."
            status="Completed"
            buttonText="View Score"
            buttonAction={() => alert("Viewing score for e2")}
          />
          <ContentItemCard
            title="Python Fundamentals Crash Course"
            date="2025-09-15"
            detail="Completed all modules and passed final exam."
            status="Completed"
            buttonText="Download Certificate"
            buttonAction={() => alert("Downloading Certificate")}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recommended Tutorials</h3>
          <ContentItemCard
            title="Introduction to Tailwind CSS"
            date="Announcement"
            detail="Learn modern utility-first CSS for fast UI development."
            status="New"
            buttonText="Start Tutorial"
            buttonAction={() => alert("Starting tutorial")}
          />
          <ContentItemCard
            title="Basics of MongoDB"
            date="Tutorial"
            detail="A fundamental guide to NoSQL database management."
            status="Updated"
            buttonText="Continue Learning"
            buttonAction={() => alert("Continuing MongoDB tutorial")}
          />
        </div>
      </div>
    </div>
  );
}
