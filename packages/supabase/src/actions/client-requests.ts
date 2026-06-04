"use server";

import { redirect } from "next/navigation";
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
      "id, name, status, priority, category, estimated_cost, description, created_at, organization_id, location:locations(name, city), organization:organizations(name)",
    )
    .in("organization_id", orgIds)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error };
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
    redirect("/client/dashboard/new?error=Please+fill+all+required+fields");
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
      `/client/dashboard/new?error=${encodeURIComponent(locError.message)}`,
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
      `/client/dashboard/new?error=${encodeURIComponent(projError.message)}`,
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

  redirect("/client/dashboard?success=Request+submitted");
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
  if (!requestId) redirect("/client/dashboard");

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
    .select("id, status, location_id, asset_id, organization_id")
    .eq("id", requestId)
    .single();

  // Must be the client's own request and still editable.
  if (!action || action.organization_id !== orgId) {
    redirect("/client/dashboard");
  }
  if (action.status !== "pending") {
    redirect(
      `/client/dashboard/${requestId}?error=This+request+can+no+longer+be+edited`,
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
      `/client/dashboard/${requestId}?error=Please+fill+all+required+fields`,
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

  redirect(`/client/dashboard/${requestId}?success=Request+updated`);
}
