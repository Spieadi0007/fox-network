import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { FieldOptionsManager } from "./field-options-manager";

export default async function FieldOptionsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard");

  const { data: options } = await getFieldOptions(user.organizationId);

  return (
    <div className="space-y-6 p-8">
      <p className="text-sm text-stone-400">Configure which options appear in Country, Timezone, and Category dropdowns. If none are configured, default options are used.</p>
      <FieldOptionsManager options={options ?? []} />
    </div>
  );
}
