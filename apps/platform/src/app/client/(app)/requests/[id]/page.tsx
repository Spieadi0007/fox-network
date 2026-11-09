import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { getAuthUser } from "@/lib/auth";
import { updateClientRequest } from "@fox/supabase/actions/client-requests";
import {
  AlertTriangle,
  Building2,
  CheckSquare,
  CircleCheck,
  CircleX,
  MessageSquare,
  Wrench,
} from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  ApprovalPill,
  Badge,
  Card,
  ElevatedCard,
  EmptyBox,
  FieldBlock,
  Notice,
  PageHeader,
  Row,
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
  { value: "lazy", label: "Relaxed", response: "Within 5 business days" },
  { value: "standard", label: "Standard", response: "Within 72 hours" },
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

type Step = {
  id: string;
  step_label: string;
  section_title: string;
  is_failure: boolean;
  completed_at: string | null;
};

function formatDateTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * One request, as the client sees it (issue #31).
 *
 * Three columns: what was done on the left, the problem in the middle (the
 * reason the page exists, so it's the raised card), who and where on the
 * right, and the closing comment underneath. While the request is pending
 * the same layout holds inputs instead of values, so editing and reading look
 * like the same page.
 *
 * Field mapping: Problem is what the client typed (`description`); the
 * detailed description is our team's write-up (`notes`); the comment is the
 * note left when the work was closed (`completion_notes`).
 */
export default async function ClientRequestDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error, success } = await searchParams;

  // Identity from the headers middleware set — no round trip.
  const user = await getAuthUser();
  if (!user?.organizationId) redirect("/client/signin");

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const orgId = user.organizationId;
  if (!orgId) redirect("/client/signin");

  const { data: action } = await db
    .from("actions")
    .select(
      "id, name, description, notes, completion_notes, status, approval_status, priority, action_type, scheduled_start, created_at, location_id, asset_id, organization_id, location:locations(name, address, city, state, zip_code, country, contact_name, contact_phone, contact_email)",
    )
    .eq("id", id)
    .single();

  if (!action || action.organization_id !== orgId) notFound();

  const [assetRes, orgRes, entriesRes] = await Promise.all([
    action.asset_id
      ? db.from("assets").select("name").eq("id", action.asset_id).limit(1)
      : Promise.resolve({ data: [] }),
    db.from("organizations").select("network_type").eq("id", orgId).single(),
    db.from("action_entries").select("id").eq("action_id", action.id),
  ]);
  const asset: { name: string | null } | null = assetRes.data?.[0] ?? null;
  const networkType = (orgRes.data?.network_type as string) || "other";

  // The steps the technician worked through on site, across every visit.
  const entryIds: string[] = (entriesRes.data ?? []).map((e: { id: string }) => e.id);
  let steps: Step[] = [];
  if (entryIds.length > 0) {
    const { data } = await db
      .from("action_entry_steps")
      .select("id, step_label, section_title, is_failure, completed_at")
      .in("entry_id", entryIds)
      .order("section_position")
      .order("step_position");
    steps = data ?? [];
  }

  const loc = (action.location as Record<string, string | null> | null) ?? {};
  const isPending = action.approval_status === "pending";
  const currentTier = TIER_BY_PRIORITY[action.priority] ?? "standard";
  const tierLabel = SLA_OPTIONS.find((o) => o.value === currentTier)?.label;

  const sub =
    action.approval_status === "rejected"
      ? "This request was rejected. Contact your maintenance manager for details."
      : isPending
        ? "Pending approval — you can still edit the details below."
        : "Approved and scheduled — it can no longer be edited.";

  const detailedAction = (
    <Card>
      <SectionLabel icon={CheckSquare}>Detailed action</SectionLabel>
      {steps.length === 0 ? (
        <EmptyBox>No action steps added yet.</EmptyBox>
      ) : (
        <ul className="flex flex-col">
          {steps.map((s) => (
            <li key={s.id} className="flex items-start gap-2.5 border-b border-portal-border-soft py-2.5 last:border-b-0">
              {s.is_failure ? (
                <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-portal-bad" />
              ) : s.completed_at ? (
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-portal-good" />
              ) : (
                <span className="mt-[3px] h-3.5 w-3.5 shrink-0 rounded-full border-2 border-portal-muted" />
              )}
              <span className="text-[14px] leading-snug text-portal-text">{s.step_label}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );

  const comment = (
    <Card>
      <SectionLabel icon={MessageSquare}>Comment</SectionLabel>
      {action.completion_notes ? (
        <p className="whitespace-pre-line text-[15px] leading-relaxed text-portal-text">{action.completion_notes}</p>
      ) : (
        <EmptyBox className="text-[15px]">No comment added yet.</EmptyBox>
      )}
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        back={{ href: "/client/requests", label: "Back to requests" }}
        title={action.name}
        pill={<ApprovalPill status={action.approval_status} />}
        sub={sub}
      />

      {error && <Notice tone="error">{error}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      {isPending ? (
        <form action={updateClientRequest} className="flex flex-col gap-8">
          <input type="hidden" name="request_id" value={action.id} />

          <div className="grid items-start gap-6 lg:grid-cols-[270px_1fr_300px]">
            <div className="order-2 lg:order-none">{detailedAction}</div>

            <div className="order-first lg:order-none">
              <ElevatedCard>
                <SectionLabel icon={AlertTriangle} accent>
                  Problem &amp; description
                </SectionLabel>
                <div className="flex flex-col gap-5">
                  <div>
                    <label htmlFor="asset_label" className={labelCls}>
                      Asset name / ID *
                    </label>
                    <input id="asset_label" name="asset_label" type="text" required className={inputCls} defaultValue={asset?.name ?? ""} />
                    <p className="mt-1.5 text-xs text-portal-dim">
                      Network type: {NETWORK_LABEL[networkType] ?? networkType}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="problem_description" className={labelCls}>
                      Problem
                    </label>
                    <textarea id="problem_description" name="problem_description" rows={5} className={inputCls} defaultValue={action.description ?? ""} />
                  </div>
                </div>
              </ElevatedCard>
            </div>

            <div className="order-1 flex flex-col gap-6 lg:order-none">
              <Card>
                <SectionLabel icon={Building2}>Client</SectionLabel>
                <div className="flex flex-col gap-3.5">
                  <div>
                    <label htmlFor="site_name" className={labelCls}>Site</label>
                    <input id="site_name" name="site_name" type="text" className={inputCls} defaultValue={loc.name ?? ""} />
                  </div>
                  <div>
                    <label htmlFor="address" className={labelCls}>Address *</label>
                    <input id="address" name="address" type="text" required className={inputCls} defaultValue={loc.address ?? ""} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="city" className={labelCls}>City *</label>
                      <input id="city" name="city" type="text" required className={inputCls} defaultValue={loc.city ?? ""} />
                    </div>
                    <div>
                      <label htmlFor="zip_code" className={labelCls}>Postal code *</label>
                      <input id="zip_code" name="zip_code" type="text" required className={inputCls} defaultValue={loc.zip_code ?? ""} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="state" className={labelCls}>Region *</label>
                      <input id="state" name="state" type="text" required className={inputCls} defaultValue={loc.state ?? ""} />
                    </div>
                    <div>
                      <label htmlFor="country" className={labelCls}>Country *</label>
                      <input id="country" name="country" type="text" required className={inputCls} defaultValue={loc.country ?? "FR"} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionLabel icon={Wrench}>Asset</SectionLabel>
                <div className="flex flex-col gap-3.5">
                  <div>
                    <label htmlFor="service_type" className={labelCls}>Service type *</label>
                    <select id="service_type" name="service_type" required defaultValue={action.action_type} className={inputCls}>
                      {SERVICE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className={labelCls}>SLA tier *</span>
                    <div className="mt-1.5 flex flex-col gap-2">
                      {SLA_OPTIONS.map((o) => (
                        <label
                          key={o.value}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-portal-border bg-portal-surface px-3 py-2.5 transition-colors hover:border-portal-muted has-[input:checked]:border-portal-accent-border has-[input:checked]:bg-portal-accent-bg"
                        >
                          <input type="radio" name="sla_tier" value={o.value} required defaultChecked={o.value === currentTier} className="h-4 w-4 accent-[#7a5514]" />
                          <span className="flex-1">
                            <span className="block text-sm font-bold text-portal-text">{o.label}</span>
                            <span className="block text-[12px] text-portal-dim">{o.response}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {comment}

          <div className="flex items-center gap-4">
            <SubmitButton pendingLabel="Saving…" className={buttonPrimary}>
              Save changes
            </SubmitButton>
            <Link href="/client/requests" className="text-sm font-medium text-portal-dim hover:text-portal-text">
              Cancel
            </Link>
          </div>
        </form>
      ) : (
        <>
          <div className="grid items-start gap-6 lg:grid-cols-[270px_1fr_300px]">
            <div className="order-2 lg:order-none">{detailedAction}</div>

            <div className="order-first lg:order-none">
              <ElevatedCard>
                <SectionLabel icon={AlertTriangle} accent>
                  Problem &amp; description
                </SectionLabel>
                <FieldBlock label="Problem">
                  {action.description ? (
                    <div className="whitespace-pre-line text-[23px] font-bold tracking-[-0.01em] text-portal-text">{action.description}</div>
                  ) : (
                    <div className="text-base italic text-portal-muted">No problem described.</div>
                  )}
                </FieldBlock>
                <FieldBlock label="Description">
                  {action.notes ? (
                    <div className="whitespace-pre-line text-base leading-[1.65] text-portal-text">{action.notes}</div>
                  ) : (
                    <div className="text-base italic text-portal-muted">No detailed description provided yet.</div>
                  )}
                </FieldBlock>
              </ElevatedCard>
            </div>

            <div className="order-1 flex flex-col gap-6 lg:order-none">
              <Card>
                <SectionLabel icon={Building2}>Client</SectionLabel>
                <Row label="Site" value={loc.name} />
                <Row label="Contact person" value={loc.contact_name} />
                <Row label="Phone" value={loc.contact_phone} />
                <Row label="Email" value={loc.contact_email} />
                <Row label="Address" value={loc.address} />
                <Row label="City" value={loc.city} />
                <Row label="Region / state" value={loc.state} />
                <Row label="Postal code" value={loc.zip_code} />
              </Card>

              <Card>
                <SectionLabel icon={Wrench}>Asset</SectionLabel>
                <Row label="Asset" value={asset?.name} />
                <Row label="Network type" value={NETWORK_LABEL[networkType] ?? networkType} />
                <Row label="Service type" value={action.action_type ? <Badge>{action.action_type}</Badge> : null} />
                <Row label="SLA tier" value={tierLabel} />
                <Row label="Scheduled" value={formatDateTime(action.scheduled_start)} empty="Not scheduled yet" />
              </Card>
            </div>
          </div>

          {comment}
        </>
      )}
    </div>
  );
}
