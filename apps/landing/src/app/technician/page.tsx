import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { ChevronRight, MapPin } from "lucide-react";
import {
  DEFAULT_CARD_FIELDS,
  FIELD_LABELS,
  resolveFieldValue,
} from "@/lib/field-app-catalog";

const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-stone-100 text-stone-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

const OPEN_STATUSES = ["pending", "scheduled", "in_progress", "blocked"];

type CardField = { key: string; group: string };

export default async function TechnicianHome({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; debug?: string }>;
}) {
  const { success, debug } = await searchParams;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("name, organization_id")
    .eq("id", user.id)
    .single();
  const orgId = profile?.organization_id;
  const firstName = (profile?.name as string)?.split(" ")[0] ?? "there";

  // Actions assigned to this technician. Resolve the location directly off the
  // action, falling back to its project's location when the action's own
  // location_id is blank.
  const { data: actionsRaw } = await db
    .from("actions")
    .select(
      "*, location:locations(*), project:projects(name, location:locations(*))",
    )
    .eq("assigned_to", user.id)
    .order("due_date", { ascending: true, nullsFirst: false });

  // Attach a single resolved location object per action.
  for (const a of actionsRaw ?? []) {
    const direct = (a as Record<string, unknown>).location as Record<string, unknown> | null;
    const viaProject = (
      (a as Record<string, unknown>).project as { location?: Record<string, unknown> } | null
    )?.location;
    (a as Record<string, unknown>).resolved_location = direct ?? viaProject ?? null;
  }

  const actions: Record<string, unknown>[] = (actionsRaw ?? []).filter(
    (a: Record<string, unknown>) =>
      OPEN_STATUSES.includes(a.status as string),
  );

  // Assets by location (one query)
  const locationIds = [
    ...new Set(
      actions
        .map((a) => (a.resolved_location as { id?: string } | null)?.id)
        .filter(Boolean),
    ),
  ];
  let assetsByLocation: Record<string, Record<string, unknown>> = {};
  if (locationIds.length > 0) {
    const { data: assets } = await db
      .from("assets")
      .select("*")
      .in("location_id", locationIds);
    assetsByLocation = Object.fromEntries(
      (assets ?? []).map((as: Record<string, unknown>) => [
        as.location_id as string,
        as,
      ]),
    );
  }

  // Field App configs for this org, keyed by action_type
  const { data: configs } = await db
    .from("field_app_config")
    .select("action_type_code, card_fields")
    .eq("organization_id", orgId);
  const configByType: Record<string, CardField[]> = Object.fromEntries(
    (configs ?? []).map((c: { action_type_code: string; card_fields: CardField[] }) => [
      c.action_type_code,
      c.card_fields,
    ]),
  );

  function cardFieldsFor(actionType: string): CardField[] {
    return configByType[actionType] ?? DEFAULT_CARD_FIELDS;
  }

  // Temporary diagnostic — visit /technician?debug=1
  let debugInfo: Record<string, unknown> | null = null;
  if (debug) {
    const { count: assignedCount } = await db
      .from("actions")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", user.id);
    const { count: orgCount } = await db
      .from("actions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId);
    debugInfo = {
      my_user_id: user.id,
      my_org_id: orgId,
      actions_assigned_to_me_readable: assignedCount ?? 0,
      actions_in_my_org_readable: orgCount ?? 0,
      assigned_open_after_filter: actions.length,
      per_action: actions.map((a) => {
        const rl = a.resolved_location as Record<string, unknown> | null;
        return {
          name: a.name,
          action_location_id: a.location_id ?? null,
          resolved_location_id: rl?.id ?? null,
          location_name: rl?.name ?? null,
          address: rl?.address ?? null,
          asset: rl?.id ? (assetsByLocation[rl.id as string]?.name ?? null) : null,
        };
      }),
    };
  }

  return (
    <div>
      {debugInfo && (
        <pre className="mb-4 overflow-x-auto rounded-lg border border-amber-200 bg-amber-50 p-3 text-[10px] text-amber-900">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
      <div>
        <p className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-stone-900">
          Hey, {firstName}
        </p>
        <p className="mt-0.5 text-sm text-stone-400">
          {actions.length === 0
            ? "No open work orders right now."
            : `You have ${actions.length} open work order${actions.length === 1 ? "" : "s"}.`}
        </p>
      </div>

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {actions.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
          <MapPin className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-3 text-sm font-medium text-stone-700">All clear</p>
          <p className="mt-1 text-xs text-stone-400">
            New jobs assigned to you will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {actions.map((action) => {
            const location = action.resolved_location as Record<string, unknown> | null;
            const asset = location?.id
              ? (assetsByLocation[location.id as string] ?? null)
              : null;
            const fields = cardFieldsFor(action.action_type as string);
            const priority = action.priority as string;

            const visibleFields = fields
              .filter(
                (f) => f.key !== "action_name" && f.key !== "action_priority",
              )
              .slice(0, 4);

            return (
              <Link
                key={action.id as string}
                href={`/technician/${action.id}`}
                className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:border-stone-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium capitalize text-blue-700">
                    {String(action.action_type).replace(/_/g, " ")}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                      PRIORITY_STYLE[priority] ?? "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {priority}
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-stone-900">
                  {(action.name as string) || "Service Action"}
                </p>

                <div className="mt-2 space-y-1">
                  {visibleFields.map((f) => (
                    <div
                      key={f.key}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="shrink-0 text-[11px] text-stone-400">
                        {FIELD_LABELS[f.key] ?? f.key}
                      </span>
                      <span className="truncate text-right text-[11px] font-medium text-stone-600">
                        {resolveFieldValue(f.key, {
                          action,
                          location,
                          asset,
                        })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-end text-[11px] font-medium text-fox-orange">
                  Open
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
