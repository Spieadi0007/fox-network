"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConfigurableFieldOption, WorkflowStep } from "@fox/supabase";
import { upsertWorkflowSteps } from "@fox/supabase/actions/workflows";
import {
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  Check,
  Shield,
  ShieldOff,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

// ── Defaults ────────────────────────────────────────────────────────

const DEFAULT_PROJECT_TYPES = [
  { label: "Deployment", code: "deployment" },
  { label: "Survey", code: "survey" },
  { label: "Maintenance", code: "maintenance" },
  { label: "Inspection", code: "inspection" },
  { label: "Upgrade", code: "upgrade" },
  { label: "Remediation", code: "remediation" },
];

const DEFAULT_ACTION_TYPES = [
  { label: "Survey", code: "survey" },
  { label: "Installation", code: "installation" },
  { label: "Inspection", code: "inspection" },
  { label: "Maintenance", code: "maintenance" },
  { label: "Repair", code: "repair" },
  { label: "Testing", code: "testing" },
  { label: "Documentation", code: "documentation" },
  { label: "Other", code: "other" },
];

function resolveOptions(fieldKey: string, allOptions: ConfigurableFieldOption[]) {
  const configured = allOptions.filter((o) => o.field_key === fieldKey);
  if (configured.length > 0) return configured.map((o) => ({ label: o.label, code: o.code }));
  if (fieldKey === "project_type") return DEFAULT_PROJECT_TYPES;
  if (fieldKey === "action_type") return DEFAULT_ACTION_TYPES;
  return [];
}

// ── Types ───────────────────────────────────────────────────────────

type DraftStep = {
  action_type_code: string;
  default_name: string;
  is_required: boolean;
};

function draftKey(client: string, country: string, projectType: string) {
  return `${client}::${country}::${projectType}`;
}

type Mode = "list" | "editor";

// ── Component ───────────────────────────────────────────────────────

export function WorkflowManager({
  fieldOptions,
  workflowSteps,
}: {
  fieldOptions: ConfigurableFieldOption[];
  workflowSteps: WorkflowStep[];
}) {
  const clients = resolveOptions("client", fieldOptions);
  const countries = resolveOptions("country", fieldOptions);
  const projectTypes = resolveOptions("project_type", fieldOptions);
  const actionTypes = resolveOptions("action_type", fieldOptions);

  const [mode, setMode] = useState<Mode>("list");
  const [filterClient, setFilterClient] = useState("");

  const [activeClient, setActiveClient] = useState(clients[0]?.code ?? "");
  const [activeCountry, setActiveCountry] = useState(countries[0]?.code ?? "");
  const [activeType, setActiveType] = useState(projectTypes[0]?.code ?? "");

  // Build drafts keyed by "client::country::projectType"
  const [drafts, setDrafts] = useState<Record<string, DraftStep[]>>(() => {
    const d: Record<string, DraftStep[]> = {};
    for (const key of new Set(
      workflowSteps.map((s) => draftKey(s.client_code, s.country_code, s.project_type_code)),
    )) {
      const matching = workflowSteps
        .filter((s) => draftKey(s.client_code, s.country_code, s.project_type_code) === key)
        .sort((a, b) => a.step_order - b.step_order);
      d[key] = matching.map((s) => ({
        action_type_code: s.action_type_code,
        default_name: s.default_name,
        is_required: s.is_required,
      }));
    }
    return d;
  });
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const currentKey = draftKey(activeClient, activeCountry, activeType);
  const currentDraft = drafts[currentKey] ?? [];

  const findLabel = (items: { label: string; code: string }[], code: string) => {
    if (items === clients && code === "") return "All Clients";
    if (items === countries && code === "") return "All Countries";
    return items.find((i) => i.code === code)?.label ?? code;
  };

  // ── Draft helpers ──────────────────────────────────────

  function updateDraft(key: string, items: DraftStep[]) {
    setDrafts((prev) => ({ ...prev, [key]: items }));
    setDirty((prev) => ({ ...prev, [key]: true }));
  }

  function addStep(actionCode: string) {
    if (currentDraft.some((d) => d.action_type_code === actionCode)) return;
    const at = actionTypes.find((a) => a.code === actionCode);
    updateDraft(currentKey, [
      ...currentDraft,
      { action_type_code: actionCode, default_name: at?.label ?? actionCode, is_required: true },
    ]);
  }

  function removeStep(actionCode: string) {
    updateDraft(currentKey, currentDraft.filter((d) => d.action_type_code !== actionCode));
  }

  function moveStep(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentDraft.length) return;
    const items = [...currentDraft];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    updateDraft(currentKey, items);
  }

  function toggleRequired(index: number) {
    const items = [...currentDraft];
    items[index] = { ...items[index], is_required: !items[index].is_required };
    updateDraft(currentKey, items);
  }

  function updateName(index: number, name: string) {
    const items = [...currentDraft];
    items[index] = { ...items[index], default_name: name };
    updateDraft(currentKey, items);
  }

  function handleSave() {
    startTransition(async () => {
      const steps = currentDraft.map((step, i) => ({
        action_type_code: step.action_type_code,
        default_name: step.default_name,
        step_order: i,
        is_required: step.is_required,
      }));
      await upsertWorkflowSteps(activeClient, activeCountry, activeType, steps);
      setDirty((prev) => ({ ...prev, [currentKey]: false }));
      router.refresh();
    });
  }

  function openEditor(client: string, country: string, projectType: string) {
    setActiveClient(client);
    setActiveCountry(country);
    setActiveType(projectType);
    setMode("editor");
  }

  const available = useMemo(
    () => actionTypes.filter((at) => !currentDraft.some((d) => d.action_type_code === at.code)),
    [actionTypes, currentDraft],
  );

  // Conflict warnings for editor
  const conflictWarnings = useMemo(() => {
    if (mode !== "editor") return [];
    const warnings: string[] = [];

    // Client dimension: "All Clients" vs specific clients
    if (activeClient === "") {
      const clientOverrides = clients.filter((c) => {
        const key = draftKey(c.code, activeCountry, activeType);
        return (drafts[key] ?? []).length > 0;
      });
      if (clientOverrides.length > 0) {
        const names = clientOverrides.map((c) => c.label).join(", ");
        warnings.push(`Client-specific templates exist for ${names}. They will take priority over this "All Clients" template.`);
      }
    }
    if (activeClient !== "") {
      const allClientKey = draftKey("", activeCountry, activeType);
      const allClientSteps = drafts[allClientKey] ?? [];
      if (allClientSteps.length > 0) {
        warnings.push(`An "All Clients" template exists for this country and project type (${allClientSteps.length} steps). This client-specific template will take priority.`);
      }
    }

    // Country dimension: "All Countries" vs specific countries
    if (activeCountry === "") {
      const countryOverrides = countries.filter((c) => {
        const key = draftKey(activeClient, c.code, activeType);
        return (drafts[key] ?? []).length > 0;
      });
      if (countryOverrides.length > 0) {
        const names = countryOverrides.map((c) => c.label).join(", ");
        warnings.push(`Country-specific templates exist for ${names}. They will take priority over this "All Countries" template.`);
      }
    }
    if (activeCountry !== "") {
      const allCountryKey = draftKey(activeClient, "", activeType);
      const allCountrySteps = drafts[allCountryKey] ?? [];
      if (allCountrySteps.length > 0) {
        warnings.push(`An "All Countries" template exists for this client and project type (${allCountrySteps.length} steps). This country-specific template will take priority.`);
      }
    }

    return warnings;
  }, [mode, activeClient, activeCountry, activeType, drafts, clients, countries]);

  // All saved workflows (with steps > 0)
  const allSaved = useMemo(() => {
    const entries: { client: string; country: string; projectType: string; steps: DraftStep[] }[] = [];
    for (const [key, steps] of Object.entries(drafts)) {
      if (steps.length === 0) continue;
      const [c, co, pt] = key.split("::");
      entries.push({ client: c, country: co, projectType: pt, steps });
    }
    entries.sort((a, b) => {
      if (a.client !== b.client) return a.client.localeCompare(b.client);
      if (a.country !== b.country) return a.country.localeCompare(b.country);
      return a.projectType.localeCompare(b.projectType);
    });
    return entries;
  }, [drafts]);

  const filteredSaved = filterClient
    ? allSaved.filter((w) => w.client === filterClient)
    : allSaved;

  // Check for orphaned templates (referencing deleted clients/countries/project types)
  const clientCodes = new Set(clients.map((c) => c.code));
  const countryCodes = new Set(countries.map((c) => c.code));
  const projectTypeCodes = new Set(projectTypes.map((p) => p.code));
  clientCodes.add(""); // "All Clients" is valid
  countryCodes.add(""); // "All Countries" is valid

  function isOrphaned(wf: { client: string; country: string; projectType: string }) {
    return !clientCodes.has(wf.client) || !countryCodes.has(wf.country) || !projectTypeCodes.has(wf.projectType);
  }

  const orphanedCount = filteredSaved.filter(isOrphaned).length;

  // ── Empty states ──────────────────────────────────────

  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
        <p className="text-sm text-stone-500">
          No clients configured yet. Add clients in{" "}
          <Link href="/dashboard/settings/field-options" className="text-fox-orange hover:underline font-medium">
            Field Options
          </Link>{" "}
          under Locations to start configuring action templates.
        </p>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
        <p className="text-sm text-stone-500">
          No countries configured yet. Add countries in{" "}
          <Link href="/dashboard/settings/field-options" className="text-fox-orange hover:underline font-medium">
            Field Options
          </Link>{" "}
          under Locations to start configuring action templates.
        </p>
      </div>
    );
  }

  // ── Editor mode ───────────────────────────────────────

  if (mode === "editor") {
    return (
      <div className="space-y-6">
        {/* Header with back */}
        <button
          onClick={() => setMode("list")}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to action templates
        </button>

        {/* Scope selectors */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Client</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveClient("")}
                className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
                  activeClient === ""
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                All Clients
              </button>
              {clients.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setActiveClient(item.code)}
                  className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
                    activeClient === item.code
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Country</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveCountry("")}
                className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
                  activeCountry === ""
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                All Countries
              </button>
              {countries.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setActiveCountry(item.code)}
                  className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
                    activeCountry === item.code
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Project Type</p>
            <div className="flex gap-2 flex-wrap">
              {projectTypes.map((item) => {
                const key = draftKey(activeClient, activeCountry, item.code);
                const count = (drafts[key] ?? []).length;
                return (
                  <button
                    key={item.code}
                    onClick={() => setActiveType(item.code)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
                      activeType === item.code
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    {item.label}
                    {count > 0 && (
                      <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                        activeType === item.code ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conflict warnings */}
        {conflictWarnings.length > 0 && (
          <div className="space-y-2">
            {conflictWarnings.map((msg, i) => (
              <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{msg}</p>
              </div>
            ))}
          </div>
        )}

        {/* Step editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: configured steps */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Template Steps</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {currentDraft.length} step{currentDraft.length !== 1 ? "s" : ""}
                </p>
              </div>
              {dirty[currentKey] && (
                <Button
                  onClick={handleSave}
                  disabled={pending}
                  className="h-9 rounded-lg bg-stone-900 px-4 text-xs text-white hover:bg-stone-800"
                >
                  {pending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1.5 h-3.5 w-3.5" />}
                  Save
                </Button>
              )}
            </div>

            {currentDraft.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-stone-400">No steps yet.</p>
                <p className="text-xs text-stone-300 mt-1">Add action types from the right panel.</p>
              </div>
            ) : (
              <div>
                {currentDraft.map((step, i) => (
                  <div key={step.action_type_code} className="flex items-center gap-3 border-b border-stone-50 px-6 py-3 last:border-0 group">
                    <span className="shrink-0 h-6 w-6 rounded-full bg-stone-100 text-xs font-medium text-stone-500 flex items-center justify-center">
                      {i + 1}
                    </span>
                    <Input
                      className="h-9 rounded-lg border-stone-200 px-3 text-sm shadow-none flex-1 min-w-0"
                      value={step.default_name}
                      onChange={(e) => updateName(i, e.target.value)}
                    />
                    <span className="shrink-0 text-xs font-[family-name:var(--font-mono)] text-stone-400 bg-stone-50 px-2 py-1 rounded">
                      {step.action_type_code}
                    </span>
                    <button
                      onClick={() => toggleRequired(i)}
                      title={step.is_required ? "Required" : "Optional"}
                      className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                        step.is_required
                          ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          : "text-stone-400 bg-stone-50 hover:bg-stone-100"
                      }`}
                    >
                      {step.is_required ? <Shield className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                    </button>
                    <div className="flex flex-col shrink-0">
                      <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="text-stone-300 hover:text-stone-500 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => moveStep(i, 1)} disabled={i === currentDraft.length - 1} className="text-stone-300 hover:text-stone-500 disabled:opacity-30 disabled:cursor-not-allowed">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeStep(step.action_type_code)} className="shrink-0 p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: available action types */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <div className="border-b border-stone-100 px-6 py-4">
              <h3 className="text-sm font-semibold text-stone-900">Available Action Types</h3>
              <p className="text-xs text-stone-400 mt-0.5">Click to add as a template step.</p>
            </div>
            {available.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-stone-400">All action types have been added.</p>
              </div>
            ) : (
              <div>
                {available.map((at) => (
                  <button
                    key={at.code}
                    onClick={() => addStep(at.code)}
                    className="flex items-center gap-3 w-full border-b border-stone-50 px-6 py-3 last:border-0 text-left hover:bg-stone-50 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="text-sm text-stone-700">{at.label}</span>
                    <span className="text-xs font-[family-name:var(--font-mono)] text-stone-400 ml-auto">{at.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── List mode (default) ───────────────────────────────

  return (
    <div className="space-y-4">
      {/* Top bar: client filter + create button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterClient("")}
            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
              !filterClient
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
            }`}
          >
            All Clients
          </button>
          {clients.map((c) => (
            <button
              key={c.code}
              onClick={() => setFilterClient(c.code)}
              className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
                filterClient === c.code
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <Button
          onClick={() => {
            setActiveClient("");
            setActiveCountry("");
            setActiveType(projectTypes[0]?.code ?? "");
            setMode("editor");
          }}
          className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800 shrink-0"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Orphan warning */}
      {orphanedCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            {orphanedCount} template{orphanedCount !== 1 ? "s" : ""} reference{orphanedCount === 1 ? "s" : ""} clients, countries, or project types that no longer exist in Field Options. These templates won&apos;t match any projects.
          </p>
        </div>
      )}

      {/* Saved templates list */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        {filteredSaved.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-stone-400">
              {allSaved.length === 0
                ? "No action templates configured yet."
                : `No action templates for ${findLabel(clients, filterClient)}.`}
            </p>
            <p className="text-xs text-stone-300 mt-1">
              Click &ldquo;Create Template&rdquo; to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500">
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Country</th>
                <th className="px-6 py-3 font-medium">Project Type</th>
                <th className="px-6 py-3 font-medium">Steps</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSaved.map((wf) => {
                const key = draftKey(wf.client, wf.country, wf.projectType);
                const orphaned = isOrphaned(wf);
                return (
                  <tr
                    key={key}
                    onClick={() => openEditor(wf.client, wf.country, wf.projectType)}
                    className={`border-b border-stone-50 last:border-0 cursor-pointer transition-colors ${
                      orphaned ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-stone-50/50"
                    }`}
                  >
                    <td className="px-6 py-3.5 font-medium text-stone-700">
                      <span className="inline-flex items-center gap-1.5">
                        {orphaned && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                        {findLabel(clients, wf.client)}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-stone-600">
                      {findLabel(countries, wf.country)}
                    </td>
                    <td className="px-6 py-3.5 text-stone-600 capitalize">
                      {findLabel(projectTypes, wf.projectType)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-xs">{wf.steps.length}</span>
                        <div className="flex gap-1">
                          {wf.steps.slice(0, 3).map((s) => (
                            <span
                              key={s.action_type_code}
                              className="text-[10px] font-[family-name:var(--font-mono)] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded"
                            >
                              {s.action_type_code}
                            </span>
                          ))}
                          {wf.steps.length > 3 && (
                            <span className="text-[10px] text-stone-400">+{wf.steps.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <ChevronRight className="h-4 w-4 text-stone-300 inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
