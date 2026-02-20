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

export async function getWorkflowSteps(orgId: string, projectTypeCode?: string, clientCode?: string, countryCode?: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("workflow_steps")
    .select("*")
    .eq("organization_id", orgId)
    .order("step_order", { ascending: true });

  if (projectTypeCode) {
    query = query.eq("project_type_code", projectTypeCode);
  }
  if (clientCode !== undefined) {
    query = query.eq("client_code", clientCode);
  }
  if (countryCode !== undefined) {
    query = query.eq("country_code", countryCode);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function upsertWorkflowSteps(
  clientCode: string,
  countryCode: string,
  projectTypeCode: string,
  steps: { action_type_code: string; default_name: string; step_order: number; is_required: boolean }[],
) {
  const auth = await getProfile();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();

  // Delete existing steps for this (client, country, project_type) combination
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("workflow_steps")
    .delete()
    .eq("organization_id", auth.organizationId)
    .eq("client_code", clientCode)
    .eq("country_code", countryCode)
    .eq("project_type_code", projectTypeCode);

  if (steps.length === 0) {
    revalidatePath("/settings/workflows");
    return { data: [], error: null };
  }

  // Insert new steps
  const rows = steps.map((step, i) => ({
    organization_id: auth.organizationId,
    client_code: clientCode,
    country_code: countryCode,
    project_type_code: projectTypeCode,
    action_type_code: step.action_type_code,
    default_name: step.default_name,
    step_order: step.step_order ?? i,
    is_required: step.is_required,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("workflow_steps")
    .insert(rows)
    .select();

  if (!error) revalidatePath("/settings/workflows");
  return { data, error };
}
