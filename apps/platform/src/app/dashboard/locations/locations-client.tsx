"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Location } from "@fox/supabase";
import { DataTable, type Column, type SavedView, type BulkAction } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { bulkUpdateLocations, bulkDeleteLocations } from "@fox/supabase/actions/locations";
import { Trash2 } from "lucide-react";

type ColumnConfig = { key: string; visible: boolean };

const columns: Column<Location>[] = [
  { key: "name", label: "Name" },
  { key: "client", label: "Client", render: (row) => row.client || "\u2014" },
  { key: "code", label: "Code" },
  {
    key: "city",
    label: "City / State",
    filterValue: (row) => `${row.city}, ${row.state}`,
    render: (row) => `${row.city}, ${row.state}`,
  },
  { key: "zip_code", label: "Zip" },
  { key: "country", label: "Country" },
  { key: "region", label: "Region", render: (row) => row.region ?? "\u2014" },
  {
    key: "location_type",
    label: "Type",
    type: "enum",
    filterOptions: [
      { label: "Commercial", value: "commercial" },
      { label: "Industrial", value: "industrial" },
      { label: "Residential", value: "residential" },
      { label: "Government", value: "government" },
      { label: "Data Center", value: "data_center" },
      { label: "Tower Site", value: "tower_site" },
      { label: "Other", value: "other" },
    ],
    render: (row) =>
      row.location_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
  },
  {
    key: "status",
    label: "Status",
    type: "enum",
    filterOptions: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Planned", value: "planned" },
      { label: "Decommissioned", value: "decommissioned" },
    ],
    render: (row) => <StatusBadge value={row.status} />,
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
  { key: "timezone", label: "Timezone" },
  {
    key: "latitude",
    label: "Lat",
    type: "number",
    render: (row) => row.latitude != null ? Number(row.latitude).toFixed(4) : "\u2014",
  },
  {
    key: "longitude",
    label: "Lng",
    type: "number",
    render: (row) => row.longitude != null ? Number(row.longitude).toFixed(4) : "\u2014",
  },
  { key: "contact_name", label: "Contact", render: (row) => row.contact_name ?? "\u2014" },
  { key: "contact_phone", label: "Phone", render: (row) => row.contact_phone ?? "\u2014" },
  { key: "contact_email", label: "Email", render: (row) => row.contact_email ?? "\u2014" },
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

export function LocationsClient({
  locations,
  initialColumnConfig,
  savedViews,
  userId,
  userRole,
}: {
  locations: Location[];
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
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Planned", value: "planned" },
          { label: "Decommissioned", value: "decommissioned" },
        ],
        onAction: async (ids, value) => {
          await bulkUpdateLocations(ids, { status: value });
          router.refresh();
        },
      },
      {
        type: "action",
        label: "Delete",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        variant: "destructive",
        onAction: async (ids) => {
          await bulkDeleteLocations(ids);
          router.refresh();
        },
      },
    ];
  }, [canEdit, router]);

  return (
    <DataTable
      data={locations as (Location & Record<string, unknown>)[]}
      columns={columns as Column<Location & Record<string, unknown>>[]}
      searchKey="name"
      searchPlaceholder="Search locations..."
      storageKey="locations"
      initialColumnConfig={initialColumnConfig}
      savedViews={savedViews}
      userId={userId}
      userRole={userRole}
      bulkActions={bulkActions}
      onRowClick={(row) => router.push(`/dashboard/locations/${row.id}`)}
    />
  );
}
