// Shared catalog for the Field App: field-key → label/group and module defs.
// Mirrors the keys used by the Field App settings manager so the technician
// app renders exactly what managers configured.

export type FieldGroupKey = "location" | "asset" | "issue";

export const FIELD_GROUPS: {
  key: FieldGroupKey;
  label: string;
}[] = [
  { key: "location", label: "Location Details" },
  { key: "asset", label: "Asset Details" },
  { key: "issue", label: "Issue Details" },
];

export const FIELD_LABELS: Record<string, string> = {
  // location
  location_name: "Location Name",
  location_address: "Address",
  location_city: "City",
  location_country: "Country",
  location_client: "Client",
  location_contact_name: "Contact Person",
  location_contact_phone: "Phone",
  // asset
  asset_name: "Asset Name",
  asset_type: "Asset Type",
  asset_serial_number: "Serial Number",
  asset_condition: "Condition",
  asset_manufacturer: "Manufacturer",
  asset_model: "Model",
  // issue
  action_name: "Issue Title",
  action_code: "Issue Code",
  action_type: "Issue Type",
  action_priority: "Priority",
  action_status: "Status",
  action_scheduled_start: "Scheduled Date",
  action_due_date: "Due Date",
  action_description: "Description",
};

// Modules (start_time / end_time are always enabled)
export const FIXED_MODULES = ["start_time", "end_time"] as const;

export type ModuleDef = {
  key: string;
  label: string;
  description: string;
  kind: "time" | "text" | "input" | "signature" | "photo" | "flag";
};

export const MODULE_DEFS: ModuleDef[] = [
  { key: "start_time", label: "Start Time", description: "When you started working", kind: "time" },
  { key: "end_time", label: "End Time", description: "When you finished working", kind: "time" },
  { key: "travel_time", label: "Travel Time", description: "Time spent traveling", kind: "input" },
  { key: "work_duration", label: "Work Duration", description: "Total work duration", kind: "input" },
  { key: "parts_used", label: "Parts Used", description: "Materials consumed", kind: "text" },
  { key: "customer_signature", label: "Customer Signature", description: "Signature from customer", kind: "signature" },
  { key: "technician_signature", label: "Technician Signature", description: "Your signature", kind: "signature" },
  { key: "checklist", label: "Checklist", description: "Items to verify", kind: "text" },
  { key: "photos", label: "Photos", description: "Before/after photos (paste URLs)", kind: "photo" },
  { key: "auto_translate", label: "Auto Translate", description: "Auto-translate text fields", kind: "flag" },
  { key: "notes", label: "Notes", description: "Additional notes", kind: "text" },
  { key: "chat", label: "Chat", description: "Real-time chat (coming soon)", kind: "flag" },
];

export const MODULE_BY_KEY: Record<string, ModuleDef> = Object.fromEntries(
  MODULE_DEFS.map((m) => [m.key, m]),
);

// Default field sets when no config row exists for an action type
export const DEFAULT_CARD_FIELDS = [
  { key: "location_name", group: "location" },
  { key: "location_address", group: "location" },
  { key: "asset_name", group: "asset" },
  { key: "action_name", group: "issue" },
  { key: "action_priority", group: "issue" },
];

export const DEFAULT_DETAIL_FIELDS = [
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

// Resolve a field key to its display value given the joined row data.
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
