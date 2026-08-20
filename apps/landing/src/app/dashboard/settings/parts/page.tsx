import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getParts } from "@fox/supabase/actions/parts";
import { PartsManager } from "./parts-manager";

export default async function PartsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard");

  const { data: parts } = await getParts(user.organizationId, true);

  return (
    <div className="space-y-6 p-8">
      <p className="text-sm text-stone-400">
        Spare parts technicians can log against a visit. Importing an SOP
        offers to add any parts it names, so this usually fills itself.
      </p>
      <PartsManager parts={parts ?? []} />
    </div>
  );
}
