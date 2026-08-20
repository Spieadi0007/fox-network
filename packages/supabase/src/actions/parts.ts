"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";

// The org's spare-parts catalog. Technicians pick from it when a step
// consumes materials; importing an SOP can propose additions to it.

async function getOrgId() {
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
  return profile?.organization_id ?? null;
}

export async function getParts(orgId: string, includeInactive = false) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("parts")
    .select("*")
    .eq("organization_id", orgId)
    .order("part_number", { ascending: true });

  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  return { data, error };
}

export async function upsertPart(input: {
  id?: string;
  part_number: string;
  name: string;
  unit: string;
}) {
  const orgId = await getOrgId();
  if (!orgId) return { data: null, error: { message: "Not authenticated" } };

  const partNumber = input.part_number.trim();
  const name = input.name.trim();
  if (!partNumber || !name) {
    return { data: null, error: { message: "Part number and name are required." } };
  }

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const row = {
    organization_id: orgId,
    part_number: partNumber,
    name,
    unit: input.unit.trim() || "each",
  };

  const { data, error } = input.id
    ? await db.from("parts").update(row).eq("id", input.id).select().single()
    : await db
        .from("parts")
        // Re-importing an SOP will offer the same parts again; treat that as
        // a no-op rather than a duplicate-key error.
        .upsert(row, { onConflict: "organization_id,part_number" })
        .select()
        .single();

  if (!error) revalidatePath("/dashboard/settings/parts");
  return { data, error };
}

/** Add parts an SOP named, skipping any already in the catalog. */
export async function addPartsFromSop(
  parts: { part_number: string; name: string }[],
) {
  const orgId = await getOrgId();
  if (!orgId) return { data: null, error: { message: "Not authenticated" } };

  const rows = parts
    .filter((p) => p.part_number.trim() && p.name.trim())
    .map((p) => ({
      organization_id: orgId,
      part_number: p.part_number.trim(),
      name: p.name.trim(),
      unit: "each",
    }));

  if (rows.length === 0) return { data: { added: 0 }, error: null };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("parts")
    .upsert(rows, {
      onConflict: "organization_id,part_number",
      ignoreDuplicates: true,
    })
    .select("id");

  if (!error) {
    revalidatePath("/dashboard/settings/parts");
    revalidatePath("/dashboard/settings/procedures");
  }
  return { data: { added: data?.length ?? 0 }, error };
}

/**
 * Retire a part rather than delete it — visits already record the parts they
 * consumed, and a catalog row that vanishes makes those harder to trace.
 */
export async function retirePart(id: string) {
  const orgId = await getOrgId();
  if (!orgId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("parts")
    .update({ is_active: false })
    .eq("id", id)
    .eq("organization_id", orgId);

  if (!error) revalidatePath("/dashboard/settings/parts");
  return { data: null, error };
}

export async function restorePart(id: string) {
  const orgId = await getOrgId();
  if (!orgId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("parts")
    .update({ is_active: true })
    .eq("id", id)
    .eq("organization_id", orgId);

  if (!error) revalidatePath("/dashboard/settings/parts");
  return { data: null, error };
}
