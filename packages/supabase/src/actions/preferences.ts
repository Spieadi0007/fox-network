"use server";

import { createServerClient } from "../client/server";

async function getAuthUserId() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function getAuthUserWithOrg() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    organizationId: profile?.organization_id as string | null,
    role: profile?.role as string | null,
  };
}

export async function getTablePreferences(module: string) {
  const userId = await getAuthUserId();
  if (!userId) return { data: null, error: null };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("user_table_preferences")
    .select("column_config")
    .eq("user_id", userId)
    .eq("module", module)
    .single();

  return { data: data?.column_config ?? null, error };
}

export async function saveTablePreferences(
  module: string,
  columnConfig: { key: string; visible: boolean }[]
) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_table_preferences")
    .upsert(
      { user_id: userId, module, column_config: columnConfig },
      { onConflict: "user_id,module" }
    );

  return { error };
}

// ---------- Saved Views ----------

const MAX_SAVED_VIEWS = 7;
const MAX_SHARED_VIEWS = 7;

const VIEW_SELECT = "id, name, column_config, sort_config, filter_config, display_order, search_text, is_shared, is_preferred, user_id, organization_id";

export async function getSavedViews(module: string) {
  const authUser = await getAuthUserWithOrg();
  if (!authUser) return { data: [], error: null };

  const supabase = await createServerClient();

  // RLS handles the filtering: own views + shared views from same org
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("user_saved_views")
    .select(VIEW_SELECT)
    .eq("module", module)
    .or(`user_id.eq.${authUser.userId},and(is_shared.eq.true,organization_id.eq.${authUser.organizationId})`)
    .order("display_order", { ascending: true });

  return {
    data: (data ?? []).map((v: Record<string, unknown>) => ({
      ...v,
      created_by_id: v.user_id,
    })),
    error,
  };
}

export async function createSavedView(
  module: string,
  name: string,
  config: {
    column_config: { key: string; visible: boolean }[];
    sort_config: { key: string; direction: "asc" | "desc" } | null;
    filter_config: {
      conditions: { field: string; operator: string; value: string }[];
      conjunction: "and" | "or";
    } | null;
    search_text?: string;
  }
) {
  const userId = await getAuthUserId();
  if (!userId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();

  // Check count (personal views only)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from("user_saved_views")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("module", module)
    .eq("is_shared", false);

  if (count != null && count >= MAX_SAVED_VIEWS) {
    return { data: null, error: { message: `Maximum of ${MAX_SAVED_VIEWS} saved views reached` } };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("user_saved_views")
    .insert({
      user_id: userId,
      module,
      name,
      column_config: config.column_config,
      sort_config: config.sort_config,
      filter_config: config.filter_config,
      search_text: config.search_text ?? "",
      display_order: (count ?? 0),
    })
    .select(VIEW_SELECT)
    .single();

  return {
    data: data ? { ...data, created_by_id: data.user_id } : null,
    error,
  };
}

export async function createSharedView(
  module: string,
  name: string,
  config: {
    column_config: { key: string; visible: boolean }[];
    sort_config: { key: string; direction: "asc" | "desc" } | null;
    filter_config: {
      conditions: { field: string; operator: string; value: string }[];
      conjunction: "and" | "or";
    } | null;
    search_text?: string;
  }
) {
  const authUser = await getAuthUserWithOrg();
  if (!authUser) return { data: null, error: { message: "Not authenticated" } };
  if (!authUser.organizationId) return { data: null, error: { message: "No organization" } };
  if (authUser.role !== "admin" && authUser.role !== "manager") {
    return { data: null, error: { message: "Only admins and managers can create shared views" } };
  }

  const supabase = await createServerClient();

  // Check shared view count for this org + module
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from("user_saved_views")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", authUser.organizationId)
    .eq("module", module)
    .eq("is_shared", true);

  if (count != null && count >= MAX_SHARED_VIEWS) {
    return { data: null, error: { message: `Maximum of ${MAX_SHARED_VIEWS} shared views per module reached` } };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("user_saved_views")
    .insert({
      user_id: authUser.userId,
      module,
      name,
      column_config: config.column_config,
      sort_config: config.sort_config,
      filter_config: config.filter_config,
      search_text: config.search_text ?? "",
      is_shared: true,
      organization_id: authUser.organizationId,
      display_order: (count ?? 0),
    })
    .select(VIEW_SELECT)
    .single();

  return {
    data: data ? { ...data, created_by_id: data.user_id } : null,
    error,
  };
}

export async function updateSavedView(
  id: string,
  config: {
    name?: string;
    column_config: { key: string; visible: boolean }[];
    sort_config: { key: string; direction: "asc" | "desc" } | null;
    filter_config: {
      conditions: { field: string; operator: string; value: string }[];
      conjunction: "and" | "or";
    } | null;
    search_text?: string;
  }
) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: Record<string, unknown> = {
    column_config: config.column_config,
    sort_config: config.sort_config,
    filter_config: config.filter_config,
    search_text: config.search_text ?? "",
  };
  if (config.name !== undefined) {
    updatePayload.name = config.name;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_saved_views")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId);

  return { error };
}

export async function renameSavedView(id: string, newName: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_saved_views")
    .update({ name: newName })
    .eq("id", id)
    .eq("user_id", userId);

  return { error };
}

export async function setPreferredView(module: string, viewId: string | null) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();

  // Clear all preferred flags for this user+module
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("user_saved_views")
    .update({ is_preferred: false })
    .eq("user_id", userId)
    .eq("module", module);

  // Set the new preferred view
  if (viewId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("user_saved_views")
      .update({ is_preferred: true })
      .eq("id", viewId)
      .eq("user_id", userId);
  }

  return { error: null };
}

export async function reorderSavedViews(
  viewOrders: { id: string; display_order: number }[]
) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await Promise.all(
    viewOrders.map(({ id, display_order }) =>
      (supabase as any)
        .from("user_saved_views")
        .update({ display_order })
        .eq("id", id)
        .eq("user_id", userId)
    )
  );

  return { error: null };
}

export async function deleteSavedView(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_saved_views")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  return { error };
}
