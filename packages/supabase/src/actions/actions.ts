"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";
import { actionPrefix, nextCode } from "../utils/code-gen";

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

export async function getActions(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("actions")
    .select("*, projects(name), locations(name), assigned_profile:profiles!assigned_to(name, email)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getAction(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("actions")
    .select("*, projects(name)")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function getActionsByProject(projectId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("actions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Retry an insert/update without asset_id if that column doesn't exist yet
// (migration 024 not applied). Keeps action create/update working pre-migration.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMissingAssetColumn(error: any) {
  return (
    error &&
    (error.code === "PGRST204" ||
      (typeof error.message === "string" && error.message.includes("asset_id")))
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAction(values: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  const base = { ...values, organization_id: auth.organizationId, created_by: auth.userId };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data, error } = await (supabase as any)
    .from("actions")
    .insert(base)
    .select()
    .single();

  if (error && isMissingAssetColumn(error) && "asset_id" in base) {
    const { asset_id: _drop, ...rest } = base;
    void _drop;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ data, error } = await (supabase as any)
      .from("actions")
      .insert(rest)
      .select()
      .single());
  }

  if (!error && data) {
    // Look up parent project's code for action code generation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project } = await (supabase as any)
      .from("projects")
      .select("code")
      .eq("id", data.project_id)
      .single();

    if (project?.code && data.action_type) {
      const prefix = actionPrefix(project.code, data.action_type);
      const code = await nextCode(supabase, "actions", auth.organizationId, prefix);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("actions").update({ code }).eq("id", data.id);
      data.code = code;
    }
    revalidatePath("/actions");
  }
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAction(id: string, values: Record<string, any>) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data, error } = await (supabase as any)
    .from("actions")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error && isMissingAssetColumn(error) && "asset_id" in values) {
    const { asset_id: _drop, ...rest } = values;
    void _drop;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ data, error } = await (supabase as any)
      .from("actions")
      .update(rest)
      .eq("id", id)
      .select()
      .single());
  }
  if (!error) {
    revalidatePath("/actions");
    revalidatePath(`/actions/${id}`);
  }
  return { data, error };
}

export async function deleteAction(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("actions")
    .delete()
    .eq("id", id);
  if (!error) revalidatePath("/actions");
  return { error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function bulkUpdateActions(ids: string[], updates: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("actions")
    .update(updates)
    .in("id", ids)
    .eq("organization_id", auth.organizationId);
  if (!error) revalidatePath("/actions");
  return { error };
}

export async function bulkDeleteActions(ids: string[]) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("actions")
    .delete()
    .in("id", ids)
    .eq("organization_id", auth.organizationId);
  if (!error) revalidatePath("/actions");
  return { error };
}
