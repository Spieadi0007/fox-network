"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";
import type { ProcedureStepType } from "../types";

// Submitting a visit that was carried out against a procedure.
//
// The entry and its answers are written together: a set of answers with no
// parent visit is meaningless, and a visit recorded without the answers
// would lose the report entirely.

export type StepAnswer = {
  stepId: string;
  sectionTitle: string;
  sectionPosition: number;
  stepLabel: string;
  stepType: ProcedureStepType;
  stepPosition: number;
  units: string;
  /** Shape depends on stepType; see StepValue in ../types. */
  value: unknown;
  photoPaths: string[];
  partsUsed: {
    part_id: string | null;
    part_number: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  isFailure: boolean;
  /** The measurement fell outside the step's spec. */
  isOutOfSpec: boolean;
  /** The step's condition did not apply on this visit. */
  notApplicable: boolean;
  note: string;
};

export type ProcedureEntryInput = {
  actionId: string;
  startedAt: string | null;
  endedAt: string | null;
  outcome: "successful" | "partial" | "unsuccessful" | "cancelled";
  notes: string;
  answers: StepAnswer[];
};

export async function submitProcedureEntry(input: ProcedureEntryInput) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: { message: "Not authenticated." } };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: profile } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  const orgId: string | undefined = profile?.organization_id;
  if (!orgId) return { error: { message: "No organization." } };

  // Guard here as well as in the browser: a failed step without an
  // explanation is rejected by a CHECK constraint, and a round trip that
  // dies on the answer insert would leave an entry with no report.
  const unexplained = input.answers.find(
    (a) => a.isFailure && !a.note.trim(),
  );
  if (unexplained) {
    return {
      error: {
        message: `"${unexplained.stepLabel}" is marked failed but has no explanation.`,
      },
    };
  }

  let durationMinutes: number | null = null;
  if (input.startedAt && input.endedAt) {
    const ms =
      new Date(input.endedAt).getTime() - new Date(input.startedAt).getTime();
    if (!isNaN(ms) && ms > 0) durationMinutes = Math.round(ms / 60000);
  }

  const { data: entry, error: entryError } = await db
    .from("action_entries")
    .insert({
      action_id: input.actionId,
      technician_id: user.id,
      organization_id: orgId,
      started_at: input.startedAt || null,
      ended_at: input.endedAt || null,
      duration_minutes: durationMinutes,
      outcome: input.outcome,
      notes: input.notes || null,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (entryError) return { error: entryError };

  if (input.answers.length > 0) {
    const { error: stepError } = await db.from("action_entry_steps").insert(
      input.answers.map((a) => ({
        entry_id: entry.id,
        organization_id: orgId,
        step_id: a.stepId,
        section_title: a.sectionTitle,
        section_position: a.sectionPosition,
        step_label: a.stepLabel,
        step_type: a.stepType,
        step_position: a.stepPosition,
        units: a.units,
        value: a.value ?? {},
        photo_paths: a.photoPaths,
        parts_used: a.partsUsed,
        is_failure: a.isFailure,
        is_out_of_spec: a.isOutOfSpec,
        not_applicable: a.notApplicable,
        note: a.note,
        completed_at: new Date().toISOString(),
      })),
    );

    if (stepError) {
      // Don't strand an entry with no answers attached to it.
      await db.from("action_entries").delete().eq("id", entry.id);
      return { error: stepError };
    }
  }

  const newStatus =
    input.outcome === "successful"
      ? "completed"
      : input.outcome === "cancelled"
        ? "cancelled"
        : "in_progress";

  await db
    .from("actions")
    .update({
      status: newStatus,
      actual_end:
        input.outcome === "successful"
          ? input.endedAt || new Date().toISOString()
          : null,
    })
    .eq("id", input.actionId)
    .eq("organization_id", orgId);

  revalidatePath("/technician");
  return { data: { entryId: entry.id }, error: null };
}
