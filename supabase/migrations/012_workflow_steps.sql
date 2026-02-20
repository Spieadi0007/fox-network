-- Workflow steps: maps project types to their ordered action steps
create table public.workflow_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_type_code text not null,
  action_type_code text not null,
  default_name text not null,
  step_order integer not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, project_type_code, action_type_code)
);

-- Index for fast lookups by org + project type
create index idx_ws_org_project_type on public.workflow_steps(organization_id, project_type_code);

-- Trigger for updated_at
create trigger handle_ws_updated_at
  before update on public.workflow_steps
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.workflow_steps enable row level security;

create policy "Org members can view workflow steps"
  on public.workflow_steps for select
  using (organization_id = public.get_my_org_id());

create policy "Admins can insert workflow steps"
  on public.workflow_steps for insert
  with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can update workflow steps"
  on public.workflow_steps for update
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());

create policy "Admins can delete workflow steps"
  on public.workflow_steps for delete
  using (organization_id = public.get_my_org_id() and public.is_manager_or_admin());
