"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConfigurableFieldOption } from "@fox/supabase";
import { upsertFieldOptions } from "@fox/supabase/actions/field-options";
import {
  MapPin,
  FolderKanban,
  Zap,
  Package,
  Plus,
  X,
  GripVertical,
  Loader2,
  Check,
  Search,
} from "lucide-react";

// ── Module + field definitions ─────────────────────────────────────

type FieldDef = {
  key: string;
  label: string;
  masterList: { label: string; code: string }[] | null; // null = free-form
};

const modules = [
  { key: "locations", label: "Locations", icon: MapPin },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "actions", label: "Actions", icon: Zap },
  { key: "assets", label: "Assets", icon: Package },
] as const;

// ── Master lists ───────────────────────────────────────────────────

const MASTER_COUNTRIES: { label: string; code: string }[] = [
  { label: "Afghanistan", code: "AF" },
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "Andorra", code: "AD" },
  { label: "Angola", code: "AO" },
  { label: "Antigua and Barbuda", code: "AG" },
  { label: "Argentina", code: "AR" },
  { label: "Armenia", code: "AM" },
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Azerbaijan", code: "AZ" },
  { label: "Bahamas", code: "BS" },
  { label: "Bahrain", code: "BH" },
  { label: "Bangladesh", code: "BD" },
  { label: "Barbados", code: "BB" },
  { label: "Belarus", code: "BY" },
  { label: "Belgium", code: "BE" },
  { label: "Belize", code: "BZ" },
  { label: "Benin", code: "BJ" },
  { label: "Bhutan", code: "BT" },
  { label: "Bolivia", code: "BO" },
  { label: "Bosnia and Herzegovina", code: "BA" },
  { label: "Botswana", code: "BW" },
  { label: "Brazil", code: "BR" },
  { label: "Brunei", code: "BN" },
  { label: "Bulgaria", code: "BG" },
  { label: "Burkina Faso", code: "BF" },
  { label: "Burundi", code: "BI" },
  { label: "Cabo Verde", code: "CV" },
  { label: "Cambodia", code: "KH" },
  { label: "Cameroon", code: "CM" },
  { label: "Canada", code: "CA" },
  { label: "Central African Republic", code: "CF" },
  { label: "Chad", code: "TD" },
  { label: "Chile", code: "CL" },
  { label: "China", code: "CN" },
  { label: "Colombia", code: "CO" },
  { label: "Comoros", code: "KM" },
  { label: "Congo (DRC)", code: "CD" },
  { label: "Congo (Republic)", code: "CG" },
  { label: "Costa Rica", code: "CR" },
  { label: "Croatia", code: "HR" },
  { label: "Cuba", code: "CU" },
  { label: "Cyprus", code: "CY" },
  { label: "Czech Republic", code: "CZ" },
  { label: "Denmark", code: "DK" },
  { label: "Djibouti", code: "DJ" },
  { label: "Dominica", code: "DM" },
  { label: "Dominican Republic", code: "DO" },
  { label: "Ecuador", code: "EC" },
  { label: "Egypt", code: "EG" },
  { label: "El Salvador", code: "SV" },
  { label: "Equatorial Guinea", code: "GQ" },
  { label: "Eritrea", code: "ER" },
  { label: "Estonia", code: "EE" },
  { label: "Eswatini", code: "SZ" },
  { label: "Ethiopia", code: "ET" },
  { label: "Fiji", code: "FJ" },
  { label: "Finland", code: "FI" },
  { label: "France", code: "FR" },
  { label: "Gabon", code: "GA" },
  { label: "Gambia", code: "GM" },
  { label: "Georgia", code: "GE" },
  { label: "Germany", code: "DE" },
  { label: "Ghana", code: "GH" },
  { label: "Greece", code: "GR" },
  { label: "Grenada", code: "GD" },
  { label: "Guatemala", code: "GT" },
  { label: "Guinea", code: "GN" },
  { label: "Guinea-Bissau", code: "GW" },
  { label: "Guyana", code: "GY" },
  { label: "Haiti", code: "HT" },
  { label: "Honduras", code: "HN" },
  { label: "Hong Kong", code: "HK" },
  { label: "Hungary", code: "HU" },
  { label: "Iceland", code: "IS" },
  { label: "India", code: "IN" },
  { label: "Indonesia", code: "ID" },
  { label: "Iran", code: "IR" },
  { label: "Iraq", code: "IQ" },
  { label: "Ireland", code: "IE" },
  { label: "Israel", code: "IL" },
  { label: "Italy", code: "IT" },
  { label: "Ivory Coast", code: "CI" },
  { label: "Jamaica", code: "JM" },
  { label: "Japan", code: "JP" },
  { label: "Jordan", code: "JO" },
  { label: "Kazakhstan", code: "KZ" },
  { label: "Kenya", code: "KE" },
  { label: "Kiribati", code: "KI" },
  { label: "Kosovo", code: "XK" },
  { label: "Kuwait", code: "KW" },
  { label: "Kyrgyzstan", code: "KG" },
  { label: "Laos", code: "LA" },
  { label: "Latvia", code: "LV" },
  { label: "Lebanon", code: "LB" },
  { label: "Lesotho", code: "LS" },
  { label: "Liberia", code: "LR" },
  { label: "Libya", code: "LY" },
  { label: "Liechtenstein", code: "LI" },
  { label: "Lithuania", code: "LT" },
  { label: "Luxembourg", code: "LU" },
  { label: "Macau", code: "MO" },
  { label: "Madagascar", code: "MG" },
  { label: "Malawi", code: "MW" },
  { label: "Malaysia", code: "MY" },
  { label: "Maldives", code: "MV" },
  { label: "Mali", code: "ML" },
  { label: "Malta", code: "MT" },
  { label: "Marshall Islands", code: "MH" },
  { label: "Mauritania", code: "MR" },
  { label: "Mauritius", code: "MU" },
  { label: "Mexico", code: "MX" },
  { label: "Micronesia", code: "FM" },
  { label: "Moldova", code: "MD" },
  { label: "Monaco", code: "MC" },
  { label: "Mongolia", code: "MN" },
  { label: "Montenegro", code: "ME" },
  { label: "Morocco", code: "MA" },
  { label: "Mozambique", code: "MZ" },
  { label: "Myanmar", code: "MM" },
  { label: "Namibia", code: "NA" },
  { label: "Nauru", code: "NR" },
  { label: "Nepal", code: "NP" },
  { label: "Netherlands", code: "NL" },
  { label: "New Zealand", code: "NZ" },
  { label: "Nicaragua", code: "NI" },
  { label: "Niger", code: "NE" },
  { label: "Nigeria", code: "NG" },
  { label: "North Korea", code: "KP" },
  { label: "North Macedonia", code: "MK" },
  { label: "Norway", code: "NO" },
  { label: "Oman", code: "OM" },
  { label: "Pakistan", code: "PK" },
  { label: "Palau", code: "PW" },
  { label: "Palestine", code: "PS" },
  { label: "Panama", code: "PA" },
  { label: "Papua New Guinea", code: "PG" },
  { label: "Paraguay", code: "PY" },
  { label: "Peru", code: "PE" },
  { label: "Philippines", code: "PH" },
  { label: "Poland", code: "PL" },
  { label: "Portugal", code: "PT" },
  { label: "Puerto Rico", code: "PR" },
  { label: "Qatar", code: "QA" },
  { label: "Romania", code: "RO" },
  { label: "Russia", code: "RU" },
  { label: "Rwanda", code: "RW" },
  { label: "Saint Kitts and Nevis", code: "KN" },
  { label: "Saint Lucia", code: "LC" },
  { label: "Saint Vincent and the Grenadines", code: "VC" },
  { label: "Samoa", code: "WS" },
  { label: "San Marino", code: "SM" },
  { label: "Sao Tome and Principe", code: "ST" },
  { label: "Saudi Arabia", code: "SA" },
  { label: "Senegal", code: "SN" },
  { label: "Serbia", code: "RS" },
  { label: "Seychelles", code: "SC" },
  { label: "Sierra Leone", code: "SL" },
  { label: "Singapore", code: "SG" },
  { label: "Slovakia", code: "SK" },
  { label: "Slovenia", code: "SI" },
  { label: "Solomon Islands", code: "SB" },
  { label: "Somalia", code: "SO" },
  { label: "South Africa", code: "ZA" },
  { label: "South Korea", code: "KR" },
  { label: "South Sudan", code: "SS" },
  { label: "Spain", code: "ES" },
  { label: "Sri Lanka", code: "LK" },
  { label: "Sudan", code: "SD" },
  { label: "Suriname", code: "SR" },
  { label: "Sweden", code: "SE" },
  { label: "Switzerland", code: "CH" },
  { label: "Syria", code: "SY" },
  { label: "Taiwan", code: "TW" },
  { label: "Tajikistan", code: "TJ" },
  { label: "Tanzania", code: "TZ" },
  { label: "Thailand", code: "TH" },
  { label: "Timor-Leste", code: "TL" },
  { label: "Togo", code: "TG" },
  { label: "Tonga", code: "TO" },
  { label: "Trinidad and Tobago", code: "TT" },
  { label: "Tunisia", code: "TN" },
  { label: "Turkey", code: "TR" },
  { label: "Turkmenistan", code: "TM" },
  { label: "Tuvalu", code: "TV" },
  { label: "Uganda", code: "UG" },
  { label: "Ukraine", code: "UA" },
  { label: "United Arab Emirates", code: "AE" },
  { label: "United Kingdom", code: "GB" },
  { label: "United States", code: "US" },
  { label: "Uruguay", code: "UY" },
  { label: "Uzbekistan", code: "UZ" },
  { label: "Vanuatu", code: "VU" },
  { label: "Vatican City", code: "VA" },
  { label: "Venezuela", code: "VE" },
  { label: "Vietnam", code: "VN" },
  { label: "Yemen", code: "YE" },
  { label: "Zambia", code: "ZM" },
  { label: "Zimbabwe", code: "ZW" },
];

