"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  FileUp,
  Loader2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Quote,
  RotateCcw,
  Package,
  Ruler,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConfigurableFieldOption, ProcedureStepType } from "@fox/supabase";
import {
  saveProcedureTemplate,
  deactivateProcedureTemplate,
  type ProcedureDraft,
} from "@fox/supabase/actions/procedures";
import { addPartsFromSop } from "@fox/supabase/actions/parts";

// Review and publish the procedure extracted from an SOP.
//
// An 82-step procedure is too much for a modal, so this is a full page: the
// draft is edited in place and only becomes a template version when the
// manager publishes it.

const DEFAULT_ACTION_TYPES = [
  { code: "survey", label: "Survey" },
  { code: "installation", label: "Installation" },
  { code: "inspection", label: "Inspection" },
  { code: "maintenance", label: "Maintenance" },
  { code: "repair", label: "Repair" },
  { code: "testing", label: "Testing" },
  { code: "documentation", label: "Documentation" },
  { code: "other", label: "Other" },
];

const STEP_TYPE_LABEL: Record<ProcedureStepType, string> = {
  pass_fail: "Pass / fail",
  photo: "Photo",
  text: "Text",
  number: "Number",
  signature: "Signature",
};

const STEP_TYPE_STYLE: Record<ProcedureStepType, string> = {
  pass_fail: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  photo: "bg-violet-50 text-violet-700 ring-violet-200",
  text: "bg-stone-100 text-stone-600 ring-stone-200",
  number: "bg-amber-50 text-amber-700 ring-amber-200",
  signature: "bg-blue-50 text-blue-700 ring-blue-200",
};

/** Server shape from getProcedureTemplates(). */
type SavedTemplate = {
  id: string;
  action_type_code: string;
  name: string;
  summary: string;
  version: number;
  procedure_sections: {
    id: string;
    title: string;
    position: number;
    procedure_steps: {
      id: string;
      position: number;
      label: string;
      step_type: ProcedureStepType;
      required: boolean;
      units: string;
      help: string;
      evidence: string;
      captures_parts: boolean;
      suggested_parts: { part_number: string; name: string; quantity: number }[];
      spec_target: number | null;
      spec_min: number | null;
      spec_max: number | null;
      applies_when: string;
    }[];
  }[];
};

type DraftStep = {
  label: string;
  type: ProcedureStepType;
  required: boolean;
  units: string;
  help: string;
  evidence: string;
  captures_parts: boolean;
  suggested_parts: { part_number: string; name: string; quantity: number }[];
  spec_target: number | null;
  spec_min: number | null;
  spec_max: number | null;
  applies_when: string;
};

/** Human-readable form of a step's spec, e.g. "1.2 (max 1.2) N·m". */
function specLabel(s: {
  spec_target: number | null;
  spec_min: number | null;
  spec_max: number | null;
  units: string;
}): string | null {
  const bits: string[] = [];
  if (s.spec_target !== null) bits.push(`${s.spec_target}`);
  if (s.spec_min !== null) bits.push(`min ${s.spec_min}`);
  if (s.spec_max !== null) bits.push(`max ${s.spec_max}`);
  if (bits.length === 0) return null;
  return `${bits.join(", ")}${s.units ? ` ${s.units}` : ""}`;
}

