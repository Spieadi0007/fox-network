-- Configurable field options: admin-defined dropdown values for all configurable dropdowns
create table public.configurable_field_options (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  field_key text not null check (field_key in (
    'country', 'timezone', 'category',
    'location_type', 'location_status', 'criticality',
    'project_type', 'project_status', 'priority',
    'action_type', 'action_status',
    'asset_type', 'asset_status', 'asset_condition'
  )),
  label text not null,
  code text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, field_key, code)
);

-- Index for fast lookups by org + field_key
create index idx_cfo_org_field on public.configurable_field_options(organization_id, field_key);

-- Trigger for updated_at
create trigger handle_cfo_updated_at
  before update on public.configurable_field_options
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.configurable_field_options enable row level security;

create policy "Org members can view field options"
  on public.configurable_field_options for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can insert field options"
  on public.configurable_field_options for insert
  with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can update field options"
  on public.configurable_field_options for update
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can delete field options"
  on public.configurable_field_options for delete
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());
