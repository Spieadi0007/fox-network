"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@fox/supabase/client/browser";
import {
  submitProcedureEntry,
  type StepAnswer,
} from "@fox/supabase/actions/procedure-entries";
import type { ProcedureStepType } from "@fox/supabase";
import {
  Check,
  X,
  Camera,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Trash2,
  Package,
  Ruler,
  Plus,
} from "lucide-react";

// The procedure as a technician works it: section by section, one answer per
// step. Completing it produces the service report, so a step is either
// answered or visibly outstanding — there is no silent skip.

export type CatalogPart = {
  id: string;
  part_number: string;
  name: string;
  unit: string;
};

export type UsedPart = {
  part_id: string | null;
  part_number: string;
  name: string;
  quantity: number;
  unit: string;
};

export type RunnerStep = {
  id: string;
  position: number;
  label: string;
  step_type: ProcedureStepType;
  required: boolean;
  units: string;
  help: string;
  captures_parts: boolean;
  suggested_parts: { part_number: string; name: string; quantity: number }[];
  spec_target: number | null;
  spec_min: number | null;
  spec_max: number | null;
  /** Empty when the step always applies. */
  applies_when: string;
};

/** Is an entered measurement outside what the SOP asks for? */
export function outOfSpec(step: RunnerStep, raw: string | undefined): boolean {
  if (step.step_type !== "number" || !raw?.trim()) return false;
  const v = Number(raw);
  if (!Number.isFinite(v)) return false;
  if (step.spec_min !== null && v < step.spec_min) return true;
  if (step.spec_max !== null && v > step.spec_max) return true;
  return false;
}

/** The spec as a technician should read it. */
export function specText(step: RunnerStep): string | null {
  const u = step.units ? ` ${step.units}` : "";
  if (step.spec_min !== null && step.spec_max !== null)
    return `${step.spec_min}–${step.spec_max}${u}`;
  if (step.spec_max !== null) return `max ${step.spec_max}${u}`;
  if (step.spec_min !== null) return `min ${step.spec_min}${u}`;
  if (step.spec_target !== null) return `${step.spec_target}${u}`;
  return null;
}

export type RunnerSection = {
  id: string;
  title: string;
  position: number;
  steps: RunnerStep[];
};

type Answer = {
  result?: "pass" | "fail";
  text?: string;
  number?: string;
  name?: string;
  photoPaths: string[];
  note: string;
  parts: UsedPart[];
};

const BLANK: Answer = { photoPaths: [], note: "", parts: [] };

/** Answered means "has something recorded", per step type. */
function isAnswered(step: RunnerStep, a: Answer | undefined): boolean {
  if (!a) return false;
  switch (step.step_type) {
    case "pass_fail":
      return a.result === "pass" || a.result === "fail";
    case "photo":
      return a.photoPaths.length > 0;
    case "number":
      return !!a.number?.trim();
    case "signature":
      return !!a.name?.trim();
    case "text":
      return !!a.text?.trim();
  }
}

