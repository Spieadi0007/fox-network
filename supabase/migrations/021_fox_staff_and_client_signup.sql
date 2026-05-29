-- 021: Fox staff cross-org read bypass + client signup wiring.
--
-- Clients each get their own organization (created on signup). Fox staff
-- (us) need to see across every client org for dispatch and reporting,
-- so we add a fox_staff flag and a read-only RLS bypass driven by it.

-- ──────────────────────────────────────────────────────────────────
-- 1. fox_staff flag on profiles
-- ──────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists fox_staff boolean not null default false;

create or replace function public.is_fox_staff()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select coalesce(
    (select fox_staff from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ──────────────────────────────────────────────────────────────────
-- 2. Read-bypass policies (additive — existing org-scoped policies still apply for non-staff)
-- ──────────────────────────────────────────────────────────────────
drop policy if exists "Fox staff can read all organizations" on public.organizations;
create policy "Fox staff can read all organizations"
  on public.organizations for select
  using (public.is_fox_staff());

drop policy if exists "Fox staff can read all profiles" on public.profiles;
create policy "Fox staff can read all profiles"
  on public.profiles for select
  using (public.is_fox_staff());

drop policy if exists "Fox staff can read all locations" on public.locations;
create policy "Fox staff can read all locations"
  on public.locations for select
  using (public.is_fox_staff());

drop policy if exists "Fox staff can read all projects" on public.projects;
create policy "Fox staff can read all projects"
  on public.projects for select
  using (public.is_fox_staff());

drop policy if exists "Fox staff can read all actions" on public.actions;
create policy "Fox staff can read all actions"
  on public.actions for select
  using (public.is_fox_staff());

drop policy if exists "Fox staff can read all assets" on public.assets;
create policy "Fox staff can read all assets"
  on public.assets for select
  using (public.is_fox_staff());

-- ──────────────────────────────────────────────────────────────────
-- 3. handle_new_user — extend with 'client' branch (mirrors company path)
-- ──────────────────────────────────────────────────────────────────
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
