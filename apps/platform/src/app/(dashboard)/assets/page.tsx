import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAssets } from "@fox/supabase/actions/assets";
import { getTablePreferences, getSavedViews } from "@fox/supabase/actions/preferences";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { AssetsClient } from "./assets-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FeatureTips } from "@/components/feature-tips";

export default async function AssetsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");

  const [{ data: assets }, { data: columnConfig }, { data: savedViews }] = await Promise.all([
    getAssets(user.organizationId),
    getTablePreferences("assets"),
    getSavedViews("assets"),
  ]);
  const canCreate = user.role === "admin" || user.role === "manager";

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Assets"
        description="Track equipment, tools, and infrastructure across locations."
        action={
          <div className="flex items-center gap-2">
            <FeatureTips userRole={user.role} />
            {canCreate ? (
              <Link href="/assets/new">
                <Button className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Asset
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />
      {assets && assets.length > 0 ? (
        <AssetsClient assets={assets} initialColumnConfig={columnConfig} savedViews={savedViews} userId={user.id} userRole={user.role} />
      ) : (
        <EmptyState
          title="No assets yet"
          description="Add your first asset to start tracking equipment."
          action={
            canCreate ? (
              <Link href="/assets/new">
                <Button className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Asset
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
