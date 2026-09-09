"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProjectsTab } from "@/components/dashboard/legacy/ProjectsTab";
import { projects as staticProjects } from "@/data/projects";
import { api } from "@/lib/api";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>(staticProjects);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>("/api/projects");
        if (res?.data && res.data.length > 0) {
          setProjects(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch user projects, using static fallback:", err);
      }
    }
    load();
  }, []);

  if (!user) return null;

  return <ProjectsTab user={user} projects={projects} />;
}
