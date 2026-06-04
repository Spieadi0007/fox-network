import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { updateClientRequest } from "@fox/supabase/actions/client-requests";
import { ArrowLeft } from "lucide-react";

const SERVICE_OPTIONS = [
  { value: "maintenance", label: "Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "inspection", label: "Inspection" },
  { value: "installation", label: "Installation" },
];

const SLA_OPTIONS = [
  { value: "lazy", label: "Relaxed", response: "Within 5 business days" },
  { value: "standard", label: "Standard", response: "Within 48 hours" },
  { value: "urgent", label: "Urgent", response: "Within 24 hours" },
  { value: "emergency", label: "Emergency", response: "Within 4 hours, 24/7" },
];

const TIER_BY_PRIORITY: Record<string, string> = {
  low: "lazy",
  medium: "standard",
  high: "urgent",
  critical: "emergency",
};

const NETWORK_LABEL: Record<string, string> = {
  locker: "Locker network",
  atm: "ATM network",
  ev_charger: "EV charging stations",
  other: "Other",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-stone-100 text-stone-500 border-stone-200",
};

const labelCls = "block text-xs font-medium text-stone-600";
const inputCls =
  "mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange";

function val(v: unknown): string {
  return v == null ? "—" : String(v);
}

export default async function ClientRequestDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/client/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  const orgId = profile?.organization_id;
  if (!orgId) redirect("/client/signin");

  const { data: action } = await db
    .from("actions")
    .select(
      "id, name, description, status, priority, category, estimated_cost, action_type, created_at, location_id, asset_id, organization_id, location:locations(name, address, city, state, zip_code, country)",
    )
    .eq("id", id)
    .single();

  if (!action || action.organization_id !== orgId) notFound();

  let asset: { name: string | null } | null = null;
  if (action.asset_id) {
    const { data: a } = await db
      .from("assets")
      .select("name")
      .eq("id", action.asset_id)
      .limit(1);
    asset = a?.[0] ?? null;
  }

  const { data: org } = await db
    .from("organizations")
    .select("network_type")
    .eq("id", orgId)
    .single();
  const networkType = (org?.network_type as string) || "other";

  const loc = (action.location as Record<string, unknown> | null) ?? {};
  const isPending = action.status === "pending";
  const currentTier = TIER_BY_PRIORITY[action.priority] ?? "standard";

  return (
    <div>
      <Link
        href="/client/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to requests
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
            {action.name}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {isPending
              ? "Still pending — you can edit the details below."
              : "This request is in progress and can no longer be edited."}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${
            STATUS_STYLE[action.status] ??
            "border-stone-200 bg-stone-50 text-stone-600"
          }`}
        >
          {String(action.status).replace(/_/g, " ")}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {isPending ? (
        <form
          action={updateClientRequest}
          className="mt-6 max-w-2xl space-y-6"
        >
          <input type="hidden" name="request_id" value={action.id} />

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-base font-bold tracking-tight text-stone-900">
              What&apos;s broken
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Network type: {NETWORK_LABEL[networkType] ?? networkType}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="asset_label" className={labelCls}>
                  Asset name / ID *
                </label>
                <input
                  id="asset_label"
                  name="asset_label"
                  type="text"
                  required
                  className={inputCls}
                  defaultValue={asset?.name ?? ""}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="problem_description" className={labelCls}>
                  What&apos;s the problem?
                </label>
                <textarea
                  id="problem_description"
                  name="problem_description"
                  rows={3}
                  className={inputCls}
                  defaultValue={action.description ?? ""}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-base font-bold tracking-tight text-stone-900">
              Where it is
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="site_name" className={labelCls}>
                  Site name
                </label>
                <input
                  id="site_name"
                  name="site_name"
                  type="text"
                  className={inputCls}
                  defaultValue={(loc.name as string) ?? ""}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className={labelCls}>
                  Address *
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  className={inputCls}
                  defaultValue={(loc.address as string) ?? ""}
                />
              </div>
              <div>
                <label htmlFor="city" className={labelCls}>
                  City *
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className={inputCls}
                  defaultValue={(loc.city as string) ?? ""}
                />
              </div>
              <div>
                <label htmlFor="state" className={labelCls}>
                  Region / state *
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  className={inputCls}
                  defaultValue={(loc.state as string) ?? ""}
                />
              </div>
              <div>
                <label htmlFor="zip_code" className={labelCls}>
                  ZIP / postal code *
                </label>
                <input
                  id="zip_code"
                  name="zip_code"
                  type="text"
                  required
                  className={inputCls}
                  defaultValue={(loc.zip_code as string) ?? ""}
                />
              </div>
              <div>
                <label htmlFor="country" className={labelCls}>
                  Country *
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  className={inputCls}
                  defaultValue={(loc.country as string) ?? "FR"}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-base font-bold tracking-tight text-stone-900">
              What you need
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="service_type" className={labelCls}>
                  Service type *
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  required
                  defaultValue={action.action_type}
                  className={inputCls}
                >
                  {SERVICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <span className={labelCls}>SLA tier *</span>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {SLA_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-all hover:border-stone-300 has-[input:checked]:border-fox-orange has-[input:checked]:bg-fox-orange/5"
                    >
                      <input
                        type="radio"
                        name="sla_tier"
                        value={o.value}
                        required
                        defaultChecked={o.value === currentTier}
                        className="h-4 w-4 accent-fox-orange"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-stone-900">
                          {o.label}
                        </span>
                        <p className="text-[11px] text-stone-500">
                          {o.response}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Save changes
            </button>
            <Link
              href="/client/dashboard"
              className="text-sm text-stone-500 hover:text-stone-900"
            >
              Cancel
            </Link>
          </div>
        </form>
      ) : (
        <div className="mt-6 max-w-2xl space-y-3">
          {[
            { label: "Asset", value: asset?.name },
            {
              label: "Network type",
              value: NETWORK_LABEL[networkType] ?? networkType,
            },
            { label: "Problem", value: action.description },
            { label: "Service type", value: action.action_type },
            { label: "SLA tier", value: SLA_OPTIONS.find((o) => o.value === currentTier)?.label },
            { label: "Site", value: loc.name },
            { label: "Address", value: loc.address },
            { label: "City", value: loc.city },
            { label: "Region / state", value: loc.state },
            { label: "ZIP", value: loc.zip_code },
            { label: "Country", value: loc.country },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-baseline justify-between gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3"
            >
              <span className="text-xs font-medium text-stone-500">
                {f.label}
              </span>
              <span className="text-right text-sm text-stone-800">
                {val(f.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
