import { redirect } from "next/navigation";

export default function AchievementsRedirect() {
  redirect("/cp-hub?tab=achievements");
}
