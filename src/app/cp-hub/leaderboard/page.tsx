import { redirect } from "next/navigation";

export default function LeaderboardRedirect() {
  redirect("/cp-hub?tab=leaderboard");
}
