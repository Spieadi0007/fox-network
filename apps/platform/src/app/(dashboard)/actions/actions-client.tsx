"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ActionItem } from "@fox/supabase";
import { DataTable, type Column, type SavedView, type BulkAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { bulkUpdateActions, bulkDeleteActions } from "@fox/supabase/actions/actions";
import { Trash2 } from "lucide-react";

type ColumnConfig = { key: string; visible: boolean };

type ActionWithJoins = ActionItem & {
  projects?: { name: string } | null;
  locations?: { name: string } | null;
  assigned_profile?: { name: string | null; email: string } | null;
};

const columns: Column<ActionWithJoins>[] = [
  { key: "name", label: "Name" },
  {
    key: "code",
    label: "Code",
    render: (row) => row.code ? (
      <span className="font-[family-name:var(--font-mono)] text-xs text-stone-500">{row.code}</span>
    ) : "\u2014",
  },
  {
    key: "project_id",
    label: "Project",
    filterValue: (row) => row.projects?.name ?? "",
    render: (row) => row.projects?.name ?? "\u2014",
  },
  {
    key: "location_id",
    label: "Location",
    filterValue: (row) => row.locations?.name ?? "",
    render: (row) => row.locations?.name ?? "\u2014",
  },
  {
    key: "action_type",
    label: "Type",
    type: "enum",
    filterOptions: [
      { label: "Survey", value: "survey" },
      { label: "Installation", value: "installation" },
      { label: "Inspection", value: "inspection" },
      { label: "Maintenance", value: "maintenance" },
      { label: "Repair", value: "repair" },
      { label: "Testing", value: "testing" },
      { label: "Documentation", value: "documentation" },
      { label: "Other", value: "other" },
    ],
    render: (row) =>
      row.action_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
  },
  {
    key: "status",
    label: "Status",
    type: "enum",
    filterOptions: [
      { label: "Pending", value: "pending" },
      { label: "Scheduled", value: "scheduled" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
      { label: "Blocked", value: "blocked" },
      { label: "Cancelled", value: "cancelled" },
    ],
    render: (row) => <StatusBadge value={row.status} />,
  },
  {
    key: "priority",
    label: "Priority",
    type: "enum",
    filterOptions: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Critical", value: "critical" },
    ],
    render: (row) => <StatusBadge value={row.priority} />,
  },
  {
    key: "category",
    label: "Category",
    render: (row) => row.category ?? "\u2014",
  },
  {
    key: "assigned_to",
    label: "Assigned To",
    filterValue: (row) => row.assigned_profile?.name || row.assigned_profile?.email || "",
    render: (row) => row.assigned_profile?.name || row.assigned_profile?.email || "\u2014",
  },
  {
    key: "due_date",
    label: "Due Date",
    type: "date",
    render: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : "\u2014",
  },
  {
    key: "scheduled_start",
    label: "Sched. Start",
    type: "date",
    render: (row) => row.scheduled_start ? new Date(row.scheduled_start).toLocaleDateString() : "\u2014",
  },
  {
    key: "scheduled_end",
    label: "Sched. End",
    type: "date",
    render: (row) => row.scheduled_end ? new Date(row.scheduled_end).toLocaleDateString() : "\u2014",
  },
  {
    key: "actual_start",
    label: "Actual Start",
    type: "date",
    render: (row) => row.actual_start ? new Date(row.actual_start).toLocaleDateString() : "\u2014",
  },
  {
    key: "actual_end",
    label: "Actual End",
    type: "date",
    render: (row) => row.actual_end ? new Date(row.actual_end).toLocaleDateString() : "\u2014",
  },
  {
    key: "estimated_duration_min",
    label: "Est. Duration",
    type: "number",
    render: (row) => row.estimated_duration_min != null ? `${row.estimated_duration_min} min` : "\u2014",
  },
  {
    key: "actual_duration_min",
    label: "Actual Duration",
    type: "number",
    render: (row) => row.actual_duration_min != null ? `${row.actual_duration_min} min` : "\u2014",
  },
  {
    key: "estimated_cost",
    label: "Est. Cost",
    type: "number",
    render: (row) => row.estimated_cost != null ? `$${Number(row.estimated_cost).toLocaleString()}` : "\u2014",
  },
  {
    key: "actual_cost",
    label: "Actual Cost",
    type: "number",
    render: (row) => row.actual_cost != null ? `$${Number(row.actual_cost).toLocaleString()}` : "\u2014",
  },
  {
    key: "tags",
    label: "Tags",
    filterable: false,
    render: (row) => {
      const tags = row.tags as string[] | null;
      return tags && tags.length > 0 ? tags.join(", ") : "\u2014";
    },
  },
  {
    key: "created_at",
    label: "Created",
    type: "date",
    render: (row) => new Date(row.created_at).toLocaleDateString(),
  },
];

export function ActionsClient({
  actions,
  initialColumnConfig,
  savedViews,
  userId,
  userRole,
}: {
  actions: ActionWithJoins[];
  initialColumnConfig?: ColumnConfig[] | null;
  savedViews?: SavedView[];
  userId?: string;
  userRole?: string;
}) {
  const router = useRouter();
  const canEdit = userRole === "admin" || userRole === "manager";

  const bulkActions = useMemo<BulkAction[] | undefined>(() => {
    if (!canEdit) return undefined;
    return [
      {
        type: "select",
        label: "Change Status",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Scheduled", value: "scheduled" },
          { label: "In Progress", value: "in_progress" },
          { label: "Completed", value: "completed" },
          { label: "Blocked", value: "blocked" },
          { label: "Cancelled", value: "cancelled" },
        ],
        onAction: async (ids, value) => {
          await bulkUpdateActions(ids, { status: value });
          router.refresh();
        },
      },
      {
        type: "select",
        label: "Change Priority",
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
          { label: "Critical", value: "critical" },
        ],
        onAction: async (ids, value) => {
          await bulkUpdateActions(ids, { priority: value });
          router.refresh();
        },
      },
      {
        type: "action",
        label: "Delete",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "destructive",
        onAction: async (ids) => {
          await bulkDeleteActions(ids);
          router.refresh();
        },
      },
    ];
  }, [canEdit, router]);

  return (
    <DataTable
      data={actions as (ActionWithJoins & Record<string, unknown>)[]}
      columns={columns as Column<ActionWithJoins & Record<string, unknown>>[]}
      searchKey="name"
      searchPlaceholder="Search actions..."
      storageKey="actions"
      initialColumnConfig={initialColumnConfig}
      savedViews={savedViews}
      userId={userId}
      userRole={userRole}
      bulkActions={bulkActions}
      onRowClick={(row) => router.push(`/actions/${row.id}`)}
    />
  );
}
