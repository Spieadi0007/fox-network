"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";
import type { ProcedureStepType } from "../types";

// Reading and writing the procedure a technician works through on site.
//
// Templates are versioned rather than edited in place: saving a new one
// deactivates the previous version instead of overwriting it, so visits
// already recorded against the old steps stay coherent.

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

export type SuggestedPart = {
  part_number: string;
  name: string;
  quantity: number;
};

export type ProcedureDraftStep = {
  label: string;
  type: ProcedureStepType;
  required: boolean;
  units: string;
  help: string;
  evidence: string;
  /** This step consumes materials — show the parts picker. */
  captures_parts: boolean;
  suggested_parts: SuggestedPart[];
  /** What a measurement should read; null where the SOP gives no figure. */
  spec_target: number | null;
  spec_min: number | null;
  spec_max: number | null;
  /** The case this step is scoped to; empty when it always applies. */
  applies_when: string;
};

export type ProcedureDraft = {
  name: string;
  summary: string;
  sections: { title: string; steps: ProcedureDraftStep[] }[];
};

/** Active templates for the org, with their sections and steps, in order. */
export async function getProcedureTemplates(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("procedure_templates")
    .select(
      `id, action_type_code, name, summary, version, created_at,
       procedure_sections ( id, title, position,
         procedure_steps ( id, position, label, step_type, required, units, help, evidence,
                         captures_parts, suggested_parts, spec_target, spec_min, spec_max, applies_when )
       )`,
    )
    .eq("organization_id", orgId)
    .eq("is_active", true)
    .order("action_type_code", { ascending: true });

  return { data, error };
}

/**
 * Save a reviewed procedure as the live template for one service type.
 *
 * The previous version is deactivated first — the partial unique index only
 * permits one active template per service type, so this ordering matters.
 */
export async function saveProcedureTemplate(
  actionTypeCode: string,
  draft: ProcedureDraft,
  sourceSopImportId?: string | null,
) {
  const auth = await getProfile();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const orgId = auth.organizationId;

  const sections = draft.sections.filter((s) => s.steps.length > 0);
  if (sections.length === 0) {
    return { data: null, error: { message: "The procedure has no steps." } };
  }

  // Next version number for this service type.
  const { data: previous } = await db
    .from("procedure_templates")
    .select("id, version")
    .eq("organization_id", orgId)
    .eq("action_type_code", actionTypeCode)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (previous?.version ?? 0) + 1;

  // Retire the current one before inserting, or the unique index rejects us.
  const { error: retireError } = await db
    .from("procedure_templates")
    .update({ is_active: false })
    .eq("organization_id", orgId)
    .eq("action_type_code", actionTypeCode)
    .eq("is_active", true);

  if (retireError) return { data: null, error: retireError };

  const { data: template, error: templateError } = await db
    .from("procedure_templates")
    .insert({
      organization_id: orgId,
      action_type_code: actionTypeCode,
      name: draft.name,
      summary: draft.summary,
      source_sop_import_id: sourceSopImportId ?? null,
      version: nextVersion,
      is_active: true,
      created_by: auth.userId,
    })
    .select("id")
    .single();

  if (templateError) return { data: null, error: templateError };

  const { data: insertedSections, error: sectionError } = await db
    .from("procedure_sections")
    .insert(
      sections.map((s, i) => ({
        template_id: template.id,
        organization_id: orgId,
        title: s.title,
        position: i,
      })),
    )
    .select("id, position");

  if (sectionError) return { data: null, error: sectionError };

  // Map back by position — insert order is not guaranteed to be returned.
  const sectionIdByPosition = new Map<number, string>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (insertedSections ?? []).map((s: any) => [s.position, s.id]),
  );

  const steps = sections.flatMap((s, sectionIndex) =>
    s.steps.map((step, stepIndex) => ({
      section_id: sectionIdByPosition.get(sectionIndex),
      organization_id: orgId,
      position: stepIndex,
      label: step.label,
      step_type: step.type,
      required: step.required,
      // The DB rejects units on anything but a measurement.
      units: step.type === "number" ? step.units : "",
      help: step.help,
      evidence: step.evidence,
      captures_parts: step.captures_parts,
      // Parts on a step that captures none would never surface.
      suggested_parts: step.captures_parts ? step.suggested_parts : [],
      // The DB rejects a spec on anything but a measurement.
      spec_target: step.type === "number" ? step.spec_target : null,
      spec_min: step.type === "number" ? step.spec_min : null,
      spec_max: step.type === "number" ? step.spec_max : null,
      applies_when: step.applies_when,
    })),
  );

  const { error: stepError } = await db.from("procedure_steps").insert(steps);
  if (stepError) return { data: null, error: stepError };

  revalidatePath("/dashboard/settings/procedures");
  return { data: { id: template.id, version: nextVersion }, error: null };
}

/** Retire the live template for a service type without replacing it. */
export async function deactivateProcedureTemplate(actionTypeCode: string) {
  const auth = await getProfile();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("procedure_templates")
    .update({ is_active: false })
    .eq("organization_id", auth.organizationId)
    .eq("action_type_code", actionTypeCode)
    .eq("is_active", true);

  if (!error) revalidatePath("/dashboard/settings/procedures");
  return { data: null, error };
}
