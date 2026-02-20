-- Per-org overrides for platform field required/optional status
create table public.field_requirement_overrides (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module text not null check (module in ('locations', 'projects', 'actions', 'assets')),
  field_name text not null,
  required boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, module, field_name)
);

-- Index for fast lookups
create index idx_fro_org_module on public.field_requirement_overrides(organization_id, module);

-- Trigger for updated_at
create trigger handle_fro_updated_at
  before update on public.field_requirement_overrides
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.field_requirement_overrides enable row level security;

create policy "Org members can view field requirement overrides"
  on public.field_requirement_overrides for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can insert field requirement overrides"
  on public.field_requirement_overrides for insert
  with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can update field requirement overrides"
  on public.field_requirement_overrides for update
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can delete field requirement overrides"
  on public.field_requirement_overrides for delete
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());
