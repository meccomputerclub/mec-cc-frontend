import React from "react";

interface ContentItemCardProps {
  title: string;
  date: string;
  detail: string;
  status: string;
  buttonText: string;
  buttonAction: () => void;
}

export const ContentItemCard: React.FC<ContentItemCardProps> = ({
  title,
  date,
  detail,
  status,
  buttonText,
  buttonAction,
}) => (
  <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
    <div className="flex justify-between items-start">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 truncate">{title}</h3>
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${status === "Upcoming"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            : status === "Completed"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              : status === "New"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
          }`}
      >
        {status}
      </span>
    </div>
    <p className="text-gray-500 dark:text-gray-400 text-sm">{date}</p>
    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{detail}</p>
    <button
      onClick={buttonAction}
      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
    >
      {buttonText}
    </button>
  </div>
);
