-- ============================================================
-- 1A. Create invitations table
-- ============================================================

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  name text,
  role public.app_role not null default 'viewer',
  invited_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent duplicate pending invites for the same email in the same org
create unique index invitations_org_email_pending_idx
  on public.invitations (organization_id, lower(email))
  where status = 'pending';

alter table public.invitations enable row level security;

-- Auto-update updated_at
create trigger on_invitation_updated
  before update on public.invitations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 1B. RLS on invitations
-- ============================================================

-- Org members can read invitations for their org
create policy "Org members can read invitations"
  on public.invitations for select to authenticated
  using (organization_id = public.get_my_org_id());

-- Managers and admins can create invitations
create policy "Managers and admins can create invitations"
  on public.invitations for insert to authenticated
  with check (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

-- Admins can update invitations (revoke, etc.)
create policy "Admins can update invitations"
  on public.invitations for update to authenticated
  using (
    organization_id = public.get_my_org_id()
    and public.is_admin()
  );

-- Admins can delete invitations
create policy "Admins can delete invitations"
  on public.invitations for delete to authenticated
  using (
    organization_id = public.get_my_org_id()
    and public.is_admin()
  );

-- ============================================================
-- 1C. Fix profiles RLS -- add org-scoped read
-- ============================================================

create policy "Org members can read org profiles"
  on public.profiles for select to authenticated
  using (
    organization_id is not null
    and organization_id = public.get_my_org_id()
  );

-- ============================================================
-- 1D. Update handle_new_user() trigger to check invitations
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  new_org_id uuid;
  invite_record record;
begin
  -- Check for a pending invitation matching this email
  select id, organization_id, role
    into invite_record
    from public.invitations
    where lower(email) = lower(new.email)
      and status = 'pending'
    limit 1;

  if invite_record is not null then
    -- Invited user: create profile linked to the inviter's org
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

    -- Mark the invitation as accepted
    update public.invitations
      set status = 'accepted'
      where id = invite_record.id;

    return new;
  end if;

  -- No invitation found: run existing flow
  insert into public.profiles (id, email, name, avatar_url, account_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when new.raw_user_meta_data ->> 'account_type' = 'company' then 'company'::public.account_type
      when new.raw_user_meta_data ->> 'account_type' = 'partner' then 'partner'::public.account_type
      else null
    end
  );

  -- If company signup includes org details in metadata, create the org and link it
  if new.raw_user_meta_data ->> 'account_type' = 'company'
     and new.raw_user_meta_data ->> 'company_name' is not null then
    insert into public.organizations (name, size, industry, website, description, logo_url, created_by)
    values (
      new.raw_user_meta_data ->> 'company_name',
      (new.raw_user_meta_data ->> 'company_size')::public.org_size,
      nullif(new.raw_user_meta_data ->> 'company_industry', ''),
      nullif(new.raw_user_meta_data ->> 'company_website', ''),
      nullif(new.raw_user_meta_data ->> 'company_description', ''),
      nullif(new.raw_user_meta_data ->> 'company_logo_url', ''),
      new.id
    )
    returning id into new_org_id;

    update public.profiles
      set organization_id = new_org_id, role = 'admin'::public.app_role
      where id = new.id;
  end if;

  return new;
end;
$$;
