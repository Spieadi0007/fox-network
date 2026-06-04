import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllClientRequests } from "@fox/supabase/actions/client-requests";
import { Inbox } from "lucide-react";

type RequestRow = {
  id: string;
  name: string;
  status: string;
  priority: string;
  category: string | null;
  estimated_cost: number | null;
  description: string | null;
  created_at: string;
  location: { name: string | null; city: string | null } | null;
  organization: { name: string | null } | null;
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
  low: "Lazy",
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

export default async function RequestsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");

  const { data } = await getAllClientRequests();
  const requests = (data ?? []) as RequestRow[];

  return (
    <div className="p-8">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
        Client requests
      </h1>
      <p className="mt-1 text-sm text-stone-400">
        Every intervention requested across all companies.
      </p>

      {requests.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <Inbox className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-3 text-sm font-medium text-stone-700">
            No requests yet
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Client-submitted interventions will appear here. If you expect to
            see requests but don&apos;t, your account needs{" "}
            <code className="font-mono">fox_staff = true</code>.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Network</th>
                <th className="px-5 py-3">SLA</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Price</th>
                <th className="px-5 py-3 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {requests.map((r) => (
                <tr key={r.id} className="text-sm">
                  <td className="px-5 py-4 font-medium text-stone-900">
                    {r.organization?.name ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-stone-800">{r.name}</p>
                    {r.description && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-stone-500">
                        {r.description}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-stone-600">
                    {r.location?.name ?? "—"}
                    {r.location?.city ? (
                      <span className="text-stone-400">, {r.location.city}</span>
                    ) : null}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
