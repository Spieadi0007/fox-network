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

export async function getFieldDefinitions(orgId: string, module?: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("custom_field_definitions")
    .select("*")
    .eq("organization_id", orgId)
    .order("display_order", { ascending: true });

  if (module) {
    query = query.eq("module", module);
  }

  const { data, error } = await query;
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createFieldDefinition(values: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("custom_field_definitions")
    .insert({ ...values, organization_id: auth.organizationId })
    .select()
    .single();

  if (!error) revalidatePath("/settings/custom-fields");
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateFieldDefinition(id: string, values: Record<string, any>) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("custom_field_definitions")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (!error) revalidatePath("/settings/custom-fields");
  return { data, error };
}

export async function deleteFieldDefinition(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("custom_field_definitions")
    .delete()
    .eq("id", id);

  if (!error) revalidatePath("/settings/custom-fields");
  return { error };
}

export async function getFieldRequirementOverrides(orgId: string, module?: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("field_requirement_overrides")
    .select("*")
    .eq("organization_id", orgId);

  if (module) {
    query = query.eq("module", module);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function upsertFieldRequirementOverride(
  module: string,
  field_name: string,
  required: boolean,
) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("field_requirement_overrides")
    .upsert(
      {
        organization_id: auth.organizationId,
        module,
        field_name,
        required,
      },
      { onConflict: "organization_id,module,field_name" },
    )
    .select()
    .single();

  if (!error) revalidatePath("/settings/custom-fields");
  return { data, error };
}
