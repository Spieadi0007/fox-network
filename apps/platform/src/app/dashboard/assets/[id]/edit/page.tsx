import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAsset } from "@fox/supabase/actions/assets";
import { getLocations } from "@fox/supabase/actions/locations";
import { getOrgMembers } from "@fox/supabase/actions/members";
import { getFieldDefinitions, getFieldRequirementOverrides } from "@fox/supabase/actions/custom-fields";
import { getFieldOptions } from "@fox/supabase/actions/field-options";
import { AssetForm } from "../../asset-form";

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");
  if (user.role !== "admin" && user.role !== "manager") redirect("/dashboard/assets");

  const { id } = await params;
  const [{ data: asset }, { data: locations }, { data: members }, { data: fieldDefs }, { data: overrides }, { data: fieldOpts }] = await Promise.all([
    getAsset(id),
    getLocations(user.organizationId),
    getOrgMembers(user.organizationId),
    getFieldDefinitions(user.organizationId, "assets"),
    getFieldRequirementOverrides(user.organizationId, "assets"),
    getFieldOptions(user.organizationId),
  ]);
  if (!asset) notFound();

  return <AssetForm asset={asset} locations={locations ?? []} members={members ?? []} customFieldDefinitions={fieldDefs ?? []} fieldOverrides={overrides ?? []} fieldOptions={fieldOpts ?? []} />;
}
