-- Fix: company creators should be admins, not viewers
-- Update setup_company RPC to set role = 'admin' for org creators
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

  -- Link profile and set as admin
  update public.profiles
  set organization_id = new_org_id, account_type = 'company'::public.account_type, role = 'admin'::public.app_role
  where id = p_user_id;
end;
$$;

-- Also fix the handle_new_user trigger to set admin role for company signups
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
      set organization_id = new_org_id, role = 'admin'::public.app_role
      where id = new.id;
  end if;

  return new;
end;
$$;

-- Retroactively fix existing company creators to be admins
update public.profiles
set role = 'admin'::public.app_role
where id in (
  select created_by from public.organizations where created_by is not null
)
and role = 'viewer';
