"use client";

import { useAuth } from "@/context/AuthContext";
import { ProjectsTab } from "@/components/dashboard/legacy/ProjectsTab";
import { projects as staticProjects } from "@/data/projects";

export default function ProjectsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return <ProjectsTab user={user} projects={staticProjects} />;
}
