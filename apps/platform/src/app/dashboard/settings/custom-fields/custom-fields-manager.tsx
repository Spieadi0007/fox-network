"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomFieldDefinition, FieldRequirementOverride } from "@fox/supabase";
import {
  createFieldDefinition,
  updateFieldDefinition,
  deleteFieldDefinition,
  upsertFieldRequirementOverride,
} from "@fox/supabase/actions/custom-fields";
import {
  MapPin,
  FolderKanban,
  Zap,
  Package,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  GripVertical,
  Loader2,
  Lock,
  ChevronDown,
} from "lucide-react";

const modules = [
  { key: "locations", label: "Locations", icon: MapPin },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "actions", label: "Actions", icon: Zap },
  { key: "assets", label: "Assets", icon: Package },
] as const;

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Yes / No" },
  { value: "select", label: "Dropdown" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
];

type PlatformField = {
  field_name: string;
  field_label: string;
  field_type: string;
  required: boolean;
  description: string;
  options?: string[];
  system_required?: boolean;
};

const platformFields: Record<string, PlatformField[]> = {
  locations: [
    { field_name: "name", field_label: "Name", field_type: "text", required: true, system_required: true, description: "Display name for the site or facility" },
    { field_name: "code", field_label: "Site Code", field_type: "text", required: false, description: "Short unique identifier like HQ-01 or DC-NYC" },
    { field_name: "address", field_label: "Address", field_type: "text", required: true, description: "Street address of the location" },
    { field_name: "city", field_label: "City", field_type: "text", required: true, description: "City where the site is located" },
    { field_name: "state", field_label: "State", field_type: "text", required: true, description: "State or province" },
    { field_name: "zip_code", field_label: "Zip Code", field_type: "text", required: true, description: "Postal or zip code" },
    { field_name: "country", field_label: "Country", field_type: "text", required: true, description: "Country code, defaults to US" },
    { field_name: "region", field_label: "Region", field_type: "text", required: false, description: "Geographic region for grouping sites (e.g. Northeast, EMEA)" },
    { field_name: "location_type", field_label: "Type", field_type: "select", required: true, description: "Classification of the facility", options: ["commercial", "industrial", "residential", "government", "data_center", "tower_site", "other"] },
    { field_name: "status", field_label: "Status", field_type: "select", required: true, system_required: true, description: "Current operational status of the site", options: ["active", "inactive", "planned", "decommissioned"] },
    { field_name: "criticality", field_label: "Criticality", field_type: "select", required: false, description: "How critical this location is to operations", options: ["low", "medium", "high", "critical"] },
    { field_name: "latitude", field_label: "Latitude", field_type: "number", required: false, description: "GPS latitude for mapping and distance calculations" },
    { field_name: "longitude", field_label: "Longitude", field_type: "number", required: false, description: "GPS longitude for mapping and distance calculations" },
    { field_name: "timezone", field_label: "Timezone", field_type: "text", required: true, description: "Local timezone for scheduling (e.g. America/New_York)" },
    { field_name: "contact_name", field_label: "Contact Name", field_type: "text", required: false, description: "On-site contact person for coordination" },
    { field_name: "contact_phone", field_label: "Contact Phone", field_type: "text", required: false, description: "Phone number of the on-site contact" },
    { field_name: "contact_email", field_label: "Contact Email", field_type: "email", required: false, description: "Email of the on-site contact" },
    { field_name: "access_instructions", field_label: "Access Instructions", field_type: "textarea", required: false, description: "Gate codes, key locations, or entry procedures" },
    { field_name: "notes", field_label: "Notes", field_type: "textarea", required: false, description: "General notes about this location" },
    { field_name: "tags", field_label: "Tags", field_type: "tags", required: false, description: "Labels for filtering and organizing locations" },
  ],
  projects: [
    { field_name: "name", field_label: "Name", field_type: "text", required: true, system_required: true, description: "Name of the project or campaign" },
    { field_name: "code", field_label: "Project Code", field_type: "text", required: false, description: "Short unique identifier like PRJ-2024-001" },
    { field_name: "description", field_label: "Description", field_type: "textarea", required: false, description: "Detailed scope and objectives of the project" },
    { field_name: "location_id", field_label: "Location", field_type: "relation", required: true, system_required: true, description: "The site where this project takes place" },
    { field_name: "project_type", field_label: "Type", field_type: "select", required: true, system_required: true, description: "Category of work being performed", options: ["deployment", "survey", "maintenance", "inspection", "upgrade", "remediation"] },
    { field_name: "status", field_label: "Status", field_type: "select", required: true, system_required: true, description: "Current lifecycle stage of the project", options: ["draft", "planned", "active", "on_hold", "completed", "cancelled"] },
    { field_name: "priority", field_label: "Priority", field_type: "select", required: true, description: "Urgency level for scheduling and resource allocation", options: ["low", "medium", "high", "critical"] },
    { field_name: "start_date", field_label: "Start Date", field_type: "date", required: true, description: "Planned start date for the project" },
    { field_name: "end_date", field_label: "End Date", field_type: "date", required: false, description: "Target completion date" },
    { field_name: "actual_start_date", field_label: "Actual Start Date", field_type: "date", required: false, description: "When work actually began" },
    { field_name: "actual_end_date", field_label: "Actual End Date", field_type: "date", required: false, description: "When the project was actually completed" },
    { field_name: "completion_percentage", field_label: "Completion %", field_type: "number", required: false, description: "Overall progress from 0 to 100 percent" },
    { field_name: "budget", field_label: "Budget", field_type: "number", required: false, description: "Approved budget for the project" },
    { field_name: "actual_cost", field_label: "Actual Cost", field_type: "number", required: false, description: "Total spend to date" },
    { field_name: "tags", field_label: "Tags", field_type: "tags", required: false, description: "Labels for filtering and organizing projects" },
  ],
  actions: [
    { field_name: "name", field_label: "Name", field_type: "text", required: true, system_required: true, description: "Short title for the task or work order" },
    { field_name: "description", field_label: "Description", field_type: "textarea", required: false, description: "Detailed instructions or scope of work" },
    { field_name: "project_id", field_label: "Project", field_type: "relation", required: true, system_required: true, description: "Parent project this action belongs to" },
    { field_name: "location_id", field_label: "Location", field_type: "relation", required: false, description: "Specific site where the work happens (if different from project)" },
    { field_name: "action_type", field_label: "Type", field_type: "select", required: true, system_required: true, description: "Kind of work to be performed", options: ["survey", "installation", "inspection", "maintenance", "repair", "testing", "documentation", "other"] },
    { field_name: "status", field_label: "Status", field_type: "select", required: true, system_required: true, description: "Current state of the action", options: ["pending", "scheduled", "in_progress", "completed", "blocked", "cancelled"] },
    { field_name: "priority", field_label: "Priority", field_type: "select", required: true, description: "Urgency level for dispatch and scheduling", options: ["low", "medium", "high", "critical"] },
    { field_name: "category", field_label: "Category", field_type: "text", required: false, description: "Trade or discipline (e.g. electrical, mechanical, network)" },
    { field_name: "assigned_to", field_label: "Assigned To", field_type: "relation", required: false, description: "Technician or team member responsible for this action" },
    { field_name: "due_date", field_label: "Due Date", field_type: "datetime", required: false, description: "Deadline for completing this action" },
    { field_name: "scheduled_start", field_label: "Scheduled Start", field_type: "datetime", required: false, description: "Planned start date and time" },
    { field_name: "scheduled_end", field_label: "Scheduled End", field_type: "datetime", required: false, description: "Planned end date and time" },
    { field_name: "actual_start", field_label: "Actual Start", field_type: "datetime", required: false, description: "When the technician actually started work" },
    { field_name: "actual_end", field_label: "Actual End", field_type: "datetime", required: false, description: "When the work was actually completed" },
    { field_name: "estimated_duration_min", field_label: "Est. Duration (min)", field_type: "number", required: false, description: "Expected time to complete in minutes" },
    { field_name: "actual_duration_min", field_label: "Actual Duration (min)", field_type: "number", required: false, description: "Actual time spent on the work in minutes" },
    { field_name: "estimated_cost", field_label: "Estimated Cost", field_type: "number", required: false, description: "Budgeted cost for this action" },
    { field_name: "actual_cost", field_label: "Actual Cost", field_type: "number", required: false, description: "Actual spend including labor and materials" },
    { field_name: "completion_notes", field_label: "Completion Notes", field_type: "textarea", required: false, description: "Summary of what was done when closing the action" },
    { field_name: "notes", field_label: "Notes", field_type: "textarea", required: false, description: "General notes or observations about this action" },
    { field_name: "tags", field_label: "Tags", field_type: "tags", required: false, description: "Labels for filtering and organizing actions" },
  ],
  assets: [
    { field_name: "name", field_label: "Name", field_type: "text", required: true, system_required: true, description: "Display name for the equipment or asset" },
    { field_name: "asset_tag", field_label: "Asset Tag", field_type: "text", required: false, description: "Internal tracking label (e.g. IT-0042)" },
    { field_name: "asset_type", field_label: "Type", field_type: "select", required: true, system_required: true, description: "Category of equipment", options: ["cable", "antenna", "power_supply", "solar_panel", "battery", "generator", "server", "router", "sensor", "meter", "tool", "vehicle", "other"] },
    { field_name: "serial_number", field_label: "Serial Number", field_type: "text", required: true, system_required: true, description: "Manufacturer serial number, unique per organization" },
    { field_name: "status", field_label: "Status", field_type: "select", required: true, system_required: true, description: "Current lifecycle state of the asset", options: ["available", "deployed", "in_maintenance", "retired"] },
    { field_name: "condition", field_label: "Condition", field_type: "select", required: false, description: "Physical condition rating", options: ["excellent", "good", "fair", "poor"] },
    { field_name: "criticality", field_label: "Criticality", field_type: "select", required: false, description: "How critical this asset is to operations", options: ["low", "medium", "high", "critical"] },
    { field_name: "location_id", field_label: "Location", field_type: "relation", required: false, description: "Site where this asset is currently deployed" },
    { field_name: "manufacturer", field_label: "Manufacturer", field_type: "text", required: false, description: "Brand or manufacturer name" },
    { field_name: "model", field_label: "Model", field_type: "text", required: false, description: "Model number or product name" },
    { field_name: "barcode", field_label: "Barcode", field_type: "text", required: false, description: "Scannable barcode or QR code value" },
    { field_name: "description", field_label: "Description", field_type: "textarea", required: false, description: "Additional details about the asset" },
    { field_name: "purchase_date", field_label: "Purchase Date", field_type: "date", required: false, description: "Date the asset was purchased" },
    { field_name: "purchase_cost", field_label: "Purchase Cost", field_type: "number", required: false, description: "Original purchase price for depreciation tracking" },
    { field_name: "install_date", field_label: "Install Date", field_type: "date", required: false, description: "Date the asset was installed or deployed" },
    { field_name: "warranty_end", field_label: "Warranty End", field_type: "date", required: false, description: "Warranty expiration date for service planning" },
    { field_name: "assigned_to", field_label: "Assigned To", field_type: "relation", required: false, description: "Person responsible for this asset" },
    { field_name: "notes", field_label: "Notes", field_type: "textarea", required: false, description: "General notes about this asset" },
    { field_name: "tags", field_label: "Tags", field_type: "tags", required: false, description: "Labels for filtering and organizing assets" },
  ],
};

