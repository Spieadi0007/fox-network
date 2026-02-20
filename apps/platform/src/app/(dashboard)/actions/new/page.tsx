import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@fox/supabase/actions/projects";
import { getLocations } from "@fox/supabase/actions/locations";
import { getOrgMembers } from "@fox/supabase/actions/members";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { getWorkflowSteps } from "@fox/supabase/actions/workflows";
import { ActionForm } from "../action-form";

export default async function NewActionPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");
  if (user.role !== "admin" && user.role !== "manager") redirect("/actions");

  const [{ data: projects }, { data: locations }, { data: members }, { data: fieldDefs }, { data: overrides }, { data: fieldOpts }, { data: workflowSteps }] = await Promise.all([
    getProjects(user.organizationId),
    getLocations(user.organizationId),
    getOrgMembers(user.organizationId),
    getFieldDefinitions(user.organizationId, "actions"),
    getFieldRequirementOverrides(user.organizationId, "actions"),
    getFieldOptions(user.organizationId),
    getWorkflowSteps(user.organizationId),
  ]);

  return <ActionForm projects={projects ?? []} locations={locations ?? []} members={members ?? []} customFieldDefinitions={fieldDefs ?? []} fieldOverrides={overrides ?? []} fieldOptions={fieldOpts ?? []} workflowSteps={workflowSteps ?? []} />;
}
