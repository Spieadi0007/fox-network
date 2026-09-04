import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { submitFieldEntry } from "@fox/supabase/actions/technician-entries";
import { ArrowLeft, MapPin, Box, AlertTriangle } from "lucide-react";
import {
  DEFAULT_DETAIL_FIELDS,
  FIELD_GROUPS,
  FIELD_LABELS,
  MODULE_DEFS,
  isFixedModule,
  resolveFieldValue,
  type FieldGroupKey,
} from "@fox/shared";
import {
  ProcedureRunner,
  type RunnerSection,
  type RunnerStep,
  type CatalogPart,
} from "./procedure-runner";
import { SubmitButton } from "@/components/ui/submit-button";

const GROUP_ICON = {
  location: MapPin,
  asset: Box,
  issue: AlertTriangle,
} as const;

type DetailField = { key: string; group: string };

const labelCls = "block text-xs font-medium text-stone-600";
const inputCls =
  "mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange";

export default async function WorkOrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

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
  const orgId = profile?.organization_id;

  const { data: action } = await db
    .from("actions")
    .select(
      "*, location:locations(*), project:projects(name, location:locations(*))",
    )
    .eq("id", id)
    .single();
  if (!action) notFound();

  const directLocation = (action.location as Record<string, unknown> | null) ?? null;
  const projectLocation =
    (action.project as { location?: Record<string, unknown> } | null)?.location ?? null;
  const location = directLocation ?? projectLocation;

  // Prefer the action's direct asset_id; else an asset at the location.
  let asset: Record<string, unknown> | null = null;
  if (action.asset_id) {
    const { data: byId } = await db
      .from("assets")
      .select("*")
      .eq("id", action.asset_id)
      .limit(1);
    asset = byId?.[0] ?? null;
  }
  if (!asset && location?.id) {
    const { data: byLoc } = await db
      .from("assets")
      .select("*")
      .eq("location_id", location.id)
      .limit(1);
    asset = byLoc?.[0] ?? null;
  }

  // Config for this action type (fall back to defaults)
  const { data: cfg } = await db
    .from("field_app_config")
    .select("detail_fields, enabled_modules")
    .eq("organization_id", orgId)
    .eq("action_type_code", action.action_type)
    .maybeSingle();

  const detailFields: DetailField[] =
    cfg?.detail_fields?.length ? cfg.detail_fields : DEFAULT_DETAIL_FIELDS;
  const enabledModules: Record<string, boolean> = cfg?.enabled_modules ?? {};

  // The live procedure for this service type, if one has been published.
  const { data: procedure } = await db
    .from("procedure_templates")
    .select(
      `name,
       procedure_sections ( id, title, position,
         procedure_steps ( id, position, label, step_type, required, units, help,
                           captures_parts, suggested_parts, spec_target, spec_min,
                           spec_max, applies_when )
       )`,
    )
    .eq("organization_id", orgId)
    .eq("action_type_code", action.action_type)
    .eq("is_active", true)
    .maybeSingle();

  // The nested select nests steps under `procedure_steps`; the runner wants
  // them as `steps`. Postgres also gives no ordering guarantee through a
  // nested select, and sequence is the whole point of a procedure — so sort
  // both levels explicitly rather than trusting the order they arrive in.
  type RawSection = Omit<RunnerSection, "steps"> & {
    procedure_steps: RunnerStep[] | null;
  };

  const procedureSections: RunnerSection[] = (
    (procedure?.procedure_sections ?? []) as RawSection[]
  )
    .map((s) => ({
      id: s.id,
      title: s.title,
      position: s.position,
      steps: [...(s.procedure_steps ?? [])].sort(
        (a, b) => a.position - b.position,
      ),
    }))
    .sort((a, b) => a.position - b.position)
    .filter((s) => s.steps.length > 0);

  // The parts picker needs something to pick from; only fetch when some step
  // actually consumes materials.
  const needsParts = procedureSections.some((s) =>
    s.steps.some((st) => st.captures_parts),
  );
  const { data: catalogParts } = needsParts
    ? await db
        .from("parts")
        .select("id, part_number, name, unit")
        .eq("organization_id", orgId)
        .eq("is_active", true)
        .order("part_number", { ascending: true })
    : { data: [] as CatalogPart[] };

  const fieldsByGroup = (group: FieldGroupKey) =>
    detailFields.filter((f) => f.group === group);

  // Modules to render: always-on + enabled, in catalog order
  const activeModules = MODULE_DEFS.filter(
    (m) => isFixedModule(m.key) || enabledModules[m.key],
  ).filter((m) => m.key !== "chat" && m.key !== "auto_translate");

  return (
    <div>
      <Link
        href="/technician"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 transition-colors hover:text-stone-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Work orders
      </Link>

      {/* Header */}
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium capitalize text-blue-700">
          {String(action.action_type).replace(/_/g, " ")}
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium capitalize text-amber-700">
          {String(action.priority)}
        </span>
      </div>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-900">
        {(action.name as string) || "Work Order"}
      </h1>
      {action.code && (
        <p className="font-mono text-[11px] text-stone-400">
          {action.code as string}
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Info display — grouped */}
      <div className="mt-5 space-y-3">
        {FIELD_GROUPS.map((group) => {
          const fields = fieldsByGroup(group.key);
          if (fields.length === 0) return null;
          const Icon = GROUP_ICON[group.key];
          return (
            <div
              key={group.key}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-3 py-2">
                <Icon className="h-3.5 w-3.5 text-stone-500" />
                <p className="text-[11px] font-semibold text-stone-600">
                  {group.label}
                </p>
              </div>
              <div className="space-y-1.5 px-3 py-2.5">
                {fields.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span className="shrink-0 text-[11px] text-stone-400">
                      {FIELD_LABELS[f.key] ?? f.key}
                    </span>
                    <span className="text-right text-[12px] font-medium text-stone-800">
                      {resolveFieldValue(f.key, { action, location, asset })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* When this service type has a published procedure, the technician
          works through that instead of the flat module form — completing it
          is what produces the report. */}
      {procedureSections.length > 0 ? (
        <ProcedureRunner
          actionId={id}
          organizationId={orgId}
          procedureName={procedure!.name}
          sections={procedureSections}
          catalogParts={catalogParts ?? []}
        />
      ) : (
      /* Entry form — modules */
      <form action={submitFieldEntry} className="mt-6 space-y-4">
        <input type="hidden" name="action_id" value={id} />

        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Log your visit
        </p>

        {activeModules.map((m) => {
          if (m.key === "work_duration") {
            return (
              <div key={m.key}>
                <label className={labelCls}>{m.label}</label>
                <input
                  name={m.key}
                  type="text"
                  className={inputCls}
                  placeholder="Auto-calculated from start/end if left blank"
                />
              </div>
            );
          }
          if (m.kind === "time") {
            return (
              <div key={m.key}>
                <label htmlFor={m.key} className={labelCls}>
                  {m.label}
                </label>
                <input
                  id={m.key}
                  name={m.key}
                  type="datetime-local"
                  className={inputCls}
                />
              </div>
            );
          }
          if (m.kind === "signature") {
            return (
              <div key={m.key}>
                <label htmlFor={m.key} className={labelCls}>
                  {m.label}
                </label>
                <input
                  id={m.key}
                  name={m.key}
                  type="text"
                  className={inputCls}
                  placeholder="Type full name to sign"
                />
              </div>
            );
          }
          if (m.kind === "photo") {
            return (
              <div key={m.key}>
                <label htmlFor={m.key} className={labelCls}>
                  {m.label}
                </label>
                <textarea
                  id={m.key}
                  name={m.key}
                  rows={2}
                  className={inputCls}
                  placeholder="Paste photo URLs, one per line"
                />
              </div>
            );
          }
          // text / input
          return (
            <div key={m.key}>
              <label htmlFor={m.key} className={labelCls}>
                {m.label}
              </label>
              {m.key === "notes" ? (
                <textarea
                  id={m.key}
                  name={m.key}
                  rows={3}
                  className={inputCls}
                  placeholder={m.placeholder}
                />
              ) : (
                <input
                  id={m.key}
                  name={m.key}
                  type="text"
                  className={inputCls}
                  placeholder={m.placeholder}
                />
              )}
            </div>
          );
        })}

        {/* Outcome — always present */}
        <div>
          <label htmlFor="outcome" className={labelCls}>
            Outcome
          </label>
          <select
            id="outcome"
            name="outcome"
            defaultValue="successful"
            className={inputCls}
          >
            <option value="successful">Resolved — close work order</option>
            <option value="partial">Partial — needs another visit</option>
            <option value="unsuccessful">Unsuccessful</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="failure_reason" className={labelCls}>
            Reason (if not resolved)
          </label>
          <input
            id="failure_reason"
            name="failure_reason"
            type="text"
            className={inputCls}
            placeholder="Optional"
          />
        </div>

        <SubmitButton
          pendingLabel="Submitting…"
          className="w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
        >
          Submit visit
        </SubmitButton>
      </form>
      )}
    </div>
  );
}
