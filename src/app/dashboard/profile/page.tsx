"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, UserCheck } from "lucide-react";

export default function DashboardProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?tab=edit-profile");
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="bg-surface-elevated border-2 border-border-brutalist dark:border-border-default rounded-xl shadow-[4px_4px_0px_0px_var(--border-brutalist)] dark:shadow-[4px_4px_0px_0px_var(--border-default)] p-8 space-y-4">
        <div className="w-14 h-14 rounded-full bg-accent-primary/20 border-2 border-accent-primary flex items-center justify-center mx-auto text-accent-primary">
          <UserCheck size={28} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-text-primary font-heading m-0">
          Redirecting to Profile Settings...
        </h2>
        <p className="text-sm text-text-secondary font-body max-w-md mx-auto">
          We have upgraded to the unified Neo-Brutalist profile manager featuring Skills, Experience Ladder, and Higher Education history.
        </p>
        <div className="pt-2">
          <Link
            href="/profile?tab=edit-profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-accent-primary-text font-bold text-sm rounded-md border border-black shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Open Profile Settings <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
