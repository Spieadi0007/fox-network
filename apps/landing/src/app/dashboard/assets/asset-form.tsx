"use client";

import { useTransition, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createAsset, updateAsset } from "@fox/supabase/actions/assets";
import type { Asset, Location, CustomFieldDefinition, FieldRequirementOverride, ConfigurableFieldOption } from "@fox/supabase";
import { CustomFieldsRenderer, extractCustomFields } from "@/components/custom-fields-renderer";
import { Package, Loader2 } from "lucide-react";

const fi = "h-12 rounded-xl border-stone-200 px-4 text-sm placeholder:text-stone-400 shadow-none";
const ft = "data-[size=default]:h-12 rounded-xl border-stone-200 px-4 w-full text-sm shadow-none";
const fa = "rounded-xl border-stone-200 px-4 py-3 text-sm placeholder:text-stone-400 min-h-[100px] shadow-none";

const defaults: Record<string, { label: string; value: string }[]> = {
  asset_type: [
    { label: "Cable", value: "cable" },
    { label: "Antenna", value: "antenna" },
    { label: "Power Supply", value: "power_supply" },
    { label: "Solar Panel", value: "solar_panel" },
    { label: "Battery", value: "battery" },
    { label: "Generator", value: "generator" },
    { label: "Server", value: "server" },
    { label: "Router", value: "router" },
    { label: "Sensor", value: "sensor" },
    { label: "Meter", value: "meter" },
    { label: "Tool", value: "tool" },
    { label: "Vehicle", value: "vehicle" },
    { label: "Other", value: "other" },
  ],
  asset_status: [
    { label: "Available", value: "available" },
    { label: "Deployed", value: "deployed" },
    { label: "In Maintenance", value: "in_maintenance" },
    { label: "Retired", value: "retired" },
  ],
  asset_condition: [
    { label: "Excellent", value: "excellent" },
    { label: "Good", value: "good" },
    { label: "Fair", value: "fair" },
    { label: "Poor", value: "poor" },
  ],
  criticality: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Critical", value: "critical" },
  ],
};

function resolveOptions(fieldKey: string, allOptions: ConfigurableFieldOption[]) {
  const configured = allOptions.filter((o) => o.field_key === fieldKey);
  if (configured.length > 0) return configured.map((o) => ({ label: o.label, value: o.code }));
  return defaults[fieldKey] ?? [];
}

type OrgMember = { id: string; name: string | null; email: string; role: string };

const SYSTEM_REQUIRED: Record<string, boolean> = { name: true, status: true, asset_type: true, serial_number: true };

const DEFAULT_REQUIRED: Record<string, boolean> = {
  name: true, asset_type: true, serial_number: true, status: true,
};

function statusColor(s: string) {
  if (["active", "available", "completed"].includes(s)) return "bg-emerald-50 text-emerald-700";
  if (["draft", "planned", "pending"].includes(s)) return "bg-amber-50 text-amber-700";
  if (["in_progress", "scheduled", "deployed"].includes(s)) return "bg-blue-50 text-blue-700";
  if (["on_hold", "blocked", "in_maintenance"].includes(s)) return "bg-orange-50 text-orange-700";
  if (["cancelled", "retired", "decommissioned"].includes(s)) return "bg-red-50 text-red-700";
  return "bg-stone-100 text-stone-600";
}

function critColor(p: string) {
  if (p === "low") return "bg-stone-100 text-stone-600";
  if (p === "medium") return "bg-blue-50 text-blue-700";
  if (p === "high") return "bg-amber-50 text-amber-700";
  if (p === "critical") return "bg-red-50 text-red-700";
  return "bg-stone-100 text-stone-600";
}

function conditionColor(c: string) {
  if (c === "excellent") return "bg-emerald-50 text-emerald-700";
  if (c === "good") return "bg-blue-50 text-blue-700";
  if (c === "fair") return "bg-amber-50 text-amber-700";
  if (c === "poor") return "bg-red-50 text-red-700";
  return "bg-stone-100 text-stone-600";
}

