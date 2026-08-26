-- 034: Give an invitation a link you can actually send someone.
--
-- Until now an invitation was only ever matched by email equality, and there
-- was nowhere to send an invitee: /signup offers "create a company" or
-- "become a partner", so an invited technician had to invent a company name
-- to get an account. Nothing addressed them as an invitee at all.
--
-- To email someone a link, the link needs to identify the invitation without
-- the recipient being signed in — and RLS on `invitations` scopes SELECT to
-- get_my_org_id(), so an anonymous visitor can read nothing. Hence a token
-- plus one security-definer reader that returns only what the invitation page
-- needs to render.
--
-- Expiry is added in the same pass because all three acceptance paths
-- (signup trigger, claim-on-login, invite-time linking) currently honour a
-- 'pending' row for ever.

-- ============================================================
-- Token and expiry
-- ============================================================

alter table public.invitations
  add column if not exists token uuid not null default gen_random_uuid(),
  add column if not exists expires_at timestamptz not null default (now() + interval '14 days');

-- The token is the lookup key for the invitation page, so it must be unique
-- and indexed. Existing rows get one from the default above.
create unique index if not exists invitations_token_idx
  on public.invitations (token);

comment on column public.invitations.token is
  'Unguessable identifier used in the emailed invitation link. Not a session '
  'credential: possession lets you see who invited you and sign up as the '
  'invited address, nothing more.';

-- ============================================================
-- Reading an invitation before sign-in
-- ============================================================

-- Returns only what the invitation page renders: who invited you, to what,
-- and whether the invitation is still good. Deliberately not the invited_by
-- id or anything else about the organisation's people.
create or replace function public.invitation_by_token(p_token uuid)
returns table (
  email             text,
  name              text,
  role              public.app_role,
  organization_name text,
  status            text,
  is_expired        boolean
)
language sql
security definer
set search_path = ''
stable
as $$
  select i.email,
         i.name,
         i.role,
         o.name,
         i.status,
         i.expires_at <= now()
    from public.invitations i
    join public.organizations o on o.id = i.organization_id
   where i.token = p_token;
$$;

-- anon included on purpose: the invitation page is reached from an email
-- link by someone who by definition has no account yet.
grant execute on function public.invitation_by_token(uuid) to anon, authenticated;

-- ============================================================
-- Honour expiry on every acceptance path
-- ============================================================

-- Path 1: a brand-new account signing up. Same body as 021, with the
-- invitation lookup now rejecting expired rows and preferring the newest.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  new_org_id uuid;
  acct text;
  invite_record record;
begin
  -- ── Invited member (e.g. technician)? Link to inviter's org. ──
  select id, organization_id, role
    into invite_record
    from public.invitations
    where lower(email) = lower(new.email)
      and status = 'pending'
      and expires_at > now()
    order by created_at desc
    limit 1;

  if invite_record is not null then
    insert into public.profiles (id, email, name, avatar_url, organization_id, role, account_type)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
      new.raw_user_meta_data ->> 'avatar_url',
      invite_record.organization_id,
      invite_record.role,
      'company'::public.account_type
    );

    update public.invitations
      set status = 'accepted'
      where id = invite_record.id;

    return new;
  end if;

  acct := new.raw_user_meta_data ->> 'account_type';

  insert into public.profiles (id, email, name, avatar_url, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when acct = 'company' then 'company'::public.account_type
      when acct = 'partner' then 'partner'::public.account_type
      when acct = 'client'  then 'client'::public.account_type
      else null
    end
  );

  if acct in ('company', 'client')
     and new.raw_user_meta_data ->> 'company_name' is not null then
    insert into public.organizations (name, size, industry, website, description, logo_url, created_by)
    values (
      new.raw_user_meta_data ->> 'company_name',
      coalesce(
        nullif(new.raw_user_meta_data ->> 'company_size', '')::public.org_size,
        '1-10'::public.org_size
      ),
      nullif(new.raw_user_meta_data ->> 'company_industry', ''),
      nullif(new.raw_user_meta_data ->> 'company_website', ''),
      nullif(new.raw_user_meta_data ->> 'company_description', ''),
      nullif(new.raw_user_meta_data ->> 'company_logo_url', ''),
      new.id
    )
    returning id into new_org_id;

    update public.profiles
      set organization_id = new_org_id,
          role = 'admin'::public.app_role
      where id = new.id;
  end if;

  return new;
end;
$$;

-- Path 2: an existing account signing in. Same as 033, plus expiry.
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

  if me.id is null or me.organization_id is not null then
    return me.organization_id;
  end if;

  select id, organization_id, role
    into invite
    from public.invitations
   where lower(email) = lower(me.email)
     and status = 'pending'
     and expires_at > now()
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

grant execute on function public.claim_pending_invitation() to authenticated;
