-- Enums
create type public.account_type as enum ('company', 'partner');
create type public.org_size as enum ('1-10', '11-50', '51-200', '201-500', '500+');
create type public.partner_request_status as enum ('pending', 'approved', 'rejected');

-- Organizations table
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  size public.org_size not null,
  industry text,
  website text,
  description text,
  logo_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- Partner requests table (no auth account needed)
create table public.partner_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  trade text not null,
  status public.partner_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partner_requests enable row level security;

-- Add new columns to profiles
alter table public.profiles
  add column organization_id uuid references public.organizations(id) on delete set null,
  add column account_type public.account_type;

-- Update handle_new_user trigger to read account_type and create org from metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  new_org_id uuid;
begin
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
      set organization_id = new_org_id
      where id = new.id;
  end if;

  return new;
end;
$$;

-- RLS: Organizations

-- Org members can read their own org
create policy "Org members can read own organization"
  on public.organizations for select
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.organization_id = organizations.id
    )
  );

-- Creator can update their org
create policy "Creator can update own organization"
  on public.organizations for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- Authenticated users can create organizations
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() is not null);

-- RLS: Partner requests

-- Anyone can insert a partner request (anon or authenticated)
create policy "Anyone can submit partner request"
  on public.partner_requests for insert
  with check (true);

-- Admins can read partner requests
create policy "Admins can read partner requests"
  on public.partner_requests for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update partner requests (approve/reject)
create policy "Admins can update partner requests"
  on public.partner_requests for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RPC: setup_company (used by OAuth flow, bypasses RLS)
create or replace function public.setup_company(
  p_user_id uuid,
  p_user_email text,
  p_user_name text,
  p_avatar_url text,
  p_company_name text,
  p_company_size text,
  p_industry text default null,
  p_website text default null,
  p_description text default null,
  p_logo_url text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_org_id uuid;
begin
  -- Ensure profile exists
  insert into public.profiles (id, email, name, avatar_url)
  values (p_user_id, p_user_email, p_user_name, p_avatar_url)
  on conflict (id) do nothing;

  -- Create organization
  insert into public.organizations (name, size, industry, website, description, logo_url, created_by)
  values (
    p_company_name,
    p_company_size::public.org_size,
    p_industry,
    p_website,
    p_description,
    p_logo_url,
    p_user_id
  )
  returning id into new_org_id;

  -- Link profile
  update public.profiles
  set organization_id = new_org_id, account_type = 'company'::public.account_type
  where id = p_user_id;
end;
$$;

-- Auto-update updated_at for organizations
create trigger on_organization_updated
  before update on public.organizations
  for each row execute function public.handle_updated_at();

-- Auto-update updated_at for partner_requests
create trigger on_partner_request_updated
  before update on public.partner_requests
  for each row execute function public.handle_updated_at();
