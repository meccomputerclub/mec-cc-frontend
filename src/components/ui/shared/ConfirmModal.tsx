// components/modals/ConfirmationModal.tsx
import React from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  // Optional: Use a specific color for the confirm button
  confirmColor?: "red" | "green" | "blue";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  confirmColor = "red",
}) => {
  if (!isOpen) return null;

  const baseClasses =
    "py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center";
  let confirmClasses;

  switch (confirmColor) {
    case "red":
      confirmClasses = "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400";
      break;
    case "green":
      confirmClasses = "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400";
      break;
    case "blue":
    default:
      confirmClasses = "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400";
      break;
  }

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 pt-20 bg-gray-900/80 backdrop-blur-sm transition-opacity">
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 transform transition-all border border-gray-200 dark:border-gray-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <AlertTriangle
              className={`w-6 h-6 mr-3 ${confirmColor === "red" ? "text-red-500" : "text-blue-500"
                }`}
            />
            <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 text-gray-700 dark:text-gray-300 space-y-4">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        {/* Footer / Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className={`${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${baseClasses} ${confirmClasses}`}
          >
            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
