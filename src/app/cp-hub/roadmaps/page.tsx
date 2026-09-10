import { redirect } from "next/navigation";

export default function RoadmapsRedirect() {
  redirect("/cp-hub?tab=roadmaps");
}
