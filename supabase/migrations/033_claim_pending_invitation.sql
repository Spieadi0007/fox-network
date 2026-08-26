-- 033: Let an invitation be accepted after the account already exists.
--
-- Acceptance lived entirely in handle_new_user(), which fires only on INSERT
-- into auth.users — that is, once, when an account is first created. So an
-- invitation could only ever be accepted by someone who had no account at the
-- moment they were invited.
--
-- Invite a colleague who already signed up, or invite someone who signs up
-- before the invitation is created, and the trigger never runs again: they
-- log in, nothing links them, the invitation stays 'pending' for ever, and
-- middleware sends them to company signup because they have no organisation.
--
-- The fix does not replace the trigger, which is still the right thing for a
-- genuinely new account. It adds a second chance that any signed-in user can
-- take, and repairs the accounts already stuck.

-- ============================================================
-- Claim on demand
-- ============================================================

create or replace function public.claim_pending_invitation()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me     record;
  invite record;
begin
  select id, email, organization_id
    into me
    from public.profiles
   where id = auth.uid();

  -- No profile, or already in an organisation: nothing to claim. Returning
  -- the existing organisation keeps this safe to call unconditionally.
  if me.id is null or me.organization_id is not null then
    return me.organization_id;
  end if;

  select id, organization_id, role
    into invite
    from public.invitations
   where lower(email) = lower(me.email)
     and status = 'pending'
   order by created_at desc
   limit 1;

  if invite.id is null then
    return null;
  end if;

  update public.profiles
     set organization_id = invite.organization_id,
         role            = invite.role,
         account_type    = coalesce(account_type, 'company'::public.account_type)
   where id = me.id;

  update public.invitations
     set status = 'accepted'
   where id = invite.id;

  return invite.organization_id;
end;
$$;

-- Callable by any signed-in user. It is security definer but acts only on the
-- caller's own profile and only on an invitation addressed to their own email,
-- so it cannot be used to join an organisation nobody invited them to.
grant execute on function public.claim_pending_invitation() to authenticated;

-- ============================================================
-- Repair the accounts already stuck
-- ============================================================

-- Anyone who was invited, signed up, and never got linked. Runs once; the
-- function above prevents this recurring.
with claimable as (
  select distinct on (p.id)
         p.id as profile_id,
         i.id as invitation_id,
         i.organization_id,
         i.role
    from public.profiles p
    join public.invitations i
      on lower(i.email) = lower(p.email)
     and i.status = 'pending'
   where p.organization_id is null
   order by p.id, i.created_at desc
)
update public.profiles p
   set organization_id = c.organization_id,
       role            = c.role,
       account_type    = coalesce(p.account_type, 'company'::public.account_type)
  from claimable c
 where p.id = c.profile_id;

update public.invitations i
   set status = 'accepted'
  from public.profiles p
 where lower(i.email) = lower(p.email)
   and i.status = 'pending'
   and p.organization_id = i.organization_id;
