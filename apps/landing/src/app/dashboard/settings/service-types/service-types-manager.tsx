"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Plus,
  FileUp,
  Loader2,
  Check,
  AlertTriangle,
  Archive,
  RotateCcw,
  Pencil,
  ClipboardCheck,
  LayoutList,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ConfigurableFieldOption, FieldAppConfig } from "@fox/supabase";
import {
  createServiceType,
  renameServiceType,
  setServiceTypeActive,
  publishServiceType,
  type ServiceType,
} from "@fox/supabase/actions/service-types";
import { FieldAppManager } from "../field-app/field-app-manager";
import { ProceduresManager } from "../procedures/procedures-manager";

// A service type is one kind of job. This page owns the list of them and the
// SOP import that creates or updates one; the fields/modules editor and the
// procedure editor are the existing managers, driven from here so the two
// halves of a single SOP stay on one screen.

type Tab = "fields" | "modules" | "procedure";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SavedTemplate = any;

type Analysis = {
  import_id: string;
  file_name: string;
  suggested_name: string;
  suggested_code: string;
  target_code: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  procedure: any;
};

export function ServiceTypesManager({
  types,
  configs,
  templates,
  actionTypeOptions,
}: {
  types: ServiceType[];
  configs: FieldAppConfig[];
  templates: SavedTemplate[];
  actionTypeOptions: ConfigurableFieldOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const live = useMemo(() => types.filter((t) => t.is_active), [types]);
  const retired = useMemo(() => types.filter((t) => !t.is_active), [types]);

  const [activeCode, setActiveCode] = useState(live[0]?.code ?? "survey");
  const [tab, setTab] = useState<Tab>("fields");
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // SOP import
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [importTarget, setImportTarget] = useState<string | null>(null);
  const [newTypeName, setNewTypeName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Naming a type by hand, and confirming a re-import that overwrites one.
  const [namingOpen, setNamingOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [reimportOpen, setReimportOpen] = useState(false);

  const active = types.find((t) => t.code === activeCode);
  const config = configs.find((c) => c.action_type_code === activeCode);
  const template = templates.find(
    (t: SavedTemplate) => t.action_type_code === activeCode,
  );

  const moduleCount = config
    ? Object.values(config.enabled_modules ?? {}).filter(Boolean).length
    : 0;
  const fieldCount = config?.detail_fields?.length ?? 0;
  const stepCount =
    template?.procedure_sections?.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (n: number, s: any) => n + (s.procedure_steps?.length ?? 0),
      0,
    ) ?? 0;

  // ── SOP import ─────────────────────────────────────────────────────

  function startImport(targetCode: string | null) {
    setImportTarget(targetCode);
    setMenuOpen(false);
    setError(null);
    setNotice(null);
    fileInput.current?.click();
  }

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      // Absent means "make this a new service type".
      if (importTarget) body.append("action_type_code", importTarget);

      const res = await fetch("/api/sop-analyse", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not read that SOP.");
        return;
      }
      setAnalysis(json);
      setNewTypeName(json.suggested_name ?? "");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function handlePublish() {
    if (!analysis) return;
    setError(null);
    startTransition(async () => {
      const { data, error: err } = await publishServiceType({
        code: analysis.target_code,
        newTypeLabel: newTypeName.trim() || analysis.suggested_name,
        importId: analysis.import_id,
        config: {
          detail_fields: analysis.config.fields
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((f: any) => f.visible)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((f: any) => ({ key: f.key, group: groupOf(f.key) })),
          enabled_modules: Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            analysis.config.modules.map((m: any) => [m.key, m.enabled]),
          ),
        },
        procedure: analysis.procedure,
      });

      if (err) {
        setError(err.message ?? "Could not publish.");
        return;
      }
      setAnalysis(null);
      if (data?.code) setActiveCode(data.code);
      setNotice(
        `Published ${analysis.target_code ? "" : "new service type "}${newTypeName.trim() || analysis.suggested_name}${data?.version ? ` — procedure v${data.version}` : ""}.`,
      );
      router.refresh();
    });
  }

  // ── Type actions ───────────────────────────────────────────────────

  function handleCreateEmpty() {
    const name = nameDraft.trim();
    if (!name) return;
    setNamingOpen(false);
    setNameDraft("");
    startTransition(async () => {
      const { data, error: err } = await createServiceType(name);
      if (err) return setError(err.message ?? "Could not create the type.");
      if (data?.code) setActiveCode(data.code);
      router.refresh();
    });
  }

  function commitRename(code: string) {
    const name = renameValue.trim();
    setRenaming(null);
    if (!name) return;
    startTransition(async () => {
      await renameServiceType(code, name);
      router.refresh();
    });
  }

  function toggleActive(code: string, next: boolean) {
    startTransition(async () => {
      await setServiceTypeActive(code, next);
      router.refresh();
    });
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
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

      {/* Service types */}
      <div className="flex flex-wrap items-center gap-2">
        {live.map((t) => {
          const isActive = t.code === activeCode;
          if (renaming === t.code) {
            return (
              <input
                key={t.code}
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => commitRename(t.code)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(t.code);
                  if (e.key === "Escape") setRenaming(null);
                }}
                className="rounded-full border-2 border-blue-500 px-4 py-2 text-sm font-medium outline-none"
              />
            );
          }
          return (
            <button
              key={t.code}
              onClick={() => setActiveCode(t.code)}
              onDoubleClick={() => {
                setRenaming(t.code);
                setRenameValue(t.label);
              }}
              title="Double-click to rename"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 ring-2 ring-blue-500"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              {t.label}
              {!t.is_built_in && (
                <span className="rounded bg-white/60 px-1 text-[9px] uppercase tracking-wide text-stone-500">
                  custom
                </span>
              )}
            </button>
          );
        })}

        {/* Add */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            disabled={busy || pending}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-stone-300 text-stone-500 transition-colors hover:border-stone-400 hover:bg-stone-50 disabled:opacity-50"
            title="Add a service type"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-60 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                <button
                  onClick={() => startImport(null)}
                  className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-stone-50"
                >
                  <FileUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                  <span>
                    <span className="block text-sm font-medium text-stone-800">
                      Import from SOP
                    </span>
                    <span className="block text-xs text-stone-400">
                      Creates a new type with its fields, modules and procedure
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setNameDraft("");
                    setNamingOpen(true);
                  }}
                  className="flex w-full items-start gap-2.5 border-t border-stone-100 px-3 py-2.5 text-left transition-colors hover:bg-stone-50"
                >
                  <Plus className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                  <span>
                    <span className="block text-sm font-medium text-stone-800">
                      Create empty type
                    </span>
                    <span className="block text-xs text-stone-400">
                      Configure it by hand
                    </span>
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {busy && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Reading the SOP — working out the fields, the modules and the
          procedure together. This takes about a minute and a half.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && !analysis && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check className="h-4 w-4 flex-shrink-0" />
          {notice}
        </div>
      )}

      {/* Import review */}
      {analysis && (
        <ImportReview
          analysis={analysis}
          isNewType={!analysis.target_code}
          newTypeName={newTypeName}
          onName={setNewTypeName}
          targetLabel={
            types.find((t) => t.code === analysis.target_code)?.label ?? ""
          }
          pending={pending}
          onCancel={() => setAnalysis(null)}
          onPublish={handlePublish}
        />
      )}

      {/* The selected type */}
      {!analysis && active && (
        <>
          <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 pb-3">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-stone-900">
              {active.label}
            </h2>
            <button
              onClick={() => {
                setRenaming(active.code);
                setRenameValue(active.label);
              }}
              className="text-stone-300 hover:text-stone-600"
              title="Rename"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <div className="ml-auto flex items-center gap-1">
              {(
                [
                  ["fields", LayoutList, `Fields${fieldCount ? ` ${fieldCount}` : ""}`],
                  ["modules", ToggleRight, `Modules${moduleCount ? ` ${moduleCount}` : ""}`],
                  ["procedure", ClipboardCheck, `Procedure${stepCount ? ` ${stepCount}` : ""}`],
                ] as const
              ).map(([key, Icon, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    tab === key
                      ? "bg-stone-900 text-white"
                      : "text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReimportOpen(true)}
              disabled={pending || busy}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 disabled:opacity-50"
              title="Replace this type's configuration and procedure from a new SOP"
            >
              <FileUp className="h-3.5 w-3.5" />
              Re-import from SOP
            </button>
            {!active.is_built_in && (
              <button
                onClick={() => toggleActive(active.code, false)}
                disabled={pending}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700"
              >
                <Archive className="h-3.5 w-3.5" />
                Retire
              </button>
            )}
          </div>

          {/* Fields and modules live in the same editor; the tab scrolls to
              the half you asked for rather than duplicating the component. */}
          <div className={tab === "procedure" ? "hidden" : ""}>
            <FieldAppManager
              configs={configs}
              actionTypeOptions={actionTypeOptions}
              controlledType={activeCode}
              hideChrome
            />
          </div>
          <div className={tab === "procedure" ? "" : "hidden"}>
            <ProceduresManager
              templates={templates}
              actionTypeOptions={actionTypeOptions}
              controlledType={activeCode}
              hideChrome
            />
          </div>
        </>
      )}

      {/* Name a new type */}
      <Dialog open={namingOpen} onOpenChange={setNamingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New service type</DialogTitle>
            <DialogDescription>
              A kind of job your technicians do. You can configure its fields,
              modules and procedure afterwards, or import an SOP to fill them.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label htmlFor="new-type-name" className="text-xs text-stone-500">
              Name
            </label>
            <input
              id="new-type-name"
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && nameDraft.trim()) handleCreateEmpty();
              }}
              placeholder="Panel replacement"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-stone-400 focus:outline-none"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNamingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEmpty} disabled={!nameDraft.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm a re-import, which overwrites work that may have been
          hand-tuned since the last import. */}
      <Dialog open={reimportOpen} onOpenChange={setReimportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Re-import {active?.label} from an SOP</DialogTitle>
            <DialogDescription>
              Reads a new SOP and replaces what {active?.label} currently holds.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-1.5 text-sm text-stone-600">
            <li className="flex gap-2">
              <span className="text-stone-300">•</span>
              Its fields and modules are <strong>overwritten</strong>, including
              any you have adjusted by hand.
            </li>
            <li className="flex gap-2">
              <span className="text-stone-300">•</span>
              A new procedure version is published. The current one is retired
              but kept, so visits already recorded against it still read back
              correctly.
            </li>
            <li className="flex gap-2">
              <span className="text-stone-300">•</span>
              You review everything before it is published.
            </li>
          </ul>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReimportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setReimportOpen(false);
                startImport(activeCode);
              }}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Choose SOP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retired */}
      {retired.length > 0 && !analysis && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Retired ({retired.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {retired.map((t) => (
              <button
                key={t.code}
                onClick={() => toggleActive(t.code, true)}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-400 transition-colors hover:text-stone-700"
              >
                <RotateCcw className="h-3 w-3" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Field keys are prefixed by their group, which is what the DB column wants. */
function groupOf(key: string): string {
  if (key.startsWith("location_")) return "location";
  if (key.startsWith("asset_")) return "asset";
  return "issue";
}

// ─── Review before publishing ────────────────────────────────────────

function ImportReview({
  analysis,
  isNewType,
  newTypeName,
  onName,
  targetLabel,
  pending,
  onCancel,
  onPublish,
}: {
  analysis: Analysis;
  isNewType: boolean;
  newTypeName: string;
  onName: (v: string) => void;
  targetLabel: string;
  pending: boolean;
  onCancel: () => void;
  onPublish: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields = (analysis.config?.fields ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modules = (analysis.config?.modules ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections = (analysis.procedure?.sections ?? []) as any[];
  const steps = sections.reduce((n, s) => n + (s.steps?.length ?? 0), 0);

  return (
    <div className="rounded-xl border border-blue-300 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-5 py-4">
        <div className="min-w-0">
          {isNewType ? (
            <>
              <label className="text-xs text-stone-400">
                Name this service type
              </label>
              <input
                value={newTypeName}
                onChange={(e) => onName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-200 px-3 py-2 font-[family-name:var(--font-heading)] text-lg font-bold text-stone-900 focus:border-stone-400 focus:outline-none"
              />
            </>
          ) : (
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-stone-900">
              {targetLabel}
            </h3>
          )}
          <p className="mt-1 text-xs text-stone-400">
            From {analysis.file_name} · not published yet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            Discard
          </Button>
          <Button onClick={onPublish} disabled={pending || !newTypeName.trim()}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNewType ? "Create service type" : "Publish"}
          </Button>
        </div>
      </div>

      {analysis.procedure?.summary && (
        <p className="border-b border-stone-100 bg-stone-50 px-5 py-3 text-xs leading-relaxed text-stone-600">
          {analysis.procedure.summary}
        </p>
      )}

      <div className="grid gap-4 p-5 sm:grid-cols-3">
        <Summary
          icon={<LayoutList className="h-4 w-4 text-stone-400" />}
          title="Fields"
          value={`${fields.filter((f) => f.visible).length} of ${fields.length}`}
          detail={fields
            .filter((f) => f.visible)
            .slice(0, 4)
            .map((f) => f.key.replace(/^(location|asset|action)_/, ""))
            .join(", ")}
        />
        <Summary
          icon={<ToggleRight className="h-4 w-4 text-stone-400" />}
          title="Modules"
          value={`${modules.filter((m) => m.enabled).length} on`}
          detail={modules
            .filter((m) => m.enabled)
            .map((m) => m.key.replace(/_/g, " "))
            .join(", ")}
        />
        <Summary
          icon={<ClipboardCheck className="h-4 w-4 text-stone-400" />}
          title="Procedure"
          value={`${steps} steps`}
          detail={`${sections.length} sections`}
        />
      </div>

      <div className="border-t border-stone-100 px-5 py-3">
        <p className="text-xs text-stone-400">
          Publishing writes all three together. You can adjust any of them
          afterwards from the tabs.
        </p>
      </div>
    </div>
  );
}

function Summary({
  icon,
  title,
  value,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-xs font-medium text-stone-500">{title}</p>
      </div>
      <p className="mt-1 text-sm font-semibold text-stone-900">{value}</p>
      {detail && (
        <p className="mt-0.5 line-clamp-2 text-xs text-stone-400">{detail}</p>
      )}
    </div>
  );
}