const MASTER_TIMEZONES: { label: string; code: string }[] = [
  { label: "US Eastern (ET)", code: "America/New_York" },
  { label: "US Central (CT)", code: "America/Chicago" },
  { label: "US Mountain (MT)", code: "America/Denver" },
  { label: "US Pacific (PT)", code: "America/Los_Angeles" },
  { label: "US Alaska (AKT)", code: "America/Anchorage" },
  { label: "US Hawaii (HST)", code: "Pacific/Honolulu" },
  { label: "UTC", code: "UTC" },
  { label: "London (GMT/BST)", code: "Europe/London" },
  { label: "Paris (CET)", code: "Europe/Paris" },
  { label: "Berlin (CET)", code: "Europe/Berlin" },
  { label: "Amsterdam (CET)", code: "Europe/Amsterdam" },
  { label: "Stockholm (CET)", code: "Europe/Stockholm" },
  { label: "Helsinki (EET)", code: "Europe/Helsinki" },
  { label: "Moscow (MSK)", code: "Europe/Moscow" },
  { label: "Dubai (GST)", code: "Asia/Dubai" },
  { label: "Kolkata (IST)", code: "Asia/Kolkata" },
  { label: "Bangkok (ICT)", code: "Asia/Bangkok" },
  { label: "Singapore (SGT)", code: "Asia/Singapore" },
  { label: "Hong Kong (HKT)", code: "Asia/Hong_Kong" },
  { label: "Shanghai (CST)", code: "Asia/Shanghai" },
  { label: "Tokyo (JST)", code: "Asia/Tokyo" },
  { label: "Seoul (KST)", code: "Asia/Seoul" },
  { label: "Sydney (AEST)", code: "Australia/Sydney" },
  { label: "Melbourne (AEST)", code: "Australia/Melbourne" },
  { label: "Auckland (NZST)", code: "Pacific/Auckland" },
  { label: "Toronto (ET)", code: "America/Toronto" },
  { label: "Vancouver (PT)", code: "America/Vancouver" },
  { label: "Mexico City (CST)", code: "America/Mexico_City" },
  { label: "Sao Paulo (BRT)", code: "America/Sao_Paulo" },
  { label: "Buenos Aires (ART)", code: "America/Argentina/Buenos_Aires" },
];