export function ProcedureRunner({
  actionId,
  organizationId,
  procedureName,
  sections,
  catalogParts,
}: {
  actionId: string;
  organizationId: string;
  procedureName: string;
  sections: RunnerSection[];
  catalogParts: CatalogPart[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const supabase = useMemo(() => createBrowserClient(), []);

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    // Start on the first section; the rest collapse so a long procedure
    // does not open as one intimidating scroll.
    Object.fromEntries(sections.map((s, i) => [s.id, i === 0])),
  );
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [startedAt] = useState(() => new Date().toISOString());
  const [error, setError] = useState<string | null>(null);

  // A condition is asked once and gates every step scoped to it. Unanswered
  // conditions leave their steps hidden — they are asked in the section that
  // needs them rather than as a questionnaire on arrival.
  const [conditions, setConditions] = useState<Record<string, boolean>>({});

  const allSteps = useMemo(() => sections.flatMap((s) => s.steps), [sections]);

  const applies = (step: RunnerStep) =>
    !step.applies_when || conditions[step.applies_when] === true;

  /** Distinct conditions gating steps in a section, in first-seen order. */
  const conditionsIn = (section: RunnerSection) => {
    const seen: string[] = [];
    for (const st of section.steps) {
      if (st.applies_when && !seen.includes(st.applies_when))
        seen.push(st.applies_when);
    }
    return seen;
  };

  const liveSteps = allSteps.filter(applies);
  const answeredCount = liveSteps.filter((s) =>
    isAnswered(s, answers[s.id]),
  ).length;

  const outstanding = liveSteps.filter(
    (s) => s.required && !isAnswered(s, answers[s.id]),
  );
  const failedWithoutNote = liveSteps.filter(
    (s) => answers[s.id]?.result === "fail" && !answers[s.id]?.note.trim(),
  );

  function patch(stepId: string, p: Partial<Answer>) {
    setAnswers((prev) => ({
      ...prev,
      [stepId]: { ...BLANK, ...prev[stepId], ...p },
    }));
  }

  // ── Photos ─────────────────────────────────────────────────────────

  async function uploadPhoto(stepId: string, file: File) {
    setUploading((u) => ({ ...u, [stepId]: true }));
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      // Path is keyed on the action, not the entry — the entry does not
      // exist until submit, and photos are taken well before that.
      const path = `${organizationId}/${actionId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("field-photos")
        .upload(path, file, { contentType: file.type });

      if (upErr) {
        setError(`Could not upload the photo: ${upErr.message}`);
        return;
      }

      setAnswers((prev) => {
        const current = prev[stepId] ?? BLANK;
        return {
          ...prev,
          [stepId]: { ...current, photoPaths: [...current.photoPaths, path] },
        };
      });
    } finally {
      setUploading((u) => ({ ...u, [stepId]: false }));
    }
  }

  function removePhoto(stepId: string, path: string) {
    setAnswers((prev) => {
      const current = prev[stepId] ?? BLANK;
      return {
        ...prev,
        [stepId]: {
          ...current,
          photoPaths: current.photoPaths.filter((p) => p !== path),
        },
      };
    });
    // Fire and forget: an orphaned object is harmless, a blocked UI is not.
    void supabase.storage.from("field-photos").remove([path]);
  }

  // ── Submit ─────────────────────────────────────────────────────────

  function handleSubmit(outcome: "successful" | "partial") {
    setError(null);

    if (failedWithoutNote.length > 0) {
      setError(
        `Add an explanation for: ${failedWithoutNote.map((s) => s.label).join(", ")}`,
      );
      setOpenForSteps(failedWithoutNote);
      return;
    }
    if (outcome === "successful" && outstanding.length > 0) {
      setError(
        `${outstanding.length} required step${outstanding.length === 1 ? "" : "s"} still outstanding. Complete them, or submit as a partial visit.`,
      );
      setOpenForSteps(outstanding);
      return;
    }

    const payload: StepAnswer[] = [];
    for (const section of sections) {
      for (const step of section.steps) {
        const a = answers[step.id];

        // A step ruled out by its condition is recorded as considered and
        // not applicable, rather than left as a silent gap in the report.
        if (step.applies_when && conditions[step.applies_when] === false) {
          payload.push({
            stepId: step.id,
            sectionTitle: section.title,
            sectionPosition: section.position,
            stepLabel: step.label,
            stepType: step.step_type,
            stepPosition: step.position,
            units: step.units,
            value: {},
            photoPaths: [],
            partsUsed: [],
            isFailure: false,
            isOutOfSpec: false,
            notApplicable: true,
            note: step.applies_when,
          });
          continue;
        }

        if (!applies(step) || !isAnswered(step, a)) continue;

        let value: unknown = {};
        if (step.step_type === "pass_fail") value = { result: a!.result };
        else if (step.step_type === "text") value = { text: a!.text };
        else if (step.step_type === "number")
          value = { number: Number(a!.number) };
        else if (step.step_type === "signature")
          value = { name: a!.name, signed_at: new Date().toISOString() };

        payload.push({
          stepId: step.id,
          sectionTitle: section.title,
          sectionPosition: section.position,
          stepLabel: step.label,
          stepType: step.step_type,
          stepPosition: step.position,
          units: step.units,
          value,
          photoPaths: a!.photoPaths,
          partsUsed: a!.parts,
          isFailure: a!.result === "fail",
          isOutOfSpec: outOfSpec(step, a!.number),
          notApplicable: false,
          note: a!.note,
        });
      }
    }

    startTransition(async () => {
      const { error: err } = await submitProcedureEntry({
        actionId,
        startedAt,
        endedAt: new Date().toISOString(),
        outcome,
        notes: "",
        answers: payload,
      });
      if (err) {
        setError(err.message ?? "Could not submit the visit.");
        return;
      }
      router.push("/technician?success=Visit+submitted");
    });
  }

  /** Open every section containing one of these steps, so nothing hides. */
  function setOpenForSteps(steps: RunnerStep[]) {
    const ids = new Set(steps.map((s) => s.id));
    setOpen((prev) => {
      const next = { ...prev };
      for (const s of sections) {
        if (s.steps.some((st) => ids.has(st.id))) next[s.id] = true;
      }
      return next;
    });
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="mt-6">
      <div className="sticky top-0 z-10 -mx-4 mb-3 border-b border-stone-200 bg-white/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            {procedureName}
          </p>
          <p className="text-xs font-medium text-stone-600">
            {answeredCount}/{liveSteps.length}
          </p>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${liveSteps.length ? (answeredCount / liveSteps.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {sections.map((section) => {
          const live = section.steps.filter(applies);
          const done = live.filter((s) => isAnswered(s, answers[s.id])).length;
          const isOpen = open[section.id] ?? false;

          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <button
                onClick={() =>
                  setOpen((p) => ({ ...p, [section.id]: !p[section.id] }))
                }
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-stone-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-stone-400" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800">
                  {section.title}
                </span>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    live.length > 0 && done === live.length
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {done}/{live.length}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-stone-100">
                  {conditionsIn(section).map((cond) => (
                    <div
                      key={cond}
                      className="flex flex-wrap items-center gap-2 border-b border-stone-100 bg-sky-50/50 px-3 py-2.5"
                    >
                      <p className="min-w-0 flex-1 text-sm text-stone-700">
                        Is {cond}?
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() =>
                            setConditions((c) => ({ ...c, [cond]: true }))
                          }
                          className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                            conditions[cond] === true
                              ? "border-sky-500 bg-sky-500 text-white"
                              : "border-stone-200 text-stone-600"
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() =>
                            setConditions((c) => ({ ...c, [cond]: false }))
                          }
                          className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                            conditions[cond] === false
                              ? "border-stone-500 bg-stone-500 text-white"
                              : "border-stone-200 text-stone-600"
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="divide-y divide-stone-100">
                    {section.steps.filter(applies).map((step) => (
                      <StepRow
                        key={step.id}
                        step={step}
                        answer={answers[step.id] ?? BLANK}
                        uploading={!!uploading[step.id]}
                        catalogParts={catalogParts}
                        onPatch={(p) => patch(step.id, p)}
                        onPhoto={(f) => uploadPhoto(step.id, f)}
                        onRemovePhoto={(p) => removePhoto(step.id, p)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 space-y-2 pb-8">
        <button
          onClick={() => handleSubmit("successful")}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Complete visit
        </button>
        <button
          onClick={() => handleSubmit("partial")}
          disabled={pending}
          className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-600 disabled:opacity-50"
        >
          Submit as partial
        </button>
        {outstanding.length > 0 && (
          <p className="text-center text-xs text-stone-400">
            {outstanding.length} required step
            {outstanding.length === 1 ? "" : "s"} outstanding
          </p>
        )}
      </div>
    </div>
  );
}

// ─── One step ────────────────────────────────────────────────────────

function StepRow({
  step,
  answer,
  uploading,
  catalogParts,
  onPatch,
  onPhoto,
  onRemovePhoto,
}: {
  step: RunnerStep;
  answer: Answer;
  uploading: boolean;
  catalogParts: CatalogPart[];
  onPatch: (p: Partial<Answer>) => void;
  onPhoto: (f: File) => void;
  onRemovePhoto: (path: string) => void;
}) {
  const answered = isAnswered(step, answer);
  const failed = answer.result === "fail";
  const spec = specText(step);
  const offSpec = outOfSpec(step, answer.number);

  const input =
    "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:outline-none";

  return (
    <div className={`px-3 py-3 ${failed ? "bg-red-50/40" : ""}`}>
      <div className="flex items-start gap-2">
        <span
          className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
            answered ? "bg-emerald-500" : step.required ? "bg-stone-300" : "bg-stone-200"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-stone-800">
            {step.label}
            {!step.required && (
              <span className="ml-1.5 text-xs text-stone-400">optional</span>
            )}
          </p>
          {step.help && (
            <p className="mt-0.5 text-xs text-stone-400">{step.help}</p>
          )}

          <div className="mt-2">
            {step.step_type === "pass_fail" && (
              <div className="flex gap-2">
                <button
                  onClick={() => onPatch({ result: "pass" })}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    answer.result === "pass"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-stone-200 text-stone-600"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  Pass
                </button>
                <button
                  onClick={() => onPatch({ result: "fail" })}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    answer.result === "fail"
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-stone-200 text-stone-600"
                  }`}
                >
                  <X className="h-4 w-4" />
                  Fail
                </button>
              </div>
            )}

            {step.step_type === "photo" && (
              <div className="space-y-2">
                {answer.photoPaths.length > 0 && (
                  <ul className="space-y-1">
                    {answer.photoPaths.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-2 rounded-lg bg-stone-50 px-2.5 py-1.5 text-xs text-stone-600"
                      >
                        <Camera className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                        <span className="min-w-0 flex-1 truncate">
                          {p.split("/").pop()}
                        </span>
                        <button
                          onClick={() => onRemovePhoto(p)}
                          className="flex-shrink-0 text-stone-400"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm ${
                    uploading
                      ? "border-stone-200 text-stone-400"
                      : "border-stone-300 text-stone-600"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      {answer.photoPaths.length > 0
                        ? "Add another"
                        : "Take photo"}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    // Opens the rear camera directly on a phone.
                    capture="environment"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onPhoto(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}

            {step.step_type === "number" && (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={answer.number ?? ""}
                    onChange={(e) => onPatch({ number: e.target.value })}
                    className={`${input} ${offSpec ? "border-amber-400 bg-amber-50" : ""}`}
                    placeholder={spec ?? "0"}
                  />
                  {step.units && (
                    <span className="flex-shrink-0 text-sm text-stone-500">
                      {step.units}
                    </span>
                  )}
                  {spec && (
                    <span className="flex flex-shrink-0 items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-500">
                      <Ruler className="h-3 w-3" />
                      {spec}
                    </span>
                  )}
                </div>
                {offSpec && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    Outside the specification ({spec}). Recorded either way.
                  </p>
                )}
              </div>
            )}

            {step.step_type === "text" && (
              <textarea
                rows={2}
                value={answer.text ?? ""}
                onChange={(e) => onPatch({ text: e.target.value })}
                className={input}
                placeholder="Record here"
              />
            )}

            {step.step_type === "signature" && (
              <input
                type="text"
                value={answer.name ?? ""}
                onChange={(e) => onPatch({ name: e.target.value })}
                className={input}
                placeholder="Type full name to sign"
              />
            )}
          </div>

          {step.captures_parts && (
            <PartsPicker
              parts={answer.parts}
              suggestions={step.suggested_parts}
              catalog={catalogParts}
              onChange={(parts) => onPatch({ parts })}
            />
          )}

          {failed && (
            <div className="mt-2">
              <textarea
                rows={2}
                value={answer.note}
                onChange={(e) => onPatch({ note: e.target.value })}
                className={`${input} border-red-200 bg-white`}
                placeholder="What went wrong? (required)"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Parts used on a step ────────────────────────────────────────────

/**
 * Parts the SOP named arrive pre-filled at the quantity it specified, so the
 * common case is confirming a number rather than searching a catalog. Anything
 * else is picked from the org's parts list.
 */
function PartsPicker({
  parts,
  suggestions,
  catalog,
  onChange,
}: {
  parts: UsedPart[];
  suggestions: { part_number: string; name: string; quantity: number }[];
  catalog: CatalogPart[];
  onChange: (parts: UsedPart[]) => void;
}) {
  const [adding, setAdding] = useState(false);

  // Seed from the SOP the first time this step is touched, so a technician
  // who fitted exactly what was specified only has to confirm.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || parts.length > 0 || suggestions.length === 0) return;
    seeded.current = true;
    onChange(
      suggestions.map((s) => {
        const match = catalog.find((c) => c.part_number === s.part_number);
        return {
          part_id: match?.id ?? null,
          part_number: s.part_number,
          name: match?.name ?? s.name,
          quantity: s.quantity > 0 ? s.quantity : 1,
          unit: match?.unit ?? "each",
        };
      }),
    );
  }, [parts.length, suggestions, catalog, onChange]);

  const used = new Set(parts.map((p) => p.part_number));
  const available = catalog.filter((c) => !used.has(c.part_number));

  function setQuantity(index: number, quantity: number) {
    onChange(
      parts.map((p, i) => (i === index ? { ...p, quantity } : p)),
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50/40 p-2">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-violet-700">
        <Package className="h-3.5 w-3.5" />
        Parts used
      </p>

      {parts.length > 0 && (
        <ul className="mb-1.5 space-y-1">
          {parts.map((p, i) => (
            <li
              key={p.part_number + i}
              className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-stone-800">{p.name}</p>
                {p.part_number && (
                  <p className="font-mono text-[10px] text-stone-400">
                    {p.part_number}
                  </p>
                )}
              </div>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={p.quantity}
                onChange={(e) => setQuantity(i, Number(e.target.value))}
                className="w-14 rounded border border-stone-200 px-1.5 py-1 text-center text-sm"
              />
              <span className="w-10 flex-shrink-0 text-xs text-stone-400">
                {p.unit}
              </span>
              <button
                onClick={() => onChange(parts.filter((_, j) => j !== i))}
                aria-label={`Remove ${p.name}`}
                className="flex-shrink-0 text-stone-300 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <select
          autoFocus
          defaultValue=""
          onChange={(e) => {
            const chosen = catalog.find((c) => c.id === e.target.value);
            if (chosen) {
              onChange([
                ...parts,
                {
                  part_id: chosen.id,
                  part_number: chosen.part_number,
                  name: chosen.name,
                  quantity: 1,
                  unit: chosen.unit,
                },
              ]);
            }
            setAdding(false);
          }}
          className="w-full rounded-lg border border-stone-200 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>
            Choose a part…
          </option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {c.part_number} — {c.name}
            </option>
          ))}
        </select>
      ) : (
        <button
          onClick={() => setAdding(true)}
          disabled={available.length === 0}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-violet-300 px-2 py-1.5 text-xs text-violet-700 disabled:border-stone-200 disabled:text-stone-400"
        >
          <Plus className="h-3.5 w-3.5" />
          {available.length === 0
            ? parts.length > 0
              ? "No other parts in the catalog"
              : "No parts in the catalog yet"
            : "Add a part"}
        </button>
      )}
    </div>
  );
}
