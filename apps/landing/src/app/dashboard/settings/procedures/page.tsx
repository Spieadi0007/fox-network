import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { getProcedureTemplates } from "@fox/supabase/actions/procedures";
import { ProceduresManager } from "./procedures-manager";

export default async function ProceduresPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard");

  const [{ data: templates }, { data: fieldOptions }] = await Promise.all([
    getProcedureTemplates(user.organizationId),
    getFieldOptions(user.organizationId, "action_type"),
  ]);

  return (
    <div className="space-y-6 p-8">
      <p className="text-sm text-stone-400">
        Upload a client&rsquo;s SOP and we&rsquo;ll turn its procedure into the
        steps a technician works through on site. Completing those steps
        produces the service report, so review the wording before publishing.
      </p>
      <ProceduresManager
        templates={templates ?? []}
        actionTypeOptions={fieldOptions ?? []}
      />
    </div>
  );
}
