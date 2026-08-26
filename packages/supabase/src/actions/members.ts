"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../client/server";
import { sendEmail } from "../email/postmark";
import { buildInvitationEmail } from "../email/invitation-email";
import { invitationUrl } from "../email/app-url";

export async function getOrgMembers(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("profiles")
    .select("id, name, email, role, avatar_url, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });
  return { data, error };
}

export async function getInvitations(orgId: string) {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("invitations")
    .select("id, email, name, role, status, created_at")
    .eq("organization_id", orgId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function inviteMember(
  orgId: string,
  invitedBy: string,
  email: string,
  name: string | null,
  role: "admin" | "manager" | "technician" | "viewer"
) {
  const supabase = await createServerClient();

  // Check if email is already a member of this org
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("profiles")
    .select("id")
    .eq("organization_id", orgId)
    .ilike("email", email)
    .limit(1);

  if (existing && existing.length > 0) {
    return { data: null, error: { message: "This person is already a member of your organization." } };
  }

  // Someone who already has an account never passes through
  // handle_new_user() again, so an invitation alone would sit pending for
  // ever. If they exist and belong to no organisation, link them now.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: unlinked } = await (supabase as any)
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .is("organization_id", null)
    .limit(1)
    .maybeSingle();

  // A pending invitation for this address may already exist — including an
  // expired one, which the partial unique index still counts as pending. So
  // inviting the same person again refreshes the existing row rather than
  // inserting a second one, which would fail on the index. This is also what
  // makes "invite again" work as a resend.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pending } = await (supabase as any)
    .from("invitations")
    .select("id")
    .eq("organization_id", orgId)
    .eq("status", "pending")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = pending?.id
    ? await db
        .from("invitations")
        .update({
          name: name || null,
          role,
          invited_by: invitedBy,
          // A fresh link, so a leaked old one stops working.
          token: crypto.randomUUID(),
          expires_at: expiresAt,
        })
        .eq("id", pending.id)
        .select()
        .single()
    : await db
        .from("invitations")
        .insert({
          organization_id: orgId,
          email: email.toLowerCase(),
          name: name || null,
          role,
          invited_by: invitedBy,
          expires_at: expiresAt,
        })
        .select()
        .single();

  if (error) return { data, error };

  if (unlinked?.id) {
    const { error: linkError } = await db
      .from("profiles")
      .update({ organization_id: orgId, role })
      .eq("id", unlinked.id);

    // A failure here is not fatal: the invitation stands, and the person
    // will claim it on their next request via claim_pending_invitation().
    if (!linkError) {
      await db
        .from("invitations")
        .update({ status: "accepted" })
        .eq("id", data.id);
      data.status = "accepted";
    }
  }

  const emailResult = await sendInvitationEmail(supabase, orgId, invitedBy, data);

  revalidatePath("/members");

  // The invitation exists either way, so a failed send is reported alongside
  // it rather than as an error — the row is still there to resend from, and
  // pretending the invite failed would tempt the inviter into a duplicate.
  return { data, error: null, emailWarning: emailResult };
}

/**
 * Email the invitee their link. Returns a message to surface if it did not
 * go out, or null if it did (or if Postmark simply is not configured, which
 * is the normal state locally).
 */
async function sendInvitationEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  orgId: string,
  invitedBy: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invitation: any
): Promise<string | null> {
  try {
    const [{ data: org }, { data: inviter }] = await Promise.all([
      supabase.from("organizations").select("name").eq("id", orgId).maybeSingle(),
      supabase.from("profiles").select("name").eq("id", invitedBy).maybeSingle(),
    ]);

    const result = await sendEmail(
      buildInvitationEmail({
        to: invitation.email,
        name: invitation.name ?? null,
        organizationName: org?.name ?? "your team",
        inviterName: inviter?.name ?? null,
        role: invitation.role,
        acceptUrl: invitationUrl(invitation.token),
        expiresAt: new Date(invitation.expires_at),
      })
    );

    if (result.sent) return null;
    if (result.skipped) {
      console.warn(`[invitations] email not sent: ${result.reason}`);
      return null;
    }

    console.error(`[invitations] email failed: ${result.reason}`);
    return `The invitation was created, but the email could not be sent: ${result.reason}`;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error(`[invitations] email failed: ${message}`);
    return `The invitation was created, but the email could not be sent: ${message}`;
  }
}

export async function updateMemberRole(
  currentUserId: string,
  memberId: string,
  orgId: string,
  role: "admin" | "manager" | "technician" | "viewer"
) {
  if (memberId === currentUserId) {
    return { data: null, error: { message: "You cannot change your own role." } };
  }

  const supabase = await createServerClient();

  // If demoting from admin, check there's at least one other admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: member } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", memberId)
    .single();

  if (member?.role === "admin" && role !== "admin") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("role", "admin");

    if ((count ?? 0) <= 1) {
      return { data: null, error: { message: "Cannot demote the last admin. Promote another member first." } };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("profiles")
    .update({ role })
    .eq("id", memberId)
    .eq("organization_id", orgId)
    .select()
    .single();

  if (!error) {
    revalidatePath("/members");
  }

  return { data, error };
}

export async function removeMember(
  currentUserId: string,
  memberId: string,
  orgId: string
) {
  if (memberId === currentUserId) {
    return { data: null, error: { message: "You cannot remove yourself." } };
  }

  const supabase = await createServerClient();

  // Soft remove: set organization_id to null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("profiles")
    .update({ organization_id: null, account_type: null })
    .eq("id", memberId)
    .eq("organization_id", orgId)
    .select()
    .single();

  if (!error) {
    revalidatePath("/members");
  }

  return { data, error };
}

export async function revokeInvitation(invitationId: string) {
  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .select()
    .single();

  if (!error) {
    revalidatePath("/members");
  }

  return { data, error };
}

export async function bulkUpdateMemberRoles(
  currentUserId: string,
  memberIds: string[],
  orgId: string,
  role: "admin" | "manager" | "technician" | "viewer"
) {
  // Filter out current user
  const ids = memberIds.filter((id) => id !== currentUserId);
  if (ids.length === 0) {
    return { data: null, error: { message: "No valid members to update." } };
  }

  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("profiles")
    .update({ role })
    .in("id", ids)
    .eq("organization_id", orgId)
    .select();

  if (!error) {
    revalidatePath("/members");
  }

  return { data, error };
}

export async function bulkRemoveMembers(
  currentUserId: string,
  memberIds: string[],
  orgId: string
) {
  // Filter out current user
  const ids = memberIds.filter((id) => id !== currentUserId);
  if (ids.length === 0) {
    return { data: null, error: { message: "No valid members to remove." } };
  }

  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("profiles")
    .update({ organization_id: null, account_type: null })
    .in("id", ids)
    .eq("organization_id", orgId)
    .select();

  if (!error) {
    revalidatePath("/members");
  }

  return { data, error };
}
