"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";

export async function getOrganization(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("organizations")
    .select("id, name, size, industry, website, description, logo_url")
    .eq("id", orgId)
    .single();
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateOrganization(orgId: string, values: Record<string, any>) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (supabase as any)
    .from("organizations")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", orgId)
    .select();
  const data = rows?.[0] ?? null;
  if (!error) {
    revalidatePath("/", "layout");
  }
  return { data, error };
}