const LOCATION_TYPES = [
  { label: "Commercial", code: "commercial" },
  { label: "Industrial", code: "industrial" },
  { label: "Residential", code: "residential" },
  { label: "Government", code: "government" },
  { label: "Data Center", code: "data_center" },
  { label: "Tower Site", code: "tower_site" },
  { label: "Other", code: "other" },
];

const LOCATION_STATUSES = [
  { label: "Active", code: "active" },
  { label: "Inactive", code: "inactive" },
  { label: "Planned", code: "planned" },
  { label: "Decommissioned", code: "decommissioned" },
];

const CRITICALITY = [
  { label: "Low", code: "low" },
  { label: "Medium", code: "medium" },
  { label: "High", code: "high" },
  { label: "Critical", code: "critical" },
];

const PRIORITY = [
  { label: "Low", code: "low" },
  { label: "Medium", code: "medium" },
  { label: "High", code: "high" },
  { label: "Critical", code: "critical" },
];

const PROJECT_TYPES = [
  { label: "Deployment", code: "deployment" },
  { label: "Construction", code: "construction" },
  { label: "Upgrade", code: "upgrade" },
  { label: "Rollout", code: "rollout" },
  { label: "Decommissioning", code: "decommissioning" },
  { label: "Migration", code: "migration" },
  { label: "Expansion", code: "expansion" },
  { label: "Remediation", code: "remediation" },
  { label: "Maintenance", code: "maintenance" },
];

