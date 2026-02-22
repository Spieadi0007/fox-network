import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@fox/supabase/actions/projects";
import { getTablePreferences, getSavedViews } from "@fox/supabase/actions/preferences";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ProjectsClient } from "./projects-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FeatureTips } from "@/components/feature-tips";

export default async function ProjectsPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/dashboard");

  const [{ data: projects }, { data: columnConfig }, { data: savedViews }] = await Promise.all([
    getProjects(user.organizationId),
    getTablePreferences("projects"),
    getSavedViews("projects"),
  ]);
  const canCreate = user.role === "admin" || user.role === "manager";

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        title="Projects"
        description="Track deployments, surveys, and maintenance campaigns."
        action={
          <div className="flex items-center gap-2">
            <FeatureTips userRole={user.role} />
            {canCreate ? (
              <Link href="/dashboard/projects/new">
                <Button className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Project
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />
      {projects && projects.length > 0 ? (
        <ProjectsClient projects={projects} initialColumnConfig={columnConfig} savedViews={savedViews} userId={user.id} userRole={user.role} />
      ) : (
        <EmptyState
          title="No projects yet"
          description="Create your first project to begin tracking work."
          action={
            canCreate ? (
              <Link href="/dashboard/projects/new">
                <Button className="h-10 rounded-xl bg-stone-900 px-5 text-sm text-white hover:bg-stone-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Project
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
