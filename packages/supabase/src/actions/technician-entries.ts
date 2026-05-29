"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";

const CUSTOM_FIELD_MODULES = [
  "travel_time",
  "work_duration",
  "parts_used",
  "checklist",
  "customer_signature",
];

function val(formData: FormData, key: string): string {
  return ((formData.get(key) as string) ?? "").trim();
}

export async function submitFieldEntry(formData: FormData) {
  const actionId = val(formData, "action_id");
  if (!actionId) redirect("/technician");

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  const orgId: string | undefined = profile?.organization_id;
  if (!orgId) redirect("/signin");

  const startedAt = val(formData, "start_time");
  const endedAt = val(formData, "end_time");
  const notes = val(formData, "notes");
  const outcome = val(formData, "outcome") || "successful";
  const failureReason = val(formData, "failure_reason");
  const techSignature = val(formData, "technician_signature");
  const photosRaw = val(formData, "photos");

  const customFields: Record<string, string> = {};
  for (const key of CUSTOM_FIELD_MODULES) {
    const v = val(formData, key);
    if (v) customFields[key] = v;
  }

  const attachments = photosRaw
    ? photosRaw
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  let durationMinutes: number | null = null;
  if (startedAt && endedAt) {
    const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (!isNaN(ms) && ms > 0) durationMinutes = Math.round(ms / 60000);
  }

  const { error } = await db.from("action_entries").insert({
    action_id: actionId,
    technician_id: user.id,
    organization_id: orgId,
    started_at: startedAt || null,
    ended_at: endedAt || null,
    duration_minutes: durationMinutes,
    outcome,
    failure_reason: failureReason || null,
    notes: notes || null,
    custom_fields: customFields,
    attachments,
    technician_signature: techSignature || null,
    submitted_at: new Date().toISOString(),
  });

  if (error) {
    redirect(
      `/technician/${actionId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Advance the parent action's status based on outcome
  const newStatus =
    outcome === "successful"
      ? "completed"
      : outcome === "cancelled"
        ? "cancelled"
        : "in_progress";
  await db
    .from("actions")
    .update({
      status: newStatus,
      actual_end: outcome === "successful" ? endedAt || new Date().toISOString() : null,
    })
    .eq("id", actionId)
    .eq("organization_id", orgId);

  revalidatePath("/technician");
  redirect("/technician?success=Visit+submitted");
}
