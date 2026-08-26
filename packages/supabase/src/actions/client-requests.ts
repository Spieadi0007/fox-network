"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";
import type { ActionType, Priority } from "../types";

/**
 * Every client request across all client organizations — for the internal
 * FoxNetwork dashboard. Relies on the fox_staff RLS read-bypass (migration
 * 021): only a profile with fox_staff = true sees other orgs' rows; everyone
 * else gets just their own org back.
 */
export async function getAllClientRequests() {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Which organizations are client orgs?
  const { data: clientProfiles } = await db
    .from("profiles")
    .select("organization_id")
    .eq("account_type", "client")
    .not("organization_id", "is", null);

  const orgIds = [
    ...new Set(
      (clientProfiles ?? [])
        .map((p: { organization_id: string }) => p.organization_id)
        .filter(Boolean),
    ),
  ];
  if (orgIds.length === 0) return { data: [], error: null };

  const { data, error } = await db
    .from("actions")
    .select(
      "id, name, status, approval_status, priority, category, estimated_cost, description, created_at, organization_id, location:locations(name, city), organization:organizations(name)",
    )
    .in("organization_id", orgIds)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error };
}

async function requireFoxStaff() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from("profiles")
    .select("organization_id, fox_staff, role")
    .eq("id", user.id)
    .single();
  if (!profile?.fox_staff) redirect("/dashboard");
  return { db, userId: user.id, orgId: profile.organization_id as string };
}

/** Reject a client request — just marks it. */
export async function rejectRequest(formData: FormData) {
  const requestId = pick(formData, "request_id");
  if (!requestId) redirect("/dashboard/requests");
  const { db } = await requireFoxStaff();
  await db
    .from("actions")
    .update({ approval_status: "rejected" })
    .eq("id", requestId);
  revalidatePath("/dashboard/requests");
  redirect("/dashboard/requests?done=Request+rejected");
}

/**
 * Approve a client request: mark it approved and spin up the operational
 * location + project + action in our own org so a technician can be assigned.
 */
export async function approveRequest(formData: FormData) {
  const requestId = pick(formData, "request_id");
  if (!requestId) redirect("/dashboard/requests");
  const { db, userId, orgId } = await requireFoxStaff();

  const { data: req } = await db
    .from("actions")
    .select(
      "id, name, description, action_type, priority, estimated_cost, category, location:locations(name, address, city, state, zip_code, country), organization:organizations(name)",
    )
    .eq("id", requestId)
    .single();

  if (!req) redirect("/dashboard/requests?done=Request+not+found");

  const loc = (req.location as Record<string, unknown> | null) ?? {};
  const clientName = (req.organization as { name?: string } | null)?.name ?? "";

  // 1) Location in our org
  const { data: location } = await db
    .from("locations")
    .insert({
      name: (loc.name as string) || req.name,
      address: (loc.address as string) || "—",
      city: (loc.city as string) || "—",
      state: (loc.state as string) || "—",
      zip_code: (loc.zip_code as string) || "—",
      country: (loc.country as string) || "FR",
      client: clientName,
      organization_id: orgId,
      created_by: userId,
    })
    .select("id")
    .single();

  // 2) Project
  const today = new Date().toISOString().slice(0, 10);
  const { data: project } = await db
    .from("projects")
    .insert({
      name: req.name,
      location_id: location?.id,
      project_type: "maintenance",
      status: "planned",
      priority: req.priority,
      start_date: today,
      organization_id: orgId,
      created_by: userId,
    })
    .select("id")
    .single();

  // 3) Action (the dispatchable job)
  await db.from("actions").insert({
    name: req.name,
    description: req.description,
    project_id: project?.id,
    location_id: location?.id,
    action_type: req.action_type,
    status: "pending",
    priority: req.priority,
    estimated_cost: req.estimated_cost,
    category: req.category,
    approval_status: "approved",
    organization_id: orgId,
    created_by: userId,
  });

  // 4) Mark the client's request approved (fox_staff update bypass)
  await db
    .from("actions")
    .update({ approval_status: "approved" })
    .eq("id", requestId);

  revalidatePath("/dashboard/requests");
  redirect("/dashboard/requests?done=Request+approved");
}

const PRIORITY_BY_TIER: Record<string, Priority> = {
  lazy: "low",
  standard: "medium",
  urgent: "high",
  emergency: "critical",
};

// Keep in sync with the landing page (sla-pricing.tsx) and the client
// request form (client/dashboard/new SLA_OPTIONS).
const PRICE_BY_TIER: Record<string, number> = {
  lazy: 150,
  standard: 200,
  urgent: 300,
  emergency: 420,
};

const ACTION_BY_SERVICE: Record<string, ActionType> = {
  maintenance: "maintenance",
  repair: "repair",
  inspection: "inspection",
  installation: "installation",
};

function pick(formData: FormData, key: string): string {
  return ((formData.get(key) as string) ?? "").trim();
}

