-- 031: Smarter steps — parts, measurement specs, and conditional steps.
--
-- A step is currently just a label and a type. Three things the SOP already
-- says are being thrown away at import:
--
--   1. Which steps consume materials, and which parts the SOP names for them.
--   2. The target value a measurement is supposed to hit ("1.2 N·m, do not
--      exceed") — captured as prose in `help`, never enforced.
--   3. That a step only applies in a case that may not arise ("cracked panels
--      only") — recorded as required=false, so it is shown regardless.
--
-- Deciding these belongs at import, where the model has the whole document,
-- not at runtime from keywords: "fitted" appears in both "replacement
-- assembly fitted" and "ESD wrist strap fitted", and only one of those
-- consumes a part.

-- ============================================================
-- Parts catalog
-- ============================================================

create table if not exists public.parts (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,

  part_number      text not null,
  name             text not null,
  -- How it is counted: each, metres, litres.
  unit             text not null default 'each',

  is_active        boolean not null default true,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.parts enable row level security;

create unique index if not exists idx_parts_org_number
  on public.parts (organization_id, part_number);

create index if not exists idx_parts_org_active
  on public.parts (organization_id) where is_active;

drop policy if exists "Org members can read parts" on public.parts;
create policy "Org members can read parts"
  on public.parts for select
  using (organization_id = public.get_my_org_id());

drop policy if exists "Managers can write parts" on public.parts;
create policy "Managers can write parts"
  on public.parts for all
  using (
    organization_id = public.get_my_org_id() and public.is_manager_or_admin()
  )
  with check (
    organization_id = public.get_my_org_id() and public.is_manager_or_admin()
  );

drop trigger if exists on_parts_updated on public.parts;
create trigger on_parts_updated
  before update on public.parts
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Step behaviours
-- ============================================================

alter table public.procedure_steps
  -- Show the parts picker on this step.
  add column if not exists captures_parts boolean not null default false,
  -- Parts the SOP names for this step, as [{part_number, name, quantity}].
  -- Pre-filled for the technician, who can change the quantity or remove them.
  add column if not exists suggested_parts jsonb not null default '[]',

  -- What a measurement is supposed to read. All optional: an SOP may give a
  -- ceiling ("no more than 30 mm") without a target.
  add column if not exists spec_target numeric,
  add column if not exists spec_min numeric,
  add column if not exists spec_max numeric,

  -- Empty when the step always applies. Otherwise a short phrase naming the
  -- case it is scoped to ("the panel is cracked"). Steps sharing a phrase are
  -- gated together behind one question.
  add column if not exists applies_when text not null default '';

-- A spec is meaningless on anything but a measurement.
alter table public.procedure_steps
  drop constraint if exists procedure_steps_spec_only_on_number;
alter table public.procedure_steps
  add constraint procedure_steps_spec_only_on_number check (
    (spec_target is null and spec_min is null and spec_max is null)
    or step_type = 'number'
  );

-- A range that cannot be satisfied is a data-entry mistake, not a spec.
alter table public.procedure_steps
  drop constraint if exists procedure_steps_spec_range_sane;
alter table public.procedure_steps
  add constraint procedure_steps_spec_range_sane check (
    spec_min is null or spec_max is null or spec_min <= spec_max
  );

create index if not exists idx_procedure_steps_condition
  on public.procedure_steps (section_id) where applies_when <> '';

-- ============================================================
-- What the technician recorded
-- ============================================================

alter table public.action_entry_steps
  -- [{part_id, part_number, name, quantity, unit}] — snapshotted like the
  -- rest of this row, so a part later renamed or retired still reads back
  -- as it was fitted.
  add column if not exists parts_used jsonb not null default '[]',

  -- Set when the entered value falls outside the step's spec. Denormalised
  -- so out-of-spec work is cheap to find across visits, same reasoning as
  -- is_failure.
  add column if not exists is_out_of_spec boolean not null default false,

  -- The step's condition did not apply on this visit. Recorded rather than
  -- omitted: a report should show that a step was considered and ruled out,
  -- not leave a silent gap.
  add column if not exists not_applicable boolean not null default false;

-- A step cannot both have failed and not have applied.
alter table public.action_entry_steps
  drop constraint if exists action_entry_steps_na_not_failed;
alter table public.action_entry_steps
  add constraint action_entry_steps_na_not_failed check (
    not (is_failure and not_applicable)
  );

create index if not exists idx_action_entry_steps_out_of_spec
  on public.action_entry_steps (organization_id) where is_out_of_spec;

create index if not exists idx_action_entry_steps_parts
  on public.action_entry_steps using gin (parts_used);