const PROJECT_STATUSES = [
  { label: "Draft", code: "draft" },
  { label: "Planned", code: "planned" },
  { label: "Active", code: "active" },
  { label: "On Hold", code: "on_hold" },
  { label: "Completed", code: "completed" },
  { label: "Cancelled", code: "cancelled" },
];

const ACTION_TYPES = [
  { label: "Site Survey", code: "site_survey" },
  { label: "Installation", code: "installation" },
  { label: "Inspection", code: "inspection" },
  { label: "Preventive Maintenance", code: "preventive_maintenance" },
  { label: "Repair", code: "repair" },
  { label: "Testing", code: "testing" },
  { label: "Cable Pull", code: "cable_pull" },
  { label: "Equipment Swap", code: "equipment_swap" },
  { label: "Commissioning", code: "commissioning" },
  { label: "Documentation", code: "documentation" },
  { label: "Other", code: "other" },
];

const ACTION_STATUSES = [
  { label: "Pending", code: "pending" },
  { label: "Scheduled", code: "scheduled" },
  { label: "In Progress", code: "in_progress" },
  { label: "Completed", code: "completed" },
  { label: "Blocked", code: "blocked" },
  { label: "Cancelled", code: "cancelled" },
];

const ASSET_TYPES = [
  { label: "Cable", code: "cable" },
  { label: "Antenna", code: "antenna" },
  { label: "Power Supply", code: "power_supply" },
  { label: "Solar Panel", code: "solar_panel" },
  { label: "Battery", code: "battery" },
  { label: "Generator", code: "generator" },
  { label: "Server", code: "server" },
  { label: "Router", code: "router" },
  { label: "Sensor", code: "sensor" },
  { label: "Meter", code: "meter" },
  { label: "Tool", code: "tool" },
  { label: "Vehicle", code: "vehicle" },
  { label: "Other", code: "other" },
];

const ASSET_STATUSES = [
  { label: "Available", code: "available" },
  { label: "Deployed", code: "deployed" },
  { label: "In Maintenance", code: "in_maintenance" },
  { label: "Retired", code: "retired" },
];

const ASSET_CONDITIONS = [
  { label: "Excellent", code: "excellent" },
  { label: "Good", code: "good" },
  { label: "Fair", code: "fair" },
  { label: "Poor", code: "poor" },
];