const typeLabels: Record<string, string> = {
  text: "Text",
  textarea: "Long Text",
  number: "Number",
  date: "Date",
  datetime: "Date & Time",
  boolean: "Yes / No",
  select: "Dropdown",
  url: "URL",
  email: "Email",
  relation: "Relation",
  tags: "Tags",
};

const fi = "h-11 rounded-xl border-stone-200 px-4 text-sm shadow-none placeholder:text-stone-400";
const ft = "data-[size=default]:h-11 rounded-xl border-stone-200 px-4 w-full text-sm shadow-none";

type EditingField = {
  id?: string;
  field_label: string;
  field_name: string;
  field_type: string;
  options: string;
  required: boolean;
};

const emptyField: EditingField = {
  field_label: "",
  field_name: "",
  field_type: "text",
  options: "",
  required: false,
};

export function CustomFieldsManager({
  definitions,
  overrides = [],
}: {
  definitions: CustomFieldDefinition[];
  overrides?: FieldRequirementOverride[];
}) {
  const [activeModule, setActiveModule] = useState<string>("locations");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditingField>(emptyField);
  const [pending, startTransition] = useTransition();
  const [platformOpen, setPlatformOpen] = useState(true);
  const [editingRequirements, setEditingRequirements] = useState(false);
  const router = useRouter();

  const moduleFields = definitions.filter((d) => d.module === activeModule);
  const modulePlatformFields = platformFields[activeModule] ?? [];
  const moduleOverrides = overrides.filter((o) => o.module === activeModule);

  function getEffectiveRequired(pf: PlatformField) {
    if (pf.system_required) return true;
    const override = moduleOverrides.find((o) => o.field_name === pf.field_name);
    return override ? override.required : pf.required;
  }

  function handleToggleRequired(pf: PlatformField) {
    if (pf.system_required) return;
    const current = getEffectiveRequired(pf);
    startTransition(async () => {
      await upsertFieldRequirementOverride(activeModule, pf.field_name, !current);
      router.refresh();
    });
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setForm(emptyField);
  }

  function startEdit(def: CustomFieldDefinition) {
    setEditingId(def.id);
    setAdding(false);
    setForm({
      id: def.id,
      field_label: def.field_label,
      field_name: def.field_name,
      field_type: def.field_type,
      options: def.options ? def.options.join(", ") : "",
      required: def.required,
    });
  }

  function cancel() {
    setAdding(false);
    setEditingId(null);
    setForm(emptyField);
  }

  function toSnakeCase(str: string) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function handleSave() {
    if (!form.field_label.trim()) return;

    const fieldName = form.field_name || toSnakeCase(form.field_label);
    const options =
      form.field_type === "select" && form.options
        ? form.options.split(",").map((o) => o.trim()).filter(Boolean)
        : null;

    startTransition(async () => {
      if (editingId) {
        await updateFieldDefinition(editingId, {
          field_label: form.field_label.trim(),
          field_name: fieldName,
          field_type: form.field_type,
          options,
          required: form.required,
        });
      } else {
        const maxOrder = moduleFields.length > 0
          ? Math.max(...moduleFields.map((f) => f.display_order))
          : -1;

        await createFieldDefinition({
          module: activeModule,
          field_label: form.field_label.trim(),
          field_name: fieldName,
          field_type: form.field_type,
          options,
          required: form.required,
          display_order: maxOrder + 1,
        });
      }
      cancel();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteFieldDefinition(id);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Module Tabs */}
      <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const active = activeModule === mod.key;
          const count = definitions.filter((d) => d.module === mod.key).length;
          return (
            <button
              key={mod.key}
              onClick={() => { setActiveModule(mod.key); cancel(); }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {mod.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  active ? "bg-stone-100 text-stone-600" : "bg-stone-200/60 text-stone-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Platform Fields */}
      <div className={`mt-6 rounded-2xl border bg-white overflow-hidden ${editingRequirements ? "border-blue-200" : "border-stone-200"}`}>
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <button
            onClick={() => setPlatformOpen(!platformOpen)}
            className="flex-1 text-left"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-stone-400" />
              <h3 className="text-sm font-semibold text-stone-900">
                Platform Fields
              </h3>
              <span className="text-xs rounded-full bg-stone-100 px-1.5 py-0.5 text-stone-500">
                {modulePlatformFields.length}
              </span>
              <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${platformOpen ? "rotate-180" : ""}`} />
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {editingRequirements
                ? "Toggle which fields are required or optional for your organization."
                : `Built-in fields for ${modules.find((m) => m.key === activeModule)?.label.toLowerCase()}. Use "Edit Requirements" to customize.`}
            </p>
          </button>
          <button
            onClick={() => setEditingRequirements(!editingRequirements)}
            className={`shrink-0 ml-4 h-8 rounded-lg px-3 text-xs font-medium transition-colors ${
              editingRequirements
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {editingRequirements ? (
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3" />Done</span>
            ) : (
              <span className="flex items-center gap-1.5"><Pencil className="h-3 w-3" />Edit Requirements</span>
            )}
          </button>
        </div>

        {platformOpen && modulePlatformFields.map((pf) => {
          const effectiveRequired = getEffectiveRequired(pf);
          const isSystem = !!pf.system_required;
          const canToggle = editingRequirements && !isSystem;
          return (
            <div key={pf.field_name} className={`flex items-center gap-4 border-b border-stone-50 px-6 py-3.5 last:border-0 ${editingRequirements && !isSystem ? "bg-blue-50/30" : "bg-stone-50/30"}`}>
              <Lock className="h-3.5 w-3.5 text-stone-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-700">{pf.field_label}</span>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${effectiveRequired ? "text-red-500" : "text-stone-400"}`}>
                    {effectiveRequired ? "Required" : "Optional"}
                  </span>
                  {isSystem && (
                    <Lock className="h-2.5 w-2.5 text-stone-300" />
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">{pf.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-stone-400 font-mono">{pf.field_name}</span>
                  <span className="text-xs text-stone-300">&middot;</span>
                  <span className="text-xs text-stone-400">
                    {typeLabels[pf.field_type] ?? pf.field_type}
                  </span>
                  {pf.options && pf.options.length > 0 && (
                    <>
                      <span className="text-xs text-stone-300">&middot;</span>
                      <span className="text-xs text-stone-400">
                        {pf.options.length} option{pf.options.length !== 1 ? "s" : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {editingRequirements ? (
                <button
                  onClick={() => canToggle && handleToggleRequired(pf)}
                  disabled={!canToggle || pending}
                  className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isSystem
                      ? "bg-red-200 cursor-not-allowed opacity-60"
                      : effectiveRequired
                        ? "bg-red-400 hover:bg-red-500 cursor-pointer"
                        : "bg-stone-300 hover:bg-stone-400 cursor-pointer"
                  }`}
                  title={isSystem ? "System-required (cannot change)" : effectiveRequired ? "Click to make optional" : "Click to make required"}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${effectiveRequired ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              ) : (
                <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-medium text-stone-400 uppercase tracking-wider">
                  System
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Fields */}
      <div className="mt-4 rounded-2xl border border-stone-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">
              Custom Fields
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {moduleFields.length} custom field{moduleFields.length !== 1 ? "s" : ""} for {modules.find((m) => m.key === activeModule)?.label.toLowerCase()}
            </p>
          </div>
          {!adding && !editingId && (
            <Button
              onClick={startAdd}
              className="h-9 rounded-lg bg-stone-900 px-4 text-xs text-white hover:bg-stone-800"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Field
            </Button>
          )}
        </div>

        {/* Existing fields */}
        {moduleFields.length === 0 && !adding && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-stone-400">No custom fields defined for this module yet.</p>
            <p className="text-xs text-stone-300 mt-1">
              Click &quot;Add Field&quot; to create your first custom field.
            </p>
          </div>
        )}

        {moduleFields.map((def) => (
          <div key={def.id}>
            {editingId === def.id ? (
              <FieldForm
                form={form}
                setForm={setForm}
                onSave={handleSave}
                onCancel={cancel}
                pending={pending}
              />
            ) : (
              <div className="flex items-center gap-4 border-b border-stone-50 px-6 py-4 last:border-0">
                <GripVertical className="h-4 w-4 text-stone-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-900">{def.field_label}</span>
                    {def.required && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-red-500">Required</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-stone-400 font-mono">{def.field_name}</span>
                    <span className="text-xs text-stone-300">&middot;</span>
                    <span className="text-xs text-stone-400">
                      {fieldTypes.find((t) => t.value === def.field_type)?.label ?? def.field_type}
                    </span>
                    {def.options && def.options.length > 0 && (
                      <>
                        <span className="text-xs text-stone-300">&middot;</span>
                        <span className="text-xs text-stone-400">
                          {def.options.length} option{def.options.length !== 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(def)}
                    className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(def.id)}
                    disabled={pending}
                    className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add new field form */}
        {adding && (
          <FieldForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={cancel}
            pending={pending}
          />
        )}
      </div>
    </div>
  );
}

function FieldForm({
  form,
  setForm,
  onSave,
  onCancel,
  pending,
}: {
  form: EditingField;
  setForm: (f: EditingField) => void;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-5 last:border-0">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4">
          <label className="text-xs font-medium text-stone-500 mb-1 block">Label</label>
          <Input
            className={fi}
            placeholder="e.g. Contract Number"
            value={form.field_label}
            onChange={(e) => {
              const label = e.target.value;
              const name = form.id ? form.field_name : label.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "_");
              setForm({ ...form, field_label: label, field_name: name });
            }}
          />
        </div>
        <div className="col-span-3">
          <label className="text-xs font-medium text-stone-500 mb-1 block">Field Name</label>
          <Input
            className={`${fi} font-mono text-xs`}
            placeholder="contract_number"
            value={form.field_name}
            onChange={(e) => setForm({ ...form, field_name: e.target.value })}
          />
        </div>
        <div className="col-span-3">
          <label className="text-xs font-medium text-stone-500 mb-1 block">Type</label>
          <Select value={form.field_type} onValueChange={(v) => setForm({ ...form, field_type: v })}>
            <SelectTrigger className={ft}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 flex items-end gap-1">
          <button
            onClick={onSave}
            disabled={pending || !form.field_label.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          <button
            onClick={onCancel}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Second row: options for select, required toggle */}
      <div className="flex items-center gap-4 mt-3">
        {form.field_type === "select" && (
          <div className="flex-1">
            <label className="text-xs font-medium text-stone-500 mb-1 block">Options (comma-separated)</label>
            <Input
              className={fi}
              placeholder="Option A, Option B, Option C"
              value={form.options}
              onChange={(e) => setForm({ ...form, options: e.target.value })}
            />
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={form.required}
            onChange={(e) => setForm({ ...form, required: e.target.checked })}
            className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
          />
          <span className="text-xs font-medium text-stone-600">Required</span>
        </label>
      </div>
    </div>
  );
}
