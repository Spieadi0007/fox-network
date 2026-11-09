import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The client portal's visual language, from the intervention-detail design
 * in issue #31: warm paper background, quiet bordered cards, small uppercase
 * section labels with an icon, label/value rows, and pills for state.
 *
 * Every client page builds from these so the portal reads as one product.
 */

// ── Page frame ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  sub,
  pill,
  back,
  actions,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  pill?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {back && (
        <Link
          href={back.href}
          className="mb-2 inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-portal-dim transition-colors hover:text-portal-text"
        >
          <ArrowLeft className="h-4 w-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3.5">
          <h1 className="text-balance text-[28px] font-extrabold tracking-[-0.01em] text-portal-text">
            {title}
          </h1>
          {pill}
        </div>
        {actions}
      </div>
      {sub && <p className="text-sm text-portal-dim">{sub}</p>}
    </div>
  );
}

// ── State ───────────────────────────────────────────────────────────────────

export type Tone = "good" | "accent" | "bad" | "neutral";

const PILL: Record<Tone, string> = {
  good: "text-portal-good bg-portal-good-bg border-portal-good-border",
  accent: "text-portal-accent bg-portal-accent-bg border-portal-accent-border",
  bad: "text-portal-bad bg-portal-bad-bg border-portal-bad-border",
  neutral: "text-portal-dim bg-portal-sunken border-portal-border",
};

const DOT: Record<Tone, string> = {
  good: "bg-portal-good",
  accent: "bg-portal-accent",
  bad: "bg-portal-bad",
  neutral: "bg-portal-muted",
};

export function StatusPill({
  tone,
  size = "md",
  children,
}: {
  tone: Tone;
  size?: "sm" | "md";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-bold",
        size === "md" ? "px-3.5 py-[5px] text-[13px]" : "px-2.5 py-0.5 text-[11.5px]",
        PILL[tone],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])} />
      {children}
    </span>
  );
}

/** Accent badge for a category value, e.g. the service type. */
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-portal-accent-border bg-portal-accent-bg px-3 py-1 text-sm font-bold capitalize text-portal-accent">
      {children}
    </span>
  );
}

/** A request's approval state, as the client sees it. */
export const APPROVAL: Record<string, { tone: Tone; label: string }> = {
  pending: { tone: "accent", label: "Pending approval" },
  approved: { tone: "good", label: "Approved" },
  rejected: { tone: "bad", label: "Rejected" },
};

export function ApprovalPill({ status, size }: { status: string; size?: "sm" | "md" }) {
  const a = APPROVAL[status] ?? { tone: "neutral" as Tone, label: status };
  return (
    <StatusPill tone={a.tone} size={size}>
      {a.label}
    </StatusPill>
  );
}

export const SLA_LABEL: Record<string, string> = {
  low: "Relaxed",
  medium: "Standard",
  high: "Urgent",
  critical: "Emergency",
};

// ── Cards ───────────────────────────────────────────────────────────────────

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-portal-border bg-portal-surface px-6 py-[22px]", className)}>
      {children}
    </div>
  );
}

/** The one card on a page that matters most: raised, with more room. */
export function ElevatedCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-portal-border bg-portal-surface px-8 py-7 shadow-[0_2px_14px_rgba(32,31,28,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionLabel({
  icon: Icon,
  accent,
  children,
  action,
}: {
  icon?: LucideIcon;
  accent?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-extrabold uppercase tracking-[0.08em]",
        accent ? "mb-[18px] text-[13px] text-portal-accent" : "mb-3.5 text-xs text-portal-dim",
      )}
    >
      {Icon && <Icon className={accent ? "h-4 w-4" : "h-3.5 w-3.5"} />}
      <span className="flex-1">{children}</span>
      {action}
    </div>
  );
}

/** Label on the left, value on the right; an empty value says so in muted italic. */
export function Row({
  label,
  value,
  empty = "Not provided",
}: {
  label: string;
  value: React.ReactNode;
  empty?: string;
}) {
  const missing = value == null || value === "";
  return (
    <div className="flex items-center justify-between gap-4 border-b border-portal-border-soft px-0.5 py-3 last:border-b-0">
      <span className="text-[13.5px] text-portal-dim">{label}</span>
      {missing ? (
        <span className="text-right text-[15px] italic text-portal-muted">{empty}</span>
      ) : (
        <span className="text-right text-[15px] font-medium text-portal-text">{value}</span>
      )}
    </div>
  );
}

/** A labelled block of content, stacked; used for the problem and description. */
export function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-portal-border-soft py-[18px] first:pt-0 last:border-b-0 last:pb-0">
      <div className="text-[12.5px] font-bold uppercase tracking-[0.04em] text-portal-dim">{label}</div>
      {children}
    </div>
  );
}

/** Dashed placeholder for a section that has nothing in it yet. */
export function EmptyBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-portal-border bg-portal-sunken px-5 py-[18px] text-[14.5px] italic text-portal-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A full empty state for a list page: a title, a line, and optionally a way forward. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-portal-border bg-portal-sunken px-6 py-14 text-center">
      <p className="text-lg font-extrabold text-portal-text">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-portal-dim">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium",
        tone === "success" ? PILL.good : PILL.bad,
      )}
    >
      {children}
    </div>
  );
}

// ── Lists and tables ────────────────────────────────────────────────────────

/** Column headings: small uppercase, like the section labels. */
export const thCls = "px-5 py-3 text-left text-[11.5px] font-extrabold uppercase tracking-[0.08em] text-portal-dim";
export const tableCls = "w-full";
export const tableWrapCls = "overflow-x-auto rounded-2xl border border-portal-border bg-portal-surface";
export const theadCls = "border-b border-portal-border bg-portal-sunken";
export const tbodyCls = "divide-y divide-portal-border-soft";

// ── Buttons and inputs ──────────────────────────────────────────────────────

export const buttonPrimary =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-portal-text px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60";
export const buttonSecondary =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-portal-border bg-portal-surface px-3.5 py-1.5 text-xs font-semibold text-portal-text transition-colors hover:border-portal-muted hover:bg-portal-sunken";
export const linkCls = "inline-flex items-center gap-1.5 text-sm font-semibold text-portal-accent transition-colors hover:text-portal-text";

export const labelCls = "block text-[12.5px] font-bold uppercase tracking-[0.04em] text-portal-dim";
export const inputCls =
  "mt-1.5 block w-full rounded-xl border border-portal-border bg-portal-surface px-3.5 py-2.5 text-[15px] text-portal-text placeholder:text-portal-muted focus:border-portal-accent focus:outline-none focus:ring-2 focus:ring-portal-accent-bg";
