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
import { createProject, updateProject } from "@fox/supabase/actions/projects";
import type { Project, Location, CustomFieldDefinition, FieldRequirementOverride, ConfigurableFieldOption } from "@fox/supabase";
import { CustomFieldsRenderer, extractCustomFields } from "@/components/custom-fields-renderer";
import { FolderKanban, Loader2 } from "lucide-react";

const fi = "h-12 rounded-xl border-stone-200 px-4 text-sm placeholder:text-stone-400 shadow-none";
const ft = "data-[size=default]:h-12 rounded-xl border-stone-200 px-4 w-full text-sm shadow-none";
const fa = "rounded-xl border-stone-200 px-4 py-3 text-sm placeholder:text-stone-400 min-h-[100px] shadow-none";

const defaults: Record<string, { label: string; value: string }[]> = {
  project_type: [
    { label: "Deployment", value: "deployment" },
    { label: "Survey", value: "survey" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Inspection", value: "inspection" },
    { label: "Upgrade", value: "upgrade" },
    { label: "Remediation", value: "remediation" },
  ],
  project_status: [
    { label: "Draft", value: "draft" },
    { label: "Planned", value: "planned" },
    { label: "Active", value: "active" },
    { label: "On Hold", value: "on_hold" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ],
  priority: [
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

const SYSTEM_REQUIRED: Record<string, boolean> = { name: true, status: true, project_type: true, location_id: true };

const DEFAULT_REQUIRED: Record<string, boolean> = {
  name: true, location_id: true, project_type: true, status: true,
  priority: true, start_date: true,
};

function statusColor(s: string) {
  if (["active", "available", "completed"].includes(s)) return "bg-emerald-50 text-emerald-700";
  if (["draft", "planned", "pending"].includes(s)) return "bg-amber-50 text-amber-700";
  if (["in_progress", "scheduled"].includes(s)) return "bg-blue-50 text-blue-700";
  if (["on_hold", "blocked"].includes(s)) return "bg-orange-50 text-orange-700";
  if (["cancelled", "retired", "decommissioned"].includes(s)) return "bg-red-50 text-red-700";
  return "bg-stone-100 text-stone-600";
}

function priorityColor(p: string) {
  if (p === "low") return "bg-stone-100 text-stone-600";
  if (p === "medium") return "bg-blue-50 text-blue-700";
  if (p === "high") return "bg-amber-50 text-amber-700";
  if (p === "critical") return "bg-red-50 text-red-700";
  return "bg-stone-100 text-stone-600";
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProjectForm({
  project,
  locations,
  customFieldDefinitions = [],
  fieldOverrides = [],
  fieldOptions = [],
}: {
  project?: Project;
  locations: Location[];
  customFieldDefinitions?: CustomFieldDefinition[];
  fieldOverrides?: FieldRequirementOverride[];
  fieldOptions?: ConfigurableFieldOption[];
}) {
  const projectTypes = resolveOptions("project_type", fieldOptions);
  const projectStatuses = resolveOptions("project_status", fieldOptions);
  const priorities = resolveOptions("priority", fieldOptions);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!project;
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
        description: (form.get("description") as string) || null,
        location_id: form.get("location_id") as string,
        project_type: form.get("project_type") as string,
        status: form.get("status") as string,
        priority: form.get("priority") as string,
        start_date: form.get("start_date") as string,
        end_date: (form.get("end_date") as string) || null,
        actual_start_date: (form.get("actual_start_date") as string) || null,
        actual_end_date: (form.get("actual_end_date") as string) || null,
        completion_percentage: form.get("completion_percentage") ? Number(form.get("completion_percentage")) : 0,
        budget: form.get("budget") ? Number(form.get("budget")) : null,
        actual_cost: form.get("actual_cost") ? Number(form.get("actual_cost")) : null,
        tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
        custom_fields: extractCustomFields(form, customFieldDefinitions),
      };

      if (isEdit) {
        await updateProject(project!.id, values);
        router.push(`/projects/${project!.id}`);
      } else {
        await createProject(values);
        router.push("/projects");
      }
      router.refresh();
    });
  }

  const locationName = locations.find((l) => l.id === preview.location_id)?.name;
  const hasTimeline = preview.start_date || preview.end_date;
  const hasBudget = preview.budget || preview.actual_cost;
  const pct = Number(preview.completion_percentage) || 0;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)] text-stone-900">
        {isEdit ? "Edit project" : "Create a new project"}
      </h1>
      <div className="flex items-center gap-1.5 mt-2 text-sm">
        <Link href="/" className="text-stone-600 hover:text-stone-900">Dashboard</Link>
        <span className="text-stone-300">&middot;</span>
        <Link href="/projects" className="text-stone-600 hover:text-stone-900">Projects</Link>
        <span className="text-stone-300">&middot;</span>
        <span className="text-stone-400">{isEdit ? "Edit" : "Create"}</span>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} onInput={updatePreview} className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left card - live preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-8 self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                <FolderKanban className="h-5 w-5 text-stone-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-stone-900 font-[family-name:var(--font-heading)] truncate">
                  {preview.name || "Untitled project"}
                </h3>
                {preview.code && (
                  <p className="text-xs font-[family-name:var(--font-mono)] text-stone-400 mt-0.5">{preview.code}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {preview.project_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                  {preview.project_type.replace(/_/g, " ")}
                </span>
              )}
              {preview.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(preview.status)}`}>
                  {preview.status.replace(/_/g, " ")}
                </span>
              )}
              {preview.priority && (
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${priorityColor(preview.priority)}`}>
                  {preview.priority}
                </span>
              )}
            </div>

            {locationName && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-1">Location</p>
                <p className="text-sm text-stone-700">{locationName}</p>
              </div>
            )}

            {hasTimeline && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Timeline</p>
                <p className="text-sm text-stone-700">
                  {preview.start_date ? formatDate(preview.start_date) : "TBD"}
                  {" — "}
                  {preview.end_date ? formatDate(preview.end_date) : "TBD"}
                </p>
                {pct > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div className="h-full rounded-full bg-stone-900 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasBudget && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Budget</p>
                <div className="flex gap-4">
                  {preview.budget && (
                    <div>
                      <p className="text-xs text-stone-400">Planned</p>
                      <p className="text-sm font-medium text-stone-700">${Number(preview.budget).toLocaleString()}</p>
                    </div>
                  )}
                  {preview.actual_cost && (
                    <div>
                      <p className="text-xs text-stone-400">Actual</p>
                      <p className="text-sm font-medium text-stone-700">${Number(preview.actual_cost).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right card - form */}
        <div className="lg:col-span-3 rounded-2xl border border-stone-200 bg-white p-8">
          <div className="grid grid-cols-2 gap-5">
            <Input className={fi} placeholder={`Project name${isRequired("name") ? " *" : ""}`} name="name" required={isRequired("name")} defaultValue={project?.name} />
            <Input className={`${fi} bg-stone-50 text-stone-500`} placeholder="Auto-generated on save" name="code" value={project?.code ?? ""} readOnly tabIndex={-1} />

            <Select name="location_id" defaultValue={project?.location_id} required={isRequired("location_id")} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder={`Location${isRequired("location_id") ? " *" : ""}`} />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="project_type" defaultValue={project?.project_type ?? "deployment"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="status" defaultValue={project?.status ?? "draft"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {projectStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="priority" defaultValue={project?.priority ?? "medium"} onValueChange={() => setTimeout(updatePreview, 0)}>
              <SelectTrigger className={ft}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Timeline</h3>
          <div className="grid grid-cols-2 gap-5">
            <Input className={fi} placeholder={`Start date${isRequired("start_date") ? " *" : ""}`} name="start_date" type="date" required={isRequired("start_date")} defaultValue={project?.start_date} />
            <Input className={fi} placeholder="End date" name="end_date" type="date" defaultValue={project?.end_date ?? ""} />
            <Input className={fi} placeholder="Actual start" name="actual_start_date" type="date" defaultValue={project?.actual_start_date ?? ""} />
            <Input className={fi} placeholder="Actual end" name="actual_end_date" type="date" defaultValue={project?.actual_end_date ?? ""} />
            <Input className={fi} placeholder="Completion % (0-100)" name="completion_percentage" type="number" min="0" max="100" defaultValue={project?.completion_percentage ?? 0} />
            <div />
          </div>

          {/* Budget */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Budget</h3>
          <div className="grid grid-cols-2 gap-5">
            <Input className={fi} placeholder="Budget ($)" name="budget" type="number" step="0.01" defaultValue={project?.budget ?? ""} />
            <Input className={fi} placeholder="Actual cost ($)" name="actual_cost" type="number" step="0.01" defaultValue={project?.actual_cost ?? ""} />
          </div>

          <Input className={`${fi} mt-5 w-full`} placeholder="Tags (comma-separated)" name="tags" defaultValue={project?.tags?.join(", ") ?? ""} />

          <Textarea
            className={`${fa} mt-5 w-full`}
            placeholder="Description (optional)"
            name="description"
            defaultValue={project?.description ?? ""}
          />

          {customFieldDefinitions.length > 0 && (
            <div className="mt-6 border-t border-stone-100 pt-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4">Custom Fields</h3>
              <CustomFieldsRenderer
                definitions={customFieldDefinitions}
                values={(project?.custom_fields as Record<string, unknown>) ?? {}}
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create project"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
