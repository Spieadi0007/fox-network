import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocations } from "@fox/supabase/actions/locations";
import { getTablePreferences, getSavedViews } from "@fox/supabase/actions/preferences";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { LocationsClient } from "./locations-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FeatureTips } from "@/components/feature-tips";

export default async function LocationsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");

  const [{ data: locations }, { data: columnConfig }, { data: savedViews }] = await Promise.all([
    getLocations(user.organizationId),
    getTablePreferences("locations"),
    getSavedViews("locations"),
  ]);
  const canCreate = user.role === "admin" || user.role === "manager";

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Locations"
        description="Manage your organization's physical locations."
        action={
          <div className="flex items-center gap-2">
            <FeatureTips userRole={user.role} />
            {canCreate ? (
              <Link href="/dashboard/locations/new">
                <Button className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Location
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />
      {locations && locations.length > 0 ? (
        <LocationsClient locations={locations} initialColumnConfig={columnConfig} savedViews={savedViews} userId={user.id} userRole={user.role} />
      ) : (
        <EmptyState
          title="No locations yet"
          description="Add your first location to get started."
          action={
            canCreate ? (
              <Link href="/dashboard/locations/new">
                <Button className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Location
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
