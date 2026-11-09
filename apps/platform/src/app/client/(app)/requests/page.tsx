import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { getAuthUser } from "@/lib/auth";
import { ArrowRight, Plus } from "lucide-react";
import { ClickableRow } from "./clickable-row";
import {
  ApprovalPill,
  EmptyState,
  Notice,
  PageHeader,
  SLA_LABEL,
  buttonPrimary,
  tableCls,
  tableWrapCls,
  tbodyCls,
  thCls,
  theadCls,
} from "../portal-ui";

type RequestRow = {
  id: string;
  name: string;
  status: string;
  approval_status: string;
  priority: string;
  category: string | null;
  estimated_cost: number | null;
  description: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const success = params.success;

  // Identity from the headers middleware set — no round trip.
  const user = await getAuthUser();
  if (!user?.organizationId) redirect("/client/signin");

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  if (!user.organizationId) redirect("/client/signin");

  const { data: rows } = await db
    .from("actions")
    .select(
      "id, name, status, approval_status, priority, category, estimated_cost, description, created_at",
    )
    .eq("organization_id", user.organizationId)
    .order("created_at", { ascending: false });

  const requests: RequestRow[] = rows ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Your requests"
        sub="Every intervention you've booked with us."
        actions={
          <Link href="/client/requests/new" className={buttonPrimary}>
            <Plus className="h-4 w-4" />
            New request
          </Link>
        }
      />

      {success && <Notice tone="success">{success}</Notice>}

      {requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          body="Book your first intervention — it takes about two minutes."
          action={
            <Link href="/client/requests/new" className={buttonPrimary}>
              Book first intervention
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className={tableWrapCls}>
          <table className={`${tableCls} min-w-[760px]`}>
            <thead className={theadCls}>
              <tr>
                <th className={thCls}>Request</th>
                <th className={thCls}>Network</th>
                <th className={thCls}>SLA</th>
                <th className={thCls}>Status</th>
                <th className={`${thCls} text-right`}>Price</th>
                <th className={`${thCls} text-right`}>Submitted</th>
              </tr>
            </thead>
            <tbody className={tbodyCls}>
              {requests.map((r) => (
                <ClickableRow key={r.id} href={`/client/requests/${r.id}`} className="text-sm">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-portal-text">{r.name}</p>
                    {r.description && (
                      <p className="mt-0.5 max-w-[320px] truncate text-[13px] text-portal-dim">{r.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-portal-dim">
                    {r.category ?? <span className="italic text-portal-muted">—</span>}
                  </td>
                  <td className="px-5 py-4 text-portal-text">{SLA_LABEL[r.priority] ?? r.priority}</td>
                  <td className="px-5 py-4">
                    <ApprovalPill status={r.approval_status} size="sm" />
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-portal-text">
                    {r.estimated_cost != null ? `€${Number(r.estimated_cost).toFixed(0)}` : "—"}
                  </td>
                  <td className="px-5 py-4 text-right text-[13px] text-portal-dim">{formatDate(r.created_at)}</td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
