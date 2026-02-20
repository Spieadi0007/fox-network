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

export async function getLocations(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("locations")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getLocation(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("locations")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createLocation(values: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("locations")
    .insert({ ...values, organization_id: auth.organizationId, created_by: auth.userId })
    .select()
    .single();
  if (!error) revalidatePath("/locations");
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateLocation(id: string, values: Record<string, any>) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("locations")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (!error) {
    revalidatePath("/locations");
    revalidatePath(`/locations/${id}`);
  }
  return { data, error };
}

export async function deleteLocation(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("locations")
    .delete()
    .eq("id", id);
  if (!error) revalidatePath("/locations");
  return { error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function bulkUpdateLocations(ids: string[], updates: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("locations")
    .update(updates)
    .in("id", ids)
    .eq("organization_id", auth.organizationId);
  if (!error) revalidatePath("/locations");
  return { error };
}

export async function bulkDeleteLocations(ids: string[]) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("locations")
    .delete()
    .in("id", ids)
    .eq("organization_id", auth.organizationId);
  if (!error) revalidatePath("/locations");
  return { error };
}
