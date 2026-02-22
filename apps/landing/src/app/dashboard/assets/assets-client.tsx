"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Asset } from "@fox/supabase";
import { DataTable, type Column, type SavedView, type BulkAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { bulkUpdateAssets, bulkDeleteAssets } from "@fox/supabase/actions/assets";
import { Trash2 } from "lucide-react";

type ColumnConfig = { key: string; visible: boolean };

type AssetWithJoins = Asset & {
  locations?: { name: string } | null;
  assigned_profile?: { name: string | null; email: string } | null;
};

const columns: Column<AssetWithJoins>[] = [
  { key: "name", label: "Name" },
  { key: "asset_tag", label: "Asset Tag", render: (row) => row.asset_tag ?? "\u2014" },
  {
    key: "asset_type",
    label: "Type",
    type: "enum",
    filterOptions: [
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
    render: (row) =>
      row.asset_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
  },
  {
    key: "serial_number",
    label: "Serial Number",
    render: (row) => (
      <span className="font-[family-name:var(--font-mono)] text-xs text-stone-500">
        {row.serial_number}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    type: "enum",
    filterOptions: [
      { label: "Available", value: "available" },
      { label: "Deployed", value: "deployed" },
      { label: "In Maintenance", value: "in_maintenance" },
      { label: "Retired", value: "retired" },
    ],
    render: (row) => <StatusBadge value={row.status} />,
  },
  {
    key: "condition",
    label: "Condition",
    type: "enum",
    filterOptions: [
      { label: "Excellent", value: "excellent" },
      { label: "Good", value: "good" },
      { label: "Fair", value: "fair" },
      { label: "Poor", value: "poor" },
    ],
    render: (row) => row.condition ? <StatusBadge value={row.condition} /> : "\u2014",
  },
  {
    key: "criticality",
    label: "Criticality",
    type: "enum",
    filterOptions: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Critical", value: "critical" },
    ],
    render: (row) => row.criticality ? <StatusBadge value={row.criticality} /> : "\u2014",
  },
  {
    key: "location_id",
    label: "Location",
    filterValue: (row) => row.locations?.name ?? "",
    render: (row) => row.locations?.name ?? "\u2014",
  },
  { key: "manufacturer", label: "Manufacturer", render: (row) => row.manufacturer ?? "\u2014" },
  { key: "model", label: "Model", render: (row) => row.model ?? "\u2014" },
  {
    key: "barcode",
    label: "Barcode",
    render: (row) => row.barcode ? (
      <span className="font-[family-name:var(--font-mono)] text-xs text-stone-500">{row.barcode}</span>
    ) : "\u2014",
  },
  {
    key: "purchase_date",
    label: "Purchase Date",
    type: "date",
    render: (row) => row.purchase_date ? new Date(row.purchase_date).toLocaleDateString() : "\u2014",
  },
  {
    key: "purchase_cost",
    label: "Purchase Cost",
    type: "number",
    render: (row) => row.purchase_cost != null ? `$${Number(row.purchase_cost).toLocaleString()}` : "\u2014",
  },
  {
    key: "install_date",
    label: "Install Date",
    type: "date",
    render: (row) => row.install_date ? new Date(row.install_date).toLocaleDateString() : "\u2014",
  },
  {
    key: "warranty_end",
    label: "Warranty End",
    type: "date",
    render: (row) => row.warranty_end ? new Date(row.warranty_end).toLocaleDateString() : "\u2014",
  },
  {
    key: "assigned_to",
    label: "Assigned To",
    filterValue: (row) => row.assigned_profile?.name || row.assigned_profile?.email || "",
    render: (row) => row.assigned_profile?.name || row.assigned_profile?.email || "\u2014",
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

export function AssetsClient({
  assets,
  initialColumnConfig,
  savedViews,
  userId,
  userRole,
}: {
  assets: AssetWithJoins[];
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
          { label: "Available", value: "available" },
          { label: "Deployed", value: "deployed" },
          { label: "In Maintenance", value: "in_maintenance" },
          { label: "Retired", value: "retired" },
        ],
        onAction: async (ids, value) => {
          await bulkUpdateAssets(ids, { status: value });
          router.refresh();
        },
      },
      {
        type: "select",
        label: "Change Condition",
        options: [
          { label: "Excellent", value: "excellent" },
          { label: "Good", value: "good" },
          { label: "Fair", value: "fair" },
          { label: "Poor", value: "poor" },
        ],
        onAction: async (ids, value) => {
          await bulkUpdateAssets(ids, { condition: value });
          router.refresh();
        },
      },
      {
        type: "action",
        label: "Delete",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "destructive",
        onAction: async (ids) => {
          await bulkDeleteAssets(ids);
          router.refresh();
        },
      },
    ];
  }, [canEdit, router]);

  return (
    <DataTable
      data={assets as (AssetWithJoins & Record<string, unknown>)[]}
      columns={columns as Column<AssetWithJoins & Record<string, unknown>>[]}
      searchKey="name"
      searchPlaceholder="Search assets..."
      storageKey="assets"
      initialColumnConfig={initialColumnConfig}
      savedViews={savedViews}
      userId={userId}
      userRole={userRole}
      bulkActions={bulkActions}
      onRowClick={(row) => router.push(`/dashboard/assets/${row.id}`)}
    />
  );
}
