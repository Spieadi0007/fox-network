"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";
import type { ProcedureStepType } from "../types";

// A service type is the unit a manager actually thinks in: one kind of job,
// with the fields and modules a technician sees and the procedure they work
// through. One SOP describes one of these, so importing one creates or
// updates all of it together.
//
// Types live in configurable_field_options under field_key = 'action_type'.
// The eight built-ins are seeded on first use so custom ones can sit
// alongside them in the same list.

const BUILT_IN_TYPES = [
  { code: "survey", label: "Survey" },
  { code: "installation", label: "Installation" },
  { code: "inspection", label: "Inspection" },
  { code: "maintenance", label: "Maintenance" },
  { code: "repair", label: "Repair" },
  { code: "testing", label: "Testing" },
  { code: "documentation", label: "Documentation" },
  { code: "other", label: "Other" },
];

async function getAuth() {
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

const PAGE = "/dashboard/settings/service-types";

export type ServiceType = {
  id: string | null;
  code: string;
  label: string;
  is_active: boolean;
  /** Built-ins cannot be renamed or retired. */
  is_built_in: boolean;
};

/**
 * Every service type for the org, built-ins included.
 *
 * Built-ins are returned even when the org has never customised them, so the
 * list is the same whether or not anyone has touched settings.
 */
export async function getServiceTypes(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("configurable_field_options")
    .select("id, code, label, sort_order, is_active")
    .eq("organization_id", orgId)
    .eq("field_key", "action_type")
    .order("sort_order", { ascending: true });

  if (error) return { data: null, error };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = data ?? [];
  const byCode = new Map(rows.map((r) => [r.code, r]));

  const types: ServiceType[] = BUILT_IN_TYPES.map((b) => {
    const row = byCode.get(b.code);
    return {
      id: row?.id ?? null,
      code: b.code,
      label: row?.label ?? b.label,
      is_active: row?.is_active ?? true,
      is_built_in: true,
    };
  });

  for (const r of rows) {
    if (BUILT_IN_TYPES.some((b) => b.code === r.code)) continue;
    types.push({
      id: r.id,
      code: r.code,
      label: r.label,
      is_active: r.is_active ?? true,
      is_built_in: false,
    });
  }

  return { data: types, error: null };
}

/** Make sure a code is unique within the org before it is used. */
async function uniqueCode(orgId: string, base: string): Promise<string> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("configurable_field_options")
    .select("code")
    .eq("organization_id", orgId)
    .eq("field_key", "action_type");

  const taken = new Set<string>([
    ...BUILT_IN_TYPES.map((b) => b.code),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...((data ?? []) as any[]).map((r) => r.code),
  ]);

  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    if (!taken.has(`${base}_${i}`)) return `${base}_${i}`;
  }
  return `${base}_${Date.now()}`;
}

export async function createServiceType(label: string, code?: string) {
  const auth = await getAuth();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const name = label.trim();
  if (!name) return { data: null, error: { message: "Name is required." } };

  const base =
    (code ?? name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48) || "service_type";

  const finalCode = await uniqueCode(auth.organizationId, base);

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("configurable_field_options")
    .insert({
      organization_id: auth.organizationId,
      field_key: "action_type",
      label: name,
      code: finalCode,
      sort_order: 100,
    })
    .select("id, code, label")
    .single();

  if (!error) revalidatePath(PAGE);
  return { data, error };
}

