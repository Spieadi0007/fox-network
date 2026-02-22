import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getLocation } from "@fox/supabase/actions/locations";
import { getProjectsByLocation } from "@fox/supabase/actions/projects";
import { getAssetsByLocation } from "@fox/supabase/actions/assets";
import { getFieldDefinitions } from "@fox/supabase/actions/custom-fields";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CustomFieldsDisplay } from "@/components/custom-fields-renderer";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { LocationDetailClient } from "./location-detail-client";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/dashboard");

  const { id } = await params;
  const [{ data: location }, { data: projects }, { data: assets }, { data: fieldDefs }] =
    await Promise.all([
      getLocation(id),
      getProjectsByLocation(id),
      getAssetsByLocation(id),
      getFieldDefinitions(user.organizationId, "locations"),
    ]);

  if (!location) notFound();

  const canEdit = user.role === "admin" || user.role === "manager";

  return (
    <div className="space-y-6 p-8">
      <PageHeader title={location.name} />

      <LocationDetailClient locationId={location.id} canEdit={canEdit} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Address</h3>
          <p className="mt-1 text-stone-900">
            {location.address}
            <br />
            {location.city}, {location.state} {location.zip_code}
            {location.country !== "US" && <>, {location.country}</>}
          </p>
          {location.region && (
            <p className="mt-2 text-xs text-stone-400">Region: {location.region}</p>
          )}
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            {location.code && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Code</h3>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-stone-900">{location.code}</p>
              </div>
            )}
            {location.client && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Client</h3>
                <p className="mt-1 text-stone-900">{location.client}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-stone-500">Type</h3>
              <p className="mt-1 capitalize text-stone-900">
                {location.location_type.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Status</h3>
              <div className="mt-1">
                <StatusBadge value={location.status} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Criticality</h3>
              <div className="mt-1">
                <StatusBadge value={location.criticality} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Timezone</h3>
              <p className="mt-1 text-stone-900 text-xs">{location.timezone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      {(location.contact_name || location.contact_phone || location.contact_email) && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-3">Contact</h3>
          <div className="grid grid-cols-3 gap-4">
            {location.contact_name && (
              <div>
                <h4 className="text-sm font-medium text-stone-500">Name</h4>
                <p className="mt-1 text-stone-900">{location.contact_name}</p>
              </div>
            )}
            {location.contact_phone && (
              <div>
                <h4 className="text-sm font-medium text-stone-500">Phone</h4>
                <p className="mt-1 text-stone-900">{location.contact_phone}</p>
              </div>
            )}
            {location.contact_email && (
              <div>
                <h4 className="text-sm font-medium text-stone-500">Email</h4>
                <p className="mt-1 text-stone-900">{location.contact_email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {location.access_instructions && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Access Instructions</h3>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">{location.access_instructions}</p>
        </div>
      )}

      {location.notes && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">{location.notes}</p>
        </div>
      )}

      {location.tags && location.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {location.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      <CustomFieldsDisplay
        definitions={fieldDefs ?? []}
        values={(location.custom_fields as Record<string, unknown>) ?? {}}
      />

      <Separator />

      {/* Related Projects */}
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-stone-900">
          Projects at this Location
        </h2>
        {projects && projects.length > 0 ? (
          <div className="mt-3 rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: Record<string, string>) => (
                  <tr key={p.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/projects/${p.id}`} className="text-fox-orange hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize">{p.project_type?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={p.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-500">No projects at this location yet.</p>
        )}
      </div>

      <Separator />

      {/* Related Assets */}
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-stone-900">
          Assets at this Location
        </h2>
        {assets && assets.length > 0 ? (
          <div className="mt-3 rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Serial</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a: Record<string, string>) => (
                  <tr key={a.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/assets/${a.id}`} className="text-fox-orange hover:underline">
                        {a.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize">{a.asset_type?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs">
                      {a.serial_number}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-500">No assets at this location yet.</p>
        )}
      </div>
    </div>
  );
}
