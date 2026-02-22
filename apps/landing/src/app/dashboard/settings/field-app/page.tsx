import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFieldAppConfigs } from "@fox/supabase/actions/field-app-config";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { FieldAppManager } from "./field-app-manager";

export default async function FieldAppPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard");

  const [{ data: configs }, { data: fieldOptions }] = await Promise.all([
    getFieldAppConfigs(user.organizationId),
    getFieldOptions(user.organizationId, "action_type"),
  ]);

  return (
    <div className="space-y-6 p-8">
      <p className="text-sm text-stone-400">
        Configure what technicians see on action cards and which modules they can interact with in the mobile app. Each service type has its own independent configuration.
      </p>
      <FieldAppManager
        configs={configs ?? []}
        actionTypeOptions={fieldOptions ?? []}
      />
    </div>
  );
}
