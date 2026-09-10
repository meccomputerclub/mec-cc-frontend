"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateProjectRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/manage-projects");
  }, [router]);

  return null;
}
