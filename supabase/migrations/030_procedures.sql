-- 030: Procedures — the SOP's steps as a form the technician fills in.
--
-- Until now a "checklist" was a single free-text box on action_entries. This
-- turns an SOP's written procedure into ordered, typed steps, and records an
-- answer per step. A completed set of answers IS the service report, so the
-- response rows have to stay readable years later, independently of whatever
-- happens to the template afterwards.
--
--   procedure_templates  one per service type, versioned
--     └ procedure_sections   ordered
--         └ procedure_steps  ordered, typed
--
--   action_entry_steps   one answer per step per visit
--
-- organization_id is denormalised onto every table so RLS stays a single
-- column comparison, matching action_entries (017).

-- ============================================================
-- Photo storage
-- ============================================================

-- Private, per-org. Technicians write here from the field, so unlike
-- sop-documents this is not restricted to managers.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'field-photos',
  'field-photos',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

drop policy if exists "Org members can upload field photos" on storage.objects;
create policy "Org members can upload field photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'field-photos'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
);

drop policy if exists "Org members can read field photos" on storage.objects;
create policy "Org members can read field photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'field-photos'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
);

drop policy if exists "Org members can delete field photos" on storage.objects;
create policy "Org members can delete field photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'field-photos'
  and (storage.foldername(name))[1] = public.get_my_org_id()::text
);

-- ============================================================
-- Step types
-- ============================================================

-- Mirrors STEP_TYPES in apps/landing/src/lib/sop-procedure.ts.
do $$ begin
  create type public.procedure_step_type as enum (
    'pass_fail',   -- a criterion that is met or not
    'photo',       -- one required image
    'text',        -- something written down
    'number',      -- a reading, with units
    'signature'    -- a person signs or declares
  );
exception when duplicate_object then null;
end $$;

-- ============================================================
-- Templates
-- ============================================================

