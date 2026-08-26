"use server";

import { createServerClient } from "../client/server";

export type ClientAccount = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  created_at: string;
};

export type ClientAccountGroup = {
  organizationId: string;
  organizationName: string;
  members: ClientAccount[];
};

export async function isFoxStaff(): Promise<boolean> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("profiles")
    .select("fox_staff")
    .eq("id", user.id)
    .single();

  return !!data?.fox_staff;
}

/**
 * Every client account, grouped by the organisation it belongs to.
 *
 * The fox_staff check here is the actual gate, not a convenience. A server
 * action is an HTTP endpoint anyone signed in can call, so hiding the section
 * in the UI protects nothing — and RLS does not stop this query either:
 * migration 001's "Admins can read all profiles" policy is `using
 * (is_admin())` with no organisation scoping, so any org admin can read every
 * profile in the database. Until that policy is narrowed, this function must
 * refuse non-staff callers itself.
 */
export async function getAllClientAccounts(): Promise<ClientAccountGroup[]> {
  if (!(await isFoxStaff())) return [];

  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data } = await db
    .from("profiles")
    .select(
      "id, name, email, role, created_at, organization_id, organization:organizations(name)"
    )
    .eq("account_type", "client")
    .not("organization_id", "is", null)
    .order("created_at", { ascending: true });

  const groups = new Map<string, ClientAccountGroup>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of data ?? []) {
    const orgId = row.organization_id as string;
    if (!groups.has(orgId)) {
      groups.set(orgId, {
        organizationId: orgId,
        organizationName: row.organization?.name ?? "Unnamed company",
        members: [],
      });
    }
    groups.get(orgId)!.members.push({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      created_at: row.created_at,
    });
  }

  return [...groups.values()].sort((a, b) =>
    a.organizationName.localeCompare(b.organizationName)
  );
}
