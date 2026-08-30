// "use client";
// import { useEffect } from "react";

// export type Toast = { message: string; type: "success" | "error" | "info" };

// const ToastNotification: React.FC<{ toast: Toast | null; setToast: (t: Toast | null) => void }> = ({
//   toast,
//   setToast,
// }) => {
//   useEffect(() => {
//     if (toast) {
//       // Auto-hide the toast after 5 seconds
//       const timer = setTimeout(() => {
//         setToast(null);
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [toast, setToast]);

//   if (!toast) return null;

//   let bgColor = "";
//   let icon = "";
//   let title = "";

//   switch (toast.type) {
//     case "success":
//       bgColor = "bg-green-500";
//       icon = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
//       title = "Success";
//       break;
//     case "error":
//       bgColor = "bg-red-500";
//       icon = "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z";
//       title = "Error";
//       break;
//     case "info":
//       bgColor = "bg-blue-500";
//       icon = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
//       title = "Information";
//       break;
//   }

//   return (
//     <div className="fixed bottom-5 right-5 z-50">
//       <div
//         className={`flex items-center ${bgColor} text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-xl`}
//         role="alert"
//       >
//         <svg
//           className="fill-current w-4 h-4 mr-2"
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 20 20"
//         >
//           <path d={icon} />
//         </svg>
//         <div>
//           <p className="font-semibold">{title}</p>
//           <p className="font-normal text-xs">{toast.message}</p>
//         </div>
//         <button
//           onClick={() => setToast(null)}
//           className="ml-4 -mr-2 p-1 rounded-full hover:bg-white/20 transition-colors"
//         >
//           <svg
//             className="w-3 h-3 fill-current"
//             viewBox="0 0 20 20"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ToastNotification;

"use client";
import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export interface Toast {
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface ToastNotificationProps {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose: () => void;
  duration?: number; // Auto-close duration in milliseconds (default: 5000)
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  type,
  message,
  onClose,
  duration = 3000,
}) => {
  // Auto-close toast after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  // Colors based on type
  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300";
      case "error":
        return "bg-red-50 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300";
      case "info":
        return "bg-blue-50 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300";
      default:
        return "bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div
        className={`flex items-start max-w-md w-full px-4 py-3 rounded-lg shadow-lg border ${getColorClasses()}`}
      >
        {/* Icon */}
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>

        {/* Message */}
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-medium">{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;

// Optional: Add animation styles to your global CSS
// Add this to your globals.css or tailwind.config.js:
/*
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
*/
