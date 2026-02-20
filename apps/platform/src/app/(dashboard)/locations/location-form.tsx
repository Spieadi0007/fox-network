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
import { createLocation, updateLocation } from "@fox/supabase/actions/locations";
import type { Location, CustomFieldDefinition, FieldRequirementOverride, ConfigurableFieldOption } from "@fox/supabase";
import { CustomFieldsRenderer, extractCustomFields } from "@/components/custom-fields-renderer";
import { MapPin, Loader2 } from "lucide-react";

const fi = "h-12 rounded-xl border-stone-200 px-4 text-sm placeholder:text-stone-400 shadow-none";
const ft = "data-[size=default]:h-12 rounded-xl border-stone-200 px-4 w-full text-sm shadow-none";
const fa = "rounded-xl border-stone-200 px-4 py-3 text-sm placeholder:text-stone-400 min-h-[100px] shadow-none";

const defaults: Record<string, { label: string; value: string }[]> = {
  client: [],
  location_type: [
    { label: "Commercial", value: "commercial" },
    { label: "Industrial", value: "industrial" },
    { label: "Residential", value: "residential" },
    { label: "Government", value: "government" },
    { label: "Data Center", value: "data_center" },
    { label: "Tower Site", value: "tower_site" },
    { label: "Other", value: "other" },
  ],
  location_status: [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Planned", value: "planned" },
    { label: "Decommissioned", value: "decommissioned" },
  ],
  criticality: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Critical", value: "critical" },
  ],
  timezone: [
    { label: "Eastern (ET)", value: "America/New_York" },
    { label: "Central (CT)", value: "America/Chicago" },
    { label: "Mountain (MT)", value: "America/Denver" },
    { label: "Pacific (PT)", value: "America/Los_Angeles" },
    { label: "Alaska (AKT)", value: "America/Anchorage" },
    { label: "Hawaii (HST)", value: "Pacific/Honolulu" },
    { label: "UTC", value: "UTC" },
  ],
  country: [
    { label: "United States", value: "US" },
  ],
};

function resolveOptions(fieldKey: string, allOptions: ConfigurableFieldOption[]) {
  const configured = allOptions.filter((o) => o.field_key === fieldKey);
  if (configured.length > 0) return configured.map((o) => ({ label: o.label, value: o.code }));
  return defaults[fieldKey] ?? [];
}

const SYSTEM_REQUIRED: Record<string, boolean> = { name: true, status: true };

const DEFAULT_REQUIRED: Record<string, boolean> = {
  name: true, address: true, city: true, state: true, zip_code: true,
  country: true, client: true, location_type: true, status: true, timezone: true,
};

