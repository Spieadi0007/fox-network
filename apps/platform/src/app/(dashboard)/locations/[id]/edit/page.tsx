import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getLocation } from "@fox/supabase/actions/locations";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { LocationForm } from "../../location-form";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");
  if (user.role !== "admin" && user.role !== "manager") redirect("/locations");

  const { id } = await params;
  const [{ data: location }, { data: fieldDefs }, { data: overrides }, { data: fieldOpts }] = await Promise.all([
    getLocation(id),
    getFieldDefinitions(user.organizationId, "locations"),
    getFieldRequirementOverrides(user.organizationId, "locations"),
    getFieldOptions(user.organizationId),
  ]);
  if (!location) notFound();

  return <LocationForm location={location} customFieldDefinitions={fieldDefs ?? []} fieldOverrides={overrides ?? []} fieldOptions={fieldOpts ?? []} />;
}
