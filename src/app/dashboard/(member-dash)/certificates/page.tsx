"use client";
import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface ValidationResult {
  status: "success" | "error";
  recipient?: string;
  event?: string;
  date?: string;
  message?: string;
}

export default function CertificatesPage() {
  const [certCode, setCertCode] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationResult(null);

    if (certCode.length < 8) {
      setValidationResult({ status: "error", message: "Code must be at least 8 digits." });
      return;
    }

    // Mock validation logic
    if (certCode.startsWith("MEC")) {
      setValidationResult({
        status: "success",
        recipient: "Bob Smith",
        event: "Web Dev Workshop 2025",
        date: "2025-12-10",
      });
    } else {
      setValidationResult({ status: "error", message: "Invalid or expired certificate code." });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">
        Certificate and Activity Validation
      </h2>

      {/* Public/Guest Validation Form */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-lg mx-auto">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Validate a Certificate (Public Feature)
        </h3>
        <form onSubmit={handleValidate} className="space-y-4">
          <input
            type="text"
            value={certCode}
            onChange={(e) => setCertCode(e.target.value.toUpperCase())}
            placeholder="Enter Certificate Code (e.g., MEC12345)"
            className="w-full border rounded-md px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-400 dark:focus:ring-blue-600 outline-none transition"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Validate Code
          </button>
        </form>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div
          className={`p-6 rounded-xl shadow-lg max-w-lg mx-auto ${validationResult.status === "success"
              ? "bg-green-50 dark:bg-green-900/50 border border-green-300 dark:border-green-700"
              : "bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700"
            }`}
        >
          <div className="flex items-center">
            {validationResult.status === "success" ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 mr-3" />
            )}
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
              {validationResult.status === "success"
                ? "Validation Successful!"
                : "Validation Failed"}
            </h4>
          </div>
          {validationResult.status === "success" ? (
            <ul className="mt-3 text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Recipient:</strong> {validationResult.recipient}
              </li>
              <li>
                <strong>Event:</strong> {validationResult.event}
              </li>
              <li>
                <strong>Date Issued:</strong> {validationResult.date}
              </li>
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              {validationResult.message}
            </p>
          )}
        </div>
      )}

      {/* Member's Own Certificates (Only visible to logged-in members) */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          My Earned Certificates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white">
              Certificate: Python Fundamentals
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Issued: 2025-09-20</p>
            <button className="mt-2 text-sm text-blue-600 hover:underline">Download PDF</button>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white">
              Certificate: Robotics Competition
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Issued: 2025-11-05</p>
            <button className="mt-2 text-sm text-blue-600 hover:underline">Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
