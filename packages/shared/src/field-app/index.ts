// Canonical Field App catalog: the field keys managers can expose on action
// cards, and the modules technicians can fill during a visit.
//
// This is the single source of truth for those keys. It is deliberately
// data-only (no React, no icons) so both the settings UI and the technician
// runtime can import it; each consumer maps a key to its own icon locally.
//
// Anything keyed off these strings — the `card_fields` / `detail_fields` /
// `enabled_modules` columns on `field_app_config`, and the technician
// renderer — must derive from here rather than restating the list.

// ─── Fields ──────────────────────────────────────────────────────────

export type FieldGroupKey = "location" | "asset" | "issue";

export type FieldDef = { key: string; label: string };

export type FieldGroupDef = {
  key: FieldGroupKey;
  label: string;
  fields: FieldDef[];
};

export const FIELD_GROUPS: FieldGroupDef[] = [
  {
    key: "location",
    label: "Location Details",
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

/** Every field key, in group order. */
export const FIELD_KEYS: string[] = FIELD_GROUPS.flatMap((g) =>
  g.fields.map((f) => f.key),
);

/** field key → display label. */
export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  FIELD_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.label])),
);

/** field key → the group it belongs to. */
export const FIELD_GROUP_BY_KEY: Record<string, FieldGroupKey> =
  Object.fromEntries(
    FIELD_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, g.key])),
  );

// ─── Modules ─────────────────────────────────────────────────────────

export type ModuleKind =
  | "time"
  | "text"
  | "input"
  | "signature"
  | "photo"
  | "flag";

export type ModuleDef = {
  key: string;
  label: string;
  /** Explanatory subtitle shown to managers on the settings page. */
  description: string;
  /** Input placeholder shown to technicians in the field app. */
  placeholder: string;
  kind: ModuleKind;
  /** Section heading this module sits under in the settings UI. */
  group: string;
};

/** Always enabled; managers cannot toggle these off. */
export const FIXED_MODULES: readonly string[] = ["start_time", "end_time"];

export function isFixedModule(key: string): boolean {
  return FIXED_MODULES.includes(key);
}

/**
 * All modules in canonical render order — fixed modules first, then the
 * toggleable ones grouped by section. The technician app renders in this
 * order, so it is load-bearing rather than cosmetic.
 */
export const MODULE_DEFS: ModuleDef[] = [
  {
    key: "start_time",
    label: "Start Time",
    description: "When the technician started working",
    placeholder: "When you started working",
    kind: "time",
    group: "ALWAYS ENABLED",
  },
  {
    key: "end_time",
    label: "End Time",
    description: "When the technician finished working",
    placeholder: "When you finished working",
    kind: "time",
    group: "ALWAYS ENABLED",
  },
  {
    key: "travel_time",
    label: "Travel Time",
    description: "Time spent traveling to location",
    placeholder: "Time spent traveling",
    kind: "input",
    group: "TIME TRACKING",
  },
  {
    key: "work_duration",
    label: "Work Duration",
    description: "Calculated total work duration",
    placeholder: "Total work duration",
    kind: "input",
    group: "TIME TRACKING",
  },
  {
    key: "parts_used",
    label: "Parts Used",
    description: "Materials consumed during service",
    placeholder: "Materials consumed",
    kind: "text",
    group: "MATERIALS & PARTS",
  },
  {
    key: "customer_signature",
    label: "Customer Signature",
    description: "Digital signature from customer",
    placeholder: "Signature from customer",
    kind: "signature",
    group: "VERIFICATION",
  },
  {
    key: "technician_signature",
    label: "Technician Signature",
    description: "Digital signature from technician",
    placeholder: "Your signature",
    kind: "signature",
    group: "VERIFICATION",
  },
  {
    key: "checklist",
    label: "Checklist",
    description: "Checklist of items to verify",
    placeholder: "Items to verify",
    kind: "text",
    group: "VERIFICATION",
  },
  {
    key: "photos",
    label: "Photos",
    description: "Before/after photos from the service",
    placeholder: "Before/after photos (paste URLs)",
    kind: "photo",
    group: "MEDIA & PHOTOS",
  },
  {
    key: "auto_translate",
    label: "Auto Translate",
    description: "Auto-translate notes and text fields",
    placeholder: "Auto-translate text fields",
    kind: "flag",
    group: "LANGUAGE",
  },
  {
    key: "notes",
    label: "Notes",
    description: "Additional notes about the service",
    placeholder: "Additional notes",
    kind: "text",
    group: "GENERAL",
  },
  {
    key: "chat",
    label: "Chat",
    description: "Real-time chat with support/team",
    placeholder: "Real-time chat (coming soon)",
    kind: "flag",
    group: "GENERAL",
  },
];

