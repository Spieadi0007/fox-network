import Link from "next/link";
import { createServerClient } from "@fox/supabase/client/server";
import { ChevronRight, AlertTriangle, FileText } from "lucide-react";

// Visits recorded against a work order, each linking to its report.
// Without this the reports exist but are unreachable from the dashboard.

type VisitRow = {
  id: string;
  visit_number: number | null;
  outcome: string | null;
  submitted_at: string | null;
  ended_at: string | null;
  technician: { name: string | null; email: string | null } | null;
};

const OUTCOME_STYLE: Record<string, string> = {
  successful: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  unsuccessful: "bg-red-100 text-red-700",
  cancelled: "bg-stone-100 text-stone-500",
};

export async function Visits({ actionId }: { actionId: string }) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: rows } = await db
    .from("action_entries")
    .select(
      "id, visit_number, outcome, submitted_at, ended_at, technician:profiles!technician_id(name, email)",
    )
    .eq("action_id", actionId)
    .order("visit_number", { ascending: true });

  const visits: VisitRow[] = rows ?? [];
  if (visits.length === 0) return null;

  // One query for all of them rather than one per visit.
  const { data: failureRows } = await db
    .from("action_entry_steps")
    .select("entry_id")
    .in(
      "entry_id",
      visits.map((v) => v.id),
    )
    .eq("is_failure", true);

  const failureCount = new Map<string, number>();
  for (const r of failureRows ?? []) {
    failureCount.set(r.entry_id, (failureCount.get(r.entry_id) ?? 0) + 1);
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-6 py-4">
        <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-stone-900">
          Visits
        </h3>
      </div>
      <div className="divide-y divide-stone-100">
        {visits.map((v) => {
          const failures = failureCount.get(v.id) ?? 0;
          const when = v.submitted_at ?? v.ended_at;
          return (
            <Link
              key={v.id}
              href={`/dashboard/reports/${v.id}`}
              className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-stone-50"
            >
              <FileText className="h-4 w-4 flex-shrink-0 text-stone-300" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-800">
                  Visit #{v.visit_number ?? 1}
                  <span className="ml-2 font-normal text-stone-400">
                    {v.technician?.name || v.technician?.email || ""}
                  </span>
                </p>
                <p className="text-xs text-stone-400">
                  {when
                    ? new Date(when).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not submitted"}
                </p>
              </div>

              {failures > 0 && (
                <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  <AlertTriangle className="h-3 w-3" />
                  {failures}
                </span>
              )}
              {v.outcome && (
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    OUTCOME_STYLE[v.outcome] ?? "bg-stone-100 text-stone-500"
                  }`}
                >
                  {v.outcome}
                </span>
              )}
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
