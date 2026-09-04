import { redirect } from "next/navigation";

// The marketing site moved to apps/web, so this app's root is no longer a
// page — it is a doorway. Sign-in is the right landing spot for everyone:
// middleware already sends an authenticated visitor on to their own home
// (/dashboard, /client/dashboard or /technician) from here.
export default function Root() {
  redirect("/signin");
}
