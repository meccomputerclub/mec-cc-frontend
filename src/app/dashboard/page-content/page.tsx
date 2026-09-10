"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PageContentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/page-editor?tab=content");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 space-y-4">
      <RefreshCw className="w-8 h-8 animate-spin text-accent-primary" />
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-text-primary">
          Page Content has moved
        </h2>
        <p className="text-sm text-text-secondary">
          Redirecting you to the unified Page Editor...
        </p>
      </div>
      <Link
        href="/dashboard/page-editor?tab=content"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-accent-primary text-white hover:bg-accent-primary-hover shadow-[2px_2px_0px_var(--border-brutalist)] transition-all"
      >
        Go to Page Editor <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
