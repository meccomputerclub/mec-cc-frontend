"use client";
import React from "react";
import { MOCK_ASSETS } from "@/data/mockData";

export default function AssetsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-semibold text-text-primary border-b pb-3 border-border-default">
        Club Asset Inventory
      </h2>
      <div className="overflow-x-auto bg-surface-elevated rounded-xl shadow-[4px_4px_0px_0px_var(--border-default)] border border-border-default">
        <table className="min-w-full divide-y divide-border-default">
          <thead className="bg-surface-secondary border-b border-border-default">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-default">
                Asset Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-default">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border-default">
                Borrower
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {MOCK_ASSETS.map((asset) => (
              <tr key={asset.id} className="hover:bg-surface-secondary">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary border-r border-border-default">
                  {asset.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-r border-border-default">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${asset.status === "Available"
                        ? "bg-accent-success text-surface-elevated"
                        : "bg-accent-error text-surface-elevated"
                      }`}
                  >
                    {asset.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-semibold border-r border-border-default">
                  {asset.borrower || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  {asset.status === "In Use" ? (
                    <button className="text-accent-success hover:underline transition mr-3">
                      Return
                    </button>
                  ) : (
                    <button className="text-text-primary hover:underline transition mr-3">
                      Check Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
