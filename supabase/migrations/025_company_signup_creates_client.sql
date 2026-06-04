-- 025: Public "Company" signups are our customers (network operators), so
-- treat them as clients — they land on /client/dashboard, while the internal
-- global /dashboard stays reserved for existing account_type='company' staff.
--
-- Only the new-signup path changes: setup_company now sets account_type='client'.
-- Existing 'company' profiles are left exactly as they are.

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

  -- Link profile, mark as a client, and make them admin of their own org
  update public.profiles
  set organization_id = new_org_id,
      account_type = 'client'::public.account_type,
      role = 'admin'::public.app_role
  where id = p_user_id;
end;
$$;
