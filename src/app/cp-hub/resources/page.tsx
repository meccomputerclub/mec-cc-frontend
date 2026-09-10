import { redirect } from "next/navigation";

export default function ResourcesRedirect() {
  redirect("/cp-hub?tab=resources");
}
