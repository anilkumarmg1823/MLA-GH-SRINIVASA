import { redirect } from "next/navigation";

/** Leaders directory lives in the admin dashboard now. */
export default function LeadersPage() {
  redirect("/dashboard/leaders");
}
