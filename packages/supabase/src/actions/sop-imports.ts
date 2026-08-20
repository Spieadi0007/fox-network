"use server";

import { createServerClient } from "../client/server";

/**
 * Record what the manager actually accepted from an SOP import.
 *
 * The `extracted` column already holds what the model proposed. This closes
 * the loop by storing the subset that was applied, so the trail answers
 * "what landed in the config", not just "what was suggested".
 *
 * RLS restricts this to managers and admins in the owning org.
 */
export async function markSopImportApplied(
  importId: string,
  applied: {
    fields: { key: string; visible: boolean }[];
    modules: { key: string; enabled: boolean }[];
  },
) {
  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("sop_imports")
    .update({ applied, applied_at: new Date().toISOString() })
    .eq("id", importId)
    .select("id")
    .single();

  return { data, error };
}
