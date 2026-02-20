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

export async function getAssets(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("assets")
    .select("*, locations(name), assigned_profile:profiles!assigned_to(name, email)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getAsset(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("assets")
    .select("*, locations(name)")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function getAssetsByLocation(locationId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("assets")
    .select("*")
    .eq("location_id", locationId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAsset(values: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("assets")
    .insert({ ...values, organization_id: auth.organizationId, created_by: auth.userId })
    .select()
    .single();
  if (!error) revalidatePath("/assets");
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAsset(id: string, values: Record<string, any>) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("assets")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (!error) {
    revalidatePath("/assets");
    revalidatePath(`/assets/${id}`);
  }
  return { data, error };
}

export async function deleteAsset(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("assets")
    .delete()
    .eq("id", id);
  if (!error) revalidatePath("/assets");
  return { error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function bulkUpdateAssets(ids: string[], updates: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("assets")
    .update(updates)
    .in("id", ids)
    .eq("organization_id", auth.organizationId);
  if (!error) revalidatePath("/assets");
  return { error };
}

export async function bulkDeleteAssets(ids: string[]) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("assets")
    .delete()
    .in("id", ids)
    .eq("organization_id", auth.organizationId);
  if (!error) revalidatePath("/assets");
  return { error };
}
