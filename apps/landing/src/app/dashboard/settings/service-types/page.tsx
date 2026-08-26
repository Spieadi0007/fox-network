import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServiceTypes } from "@fox/supabase/actions/service-types";
import { getFieldAppConfigs } from "@fox/supabase/actions/field-app-config";
import { getProcedureTemplates } from "@fox/supabase/actions/procedures";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { ServiceTypesManager } from "./service-types-manager";

export default async function ServiceTypesPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard");

  const [{ data: types }, { data: configs }, { data: templates }, { data: options }] =
    await Promise.all([
      getServiceTypes(user.organizationId),
      getFieldAppConfigs(user.organizationId),
      getProcedureTemplates(user.organizationId),
      getFieldOptions(user.organizationId, "action_type"),
    ]);

  return (
    <div className="space-y-6 p-8">
      <p className="text-sm text-stone-400">
        Each kind of job a technician does. A service type holds what they see
        on screen, what they record, and the procedure they work through.
        Importing a client&rsquo;s SOP fills all three at once.
      </p>
      <ServiceTypesManager
        types={types ?? []}
        configs={configs ?? []}
        templates={templates ?? []}
        actionTypeOptions={options ?? []}
      />
    </div>
  );
}