export async function submitClientRequest(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/client/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: profile } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  const orgId: string | undefined = profile?.organization_id;
  if (!orgId) {
    redirect("/client/signin?error=No+organization+linked+to+your+account");
  }

  const { data: org } = await db
    .from("organizations")
    .select("name, network_type")
    .eq("id", orgId)
    .single();
  const clientName = (org?.name as string) ?? "";

  const assetLabel = pick(formData, "asset_label");
  // Network type is set once at company creation (org.network_type). Fall back
  // to the form field for older orgs that pre-date that, then to "other".
  const networkType =
    (org?.network_type as string) || pick(formData, "network_type") || "other";
  const problemDescription = pick(formData, "problem_description");
  const siteName = pick(formData, "site_name") || assetLabel;
  const address = pick(formData, "address");
  const city = pick(formData, "city");
  const state = pick(formData, "state");
  const zipCode = pick(formData, "zip_code");
  const country = pick(formData, "country") || "FR";
  const serviceType = pick(formData, "service_type");
  const slaTier = pick(formData, "sla_tier");

  const missing =
    !assetLabel ||
    !address ||
    !city ||
    !state ||
    !zipCode ||
    !serviceType ||
    !slaTier;
  if (missing) {
    redirect("/client/requests/new?error=Please+fill+all+required+fields");
  }

  const priority: Priority = PRIORITY_BY_TIER[slaTier] ?? "medium";
  const price = PRICE_BY_TIER[slaTier] ?? 150;
  const actionType: ActionType = ACTION_BY_SERVICE[serviceType] ?? "maintenance";

  const { data: location, error: locError } = await db
    .from("locations")
    .insert({
      name: siteName,
      address,
      city,
      state,
      zip_code: zipCode,
      country,
      client: clientName,
      organization_id: orgId,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (locError) {
    redirect(
      `/client/requests/new?error=${encodeURIComponent(locError.message)}`,
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: project, error: projError } = await db
    .from("projects")
    .insert({
      name: `${assetLabel} – ${serviceType}`,
      location_id: location.id,
      project_type: "maintenance",
      status: "planned",
      priority,
      start_date: today,
      organization_id: orgId,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (projError) {
    redirect(
      `/client/requests/new?error=${encodeURIComponent(projError.message)}`,
    );
  }

  const serial = `${networkType.toUpperCase()}-${Date.now()}`;
  const { data: asset } = await db
    .from("assets")
    .insert({
      name: assetLabel,
      asset_type: "other",
      serial_number: serial,
      status: "deployed",
      location_id: location.id,
      description: networkType,
      tags: [networkType],
      organization_id: orgId,
      created_by: user.id,
    })
    .select("id")
    .single();

  const { data: createdAction } = await db
    .from("actions")
    .insert({
      name: `${serviceType} – ${assetLabel}`,
      description: problemDescription,
      project_id: project.id,
      location_id: location.id,
      action_type: actionType,
      status: "pending",
      priority,
      estimated_cost: price,
      category: networkType,
      tags: [networkType, slaTier],
      organization_id: orgId,
      created_by: user.id,
    })
    .select("id")
    .single();

  // Link the action to its asset. Best-effort: silently skipped if the asset_id
  // column isn't present yet (migration 024 not applied).
  if (createdAction?.id && asset?.id) {
    await db
      .from("actions")
      .update({ asset_id: asset.id })
      .eq("id", createdAction.id);
  }

  redirect("/client/requests?success=Request+submitted");
}

/**
 * Edit an existing request — only while it's still pending. Updates the linked
 * location, asset, and action. Network type stays whatever the org is set to.
 */
export async function updateClientRequest(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/client/signin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const requestId = pick(formData, "request_id");
  if (!requestId) redirect("/client/requests");

  const { data: profile } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  const orgId: string | undefined = profile?.organization_id;
  if (!orgId) {
    redirect("/client/signin?error=No+organization+linked+to+your+account");
  }

  const { data: action } = await db
    .from("actions")
    .select("id, approval_status, location_id, asset_id, organization_id")
    .eq("id", requestId)
    .single();

  // Must be the client's own request and still awaiting approval.
  if (!action || action.organization_id !== orgId) {
    redirect("/client/requests");
  }
  if (action.approval_status !== "pending") {
    redirect(
      `/client/requests/${requestId}?error=This+request+can+no+longer+be+edited`,
    );
  }

  const { data: org } = await db
    .from("organizations")
    .select("network_type")
    .eq("id", orgId)
    .single();
  const networkType = (org?.network_type as string) || "other";

  const assetLabel = pick(formData, "asset_label");
  const problemDescription = pick(formData, "problem_description");
  const siteName = pick(formData, "site_name") || assetLabel;
  const address = pick(formData, "address");
  const city = pick(formData, "city");
  const state = pick(formData, "state");
  const zipCode = pick(formData, "zip_code");
  const country = pick(formData, "country") || "FR";
  const serviceType = pick(formData, "service_type");
  const slaTier = pick(formData, "sla_tier");

  const missing =
    !assetLabel ||
    !address ||
    !city ||
    !state ||
    !zipCode ||
    !serviceType ||
    !slaTier;
  if (missing) {
    redirect(
      `/client/requests/${requestId}?error=Please+fill+all+required+fields`,
    );
  }

  const priority: Priority = PRIORITY_BY_TIER[slaTier] ?? "medium";
  const price = PRICE_BY_TIER[slaTier] ?? 200;
  const actionType: ActionType = ACTION_BY_SERVICE[serviceType] ?? "maintenance";

  if (action.location_id) {
    await db
      .from("locations")
      .update({
        name: siteName,
        address,
        city,
        state,
        zip_code: zipCode,
        country,
      })
      .eq("id", action.location_id);
  }

  if (action.asset_id) {
    await db.from("assets").update({ name: assetLabel }).eq("id", action.asset_id);
  }

  await db
    .from("actions")
    .update({
      name: `${serviceType} – ${assetLabel}`,
      description: problemDescription,
      action_type: actionType,
      priority,
      estimated_cost: price,
      category: networkType,
      tags: [networkType, slaTier],
    })
    .eq("id", requestId);

  redirect(`/client/requests/${requestId}?success=Request+updated`);
}
