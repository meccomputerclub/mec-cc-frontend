import { redirect } from "next/navigation";

export default function MentorSessionsRedirect() {
  redirect("/cp-hub?tab=mentor-sessions");
}
