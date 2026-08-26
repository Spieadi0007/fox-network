import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import {
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Wrench,
  FolderOpen,
} from "lucide-react";

type RequestRow = {
  id: string;
  name: string;
  status: string;
  approval_status: string;
  priority: string;
  created_at: string;
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Relaxed",
  medium: "Standard",
  high: "Urgent",
  critical: "Emergency",
};

const APPROVAL_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const APPROVAL_LABEL: Record<string, string> = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ClientOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/client/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("organization_id, name")
    .eq("id", user.id)
    .single();
  if (!profile?.organization_id) redirect("/client/signin");

  const [{ data: rows }, { count: documentCount }] = await Promise.all([
    db
      .from("actions")
      .select("id, name, status, approval_status, priority, created_at")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false }),
    db
      .from("client_documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id),
  ]);

  const requests: RequestRow[] = rows ?? [];

  // Counted here rather than in SQL: the list is already loaded for the
  // "recent" panel below, and a client's request count is in the dozens.
  const awaiting = requests.filter(
    (r) => r.approval_status === "pending",
  ).length;
  const inProgress = requests.filter(
    (r) => r.approval_status === "approved" && r.status !== "completed",
  ).length;
  const completed = requests.filter((r) => r.status === "completed").length;

  const firstName = (profile.name as string | null)?.split(" ")[0];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Where your maintenance stands today.
          </p>
        </div>
        <Link
          href="/client/requests/new"
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Awaiting approval"
          value={awaiting}
          icon={Clock}
          tone="amber"
          href="/client/requests"
        />
        <Stat
          label="In progress"
          value={inProgress}
          icon={Wrench}
          tone="blue"
          href="/client/requests"
        />
        <Stat
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          tone="emerald"
          href="/client/requests"
        />
        <Stat
          label="Documents"
          value={documentCount ?? 0}
          icon={FolderOpen}
          tone="stone"
          href="/client/library"
        />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-900">
            Recent requests
          </h2>
          {requests.length > 0 && (
            <Link
              href="/client/requests"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fox-orange transition-colors hover:text-fox-orange/80"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-stone-900">
              No requests yet
            </p>
            <p className="mt-2 text-sm text-stone-500">
              Book your first intervention — it takes about two minutes.
            </p>
            <Link
              href="/client/requests/new"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-stone-800"
            >
              Book first intervention
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/client/requests/${r.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {r.name}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500">
                      {PRIORITY_LABEL[r.priority] ?? r.priority} ·{" "}
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      APPROVAL_STYLE[r.approval_status] ??
                      "border-stone-200 bg-stone-50 text-stone-600"
                    }`}
                  >
                    {APPROVAL_LABEL[r.approval_status] ?? r.approval_status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  stone: "bg-stone-100 text-stone-600",
};

function Stat({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONES | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-stone-200 bg-white p-5 transition-all hover:border-stone-300 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${TONES[tone] ?? TONES.stone}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <ArrowRight className="h-4 w-4 text-stone-300 transition-colors group-hover:text-stone-500" />
      </div>
      <p className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-stone-500">{label}</p>
    </Link>
  );
}
