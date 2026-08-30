"use client";

import { ArrowRightCircleIcon, HomeIcon, ShieldAlert } from "lucide-react";
import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div
      className="
      min-h-screen flex flex-col items-center justify-center 
      bg-gradient-to-br from-blue-50 to-blue-100 
      dark:from-gray-900 dark:to-gray-800
      px-4
    "
    >
      <div
        className="
        w-full max-w-md 
        bg-white dark:bg-gray-900 
        p-8 rounded-xl shadow-xl border 
        border-gray-200 dark:border-gray-700
      "
      >
        {/* Icon Area */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400">
            <ShieldAlert className="w-16 h-16" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-white">
          Access Denied
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          You do not have the required permissions to view this page. Please log in or return to the
          homepage.
        </p>

        {/* --- Buttons --- */}
        <div className="flex flex-col space-y-4">
          {/* Primary Button: Log In */}
          <Link
            href={"/login"}
            className="
              bg-blue-600 dark:bg-blue-700 
              text-white py-2 rounded-md 
              hover:bg-blue-700 dark:hover:bg-blue-800 
              transition flex items-center justify-center font-semibold
            "
          >
            <ArrowRightCircleIcon className="w-5 h-5 mr-2" />
            Log In
          </Link>

          {/* Secondary Button: Back to Home */}
          <Link
            href={"/"}
            className="
              text-gray-700 dark:text-gray-300 
              bg-gray-100 dark:bg-gray-800 
              py-2 rounded-md 
              hover:bg-gray-200 dark:hover:bg-gray-700 
              transition flex items-center justify-center border border-gray-300 dark:border-gray-700 font-semibold
            "
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Links / Contact Info */}
        <div className="mt-6 text-center space-y-2">
          <Link
            href="/contact-us"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Need assistance or access? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
