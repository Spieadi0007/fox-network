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
    .select("organization_id, role")
    .eq("id", user.id)
    .single<{ organization_id: string | null; role: string }>();
  return {
    userId: user.id,
    organizationId: profile?.organization_id ?? null,
    role: profile?.role ?? "viewer",
  };
}

/** Get all entries for a specific action */
export async function getActionEntries(actionId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("action_entries")
    .select("*, technician:profiles!technician_id(name, email, avatar_url)")
    .eq("action_id", actionId)
    .order("visit_number", { ascending: true });
  return { data, error };
}

/** Get a single entry by ID */
export async function getActionEntry(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("action_entries")
    .select("*, technician:profiles!technician_id(name, email, avatar_url), actions(name, code, action_type)")
    .eq("id", id)
    .single();
  return { data, error };
}

/** Create a new field visit entry */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createActionEntry(values: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("action_entries")
    .insert({
      ...values,
      organization_id: auth.organizationId,
      technician_id: values.technician_id ?? auth.userId,
    })
    .select("*, technician:profiles!technician_id(name, email)")
    .single();

  if (!error && data) {
    // If this entry is successful, mark the parent action as completed
    if (data.outcome === "successful") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("actions")
        .update({ status: "completed", actual_end: data.ended_at ?? new Date().toISOString() })
        .eq("id", data.action_id);
    }
    revalidatePath(`/actions/${data.action_id}`);
    revalidatePath("/actions");
  }
  return { data, error };
}

/** Update an existing entry */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateActionEntry(id: string, values: Record<string, any>) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("action_entries")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (!error && data) {
    // If outcome changed to successful, mark action as completed
    if (data.outcome === "successful") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("actions")
        .update({ status: "completed", actual_end: data.ended_at ?? new Date().toISOString() })
        .eq("id", data.action_id);
    }
    revalidatePath(`/actions/${data.action_id}`);
    revalidatePath("/actions");
  }
  return { data, error };
}

/** Delete an entry */
export async function deleteActionEntry(id: string) {
  const supabase = await createServerClient();
  // First get the entry to know which action to revalidate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: entry } = await (supabase as any)
    .from("action_entries")
    .select("action_id")
    .eq("id", id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("action_entries")
    .delete()
    .eq("id", id);

  if (!error && entry) {
    revalidatePath(`/actions/${entry.action_id}`);
    revalidatePath("/actions");
  }
  return { error };
}

/** Get entry count and latest outcome for an action (for list views) */
export async function getActionEntrySummary(actionId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("action_entries")
    .select("id, visit_number, outcome, submitted_at")
    .eq("action_id", actionId)
    .order("visit_number", { ascending: false })
    .limit(1);

  if (error) return { data: null, error };

  const latest = data?.[0] ?? null;
  return {
    data: latest
      ? {
          total_visits: latest.visit_number,
          latest_outcome: latest.outcome,
          latest_submitted_at: latest.submitted_at,
        }
      : { total_visits: 0, latest_outcome: null, latest_submitted_at: null },
    error: null,
  };
}
