import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { submitClientRequest } from "@fox/supabase/actions/client-requests";

const SERVICE_OPTIONS = [
  { value: "maintenance", label: "Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "inspection", label: "Inspection" },
  { value: "installation", label: "Installation" },
];

const SLA_OPTIONS = [
  { value: "lazy", label: "Relaxed", response: "Within 5 business days", price: 120 },
  { value: "standard", label: "Standard", response: "Within 48 hours", price: 200 },
  { value: "urgent", label: "Urgent", response: "Within 24 hours", price: 300 },
  { value: "emergency", label: "Emergency", response: "Within 4 hours, 24/7", price: 420 },
];

const labelCls = "block text-sm font-medium text-stone-700";
const inputCls =
  "mt-1 block w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-fox-orange focus:outline-none focus:ring-1 focus:ring-fox-orange";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div>
      <Link
        href="/client/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to requests
      </Link>

      <div className="mt-4">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          New request
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Tell us what&apos;s broken, where it is, and how fast you need us.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        action={submitClientRequest}
        className="mt-8 grid gap-6 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          {/* Section: Asset */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-base font-bold tracking-tight text-stone-900">
              What&apos;s broken
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              The machine that needs attention.
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
                  placeholder="LK-204"
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
                  placeholder="Door won't open. Payment terminal seems unresponsive."
                />
              </div>
            </div>
          </section>

          {/* Section: Location */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-base font-bold tracking-tight text-stone-900">
              Where it is
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              The site address — so we can dispatch a technician.
            </p>

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
                  placeholder="Carrefour Lyon Part-Dieu"
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
                  placeholder="17 Rue du Docteur Bouchut"
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
                  placeholder="Lyon"
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
                  placeholder="Auvergne-Rhône-Alpes"
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
                  placeholder="69003"
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
                  defaultValue="FR"
                  className={inputCls}
                  placeholder="FR"
                />
              </div>
            </div>
          </section>

          {/* Section: Service */}
          <section className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-base font-bold tracking-tight text-stone-900">
              What you need
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Service type and SLA. Price is locked in before you submit.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="service_type" className={labelCls}>
                  Service type *
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  required
                  defaultValue="maintenance"
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
                  {SLA_OPTIONS.map((o, i) => (
                    <label
                      key={o.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-all hover:border-stone-300 has-[input:checked]:border-fox-orange has-[input:checked]:bg-fox-orange/5"
                    >
                      <input
                        type="radio"
                        name="sla_tier"
                        value={o.value}
                        required
                        defaultChecked={i === 1}
                        className="h-4 w-4 accent-fox-orange"
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-stone-900">
                            {o.label}
                          </span>
                          <span className="font-mono text-sm font-semibold text-stone-900">
                            €{o.price}
                          </span>
                        </div>
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
        </div>

        {/* Sticky submit panel */}
        <aside className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-stone-200 bg-white p-6">
            <h3 className="font-[family-name:var(--font-heading)] text-base font-bold tracking-tight text-stone-900">
              Ready to submit?
            </h3>
            <p className="mt-2 text-xs text-stone-500">
              We&apos;ll assign a technician, confirm the visit window, and
              update you on the dashboard. Your dedicated maintenance manager
              is copied on every request.
            </p>
            <button
              type="submit"
              className="mt-5 w-full cursor-pointer rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Submit request
            </button>
            <Link
              href="/client/dashboard"
              className="mt-3 block text-center text-xs text-stone-500 hover:text-stone-900"
            >
              Cancel
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
