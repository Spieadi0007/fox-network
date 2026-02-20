"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";
import { projectPrefix, actionPrefix, nextCode } from "../utils/code-gen";

async function getProfile() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single<{ organization_id: string | null }>();
  return { userId: user.id, organizationId: profile?.organization_id ?? null };
}

export async function getProjects(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .select("*, locations(name)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getProject(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .select("*, locations(name)")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function getProjectsByLocation(locationId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .select("*")
    .eq("location_id", locationId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProject(values: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { data: null, error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .insert({ ...values, organization_id: auth.organizationId, created_by: auth.userId })
    .select()
    .single();

  if (!error && data) {
    // Fetch location code + client + country for workflow scoping and code generation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: loc } = await (supabase as any)
      .from("locations")
      .select("code, client, country")
      .eq("id", data.location_id)
      .single();

    const clientCode = loc?.client ?? "";
    const countryCode = loc?.country ?? "";

    // Auto-generate project code if parent location has a code
    let projCode: string | null = null;
    if (loc?.code && data.project_type) {
      const prefix = projectPrefix(loc.code, data.project_type);
      projCode = await nextCode(supabase, "projects", auth.organizationId, prefix);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("projects").update({ code: projCode }).eq("id", data.id);
      data.code = projCode;
    }

    // Auto-create actions from workflow steps
    // 4-level fallback: exact → all countries → all clients → all clients + all countries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const querySteps = async (client: string, country: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: s } = await (supabase as any)
        .from("workflow_steps")
        .select("*")
        .eq("organization_id", auth.organizationId)
        .eq("client_code", client)
        .eq("country_code", country)
        .eq("project_type_code", data.project_type)
        .order("step_order", { ascending: true });
      return s && s.length > 0 ? s : null;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let steps: any[] | null = null;
    // 1. Exact match (client + country)
    steps = await querySteps(clientCode, countryCode);
    // 2. Fallback: same client, all countries
    if (!steps && countryCode !== "") steps = await querySteps(clientCode, "");
    // 3. Fallback: all clients, same country
    if (!steps && clientCode !== "") steps = await querySteps("", countryCode);
    // 4. Fallback: all clients + all countries
    if (!steps && (clientCode !== "" || countryCode !== "")) steps = await querySteps("", "");

    if (steps && steps.length > 0) {
      for (const step of steps) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: actionData } = await (supabase as any)
          .from("actions")
          .insert({
            name: step.default_name,
            action_type: step.action_type_code,
            status: "pending",
            priority: data.priority ?? "medium",
            project_id: data.id,
            organization_id: auth.organizationId,
            created_by: auth.userId,
          })
          .select("id")
          .single();

        // Auto-generate action code if project has a code
        if (actionData && projCode) {
          const prefix = actionPrefix(projCode, step.action_type_code);
          const code = await nextCode(supabase, "actions", auth.organizationId, prefix);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("actions").update({ code }).eq("id", actionData.id);
        }
      }
      revalidatePath("/actions");
    }

    revalidatePath("/projects");
  }
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProject(id: string, values: Record<string, any>) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (!error) {
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
  }
  return { data, error };
}

export async function deleteProject(id: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("projects")
    .delete()
    .eq("id", id);
  if (!error) revalidatePath("/projects");
  return { error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function bulkUpdateProjects(ids: string[], updates: Record<string, any>) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("projects")
    .update(updates)
    .in("id", ids)
    .eq("organization_id", auth.organizationId);
  if (!error) revalidatePath("/projects");
  return { error };
}

export async function bulkDeleteProjects(ids: string[]) {
  const auth = await getProfile();
  if (!auth?.organizationId) return { error: { message: "Not authenticated" } };

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("projects")
    .delete()
    .in("id", ids)
    .eq("organization_id", auth.organizationId);
  if (!error) revalidatePath("/projects");
  return { error };
}
