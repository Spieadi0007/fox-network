"use client";

import { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ConfiguredField } from "@fox/shared";
import { markSopImportApplied } from "@fox/supabase/actions/sop-imports";
import {
  diffExtraction,
  defaultAccepted,
  applyChanges,
  changeId,
  NOT_MENTIONED,
  type Change,
} from "@/lib/sop-diff";
import type { SopExtraction } from "@/lib/sop-extraction";
import {
  FileText,
  Loader2,
  Upload,
  AlertTriangle,
  Quote,
} from "lucide-react";

// Upload an SOP, show what the model proposes, let the manager accept or
// reject each change, then hand the accepted set back to the settings page.
//
// Nothing here writes to field_app_config. Applying updates the page's draft
// and the manager still has to press Save — so an import is an edit they can
// review and back out of, not a silent rewrite.

type ImportResponse = {
  import_id: string;
  service_type_label: string;
  file_name: string;
  extraction: SopExtraction;
};

export type SopApplyResult = {
  detailFields: ConfiguredField[];
  enabledModules: Record<string, boolean>;
  appliedCount: number;
};

export function SopImportDialog({
  open,
  onOpenChange,
  actionTypeCode,
  serviceTypeLabel,
  currentDetailFields,
  currentModules,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionTypeCode: string;
  serviceTypeLabel: string;
  currentDetailFields: ConfiguredField[];
  currentModules: Record<string, boolean>;
  onApply: (result: SopApplyResult) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const fileInput = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setBusy(false);
    setError(null);
    setResult(null);
    setAccepted({});
  }

  function close() {
    reset();
    onOpenChange(false);
  }

  // ── Diff ───────────────────────────────────────────────────────────

  const { changes, unchangedCount } = useMemo(
    () =>
      result
        ? diffExtraction(result.extraction, currentDetailFields, currentModules)
        : { changes: [] as Change[], unchangedCount: 0 },
    [result, currentDetailFields, currentModules],
  );

  const acceptedCount = changes.filter((c) => accepted[changeId(c)]).length;
  const turningOn = changes.filter((c) => c.turningOn);
  const turningOff = changes.filter((c) => !c.turningOn);

  // ── Upload ─────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("action_type_code", actionTypeCode);

      const res = await fetch("/api/sop-import", { method: "POST", body });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Could not read that SOP.");
        return;
      }

      const data = json as ImportResponse;
      setResult(data);

      const { changes: proposed } = diffExtraction(
        data.extraction,
        currentDetailFields,
        currentModules,
      );
      setAccepted(defaultAccepted(proposed));
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  // ── Apply ──────────────────────────────────────────────────────────

  async function handleApply() {
    if (!result) return;
    setBusy(true);

    const next = applyChanges(
      changes,
      accepted,
      currentDetailFields,
      currentModules,
    );

    // Best-effort: a failed audit write shouldn't block the manager's edit,
    // which is still unsaved and fully reversible at this point.
    try {
      await markSopImportApplied(result.import_id, {
        fields: next.appliedFields,
        modules: next.appliedModules,
      });
    } catch {
      // ignored — the draft update below is what the manager cares about
    }

    onApply({
      detailFields: next.detailFields,
      enabledModules: next.enabledModules,
      appliedCount: next.appliedFields.length + next.appliedModules.length,
    });
    close();
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      {/* DialogContent is `grid` by default, which gives children no definite
          height — so `flex-1 min-h-0` on the review list would grow instead of
          scrolling. Switch this instance to a bounded flex column. */}
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Import from SOP</DialogTitle>
          <DialogDescription>
            {result
              ? `Proposed changes for ${result.service_type_label} from ${result.file_name}.`
              : `Upload the client's SOP for ${serviceTypeLabel} visits and we'll work out which fields and modules it calls for.`}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1 — upload */}
        {!result && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sop-file">SOP document (PDF, up to 32 MB)</Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  ref={fileInput}
                  id="sop-file"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError(null);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInput.current?.click()}
                  disabled={busy}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose file
                </Button>
                <span className="min-w-0 flex-1 truncate text-sm text-stone-500">
                  {file ? file.name : "No file selected"}
                </span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" onClick={close} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!file || busy}>
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reading SOP…
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Read SOP
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2 — review */}
        {result && (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <p className="max-h-32 shrink-0 overflow-y-auto rounded-lg bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-600">
              {result.extraction.summary}
            </p>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1">
              {changes.length === 0 && (
                <p className="py-6 text-center text-sm text-stone-500">
                  This SOP matches the current configuration. Nothing to change.
                </p>
              )}

              <ChangeGroup
                title="Turn on"
                changes={turningOn}
                accepted={accepted}
                setAccepted={setAccepted}
              />
              <ChangeGroup
                title="Turn off"
                changes={turningOff}
                accepted={accepted}
                setAccepted={setAccepted}
              />

              {unchangedCount > 0 && (
                <p className="text-xs text-stone-400">
                  {unchangedCount} other{" "}
                  {unchangedCount === 1 ? "setting" : "settings"} already match
                  the SOP.
                </p>
              )}
            </div>

            <p className="shrink-0 text-xs text-stone-400">
              Applies to the details page. Card fields are left alone, and
              nothing is saved until you press Save.
            </p>

            <DialogFooter className="shrink-0">
              <Button variant="ghost" onClick={close} disabled={busy}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={busy || acceptedCount === 0}
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Apply {acceptedCount} change
                {acceptedCount === 1 ? "" : "s"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ChangeGroup({
  title,
  changes,
  accepted,
  setAccepted,
}: {
  title: string;
  changes: Change[];
  accepted: Record<string, boolean>;
  setAccepted: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  if (changes.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
        {title} ({changes.length})
      </p>
      <div className="space-y-1.5">
        {changes.map((c) => {
          const id = changeId(c);
          const isAccepted = accepted[id] ?? false;
          const silent = c.evidence === NOT_MENTIONED;

          return (
            <label
              key={id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                isAccepted
                  ? "border-blue-200 bg-blue-50/50"
                  : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) =>
                  setAccepted((prev) => ({ ...prev, [id]: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-stone-300"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-800">
                    {c.label}
                  </span>
                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-stone-500">
                    {c.kind}
                  </span>
                  {c.confidence === "low" && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      Unsure
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 flex items-start gap-1.5 text-xs ${
                    silent ? "text-stone-400" : "text-stone-600"
                  }`}
                >
                  {!silent && (
                    <Quote className="mt-0.5 h-3 w-3 flex-shrink-0 text-stone-300" />
                  )}
                  <span className={silent ? "" : "italic"}>{c.evidence}</span>
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