function statusColor(s: string) {
  if (["active", "available", "completed"].includes(s)) return "bg-emerald-50 text-emerald-700";
  if (["draft", "planned", "pending"].includes(s)) return "bg-amber-50 text-amber-700";
  if (["in_progress", "scheduled"].includes(s)) return "bg-blue-50 text-blue-700";
  if (["on_hold", "blocked"].includes(s)) return "bg-orange-50 text-orange-700";
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

export function LocationForm({ location, customFieldDefinitions = [], fieldOverrides = [], fieldOptions = [] }: { location?: Location; customFieldDefinitions?: CustomFieldDefinition[]; fieldOverrides?: FieldRequirementOverride[]; fieldOptions?: ConfigurableFieldOption[] }) {
  const clients = resolveOptions("client", fieldOptions);
  const locationTypes = resolveOptions("location_type", fieldOptions);
  const locationStatuses = resolveOptions("location_status", fieldOptions);
  const countries = resolveOptions("country", fieldOptions);
  const timezones = resolveOptions("timezone", fieldOptions);
  const criticalityOptions = resolveOptions("criticality", fieldOptions);

  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!location;
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
      const values = {
        name: form.get("name") as string,
        code: (form.get("code") as string) || null,
        address: form.get("address") as string,
        city: form.get("city") as string,
        state: form.get("state") as string,
        zip_code: form.get("zip_code") as string,
        country: (form.get("country") as string) || "US",
        client: form.get("client") as string,
        location_type: form.get("location_type") as string,
        status: form.get("status") as string,
        timezone: form.get("timezone") as string,
        region: (form.get("region") as string) || null,
        criticality: form.get("criticality") as string,
        latitude: form.get("latitude") ? Number(form.get("latitude")) : null,
        longitude: form.get("longitude") ? Number(form.get("longitude")) : null,
        notes: (form.get("notes") as string) || null,
        contact_name: (form.get("contact_name") as string) || null,
        contact_phone: (form.get("contact_phone") as string) || null,
        contact_email: (form.get("contact_email") as string) || null,
        access_instructions: (form.get("access_instructions") as string) || null,
        tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
        custom_fields: extractCustomFields(form, customFieldDefinitions),
      };

      if (isEdit) {
        await updateLocation(location!.id, values);
        router.push(`/locations/${location!.id}`);
      } else {
        await createLocation(values);
        router.push("/locations");
      }
      router.refresh();
    });
  }

  const hasAddress = preview.address || preview.city || preview.state || preview.zip_code;
  const hasContact = preview.contact_name || preview.contact_email || preview.contact_phone;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)] text-stone-900">
        {isEdit ? "Edit location" : "Create a new location"}
      </h1>
      <div className="flex items-center gap-1.5 mt-2 text-sm">
        <Link href="/" className="text-stone-600 hover:text-stone-900">Dashboard</Link>
        <span className="text-stone-300">&middot;</span>
        <Link href="/locations" className="text-stone-600 hover:text-stone-900">Locations</Link>
        <span className="text-stone-300">&middot;</span>
        <span className="text-stone-400">{isEdit ? "Edit" : "Create"}</span>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} onInput={updatePreview} className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left card - live preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-8 self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-stone-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-stone-900 font-[family-name:var(--font-heading)] truncate">
                  {preview.name || "Untitled location"}
                </h3>
                {preview.code && (
                  <p className="text-xs font-[family-name:var(--font-mono)] text-stone-400 mt-0.5">{preview.code}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {preview.client && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {preview.client}
                </span>
              )}
              {preview.location_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                  {preview.location_type.replace(/_/g, " ")}
                </span>
              )}
              {preview.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(preview.status)}`}>
                  {preview.status.replace(/_/g, " ")}
                </span>
              )}
              {preview.criticality && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${critColor(preview.criticality)}`}>
                  {preview.criticality}
                </span>
              )}
            </div>

            {hasAddress && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Address</p>
                {preview.address && <p className="text-sm text-stone-700">{preview.address}</p>}
                {(preview.city || preview.state || preview.zip_code) && (
                  <p className="text-sm text-stone-500">
                    {[preview.city, preview.state].filter(Boolean).join(", ")}
                    {preview.zip_code ? ` ${preview.zip_code}` : ""}
                  </p>
                )}
                {preview.country && preview.country !== "US" && (
                  <p className="text-sm text-stone-500">{preview.country}</p>
                )}
              </div>
            )}

            {hasContact && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Contact</p>
                {preview.contact_name && <p className="text-sm font-medium text-stone-700">{preview.contact_name}</p>}
                {preview.contact_email && <p className="text-sm text-stone-500">{preview.contact_email}</p>}
                {preview.contact_phone && <p className="text-sm text-stone-500">{preview.contact_phone}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right card - form */}
        <div className="lg:col-span-3 rounded-2xl border border-stone-200 bg-white p-8">
          <div className="grid grid-cols-2 gap-5">
            <Input className={fi} placeholder={`Location name${isRequired("name") ? " *" : ""}`} name="name" required={isRequired("name")} defaultValue={location?.name} />
            <Input className={fi} placeholder="Site code (e.g. TS-007)" name="code" defaultValue={location?.code ?? ""} />

            {clients.length > 0 ? (
              <Select name="client" defaultValue={location?.client ?? ""} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder={`Client${isRequired("client") ? " *" : ""}`} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <input type="hidden" name="client" value={location?.client ?? ""} />
            )}

            <Select name="location_type" defaultValue={location?.location_type ?? "other"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {locationTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="status" defaultValue={location?.status ?? "active"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {locationStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input className={`${fi} col-span-2`} placeholder={`Street address${isRequired("address") ? " *" : ""}`} name="address" required={isRequired("address")} defaultValue={location?.address} />

            <Input className={fi} placeholder={`City${isRequired("city") ? " *" : ""}`} name="city" required={isRequired("city")} defaultValue={location?.city} />
            <div className="grid grid-cols-2 gap-4">
              <Input className={fi} placeholder={`State${isRequired("state") ? " *" : ""}`} name="state" required={isRequired("state")} defaultValue={location?.state} />
              <Input className={fi} placeholder={`Zip code${isRequired("zip_code") ? " *" : ""}`} name="zip_code" required={isRequired("zip_code")} defaultValue={location?.zip_code} />
            </div>

            <Select name="country" defaultValue={location?.country ?? "US"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label} <span className="text-stone-400 font-[family-name:var(--font-mono)] text-xs ml-1">{c.value}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input className={fi} placeholder="Region / Territory" name="region" defaultValue={location?.region ?? ""} />
          </div>

          {/* Scheduling & Classification */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Classification</h3>
          <div className="grid grid-cols-2 gap-5">
            <Select name="timezone" defaultValue={location?.timezone ?? "America/New_York"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label} <span className="text-stone-400 font-[family-name:var(--font-mono)] text-xs ml-1">{tz.value}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="criticality" defaultValue={location?.criticality ?? "medium"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Criticality" />
              </SelectTrigger>
              <SelectContent>
                {criticalityOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input className={fi} placeholder="Latitude" name="latitude" type="number" step="any" defaultValue={location?.latitude ?? ""} />
            <Input className={fi} placeholder="Longitude" name="longitude" type="number" step="any" defaultValue={location?.longitude ?? ""} />

            <Input className={`${fi} col-span-2`} placeholder="Tags (comma-separated)" name="tags" defaultValue={location?.tags?.join(", ") ?? ""} />
          </div>

          {/* Contact */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Contact</h3>
          <div className="grid grid-cols-2 gap-5">
            <Input className={fi} placeholder="Contact name" name="contact_name" defaultValue={location?.contact_name ?? ""} />
            <Input className={fi} placeholder="Contact phone" name="contact_phone" defaultValue={location?.contact_phone ?? ""} />
            <Input className={`${fi} col-span-2`} placeholder="Contact email" name="contact_email" type="email" defaultValue={location?.contact_email ?? ""} />
          </div>

          <Textarea
            className={`${fa} mt-5 w-full`}
            placeholder="Access instructions (gate codes, escort requirements, etc.)"
            name="access_instructions"
            defaultValue={location?.access_instructions ?? ""}
          />

          <Textarea
            className={`${fa} mt-5 w-full`}
            placeholder="Notes (optional)"
            name="notes"
            defaultValue={location?.notes ?? ""}
          />

          {customFieldDefinitions.length > 0 && (
            <div className="mt-6 border-t border-stone-100 pt-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4">Custom Fields</h3>
              <CustomFieldsRenderer
                definitions={customFieldDefinitions}
                values={(location?.custom_fields as Record<string, unknown>) ?? {}}
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create location"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
