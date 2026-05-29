"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "../client/server";
import type { ActionType, Priority } from "../types";

const PRIORITY_BY_TIER: Record<string, Priority> = {
  lazy: "low",
  standard: "medium",
  urgent: "high",
  emergency: "critical",
};

const PRICE_BY_TIER: Record<string, number> = {
  lazy: 100,
  standard: 150,
  urgent: 200,
  emergency: 250,
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
    .select("name")
    .eq("id", orgId)
    .single();
  const clientName = (org?.name as string) ?? "";

  const assetLabel = pick(formData, "asset_label");
  const networkType = pick(formData, "network_type");
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
    !networkType ||
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
  await db.from("assets").insert({
    name: assetLabel,
    asset_type: "other",
    serial_number: serial,
    status: "deployed",
    location_id: location.id,
    description: networkType,
    tags: [networkType],
    organization_id: orgId,
    created_by: user.id,
  });

  await db.from("actions").insert({
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
  });

  redirect("/client/dashboard?success=Request+submitted");
}