export function AssetForm({
  asset,
  locations,
  members = [],
  customFieldDefinitions = [],
  fieldOverrides = [],
  fieldOptions = [],
}: {
  asset?: Asset;
  locations: Location[];
  members?: OrgMember[];
  customFieldDefinitions?: CustomFieldDefinition[];
  fieldOverrides?: FieldRequirementOverride[];
  fieldOptions?: ConfigurableFieldOption[];
}) {
  const assetTypes = resolveOptions("asset_type", fieldOptions);
  const assetStatuses = resolveOptions("asset_status", fieldOptions);
  const conditions = resolveOptions("asset_condition", fieldOptions);
  const criticalityOptions = resolveOptions("criticality", fieldOptions);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!asset;
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<Record<string, string>>({});

  const updatePreview = useCallback(() => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { data[k] = v as string; });
    setPreview(data);
  }, []);

  useEffect(() => { updatePreview(); }, [updatePreview]);

  function isRequired(field: string) {
    if (SYSTEM_REQUIRED[field]) return true;
    const override = fieldOverrides.find((o) => o.field_name === field);
    if (override) return override.required;
    return !!DEFAULT_REQUIRED[field];
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const tagsRaw = (form.get("tags") as string) || "";

    startTransition(async () => {
      const locationId = form.get("location_id") as string;
      const conditionVal = form.get("condition") as string;

      const values = {
        name: form.get("name") as string,
        asset_tag: (form.get("asset_tag") as string) || null,
        asset_type: form.get("asset_type") as string,
        serial_number: form.get("serial_number") as string,
        status: form.get("status") as string,
        condition: conditionVal || null,
        criticality: form.get("criticality") as string,
        location_id: locationId || null,
        manufacturer: (form.get("manufacturer") as string) || null,
        model: (form.get("model") as string) || null,
        barcode: (form.get("barcode") as string) || null,
        purchase_date: (form.get("purchase_date") as string) || null,
        purchase_cost: form.get("purchase_cost") ? Number(form.get("purchase_cost")) : null,
        install_date: (form.get("install_date") as string) || null,
        warranty_end: (form.get("warranty_end") as string) || null,
        assigned_to: (form.get("assigned_to") as string) || null,
        description: (form.get("description") as string) || null,
        notes: (form.get("notes") as string) || null,
        tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
        custom_fields: extractCustomFields(form, customFieldDefinitions),
      };

      if (isEdit) {
        await updateAsset(asset!.id, values);
        router.push(`/dashboard/assets/${asset!.id}`);
      } else {
        await createAsset(values);
        router.push("/dashboard/assets");
      }
      router.refresh();
    });
  }

  const locationName = locations.find((l) => l.id === preview.location_id)?.name;
  const assignedMember = members.find((m) => m.id === preview.assigned_to);
  const hasIdentification = preview.serial_number || preview.manufacturer || preview.model;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)] text-stone-900">
        {isEdit ? "Edit asset" : "Create a new asset"}
      </h1>
      <div className="flex items-center gap-1.5 mt-2 text-sm">
        <Link href="/dashboard" className="text-stone-600 hover:text-stone-900">Dashboard</Link>
        <span className="text-stone-300">&middot;</span>
        <Link href="/dashboard/assets" className="text-stone-600 hover:text-stone-900">Assets</Link>
        <span className="text-stone-300">&middot;</span>
        <span className="text-stone-400">{isEdit ? "Edit" : "Create"}</span>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} onInput={updatePreview} className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left card - live preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-8 self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-stone-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-stone-900 font-[family-name:var(--font-heading)] truncate">
                  {preview.name || "Untitled asset"}
                </h3>
                {preview.asset_tag && (
                  <p className="text-xs font-[family-name:var(--font-mono)] text-stone-400 mt-0.5">{preview.asset_tag}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {preview.asset_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                  {preview.asset_type.replace(/_/g, " ")}
                </span>
              )}
              {preview.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(preview.status)}`}>
                  {preview.status.replace(/_/g, " ")}
                </span>
              )}
              {preview.condition && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${conditionColor(preview.condition)}`}>
                  {preview.condition}
                </span>
              )}
              {preview.criticality && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${critColor(preview.criticality)}`}>
                  {preview.criticality}
                </span>
              )}
            </div>

            {hasIdentification && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Identification</p>
                {preview.serial_number && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-stone-400">S/N</span>
                    <span className="text-sm font-[family-name:var(--font-mono)] text-stone-700">{preview.serial_number}</span>
                  </div>
                )}
                {(preview.manufacturer || preview.model) && (
                  <p className="text-sm text-stone-700 mt-1">
                    {[preview.manufacturer, preview.model].filter(Boolean).join(" ")}
                  </p>
                )}
              </div>
            )}

            {locationName && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-1">Location</p>
                <p className="text-sm text-stone-700">{locationName}</p>
              </div>
            )}

            {assignedMember && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-1">Assigned to</p>
                <p className="text-sm font-medium text-stone-700">{assignedMember.name || assignedMember.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right card - form */}
        <div className="lg:col-span-3 rounded-2xl border border-stone-200 bg-white p-8">
          <div className="grid grid-cols-2 gap-5">
            <Input className={fi} placeholder={`Asset name${isRequired("name") ? " *" : ""}`} name="name" required={isRequired("name")} defaultValue={asset?.name} />
            <Input className={fi} placeholder="Asset tag (internal ID)" name="asset_tag" defaultValue={asset?.asset_tag ?? ""} />

            <Select name="asset_type" defaultValue={asset?.asset_type ?? "other"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input className={fi} placeholder={`Serial number${isRequired("serial_number") ? " *" : ""}`} name="serial_number" required={isRequired("serial_number")} defaultValue={asset?.serial_number} />

            <Select name="status" defaultValue={asset?.status ?? "available"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {assetStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="condition" defaultValue={asset?.condition ?? ""} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="criticality" defaultValue={asset?.criticality ?? "medium"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                {criticalityOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="location_id" defaultValue={asset?.location_id ?? ""} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Identification */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Identification</h3>
          <div className="grid grid-cols-2 gap-5">
            <Input className={fi} placeholder="Manufacturer" name="manufacturer" defaultValue={asset?.manufacturer ?? ""} />
            <Input className={fi} placeholder="Model" name="model" defaultValue={asset?.model ?? ""} />
            <Input className={`${fi} col-span-2`} placeholder="Barcode / QR code" name="barcode" defaultValue={asset?.barcode ?? ""} />
          </div>

          {/* Financial & Dates */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Financial & Dates</h3>
          <div className="grid grid-cols-2 gap-5">
            <Input className={fi} placeholder="Purchase date" name="purchase_date" type="date" defaultValue={asset?.purchase_date ?? ""} />
            <Input className={fi} placeholder="Purchase cost ($)" name="purchase_cost" type="number" step="0.01" defaultValue={asset?.purchase_cost ?? ""} />
            <Input className={fi} placeholder="Install date" name="install_date" type="date" defaultValue={asset?.install_date ?? ""} />
            <Input className={fi} placeholder="Warranty end" name="warranty_end" type="date" defaultValue={asset?.warranty_end ?? ""} />
          </div>

          {/* Assignment */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Assignment</h3>
          <div className="grid grid-cols-2 gap-5">
            <Select name="assigned_to" defaultValue={asset?.assigned_to ?? ""} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Assigned to" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div />
          </div>

          <Input className={`${fi} mt-5 w-full`} placeholder="Tags (comma-separated)" name="tags" defaultValue={asset?.tags?.join(", ") ?? ""} />

          <Textarea
            className={`${fa} mt-5 w-full`}
            placeholder="Description (optional)"
            name="description"
            defaultValue={asset?.description ?? ""}
          />

          <Textarea
            className={`${fa} mt-5 w-full`}
            placeholder="Notes (optional)"
            name="notes"
            defaultValue={asset?.notes ?? ""}
          />

          {customFieldDefinitions.length > 0 && (
            <div className="mt-6 border-t border-stone-100 pt-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4">Custom Fields</h3>
              <CustomFieldsRenderer
                definitions={customFieldDefinitions}
                values={(asset?.custom_fields as Record<string, unknown>) ?? {}}
              />
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              disabled={pending}
              className="h-11 rounded-xl px-8 bg-stone-900 text-white hover:bg-stone-800 text-sm font-medium"
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create asset"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
