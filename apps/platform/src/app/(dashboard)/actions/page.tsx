import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActions } from "@fox/supabase/actions/actions";
import { getTablePreferences, getSavedViews } from "@fox/supabase/actions/preferences";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ActionsClient } from "./actions-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FeatureTips } from "@/components/feature-tips";

export default async function ActionsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");

  const [{ data: actions }, { data: columnConfig }, { data: savedViews }] = await Promise.all([
    getActions(user.organizationId),
    getTablePreferences("actions"),
    getSavedViews("actions"),
  ]);
  const canCreate = user.role === "admin" || user.role === "manager";

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Actions"
        description="Individual tasks and field visits across your projects."
        action={
          <div className="flex items-center gap-2">
            <FeatureTips userRole={user.role} />
            {canCreate ? (
              <Link href="/actions/new">
                <Button className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Action
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />
      {actions && actions.length > 0 ? (
        <ActionsClient actions={actions} initialColumnConfig={columnConfig} savedViews={savedViews} userId={user.id} userRole={user.role} />
      ) : (
        <EmptyState
          title="No actions yet"
          description="Create your first action to start tracking tasks."
          action={
            canCreate ? (
              <Link href="/actions/new">
                <Button className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Action
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
