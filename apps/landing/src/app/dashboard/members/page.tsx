import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrgMembers, getInvitations } from "@fox/supabase/actions/members";
import { MembersClient } from "./members-client";

export default async function MembersPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/dashboard");

  const [{ data: members }, { data: invitations }] = await Promise.all([
    getOrgMembers(user.organizationId),
    getInvitations(user.organizationId),
  ]);

  return (
    <MembersClient
      members={members ?? []}
      invitations={invitations ?? []}
      currentUserId={user.id}
      userRole={user.role}
      orgId={user.organizationId}
    />
  );
}
