"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createProject, updateProject } from "@fox/supabase/actions/projects";
import type { Project, Location } from "@fox/supabase";
import { FolderKanban, Loader2 } from "lucide-react";

const projectTypes = [
  { label: "Deployment", value: "deployment" },
  { label: "Survey", value: "survey" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inspection", value: "inspection" },
  { label: "Upgrade", value: "upgrade" },
  { label: "Remediation", value: "remediation" },
];

const projectStatuses = [
  { label: "Draft", value: "draft" },
  { label: "Planned", value: "planned" },
  { label: "Active", value: "active" },
  { label: "On Hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const priorities = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

export function CreateProjectDialog({
  open,
  onOpenChange,
  locations,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  project?: Project;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!project;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

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
        budget: form.get("budget") ? Number(form.get("budget")) : null,
      };

      if (isEdit) {
        await updateProject(project!.id, values);
      } else {
        await createProject(values);
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100">
              <FolderKanban className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <DialogTitle className="font-[family-name:var(--font-heading)]">
                {isEdit ? "Edit Project" : "New Project"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update project details below."
                  : "Create a new project for your organization."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Basic Information</h3>
            <div className="space-y-1.5">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Q1 Tower Deployment"
                defaultValue={project?.name}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Brief overview of the project scope..."
                defaultValue={project?.description ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location_id">Location</Label>
              <Select name="location_id" defaultValue={project?.location_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Classification</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="project_type">Type</Label>
                <Select name="project_type" defaultValue={project?.project_type ?? "deployment"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={project?.status ?? "draft"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue={project?.priority ?? "medium"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule & Budget */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Schedule & Budget</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
                  defaultValue={project?.start_date}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={project?.end_date ?? ""}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={project?.budget ?? ""}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
