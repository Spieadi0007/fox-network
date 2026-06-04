import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { ArrowRight, Plus } from "lucide-react";
import { ClickableRow } from "./clickable-row";

type RequestRow = {
  id: string;
  name: string;
  status: string;
  priority: string;
  category: string | null;
  estimated_cost: number | null;
  description: string | null;
  created_at: string;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-stone-100 text-stone-500 border-stone-200",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Relaxed",
  medium: "Standard",
  high: "Urgent",
  critical: "Emergency",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ");
}

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
  if (!profile?.organization_id) redirect("/client/signin");

  const { data: rows } = await db
    .from("actions")
    .select(
      "id, name, status, priority, category, estimated_cost, description, created_at",
    )
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  const requests: RequestRow[] = rows ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
            Your requests
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Every intervention you&apos;ve booked with us.
          </p>
        </div>
        <Link
          href="/client/dashboard/new"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" />
          New request
        </Link>
      </div>

      {success && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-900">
            No requests yet
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Book your first intervention — it takes about two minutes.
          </p>
          <Link
            href="/client/dashboard/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-stone-800"
          >
            Book first intervention
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Network</th>
                <th className="px-5 py-3">SLA</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {requests.map((r) => (
                <ClickableRow
                  key={r.id}
                  href={`/client/dashboard/${r.id}`}
                  className="text-sm"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-900">{r.name}</p>
                    {r.description && (
                      <p className="mt-0.5 truncate text-xs text-stone-500">
                        {r.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-stone-600">
                    {r.category ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-stone-600">
                    {PRIORITY_LABEL[r.priority] ?? r.priority}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                        STATUS_STYLE[r.status] ??
                        "border-stone-200 bg-stone-50 text-stone-600"
                      }`}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-stone-700">
                    {r.estimated_cost != null
                      ? `€${Number(r.estimated_cost).toFixed(0)}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-right text-xs text-stone-500">
                    {formatDate(r.created_at)}
                  </td>
                </ClickableRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