export async function renameServiceType(code: string, label: string) {
  const auth = await getAuth();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const name = label.trim();
  if (!name) return { data: null, error: { message: "Name is required." } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // A built-in may have no row yet; renaming one creates its override.
  const { data: existing } = await db
    .from("configurable_field_options")
    .select("id")
    .eq("organization_id", auth.organizationId)
    .eq("field_key", "action_type")
    .eq("code", code)
    .maybeSingle();

  const { error } = existing
    ? await db
        .from("configurable_field_options")
        .update({ label: name })
        .eq("id", existing.id)
    : await db.from("configurable_field_options").insert({
        organization_id: auth.organizationId,
        field_key: "action_type",
        code,
        label: name,
        sort_order: 100,
      });

  if (!error) revalidatePath(PAGE);
  return { data: null, error };
}

/**
 * Retire a service type rather than delete it: work orders, configs and filed
 * reports all resolve through the code, and removing the row would leave them
 * pointing at a name nothing can display.
 */
export async function setServiceTypeActive(code: string, isActive: boolean) {
  const auth = await getAuth();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("configurable_field_options")
    .update({ is_active: isActive })
    .eq("organization_id", auth.organizationId)
    .eq("field_key", "action_type")
    .eq("code", code);

  if (!error) revalidatePath(PAGE);
  return { data: null, error };
}

// ─── Publishing an SOP import ────────────────────────────────────────

export type PublishInput = {
  /** Existing type to update, or null to create one from `newTypeLabel`. */
  code: string | null;
  newTypeLabel?: string;
  importId: string | null;
  config: {
    detail_fields: { key: string; group: string }[];
    enabled_modules: Record<string, boolean>;
  } | null;
  procedure: {
    name: string;
    summary: string;
    sections: {
      title: string;
      steps: {
        label: string;
        type: ProcedureStepType;
        required: boolean;
        units: string;
        help: string;
        evidence: string;
        captures_parts: boolean;
        suggested_parts: {
          part_number: string;
          name: string;
          quantity: number;
        }[];
        spec_target: number | null;
        spec_min: number | null;
        spec_max: number | null;
        applies_when: string;
      }[];
    }[];
  } | null;
};

/**
 * Write everything one SOP produced, against one service type.
 *
 * The config and the procedure are written together because they describe the
 * same job: publishing half of it would leave a technician with a procedure
 * whose fields are not on screen, or fields with nothing to do.
 */
export async function publishServiceType(input: PublishInput) {
  const auth = await getAuth();
  if (!auth?.organizationId)
    return { data: null, error: { message: "Not authenticated" } };

  const orgId = auth.organizationId;
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Resolve the service type, creating it where this is a new one.
  let code = input.code;
  if (!code) {
    const { data, error } = await createServiceType(
      input.newTypeLabel ?? input.procedure?.name ?? "New service type",
    );
    if (error || !data) {
      return { data: null, error: error ?? { message: "Could not create the service type." } };
    }
    code = data.code;
  }

  // 2. Field App configuration.
  if (input.config) {
    const { data: current } = await db
      .from("field_app_config")
      .select("card_fields, display_mode")
      .eq("organization_id", orgId)
      .eq("action_type_code", code)
      .maybeSingle();

    const { error } = await db.from("field_app_config").upsert(
      {
        organization_id: orgId,
        action_type_code: code,
        // The SOP describes what a technician needs to see on the details
        // page. Card fields are a list-density choice, so they are preserved.
        card_fields: current?.card_fields ?? [],
        detail_fields: input.config.detail_fields,
        enabled_modules: input.config.enabled_modules,
        display_mode: current?.display_mode ?? "details",
      },
      { onConflict: "organization_id,action_type_code" },
    );
    if (error) return { data: null, error };
  }

  // 3. Procedure, as a new version.
  let version: number | null = null;
  if (input.procedure && input.procedure.sections.length > 0) {
    const { data: previous } = await db
      .from("procedure_templates")
      .select("version")
      .eq("organization_id", orgId)
      .eq("action_type_code", code)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    version = (previous?.version ?? 0) + 1;

    // Only one template per type may be active; retire before inserting.
    const { error: retireError } = await db
      .from("procedure_templates")
      .update({ is_active: false })
      .eq("organization_id", orgId)
      .eq("action_type_code", code)
      .eq("is_active", true);
    if (retireError) return { data: null, error: retireError };

    const { data: template, error: templateError } = await db
      .from("procedure_templates")
      .insert({
        organization_id: orgId,
        action_type_code: code,
        name: input.procedure.name,
        summary: input.procedure.summary,
        source_sop_import_id: input.importId,
        version,
        is_active: true,
        created_by: auth.userId,
      })
      .select("id")
      .single();
    if (templateError) return { data: null, error: templateError };

    const sections = input.procedure.sections.filter(
      (s) => s.steps.length > 0,
    );

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

    // Map back by position — insert order is not guaranteed on return.
    const sectionIdByPosition = new Map<number, string>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (insertedSections ?? []).map((s: any) => [s.position, s.id]),
    );

    const { error: stepError } = await db.from("procedure_steps").insert(
      sections.flatMap((s, si) =>
        s.steps.map((step, ti) => ({
          section_id: sectionIdByPosition.get(si),
          organization_id: orgId,
          position: ti,
          label: step.label,
          step_type: step.type,
          required: step.required,
          // The database rejects units and specs on anything but a number.
          units: step.type === "number" ? step.units : "",
          help: step.help,
          evidence: step.evidence,
          captures_parts: step.captures_parts,
          suggested_parts: step.captures_parts ? step.suggested_parts : [],
          spec_target: step.type === "number" ? step.spec_target : null,
          spec_min: step.type === "number" ? step.spec_min : null,
          spec_max: step.type === "number" ? step.spec_max : null,
          applies_when: step.applies_when,
        })),
      ),
    );
    if (stepError) return { data: null, error: stepError };
  }

  // 4. Close the audit loop on the import.
  if (input.importId) {
    await db
      .from("sop_imports")
      .update({
        action_type_code: code,
        applied: { config: input.config, procedure_version: version },
        applied_at: new Date().toISOString(),
      })
      .eq("id", input.importId);
  }

  revalidatePath(PAGE);
  return { data: { code, version }, error: null };
}
