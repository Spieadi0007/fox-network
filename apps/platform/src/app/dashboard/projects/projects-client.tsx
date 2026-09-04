"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@fox/supabase";
import { DataTable, type Column, type SavedView, type BulkAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { bulkUpdateProjects, bulkDeleteProjects } from "@fox/supabase/actions/projects";
import { Trash2 } from "lucide-react";

type ColumnConfig = { key: string; visible: boolean };

type ProjectWithLocation = Project & { locations?: { name: string } | null };

const columns: Column<ProjectWithLocation>[] = [
  { key: "name", label: "Name" },
  { key: "code", label: "Code", render: (row) => row.code ?? "\u2014" },
  {
    key: "location_id",
    label: "Location",
    filterValue: (row) => row.locations?.name ?? "",
    render: (row) => row.locations?.name ?? "\u2014",
  },
  {
    key: "project_type",
    label: "Type",
    type: "enum",
    filterOptions: [
      { label: "Deployment", value: "deployment" },
      { label: "Survey", value: "survey" },
      { label: "Maintenance", value: "maintenance" },
      { label: "Inspection", value: "inspection" },
      { label: "Upgrade", value: "upgrade" },
      { label: "Remediation", value: "remediation" },
    ],
    render: (row) =>
      row.project_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
  },
  {
    key: "status",
    label: "Status",
    type: "enum",
    filterOptions: [
      { label: "Draft", value: "draft" },
      { label: "Planned", value: "planned" },
      { label: "Active", value: "active" },
      { label: "On Hold", value: "on_hold" },
      { label: "Completed", value: "completed" },
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
    key: "start_date",
    label: "Start Date",
    type: "date",
    render: (row) => row.start_date ? new Date(row.start_date).toLocaleDateString() : "\u2014",
  },
  {
    key: "end_date",
    label: "End Date",
    type: "date",
    render: (row) => row.end_date ? new Date(row.end_date).toLocaleDateString() : "\u2014",
  },
  {
    key: "actual_start_date",
    label: "Actual Start",
    type: "date",
    render: (row) => row.actual_start_date ? new Date(row.actual_start_date).toLocaleDateString() : "\u2014",
  },
  {
    key: "actual_end_date",
    label: "Actual End",
    type: "date",
    render: (row) => row.actual_end_date ? new Date(row.actual_end_date).toLocaleDateString() : "\u2014",
  },
  {
    key: "completion_percentage",
    label: "Progress",
    type: "number",
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 rounded-full bg-stone-100">
          <div
            className="h-1.5 rounded-full bg-stone-900"
            style={{ width: `${row.completion_percentage ?? 0}%` }}
          />
        </div>
        <span className="text-xs text-stone-500">{row.completion_percentage ?? 0}%</span>
      </div>
    ),
  },
  {
    key: "budget",
    label: "Budget",
    type: "number",
    render: (row) => row.budget != null ? `$${Number(row.budget).toLocaleString()}` : "\u2014",
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

export function ProjectsClient({
  projects,
  initialColumnConfig,
  savedViews,
  userId,
  userRole,
}: {
  projects: ProjectWithLocation[];
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
          { label: "Draft", value: "draft" },
          { label: "Planned", value: "planned" },
          { label: "Active", value: "active" },
          { label: "On Hold", value: "on_hold" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ],
        onAction: async (ids, value) => {
          await bulkUpdateProjects(ids, { status: value });
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
          await bulkUpdateProjects(ids, { priority: value });
          router.refresh();
        },
      },
      {
        type: "action",
        label: "Delete",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "destructive",
        onAction: async (ids) => {
          await bulkDeleteProjects(ids);
          router.refresh();
        },
      },
    ];
  }, [canEdit, router]);

  return (
    <DataTable
      data={projects as (ProjectWithLocation & Record<string, unknown>)[]}
      columns={columns as Column<ProjectWithLocation & Record<string, unknown>>[]}
      searchKey="name"
      searchPlaceholder="Search projects..."
      storageKey="projects"
      initialColumnConfig={initialColumnConfig}
      savedViews={savedViews}
      userId={userId}
      userRole={userRole}
      bulkActions={bulkActions}
      onRowClick={(row) => router.push(`/dashboard/projects/${row.id}`)}
    />
  );
}
