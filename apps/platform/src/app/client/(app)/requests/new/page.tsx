import Link from "next/link";
import { AlertTriangle, Building2, Send, Wrench } from "lucide-react";
import { submitClientRequest } from "@fox/supabase/actions/client-requests";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Card,
  ElevatedCard,
  Notice,
  PageHeader,
  SectionLabel,
  buttonPrimary,
  inputCls,
  labelCls,
} from "../../portal-ui";

const SERVICE_OPTIONS = [
  { value: "maintenance", label: "Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "inspection", label: "Inspection" },
  { value: "installation", label: "Installation" },
];

const SLA_OPTIONS = [
  { value: "lazy", label: "Relaxed", response: "Within 5 business days", price: 150 },
  { value: "standard", label: "Standard", response: "Within 72 hours", price: 200 },
  { value: "urgent", label: "Urgent", response: "Within 24 hours", price: 300 },
  { value: "emergency", label: "Emergency", response: "Within 4 hours, 24/7", price: 420 },
];

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        back={{ href: "/client/requests", label: "Back to requests" }}
        title="New request"
        sub="Tell us what's broken, where it is, and how fast you need us."
      />

      {error && <Notice tone="error">{error}</Notice>}

      <form action={submitClientRequest} className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* Generated per render. submitClientRequest claims it before
            creating anything, so posting this form twice — the
            double-click the submit button cannot catch until React has
            hydrated — produces one request, not two. */}
        <input type="hidden" name="submission_key" value={crypto.randomUUID()} />

        <div className="flex flex-col gap-6">
          <ElevatedCard>
            <SectionLabel icon={AlertTriangle} accent>
              Problem &amp; description
            </SectionLabel>
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="asset_label" className={labelCls}>
                  Asset name / ID *
                </label>
                <input id="asset_label" name="asset_label" type="text" required className={inputCls} placeholder="LK-204" />
                <p className="mt-1.5 text-xs text-portal-dim">The machine that needs attention.</p>
              </div>
              <div>
                <label htmlFor="problem_description" className={labelCls}>
                  What&apos;s the problem?
                </label>
                <textarea
                  id="problem_description"
                  name="problem_description"
                  rows={4}
                  className={inputCls}
                  placeholder="Door won't open. Payment terminal seems unresponsive."
                />
              </div>
            </div>
          </ElevatedCard>

          <Card>
            <SectionLabel icon={Building2}>Where it is</SectionLabel>
            <p className="-mt-1.5 mb-4 text-[13px] text-portal-dim">The site address, so we can dispatch a technician.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="site_name" className={labelCls}>Site name</label>
                <input id="site_name" name="site_name" type="text" className={inputCls} placeholder="Carrefour Lyon Part-Dieu" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className={labelCls}>Address *</label>
                <input id="address" name="address" type="text" required className={inputCls} placeholder="17 Rue du Docteur Bouchut" />
              </div>
              <div>
                <label htmlFor="city" className={labelCls}>City *</label>
                <input id="city" name="city" type="text" required className={inputCls} placeholder="Lyon" />
              </div>
              <div>
                <label htmlFor="state" className={labelCls}>Region / state *</label>
                <input id="state" name="state" type="text" required className={inputCls} placeholder="Auvergne-Rhône-Alpes" />
              </div>
              <div>
                <label htmlFor="zip_code" className={labelCls}>Postal code *</label>
                <input id="zip_code" name="zip_code" type="text" required className={inputCls} placeholder="69003" />
              </div>
              <div>
                <label htmlFor="country" className={labelCls}>Country *</label>
                <input id="country" name="country" type="text" required defaultValue="FR" className={inputCls} placeholder="FR" />
              </div>
            </div>
          </Card>

          <Card>
            <SectionLabel icon={Wrench}>What you need</SectionLabel>
            <p className="-mt-1.5 mb-4 text-[13px] text-portal-dim">Service type and SLA. The price is locked in before you submit.</p>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="service_type" className={labelCls}>Service type *</label>
                <select id="service_type" name="service_type" required defaultValue="maintenance" className={inputCls}>
                  {SERVICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className={labelCls}>SLA tier *</span>
                <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                  {SLA_OPTIONS.map((o, i) => (
                    <label
                      key={o.value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-portal-border bg-portal-surface px-3.5 py-3 transition-colors hover:border-portal-muted has-[input:checked]:border-portal-accent-border has-[input:checked]:bg-portal-accent-bg"
                    >
                      <input type="radio" name="sla_tier" value={o.value} required defaultChecked={i === 1} className="h-4 w-4 accent-[#7a5514]" />
                      <span className="flex-1">
                        <span className="block text-sm font-bold text-portal-text">{o.label}</span>
                        <span className="block text-[12px] text-portal-dim">{o.response}</span>
                      </span>
                      <span className="font-mono text-sm font-semibold text-portal-text">€{o.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-8">
          <ElevatedCard className="px-6 py-6">
            <SectionLabel icon={Send}>Ready to submit?</SectionLabel>
            <p className="text-[14px] leading-relaxed text-portal-dim">
              We&apos;ll assign a technician, confirm the visit window, and update you on the dashboard. Your dedicated
              maintenance manager is copied on every request.
            </p>
            <SubmitButton pendingLabel="Submitting…" className={`${buttonPrimary} mt-5 w-full py-3`}>
              Submit request
            </SubmitButton>
            <Link href="/client/requests" className="mt-3 block text-center text-[13px] font-medium text-portal-dim hover:text-portal-text">
              Cancel
            </Link>
          </ElevatedCard>
        </aside>
      </form>
    </div>
  );
}