create table if not exists public.procedure_templates (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  action_type_code text not null,

  name             text not null,
  summary          text not null default '',

  -- Which SOP import produced this, when it came from one.
  source_sop_import_id uuid references public.sop_imports(id) on delete set null,

  -- Re-importing an SOP creates a new version rather than editing in place,
  -- so visits already recorded against the old one stay coherent.
  version          integer not null default 1,
  is_active        boolean not null default true,

  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.procedure_templates enable row level security;

create index if not exists idx_procedure_templates_org_type
  on public.procedure_templates (organization_id, action_type_code);

-- At most one live template per service type; older versions stay for history.
create unique index if not exists idx_procedure_templates_one_active
  on public.procedure_templates (organization_id, action_type_code)
  where is_active;

-- ============================================================
-- Sections
-- ============================================================

create table if not exists public.procedure_sections (
  id               uuid primary key default gen_random_uuid(),
  template_id      uuid not null references public.procedure_templates(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,

  title            text not null,
  position         integer not null default 0,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.procedure_sections enable row level security;

create index if not exists idx_procedure_sections_template
  on public.procedure_sections (template_id, position);

-- ============================================================
-- Steps
-- ============================================================

create table if not exists public.procedure_steps (
  id               uuid primary key default gen_random_uuid(),
  section_id       uuid not null references public.procedure_sections(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,

  position         integer not null default 0,
  label            text not null,
  step_type        public.procedure_step_type not null,

  -- false for steps the SOP scopes to a case that may not arise.
  required         boolean not null default true,

  units            text not null default '',
  help             text not null default '',
  -- Verbatim SOP text this step came from; shown to managers when reviewing.
  evidence         text not null default '',

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- Units only mean anything on a measurement.
  constraint procedure_steps_units_only_on_number check (
    units = '' or step_type = 'number'
  )
);

alter table public.procedure_steps enable row level security;

create index if not exists idx_procedure_steps_section
  on public.procedure_steps (section_id, position);

-- ============================================================
-- Answers
-- ============================================================

create table if not exists public.action_entry_steps (
  id               uuid primary key default gen_random_uuid(),
  entry_id         uuid not null references public.action_entries(id) on delete cascade,
  organization_id  uuid not null references public.organizations(id) on delete cascade,

  -- Nulled rather than cascaded if the template is ever deleted: the answer
  -- and its snapshot below are the record, and must outlive the template.
  step_id          uuid references public.procedure_steps(id) on delete set null,

  -- Snapshot of what was actually asked, at the moment it was asked.
  -- Templates get edited and re-imported; a report from March must still
  -- show March's wording rather than today's.
  section_title    text not null,
  section_position integer not null default 0,
  step_label       text not null,
  step_type        public.procedure_step_type not null,
  step_position    integer not null default 0,
  units            text not null default '',

  -- Answer, shaped by step_type:
  --   pass_fail  {"result": "pass" | "fail"}
  --   number     {"number": 1.2}
  --   text       {"text": "..."}
  --   signature  {"name": "...", "signed_at": "..."}
  --   photo      photo_paths below
  value            jsonb not null default '{}',
  photo_paths      text[] not null default '{}',

  -- Denormalised from value so failures are cheap to find across visits.
  is_failure       boolean not null default false,
  -- Mandatory when a step fails, per the agreed behaviour: record it and
  -- require an explanation rather than blocking the visit.
  note             text not null default '',

  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint action_entry_steps_failure_needs_note check (
    not is_failure or length(btrim(note)) > 0
  )
);

alter table public.action_entry_steps enable row level security;

create index if not exists idx_action_entry_steps_entry
  on public.action_entry_steps (entry_id, section_position, step_position);

create index if not exists idx_action_entry_steps_org
  on public.action_entry_steps (organization_id);

create index if not exists idx_action_entry_steps_failures
  on public.action_entry_steps (organization_id) where is_failure;

-- One answer per step per visit. Partial, because step_id goes null if the
-- template is deleted and several such rows can then coexist.
create unique index if not exists idx_action_entry_steps_unique
  on public.action_entry_steps (entry_id, step_id) where step_id is not null;

-- ============================================================
-- RLS
-- ============================================================

-- Templates, sections and steps: every org member reads them — a technician
-- cannot render the procedure otherwise — but only managers may change them.

do $$
declare t text;
begin
  foreach t in array array['procedure_templates', 'procedure_sections', 'procedure_steps']
  loop
    execute format('drop policy if exists "Org members can read %1$s" on public.%1$I', t);
    execute format($f$
      create policy "Org members can read %1$s" on public.%1$I for select
      using (organization_id = public.get_my_org_id())
    $f$, t);

    execute format('drop policy if exists "Managers can write %1$s" on public.%1$I', t);
    execute format($f$
      create policy "Managers can write %1$s" on public.%1$I for all
      using (organization_id = public.get_my_org_id() and public.is_manager_or_admin())
      with check (organization_id = public.get_my_org_id() and public.is_manager_or_admin())
    $f$, t);

    execute format('drop trigger if exists on_%1$s_updated on public.%1$I', t);
    execute format($f$
      create trigger on_%1$s_updated before update on public.%1$I
      for each row execute function public.handle_updated_at()
    $f$, t);
  end loop;
end $$;

-- Answers follow action_entries (017): everyone in the org can read them,
-- the technician who owns the visit can write their own, managers can write
-- any.

drop policy if exists "Org members can read entry steps" on public.action_entry_steps;
create policy "Org members can read entry steps"
  on public.action_entry_steps for select
  using (organization_id = public.get_my_org_id());

drop policy if exists "Technicians can write own entry steps" on public.action_entry_steps;
create policy "Technicians can write own entry steps"
  on public.action_entry_steps for all
  using (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.action_entries e
      where e.id = entry_id and e.technician_id = auth.uid()
    )
  )
  with check (
    organization_id = public.get_my_org_id()
    and exists (
      select 1 from public.action_entries e
      where e.id = entry_id and e.technician_id = auth.uid()
    )
  );

drop policy if exists "Managers can write entry steps" on public.action_entry_steps;
create policy "Managers can write entry steps"
  on public.action_entry_steps for all
  using (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  )
  with check (
    organization_id = public.get_my_org_id()
    and public.is_manager_or_admin()
  );

drop trigger if exists on_action_entry_steps_updated on public.action_entry_steps;
create trigger on_action_entry_steps_updated
  before update on public.action_entry_steps
  for each row execute function public.handle_updated_at();
