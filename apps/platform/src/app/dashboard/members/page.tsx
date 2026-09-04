import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrgMembers, getInvitations } from "@fox/supabase/actions/members";
import {
  isFoxStaff,
  getAllClientAccounts,
} from "@fox/supabase/actions/staff-clients";
import { MembersClient } from "./members-client";
import { ClientAccounts } from "./client-accounts";

export default async function MembersPage() {
  const user = await getAuthUser();
  if (!user || !user.organizationId) redirect("/signin");

  const [{ data: members }, { data: invitations }, foxStaff] = await Promise.all([
    getOrgMembers(user.organizationId),
    getInvitations(user.organizationId),
    isFoxStaff(),
  ]);

  // Only fetched for staff: for anyone else RLS would return their own
  // organisation and the section would be a confusing duplicate of the table
  // above it.
  const clientGroups = foxStaff ? await getAllClientAccounts() : [];

  return (
    <div>
      <MembersClient
        members={members ?? []}
        invitations={invitations ?? []}
        currentUserId={user.id}
        userRole={user.role}
        orgId={user.organizationId}
      />

      {foxStaff && (
        <div className="px-8 pb-8">
          <ClientAccounts groups={clientGroups} />
        </div>
      )}
    </div>
  );
}