const moduleFields: Record<string, FieldDef[]> = {
  locations: [
    { key: "client", label: "Client", masterList: null },
    { key: "location_type", label: "Location Type", masterList: LOCATION_TYPES },
    { key: "location_status", label: "Status", masterList: LOCATION_STATUSES },
    { key: "country", label: "Country", masterList: MASTER_COUNTRIES },
    { key: "timezone", label: "Timezone", masterList: MASTER_TIMEZONES },
    { key: "criticality", label: "Criticality", masterList: CRITICALITY },
  ],
  projects: [
    { key: "project_type", label: "Project Type", masterList: PROJECT_TYPES },
    { key: "project_status", label: "Status", masterList: PROJECT_STATUSES },
    { key: "priority", label: "Priority", masterList: PRIORITY },
  ],
  actions: [
    { key: "action_type", label: "Action Type", masterList: ACTION_TYPES },
    { key: "action_status", label: "Status", masterList: ACTION_STATUSES },
    { key: "priority", label: "Priority", masterList: PRIORITY },
    { key: "category", label: "Category", masterList: null },
  ],
  assets: [
    { key: "asset_type", label: "Asset Type", masterList: ASSET_TYPES },
    { key: "asset_status", label: "Status", masterList: ASSET_STATUSES },
    { key: "asset_condition", label: "Condition", masterList: ASSET_CONDITIONS },
    { key: "criticality", label: "Criticality", masterList: CRITICALITY },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────

type DraftOption = { label: string; code: string };

const fi = "h-11 rounded-xl border-stone-200 px-4 text-sm shadow-none placeholder:text-stone-400";

function toSnakeCase(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// ── Component ──────────────────────────────────────────────────────

export function FieldOptionsManager({
  options,
}: {
  options: ConfigurableFieldOption[];
}) {
  const [activeModule, setActiveModule] = useState("locations");
  const [activeFieldKey, setActiveFieldKey] = useState(moduleFields.locations[0].key);

  // Build drafts for ALL field keys from saved options
  const [drafts, setDrafts] = useState<Record<string, DraftOption[]>>(() => {
    const d: Record<string, DraftOption[]> = {};
    for (const fields of Object.values(moduleFields)) {
      for (const f of fields) {
        if (!d[f.key]) {
          d[f.key] = options
            .filter((o) => o.field_key === f.key)
            .map((o) => ({ label: o.label, code: o.code }));
        }
      }
    }
    return d;
  });
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [catLabel, setCatLabel] = useState("");
  const router = useRouter();

  const fields = moduleFields[activeModule];
  const activeField = fields.find((f) => f.key === activeFieldKey) ?? fields[0];
  const currentDraft = drafts[activeField.key] ?? [];

  function updateDraft(key: string, items: DraftOption[]) {
    setDrafts((prev) => ({ ...prev, [key]: items }));
    setDirty((prev) => ({ ...prev, [key]: true }));
  }

  function addOption(opt: DraftOption) {
    if (currentDraft.some((d) => d.code === opt.code)) return;
    updateDraft(activeField.key, [...currentDraft, opt]);
  }

  function removeOption(code: string) {
    updateDraft(activeField.key, currentDraft.filter((d) => d.code !== code));
  }

  function moveOption(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentDraft.length) return;
    const items = [...currentDraft];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    updateDraft(activeField.key, items);
  }

  function handleSave() {
    startTransition(async () => {
      const items = currentDraft.map((opt, i) => ({
        label: opt.label,
        code: opt.code,
        sort_order: i,
      }));
      await upsertFieldOptions(activeField.key, items);
      setDirty((prev) => ({ ...prev, [activeField.key]: false }));
      router.refresh();
    });
  }

  function handleAddFreeForm() {
    const label = catLabel.trim();
    if (!label) return;
    const code = toSnakeCase(label);
    if (!code) return;
    addOption({ label, code });
    setCatLabel("");
  }

  const hasMasterList = (activeField.masterList ?? []).length > 0;
  const masterList = activeField.masterList ?? [];
  const filteredMaster = useMemo(() => {
    if (masterList.length === 0) return [];
    const q = search.toLowerCase();
    return masterList.filter(
      (item) =>
        !currentDraft.some((d) => d.code === item.code) &&
        (item.label.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)),
    );
  }, [masterList, currentDraft, search]);

  return (
    <div>
      {/* Module Tabs */}
      <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const active = activeModule === mod.key;
          // Count: how many field_keys in this module have configured options
          const count = moduleFields[mod.key].filter(
            (f) => (drafts[f.key]?.length ?? 0) > 0,
          ).length;
          return (
            <button
              key={mod.key}
              onClick={() => {
                setActiveModule(mod.key);
                setActiveFieldKey(moduleFields[mod.key][0].key);
                setSearch("");
              }}
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

      {/* Field selector pills */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {fields.map((f) => {
          const active = activeFieldKey === f.key;
          const count = drafts[f.key]?.length ?? 0;
          return (
            <button
              key={f.key}
              onClick={() => { setActiveFieldKey(f.key); setSearch(""); setCatLabel(""); }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
                active
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  active ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: configured options */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Configured Options
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {currentDraft.length} option{currentDraft.length !== 1 ? "s" : ""} for {activeField.label.toLowerCase()}
              </p>
            </div>
            {dirty[activeField.key] && (
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
              <p className="text-sm text-stone-400">No options configured.</p>
              <p className="text-xs text-stone-300 mt-1">
                Add options from the right panel. Default options will be used in forms.
              </p>
            </div>
          ) : (
            <div>
              {currentDraft.map((opt, i) => (
                <div
                  key={opt.code}
                  className="flex items-center gap-3 border-b border-stone-50 px-6 py-3 last:border-0 group"
                >
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveOption(i, -1)}
                      disabled={i === 0}
                      className="text-stone-300 hover:text-stone-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <GripVertical className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-stone-700">{opt.label}</span>
                    <span className="ml-2 text-xs font-[family-name:var(--font-mono)] text-stone-400">{opt.code}</span>
                  </div>
                  <button
                    onClick={() => removeOption(opt.code)}
                    className="shrink-0 p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: add options */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="border-b border-stone-100 px-6 py-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Add Options
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {hasMasterList
                ? "Pick from predefined options or create your own below."
                : "Type a label and a code will be auto-generated."}
            </p>
          </div>

          {/* Predefined master list — shown first when available */}
          {hasMasterList && (
            <div>
              <div className="px-6 py-3 border-b border-stone-50">
                <p className="text-xs font-medium text-stone-500 mb-2">Predefined options</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    className={`${fi} pl-10`}
                    placeholder={`Search ${activeField.label.toLowerCase()} options...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-[350px] overflow-y-auto border-b border-stone-100">
                {filteredMaster.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-stone-400">
                      {search ? "No matching options found." : "All predefined options have been added."}
                    </p>
                  </div>
                ) : (
                  filteredMaster.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => addOption(item)}
                      className="flex items-center gap-3 w-full border-b border-stone-50 px-6 py-3 last:border-0 text-left hover:bg-stone-50 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span className="text-sm text-stone-700">{item.label}</span>
                      <span className="text-xs font-[family-name:var(--font-mono)] text-stone-400 ml-auto">{item.code}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Free-form custom entry — shown after predefined */}
          <div className="px-6 py-4 bg-stone-50/50">
            <p className="text-xs font-medium text-stone-500 mb-2">Create custom option</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  className={fi}
                  placeholder="Label (e.g. Electrical)"
                  value={catLabel}
                  onChange={(e) => setCatLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFreeForm();
                    }
                  }}
                />
              </div>
              <div className="w-32">
                <div className="h-11 rounded-xl border border-stone-200 bg-white px-3 flex items-center text-xs font-[family-name:var(--font-mono)] text-stone-400">
                  {toSnakeCase(catLabel) || "code"}
                </div>
              </div>
              <Button
                onClick={handleAddFreeForm}
                disabled={!catLabel.trim() || !toSnakeCase(catLabel.trim()) || currentDraft.some((d) => d.code === toSnakeCase(catLabel.trim()))}
                className="h-11 rounded-xl bg-stone-900 px-4 text-white hover:bg-stone-800 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
