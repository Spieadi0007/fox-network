import { redirect } from "next/navigation";

// Library is a section with two halves and no landing page of its own.
// Anyone arriving at the bare path — an old link, the sidebar parent — goes
// to the documents, which is the half that existed first.
export default function LibraryIndex() {
  redirect("/client/library/sops");
}
