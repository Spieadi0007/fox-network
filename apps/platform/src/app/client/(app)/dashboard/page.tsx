import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import { getAuthUser } from "@/lib/auth";
import {
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  ClipboardList,
  Wrench,
  FolderOpen,
} from "lucide-react";
import {
  ApprovalPill,
  Card,
  EmptyState,
  Notice,
  PageHeader,
  SLA_LABEL,
  SectionLabel,
  buttonPrimary,
  linkCls,
  type Tone,
} from "../portal-ui";

type RequestRow = {
  id: string;
  name: string;
  status: string;
  approval_status: string;
  priority: string;
  created_at: string;
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

  // Identity from the headers middleware set — no round trip.
  const user = await getAuthUser();
  if (!user?.organizationId) redirect("/client/signin");

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  if (!user.organizationId) redirect("/client/signin");

  const [{ data: rows }, { count: documentCount }] = await Promise.all([
    db
      .from("actions")
      .select("id, name, status, approval_status, priority, created_at")
      .eq("organization_id", user.organizationId)
      .order("created_at", { ascending: false }),
    db
      .from("client_documents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", user.organizationId),
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

  const firstName = user.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        sub="Where your maintenance stands today."
        actions={
          <Link href="/client/requests/new" className={buttonPrimary}>
            <Plus className="h-4 w-4" />
            New request
          </Link>
        }
      />

      {success && <Notice tone="success">{success}</Notice>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Awaiting approval" value={awaiting} icon={Clock} tone="accent" href="/client/requests" />
        <Stat label="In progress" value={inProgress} icon={Wrench} tone="neutral" href="/client/requests" />
        <Stat label="Completed" value={completed} icon={CheckCircle2} tone="good" href="/client/requests" />
        <Stat label="Documents" value={documentCount ?? 0} icon={FolderOpen} tone="neutral" href="/client/library" />
      </div>

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
        <Card>
          <SectionLabel
            icon={ClipboardList}
            action={
              <Link href="/client/requests" className={`${linkCls} normal-case tracking-normal`}>
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            Recent requests
          </SectionLabel>
          <ul className="flex flex-col">
            {requests.slice(0, 5).map((r) => (
              <li key={r.id} className="border-b border-portal-border-soft last:border-b-0">
                <Link
                  href={`/client/requests/${r.id}`}
                  className="-mx-2 flex items-center justify-between gap-4 rounded-xl px-2 py-3.5 transition-colors hover:bg-portal-sunken"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-portal-text">{r.name}</p>
                    <p className="mt-0.5 text-[13px] text-portal-dim">
                      {SLA_LABEL[r.priority] ?? r.priority} · {formatDate(r.created_at)}
                    </p>
                  </div>
                  <ApprovalPill status={r.approval_status} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

const ICON_TONE: Record<Tone, string> = {
  good: "bg-portal-good-bg text-portal-good",
  accent: "bg-portal-accent-bg text-portal-accent",
  bad: "bg-portal-bad-bg text-portal-bad",
  neutral: "bg-portal-sunken text-portal-dim",
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
  tone: Tone;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-portal-border bg-portal-surface px-6 py-5 transition-all hover:border-portal-muted hover:shadow-[0_2px_14px_rgba(32,31,28,0.05)]"
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${ICON_TONE[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
        <ArrowRight className="h-4 w-4 text-portal-muted transition-colors group-hover:text-portal-text" />
      </div>
      <p className="mt-4 text-[28px] font-extrabold tracking-[-0.01em] text-portal-text">{value}</p>
      <p className="mt-0.5 text-[12px] font-bold uppercase tracking-[0.06em] text-portal-dim">{label}</p>
    </Link>
  );
}
