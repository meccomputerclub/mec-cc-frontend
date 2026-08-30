import React from "react";
import { Loader2, ShieldCheck } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Verifying access...",
  subMessage = "Please wait while we secure your session",
}) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500
                    bg-slate-50 dark:bg-slate-950"
    >
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full 
                        bg-blue-400/10 dark:bg-blue-600/5 blur-[120px]"
        />
        <div
          className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full 
                        bg-purple-400/10 dark:bg-purple-600/5 blur-[120px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main Loading Icon Container */}
        <div className="relative mb-8">
          {/* Outer Rotating Ring */}
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin opacity-20" />

          {/* Inner Static Icon with Pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse blur-md opacity-50 absolute" />
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 relative" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2 px-6">
          <h2
            className="text-xl font-semibold tracking-tight 
                         text-slate-800 dark:text-slate-100"
          >
            {message}
          </h2>
          <p
            className="text-sm font-medium 
                        text-slate-500 dark:text-slate-400"
          >
            {subMessage}
          </p>
        </div>

        {/* Progress Bar (Indeterminate) */}
        <div className="mt-8 w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="w-full h-full bg-blue-500 origin-left animate-[loading-bar_1.5s_infinite_ease-in-out]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
