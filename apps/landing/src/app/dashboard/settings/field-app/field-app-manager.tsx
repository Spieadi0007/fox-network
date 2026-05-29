"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Box,
  AlertTriangle,
  Wrench,
  ChevronDown,
  ChevronRight,
  Check,
  Circle,
  Play,
  Square,
  Clock,
  Timer,
  Package,
  PenTool,
  UserCheck,
  ListChecks,
  Camera,
  Languages,
  FileText,
  MessageCircle,
  Save,
  LayoutGrid,
  List,
  Lock,
} from "lucide-react";
import type { FieldAppConfig, ConfigurableFieldOption } from "@fox/supabase";
import { upsertFieldAppConfig } from "@fox/supabase/actions/field-app-config";

// ─── Field definitions ───────────────────────────────────────────────

type FieldDef = { key: string; label: string };
type FieldGroup = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldDef[];
};

const CARD_FIELD_GROUPS: FieldGroup[] = [
  {
    key: "location",
    label: "Location Details",
    icon: MapPin,
    fields: [
      { key: "location_name", label: "Location Name" },
      { key: "location_address", label: "Address" },
      { key: "location_city", label: "City" },
      { key: "location_country", label: "Country" },
      { key: "location_client", label: "Client" },
      { key: "location_contact_name", label: "Contact Person" },
      { key: "location_contact_phone", label: "Phone" },
    ],
  },
  {
    key: "asset",
    label: "Asset Details",
    icon: Box,
    fields: [
      { key: "asset_name", label: "Asset Name" },
      { key: "asset_type", label: "Asset Type" },
      { key: "asset_serial_number", label: "Serial Number" },
      { key: "asset_condition", label: "Condition" },
      { key: "asset_manufacturer", label: "Manufacturer" },
      { key: "asset_model", label: "Model" },
    ],
  },
  {
    key: "issue",
    label: "Issue Details",
    icon: AlertTriangle,
    fields: [
      { key: "action_name", label: "Issue Title" },
      { key: "action_code", label: "Issue Code" },
      { key: "action_type", label: "Issue Type" },
      { key: "action_priority", label: "Priority" },
      { key: "action_status", label: "Status" },
      { key: "action_scheduled_start", label: "Scheduled Date" },
      { key: "action_due_date", label: "Due Date" },
      { key: "action_description", label: "Description" },
    ],
  },
];

