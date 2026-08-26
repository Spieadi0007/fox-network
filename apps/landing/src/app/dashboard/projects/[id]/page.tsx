import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getProject } from "@fox/supabase/actions/projects";
import { getActionsByProject } from "@fox/supabase/actions/actions";
import { getFieldDefinitions } from "@fox/supabase/actions/custom-fields";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CustomFieldsDisplay } from "@/components/custom-fields-renderer";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ProjectDetailClient } from "./project-detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");

  const { id } = await params;
  const [{ data: project }, { data: actions }, { data: fieldDefs }] =
    await Promise.all([
      getProject(id),
      getActionsByProject(id),
      getFieldDefinitions(user.organizationId, "projects"),
    ]);

  if (!project) notFound();

  const canEdit = user.role === "admin" || user.role === "manager";

  return (
    <div className="space-y-6 p-8">
      <PageHeader title={project.name} />

      <ProjectDetailClient projectId={project.id} canEdit={canEdit} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            {project.code && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Code</h3>
                <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-stone-900">{project.code}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-stone-500">Location</h3>
              <p className="mt-1">
                <Link
                  href={`/dashboard/locations/${project.location_id}`}
                  className="text-fox-orange hover:underline"
                >
                  {project.locations?.name ?? "—"}
                </Link>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Type</h3>
              <p className="mt-1 capitalize text-stone-900">
                {project.project_type.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Status</h3>
              <div className="mt-1">
                <StatusBadge value={project.status} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Priority</h3>
              <div className="mt-1">
                <StatusBadge value={project.priority} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Progress</h3>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-stone-900"
                    style={{ width: `${project.completion_percentage}%` }}
                  />
                </div>
                <span className="text-xs text-stone-500">{project.completion_percentage}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-stone-500">Planned Start</h3>
              <p className="mt-1 text-stone-900">
                {project.start_date
                  ? new Date(project.start_date).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Planned End</h3>
              <p className="mt-1 text-stone-900">
                {project.end_date
                  ? new Date(project.end_date).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            {project.actual_start_date && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Actual Start</h3>
                <p className="mt-1 text-stone-900">
                  {new Date(project.actual_start_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {project.actual_end_date && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Actual End</h3>
                <p className="mt-1 text-stone-900">
                  {new Date(project.actual_end_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {project.budget != null && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Budget</h3>
                <p className="mt-1 text-stone-900">
                  ${Number(project.budget).toLocaleString()}
                </p>
              </div>
            )}
            {project.actual_cost != null && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Actual Cost</h3>
                <p className="mt-1 text-stone-900">
                  ${Number(project.actual_cost).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {project.description && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Description</h3>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">
            {project.description}
          </p>
        </div>
      )}

      <CustomFieldsDisplay
        definitions={fieldDefs ?? []}
        values={(project.custom_fields as Record<string, unknown>) ?? {}}
      />

      <Separator />

      {/* Related Actions */}
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-stone-900">
          Actions in this Project
        </h2>
        {actions && actions.length > 0 ? (
          <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left text-stone-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a: Record<string, string>) => (
                  <tr key={a.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/actions/${a.id}`} className="text-fox-orange hover:underline">
                        {a.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize">{a.action_type?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={a.priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-500">No actions in this project yet.</p>
        )}
      </div>
    </div>
  );
}
