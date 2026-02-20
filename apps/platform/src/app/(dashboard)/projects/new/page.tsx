import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocations } from "@fox/supabase/actions/locations";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { ProjectForm } from "../project-form";

export default async function NewProjectPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");
  if (user.role !== "admin" && user.role !== "manager") redirect("/projects");

  const [{ data: locations }, { data: fieldDefs }, { data: overrides }, { data: fieldOpts }] = await Promise.all([
    getLocations(user.organizationId),
    getFieldDefinitions(user.organizationId, "projects"),
    getFieldRequirementOverrides(user.organizationId, "projects"),
    getFieldOptions(user.organizationId),
  ]);

  return <ProjectForm locations={locations ?? []} customFieldDefinitions={fieldDefs ?? []} fieldOverrides={overrides ?? []} fieldOptions={fieldOpts ?? []} />;
}
