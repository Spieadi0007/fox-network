import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { CustomFieldsManager } from "./custom-fields-manager";

export default async function CustomFieldsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard");

  const [{ data: definitions }, { data: overrides }] = await Promise.all([
    getFieldDefinitions(user.organizationId),
    getFieldRequirementOverrides(user.organizationId),
  ]);

  return (
    <div className="space-y-6 p-8">
      <p className="text-sm text-stone-400">Define custom fields for each module. These fields appear in create/edit forms and detail views.</p>
      <CustomFieldsManager definitions={definitions ?? []} overrides={overrides ?? []} />
    </div>
  );
}
