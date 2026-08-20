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

export async function getFieldAppConfigs(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("field_app_config")
    .select("*")
    .eq("organization_id", orgId)
    .order("action_type_code", { ascending: true });

  return { data, error };
}

export async function upsertFieldAppConfig(
  actionTypeCode: string,
  config: {
    card_fields: { key: string; group: string }[];
    detail_fields: { key: string; group: string }[];
    enabled_modules: Record<string, boolean>;
    display_mode: "cards" | "details";
  },
) {
  const auth = await getProfile();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();

  // Single upsert on the (organization_id, action_type_code) unique
  // constraint. This used to delete then insert, which is not atomic: if the
  // insert failed, the org was left with no config row at all and the
  // technician app silently fell back to hardcoded defaults.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("field_app_config")
    .upsert(
      {
        organization_id: auth.organizationId,
        action_type_code: actionTypeCode,
        card_fields: config.card_fields,
        detail_fields: config.detail_fields,
        enabled_modules: config.enabled_modules,
        display_mode: config.display_mode,
      },
      { onConflict: "organization_id,action_type_code" },
    )
    .select()
    .single();

  if (!error) revalidatePath("/dashboard/settings/field-app");
  return { data, error };
}
