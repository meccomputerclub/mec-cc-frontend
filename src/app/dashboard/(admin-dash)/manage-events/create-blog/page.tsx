"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateBlogRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/blogs");
  }, [router]);

  return null;
}
