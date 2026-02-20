import { getAuthUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAction } from "@fox/supabase/actions/actions";
import { getFieldDefinitions } from "@fox/supabase/actions/custom-fields";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CustomFieldsDisplay } from "@/components/custom-fields-renderer";
import Link from "next/link";
import { ActionDetailClient } from "./action-detail-client";

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/");

  const { id } = await params;
  const [{ data: action }, { data: fieldDefs }] = await Promise.all([
    getAction(id),
    getFieldDefinitions(user.organizationId, "actions"),
  ]);

  if (!action) notFound();

  const canEdit =
    user.role === "admin" ||
    user.role === "manager" ||
    (user.role === "technician" && action.assigned_to === user.id);

  return (
    <div className="space-y-6 p-8">
      <PageHeader title={action.name} />

      <ActionDetailClient actionId={action.id} canEdit={canEdit} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-stone-500">Project</h3>
              <p className="mt-1">
                <Link
                  href={`/projects/${action.project_id}`}
                  className="text-fox-orange hover:underline"
                >
                  {action.projects?.name ?? "—"}
                </Link>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Type</h3>
              <p className="mt-1 capitalize text-stone-900">
                {action.action_type.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Status</h3>
              <div className="mt-1">
                <StatusBadge value={action.status} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Priority</h3>
              <div className="mt-1">
                <StatusBadge value={action.priority} />
              </div>
            </div>
            {action.category && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Category</h3>
                <p className="mt-1 capitalize text-stone-900">{action.category}</p>
              </div>
            )}
            {action.due_date && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Due Date</h3>
                <p className="mt-1 text-stone-900">{new Date(action.due_date).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-stone-500">Scheduled Start</h3>
              <p className="mt-1 text-stone-900">
                {action.scheduled_start
                  ? new Date(action.scheduled_start).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Scheduled End</h3>
              <p className="mt-1 text-stone-900">
                {action.scheduled_end
                  ? new Date(action.scheduled_end).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Actual Start</h3>
              <p className="mt-1 text-stone-900">
                {action.actual_start
                  ? new Date(action.actual_start).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-500">Actual End</h3>
              <p className="mt-1 text-stone-900">
                {action.actual_end
                  ? new Date(action.actual_end).toLocaleString()
                  : "—"}
              </p>
            </div>
            {action.estimated_duration_min != null && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Est. Duration</h3>
                <p className="mt-1 text-stone-900">{action.estimated_duration_min} min</p>
              </div>
            )}
            {action.actual_duration_min != null && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Actual Duration</h3>
                <p className="mt-1 text-stone-900">{action.actual_duration_min} min</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cost */}
      {(action.estimated_cost != null || action.actual_cost != null) && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            {action.estimated_cost != null && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Estimated Cost</h3>
                <p className="mt-1 text-stone-900">${Number(action.estimated_cost).toLocaleString()}</p>
              </div>
            )}
            {action.actual_cost != null && (
              <div>
                <h3 className="text-sm font-medium text-stone-500">Actual Cost</h3>
                <p className="mt-1 text-stone-900">${Number(action.actual_cost).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {action.tags && action.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {action.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {action.description && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Description</h3>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">
            {action.description}
          </p>
        </div>
      )}

      {action.notes && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">{action.notes}</p>
        </div>
      )}

      {action.completion_notes && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-sm font-medium text-stone-500">Completion Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-stone-700">{action.completion_notes}</p>
        </div>
      )}

      <CustomFieldsDisplay
        definitions={fieldDefs ?? []}
        values={(action.custom_fields as Record<string, unknown>) ?? {}}
      />
    </div>
  );
}
