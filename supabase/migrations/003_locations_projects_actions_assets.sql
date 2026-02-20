-- ============================================================
-- Enums
-- ============================================================

create type public.location_type as enum (
  'commercial', 'industrial', 'residential', 'government',
  'data_center', 'tower_site', 'other'
);

create type public.location_status as enum (
  'active', 'inactive', 'planned', 'decommissioned'
);

create type public.project_type as enum (
  'deployment', 'survey', 'maintenance', 'inspection', 'upgrade', 'remediation'
);

create type public.project_status as enum (
  'draft', 'planned', 'active', 'on_hold', 'completed', 'cancelled'
);

create type public.priority as enum (
  'low', 'medium', 'high', 'critical'
);

create type public.action_type as enum (
  'survey', 'installation', 'inspection', 'maintenance',
  'repair', 'testing', 'documentation', 'other'
);

create type public.action_status as enum (
  'pending', 'scheduled', 'in_progress', 'completed', 'blocked', 'cancelled'
);

create type public.asset_type as enum (
  'cable', 'antenna', 'power_supply', 'solar_panel', 'battery',
  'generator', 'server', 'router', 'sensor', 'meter',
  'tool', 'vehicle', 'other'
);

create type public.asset_status as enum (
  'available', 'deployed', 'in_maintenance', 'retired'
);

create type public.asset_condition as enum (
  'excellent', 'good', 'fair', 'poor'
);

-- ============================================================
-- Helper functions (security definer to avoid RLS recursion)
-- ============================================================

create or replace function public.get_my_org_id()
returns uuid
language sql
security definer
set search_path = ''
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_manager_or_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'manager')
  );
$$;

-- ============================================================
-- Locations
-- ============================================================

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  location_type public.location_type not null default 'other',
  status public.location_status not null default 'active',
  latitude double precision,
  longitude double precision,
  notes text,
  contact_name text,
  contact_phone text,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.locations enable row level security;

create index idx_locations_org on public.locations(organization_id);
create index idx_locations_status on public.locations(status);

-- RLS
create policy "Org members can read locations"
  on public.locations for select
  using (organization_id = public.get_my_org_id());

create policy "Managers and admins can insert locations"
  on public.locations for insert
  with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Managers and admins can update locations"
  on public.locations for update
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can delete locations"
  on public.locations for delete
  using (organization_id = public.get_my_org_id() and public.is_admin());

create trigger on_location_updated
  before update on public.locations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Projects
-- ============================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  location_id uuid not null references public.locations(id) on delete cascade,
  project_type public.project_type not null,
  status public.project_status not null default 'draft',
  priority public.priority not null default 'medium',
  start_date date not null,
  end_date date,
  budget numeric(12, 2),
  owner_id uuid references public.profiles(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create index idx_projects_org on public.projects(organization_id);
create index idx_projects_status on public.projects(status);
create index idx_projects_location on public.projects(location_id);

-- RLS
create policy "Org members can read projects"
  on public.projects for select
  using (organization_id = public.get_my_org_id());

create policy "Managers and admins can insert projects"
  on public.projects for insert
  with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Managers and admins can update projects"
  on public.projects for update
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can delete projects"
  on public.projects for delete
  using (organization_id = public.get_my_org_id() and public.is_admin());

create trigger on_project_updated
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Actions
-- ============================================================

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  project_id uuid not null references public.projects(id) on delete cascade,
  action_type public.action_type not null,
  status public.action_status not null default 'pending',
  priority public.priority not null default 'medium',
  assigned_to uuid references public.profiles(id) on delete set null,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  notes text,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.actions enable row level security;

create index idx_actions_org on public.actions(organization_id);
create index idx_actions_status on public.actions(status);
create index idx_actions_project on public.actions(project_id);
create index idx_actions_assigned on public.actions(assigned_to);

-- RLS
create policy "Org members can read actions"
  on public.actions for select
  using (organization_id = public.get_my_org_id());

create policy "Managers and admins can insert actions"
  on public.actions for insert
  with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Managers and admins can update actions"
  on public.actions for update
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Technicians can update assigned actions"
  on public.actions for update
  using (
    organization_id = public.get_my_org_id()
    and assigned_to = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'technician'
    )
  );

create policy "Admins can delete actions"
  on public.actions for delete
  using (organization_id = public.get_my_org_id() and public.is_admin());

create trigger on_action_updated
  before update on public.actions
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Assets
-- ============================================================

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  asset_type public.asset_type not null,
  serial_number text not null,
  status public.asset_status not null default 'available',
  condition public.asset_condition,
  location_id uuid references public.locations(id) on delete set null,
  manufacturer text,
  model text,
  description text,
  install_date date,
  warranty_end date,
  notes text,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assets enable row level security;

-- Unique serial number per organization
create unique index idx_assets_serial_org on public.assets(serial_number, organization_id);
create index idx_assets_org on public.assets(organization_id);
create index idx_assets_status on public.assets(status);
create index idx_assets_location on public.assets(location_id);

-- RLS
create policy "Org members can read assets"
  on public.assets for select
  using (organization_id = public.get_my_org_id());

create policy "Managers and admins can insert assets"
  on public.assets for insert
  with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Managers and admins can update assets"
  on public.assets for update
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can delete assets"
  on public.assets for delete
  using (organization_id = public.get_my_org_id() and public.is_admin());

create trigger on_asset_updated
  before update on public.assets
  for each row execute function public.handle_updated_at();
