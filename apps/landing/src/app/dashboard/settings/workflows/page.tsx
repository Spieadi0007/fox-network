import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { getWorkflowSteps } from "@fox/supabase/actions/workflows";
import { WorkflowManager } from "./workflow-manager";

export default async function WorkflowsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/dashboard");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard");

  const [{ data: fieldOptions }, { data: workflowSteps }] = await Promise.all([
    getFieldOptions(user.organizationId),
    getWorkflowSteps(user.organizationId),
  ]);

  return (
    <div className="space-y-6 p-8">
      <p className="text-sm text-stone-400">
        Define action templates scoped by client, country, and project type. When a project is created, matching templates automatically generate actions. Country-specific templates take priority over &ldquo;All Countries&rdquo; templates.
      </p>
      <WorkflowManager
        fieldOptions={fieldOptions ?? []}
        workflowSteps={workflowSteps ?? []}
      />
    </div>
  );
}
