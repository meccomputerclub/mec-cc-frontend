import { redirect } from "next/navigation";

export default function ProblemSetsRedirect() {
  redirect("/cp-hub?tab=problem-sets");
}
