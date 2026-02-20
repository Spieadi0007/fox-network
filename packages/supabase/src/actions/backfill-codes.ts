"use server";

import { createServerClient } from "../client/server";
import {
  locationPrefix,
  projectPrefix,
  actionPrefix,
  nextCode,
} from "../utils/code-gen";

async function getProfile() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single<{ organization_id: string | null; role: string }>();
  return { userId: user.id, organizationId: profile?.organization_id ?? null, role: profile?.role ?? "" };
}

export async function backfillCodes(): Promise<{ success: boolean; message: string }> {
  const auth = await getProfile();
  if (!auth?.organizationId) return { success: false, message: "Not authenticated" };
  if (auth.role !== "admin") return { success: false, message: "Admin only" };

  const orgId = auth.organizationId;
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  let locCount = 0;
  let projCount = 0;
  let actionCount = 0;

  // 1. Backfill locations without codes
  const { data: locations } = await sb
    .from("locations")
    .select("id, client, country, city, code")
    .eq("organization_id", orgId)
    .is("code", null);

  if (locations) {
    for (const loc of locations) {
      if (loc.client && loc.country && loc.city) {
        const prefix = locationPrefix(loc.client, loc.country, loc.city);
        const code = await nextCode(sb, "locations", orgId, prefix);
        await sb.from("locations").update({ code }).eq("id", loc.id);
        locCount++;
      }
    }
  }

  // 2. Backfill projects without codes
  const { data: projects } = await sb
    .from("projects")
    .select("id, location_id, project_type, code")
    .eq("organization_id", orgId)
    .is("code", null);

  if (projects) {
    for (const proj of projects) {
      // Fetch parent location's (possibly just-backfilled) code
      const { data: loc } = await sb
        .from("locations")
        .select("code")
        .eq("id", proj.location_id)
        .single();

      if (loc?.code && proj.project_type) {
        const prefix = projectPrefix(loc.code, proj.project_type);
        const code = await nextCode(sb, "projects", orgId, prefix);
        await sb.from("projects").update({ code }).eq("id", proj.id);
        projCount++;
      }
    }
  }

  // 3. Backfill actions without codes
  const { data: actions } = await sb
    .from("actions")
    .select("id, project_id, action_type, code")
    .eq("organization_id", orgId)
    .is("code", null);

  if (actions) {
    for (const action of actions) {
      // Fetch parent project's (possibly just-backfilled) code
      const { data: proj } = await sb
        .from("projects")
        .select("code")
        .eq("id", action.project_id)
        .single();

      if (proj?.code && action.action_type) {
        const prefix = actionPrefix(proj.code, action.action_type);
        const code = await nextCode(sb, "actions", orgId, prefix);
        await sb.from("actions").update({ code }).eq("id", action.id);
        actionCount++;
      }
    }
  }

  return {
    success: true,
    message: `Backfilled ${locCount} locations, ${projCount} projects, ${actionCount} actions.`,
  };
}
