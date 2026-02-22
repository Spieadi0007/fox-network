-- ============================================================
-- Action Entries (field visit records)
-- ============================================================
-- Each action (work order) can have multiple entries representing
-- individual field visits by technicians. An action stays open
-- until an entry resolves it or it is cancelled.

create type public.entry_outcome as enum (
  'successful',
  'partial',
  'unsuccessful',
  'cancelled'
);

create table public.action_entries (
  id uuid primary key default gen_random_uuid(),

  -- Parent action
  action_id uuid not null references public.actions(id) on delete cascade,

  -- Who performed the visit
  technician_id uuid not null references public.profiles(id) on delete set null,

  -- Visit number (auto-incremented per action)
  visit_number integer not null default 1,

  -- Scheduling
  scheduled_date timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  duration_minutes integer,

  -- Outcome
  outcome public.entry_outcome not null default 'unsuccessful',
  failure_reason text,           -- why the visit was unsuccessful/partial

  -- Field data
  notes text,
  custom_fields jsonb not null default '{}',
  attachments text[] not null default '{}',

  -- Location stamp (GPS from technician device)
  submission_location jsonb,     -- { lat, lng, accuracy }

  -- Sign-off
  technician_signature text,     -- base64 or URL
  submitted_at timestamptz,      -- when tech submitted from field

  -- Offline sync support
  offline_id uuid,               -- local UUID from device
  sync_status text not null default 'synced' check (sync_status in ('synced', 'pending', 'conflict')),

  -- Tenant scoping
  organization_id uuid not null references public.organizations(id) on delete cascade,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Prevent duplicate offline submissions
  constraint action_entries_offline_unique unique (organization_id, offline_id)
);

alter table public.action_entries enable row level security;

-- Indexes
create index idx_action_entries_action on public.action_entries(action_id);
create index idx_action_entries_technician on public.action_entries(technician_id);
create index idx_action_entries_org on public.action_entries(organization_id);
create index idx_action_entries_outcome on public.action_entries(outcome);
create index idx_action_entries_submitted on public.action_entries(submitted_at) where submitted_at is not null;
create index idx_action_entries_custom_fields on public.action_entries using gin (custom_fields);

-- RLS policies

-- All org members can read entries
create policy "Org members can read action entries"
  on public.action_entries for select
  using (organization_id = public.get_my_org_id());

-- Technicians can insert entries for actions assigned to them
create policy "Technicians can insert entries for assigned actions"
  on public.action_entries for insert
  with check (
    organization_id = public.get_my_org_id()
    and technician_id = auth.uid()
    and exists (
      select 1 from public.actions
      where id = action_id and assigned_to = auth.uid()
    )
  );

-- Managers/admins can insert entries for any action
create policy "Managers and admins can insert action entries"
  on public.action_entries for insert
  with check (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

-- Technicians can update their own entries
create policy "Technicians can update own entries"
  on public.action_entries for update
  using (
    organization_id = public.get_my_org_id()
    and technician_id = auth.uid()
  );

-- Managers/admins can update any entry
create policy "Managers and admins can update action entries"
  on public.action_entries for update
  using (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

-- Admins can delete entries
create policy "Admins can delete action entries"
  on public.action_entries for delete
  using (organization_id = public.get_my_org_id() and public.is_admin());

-- Auto-update timestamp
create trigger on_action_entry_updated
  before update on public.action_entries
  for each row execute function public.handle_updated_at();

-- Auto-calculate visit_number on insert
create or replace function public.set_visit_number()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.visit_number := coalesce(
    (select max(visit_number) from public.action_entries where action_id = new.action_id),
    0
  ) + 1;
  return new;
end;
$$;

create trigger on_action_entry_visit_number
  before insert on public.action_entries
  for each row execute function public.set_visit_number();
