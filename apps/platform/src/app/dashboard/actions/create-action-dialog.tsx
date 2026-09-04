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
import { createAction, updateAction } from "@fox/supabase/actions/actions";
import type { ActionItem, Project } from "@fox/supabase";
import { ClipboardList, Loader2 } from "lucide-react";

const actionTypes = [
  { label: "Survey", value: "survey" },
  { label: "Installation", value: "installation" },
  { label: "Inspection", value: "inspection" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Repair", value: "repair" },
  { label: "Testing", value: "testing" },
  { label: "Documentation", value: "documentation" },
  { label: "Other", value: "other" },
];

const actionStatuses = [
  { label: "Pending", value: "pending" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Blocked", value: "blocked" },
  { label: "Cancelled", value: "cancelled" },
];

const priorities = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

export function CreateActionDialog({
  open,
  onOpenChange,
  projects,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  action?: ActionItem;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isEdit = !!action;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const values = {
        name: form.get("name") as string,
        description: (form.get("description") as string) || null,
        project_id: form.get("project_id") as string,
        action_type: form.get("action_type") as string,
        status: form.get("status") as string,
        priority: form.get("priority") as string,
        scheduled_start: (form.get("scheduled_start") as string) || null,
        scheduled_end: (form.get("scheduled_end") as string) || null,
        notes: (form.get("notes") as string) || null,
      };

      if (isEdit) {
        await updateAction(action!.id, values);
      } else {
        await createAction(values);
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
              <ClipboardList className="h-5 w-5 text-stone-600" />
            </div>
            <div>
              <DialogTitle className="font-[family-name:var(--font-heading)]">
                {isEdit ? "Edit Action" : "New Action"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "Update action details below."
                  : "Schedule a task or activity for a project."}
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
              <Label htmlFor="name">Action Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Site Survey — North Tower"
                defaultValue={action?.name}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="What needs to be done..."
                defaultValue={action?.description ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project_id">Project</Label>
              <Select name="project_id" defaultValue={action?.project_id} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
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
                <Label htmlFor="action_type">Type</Label>
                <Select name="action_type" defaultValue={action?.action_type ?? "survey"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={action?.status ?? "pending"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue={action?.priority ?? "medium"}>
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

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="scheduled_start">Scheduled Start</Label>
                <Input
                  id="scheduled_start"
                  name="scheduled_start"
                  type="datetime-local"
                  defaultValue={action?.scheduled_start?.slice(0, 16) ?? ""}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scheduled_end">Scheduled End</Label>
                <Input
                  id="scheduled_end"
                  name="scheduled_end"
                  type="datetime-local"
                  defaultValue={action?.scheduled_end?.slice(0, 16) ?? ""}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-stone-500">Additional Notes</h3>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Any additional context or instructions..."
                defaultValue={action?.notes ?? ""}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Action"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
