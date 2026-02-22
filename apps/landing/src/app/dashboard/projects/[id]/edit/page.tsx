import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getProject } from "@fox/supabase/actions/projects";
import { getLocations } from "@fox/supabase/actions/locations";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { ProjectForm } from "../../project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard/projects");

  const { id } = await params;
  const [{ data: project }, { data: locations }, { data: fieldDefs }, { data: overrides }, { data: fieldOpts }] = await Promise.all([
    getProject(id),
    getLocations(user.organizationId),
    getFieldDefinitions(user.organizationId, "projects"),
    getFieldRequirementOverrides(user.organizationId, "projects"),
    getFieldOptions(user.organizationId),
  ]);
  if (!project) notFound();

  return <ProjectForm project={project} locations={locations ?? []} customFieldDefinitions={fieldDefs ?? []} fieldOverrides={overrides ?? []} fieldOptions={fieldOpts ?? []} />;
}
