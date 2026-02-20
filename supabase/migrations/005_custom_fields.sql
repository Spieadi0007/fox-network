-- Custom field definitions: stores field schemas per org per module
create table public.custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module text not null check (module in ('locations', 'projects', 'actions', 'assets')),
  field_name text not null,
  field_label text not null,
  field_type text not null check (field_type in ('text', 'textarea', 'number', 'date', 'boolean', 'select', 'url', 'email')),
  options jsonb default null,       -- for select type: ["Option A", "Option B"]
  required boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, module, field_name)
);

-- Indexes
create index idx_cfd_org_module on public.custom_field_definitions(organization_id, module);

-- Trigger for updated_at
create trigger handle_cfd_updated_at
  before update on public.custom_field_definitions
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.custom_field_definitions enable row level security;

create policy "Org members can view field definitions"
  on public.custom_field_definitions for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can manage field definitions"
  on public.custom_field_definitions for insert
  with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can update field definitions"
  on public.custom_field_definitions for update
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can delete field definitions"
  on public.custom_field_definitions for delete
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

-- Add custom_fields JSONB column to all 4 module tables
-- Stores { "field_name": value, ... } matching definitions
alter table public.locations
  add column if not exists custom_fields jsonb not null default '{}'::jsonb;

alter table public.projects
  add column if not exists custom_fields jsonb not null default '{}'::jsonb;

alter table public.actions
  add column if not exists custom_fields jsonb not null default '{}'::jsonb;

alter table public.assets
  add column if not exists custom_fields jsonb not null default '{}'::jsonb;

-- GIN indexes for querying inside custom_fields
create index idx_locations_custom_fields on public.locations using gin (custom_fields);
create index idx_projects_custom_fields on public.projects using gin (custom_fields);
create index idx_actions_custom_fields on public.actions using gin (custom_fields);
create index idx_assets_custom_fields on public.assets using gin (custom_fields);
