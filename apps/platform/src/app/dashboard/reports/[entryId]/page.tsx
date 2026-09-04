import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@fox/supabase/client/server";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Camera,
  PenTool,
  AlertTriangle,
  Package,
  Ruler,
  MinusCircle,
} from "lucide-react";
import type { ProcedureStepType } from "@fox/supabase";
import { PrintButton } from "./print-button";

// The service report: a completed procedure, read back in the order it was
// carried out. Everything here comes from the answer rows' own snapshot of
// what was asked, so editing or deleting the template later cannot rewrite
// a report that has already been filed.

export const dynamic = "force-dynamic";

type AnswerRow = {
  id: string;
  section_title: string;
  section_position: number;
  step_label: string;
  step_type: ProcedureStepType;
  step_position: number;
  units: string;
  value: Record<string, unknown> | null;
  photo_paths: string[];
  is_failure: boolean;
  note: string;
  completed_at: string | null;
  parts_used: {
    part_number: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  is_out_of_spec: boolean;
  not_applicable: boolean;
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");

  const { entryId } = await params;
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: entry } = await db
    .from("action_entries")
    .select(
      `id, visit_number, started_at, ended_at, duration_minutes, outcome,
       notes, submitted_at, action_id,
       technician:profiles!technician_id ( name, email ),
       action:actions ( id, name, code, action_type, priority )`,
    )
    .eq("id", entryId)
    .maybeSingle();

  if (!entry) notFound();

  const { data: rawAnswers } = await db
    .from("action_entry_steps")
    .select("*")
    .eq("entry_id", entryId)
    .order("section_position", { ascending: true })
    .order("step_position", { ascending: true });

  const answers: AnswerRow[] = rawAnswers ?? [];

  // field-photos is private, so the report needs short-lived signed URLs
  // rather than public ones.
  const allPaths = answers.flatMap((a) => a.photo_paths);
  const signedByPath = new Map<string, string>();
  if (allPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("field-photos")
      .createSignedUrls(allPaths, 60 * 60);
    for (const s of signed ?? []) {
      if (s.signedUrl && s.path) signedByPath.set(s.path, s.signedUrl);
    }
  }

  // Group into sections, preserving the order the query returned.
  const sections: { title: string; steps: AnswerRow[] }[] = [];
  for (const a of answers) {
    const last = sections[sections.length - 1];
    if (last && last.title === a.section_title) last.steps.push(a);
    else sections.push({ title: a.section_title, steps: [a] });
  }

  const failures = answers.filter((a) => a.is_failure);
  const outOfSpec = answers.filter((a) => a.is_out_of_spec);
  const skipped = answers.filter((a) => a.not_applicable);

  // Parts consumed across the whole visit, totalled — the thing an office
  // needs for stock and invoicing, rather than hunting through 79 steps.
  const partTotals = new Map<
    string,
    { part_number: string; name: string; quantity: number; unit: string }
  >();
  for (const a of answers) {
    for (const p of a.parts_used ?? []) {
      const key = p.part_number || p.name;
      const existing = partTotals.get(key);
      if (existing) existing.quantity += p.quantity;
      else partTotals.set(key, { ...p });
    }
  }
  const parts = [...partTotals.values()];
  const action = entry.action;
  const technicianName =
    entry.technician?.name || entry.technician?.email || "—";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/dashboard/actions/${entry.action_id}`}
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 transition-colors hover:text-stone-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to work order
        </Link>
        <PrintButton />
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Visit report
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-stone-900">
          {action?.name ?? "Work order"}
        </h1>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <Field label="Reference" value={action?.code ?? "—"} mono />
          <Field
            label="Service type"
            value={String(action?.action_type ?? "—").replace(/_/g, " ")}
          />
          <Field label="Technician" value={technicianName} />
          <Field label="Visit" value={`#${entry.visit_number ?? 1}`} />
          <Field label="Started" value={fmtDate(entry.started_at)} />
          <Field label="Finished" value={fmtDate(entry.ended_at)} />
          <Field
            label="Duration"
            value={
              entry.duration_minutes ? `${entry.duration_minutes} min` : "—"
            }
          />
          <Field
            label="Outcome"
            value={String(entry.outcome ?? "—").replace(/_/g, " ")}
          />
        </div>
      </div>

      {/* Anything that failed, up front — a reader should not have to hunt
          through 79 steps to discover the visit had a problem. */}
      {failures.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-red-800">
            <AlertTriangle className="h-4 w-4" />
            {failures.length} step{failures.length === 1 ? "" : "s"} failed
          </p>
          <ul className="mt-2 space-y-1.5">
            {failures.map((f) => (
              <li key={f.id} className="text-sm text-red-700">
                <span className="font-medium">{f.step_label}</span>
                {f.note && (
                  <span className="text-red-600"> — {f.note}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {outOfSpec.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <Ruler className="h-4 w-4" />
            {outOfSpec.length} measurement
            {outOfSpec.length === 1 ? "" : "s"} outside specification
          </p>
          <ul className="mt-2 space-y-1.5">
            {outOfSpec.map((a) => (
              <li key={a.id} className="text-sm text-amber-700">
                <span className="font-medium">{a.step_label}</span>
                <span className="text-amber-600">
                  {" "}
                  — recorded {String(a.value?.number ?? "?")}
                  {a.units ? ` ${a.units}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {parts.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Parts used
          </h2>
          <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
            {parts.map((p) => (
              <div
                key={p.part_number + p.name}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <Package className="h-4 w-4 flex-shrink-0 text-stone-300" />
                {p.part_number && (
                  <span className="w-32 flex-shrink-0 font-mono text-xs text-stone-500">
                    {p.part_number}
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-stone-800">
                  {p.name}
                </span>
                <span className="flex-shrink-0 text-sm font-medium text-stone-800">
                  {p.quantity}
                  <span className="ml-1 text-xs font-normal text-stone-400">
                    {p.unit}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {answers.length === 0 && (
        <p className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-400">
          This visit was recorded without a procedure.
        </p>
      )}

      {/* The procedure, as carried out */}
      {sections.map((section, i) => (
        <section key={i} className="break-inside-avoid">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
            {section.title}
          </h2>
          <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
            {section.steps.map((step) => (
              <StepResult
                key={step.id}
                step={step}
                signedByPath={signedByPath}
              />
            ))}
          </div>
        </section>
      ))}

      {entry.notes && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Notes
          </h2>
          <p className="whitespace-pre-wrap rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700">
            {entry.notes}
          </p>
        </section>
      )}

      <p className="border-t border-stone-200 pt-4 text-xs text-stone-400">
        Submitted {fmtDate(entry.submitted_at)} by {technicianName}.
        {skipped.length > 0 &&
          ` ${skipped.length} step${skipped.length === 1 ? "" : "s"} did not apply to this visit.`}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-stone-400">{label}</p>
      <p
        className={`mt-0.5 capitalize text-stone-800 ${mono ? "font-mono text-xs uppercase" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function StepResult({
  step,
  signedByPath,
}: {
  step: AnswerRow;
  signedByPath: Map<string, string>;
}) {
  const v = step.value ?? {};

  // A step ruled out by its condition is shown as considered and not
  // applicable — a silent gap would read as an omission.
  if (step.not_applicable) {
    return (
      <div className="flex items-start justify-between gap-4 px-4 py-2.5 break-inside-avoid">
        <p className="min-w-0 flex-1 text-sm text-stone-400 line-through decoration-stone-300">
          {step.step_label}
        </p>
        <span className="flex flex-shrink-0 items-center gap-1 text-xs text-stone-400">
          <MinusCircle className="h-3.5 w-3.5" />
          Not applicable
        </span>
      </div>
    );
  }

  return (
    <div
      className={`px-4 py-3 ${step.is_failure ? "bg-red-50/50" : step.is_out_of_spec ? "bg-amber-50/40" : ""} break-inside-avoid`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="min-w-0 flex-1 text-sm text-stone-800">
          {step.step_label}
        </p>

        <div className="flex flex-shrink-0 items-center gap-2 text-sm">
          {step.step_type === "pass_fail" &&
            (v.result === "pass" ? (
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <Check className="h-4 w-4" />
                Pass
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-red-700">
                <X className="h-4 w-4" />
                Fail
              </span>
            ))}

          {step.step_type === "number" && (
            <span
              className={`font-medium ${step.is_out_of_spec ? "text-amber-700" : "text-stone-800"}`}
            >
              {String(v.number ?? "—")}
              {step.units && (
                <span className="ml-1 font-normal text-stone-400">
                  {step.units}
                </span>
              )}
              {step.is_out_of_spec && (
                <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] uppercase">
                  off spec
                </span>
              )}
            </span>
          )}

          {step.step_type === "signature" && (
            <span className="flex items-center gap-1.5 text-stone-700">
              <PenTool className="h-3.5 w-3.5 text-stone-400" />
              <span className="font-medium">{String(v.name ?? "—")}</span>
            </span>
          )}

          {step.step_type === "photo" && (
            <span className="flex items-center gap-1 text-xs text-stone-400">
              <Camera className="h-3.5 w-3.5" />
              {step.photo_paths.length}
            </span>
          )}

          {step.completed_at && (
            <span className="text-xs tabular-nums text-stone-300">
              {fmtTime(step.completed_at)}
            </span>
          )}
        </div>
      </div>

      {step.step_type === "text" && v.text ? (
        <p className="mt-1.5 whitespace-pre-wrap text-sm text-stone-600">
          {String(v.text)}
        </p>
      ) : null}

      {step.photo_paths.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {step.photo_paths.map((p) => {
            const url = signedByPath.get(p);
            return url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p}
                src={url}
                alt={step.step_label}
                className="h-28 w-28 rounded-lg border border-stone-200 object-cover"
              />
            ) : (
              <div
                key={p}
                className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-stone-200 text-xs text-stone-400"
              >
                unavailable
              </div>
            );
          })}
        </div>
      )}

      {step.parts_used?.length > 0 && (
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {step.parts_used.map((p, i) => (
            <li
              key={p.part_number + i}
              className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600"
            >
              <Package className="h-3 w-3 text-stone-400" />
              {p.name}
              <span className="font-medium">×{p.quantity}</span>
            </li>
          ))}
        </ul>
      )}

      {step.is_failure && step.note && (
        <p className="mt-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-sm text-red-700">
          {step.note}
        </p>
      )}
    </div>
  );
}
