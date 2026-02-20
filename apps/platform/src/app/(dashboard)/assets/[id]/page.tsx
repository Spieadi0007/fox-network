import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAsset } from "@fox/supabase/actions/assets";
import { getFieldDefinitions } from "@fox/supabase/actions/custom-fields";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CustomFieldsDisplay } from "@/components/custom-fields-renderer";
import Link from "next/link";
import { AssetDetailClient } from "./asset-detail-client";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");

  const { id } = await params;
  const [{ data: asset }, { data: fieldDefs }] = await Promise.all([
    getAsset(id),
    getFieldDefinitions(user.organizationId, "assets"),
  ]);

  if (!asset) notFound();

  const canEdit = user.role === "admin" || user.role === "manager";

  return (
    <div className="space-y-6 p-8">
      <PageHeader title={asset.name} />

      <AssetDetailClient assetId={asset.id} canEdit={canEdit} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            {asset.asset_tag && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Asset Tag</h3>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-stone-900">{asset.asset_tag}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-stone-500">Type</h3>
              <p className="mt-1 capitalize text-stone-900">
                {asset.asset_type.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Serial Number</h3>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-stone-900">
                {asset.serial_number}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Status</h3>
              <div className="mt-1">
                <StatusBadge value={asset.status} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Condition</h3>
              <div className="mt-1">
                {asset.condition ? <StatusBadge value={asset.condition} /> : "—"}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Criticality</h3>
              <div className="mt-1">
                <StatusBadge value={asset.criticality} />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-stone-500">Location</h3>
              <p className="mt-1">
                {asset.location_id ? (
                  <Link
                    href={`/locations/${asset.location_id}`}
                    className="text-fox-orange hover:underline"
                  >
                    {asset.locations?.name ?? "—"}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
            </div>
            {asset.manufacturer && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Manufacturer</h3>
                <p className="mt-1 text-stone-900">{asset.manufacturer}</p>
              </div>
            )}
            {asset.model && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Model</h3>
                <p className="mt-1 text-stone-900">{asset.model}</p>
              </div>
            )}
            {asset.barcode && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Barcode</h3>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-stone-900">{asset.barcode}</p>
              </div>
            )}
            {asset.purchase_date && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Purchase Date</h3>
                <p className="mt-1 text-stone-900">{new Date(asset.purchase_date).toLocaleDateString()}</p>
              </div>
            )}
            {asset.purchase_cost != null && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Purchase Cost</h3>
                <p className="mt-1 text-stone-900">${Number(asset.purchase_cost).toLocaleString()}</p>
              </div>
            )}
            {asset.install_date && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Install Date</h3>
                <p className="mt-1 text-stone-900">
                  {new Date(asset.install_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {asset.warranty_end && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Warranty End</h3>
                <p className="mt-1 text-stone-900">
                  {new Date(asset.warranty_end).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {asset.tags && asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {asset.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {asset.description && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Description</h3>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">
            {asset.description}
          </p>
        </div>
      )}

      {asset.notes && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">{asset.notes}</p>
        </div>
      )}

      <CustomFieldsDisplay
        definitions={fieldDefs ?? []}
        values={(asset.custom_fields as Record<string, unknown>) ?? {}}
      />
    </div>
  );
}
