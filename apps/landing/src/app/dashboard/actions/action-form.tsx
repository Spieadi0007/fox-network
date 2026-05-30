"use client";

import { useTransition, useRef, useState, useEffect, useCallback, useMemo } from "react";
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
import { createAction, updateAction } from "@fox/supabase/actions/actions";
import type { ActionItem, Project, Location, CustomFieldDefinition, FieldRequirementOverride, ConfigurableFieldOption, WorkflowStep } from "@fox/supabase";
import { CustomFieldsRenderer, extractCustomFields } from "@/components/custom-fields-renderer";
import { Field } from "@/components/ui/field";
import { ClipboardList, Loader2 } from "lucide-react";

const fi = "h-12 rounded-xl border-stone-200 px-4 text-sm placeholder:text-stone-400 shadow-none";
const ft = "data-[size=default]:h-12 rounded-xl border-stone-200 px-4 w-full text-sm shadow-none";
const fa = "rounded-xl border-stone-200 px-4 py-3 text-sm placeholder:text-stone-400 min-h-[100px] shadow-none";

const defaults: Record<string, { label: string; value: string }[]> = {
  action_type: [
    { label: "Survey", value: "survey" },
    { label: "Installation", value: "installation" },
    { label: "Inspection", value: "inspection" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Repair", value: "repair" },
    { label: "Testing", value: "testing" },
    { label: "Documentation", value: "documentation" },
    { label: "Other", value: "other" },
  ],
  action_status: [
    { label: "Pending", value: "pending" },
    { label: "Scheduled", value: "scheduled" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Blocked", value: "blocked" },
    { label: "Cancelled", value: "cancelled" },
  ],
  priority: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Critical", value: "critical" },
  ],
  category: [
    { label: "Electrical", value: "electrical" },
    { label: "Mechanical", value: "mechanical" },
    { label: "Civil", value: "civil" },
    { label: "Network", value: "network" },
    { label: "Safety", value: "safety" },
    { label: "General", value: "general" },
  ],
};

function resolveOptions(fieldKey: string, allOptions: ConfigurableFieldOption[]) {
  const configured = allOptions.filter((o) => o.field_key === fieldKey);
  if (configured.length > 0) return configured.map((o) => ({ label: o.label, value: o.code }));
  return defaults[fieldKey] ?? [];
}

type OrgMember = { id: string; name: string | null; email: string; role: string };

const SYSTEM_REQUIRED: Record<string, boolean> = { name: true, status: true, action_type: true, project_id: true };

const DEFAULT_REQUIRED: Record<string, boolean> = {
  name: true, project_id: true, action_type: true, status: true, priority: true,
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

function formatDateTime(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActionForm({
  action,
  projects,
  locations,
  assets = [],
  members = [],
  customFieldDefinitions = [],
  fieldOverrides = [],
  fieldOptions = [],
  workflowSteps = [],
}: {
  action?: ActionItem;
  projects: Project[];
  locations: Location[];
  assets?: { id: string; name: string; asset_tag: string | null; location_id: string | null }[];
  members?: OrgMember[];
  customFieldDefinitions?: CustomFieldDefinition[];
  fieldOverrides?: FieldRequirementOverride[];
  fieldOptions?: ConfigurableFieldOption[];
  workflowSteps?: WorkflowStep[];
}) {
  const allActionTypes = resolveOptions("action_type", fieldOptions);
  const actionStatuses = resolveOptions("action_status", fieldOptions);
  const priorities = resolveOptions("priority", fieldOptions);
  const categories = resolveOptions("category", fieldOptions);

  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!action;
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

  // Filter action types by workflow when a project is selected
  const actionTypes = useMemo(() => {
    const selectedProject = projects.find((p) => p.id === preview.project_id);
    if (!selectedProject || workflowSteps.length === 0) return allActionTypes;
    const stepsForType = workflowSteps.filter((s) => s.project_type_code === selectedProject.project_type);
    if (stepsForType.length === 0) return allActionTypes;
    const allowedCodes = new Set(stepsForType.map((s) => s.action_type_code));
    return allActionTypes.filter((t) => allowedCodes.has(t.value));
  }, [allActionTypes, workflowSteps, projects, preview.project_id]);

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
        project_id: form.get("project_id") as string,
        location_id: (form.get("location_id") as string) || null,
        asset_id: (form.get("asset_id") as string) || null,
        action_type: form.get("action_type") as string,
        status: form.get("status") as string,
        priority: form.get("priority") as string,
        category: (form.get("category") as string) || null,
        assigned_to: (form.get("assigned_to") as string) || null,
        due_date: (form.get("due_date") as string) || null,
        scheduled_start: (form.get("scheduled_start") as string) || null,
        scheduled_end: (form.get("scheduled_end") as string) || null,
        actual_start: (form.get("actual_start") as string) || null,
        actual_end: (form.get("actual_end") as string) || null,
        estimated_duration_min: form.get("estimated_duration_min") ? Number(form.get("estimated_duration_min")) : null,
        actual_duration_min: form.get("actual_duration_min") ? Number(form.get("actual_duration_min")) : null,
        estimated_cost: form.get("estimated_cost") ? Number(form.get("estimated_cost")) : null,
        actual_cost: form.get("actual_cost") ? Number(form.get("actual_cost")) : null,
        notes: (form.get("notes") as string) || null,
        completion_notes: (form.get("completion_notes") as string) || null,
        tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
        custom_fields: extractCustomFields(form, customFieldDefinitions),
      };

      if (isEdit) {
        await updateAction(action!.id, values);
        router.push(`/dashboard/actions/${action!.id}`);
      } else {
        await createAction(values);
        router.push("/dashboard/actions");
      }
      router.refresh();
    });
  }

  const projectName = projects.find((p) => p.id === preview.project_id)?.name;
  const locationName = locations.find((l) => l.id === preview.location_id)?.name;
  const assignedMember = members.find((m) => m.id === preview.assigned_to);
  const hasScheduling = preview.due_date || preview.scheduled_start;
  // Offer assets at the selected location; fall back to all when none chosen.
  const availableAssets = preview.location_id
    ? assets.filter((a) => a.location_id === preview.location_id)
    : assets;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)] text-stone-900">
        {isEdit ? "Edit action" : "Create a new action"}
      </h1>
      <div className="flex items-center gap-1.5 mt-2 text-sm">
        <Link href="/dashboard" className="text-stone-600 hover:text-stone-900">Dashboard</Link>
        <span className="text-stone-300">&middot;</span>
        <Link href="/dashboard/actions" className="text-stone-600 hover:text-stone-900">Actions</Link>
        <span className="text-stone-300">&middot;</span>
        <span className="text-stone-400">{isEdit ? "Edit" : "Create"}</span>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} onInput={updatePreview} className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left card - live preview */}
        <div className="lg:col-span-2 lg:sticky lg:top-8 self-start">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5 text-stone-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-stone-900 font-[family-name:var(--font-heading)] truncate">
                  {preview.name || "Untitled action"}
                </h3>
                {action?.code && (
                  <p className="text-xs font-[family-name:var(--font-mono)] text-stone-400 mt-0.5">{action.code}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {preview.action_type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                  {preview.action_type.replace(/_/g, " ")}
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
              {preview.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                  {preview.category}
                </span>
              )}
            </div>

            {(projectName || locationName) && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Details</p>
                {projectName && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-stone-400">Project</span>
                    <span className="text-sm text-stone-700">{projectName}</span>
                  </div>
                )}
                {locationName && (
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs text-stone-400">Location</span>
                    <span className="text-sm text-stone-700">{locationName}</span>
                  </div>
                )}
              </div>
            )}

            {hasScheduling && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Schedule</p>
                {preview.due_date && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-stone-400">Due</span>
                    <span className="text-sm text-stone-700">{formatDateTime(preview.due_date)}</span>
                  </div>
                )}
                {preview.scheduled_start && (
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs text-stone-400">Start</span>
                    <span className="text-sm text-stone-700">{formatDateTime(preview.scheduled_start)}</span>
                  </div>
                )}
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
            <Field label="Action name" required={isRequired("name")} htmlFor="name">
              <Input id="name" className={fi} placeholder="e.g. Replace payment terminal" name="name" required={isRequired("name")} defaultValue={action?.name} />
            </Field>
            <Field label="Code" hint="auto-generated">
              <Input className={`${fi} bg-stone-50 text-stone-500`} placeholder="Auto-generated on save" value={action?.code ?? ""} readOnly tabIndex={-1} />
            </Field>
            <Field label="Project" required={isRequired("project_id")}>
              <Select name="project_id" defaultValue={action?.project_id} required={isRequired("project_id")} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Location">
              <Select name="location_id" defaultValue={action?.location_id ?? ""} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Asset" hint="the machine being serviced">
              <Select name="asset_id" defaultValue={action?.asset_id ?? ""} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                      {a.asset_tag ? (
                        <span className="text-stone-400 font-[family-name:var(--font-mono)] text-xs ml-1">{a.asset_tag}</span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Action type">
              <Select name="action_type" defaultValue={action?.action_type ?? "survey"} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Status">
              <Select name="status" defaultValue={action?.status ?? "pending"} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {actionStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Priority">
              <Select name="priority" defaultValue={action?.priority ?? "medium"} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Category">
              <Select name="category" defaultValue={action?.category ?? ""} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label} <span className="text-stone-400 font-[family-name:var(--font-mono)] text-xs ml-1">{c.value}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Assigned to">
              <Select name="assigned_to" defaultValue={action?.assigned_to ?? ""} onValueChange={() => setTimeout(updatePreview, 0)}>
                <SelectTrigger className={ft}>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Scheduling */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Scheduling</h3>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Due date" htmlFor="due_date">
              <Input id="due_date" className={fi} name="due_date" type="datetime-local" defaultValue={action?.due_date?.slice(0, 16) ?? ""} />
            </Field>
            <Field label="Est. duration" hint="minutes" htmlFor="estimated_duration_min">
              <Input id="estimated_duration_min" className={fi} placeholder="0" name="estimated_duration_min" type="number" min="0" defaultValue={action?.estimated_duration_min ?? ""} />
            </Field>
            <Field label="Scheduled start" htmlFor="scheduled_start">
              <Input id="scheduled_start" className={fi} name="scheduled_start" type="datetime-local" defaultValue={action?.scheduled_start?.slice(0, 16) ?? ""} />
            </Field>
            <Field label="Scheduled end" htmlFor="scheduled_end">
              <Input id="scheduled_end" className={fi} name="scheduled_end" type="datetime-local" defaultValue={action?.scheduled_end?.slice(0, 16) ?? ""} />
            </Field>
            <Field label="Actual start" htmlFor="actual_start">
              <Input id="actual_start" className={fi} name="actual_start" type="datetime-local" defaultValue={action?.actual_start?.slice(0, 16) ?? ""} />
            </Field>
            <Field label="Actual end" htmlFor="actual_end">
              <Input id="actual_end" className={fi} name="actual_end" type="datetime-local" defaultValue={action?.actual_end?.slice(0, 16) ?? ""} />
            </Field>
            <Field label="Actual duration" hint="minutes" htmlFor="actual_duration_min">
              <Input id="actual_duration_min" className={fi} placeholder="0" name="actual_duration_min" type="number" min="0" defaultValue={action?.actual_duration_min ?? ""} />
            </Field>
          </div>

          {/* Cost */}
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mt-6 mb-4">Cost</h3>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Estimated cost ($)" htmlFor="estimated_cost">
              <Input id="estimated_cost" className={fi} placeholder="0.00" name="estimated_cost" type="number" step="0.01" defaultValue={action?.estimated_cost ?? ""} />
            </Field>
            <Field label="Actual cost ($)" htmlFor="actual_cost">
              <Input id="actual_cost" className={fi} placeholder="0.00" name="actual_cost" type="number" step="0.01" defaultValue={action?.actual_cost ?? ""} />
            </Field>
          </div>

          <Field label="Tags" hint="comma-separated" className="mt-5" htmlFor="tags">
            <Input id="tags" className={`${fi} w-full`} placeholder="e.g. urgent, locker, paris" name="tags" defaultValue={action?.tags?.join(", ") ?? ""} />
          </Field>

          <Field label="Description" hint="optional" className="mt-5" htmlFor="description">
            <Textarea
              id="description"
              className={`${fa} w-full`}
              placeholder="What needs to be done"
              name="description"
              defaultValue={action?.description ?? ""}
            />
          </Field>

          <Field label="Notes" hint="optional" className="mt-5" htmlFor="notes">
            <Textarea
              id="notes"
              className={`${fa} w-full`}
              placeholder="Anything else worth recording"
              name="notes"
              defaultValue={action?.notes ?? ""}
            />
          </Field>

          <Field label="Completion notes" hint="optional" className="mt-5" htmlFor="completion_notes">
            <Textarea
              id="completion_notes"
              className={`${fa} w-full`}
              placeholder="Filled in when the work is done"
              name="completion_notes"
              defaultValue={action?.completion_notes ?? ""}
            />
          </Field>

          {customFieldDefinitions.length > 0 && (
            <div className="mt-6 border-t border-stone-100 pt-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-4">Custom Fields</h3>
              <CustomFieldsRenderer
                definitions={customFieldDefinitions}
                values={(action?.custom_fields as Record<string, unknown>) ?? {}}
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Create action"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
