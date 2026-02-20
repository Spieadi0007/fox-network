import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { LocationForm } from "../location-form";

export default async function NewLocationPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");
  if (user.role !== "admin" && user.role !== "manager") redirect("/locations");

  const [{ data: fieldDefs }, { data: overrides }, { data: fieldOpts }] = await Promise.all([
    getFieldDefinitions(user.organizationId, "locations"),
    getFieldRequirementOverrides(user.organizationId, "locations"),
    getFieldOptions(user.organizationId),
  ]);

  return <LocationForm customFieldDefinitions={fieldDefs ?? []} fieldOverrides={overrides ?? []} fieldOptions={fieldOpts ?? []} />;
}
