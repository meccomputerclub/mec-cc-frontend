"use client";

import { useAuth } from "@/context/AuthContext";
import { CPArenaTab } from "@/components/dashboard/legacy/CPArenaTab";

export default function CPArenaPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <CPArenaTab
      user={user}
      onEditProfile={() => {
        window.location.href = "/dashboard/profile";
      }}
    />
  );
}