export const MODULE_BY_KEY: Record<string, ModuleDef> = Object.fromEntries(
  MODULE_DEFS.map((m) => [m.key, m]),
);

export const MODULE_KEYS: string[] = MODULE_DEFS.map((m) => m.key);

/** Modules a manager can actually switch on and off. */
export const TOGGLEABLE_MODULES: ModuleDef[] = MODULE_DEFS.filter(
  (m) => !isFixedModule(m.key),
);

export const TOGGLEABLE_MODULE_KEYS: string[] = TOGGLEABLE_MODULES.map(
  (m) => m.key,
);

export type ModuleGroupDef = { label: string; modules: ModuleDef[] };

/**
 * Toggleable modules grouped for the settings UI, in first-appearance order.
 * Fixed modules are excluded — the settings page renders those in its own
 * locked "always enabled" block.
 */
export const MODULE_GROUPS: ModuleGroupDef[] = TOGGLEABLE_MODULES.reduce<
  ModuleGroupDef[]
>((groups, module) => {
  const existing = groups.find((g) => g.label === module.group);
  if (existing) existing.modules.push(module);
  else groups.push({ label: module.group, modules: [module] });
  return groups;
}, []);

// ─── Defaults ────────────────────────────────────────────────────────
// Used when no `field_app_config` row exists for an action type.

export type ConfiguredField = { key: string; group: string };

export const DEFAULT_CARD_FIELDS: ConfiguredField[] = [
  { key: "location_name", group: "location" },
  { key: "location_address", group: "location" },
  { key: "asset_name", group: "asset" },
  { key: "action_name", group: "issue" },
  { key: "action_priority", group: "issue" },
];

export const DEFAULT_DETAIL_FIELDS: ConfiguredField[] = [
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

/**
 * Every module key mapped to `false`. Fixed modules are included so the
 * persisted shape covers the full catalog, but consumers must treat them as
 * always-on via `isFixedModule` rather than reading this value.
 */
export const DEFAULT_ENABLED_MODULES: Record<string, boolean> =
  Object.fromEntries(MODULE_KEYS.map((key) => [key, false]));

export const DEFAULT_DISPLAY_MODE = "cards" as const;

// ─── Value resolution ────────────────────────────────────────────────

/** Resolve a field key to its display value given the joined row data. */
export function resolveFieldValue(
  key: string,
  data: {
    action: Record<string, unknown>;
    location: Record<string, unknown> | null;
    asset: Record<string, unknown> | null;
  },
): string {
  const { action, location, asset } = data;
  const map: Record<string, unknown> = {
    location_name: location?.name,
    location_address: location?.address,
    location_city: location?.city,
    location_country: location?.country,
    location_client: location?.client,
    location_contact_name: location?.contact_name,
    location_contact_phone: location?.contact_phone,
    asset_name: asset?.name,
    asset_type: asset?.asset_type,
    asset_serial_number: asset?.serial_number,
    asset_condition: asset?.condition,
    asset_manufacturer: asset?.manufacturer,
    asset_model: asset?.model,
    action_name: action.name,
    action_code: action.code,
    action_type: action.action_type,
    action_priority: action.priority,
    action_status: action.status,
    action_scheduled_start: action.scheduled_start,
    action_due_date: action.due_date,
    action_description: action.description,
  };
  const v = map[key];
  if (v == null || v === "") return "—";
  // Format dates
  if (
    (key === "action_scheduled_start" || key === "action_due_date") &&
    typeof v === "string"
  ) {
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  return String(v).replace(/_/g, " ");
}
