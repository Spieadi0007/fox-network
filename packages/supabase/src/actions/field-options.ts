"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";

async function getProfile() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single<{ organization_id: string | null }>();
  return { userId: user.id, organizationId: profile?.organization_id ?? null };
}

export async function getFieldOptions(orgId: string, fieldKey?: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("configurable_field_options")
    .select("*")
    .eq("organization_id", orgId)
    .order("sort_order", { ascending: true });

  if (fieldKey) {
    query = query.eq("field_key", fieldKey);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function upsertFieldOptions(
  fieldKey: string,
  options: { label: string; code: string; sort_order: number }[],
) {
  const auth = await getProfile();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();

  // Delete existing options for this field_key
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("configurable_field_options")
    .delete()
    .eq("organization_id", auth.organizationId)
    .eq("field_key", fieldKey);

  if (options.length === 0) {
    revalidatePath("/settings/field-options");
    return { data: [], error: null };
  }

  // Insert new options
  const rows = options.map((opt, i) => ({
    organization_id: auth.organizationId,
    field_key: fieldKey,
    label: opt.label,
    code: opt.code,
    sort_order: opt.sort_order ?? i,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("configurable_field_options")
    .insert(rows)
    .select();

  if (!error) revalidatePath("/settings/field-options");
  return { data, error };
}

export async function deleteFieldOption(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("configurable_field_options")
    .delete()
    .eq("id", id);

  if (!error) revalidatePath("/settings/field-options");
  return { error };
}
