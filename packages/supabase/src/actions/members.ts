"use server";

import { createServerClient } from "../client/server";

export async function getOrgMembers(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("id, name, email, role")
    .eq("organization_id", orgId)
    .order("name", { ascending: true });
  return { data, error };
}
