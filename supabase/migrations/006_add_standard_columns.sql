-- ============================================================
-- Migration 006: Add standard mandatory & should-have columns
-- to locations, projects, actions, assets
-- ============================================================

-- New shared enum
create type public.criticality as enum ('low', 'medium', 'high', 'critical');

-- ============================================================
-- LOCATIONS — new columns
-- ============================================================

-- Must Have
alter table public.locations
  add column code text,
  add column country text not null default 'US',
  add column timezone text not null default 'America/New_York';

-- Unique code per org
create unique index idx_locations_code_org on public.locations(code, organization_id)
  where code is not null;

-- Should Have
alter table public.locations
  add column region text,
  add column contact_email text,
  add column access_instructions text,
  add column criticality public.criticality default 'medium',
  add column tags text[] not null default '{}';

create index idx_locations_tags on public.locations using gin (tags);
create index idx_locations_region on public.locations(organization_id, region) where region is not null;

-- ============================================================
-- PROJECTS — new columns
-- ============================================================

-- Must Have
alter table public.projects
  add column code text;

create unique index idx_projects_code_org on public.projects(code, organization_id)
  where code is not null;

-- Should Have
alter table public.projects
  add column actual_start_date date,
  add column actual_end_date date,
  add column completion_percentage integer not null default 0
    check (completion_percentage >= 0 and completion_percentage <= 100),
  add column actual_cost numeric(12, 2),
  add column tags text[] not null default '{}';

create index idx_projects_tags on public.projects using gin (tags);

-- ============================================================
-- ACTIONS — new columns
-- ============================================================

-- Must Have
alter table public.actions
  add column location_id uuid references public.locations(id) on delete set null,
  add column due_date timestamptz;

create index idx_actions_location on public.actions(location_id) where location_id is not null;
create index idx_actions_due_date on public.actions(due_date) where due_date is not null;

-- Should Have
alter table public.actions
  add column estimated_duration_min integer,
  add column actual_duration_min integer,
  add column completion_notes text,
  add column estimated_cost numeric(12, 2),
  add column actual_cost numeric(12, 2),
  add column category text,
  add column tags text[] not null default '{}';

create index idx_actions_tags on public.actions using gin (tags);
create index idx_actions_category on public.actions(organization_id, category) where category is not null;

-- ============================================================
-- ASSETS — new columns
-- ============================================================

-- Must Have
alter table public.assets
  add column asset_tag text;

create unique index idx_assets_tag_org on public.assets(asset_tag, organization_id)
  where asset_tag is not null;

-- Should Have
alter table public.assets
  add column purchase_date date,
  add column purchase_cost numeric(12, 2),
  add column assigned_to uuid references public.profiles(id) on delete set null,
  add column criticality public.criticality default 'medium',
  add column barcode text,
  add column tags text[] not null default '{}';

create index idx_assets_tags on public.assets using gin (tags);
create index idx_assets_assigned on public.assets(assigned_to) where assigned_to is not null;
create index idx_assets_barcode on public.assets(barcode, organization_id) where barcode is not null;
