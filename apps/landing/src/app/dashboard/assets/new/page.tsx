import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocations } from "@fox/supabase/actions/locations";
import { getOrgMembers } from "@fox/supabase/actions/members";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { AssetForm } from "../asset-form";

export default async function NewAssetPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard/assets");

  const [{ data: locations }, { data: members }, { data: fieldDefs }, { data: overrides }, { data: fieldOpts }] = await Promise.all([
    getLocations(user.organizationId),
    getOrgMembers(user.organizationId),
    getFieldDefinitions(user.organizationId, "assets"),
    getFieldRequirementOverrides(user.organizationId, "assets"),
    getFieldOptions(user.organizationId),
  ]);

  return <AssetForm locations={locations ?? []} members={members ?? []} customFieldDefinitions={fieldDefs ?? []} fieldOverrides={overrides ?? []} fieldOptions={fieldOpts ?? []} />;
}