type ModuleDef = {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ModuleGroup = { label: string; modules: ModuleDef[] };

// Start Time and End Time are always enabled and cannot be toggled off
const FIXED_MODULES = new Set(["start_time", "end_time"]);

const MODULE_GROUPS: ModuleGroup[] = [
  {
    label: "TIME TRACKING",
    modules: [
      { key: "travel_time", label: "Travel Time", description: "Time spent traveling to location", icon: Clock },
      { key: "work_duration", label: "Work Duration", description: "Calculated total work duration", icon: Timer },
    ],
  },
  {
    label: "MATERIALS & PARTS",
    modules: [
      { key: "parts_used", label: "Parts Used", description: "Materials consumed during service", icon: Package },
    ],
  },
  {
    label: "VERIFICATION",
    modules: [
      { key: "customer_signature", label: "Customer Signature", description: "Digital signature from customer", icon: PenTool },
      { key: "technician_signature", label: "Technician Signature", description: "Digital signature from technician", icon: UserCheck },
      { key: "checklist", label: "Checklist", description: "Checklist of items to verify", icon: ListChecks },
    ],
  },
  {
    label: "MEDIA & PHOTOS",
    modules: [
      { key: "photos", label: "Photos", description: "Before/after photos from the service", icon: Camera },
    ],
  },
  {
    label: "LANGUAGE",
    modules: [
      { key: "auto_translate", label: "Auto Translate", description: "Auto-translate notes and text fields", icon: Languages },
    ],
  },
  {
    label: "GENERAL",
    modules: [
      { key: "notes", label: "Notes", description: "Additional notes about the service", icon: FileText },
      { key: "chat", label: "Chat", description: "Real-time chat with support/team", icon: MessageCircle },
    ],
  },
];

// ─── Default config ──────────────────────────────────────────────────

const DEFAULT_CARD_FIELDS: { key: string; group: string }[] = [
  { key: "location_name", group: "location" },
  { key: "location_address", group: "location" },
  { key: "asset_name", group: "asset" },
  { key: "action_name", group: "issue" },
  { key: "action_priority", group: "issue" },
];

const DEFAULT_DETAIL_FIELDS: { key: string; group: string }[] = [
  { key: "location_name", group: "location" },
  { key: "location_address", group: "location" },
  { key: "location_city", group: "location" },
  { key: "location_client", group: "location" },
  { key: "location_contact_name", group: "location" },
  { key: "asset_name", group: "asset" },
  { key: "asset_type", group: "asset" },
  { key: "asset_serial_number", group: "asset" },
  { key: "asset_condition", group: "asset" },
  { key: "action_name", group: "issue" },
  { key: "action_code", group: "issue" },
  { key: "action_type", group: "issue" },
  { key: "action_priority", group: "issue" },
  { key: "action_status", group: "issue" },
  { key: "action_description", group: "issue" },
];

const DEFAULT_ENABLED_MODULES: Record<string, boolean> = {
  start_time: false,
  end_time: false,
  travel_time: false,
  work_duration: false,
  parts_used: false,
  customer_signature: false,
  technician_signature: false,
  checklist: false,
  photos: false,
  auto_translate: false,
  notes: false,
  chat: false,
};

const DEFAULT_DISPLAY_MODE = "cards" as const;

// ─── Default action types (fallback when no field options configured) ─
// MUST mirror the action_type enum values used on the action form
// (action-form.tsx `defaults.action_type`) so the config saved here is
// keyed by the same code the technician app reads off `actions.action_type`.

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

// ─── Types ───────────────────────────────────────────────────────────

type DraftConfig = {
  card_fields: { key: string; group: string }[];
  detail_fields: { key: string; group: string }[];
  enabled_modules: Record<string, boolean>;
  display_mode: "cards" | "details";
};

// ─── Preview placeholder data ────────────────────────────────────────

const PREVIEW_DATA: Record<string, string> = {
  location_name: "Acme Store #123",
  location_address: "123 Main Street",
  location_city: "San Francisco",
  location_country: "United States",
  location_client: "Acme Corp",
  location_contact_name: "John Smith",
  location_contact_phone: "+1 (555) 123-4567",
  asset_name: "HVAC Unit #A-204",
  asset_type: "Power Supply",
  asset_serial_number: "SN-2024-08712",
  asset_condition: "Fair",
  asset_manufacturer: "Carrier",
  asset_model: "WeatherMaker 48TC",
  action_name: "Compressor not starting",
  action_code: "ACM-MNT-047",
  action_type: "Maintenance",
  action_description: "Unit fails to start after power cycle",
  action_priority: "High",
  action_status: "Scheduled",
  action_scheduled_start: "Feb 22, 2026",
  action_due_date: "Feb 28, 2026",
};

const PREVIEW_LABELS: Record<string, string> = {};
for (const group of CARD_FIELD_GROUPS) {
  for (const field of group.fields) {
    PREVIEW_LABELS[field.key] = field.label;
  }
}

// Module preview placeholder content
const MODULE_PREVIEW: Record<string, { type: "time" | "input" | "signature" | "photo" | "toggle" | "text"; placeholder: string }> = {
  start_time: { type: "time", placeholder: "2/22/26, 9:46 PM" },
  end_time: { type: "time", placeholder: "2/22/26, 10:30 PM" },
  travel_time: { type: "time", placeholder: "25 min" },
  work_duration: { type: "time", placeholder: "44 min" },
  parts_used: { type: "input", placeholder: "Add part or material..." },
  customer_signature: { type: "signature", placeholder: "Tap to sign" },
  technician_signature: { type: "signature", placeholder: "Tap to sign" },
  checklist: { type: "input", placeholder: "0/5 items completed" },
  photos: { type: "photo", placeholder: "Tap to add photos" },
  auto_translate: { type: "toggle", placeholder: "Enabled" },
  notes: { type: "text", placeholder: "Add notes..." },
  chat: { type: "input", placeholder: "Send a message..." },
};

// Flat lookup: module key → module def
const ALL_MODULES = MODULE_GROUPS.flatMap((g) => g.modules);

// ─── Component ───────────────────────────────────────────────────────

export function FieldAppManager({
  configs,
  actionTypeOptions,
}: {
  configs: FieldAppConfig[];
  actionTypeOptions: ConfigurableFieldOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Resolve action types: use org's configured options or fall back to defaults
  const actionTypes = useMemo(() => {
    if (actionTypeOptions.length > 0) {
      return actionTypeOptions.map((o) => ({ code: o.code, label: o.label }));
    }
    return DEFAULT_ACTION_TYPES;
  }, [actionTypeOptions]);

  const [activeType, setActiveType] = useState(actionTypes[0]?.code ?? "survey");

  // Build initial drafts from saved configs
  const buildInitialDrafts = useCallback(() => {
    const d: Record<string, DraftConfig> = {};
    for (const c of configs) {
      d[c.action_type_code] = {
        card_fields: c.card_fields,
        detail_fields: c.detail_fields ?? [...DEFAULT_DETAIL_FIELDS],
        enabled_modules: { ...DEFAULT_ENABLED_MODULES, ...c.enabled_modules },
        display_mode: c.display_mode,
      };
    }
    return d;
  }, [configs]);

  const [drafts, setDrafts] = useState<Record<string, DraftConfig>>(buildInitialDrafts);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Get current draft (or default)
  const currentDraft: DraftConfig = drafts[activeType] ?? {
    card_fields: [...DEFAULT_CARD_FIELDS],
    detail_fields: [...DEFAULT_DETAIL_FIELDS],
    enabled_modules: { ...DEFAULT_ENABLED_MODULES },
    display_mode: DEFAULT_DISPLAY_MODE,
  };

  // Active field set depends on the current display mode
  const activeFields = currentDraft.display_mode === "cards"
    ? currentDraft.card_fields
    : currentDraft.detail_fields;
  const enabledFieldKeys = new Set(activeFields.map((f) => f.key));

  // ─── Handlers ────────────────────────────────────────────

  function updateDraft(updater: (prev: DraftConfig) => DraftConfig) {
    setDrafts((prev) => {
      const current = prev[activeType] ?? {
        card_fields: [...DEFAULT_CARD_FIELDS],
        detail_fields: [...DEFAULT_DETAIL_FIELDS],
        enabled_modules: { ...DEFAULT_ENABLED_MODULES },
        display_mode: DEFAULT_DISPLAY_MODE,
      };
      return { ...prev, [activeType]: updater(current) };
    });
    setDirty((prev) => ({ ...prev, [activeType]: true }));
  }

  function toggleField(fieldKey: string, groupKey: string) {
    updateDraft((draft) => {
      // Toggle in the field set that matches the current display mode
      const fieldSetKey = draft.display_mode === "cards" ? "card_fields" : "detail_fields";
      const fields = draft[fieldSetKey];
      const exists = fields.some((f) => f.key === fieldKey);
      return {
        ...draft,
        [fieldSetKey]: exists
          ? fields.filter((f) => f.key !== fieldKey)
          : [...fields, { key: fieldKey, group: groupKey }],
      };
    });
  }

  function toggleModule(moduleKey: string) {
    updateDraft((draft) => ({
      ...draft,
      enabled_modules: {
        ...draft.enabled_modules,
        [moduleKey]: !draft.enabled_modules[moduleKey],
      },
    }));
  }

  function setDisplayMode(mode: "cards" | "details") {
    setDrafts((prev) => {
      const current = prev[activeType] ?? {
        card_fields: [...DEFAULT_CARD_FIELDS],
        detail_fields: [...DEFAULT_DETAIL_FIELDS],
        enabled_modules: { ...DEFAULT_ENABLED_MODULES },
        display_mode: DEFAULT_DISPLAY_MODE,
      };
      return { ...prev, [activeType]: { ...current, display_mode: mode } };
    });
    setDirty((prev) => ({ ...prev, [activeType]: true }));
  }

  function toggleGroup(groupKey: string) {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  }

  function handleSave() {
    startTransition(async () => {
      await upsertFieldAppConfig(activeType, currentDraft);
      setDirty((prev) => ({ ...prev, [activeType]: false }));
      router.refresh();
    });
  }

  // Count enabled modules for badge
  const enabledModuleCount = Object.values(currentDraft.enabled_modules).filter(Boolean).length;

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Section A: Service Type Selector */}
      <div className="flex flex-wrap gap-2">
        {actionTypes.map((at) => {
          const isActive = activeType === at.code;
          const config = drafts[at.code];
          const moduleCount = config
            ? Object.values(config.enabled_modules).filter(Boolean).length
            : 0;
          return (
            <button
              key={at.code}
              onClick={() => setActiveType(at.code)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 ring-2 ring-blue-500"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              {at.label}
              {moduleCount > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isActive ? "bg-blue-100 text-blue-600" : "bg-stone-200 text-stone-500"
                }`}>
                  {moduleCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section B: Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-3">
          {/* Information Display Card */}
          <div className="rounded-xl border border-stone-200 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-stone-900">
                  Information Display
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {currentDraft.display_mode === "cards"
                    ? "Fields shown on the work order card"
                    : "Fields shown on the details page"}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-0.5">
                <button
                  onClick={() => setDisplayMode("cards")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    currentDraft.display_mode === "cards"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  <LayoutGrid className="h-3 w-3" />
                  Cards
                </button>
                <button
                  onClick={() => setDisplayMode("details")}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    currentDraft.display_mode === "details"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  <List className="h-3 w-3" />
                  Details
                </button>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {CARD_FIELD_GROUPS.map((group) => {
                const Icon = group.icon;
                const collapsed = collapsedGroups[group.key] ?? false;
                const enabledCount = group.fields.filter((f) =>
                  enabledFieldKeys.has(f.key),
                ).length;

                return (
                  <div key={group.key}>
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-stone-50"
                    >
                      <Icon className="h-4 w-4 text-stone-400" />
                      <span className="flex-1 text-sm font-medium text-stone-700">
                        {group.label}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                        {enabledCount}/{group.fields.length}
                      </span>
                      {collapsed ? (
                        <ChevronRight className="h-4 w-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-stone-400" />
                      )}
                    </button>
                    {!collapsed && (
                      <div className="pb-2">
                        {group.fields.map((field) => {
                          const enabled = enabledFieldKeys.has(field.key);
                          return (
                            <button
                              key={field.key}
                              onClick={() => toggleField(field.key, group.key)}
                              className="flex w-full items-center gap-3 px-5 py-2 text-left transition-colors hover:bg-stone-50"
                            >
                              <span className="flex h-5 w-5 items-center justify-center">
                                {enabled ? (
                                  <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Circle className="h-3.5 w-3.5 text-stone-300" />
                                )}
                              </span>
                              <span
                                className={`text-sm ${
                                  enabled ? "text-stone-700" : "text-stone-400"
                                }`}
                              >
                                {field.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Modules Card — only in details mode */}
          {currentDraft.display_mode === "details" && (
            <div className="rounded-xl border border-stone-200 bg-white/80 backdrop-blur-xl">
              <div className="border-b border-stone-100 px-5 py-4">
                <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-stone-900">
                  Available Modules
                </h3>
              </div>

              <div className="divide-y divide-stone-100">
                {/* Fixed modules — always on */}
                <div className="px-5 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    ALWAYS ENABLED
                  </p>
                  <div className="space-y-3">
                    {[
                      { key: "start_time", label: "Start Time", description: "When the technician started working", icon: Play },
                      { key: "end_time", label: "End Time", description: "When the technician finished working", icon: Square },
                    ].map((mod) => {
                      const Icon = mod.icon;
                      return (
                        <div key={mod.key} className="flex items-center gap-3 opacity-75">
                          <Icon className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-700">{mod.label}</p>
                            <p className="text-xs text-stone-400">{mod.description}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-stone-400">
                            <Lock className="h-3 w-3" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {MODULE_GROUPS.map((group) => (
                  <div key={group.label} className="px-5 py-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {group.label}
                    </p>
                    <div className="space-y-3">
                      {group.modules.map((mod) => {
                        const Icon = mod.icon;
                        const enabled = currentDraft.enabled_modules[mod.key] ?? false;
                        return (
                          <div
                            key={mod.key}
                            className="flex items-center gap-3"
                          >
                            <Icon className="h-4 w-4 flex-shrink-0 text-stone-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-700">
                                {mod.label}
                              </p>
                              <p className="text-xs text-stone-400">
                                {mod.description}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleModule(mod.key)}
                              className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                                enabled ? "bg-blue-500" : "bg-stone-300"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                  enabled ? "left-[18px]" : "left-0.5"
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mobile Preview + Save — stays pinned while page scrolls */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 space-y-4">
            {/* Save Button */}
            {dirty[activeType] && (
              <button
                onClick={handleSave}
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {pending ? "Saving..." : "Save Configuration"}
              </button>
            )}

            {/* Mobile Preview */}
            <div className="rounded-xl border border-stone-200 bg-white/80 backdrop-blur-xl p-5">
              <h3 className="font-[family-name:var(--font-heading)] mb-4 text-sm font-semibold text-stone-900">
                Mobile App Preview
              </h3>

              {/* Phone frame */}
              <div className="mx-auto w-full max-w-[260px]">
                <div className="rounded-[2rem] border-2 border-stone-800 bg-stone-900 p-2">
                  {/* Notch */}
                  <div className="mx-auto mb-2 h-5 w-20 rounded-full bg-stone-800" />

                  {/* Screen */}
                  <div className="rounded-[1.25rem] bg-stone-50 p-3 min-h-[400px] flex flex-col">
                    {/* Status bar placeholder */}
                    <div className="mb-3 flex items-center justify-between px-1">
                      <span className="text-[10px] font-medium text-stone-400">9:41</span>
                      <div className="flex gap-1">
                        <div className="h-1.5 w-3 rounded-sm bg-stone-300" />
                        <div className="h-1.5 w-1.5 rounded-sm bg-stone-300" />
                        <div className="h-1.5 w-3 rounded-sm bg-stone-300" />
                      </div>
                    </div>

                    {/* Preview content — driven by display_mode toggle */}
                    <div className="flex-1 space-y-2">
                      {currentDraft.display_mode === "cards" ? (
                        <>
                          {/* Cards view: work order list screen */}
                          <div className="mb-3">
                            <p className="text-[11px] font-semibold text-stone-900">
                              Hey, Marcus
                            </p>
                            <p className="text-[9px] text-stone-400 mt-0.5">
                              Here are your work orders for today
                            </p>
                          </div>

                          {/* Single flat work order card */}
                          <div className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] font-medium text-blue-700 capitalize">
                                {actionTypes.find((t) => t.code === activeType)?.label ?? activeType}
                              </span>
                              {enabledFieldKeys.has("action_priority") && (
                                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-medium text-amber-700">
                                  {PREVIEW_DATA.action_priority}
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] font-semibold text-stone-900 mb-1">
                              {enabledFieldKeys.has("action_name")
                                ? PREVIEW_DATA.action_name
                                : "Service Action"}
                            </p>

                            {/* Flat list of all enabled fields (no group separators) */}
                            <div className="space-y-0.5">
                              {CARD_FIELD_GROUPS.flatMap((group) =>
                                group.fields.filter((f) => enabledFieldKeys.has(f.key)),
                              )
                                .filter((f) => f.key !== "action_name" && f.key !== "action_priority")
                                .slice(0, 4)
                                .map((field) => (
                                  <div key={field.key} className="flex items-baseline justify-between gap-2">
                                    <span className="text-[8px] text-stone-400 shrink-0">
                                      {PREVIEW_LABELS[field.key]}
                                    </span>
                                    <span className="text-[8px] font-medium text-stone-600 text-right truncate">
                                      {PREVIEW_DATA[field.key]}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Ghost second card to hint at list */}
                          <div className="rounded-xl border border-stone-200 bg-white/60 p-2.5 opacity-40">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="rounded-full bg-stone-200 px-1.5 py-0.5 text-[8px] text-transparent">type</span>
                            </div>
                            <div className="h-2 w-24 rounded bg-stone-200" />
                            <div className="h-1.5 w-16 rounded bg-stone-100 mt-1.5" />
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Details view: 3 expandable blocks */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[8px] font-medium text-blue-700 capitalize">
                              {actionTypes.find((t) => t.code === activeType)?.label ?? activeType}
                            </span>
                            {enabledFieldKeys.has("action_priority") && (
                              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-medium text-amber-700">
                                {PREVIEW_DATA.action_priority}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] font-semibold text-stone-900 mb-0.5">
                            {enabledFieldKeys.has("action_name")
                              ? PREVIEW_DATA.action_name
                              : "Work Order Details"}
                          </p>
                          {enabledFieldKeys.has("action_code") && (
                            <p className="text-[8px] text-stone-400 font-mono mb-2">
                              {PREVIEW_DATA.action_code}
                            </p>
                          )}

                          {CARD_FIELD_GROUPS.map((group) => {
                            const Icon = group.icon;
                            const enabledFields = group.fields.filter((f) =>
                              enabledFieldKeys.has(f.key),
                            );

                            return (
                              <div
                                key={group.key}
                                className="rounded-lg border border-stone-200 bg-white overflow-hidden"
                              >
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border-b border-stone-100">
                                  <Icon className="h-2.5 w-2.5 text-stone-500" />
                                  <p className="text-[8px] font-semibold text-stone-600">
                                    {group.label}
                                  </p>
                                  <span className="ml-auto text-[7px] text-stone-400">
                                    {enabledFields.length}/{group.fields.length}
                                  </span>
                                </div>
                                {enabledFields.length > 0 ? (
                                  <div className="px-2.5 py-2 space-y-1.5">
                                    {enabledFields.map((field) => (
                                      <div key={field.key} className="flex items-baseline justify-between gap-2">
                                        <span className="text-[7px] text-stone-400 shrink-0">
                                          {PREVIEW_LABELS[field.key]}
                                        </span>
                                        <span className="text-[8px] font-medium text-stone-800 text-right truncate">
                                          {PREVIEW_DATA[field.key]}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="px-2.5 py-2">
                                    <p className="text-[8px] text-stone-300 italic">No fields selected</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Modules: Start Time (fixed) → toggled modules → End Time (fixed) */}
                          {(() => {
                            const startMod = { key: "start_time", label: "Start Time", icon: Play };
                            const endMod = { key: "end_time", label: "End Time", icon: Square };
                            const toggledModules = ALL_MODULES.filter(
                              (m) => !FIXED_MODULES.has(m.key) && currentDraft.enabled_modules[m.key],
                            );

                            const renderModuleCard = (m: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
                              const Icon = m.icon;
                              const preview = MODULE_PREVIEW[m.key];
                              return (
                                <div
                                  key={m.key}
                                  className="rounded-lg border border-stone-200 bg-white p-2"
                                >
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Icon className="h-2.5 w-2.5 text-blue-500" />
                                    <p className="text-[9px] font-semibold text-stone-700">
                                      {m.label}
                                    </p>
                                  </div>
                                  {preview?.type === "signature" ? (
                                    <div className="rounded border border-dashed border-stone-300 bg-stone-50 py-2.5 text-center">
                                      <p className="text-[8px] text-stone-400">{preview.placeholder}</p>
                                    </div>
                                  ) : preview?.type === "time" ? (
                                    <div className="flex items-center gap-1 rounded bg-stone-50 px-2 py-1">
                                      <Clock className="h-2 w-2 text-stone-400" />
                                      <p className="text-[8px] text-stone-400">{preview.placeholder}</p>
                                    </div>
                                  ) : preview?.type === "photo" ? (
                                    <div className="flex items-center gap-1 rounded border border-dashed border-stone-300 bg-stone-50 px-2 py-1.5">
                                      <Camera className="h-2 w-2 text-stone-400" />
                                      <p className="text-[8px] text-stone-400">{preview.placeholder}</p>
                                    </div>
                                  ) : (
                                    <div className="rounded bg-stone-50 px-2 py-1">
                                      <p className="text-[8px] text-stone-400">{preview?.placeholder ?? "..."}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            };

                            return (
                              <>
                                {renderModuleCard(startMod)}
                                {toggledModules.map((m) => renderModuleCard(m))}
                                {renderModuleCard(endMod)}
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>

                    {/* Home indicator */}
                    <div className="mt-3 mx-auto h-1 w-16 rounded-full bg-stone-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
