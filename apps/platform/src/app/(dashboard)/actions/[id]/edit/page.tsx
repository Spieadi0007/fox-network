import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAction } from "@fox/supabase/actions/actions";
import { getProjects } from "@fox/supabase/actions/projects";
import { getLocations } from "@fox/supabase/actions/locations";
import { getOrgMembers } from "@fox/supabase/actions/members";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { getWorkflowSteps } from "@fox/supabase/actions/workflows";
import { ActionForm } from "../../action-form";

export default async function EditActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");

  const { id } = await params;
  const [{ data: action }, { data: projects }, { data: locations }, { data: members }, { data: fieldDefs }, { data: overrides }, { data: fieldOpts }, { data: workflowSteps }] = await Promise.all([
    getAction(id),
    getProjects(user.organizationId),
    getLocations(user.organizationId),
    getOrgMembers(user.organizationId),
    getFieldDefinitions(user.organizationId, "actions"),
    getFieldRequirementOverrides(user.organizationId, "actions"),
    getFieldOptions(user.organizationId),
    getWorkflowSteps(user.organizationId),
  ]);
  if (!action) notFound();

  const canEdit =
    user.role === "admin" ||
    user.role === "manager" ||
    (user.role === "technician" && action.assigned_to === user.id);
  if (!canEdit) redirect("/actions");

  return <ActionForm action={action} projects={projects ?? []} locations={locations ?? []} members={members ?? []} customFieldDefinitions={fieldDefs ?? []} fieldOverrides={overrides ?? []} fieldOptions={fieldOpts ?? []} workflowSteps={workflowSteps ?? []} />;
}
