"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Search, Filter, MoreVertical } from "lucide-react";
import axios from "axios";
import LoadingScreen from "../ui/shared/LoadingScreen";

interface Application {
  _id: string;
  fullName: string;
  email: string;
  updatedAt: string;
  role: string;
  applicationStatus: "pending" | "approved" | "rejected";
}

const AdminPendingPage = () => {
  const [applications, setApplications] = useState<Application[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/members`,
          {
            filter: {
              property: "applicationStatus",
              value: "pending",
            },
            fields: "_id fullName email updatedAt role applicationStatus",
          },
          {
            withCredentials: true,
          }
        );
        const data = response.data.data;
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingApplications();
  }, []);

  const handleAction = async (id: string, action: "approved" | "rejected", reason?: string) => {
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/application-status/${id}`,
        {
          status: action,
          reason,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        const updatedApplications = applications?.filter((application) => application._id !== id);
        setApplications(updatedApplications);
        console.log("Application status updated successfully", res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">All caught up!</h3>
        <p className="text-slate-500">No pending applications to review.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
              Pending Approvals
              <span className="text-sm font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full">
                {applications.length} New
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Review and manage new user registrations.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm w-full md:w-64"
              />
            </div>
            <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table/List Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Applied On</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {applications.map((app) => (
                <tr
                  key={app._id}
                  className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-semibold">
                        {app.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {app.fullName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {app.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {app.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(app.updatedAt).toDateString().split(" ").slice(1).join(" ")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${app.applicationStatus === "pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {app.applicationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <button
                        onClick={() => handleAction(app._id, "rejected")}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                        title="Reject Application"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleAction(app._id, "approved")}
                        className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-all"
                        title="Approve Application"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-500 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPendingPage;
