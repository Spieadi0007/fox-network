-- ============================================================
-- Field App Configuration
-- ============================================================
-- Stores per-organization, per-action-type layout configuration
-- for the technician mobile app. Managers configure what fields
-- appear on action cards and which modules technicians can use.

create table public.field_app_config (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  action_type_code text not null,

  -- Fields shown on the compact card in the work order list (ordered)
  card_fields      jsonb not null default '[]',

  -- Fields shown on the expanded details page (ordered, grouped)
  detail_fields    jsonb not null default '[]',

  -- Which modules are enabled for technicians to fill during a visit
  enabled_modules  jsonb not null default '{}',

  -- Card vs detail display mode (default view when opening the app)
  display_mode     text not null default 'cards'
                   check (display_mode in ('cards', 'details')),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint field_app_config_org_type unique (organization_id, action_type_code)
);

alter table public.field_app_config enable row level security;

-- Indexes
create index idx_field_app_config_org on public.field_app_config(organization_id);

-- RLS policies

-- All org members can read config
create policy "Org members can read field app config"
  on public.field_app_config for select
  using (organization_id = public.get_my_org_id());

-- Managers and admins can insert config
create policy "Managers and admins can insert field app config"
  on public.field_app_config for insert
  with check (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

-- Managers and admins can update config
create policy "Managers and admins can update field app config"
  on public.field_app_config for update
  using (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

-- Managers and admins can delete config
create policy "Managers and admins can delete field app config"
  on public.field_app_config for delete
  using (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

-- Auto-update timestamp
create trigger on_field_app_config_updated
  before update on public.field_app_config
  for each row execute function public.handle_updated_at();