export function ProceduresManager({
  templates,
  actionTypeOptions,
}: {
  templates: SavedTemplate[];
  actionTypeOptions: ConfigurableFieldOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const actionTypes = useMemo(
    () =>
      actionTypeOptions.length > 0
        ? actionTypeOptions.map((o) => ({ code: o.code, label: o.label }))
        : DEFAULT_ACTION_TYPES,
    [actionTypeOptions],
  );

  const [activeType, setActiveType] = useState(
    actionTypes[0]?.code ?? "survey",
  );
  const [draft, setDraft] = useState<ProcedureDraft | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const published = templates.find((t) => t.action_type_code === activeType);
  const activeLabel =
    actionTypes.find((t) => t.code === activeType)?.label ?? activeType;

  const stepCount = draft
    ? draft.sections.reduce((n, s) => n + s.steps.length, 0)
    : 0;

  // Parts the SOP named, deduplicated — offered for the catalog so the
  // technician's picker has something to pick from.
  const draftParts = useMemo(() => {
    if (!draft) return [];
    const byNumber = new Map<string, { part_number: string; name: string }>();
    for (const section of draft.sections) {
      for (const step of section.steps) {
        for (const p of step.suggested_parts ?? []) {
          if (p.part_number && !byNumber.has(p.part_number)) {
            byNumber.set(p.part_number, {
              part_number: p.part_number,
              name: p.name,
            });
          }
        }
      }
    }
    return [...byNumber.values()];
  }, [draft]);

  const [partsAdded, setPartsAdded] = useState<number | null>(null);

  function handleAddParts() {
    startTransition(async () => {
      const { data } = await addPartsFromSop(draftParts);
      setPartsAdded(data?.added ?? 0);
      router.refresh();
    });
  }

  // ── Extract ────────────────────────────────────────────────────────

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setSaved(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("action_type_code", activeType);

      const res = await fetch("/api/sop-procedure", {
        method: "POST",
        body,
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Could not read that SOP.");
        return;
      }

      setDraft(json.procedure);
      setImportId(json.import_id ?? null);
      setSourceFile(json.file_name ?? file.name);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  // ── Draft edits ────────────────────────────────────────────────────

  function updateStep(si: number, ti: number, patch: Partial<DraftStep>) {
    setDraft((d) => {
      if (!d) return d;
      const sections = d.sections.map((s, i) =>
        i !== si
          ? s
          : {
              ...s,
              steps: s.steps.map((st, j) =>
                j !== ti ? st : { ...st, ...patch },
              ),
            },
      );
      return { ...d, sections };
    });
  }

  function removeStep(si: number, ti: number) {
    setDraft((d) => {
      if (!d) return d;
      const sections = d.sections
        .map((s, i) =>
          i !== si ? s : { ...s, steps: s.steps.filter((_, j) => j !== ti) },
        )
        // A section with nothing left in it is noise on the technician's screen.
        .filter((s) => s.steps.length > 0);
      return { ...d, sections };
    });
  }

  function renameSection(si: number, title: string) {
    setDraft((d) =>
      d
        ? {
            ...d,
            sections: d.sections.map((s, i) =>
              i === si ? { ...s, title } : s,
            ),
          }
        : d,
    );
  }

  function removeSection(si: number) {
    setDraft((d) =>
      d ? { ...d, sections: d.sections.filter((_, i) => i !== si) } : d,
    );
  }

  // ── Publish ────────────────────────────────────────────────────────

  function handlePublish() {
    if (!draft) return;
    setError(null);
    startTransition(async () => {
      const { data, error: err } = await saveProcedureTemplate(
        activeType,
        draft,
        importId,
      );
      if (err) {
        setError(err.message ?? "Could not save the procedure.");
        return;
      }
      setDraft(null);
      setImportId(null);
      setSourceFile(null);
      setSaved(`Published version ${data?.version} for ${activeLabel}.`);
      router.refresh();
    });
  }

  function handleRetire() {
    startTransition(async () => {
      await deactivateProcedureTemplate(activeType);
      setSaved(`Retired the procedure for ${activeLabel}.`);
      router.refresh();
    });
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Service type */}
      <div className="flex flex-wrap items-center gap-2">
        {actionTypes.map((at) => {
          const isActive = activeType === at.code;
          const t = templates.find((x) => x.action_type_code === at.code);
          const count =
            t?.procedure_sections.reduce(
              (n, s) => n + s.procedure_steps.length,
              0,
            ) ?? 0;
          return (
            <button
              key={at.code}
              onClick={() => {
                setActiveType(at.code);
                setDraft(null);
                setSaved(null);
                setError(null);
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 ring-2 ring-blue-500"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              {at.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <input
          ref={fileInput}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={busy || pending}
          className="ml-auto flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50 disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Reading SOP…
            </>
          ) : (
            <>
              <FileUp className="h-3.5 w-3.5" />
              {published ? "Replace from SOP" : "Generate from SOP"}
            </>
          )}
        </button>
      </div>

      {busy && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Reading the SOP and working out the steps. A long procedure takes
          around a minute.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && !draft && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {saved}
        </div>
      )}

      {/* Draft under review */}
      {draft && (
        <div className="rounded-xl border border-blue-300 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-4">
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-stone-900">
                {draft.name}
              </h3>
              <p className="mt-0.5 text-xs text-stone-400">
                {stepCount} steps in {draft.sections.length} sections
                {sourceFile ? ` · from ${sourceFile}` : ""} · not published yet
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setDraft(null);
                  setImportId(null);
                }}
                disabled={pending}
              >
                Discard
              </Button>
              <Button
                onClick={handlePublish}
                disabled={pending || stepCount === 0}
              >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish {stepCount} steps
              </Button>
            </div>
          </div>

          {draft.summary && (
            <p className="border-b border-stone-100 bg-stone-50 px-5 py-3 text-xs leading-relaxed text-stone-600">
              {draft.summary}
            </p>
          )}

          {draftParts.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 bg-violet-50/40 px-5 py-3">
              <Package className="h-4 w-4 flex-shrink-0 text-violet-500" />
              <p className="min-w-0 flex-1 text-xs text-stone-600">
                {partsAdded === null ? (
                  <>
                    This SOP names{" "}
                    <span className="font-medium">
                      {draftParts.length} part
                      {draftParts.length === 1 ? "" : "s"}
                    </span>
                    . Add them to the catalog so technicians can pick them:{" "}
                    <span className="text-stone-500">
                      {draftParts
                        .slice(0, 3)
                        .map((p) => p.part_number)
                        .join(", ")}
                      {draftParts.length > 3
                        ? ` +${draftParts.length - 3} more`
                        : ""}
                    </span>
                  </>
                ) : (
                  <>
                    Added {partsAdded} new part
                    {partsAdded === 1 ? "" : "s"} to the catalog.
                    {partsAdded < draftParts.length &&
                      ` ${draftParts.length - partsAdded} were already there.`}
                  </>
                )}
              </p>
              {partsAdded === null && (
                <Button
                  variant="outline"
                  onClick={handleAddParts}
                  disabled={pending}
                >
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add to catalog
                </Button>
              )}
            </div>
          )}

          <div className="divide-y divide-stone-100">
            {draft.sections.map((section, si) => (
              <div key={si} className="px-5 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    value={section.title}
                    onChange={(e) => renameSection(si, e.target.value)}
                    className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:border-stone-200 focus:border-stone-300 focus:bg-white focus:outline-none"
                  />
                  <span className="text-xs text-stone-400">
                    {section.steps.length}
                  </span>
                  <button
                    onClick={() => removeSection(si)}
                    title="Remove this section"
                    className="rounded p-1 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {section.steps.map((step, ti) => (
                    <div
                      key={ti}
                      className="rounded-lg border border-stone-200 bg-white px-3 py-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          value={step.label}
                          onChange={(e) =>
                            updateStep(si, ti, { label: e.target.value })
                          }
                          className="min-w-0 flex-1 rounded-md border border-transparent px-2 py-1 text-sm text-stone-800 hover:border-stone-200 focus:border-stone-300 focus:outline-none"
                        />

                        <select
                          value={step.type}
                          onChange={(e) =>
                            updateStep(si, ti, {
                              type: e.target.value as ProcedureStepType,
                              // The database rejects units on anything else.
                              units:
                                e.target.value === "number" ? step.units : "",
                            })
                          }
                          className={`flex-shrink-0 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${STEP_TYPE_STYLE[step.type]}`}
                        >
                          {(
                            Object.keys(STEP_TYPE_LABEL) as ProcedureStepType[]
                          ).map((t) => (
                            <option key={t} value={t}>
                              {STEP_TYPE_LABEL[t]}
                            </option>
                          ))}
                        </select>

                        {step.type === "number" && (
                          <input
                            value={step.units}
                            onChange={(e) =>
                              updateStep(si, ti, { units: e.target.value })
                            }
                            placeholder="unit"
                            className="w-16 flex-shrink-0 rounded-md border border-stone-200 px-2 py-1 text-xs text-stone-600 focus:outline-none"
                          />
                        )}

                        <label
                          title="Must be answered before the visit can be submitted"
                          className="flex flex-shrink-0 cursor-pointer items-center gap-1 text-xs text-stone-500"
                        >
                          <input
                            type="checkbox"
                            checked={step.required}
                            onChange={(e) =>
                              updateStep(si, ti, {
                                required: e.target.checked,
                              })
                            }
                            className="h-3.5 w-3.5 rounded border-stone-300"
                          />
                          Required
                        </label>

                        <button
                          onClick={() => removeStep(si, ti)}
                          title="Remove this step"
                          className="flex-shrink-0 rounded p-1 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <StepBadges
                        step={step}
                        onClearParts={() =>
                          updateStep(si, ti, {
                            captures_parts: false,
                            suggested_parts: [],
                          })
                        }
                        onClearSpec={() =>
                          updateStep(si, ti, {
                            spec_target: null,
                            spec_min: null,
                            spec_max: null,
                          })
                        }
                        onClearCondition={() =>
                          updateStep(si, ti, { applies_when: "" })
                        }
                      />

                      {step.help && (
                        <p className="mt-1 pl-2 text-xs text-stone-500">
                          {step.help}
                        </p>
                      )}
                      {step.evidence && (
                        <p className="mt-1 flex items-start gap-1.5 pl-2 text-xs italic text-stone-400">
                          <Quote className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          {step.evidence}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published template */}
      {!draft && published && (
        <div className="rounded-xl border border-stone-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-4">
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-stone-900">
                {published.name}
              </h3>
              <p className="mt-0.5 text-xs text-stone-400">
                Version {published.version} ·{" "}
                {published.procedure_sections.reduce(
                  (n, s) => n + s.procedure_steps.length,
                  0,
                )}{" "}
                steps · live for {activeLabel}
              </p>
            </div>
            <Button variant="ghost" onClick={handleRetire} disabled={pending}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retire
            </Button>
          </div>

          <div className="divide-y divide-stone-100">
            {[...published.procedure_sections]
              .sort((a, b) => a.position - b.position)
              .map((section) => (
                <div key={section.id} className="px-5 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    {section.title}
                  </p>
                  <ul className="space-y-1.5">
                    {[...section.procedure_steps]
                      .sort((a, b) => a.position - b.position)
                      .map((step) => (
                        <li
                          key={step.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span
                            className={`mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${STEP_TYPE_STYLE[step.step_type]}`}
                          >
                            {STEP_TYPE_LABEL[step.step_type]}
                          </span>
                          <span className="text-stone-700">
                            {step.label}
                            {step.units && (
                              <span className="text-stone-400">
                                {" "}
                                ({step.units})
                              </span>
                            )}
                            {!step.required && (
                              <span className="ml-1.5 text-xs text-stone-400">
                                optional
                              </span>
                            )}
                            <StepBadges step={step} />
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Nothing yet */}
      {!draft && !published && !busy && (
        <div className="rounded-xl border border-dashed border-stone-300 px-5 py-12 text-center">
          <p className="text-sm font-medium text-stone-600">
            No procedure for {activeLabel} yet
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs text-stone-400">
            Upload the client&rsquo;s SOP and we&rsquo;ll turn its steps into
            the form technicians fill in on site.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * What the extractor decided about a step, beyond its type. Each badge is
 * removable in the draft so a manager can overrule a wrong call once, rather
 * than every technician meeting it on every visit.
 */
function StepBadges({
  step,
  onClearParts,
  onClearSpec,
  onClearCondition,
}: {
  step: {
    captures_parts: boolean;
    suggested_parts: { part_number: string; name: string; quantity: number }[];
    spec_target: number | null;
    spec_min: number | null;
    spec_max: number | null;
    units: string;
    applies_when: string;
  };
  onClearParts?: () => void;
  onClearSpec?: () => void;
  onClearCondition?: () => void;
}) {
  const spec = specLabel(step);
  if (!step.captures_parts && !spec && !step.applies_when) return null;

  const chip =
    "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium";

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-2">
      {step.captures_parts && (
        <span className={`${chip} bg-violet-50 text-violet-700`}>
          <Package className="h-3 w-3" />
          {step.suggested_parts.length > 0
            ? step.suggested_parts
                .map((p) => `${p.name}${p.quantity ? ` ×${p.quantity}` : ""}`)
                .join(", ")
            : "Parts used"}
          {onClearParts && (
            <button
              onClick={onClearParts}
              title="This step does not consume parts"
              className="ml-0.5 text-violet-400 hover:text-violet-700"
            >
              ×
            </button>
          )}
        </span>
      )}

      {spec && (
        <span className={`${chip} bg-amber-50 text-amber-700`}>
          <Ruler className="h-3 w-3" />
          {spec}
          {onClearSpec && (
            <button
              onClick={onClearSpec}
              title="Remove this specification"
              className="ml-0.5 text-amber-400 hover:text-amber-700"
            >
              ×
            </button>
          )}
        </span>
      )}

      {step.applies_when && (
        <span className={`${chip} bg-sky-50 text-sky-700`}>
          <GitBranch className="h-3 w-3" />
          only if {step.applies_when}
          {onClearCondition && (
            <button
              onClick={onClearCondition}
              title="Always show this step"
              className="ml-0.5 text-sky-400 hover:text-sky-700"
            >
              ×
            </button>
          )}
        </span>
      )}
    </div>
  );
}
